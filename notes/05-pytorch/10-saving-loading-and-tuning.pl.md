---
description: Zapisz wagi wytrenowanego modelu razem z ustawieniami, które go zbudowały, wczytaj je do nowego modelu i poszukaj współczynnika uczenia i rozmiaru warstwy, które dobrze działają.
---

# Zapis, wczytywanie i strojenie

Model, którego trening zajął godzinę, warto zachować, podobnie jak wiedzę o tym, z jakimi ustawieniami trenował się najlepiej. W tej lekcji zapiszesz model i wczytasz go z powrotem, a potem wypróbujesz kilka ustawień sieci z [poprzedniej lekcji](09-classifying-images.pl.md) i zachowasz najlepsze.

## Zapis modelu

To, czego model się nauczył, przechowuje jego **słownik stanu** (ang. state dict): słownik wag i wyrazów wolnych zapisanych pod nazwami ich warstw. `torch.save` zapisuje taki słownik do pliku, a `torch.load` go wczytuje. Same wagi nie wystarczą, żeby zbudować model, bo nie mówią, ile jest warstw ani jak są szerokie, dlatego w pliku zapisuje się też **hiperparametry**, z którymi model został utworzony: ustawienia, które wybierasz sam, w przeciwieństwie do wag, które znajduje trening.

Tutaj sieć trenuje przez 5 epok, zostaje zapisana w **punkcie kontrolnym** (ang. checkpoint) i wczytana z powrotem do nowego modelu. Punkt kontrolny trafia tu do pamięci, przez `io.BytesIO`, i do pliku `digits.pt`, co na komputerze działa tak samo:

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

Słownik stanu nazywa swoje tensory według pozycji warstwy w `nn.Sequential`: `1.weight`, `1.bias`, `3.weight` i tak dalej. Warstwy bez parametrów, `0` i `2`, nie mają w nim żadnych wpisów.

Wczytane hiperparametry budują model o tej samej budowie, który na początku nic nie umie: jego dokładność to 0,0976, czyli tyle, co zgadywanie jednej z 10 cyfr. `load_state_dict` wkłada do niego zapisane liczby i dokładność wynosi tyle co w zapisanym modelu, 0,8687, a predykcje są identyczne co do ostatniej liczby. `weights_only=True` sprawia, że `torch.load` przyjmuje tylko tensory i zwykłe dane Pythona, więc plik nie może kazać mu uruchomić żadnego kodu. Właśnie tego trzeba od pliku z nieznanego źródła.

> [!NOTE]
> Pliki istnieją tylko wtedy, gdy działa kod strony, więc przy kolejnym uruchomieniu zapisanego pliku już nie ma. Do tego PyTorch na stronie zapisuje pliki we własnym formacie, który rozumie tylko on: pliku utworzonego na twoim komputerze nie da się tu wczytać i na odwrót. Na komputerze `torch.save` zapisuje zwykły plik `.pt`.

## Model o innym kształcie

`load_state_dict` jest bezwzględne: model musi mieć te same warstwy i te same kształty wag co zapisany, inaczej zatrzymuje się i mówi dlaczego:

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

Model z 40 liczbami ukrytymi nie przyjmie wag modelu z 50, a komunikat wymienia każdą warstwę, która nie pasuje. Właśnie dlatego hiperparametry zapisuje się razem z wagami.

Po wczytaniu, a przed użyciem modelu, trzeba jeszcze wywołać `model.eval()`, jak w przypadku każdego modelu, który nie jest trenowany. Nowy model jest w trybie treningowym, a dopiero co wczytany również.

## Strojenie hiperparametrów

Hiperparametrów model się nie uczy: to współczynnik uczenia, liczba liczb ukrytych, liczba epok. Wybiera się je metodą prób: trenuje się model z jakimiś ustawieniami, mierzy go na danych walidacyjnych i zostawia najlepsze. Wypróbowanie wszystkich kombinacji trwa za długo, dlatego często stosuje się **przeszukiwanie losowe** (ang. random search): kilka razy losuje się ustawienia i zostawia te, które dały najlepszy wynik. Współczynnik uczenia losuje się w **skali logarytmicznej**, z wykładnikiem między −2 a −0,5, bo różnica między 0,001 a 0,01 ma takie samo znaczenie jak między 0,01 a 0,1.

Ustawienia losuje osobny generator, żeby nie wpływały na nie liczby losowe treningu, który miesza porcje. Każda próba zaczyna od tego samego ziarna:

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

Spośród sześciu prób najlepsza ma współczynnik uczenia 0,0975 i 31 liczb ukrytych, z dokładnością 0,855 po 5 epokach. Trzy inne, ze współczynnikiem uczenia między 0,02 a 0,04, uczyły się za wolno jak na 5 epok: poniżej 0,52. Przy prawdziwym strojeniu zwycięzcę trenuje się jeszcze raz, dłużej, i jeden raz mierzy na zbiorze testowym. Biblioteki takie jak Optuna losują sprytniej: patrzą na dotychczasowe próby, losują tam, gdzie wypadały dobre ustawienia, i wcześnie przerywają próby, które idą źle. Działają na twoim komputerze, bo na tej stronie ich nie ma.

## Podsumowanie

- To, czego model się nauczył, zwraca `state_dict()`. `torch.save` zapisuje punkt kontrolny, czyli słownik ze słownikiem stanu i hiperparametrami, które zbudowały model, a `torch.load(..., weights_only=True)` go wczytuje.
- Wczytywanie: zbuduj model z zapisanych hiperparametrów, wczytaj do niego wagi przez `load_state_dict` i wywołaj `eval()`. Kształty muszą się zgadzać co do joty.
- Hiperparametrów, takich jak współczynnik uczenia czy rozmiary warstw, model się nie uczy. Wybiera się je, trenując z kilkoma zestawami ustawień i porównując wyniki na zbiorze walidacyjnym.
- Przeszukiwanie losowe losuje ustawienia, współczynnik uczenia w skali logarytmicznej, i zostawia najlepsze. Zbioru testowego nie rusza się, dopóki nie zostanie wybrany najlepszy model.

## Sprawdź się

<details>
<summary>Dlaczego punkt kontrolny zawiera hiperparametry, a nie same wagi?</summary>

Wagi to słownik tensorów i nie mówią, jak łączą się warstwy. Żeby je wczytać, najpierw trzeba zbudować model o dokładnie takiej samej budowie, a budują go właśnie hiperparametry, takie jak rozmiary warstw.

</details>

<details>
<summary>Dlaczego współczynnik uczenia losuje się jako <code>10 ** uniform(-2, -0.5)</code>, a nie jako <code>uniform(0.01, 0.3)</code>?</summary>

Losowanie między 0,01 a 0,3 dałoby w dziewięciu przypadkach na dziesięć współczynnik większy od 0,03 i prawie żadnego w okolicy 0,01. Współczynniki uczenia liczą się w krotnościach, więc równomiernie losuje się wykładnik: tyle samo prób wypada między 0,01 a 0,03 co między 0,1 a 0,3.

</details>

<details>
<summary>Najlepszą z losowych prób wybiera się na zbiorze walidacyjnym. Dlaczego nie na testowym?</summary>

Wybór na podstawie wyniku testowego włącza zbiór testowy do wyboru, a najlepsza z wielu prób wypada dobrze częściowo dzięki szczęściu. Zbiór testowy zostaje po to, żeby raz zmierzyć wybrany model i oszacować, jak radzi sobie z danymi, których nigdy nie użyto.

</details>

## Twoja kolej

W ćwiczeniu [Zapisz i wczytaj punkt kontrolny](../../exercises/05-pytorch/10-saving-loading-and-tuning/01-save-and-load-a-checkpoint/task.pl.md) napiszesz obie połowy punktu kontrolnego: zapis modelu z jego ustawieniami i odtworzenie go. W ćwiczeniu [Przeszukiwanie losowe](../../exercises/05-pytorch/10-saving-loading-and-tuning/02-random-search/task.pl.md) wylosujesz ustawienia i wybierzesz najlepsze.
