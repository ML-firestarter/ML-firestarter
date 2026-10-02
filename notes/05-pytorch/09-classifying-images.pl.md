---
description: Wytrenuj sieć do czytania odręcznych cyfr, z CrossEntropyLoss na logitach, dokładnością jako metryką oraz softmaxem i top-k do odczytywania jej odpowiedzi.
---

# Klasyfikacja obrazów

Do tej pory model przewidywał liczbę, opłatę. Wiele modeli wybiera zamiast tego jedną z kilku klas: jaka cyfra jest na obrazku, jakie to zwierzę, jaki język. Ta lekcja trenuje sieć do czytania odręcznych cyfr i pokazuje, co się zmienia, gdy odpowiedzią jest klasa: etykiety, ostatnia warstwa, strata i metryka.

> [!NOTE]
> Obrazki to cyfry ze scikit-learn, 1797 obrazów po 8×8 pikseli, bo strona nie może pobrać większego zbioru. Kod jest taki sam dla Fashion-MNIST albo każdego innego zbioru obrazów: zmieniają się tylko rozmiary obrazów i warstw, jak mówią komentarze poniżej, a na twoim komputerze `torchvision` ma je gotowe.

## Obrazki

Każdy obraz to siatka 64 pikseli z liczbą mówiącą, jak ciemny jest każdy, od 0 do 16. Tensor obrazów ma kształt `[obrazy, kanały, wysokość, szerokość]`: obraz w odcieniach szarości ma 1 kanał, kolorowy 3. Piksele dzieli się przez 16, żeby były między 0 a 1. Etykiety to cyfry, od 0 do 9, jako liczby całkowite typu `int64`, czyli `long`:

```python run
import torch
from sklearn.datasets import load_digits

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)

print(X.shape, y.shape)
print(y[:10])
for row in X[3, 0]:
    print("".join("#" if pixel > 0.5 else "." for pixel in row))
print(y[3])
```

`unsqueeze(1)` dodaje wymiar kanału, więc 1797 obrazów `[8, 8]` staje się `[1797, 1, 8, 8]`. Wypisany obraz to obraz 3, narysowany znakiem `#` dla ciemnych pikseli, a jego etykieta to cyfra, którą przedstawia.

## Sieć i jej strata

Sieć to ta z [lekcji 7](07-a-network-with-nn-sequential.pl.md), z nową pierwszą warstwą. `nn.Flatten()` zamienia każdy obraz `[1, 8, 8]` w wiersz 64 liczb, który biorą warstwy `nn.Linear`. Ostatnia warstwa ma po jednym wyjściu dla każdej klasy, 10, a te liczby to **logity**: wynik dla każdej cyfry, tak duży, jak sieć zechce, dodatni albo ujemny. Największy logit to cyfra, którą sieć wybiera.

`nn.CrossEntropyLoss()` bierze logity i prawdziwe klasy. Zamienia logity na prawdopodobieństwa przez softmax, a kara za obraz to $-\ln$ prawdopodobieństwa, które sieć dała właściwej cyfrze: [strata logarytmiczna](../04-foundations/03-logistic-regression/02-error.pl.md) z rozdziału o regresji logistycznej, dla więcej niż dwóch klas. Bierze logity, a nie prawdopodobieństwa, a etykiety jako numery klas typu `long`, a nie liczby zmiennoprzecinkowe:

```python run
import torch
import torch.nn as nn
import torch.nn.functional as F

criterion = nn.CrossEntropyLoss()
logits = torch.tensor([[2.0, 0.5, -1.0]])

print(F.softmax(logits, dim=1))
print(criterion(logits, torch.tensor([0])))
print(criterion(logits, torch.tensor([1])))
print(criterion(logits, torch.tensor([0.0])))
```

Softmax zamienia trzy logity w prawdopodobieństwa, które sumują się do 1, a sieć daje pierwszej klasie najwięcej, 0,79. Jeśli prawdziwa klasa to 0, strata wynosi $-\ln 0{,}79 = 0{,}24$, a jeśli to 1, dostało ją tylko 0,18 prawdopodobieństwa i strata to 1,74. Ostatni wiersz zatrzymuje się, bo etykieta 0.0 jest liczbą zmiennoprzecinkową, a strata chce numeru klasy: „expected target dtype to be Long or Byte”.

## Trening

Pętla treningowa to ta z [lekcji o porcjach danych](06-batches-and-evaluation.pl.md): optymalizator robi krok dla każdej porcji obrazów treningowych, a po każdej epoce model mierzą obrazy walidacyjne. Metryką jest **dokładność** (ang. accuracy), czyli ułamek obrazów, w których największy logit należy do właściwej cyfry, a `torchmetrics.Accuracy` zbiera ją po jednej porcji:

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

torch.manual_seed(42)
model = nn.Sequential(
    nn.Flatten(),
    nn.Linear(64, 100),
    nn.ReLU(),
    nn.Linear(100, 50),
    nn.ReLU(),
    nn.Linear(50, 10),
)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
accuracy = torchmetrics.Accuracy(task="multiclass", num_classes=10)

for epoch in range(10):
    model.train()
    total_loss = 0.0
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        loss = criterion(model(X_batch), y_batch)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    model.eval()
    accuracy.reset()
    with torch.no_grad():
        for X_batch, y_batch in valid_loader:
            accuracy.update(model(X_batch), y_batch)
    print(epoch + 1, round(total_loss / len(train_loader), 4), round(accuracy.compute().item(), 4))
```

Strata pierwszej epoki wynosi około 2,27, blisko $-\ln 0{,}1 = 2{,}30$, straty sieci, która daje wszystkim 10 cyfrom to samo prawdopodobieństwo. Po 10 epokach to 0,20, a model czyta dobrze 94% obrazów walidacyjnych. Dla Fashion-MNIST zmieniają się tylko rozmiary: 28 × 28 = 784 wejścia w pierwszej warstwie i kilkaset liczb ukrytych zamiast 100.

## Odczytywanie odpowiedzi

Logity to wyniki sieci, a `argmax` wybiera największy z nich dla każdego obrazu: `dim=1` to wymiar 10 klas. Softmax zamienia wyniki w prawdopodobieństwa, żebyś widział, jak pewna jest sieć, a `torch.topk` daje kilka najlepszych klas z ich logitami. Softmax tylko po najwyższych logitach daje prawdopodobieństwa wśród kilku najlepszych:

```python run
import torch
import torch.nn as nn
import torch.nn.functional as F
from sklearn.datasets import load_digits
from torch.utils.data import DataLoader, TensorDataset, random_split

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)
train_set, valid_set = random_split(TensorDataset(X, y), [1500, 297], generator=torch.Generator().manual_seed(1))
train_loader = DataLoader(train_set, batch_size=32, shuffle=True)

torch.manual_seed(42)
model = nn.Sequential(nn.Flatten(), nn.Linear(64, 100), nn.ReLU(), nn.Linear(100, 50), nn.ReLU(), nn.Linear(50, 10))
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
for epoch in range(10):
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        criterion(model(X_batch), y_batch).backward()
        optimizer.step()

model.eval()
X_new, y_new = X[valid_set.indices[:3]], y[valid_set.indices[:3]]
with torch.no_grad():
    logits = model(X_new)

print(logits.argmax(dim=1), y_new)
probabilities = F.softmax(logits, dim=1)
print(probabilities.max(dim=1).values.round(decimals=2))
top_logits, top_classes = torch.topk(logits, k=3, dim=1)
print(top_classes)
print(F.softmax(top_logits, dim=1).round(decimals=2))
```

Sieć trafia we wszystkie trzy obrazy, 0, 1 i 0, i jest ich pewna: największe prawdopodobieństwa to 0,98, 0,99 i 1,00. Trzy najlepsze klasy pierwszego obrazu to 0, 9 i 5, z 0,98, 0,01 i 0,00 wśród nich. Nikt nie powiedział sieci, które cyfry są podobne, ale 9 i 5 to jej drugi i trzeci wybór dla zera.

## Podsumowanie

- Tensor obrazów ma `[obrazy, kanały, wysokość, szerokość]`, a `nn.Flatten()` robi z każdego obrazu wiersz dla warstw liniowych. Etykiety klas to liczby całkowite typu `long`.
- Ostatnia warstwa klasyfikatora ma jedno wyjście na klasę, a jej liczby to logity.
- `nn.CrossEntropyLoss()` bierze logity i numery klas, stosuje w środku softmax i daje stratę logarytmiczną. Nie stosuj softmaxu przed nią.
- Dokładność to ułamek dobrze rozpoznanych obrazów, a `torchmetrics.Accuracy` zbiera ją po porcjach. `argmax(dim=1)` wybiera klasę, `F.softmax` daje prawdopodobieństwa, a `torch.topk` kilka najlepszych klas.

## Sprawdź się

<details>
<summary>Sieć dla 5 klas dostaje porcję 32 obrazów. Jaki kształt mają jej logity?</summary>

`[32, 5]`: wynik dla każdej z 5 klas, dla każdego z 32 obrazów. `argmax(dim=1)` daje wtedy 32 numery klas.

</details>

<details>
<summary>Dlaczego ostatnia warstwa sieci nie ma softmaxu?</summary>

`CrossEntropyLoss` stosuje go sama, w sposób dokładniejszy niż softmax z logarytmem po nim. Softmax przed nią byłby zastosowany dwa razy. Softmax służy do czytania odpowiedzi, przez `F.softmax`, po treningu.

</details>

<details>
<summary>Strata pierwszej epoki wynosi około 2,3. Co to mówi?</summary>

Że sieć jeszcze nic nie wie: danie wszystkim 10 cyfrom tego samego prawdopodobieństwa, 0,1, kosztuje $-\ln 0{,}1 = 2{,}30$ za każdy obraz. Strata, która tam zostaje, oznacza, że nic się nie uczy.

</details>

## Twoja kolej

W ćwiczeniu [Dokładność z logitów](../../exercises/05-pytorch/09-classifying-images/01-accuracy-from-logits/task.pl.md) policzysz dokładność logitów porcji. W ćwiczeniu [Kilka najlepszych klas](../../exercises/05-pytorch/09-classifying-images/02-the-best-few-classes/task.pl.md) odczytasz najlepsze klasy odpowiedzi sieci wraz z ich prawdopodobieństwami.
