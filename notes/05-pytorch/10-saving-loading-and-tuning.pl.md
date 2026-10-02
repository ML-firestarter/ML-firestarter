---
description: Zapisz wagi wytrenowanego modelu razem z ustawieniami, które go zbudowały, wczytaj je do nowego modelu i poszukaj współczynnika uczenia i rozmiaru warstwy, które działają dobrze.
---

# Zapis, wczytywanie i strojenie

Model, który uczył się godzinę, jest wart zachowania, tak samo jak wiedza, jakie ustawienia wytrenowały go najlepiej. Ta lekcja zapisuje model i wczytuje go z powrotem, a potem próbuje kilku ustawień sieci z [poprzedniej lekcji](09-classifying-images.pl.md) i zachowuje najlepsze.

## Zapis modelu

Liczby, których model się nauczył, są w jego **słowniku stanu** (ang. state dict): słowniku wag i wyrazów wolnych, według nazw ich warstw. `torch.save` zapisuje taki słownik do pliku, a `torch.load` wczytuje go z powrotem. Modelu nie da się zbudować z samych wag, bo nie mówią, ile jest warstw ani jak szerokich, więc plik zawiera też **hiperparametry**, z którymi model zrobiono: ustawienia, które wybierasz, w odróżnieniu od wag, które znajduje trening.

Tutaj sieć trenuje się przez 5 epok, zapisuje w punkcie kontrolnym i wczytuje do nowego modelu. Punkt kontrolny trafia tu do pamięci, przez `io.BytesIO`, i do pliku `digits.pt`, co na komputerze jest tym samym:

```python run
import io
import torch
import torch.nn as nn
import torchmetrics
from sklearn.datasets import load_digits
from torch.utils.data import DataLoader, TensorDataset, random_split

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)
train_set, valid_set = random_split(TensorDataset(X, y), [1500, 297], generator=torch.Generator().manual_seed(1))
train_loader = DataLoader(train_set, batch_size=32, shuffle=True)
valid_loader = DataLoader(valid_set, batch_size=64)


def make_model(n_inputs, n_hidden, n_classes):
    return nn.Sequential(
        nn.Flatten(),
        nn.Linear(n_inputs, n_hidden),
        nn.ReLU(),
        nn.Linear(n_hidden, n_hidden),
        nn.ReLU(),
        nn.Linear(n_hidden, n_classes),
    )


def train(model, learning_rate, n_epochs):
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)
    for epoch in range(n_epochs):
        model.train()
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()


def accuracy(model):
    metric = torchmetrics.Accuracy(task="multiclass", num_classes=10)
    model.eval()
    with torch.no_grad():
        for X_batch, y_batch in valid_loader:
            metric.update(model(X_batch), y_batch)
    return round(metric.compute().item(), 4)


torch.manual_seed(42)
hyperparameters = {"n_inputs": 64, "n_hidden": 50, "n_classes": 10}
model = make_model(**hyperparameters)
train(model, 0.1, 5)
print(accuracy(model))
print({name: tuple(weights.shape) for name, weights in model.state_dict().items()})

checkpoint = {"model_state_dict": model.state_dict(), "hyperparameters": hyperparameters}
buffer = io.BytesIO()
torch.save(checkpoint, buffer)
torch.save(checkpoint, "digits.pt")

buffer.seek(0)
loaded = torch.load(buffer, weights_only=True)
print(loaded.keys())
print(loaded["hyperparameters"])

new_model = make_model(**loaded["hyperparameters"])
print(accuracy(new_model))
new_model.load_state_dict(loaded["model_state_dict"])
print(accuracy(new_model))

with torch.no_grad():
    print(torch.equal(model(X[:5]), new_model(X[:5])))
```

Słownik stanu nazywa swoje tensory według położenia warstwy w `nn.Sequential`: `1.weight`, `1.bias`, `3.weight` i tak dalej. Warstwy bez parametrów, `0` i `2`, ich nie mają.

Wczytane hiperparametry budują model o tej samej strukturze, a on na początku nic nie wie: jego dokładność to 0,0976, zgadywanie wśród 10 cyfr. `load_state_dict` wkłada zapisane liczby, a dokładność to 0,8687 zapisanego modelu, z tymi samymi predykcjami, co do ostatniej liczby. `weights_only=True` sprawia, że `torch.load` przyjmuje tylko tensory i zwykłe dane Pythona, więc plik nie może sprawić, żeby uruchomił kod, a tego chcesz od pliku, którego sam nie napisałeś.

> [!NOTE]
> Pliki są zachowywane tylko, dopóki działa kod strony, więc zapisany plik następnym razem zniknie. A PyTorch na stronie zapisuje pliki we własnym formacie, który czyta tylko on: plik zrobiony na twoim komputerze nie wczyta się tutaj, ani odwrotnie. Na twoim komputerze `torch.save` zapisuje zwykły plik `.pt`.

## Model o innym kształcie

`load_state_dict` jest ścisłe: model musi mieć warstwy i kształty wag, które zapisano, inaczej się zatrzyma i powie o tym:

```python run
import torch
import torch.nn as nn


def make_model(n_inputs, n_hidden, n_classes):
    return nn.Sequential(
        nn.Flatten(),
        nn.Linear(n_inputs, n_hidden),
        nn.ReLU(),
        nn.Linear(n_hidden, n_hidden),
        nn.ReLU(),
        nn.Linear(n_hidden, n_classes),
    )


saved = make_model(64, 50, 10).state_dict()
make_model(64, 50, 10).load_state_dict(saved)
print("same shape: loaded")
make_model(64, 40, 10).load_state_dict(saved)
```

Model z 40 liczbami ukrytymi nie przyjmie wag modelu z 50, a komunikat wylicza każdą warstwę, która nie pasuje. Dlatego hiperparametry trzyma się razem z wagami.

Jeszcze jedno robi się po wczytaniu, przed użyciem modelu: `model.eval()`, jak dla każdego modelu, który nie jest trenowany. Nowy model jest w trybie treningu, tak samo świeżo wczytany.

## Strojenie hiperparametrów

Hiperparametry się nie uczą: współczynnik uczenia, liczba liczb ukrytych, liczba epok. Wybiera się je próbując: trenuje się model z jakimiś, mierzy na kursach walidacyjnych i zachowuje najlepszy. Wypróbowanie wszystkich kombinacji trwałoby za długo, więc częstym sposobem jest **wyszukiwanie losowe**: losuje się ustawienia, kilka razy, i zachowuje to, co wypadło najlepiej. Współczynnik uczenia losuje się w **skali logarytmicznej**, wykładnik między 10⁻² a 10^−0,5, bo różnica między 0,001 a 0,01 liczy się tak samo jak między 0,01 a 0,1.

Ustawienia losuje się z własnego generatora, żeby liczby losowe treningu, który tasuje porcje, ich nie zmieniały. Każda próba zaczyna od tego samego ziarna:

```python run
import torch
import torch.nn as nn
import torchmetrics
from sklearn.datasets import load_digits
from torch.utils.data import DataLoader, TensorDataset, random_split

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)
train_set, valid_set = random_split(TensorDataset(X, y), [1500, 297], generator=torch.Generator().manual_seed(1))
train_loader = DataLoader(train_set, batch_size=32, shuffle=True)
valid_loader = DataLoader(valid_set, batch_size=64)


def make_model(n_inputs, n_hidden, n_classes):
    return nn.Sequential(
        nn.Flatten(),
        nn.Linear(n_inputs, n_hidden),
        nn.ReLU(),
        nn.Linear(n_hidden, n_hidden),
        nn.ReLU(),
        nn.Linear(n_hidden, n_classes),
    )


def train(model, learning_rate, n_epochs):
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)
    for epoch in range(n_epochs):
        model.train()
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()


def accuracy(model):
    metric = torchmetrics.Accuracy(task="multiclass", num_classes=10)
    model.eval()
    with torch.no_grad():
        for X_batch, y_batch in valid_loader:
            metric.update(model(X_batch), y_batch)
    return metric.compute().item()


generator = torch.Generator().manual_seed(7)
best = None
for trial in range(6):
    learning_rate = 10 ** (torch.rand(1, generator=generator).item() * 1.5 - 2)
    n_hidden = int(torch.randint(20, 101, (1,), generator=generator).item())

    torch.manual_seed(42)
    model = make_model(64, n_hidden, 10)
    train(model, learning_rate, 5)
    score = accuracy(model)
    print(trial + 1, round(learning_rate, 4), n_hidden, round(score, 3))
    if best is None or score > best[0]:
        best = (score, learning_rate, n_hidden)

print("best", round(best[0], 3), round(best[1], 4), best[2])
```

Z sześciu prób najlepsza ma współczynnik uczenia 0,0975 i 31 liczb ukrytych, z dokładnością 0,855 po 5 epokach. Trzy z pozostałych, ze współczynnikiem uczenia między 0,02 a 0,04, uczyły się za wolno w tych 5 epokach: poniżej 0,52. W prawdziwym strojeniu zwycięzcę trenuje się jeszcze raz, dłużej, i mierzy na zbiorze testowym, raz. Biblioteki jak Optuna losują sprytniej: patrzą na dotychczasowe próby i losują stamtąd, gdzie były dobre ustawienia, a próby, które idą źle, przerywają wcześnie. Działają na twoim komputerze, bo ta strona ich nie ma.

## Podsumowanie

- Liczby, których model się nauczył, to jego `state_dict()`. `torch.save` zapisuje punkt kontrolny, czyli słownik ze słownikiem stanu i hiperparametrami, które zbudowały model, a `torch.load(..., weights_only=True)` go wczytuje.
- Żeby wczytać: zbuduj model z zapisanych hiperparametrów, wczytaj do niego wagi przez `load_state_dict` i wywołaj `eval()`. Kształty muszą się dokładnie zgadzać.
- Hiperparametry, jak współczynnik uczenia i rozmiary warstw, się nie uczą. Wybiera się je, trenując z kilkoma i porównując wyniki walidacji.
- Wyszukiwanie losowe losuje ustawienia, współczynnik uczenia w skali logarytmicznej, i zachowuje najlepsze. Zbiór testowy zostaje nietknięty, dopóki nie wybierze się najlepszego modelu.

## Sprawdź się

<details>
<summary>Dlaczego punkt kontrolny zawiera hiperparametry, a nie tylko wagi?</summary>

Wagi to słownik tensorów i nie mówią, jak warstwy do siebie pasują. Żeby je wczytać, trzeba najpierw zbudować model o dokładnie tej samej strukturze, a hiperparametry, jak rozmiary warstw, go budują.

</details>

<details>
<summary>Dlaczego współczynnik uczenia losuje się jako <code>10 ** uniform(-2, -0.5)</code>, a nie <code>uniform(0.01, 0.3)</code>?</summary>

Losowanie między 0,01 a 0,3 dałoby dziewięć na dziesięć współczynników powyżej 0,03, a prawie żadnego blisko 0,01. Współczynniki uczenia liczą się krotnościami, więc równomiernie losuje się wykładnik: tyle samo prób między 0,01 a 0,03, co między 0,1 a 0,3.

</details>

<details>
<summary>Najlepszą z losowych prób wybiera się na zbiorze walidacyjnym. Dlaczego nie na testowym?</summary>

Wybieranie według wyniku testowego robi ze zbioru testowego część wyboru, a najlepsza z wielu prób wypada dobrze po części ze szczęścia. Zbiór testowy zostaje do zmierzenia wybranego modelu raz, jako oszacowanie, jak sobie radzi na kursach, do których nigdy nie był używany.

</details>

## Twoja kolej

W ćwiczeniu [Zapisz i wczytaj punkt kontrolny](../../exercises/05-pytorch/10-saving-loading-and-tuning/01-save-and-load-a-checkpoint/task.pl.md) napiszesz dwie połowy punktu kontrolnego: zapisanie modelu z jego ustawieniami i zbudowanie go z powrotem. W ćwiczeniu [Wyszukiwanie losowe](../../exercises/05-pytorch/10-saving-loading-and-tuning/02-random-search/task.pl.md) wylosujesz ustawienia i wybierzesz najlepsze.
