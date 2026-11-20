---
description: Napisz własny nn.Module ze ścieżką szeroką i głęboką, podawaj mu kolumny, dwa wejścia albo wejścia z nazwami i daj mu drugie wyjście.
---

# Własne moduły

`nn.Sequential` przepuszcza dane przez jeden ciąg warstw, a nie każda sieć jest takim ciągiem. W sieci **szerokiej i głębokiej** (ang. wide and deep) wejścia przechodzą przez stos warstw, czyli ścieżkę głęboką, *a także* bezpośrednio do warstwy wyjściowej, czyli ścieżką szeroką, która widzi je w pierwotnej postaci. Ścieżka głęboka może nauczyć się załamań i wzorców, a szeroka przenosi proste zależności z pominięciem wszystkich przekształceń, w których zwykły stos warstw mógłby je rozmyć:

```text
wejścia ──► stos głęboki (Linear, ReLU, Linear, ReLU) ──┐
   │                                                    ├──► sklejenie ──► warstwa wyjściowa ──► opłata
   └────────────────────────────────────────────────────┘
```

Do tego potrzebny jest własny moduł, a moduł to klasa, jak w lekcji o [klasach](../02-python/04-programs/01-classes.pl.md). W tej lekcji zbudujesz taki moduł, a potem nauczysz go przyjmować i zwracać inne rzeczy: kolumny jednej tabeli, dwa wejścia, wejścia z nazwami i dwa wyjścia. Kursy firmy taksówkowej dostają trzecią cechę, `night`, która oznacza kurs nocny, droższy o 3 zł.

## Własny moduł

Model to podklasa `nn.Module`. Jego `__init__` najpierw wywołuje `super().__init__()`, a potem tworzy warstwy i zapisuje je jako atrybuty `self`. Jego `forward` mówi, jak z wejścia powstaje wyjście. `torch.cat([a, b], dim=1)` łączy cechy z wejścia z liczbami wyliczonymi przez ścieżkę głęboką, stawiając je obok siebie:

```python run
import torch

wide = torch.zeros(5, 3)
deep = torch.ones(5, 40)
print(torch.cat([wide, deep], dim=1).shape)
print(torch.cat([wide, wide], dim=0).shape)
```

`dim=1` łączy kolumny, więc liczba wierszy musi się zgadzać, a kolumny się sumują: 3 + 40 = 43. `dim=0` układałoby wiersze jeden pod drugim. Oto cały moduł, dla tabeli z dowolną liczbą cech:

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

Wypisanie modelu pokazuje jego warstwy w postaci drzewa, z nazwami atrybutów, pod którymi zostały zapisane. `model.output_layer` to jeden z nich. Parametry warstw wewnątrz `deep_stack` też liczą się jako parametry modułu: 3 × 50 + 50, 50 × 40 + 40 i 43 + 1 dają razem widoczne 2284, a `model.parameters()` to właśnie to, co przyjmuje optymalizator.

`model(X)` nie wywołuje bezpośrednio napisanego przez ciebie `forward`: `nn.Module` ma metodę `__call__`, która uruchamia `forward`, jak w zabawkowym `Module` z lekcji o klasach, i robi przy tym jeszcze kilka innych rzeczy. Wywołuj więc model, a nie `model.forward(X)`.

Warstwa musi być atrybutem, żeby moduł o niej wiedział, bo `nn.Module` śledzi to, co jest przypisywane do `self`. Warstwa ukryta w zwykłej liście Pythona zostanie pominięta, razem ze swoimi parametrami, a optymalizator, który dostanie `model.parameters()`, nigdy ich nie wytrenuje:

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

Własny model trenuje się tak samo jak każdy inny. `train` i `rmse_in_euros` to te same funkcje co w [lekcji 7](07-a-network-with-nn-sequential.pl.md), a dane to te same kursy z dodaną cechą `night`. Zwykła sieć z tamtej lekcji trenuje obok sieci szerokiej i głębokiej, przez tyle samo epok, a każdą z nich ocenia się na kursach walidacyjnych:

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

Obie wypadają mniej więcej tak samo, 1,06 zł i 1,10 zł, przy szumie w opłatach równym 1 zł. Ścieżka szeroka nie ułatwia tego zadania, bo przy trzech cechach zwykły stos warstw radzi sobie dobrze. Przydaje się wtedy, gdy cech jest dużo albo gdy część z nich to ręcznie wyliczone reguły, których stos warstw nie powinien rozmywać.

## Inne kolumny dla każdej ścieżki

A gdyby każda ścieżka miała widzieć inne kolumny? Ścieżka szeroka mogłaby dostać `minutes` i `night`, czyli proste zależności, które uchwyci prosta, a głęboka `km` i `minutes`, bo tam jest załamanie. Można to zrobić, wycinając kolumny w `forward`. `X[:, :2]` to wszystkie wiersze i dwie pierwsze kolumny, a `X[:, 1:]` wszystkie wiersze i kolumny od drugiej. Wycinki mogą się nakładać, jak w przypadku `minutes`:

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

To działa, ale wiąże moduł z jedną kolejnością kolumn. Zwykle lepiej, żeby model przyjmował to, czego potrzebuje każda ścieżka, w osobnych tensorach.

## Dwa wejścia

`forward` może przyjmować więcej niż jeden argument. Tabelę cech dzieli się raz, poza modelem, a model wywołuje się z obiema częściami. W ten sam sposób obsługuje się wejścia, których w ogóle nie da się zmieścić w jednym tensorze, na przykład obraz i tekst o różnej liczbie wymiarów. `TensorDataset` przyjmuje dowolną liczbę tensorów, więc `DataLoader` utworzony na jego podstawie zwraca w każdej porcji tyle samo tensorów, w tej samej kolejności:

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

Pętla rozkłada porcję na trzy tensory i podaje dwa pierwsze modelowi w kolejności argumentów `forward`. Rozpakowywanie według pozycji działa, ale przy większej liczbie wejść łatwo pomylić kolejność. Wynik, 1,02 zł, jest tak samo bliski szumowi w opłatach jak wyniki poprzednich modeli.

## Wejścia z nazwami

Własny `Dataset` może nadawać wejściom nazwy. To klasa z trzema metodami: `__init__` zapamiętuje dane, `__len__` mówi, ile jest elementów, a `__getitem__` zwraca element o danym indeksie, tak jak wywołuje go `dataset[0]`. Tutaj elementem jest słownik wejść i etykieta:

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

`DataLoader` łączy słowniki w porcje tak samo jak tensory: zwraca słownik z tymi samymi kluczami, a pod każdym z nich porcję tensorów. `model(**inputs)` rozkłada słownik na argumenty podawane z nazwy, czyli `model(X_wide=..., X_deep=...)`, więc kolejność przestaje mieć znaczenie. Ważne jest za to, żeby klucze były nazwami parametrów `forward`, bo zła nazwa kończy się błędem `TypeError`:

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

Model może zwracać więcej niż jedną wartość: `forward` po prostu zwraca je razem, jako krotkę. Drugie wyjście przydaje się, gdy dwa zadania mają wspólny trzon, albo, jak tutaj, jako **wyjście pomocnicze** na ścieżce głębokiej. `aux_layer` przewiduje opłatę na podstawie samego stosu głębokiego, a jej błąd jest dodawany do straty z pewną wagą, żeby stos głęboki musiał sam nauczyć się czegoś przydatnego, niezależnie od tego, co robi ścieżka szeroka. Na koniec odpowiedzią modelu jest tylko główne wyjście:

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

Główne wyjście myli się o 1,00 zł, tak samo jak model bez wyjścia pomocniczego. Wyjście pomocnicze osiąga 1,61 zł: nigdy nie widzi `night`, a ta cecha podnosi opłatę nawet o 3 zł, więc lepiej być nie może. Strata jest sumą dwóch części, a `loss.backward()` wysyła nachylenia wstecz przez obie ścieżki naraz, jak przy każdym obliczeniu.

## Podsumowanie

- Własny model to podklasa `nn.Module`. `__init__` wywołuje `super().__init__()` i zapisuje warstwy jako atrybuty `self`, a `forward` mówi, jak z wejść powstaje wyjście. Wywołuje się model, jak w `model(X)`, a nie `forward`.
- Warstwy i ich parametry są wyszukiwane wśród atrybutów `self`: warstwa w zwykłej liście zostanie pominięta.
- `torch.cat([a, b], dim=1)` łączy tensory, stawiając je obok siebie, i właśnie w ten sposób ścieżka szeroka spotyka się z głęboką przed warstwą wyjściową.
- `forward` może przyjmować kilka tensorów. `TensorDataset` podaje je przez `DataLoader` w ustalonej kolejności, a własny `Dataset` z `__len__` i `__getitem__` może podawać je z nazwami, które `model(**inputs)` przekazuje dalej.
- `forward` może zwracać kilka wartości, a o tym, ile każda z nich jest warta, decyduje strata.

## Sprawdź się

<details>
<summary>Co robi <code>super().__init__()</code> w <code>__init__</code> modelu?</summary>

Uruchamia `__init__` z `nn.Module`, który przygotowuje to, czego moduł potrzebuje, żeby śledzić swoje warstwy i parametry. Musi być pierwsze, przed przypisaniem jakiejkolwiek warstwy. Bez niego już pierwsze przypisanie warstwy kończy się błędem `AttributeError`.

</details>

<details>
<summary>Ścieżka głęboka modelu ma 40 wyjść, a szeroka przyjmuje 2 kolumny. Ile wynosi <code>in_features</code> warstwy wyjściowej?</summary>

42. `torch.cat([X_wide, deep_output], dim=1)` stawia 2 kolumny obok 40 wyjść, więc warstwa wyjściowa dostaje 2 + 40 liczb dla każdego wiersza.

</details>

<details>
<summary>Dlaczego <code>model(**inputs)</code> kończy się błędem dla <code>inputs = {"X_wide": ..., "X_other": ...}</code>, gdy <code>forward(self, X_wide, X_deep)</code>?</summary>

`**inputs` przekazuje każdy klucz jako nazwę argumentu, więc to wywołanie `model(X_wide=..., X_other=...)`. `forward` nie ma parametru `X_other` i nie dostaje `X_deep`, więc Python zatrzymuje się z błędem `TypeError`. Klucze muszą być nazwami parametrów `forward`.

</details>

## Twoja kolej

W ćwiczeniu [Model szeroki i głęboki](../../exercises/05-pytorch/08-your-own-modules/01-a-wide-and-deep-model/task.pl.md) napiszesz moduł z warstwami w tych miejscach, w których umieściła je lekcja. W ćwiczeniu [Trening z wyjściem pomocniczym](../../exercises/05-pytorch/08-your-own-modules/02-train-with-a-helper-output/task.pl.md) napiszesz epokę treningu modelu z dwoma wejściami i dwoma wyjściami.
