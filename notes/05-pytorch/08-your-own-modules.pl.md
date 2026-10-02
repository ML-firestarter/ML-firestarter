---
description: Napisz własny nn.Module ze ścieżką szeroką i głęboką, podawaj mu kolumny, dwa wejścia albo wejścia z nazwami i daj mu drugie wyjście.
---

# Własne moduły

`nn.Sequential` puszcza dane jedną linią warstw, a niektóre sieci nie są linią. W sieci **szerokiej i głębokiej** (ang. wide and deep) wejścia przechodzą przez stos warstw, czyli ścieżkę głęboką, *i* idą wprost do warstwy wyjściowej, czyli ścieżką szeroką, która widzi je takimi, jakie są. Ścieżka głęboka uczy się zgięć i wzorców, a szeroka niesie proste reguły obok tych wszystkich przekształceń, w których zwykły stos mógłby je rozmazać:

```text
wejścia ──► stos głęboki (Linear, ReLU, Linear, ReLU) ──┐
   │                                                    ├──► sklejenie ──► warstwa wyjściowa ──► opłata
   └────────────────────────────────────────────────────┘
```

Do tego trzeba własnego modułu, a moduł to klasa, jak w lekcji o [klasach](../02-python/04-programs/01-classes.pl.md). Ta lekcja buduje jeden, a potem daje mu inne rzeczy do przyjmowania i zwracania: kolumny jednej tabeli, dwa wejścia, wejścia z nazwami i dwa wyjścia. Kursy taksówek dostają trzecią cechę, `night`, dla kursów nocą, które dodają do opłaty 3 zł.

## Własny moduł

Model to podklasa `nn.Module`. Jej `__init__` najpierw wywołuje `super().__init__()`, a potem tworzy swoje warstwy i trzyma je jako atrybuty `self`. Jej `forward` mówi, jak wejście staje się wyjściem. `torch.cat([a, b], dim=1)` skleja obok siebie cechy wejścia i liczby, które policzyła ścieżka głęboka:

```python run
import torch

wide = torch.zeros(5, 3)
deep = torch.ones(5, 40)
print(torch.cat([wide, deep], dim=1).shape)
print(torch.cat([wide, wide], dim=0).shape)
```

`dim=1` skleja kolumny, więc wiersze muszą się zgadzać, a kolumny się sumują: 3 + 40 = 43. `dim=0` ułożyłoby wiersze jeden pod drugim. Oto cały moduł, dla tabeli z dowolną liczbą cech:

```python run
import torch
import torch.nn as nn


class WideAndDeep(nn.Module):
    def __init__(self, n_features):
        super().__init__()
        self.deep_stack = nn.Sequential(
            nn.Linear(n_features, 50),
            nn.ReLU(),
            nn.Linear(50, 40),
            nn.ReLU(),
        )
        self.output_layer = nn.Linear(n_features + 40, 1)

    def forward(self, X):
        deep_output = self.deep_stack(X)
        return self.output_layer(torch.cat([X, deep_output], dim=1))


torch.manual_seed(42)
model = WideAndDeep(3)
print(model)
print(model.output_layer)
print(sum(parameter.numel() for parameter in model.parameters()))
print(model(torch.randn(5, 3)).shape)
```

Wypisanie modelu pokazuje jego warstwy jako drzewo, z nazwami atrybutów, pod którymi je trzymano. `model.output_layer` to jedna z nich. Parametry warstw wewnątrz `deep_stack` też liczą się do modułu: 3 × 50 + 50, 50 × 40 + 40 i 43 + 1 dają 2284, które widzisz, a `model.parameters()` to to, co bierze optymalizator.

`model(X)` nie jest wywołaniem napisanego przez ciebie `forward`: `nn.Module` ma `__call__`, które uruchamia `forward`, jak w zabawkowym `Module` z lekcji o klasach, i robi wokół niego jeszcze kilka rzeczy. Wywołuj model, a nie `model.forward(X)`.

Warstwa musi być atrybutem, żeby moduł o niej wiedział, bo `nn.Module` patrzy na to, co przypisano do `self`. Warstwa schowana w zwykłej liście Pythona zostaje pominięta razem ze swoimi parametrami, a optymalizator, który dostał `model.parameters()`, nigdy by ich nie trenował:

```python run
import torch.nn as nn


class Hidden(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = [nn.Linear(2, 3), nn.Linear(3, 1)]


class Visible(nn.Module):
    def __init__(self):
        super().__init__()
        self.first = nn.Linear(2, 3)
        self.second = nn.Linear(3, 1)


print(len(list(Hidden().parameters())))
print(len(list(Visible().parameters())))
```

## Trening

Własny model trenuje się jak każdy inny. `train` i `rmse_in_euros` to te z [poprzedniej lekcji](07-a-network-with-nn-sequential.pl.md), a dane to te same kursy z dodaną cechą `night`. Zwykła sieć z tamtej lekcji trenuje się obok sieci szerokiej i głębokiej, tyle samo epok, i każda dostaje ocenę na kursach walidacyjnych:

```python run
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(42)
n = 800
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
night = (torch.rand(n, 1) > 0.7).float()
X = torch.cat([km, minutes, night], dim=1)
y = 4 * km.clamp(max=6) + 2 * (km - 6).clamp(min=0) + 0.5 * minutes + 3 * night + 8 + torch.randn(n, 1)

X_train, y_train, X_valid, y_valid = X[:600], y[:600], X[600:], y[600:]
x_mean, x_std = X_train.mean(dim=0, keepdim=True), X_train.std(dim=0, keepdim=True, correction=0)
y_mean, y_std = y_train.mean(), y_train.std(correction=0)
X_train, X_valid = (X_train - x_mean) / x_std, (X_valid - x_mean) / x_std
y_train, y_valid = (y_train - y_mean) / y_std, (y_valid - y_mean) / y_std
train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)


class WideAndDeep(nn.Module):
    def __init__(self, n_features):
        super().__init__()
        self.deep_stack = nn.Sequential(
            nn.Linear(n_features, 50),
            nn.ReLU(),
            nn.Linear(50, 40),
            nn.ReLU(),
        )
        self.output_layer = nn.Linear(n_features + 40, 1)

    def forward(self, X):
        deep_output = self.deep_stack(X)
        return self.output_layer(torch.cat([X, deep_output], dim=1))


def train(model, learning_rate=0.05, n_epochs=30):
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
network = nn.Sequential(nn.Linear(3, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU(), nn.Linear(40, 1))
wide_and_deep = WideAndDeep(3)
for name, model in [("network", network), ("wide and deep", wide_and_deep)]:
    train(model)
    print(name, rmse_in_euros(model))
```

Obie wychodzą mniej więcej tak samo, 1,06 zł i 1,10 zł, przy szumie w opłatach równym 1 zł. Ścieżka szeroka nie ułatwia tego zadania, bo zwykły stos radzi sobie dobrze z trzema cechami. Zasługuje na swoje miejsce, gdy cech jest dużo albo gdy część z nich to reguły policzone ręcznie, których stos warstw nie powinien rozmywać.

## Inne kolumny dla każdej ścieżki

A jeśli każda ścieżka ma widzieć inne kolumny? Szeroka mogłaby brać `minutes` i `night`, proste wpływy, które łapie prosta, a głęboka `km` i `minutes`, gdzie jest zgięcie. Jeden sposób to wycinanie w `forward`, wycinkami. `X[:, :2]` to wszystkie wiersze i dwie pierwsze kolumny, a `X[:, 1:]` wszystkie wiersze i kolumny od drugiej. Mogą się nakładać, jak `minutes`:

```python run
import torch
import torch.nn as nn

X = torch.tensor([[2.0, 5.0, 0.0], [8.0, 3.0, 1.0]])
print(X[:, :2])
print(X[:, 1:])


class WideAndDeep(nn.Module):
    def __init__(self):
        super().__init__()
        self.deep_stack = nn.Sequential(nn.Linear(2, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU())
        self.output_layer = nn.Linear(2 + 40, 1)

    def forward(self, X):
        X_wide = X[:, 1:]
        X_deep = X[:, :2]
        deep_output = self.deep_stack(X_deep)
        return self.output_layer(torch.cat([X_wide, deep_output], dim=1))


torch.manual_seed(42)
print(WideAndDeep()(X).shape)
```

To działa, ale wiąże moduł z jedną kolejnością kolumn. Zwykle lepiej pozwolić modelowi brać to, czego potrzebuje każda ścieżka, jako osobne tensory.

## Dwa wejścia

`forward` może brać więcej niż jeden argument. Tabelę cech tnie się raz, na zewnątrz, a model wywołuje się z obiema częściami. To obejmuje też wejścia, których w ogóle nie da się wsadzić w jeden tensor, jak obraz i tekst, o różnych liczbach wymiarów. `TensorDataset` bierze dowolną liczbę tensorów, więc zrobiony z niego `DataLoader` daje tyle samo, w tej samej kolejności, w każdej paczce:

```python run
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(42)
n = 800
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
night = (torch.rand(n, 1) > 0.7).float()
X = torch.cat([km, minutes, night], dim=1)
y = 4 * km.clamp(max=6) + 2 * (km - 6).clamp(min=0) + 0.5 * minutes + 3 * night + 8 + torch.randn(n, 1)

X_train, y_train, X_valid, y_valid = X[:600], y[:600], X[600:], y[600:]
x_mean, x_std = X_train.mean(dim=0, keepdim=True), X_train.std(dim=0, keepdim=True, correction=0)
y_mean, y_std = y_train.mean(), y_train.std(correction=0)
X_train, X_valid = (X_train - x_mean) / x_std, (X_valid - x_mean) / x_std
y_train, y_valid = (y_train - y_mean) / y_std, (y_valid - y_mean) / y_std
X_wide_train, X_deep_train = X_train[:, 1:], X_train[:, :2]
X_wide_valid, X_deep_valid = X_valid[:, 1:], X_valid[:, :2]
train_loader = DataLoader(TensorDataset(X_wide_train, X_deep_train, y_train), batch_size=32, shuffle=True)
print([tuple(tensor.shape) for tensor in next(iter(train_loader))])


class WideAndDeep(nn.Module):
    def __init__(self, n_wide, n_deep):
        super().__init__()
        self.deep_stack = nn.Sequential(nn.Linear(n_deep, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU())
        self.output_layer = nn.Linear(n_wide + 40, 1)

    def forward(self, X_wide, X_deep):
        deep_output = self.deep_stack(X_deep)
        return self.output_layer(torch.cat([X_wide, deep_output], dim=1))


torch.manual_seed(42)
model = WideAndDeep(n_wide=2, n_deep=2)
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)

for epoch in range(30):
    model.train()
    for X_wide_batch, X_deep_batch, y_batch in train_loader:
        optimizer.zero_grad()
        criterion(model(X_wide_batch, X_deep_batch), y_batch).backward()
        optimizer.step()

model.eval()
with torch.no_grad():
    prediction = model(X_wide_valid, X_deep_valid)
print(round((((prediction - y_valid) ** 2).mean().sqrt() * y_std).item(), 2))
```

Pętla rozbiera paczkę na trzy tensory i podaje pierwsze dwa modelowi w kolejności argumentów `forward`. Rozpakowanie według pozycji działa, ale przy większej liczbie wejść łatwo pomylić kolejność. Wynik, 1,02 zł, jest tak blisko szumu opłat jak modele przed nim.

## Wejścia z nazwami

Własny `Dataset` może nazwać wejścia. To klasa z trzema metodami: `__init__` do trzymania danych, `__len__` mówiąca, ile jest elementów, i `__getitem__` dla elementu o danym indeksie, tak jak wywołuje ją `dataset[0]`. Tutaj element to słownik wejść i etykieta:

```python run
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset

torch.manual_seed(42)
n = 800
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
night = (torch.rand(n, 1) > 0.7).float()
X = torch.cat([km, minutes, night], dim=1)
y = 4 * km.clamp(max=6) + 2 * (km - 6).clamp(min=0) + 0.5 * minutes + 3 * night + 8 + torch.randn(n, 1)

X_train, y_train, X_valid, y_valid = X[:600], y[:600], X[600:], y[600:]
x_mean, x_std = X_train.mean(dim=0, keepdim=True), X_train.std(dim=0, keepdim=True, correction=0)
y_mean, y_std = y_train.mean(), y_train.std(correction=0)
X_train, X_valid = (X_train - x_mean) / x_std, (X_valid - x_mean) / x_std
y_train, y_valid = (y_train - y_mean) / y_std, (y_valid - y_mean) / y_std
X_wide_train, X_deep_train = X_train[:, 1:], X_train[:, :2]
X_wide_valid, X_deep_valid = X_valid[:, 1:], X_valid[:, :2]


class RideDataset(Dataset):
    def __init__(self, X_wide, X_deep, y):
        self.X_wide = X_wide
        self.X_deep = X_deep
        self.y = y

    def __len__(self):
        return len(self.y)

    def __getitem__(self, index):
        inputs = {"X_wide": self.X_wide[index], "X_deep": self.X_deep[index]}
        return inputs, self.y[index]


dataset = RideDataset(X_wide_train, X_deep_train, y_train)
print(len(dataset))
print(dataset[0])

train_loader = DataLoader(dataset, batch_size=32, shuffle=True)
inputs, y_batch = next(iter(train_loader))
print({name: tuple(tensor.shape) for name, tensor in inputs.items()}, tuple(y_batch.shape))


class WideAndDeep(nn.Module):
    def __init__(self, n_wide, n_deep):
        super().__init__()
        self.deep_stack = nn.Sequential(nn.Linear(n_deep, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU())
        self.output_layer = nn.Linear(n_wide + 40, 1)

    def forward(self, X_wide, X_deep):
        deep_output = self.deep_stack(X_deep)
        return self.output_layer(torch.cat([X_wide, deep_output], dim=1))


torch.manual_seed(42)
model = WideAndDeep(n_wide=2, n_deep=2)
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)

for epoch in range(30):
    model.train()
    for inputs, y_batch in train_loader:
        optimizer.zero_grad()
        criterion(model(**inputs), y_batch).backward()
        optimizer.step()

model.eval()
with torch.no_grad():
    prediction = model(X_wide=X_wide_valid, X_deep=X_deep_valid)
print(round((((prediction - y_valid) ** 2).mean().sqrt() * y_std).item(), 2))
```

`DataLoader` składa słowniki w paczki tak, jak tensory: daje słownik z tymi samymi nazwami, a w każdej pozycji paczkę tensorów. `model(**inputs)` rozkłada słownik na argumenty nazwane, `model(X_wide=..., X_deep=...)`, więc kolejność przestaje mieć znaczenie. Znaczenie ma to, że nazwy to nazwy parametrów `forward`, a błędna kończy się `TypeError`:

```python run
import torch
import torch.nn as nn


class Adder(nn.Module):
    def forward(self, X_wide, X_deep):
        return X_wide + X_deep


print(Adder()(X_wide=torch.ones(2), X_deep=torch.ones(2)))
print(Adder()(X_wide=torch.ones(2), X_other=torch.ones(2)))
```

## Dwa wyjścia

Model może zwrócić więcej niż jedną wartość, a `forward` po prostu zwraca je razem, jako krotkę. Drugie wyjście przydaje się, gdy dwa zadania dzielą jedno ciało, albo, jak tutaj, jako **wyjście pomocnicze** na ścieżce głębokiej. `aux_layer` robi predykcję z samego stosu głębokiego, a jej błąd dodaje się do straty z wagą, żeby stos głęboki musiał nauczyć się czegoś użytecznego sam, cokolwiek robi ścieżka szeroka. Na końcu odpowiedzią modelu jest tylko wyjście główne:

```python run
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(42)
n = 800
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
night = (torch.rand(n, 1) > 0.7).float()
X = torch.cat([km, minutes, night], dim=1)
y = 4 * km.clamp(max=6) + 2 * (km - 6).clamp(min=0) + 0.5 * minutes + 3 * night + 8 + torch.randn(n, 1)

X_train, y_train, X_valid, y_valid = X[:600], y[:600], X[600:], y[600:]
x_mean, x_std = X_train.mean(dim=0, keepdim=True), X_train.std(dim=0, keepdim=True, correction=0)
y_mean, y_std = y_train.mean(), y_train.std(correction=0)
X_train, X_valid = (X_train - x_mean) / x_std, (X_valid - x_mean) / x_std
y_train, y_valid = (y_train - y_mean) / y_std, (y_valid - y_mean) / y_std
X_wide_train, X_deep_train = X_train[:, 1:], X_train[:, :2]
X_wide_valid, X_deep_valid = X_valid[:, 1:], X_valid[:, :2]
train_loader = DataLoader(TensorDataset(X_wide_train, X_deep_train, y_train), batch_size=32, shuffle=True)


class WideAndDeep(nn.Module):
    def __init__(self, n_wide, n_deep):
        super().__init__()
        self.deep_stack = nn.Sequential(nn.Linear(n_deep, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU())
        self.output_layer = nn.Linear(n_wide + 40, 1)
        self.aux_layer = nn.Linear(40, 1)

    def forward(self, X_wide, X_deep):
        deep_output = self.deep_stack(X_deep)
        main_output = self.output_layer(torch.cat([X_wide, deep_output], dim=1))
        aux_output = self.aux_layer(deep_output)
        return main_output, aux_output


torch.manual_seed(42)
model = WideAndDeep(n_wide=2, n_deep=2)
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)
aux_weight = 0.2

for epoch in range(30):
    model.train()
    for X_wide_batch, X_deep_batch, y_batch in train_loader:
        optimizer.zero_grad()
        main_output, aux_output = model(X_wide_batch, X_deep_batch)
        loss = criterion(main_output, y_batch) + aux_weight * criterion(aux_output, y_batch)
        loss.backward()
        optimizer.step()

model.eval()
with torch.no_grad():
    main_output, aux_output = model(X_wide_valid, X_deep_valid)
for name, output in [("main", main_output), ("aux", aux_output)]:
    print(name, round((((output - y_valid) ** 2).mean().sqrt() * y_std).item(), 2))
```

Wyjście główne myli się o 1,00 zł, tak dobrze jak model bez pomocnika. Pomocnik dochodzi do 1,61 zł: nigdy nie widzi `night`, które dodaje do opłaty do 3 zł, więc nie może być lepszy. Strata to suma dwóch części, a `loss.backward()` wysyła nachylenia przez obie ścieżki naraz, tak jak przy każdym obliczeniu.

## Podsumowanie

- Własny model to podklasa `nn.Module`. `__init__` wywołuje `super().__init__()` i trzyma warstwy jako atrybuty `self`, a `forward` mówi, jak wejścia stają się wyjściem. Wywołuj model, jak w `model(X)`, a nie `forward`.
- Warstwy i ich parametry znajduje się przez atrybuty `self`: warstwa w zwykłej liście zostaje pominięta.
- `torch.cat([a, b], dim=1)` skleja tensory obok siebie, i tak ścieżka szeroka i głęboka spotykają się przed warstwą wyjściową.
- `forward` może brać kilka tensorów. `TensorDataset` daje je z `DataLoader` po kolei, a własny `Dataset` z `__len__` i `__getitem__` może dawać je z nazwami, które przekaże `model(**inputs)`.
- `forward` może zwracać kilka wartości, a strata decyduje, ile każda jest warta.

## Sprawdź się

<details>
<summary>Co robi <code>super().__init__()</code> w <code>__init__</code> modelu?</summary>

Uruchamia `__init__` z `nn.Module`, który ustawia to, czego moduł potrzebuje, żeby pamiętać swoje warstwy i parametry. Idzie pierwsze, przed przypisaniem jakiejkolwiek warstwy. Bez niego pierwsze przypisanie warstwy kończy się `AttributeError`.

</details>

<details>
<summary>Ścieżka głęboka modelu ma 40 wyjść, a szeroka bierze 2 kolumny. Ile wynosi <code>in_features</code> warstwy wyjściowej?</summary>

42. `torch.cat([X_wide, deep_output], dim=1)` układa 2 kolumny obok 40 wyjść, więc warstwa wyjściowa bierze 2 + 40 liczb dla każdego wiersza.

</details>

<details>
<summary>Dlaczego <code>model(**inputs)</code> kończy się błędem dla <code>inputs = {"X_wide": ..., "X_other": ...}</code>, gdy <code>forward(self, X_wide, X_deep)</code>?</summary>

`**inputs` przekazuje każdy klucz jako nazwę argumentu, więc to jest `model(X_wide=..., X_other=...)`. `forward` nie ma parametru `X_other` i nigdy nie dostaje `X_deep`, więc Python zatrzymuje się z `TypeError`. Klucze muszą być nazwami parametrów `forward`.

</details>

## Twoja kolej

W ćwiczeniu [Model szeroki i głęboki](../../exercises/05-pytorch/08-your-own-modules/01-a-wide-and-deep-model/task.pl.md) napiszesz moduł, z warstwami tam, gdzie umieściła je lekcja. W ćwiczeniu [Trening z wyjściem pomocniczym](../../exercises/05-pytorch/08-your-own-modules/02-train-with-a-helper-output/task.pl.md) napiszesz epokę treningu modelu z dwoma wejściami i dwoma wyjściami.
