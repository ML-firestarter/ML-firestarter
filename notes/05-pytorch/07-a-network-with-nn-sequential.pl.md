---
description: Połącz warstwy i ReLU w sieć neuronową za pomocą nn.Sequential, wytrenuj ją na opłatach, do których nie pasuje żadna prosta, i policz jej parametry.
---

# Sieć z nn.Sequential

Regresja liniowa potrafi narysować tylko prostą, a przy większej liczbie cech płaszczyznę. Opłaty nie muszą się do niej stosować: powiedzmy, że taksówka bierze 4 zł za każdy z pierwszych 6 kilometrów kursu, a za każdy następny już tylko 2 zł. [Sieci neuronowe](../04-foundations/04-neural-networks/) potrafią odtworzyć takie załamania, a PyTorch buduje sieć z warstw z [poprzednich lekcji](05-linear-regression-with-nn-linear.pl.md), ułożonych jedna za drugą w `nn.Sequential`.

## Układanie warstw

`nn.Sequential` przyjmuje warstwy i wywołuje je po kolei, a wyjście każdej z nich trafia do następnej. Między dwiema warstwami `nn.Linear` stoi funkcja aktywacji, tutaj `nn.ReLU()` z [rozdziału o sieciach neuronowych](../04-foundations/04-neural-networks/01-layers.pl.md#relu). Rozmiary muszą do siebie pasować: `out_features` jednej warstwy to `in_features` następnej.

```python run
import torch
import torch.nn as nn

torch.manual_seed(42)
model = nn.Sequential(
    nn.Linear(2, 50),
    nn.ReLU(),
    nn.Linear(50, 40),
    nn.ReLU(),
    nn.Linear(40, 1),
)

print(model)
print(model[0], len(model))
print([tuple(parameter.shape) for parameter in model.parameters()])
print(sum(parameter.numel() for parameter in model.parameters()))
print(model(torch.randn(3, 2)).shape)
```

Sieć przyjmuje 2 cechy, rozszerza je do 50 liczb, potem do 40, a kończy na 1, czyli na opłacie. Jej warstwy są ponumerowane, a `model[0]` to pierwsza z nich. `ReLU` nie ma parametrów, więc sześć tensorów to wagi i wyrazy wolne trzech warstw. Razem daje to 2231 liczb do nauczenia: 2 × 50 + 50, 50 × 40 + 40 i 40 × 1 + 1. Niezależnie od tego, ile wierszy trafia na wejście, dla każdego z nich wychodzi jedna opłata.

## Po co ReLU

Bez ReLU warstwy złożyłyby się w jedną prostą, bo funkcja liniowa funkcji liniowej też jest liniowa. Dlaczego, pokazuje na liczbach [pierwsza sieć](../04-foundations/04-neural-networks/01-layers.pl.md#po-co-jest-funkcja-aktywacji) z rozdziału o sieciach neuronowych, a widać to także w treningu. Oto zwykła regresja liniowa, dwie warstwy `nn.Linear` bez niczego pomiędzy i sieć z ReLU, wytrenowane na tych samych opłatach:

```python run
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(42)
n = 800
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 4 * km.clamp(max=6) + 2 * (km - 6).clamp(min=0) + 0.5 * minutes + 8 + torch.randn(n, 1)

X_train, y_train, X_valid, y_valid = X[:600], y[:600], X[600:], y[600:]
x_mean, x_std = X_train.mean(dim=0, keepdim=True), X_train.std(dim=0, keepdim=True, correction=0)
y_mean, y_std = y_train.mean(), y_train.std(correction=0)
X_train, X_valid = (X_train - x_mean) / x_std, (X_valid - x_mean) / x_std
y_train, y_valid = (y_train - y_mean) / y_std, (y_valid - y_mean) / y_std
train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)


def train(model, learning_rate=0.05, n_epochs=40):
    criterion = nn.MSELoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)
    for epoch in range(n_epochs):
        model.train()
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()


def rmse_in_euros(model):
    model.eval()
    with torch.no_grad():
        return round((((model(X_valid) - y_valid) ** 2).mean().sqrt() * y_std).item(), 2)


torch.manual_seed(42)
linear = nn.Linear(2, 1)
two_linear = nn.Sequential(nn.Linear(2, 50), nn.Linear(50, 1))
network = nn.Sequential(nn.Linear(2, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU(), nn.Linear(40, 1))
for name, model in [("linear", linear), ("two linear layers", two_linear), ("network with ReLUs", network)]:
    train(model)
    print(name, rmse_in_euros(model))
```

Prosta myli się średnio o około 1,88 zł, a dwie warstwy bez ReLU, mimo 50 razy większej liczby parametrów, nie radzą sobie lepiej: 2,04 zł. Sieć z ReLU myli się o około 1,07 zł, a szum w opłatach wynosi 1 zł, więc trudno o wiele lepiej. Te liczby to pierwiastek z błędu średniokwadratowego na 200 kursach walidacyjnych, w złotych.

## Trening sieci

W porównaniu z poprzednimi lekcjami zmieniła się jedna ważna rzecz: **etykiety też są standaryzowane**, tak jak cechy, a na końcu RMSE wraca do złotych przez pomnożenie przez rozrzut opłat. Sieć zaczyna od małych losowych wag, więc jej pierwsze predykcje są bliskie 0, a przy opłatach rzędu 30 pierwsze kroki byłyby ogromne: trening skakałby w tę i z powrotem albo zupełnie by się rozjechał. Gdy etykiety są w okolicy 0, ten sam współczynnik uczenia działa łagodnie.

```python run
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(42)
n = 800
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 4 * km.clamp(max=6) + 2 * (km - 6).clamp(min=0) + 0.5 * minutes + 8 + torch.randn(n, 1)

X_train, y_train = X[:600], y[:600]
x_mean, x_std = X_train.mean(dim=0, keepdim=True), X_train.std(dim=0, keepdim=True, correction=0)
y_mean, y_std = y_train.mean(), y_train.std(correction=0)
train_loader = DataLoader(TensorDataset((X_train - x_mean) / x_std, (y_train - y_mean) / y_std), batch_size=32, shuffle=True)

torch.manual_seed(42)
model = nn.Sequential(nn.Linear(2, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU(), nn.Linear(40, 1))
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)

n_epochs = 40
for epoch in range(n_epochs):
    model.train()
    total_loss = 0.0
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        loss = criterion(model(X_batch), y_batch)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    if epoch % 10 == 9 or epoch == 0:
        print(epoch + 1, round(total_loss / len(train_loader), 4))

new_rides = torch.tensor([[3.0, 0.0], [6.0, 0.0], [12.0, 0.0]])
model.eval()
with torch.no_grad():
    fares = model((new_rides - x_mean) / x_std) * y_std + y_mean
print(fares.flatten())
```

Strata jest w jednostkach standardowych, więc 0,0098 to setna część wariancji opłat. Ostatnie wiersze przewidują opłaty za trzy kursy bez postoju: 3, 6 i 12 km. Naklejka tej taksówki daje za nie 8 + 4 × 3 = 20, 8 + 4 × 6 = 32 i 8 + 4 × 6 + 2 × 6 = 44, a sieć 19,9, 31,3 i 43,5. Predykcję zamienia się z powrotem na złote tak jak etykiety, tylko w drugą stronę: razy rozrzut, plus średnia. Prosta nie trafi w załamanie przy 6 km, a sieć tak.

## Podsumowanie

- `nn.Sequential(warstwa, warstwa, ...)` wywołuje swoje warstwy po kolei. Rozmiar wyjścia warstwy to rozmiar wejścia następnej, a `model[0]` to pierwsza warstwa.
- Między warstwami potrzebna jest funkcja aktywacji, zwykle `nn.ReLU()`. Bez niej dowolna liczba warstw liniowych to jedna warstwa liniowa.
- Parametry sieci to wagi i wyrazy wolne jej warstw, a policzyć je można przez `sum(p.numel() for p in model.parameters())`.
- Etykiety odległe od 0 też warto standaryzować, a predykcje zamieniać z powrotem na pierwotne jednostki.

## Sprawdź się

<details>
<summary>Ile parametrów ma <code>nn.Sequential(nn.Linear(3, 4), nn.ReLU(), nn.Linear(4, 1))</code>?</summary>

21: pierwsza warstwa ma 3 × 4 wagi i 4 wyrazy wolne, razem 16, a druga 4 × 1 wagi i 1 wyraz wolny, czyli jeszcze 5. `ReLU` nie ma żadnych.

</details>

<details>
<summary>Co jest nie tak z <code>nn.Sequential(nn.Linear(2, 50), nn.Linear(40, 1))</code>?</summary>

Pierwsza warstwa daje 50 liczb dla każdego wiersza, a druga przyjmuje 40, więc już pierwsze wywołanie kończy się błędem o kształtach, których nie da się pomnożyć. Rozmiary muszą do siebie pasować: druga warstwa musi być `nn.Linear(50, 1)`.

</details>

<details>
<summary>Dlaczego przed treningiem sieci standaryzuje się opłaty?</summary>

Pierwsze predykcje sieci są bliskie 0, a przy opłatach rzędu 30 pierwsze straty i nachylenia są ogromne, więc ten sam współczynnik uczenia może sprawić, że trening zacznie skakać. Wystandaryzowane opłaty też są bliskie 0 i trening przebiega łagodnie. Predykcje zamienia się potem z powrotem na złote.

</details>

## Twoja kolej

W ćwiczeniu [Zbuduj sieć](../../exercises/05-pytorch/07-a-network-with-nn-sequential/01-build-a-network/task.pl.md) utworzysz sieć na podstawie listy rozmiarów warstw. W ćwiczeniu [Policz parametry](../../exercises/05-pytorch/07-a-network-with-nn-sequential/02-count-the-parameters/task.pl.md) policzysz, czego model musi się nauczyć, i wypiszesz kształty jego warstw.
