---
description: Podawaj modelowi dane po kilka wierszy naraz dzięki Dataset i DataLoader, podziel kursy na zbiory treningowy, walidacyjny i testowy i oceń model za pomocą metryki.
---

# Porcje danych i ocena

Trening na stu kursach naraz był prosty. Trening na milionie kursów naraz oznacza tabelę, która nie mieści się w pamięci, i tylko jeden krok spadku gradientu na każde przejście przez nią, co trwa bardzo długo. Dlatego w prawdziwym treningu model dostaje dane **porcjami** (ang. batch), po kilkadziesiąt wierszy, i robi krok po każdej porcji. W tej lekcji przygotujesz porcje za pomocą `Dataset` i `DataLoader` z PyTorcha, podzielisz kursy na trzy zbiory, wytrenujesz model porcja po porcji i zmierzysz, jak dobry jest.

## Porcje danych

`TensorDataset` przechowuje tensory z wierszem dla każdego przykładu, tutaj cechy i opłatę każdego kursu, i zwraca po jednym przykładzie. `DataLoader` bierze taki zbiór i podaje go porcjami, a z `shuffle=True` w każdej epoce w nowej, losowej kolejności. Ziarno ustala tę kolejność, tutaj i na twoim komputerze:

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

`dataset[0]` to pierwszy kurs: jego dwie cechy i opłata. `DataLoader` dzieli kursy na 32 porcje: 31 po 32 kursy i ostatnią z 8 pozostałymi. Każda porcja to para, cechy jej kursów i ich opłaty, którą pętla może od razu rozpakować: `for X_batch, y_batch in loader`.

## Trzy zbiory kursów

Model mierzony na kursach, na których się uczył, wydaje się lepszy, niż jest, dlatego kursy dzieli się na trzy części. Na **zbiorze treningowym** model się uczy, na **zbiorze walidacyjnym** mierzy się go podczas dobierania ustawień, a **zbiór testowy** odkłada się na koniec, żeby jeden raz zmierzyć wybrany model. `random_split` dzieli zbiór na losowe części o podanych rozmiarach, a generator z ziarnem sprawia, że podział za każdym razem jest taki sam:

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

Średnie i rozrzuty do [standaryzacji](04-linear-regression-by-hand.pl.md#cechy-po-standaryzacji) liczy się wyłącznie z kursów treningowych i nimi standaryzuje się też kursy walidacyjne i testowe, jak w [rozdziale o sieciach neuronowych](../04-foundations/04-neural-networks/04-inputs.pl.md#nowe-zamówienia). Kursy testowe nie mogą przeniknąć do niczego, z czego uczy się model albo ty.

## Epoka

Pętla z czterema krokami ma teraz w środku drugą pętlę: epoka przechodzi przez wszystkie porcje zbioru treningowego, a każda porcja to jeden krok. Wypisywana strata to średnia ze strat porcji. `model.train()` informuje, że model jest trenowany, co ma znaczenie dla warstw, które zachowują się inaczej w treningu, a inaczej w użyciu. Tutaj niczego nie zmienia, a nic nie kosztuje:

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

Strata spada z 291 do około 1 w trzy epoki, znacznie szybciej niż w ciągu 100 epok z [lekcji ręcznej](04-linear-regression-by-hand.pl.md#trening): epoka to teraz 19 kroków, a nie 1. `loss.item()` zwraca stratę jako zwykłą liczbę. Gdyby sumować tensory, które pamiętają zapis obliczeń, w pamięci zostałby graf każdej porcji.

## Ocena

Żeby zmierzyć model, przełącza się go w tryb oceny, `model.eval()`, a predykcje liczy wewnątrz `torch.no_grad()`, bo nic nie będzie się przez nie cofać. Metryka to liczba, która mówi, jak dobre są predykcje. Dla opłat dobrze sprawdza się **RMSE**, czyli pierwiastek z błędu średniokwadratowego, bo wychodzi w złotych i łatwo go odczytać. Ważne jest jednak, po czym się uśrednia: średnia z RMSE poszczególnych porcji to nie RMSE wszystkich kursów, jeśli ostatnia porcja jest mniejsza. `torchmetrics` ma metryki w postaci obiektów, które zbierają dane porcja po porcji: `update` dla każdej porcji i `compute` na końcu:

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

RMSE na 200 kursach walidacyjnych wynosi 1,0124: to suma kwadratów błędów wszystkich kursów podzielona przez ich liczbę, a z tego pierwiastek. Średnia z RMSE siedmiu porcji to 0,9922, czyli trochę za mało, bo ostatnia porcja ma tylko 8 kursów, a liczy się tak samo jak pozostałe. `torchmetrics` liczy poprawnie, 1,0124, a model myli się średnio o mniej więcej złotówkę, czyli o tyle, ile wynosi szum w opłatach. Pętle z tej lekcji, jedna epoka i jedna ocena, to elementy, z których składa się każdy trening, a ćwiczenia zamieniają je w funkcje.

## Podsumowanie

- `TensorDataset` przechowuje tensory z wierszem dla każdego przykładu, a `DataLoader` podaje je porcjami, w treningu w losowej kolejności. Krok spadku gradientu robi się dla każdej porcji, a epoka przechodzi przez wszystkie.
- Kursy dzieli się na zbiór treningowy, na którym model się uczy, walidacyjny, na którym mierzy się go przy wyborze ustawień, i testowy, odłożony na koniec. `random_split` dzieli zbiór, a do standaryzacji używa się wyłącznie średnich i rozrzutów zbioru treningowego.
- Model ocenia się w trybie `model.eval()` i wewnątrz `torch.no_grad()`. Gdy ostatnia porcja jest mniejsza, metryka dla wszystkich kursów nie jest średnią z metryk porcji.
- Metryki z `torchmetrics` zbierają porcje przez `update` i podają wynik przez `compute`.

## Sprawdź się

<details>
<summary>1000 kursów trafia do porcji po 32. Ile jest porcji i jak duża jest ostatnia?</summary>

32 porcje: 31 pełnych, czyli 992 kursy, i ostatnia z 8 pozostałymi. `DataLoader` zostawia mniejszą ostatnią porcję, chyba że dostanie `drop_last=True`.

</details>

<details>
<summary>Dlaczego do standaryzacji model dostaje tylko średnie i rozrzuty kursów treningowych?</summary>

Standaryzacja jest częścią modelu, więc wszystko, co do niej trafia, musi pochodzić z danych, z których model może się uczyć. Średnie liczone z udziałem kursów walidacyjnych albo testowych przemyciłyby je do modelu, a jego wyniki wyglądałyby lepiej, niż są naprawdę.

</details>

<details>
<summary>Dlaczego <code>loss.item()</code>, a nie <code>total_loss += loss</code>?</summary>

`loss` to tensor z zapisem obliczeń całej porcji, a dodawanie go utrzymuje ten zapis przy życiu dla każdej porcji w epoce, czyli niepotrzebnie zapełnia pamięć. `.item()` wyciąga samą liczbę i pozwala zapisowi zniknąć.

</details>

## Twoja kolej

W ćwiczeniu [Wytrenuj jedną epokę](../../exercises/05-pytorch/06-batches-and-evaluation/01-train-one-epoch/task.pl.md) napiszesz pętlę po porcjach jednej epoki. W ćwiczeniu [Zmierz RMSE](../../exercises/05-pytorch/06-batches-and-evaluation/02-evaluate-the-rmse/task.pl.md) poprawnie zmierzysz model na wszystkich porcjach z `DataLoader`.
