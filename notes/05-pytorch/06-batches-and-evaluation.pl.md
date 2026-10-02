---
description: Podawaj modelowi dane po kilka wierszy naraz przez Dataset i DataLoader, podziel kursy na zbiór treningowy, walidacyjny i testowy i oceń model metryką.
---

# Porcje danych i ocena

Trening na stu kursach naraz był łatwy. Trening na milionie naraz oznacza tabelę, która nie mieści się w pamięci, i jeden krok spadku gradientu na przejście przez nią, co jest bardzo wolne. Dlatego prawdziwy trening pracuje na **porcji danych** (ang. batch), kilkudziesięciu wierszach naraz, i robi krok dla każdej porcji. Ta lekcja tworzy porcje przez `Dataset` i `DataLoader` z PyTorcha, dzieli kursy na trzy zbiory, trenuje model porcja po porcji i mierzy, jak jest dobry.

## Porcje danych

`TensorDataset` przechowuje tensory z wierszem dla każdego przykładu, tutaj cechami i opłatą każdego kursu, i oddaje jeden przykład naraz. `DataLoader` bierze zbiór danych i oddaje go w porcjach, w nowej losowej kolejności w każdej epoce, gdy powiesz `shuffle=True`. Ziarno ustala kolejność, tutaj i na twoim komputerze:

```python run
import torch
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(42)
n = 1000
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)

dataset = TensorDataset(X, y)
print(len(dataset))
print(dataset[0])

loader = DataLoader(dataset, batch_size=32, shuffle=True)
print(len(loader))
for i, (X_batch, y_batch) in enumerate(loader):
    if i < 2 or i == len(loader) - 1:
        print(i, X_batch.shape, y_batch.shape)
```

`dataset[0]` to pierwszy kurs: jego dwie cechy i jego opłata. Loader ma 32 porcje: 31 po 32 kursy i ostatnią z 8, które zostały. Każda porcja to para, cechy jej kursów i ich opłaty, a pętla może je rozpakować: `for X_batch, y_batch in loader`.

## Trzy zbiory kursów

Model oceniany na kursach, z których się uczył, wygląda lepiej, niż jest, więc kursy dzieli się na trzy. **Zbiór treningowy** to to, z czego model się uczy, **zbiór walidacyjny** to to, na czym go mierzysz, gdy wybierasz jego ustawienia, a **zbiór testowy** zostaje na koniec, żeby raz zmierzyć wybrany model. `random_split` tnie zbiór danych na losowe części podanych rozmiarów, a generator z ziarnem sprawia, że cięcie jest za każdym razem takie samo:

```python run
import torch
from torch.utils.data import DataLoader, TensorDataset, random_split

torch.manual_seed(42)
n = 1000
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)

train_set, valid_set, test_set = random_split(
    TensorDataset(X, y), [600, 200, 200], generator=torch.Generator().manual_seed(1)
)
print(len(train_set), len(valid_set), len(test_set))
print(train_set.indices[:5])

means = X[train_set.indices].mean(dim=0, keepdim=True)
stds = X[train_set.indices].std(dim=0, keepdim=True, correction=0)
print(means, stds)
```

Średnie i rozrzuty do [standaryzacji](04-linear-regression-by-hand.pl.md#cechy-po-standaryzacji) pochodzą wyłącznie z kursów treningowych, a kursy walidacyjne i testowe standaryzuje się z nimi, jak mówi [rozdział o sieciach neuronowych](../04-foundations/04-neural-networks/04-inputs.pl.md#nowe-zamówienia). Kursy testowe nie mogą przeciekać do niczego, czego uczy się model albo ty.

## Epoka

Pętla z czterech kroków ma teraz w sobie pętlę: epoka przechodzi przez wszystkie porcje zbioru treningowego, a każda porcja to krok. Wypisywana strata to średnia strat porcji. `model.train()` mówi, że model jest trenowany, co ma znaczenie dla warstw, które w treningu zachowują się inaczej niż w użyciu, a tutaj nic nie kosztuje:

```python run
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset, random_split

torch.manual_seed(42)
n = 1000
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)
train_set, valid_set, test_set = random_split(
    TensorDataset(X, y), [600, 200, 200], generator=torch.Generator().manual_seed(1)
)
means = X[train_set.indices].mean(dim=0, keepdim=True)
stds = X[train_set.indices].std(dim=0, keepdim=True, correction=0)
X_std = (X - means) / stds
train_loader = DataLoader(TensorDataset(X_std[train_set.indices], y[train_set.indices]), batch_size=32, shuffle=True)

model = nn.Linear(2, 1)
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)

for epoch in range(5):
    model.train()
    total_loss = 0.0
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        loss = criterion(model(X_batch), y_batch)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    print(epoch + 1, round(total_loss / len(train_loader), 3))
```

Strata spada z 291 do około 1 w trzy epoki, dużo szybciej niż w 100 epokach [lekcji ręcznej](04-linear-regression-by-hand.pl.md#trening): epoka to teraz 19 kroków, a nie 1. `loss.item()` daje stratę jako zwykłą liczbę, a dodawanie tensorów, które wciąż pamiętają swój zapis, trzymałoby w pamięci graf każdej porcji.

## Ocena

Żeby zmierzyć model, przechodzi on w tryb oceny, `model.eval()`, a predykcje liczy się wewnątrz `torch.no_grad()`, bo nic nie będzie się przez nie cofać. Metryka to liczba, która mówi, jak dobre są predykcje, a dla opłat **RMSE**, pierwiastek z błędu średniokwadratowego, jest w złotych, więc łatwo go odczytać. Ale ważne jest, po czym się uśrednia: średnia z RMSE każdej porcji to nie RMSE wszystkich kursów, gdy ostatnia porcja jest mniejsza. `torchmetrics` ma metryki jako obiekty, które zbierają po jednej porcji: `update` dla każdej porcji i `compute` na końcu:

```python run
import torch
import torch.nn as nn
import torchmetrics
from torch.utils.data import DataLoader, TensorDataset, random_split

torch.manual_seed(42)
n = 1000
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)
train_set, valid_set, test_set = random_split(
    TensorDataset(X, y), [600, 200, 200], generator=torch.Generator().manual_seed(1)
)
means = X[train_set.indices].mean(dim=0, keepdim=True)
stds = X[train_set.indices].std(dim=0, keepdim=True, correction=0)
X_std = (X - means) / stds
train_loader = DataLoader(TensorDataset(X_std[train_set.indices], y[train_set.indices]), batch_size=32, shuffle=True)
valid_loader = DataLoader(TensorDataset(X_std[valid_set.indices], y[valid_set.indices]), batch_size=32)

model = nn.Linear(2, 1)
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)
for epoch in range(5):
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        criterion(model(X_batch), y_batch).backward()
        optimizer.step()

model.eval()
squared_errors = 0.0
batch_rmses = []
rmse = torchmetrics.MeanSquaredError(squared=False)
with torch.no_grad():
    for X_batch, y_batch in valid_loader:
        y_pred = model(X_batch)
        squared_errors += ((y_pred - y_batch) ** 2).sum().item()
        batch_rmses.append(((y_pred - y_batch) ** 2).mean().sqrt())
        rmse.update(y_pred, y_batch)

print(round((squared_errors / len(valid_set)) ** 0.5, 4))
print(round(torch.stack(batch_rmses).mean().item(), 4))
print(rmse.compute())
```

RMSE na 200 kursach walidacyjnych to 1,0124: zsumuj kwadraty błędów wszystkich kursów, podziel przez ich liczbę, wyciągnij pierwiastek. Średnia z RMSE siedmiu porcji to 0,9922, trochę za mało, bo ostatnia porcja ma tylko 8 kursów, a liczy się tyle co pozostałe. `torchmetrics` robi to dobrze, 1,0124, a model myli się o około złotówkę, czyli o szum w opłatach. Pętle z tej lekcji, jedna epoka i jedna ocena, to z czego składa się trener, a ćwiczenia zapisują je jako funkcje.

## Podsumowanie

- `TensorDataset` przechowuje tensory z wierszem dla każdego przykładu, a `DataLoader` oddaje je w porcjach, przetasowanych na potrzeby treningu. Krok spadku gradientu robi się dla każdej porcji, a epoka przechodzi przez wszystkie.
- Kursy dzieli się na zbiór treningowy, z którego się uczy, walidacyjny, na którym mierzy się przy wyborze, i testowy, który zostaje do końca. `random_split` tnie zbiór danych, a standaryzacja używa tylko średnich i rozrzutów zbioru treningowego.
- Oceniaj z `model.eval()` i `torch.no_grad()`. Metryka na wszystkich kursach to nie średnia metryk porcji, gdy ostatnia porcja jest mniejsza.
- Metryki `torchmetrics` zbierają porcje przez `update` i dają wynik przez `compute`.

## Sprawdź się

<details>
<summary>1000 kursów idzie w porcjach po 32. Ile porcji ma loader i jak duża jest ostatnia?</summary>

32 porcje: 31 pełnych, czyli 992 kursy, i ostatnia z 8, które zostały. `DataLoader` zachowuje mniejszą ostatnią porcję, chyba że powiesz mu `drop_last=True`.

</details>

<details>
<summary>Dlaczego model dostaje do standaryzacji tylko średnie i rozrzuty kursów treningowych?</summary>

Standaryzacja jest częścią modelu, więc to, co do niej trafia, musi pochodzić z tego, czego model może się uczyć. Średnie obejmujące kursy walidacyjne albo testowe pozwoliłyby im przeciec do modelu, a jego wyniki wyglądałyby lepiej, niż są.

</details>

<details>
<summary>Dlaczego <code>loss.item()</code>, a nie <code>total_loss += loss</code>?</summary>

`loss` to tensor z zapisem obliczeń całej porcji, a dodawanie go trzyma ten zapis przy życiu dla każdej porcji epoki, co zapełnia pamięć bez powodu. `.item()` wyjmuje liczbę i pozwala zapisowi odejść.

</details>

## Twoja kolej

W ćwiczeniu [Wytrenuj jedną epokę](../../exercises/05-pytorch/06-batches-and-evaluation/01-train-one-epoch/task.pl.md) napiszesz pętlę po porcjach epoki. W ćwiczeniu [Oceń RMSE](../../exercises/05-pytorch/06-batches-and-evaluation/02-evaluate-the-rmse/task.pl.md) zmierzysz model na wszystkich porcjach loadera, w sposób właściwy.
