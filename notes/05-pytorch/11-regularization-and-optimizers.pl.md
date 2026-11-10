---
description: Trenuj szybciej dzięki pędowi i Adamowi, obniżaj współczynnik uczenia w trakcie treningu i nie pozwól sieci nauczyć się obrazów treningowych na pamięć, używając zaniku wag i dropoutu.
---

# Regularyzacja i optymalizatory

Sieć z lekcji [Klasyfikacja obrazów](09-classifying-images.pl.md) była trenowana zwykłym SGD i nic nie przeszkadzało jej nauczyć się obrazów treningowych na pamięć. Prawdziwy trening prawie nigdy tak nie wygląda. W tej lekcji jest to, czego używa niemal każdy trening: optymalizatory, które robią lepsze kroki, współczynnik uczenia, który zmienia się w trakcie treningu, i dwa sposoby na to, żeby sieć gorzej zapamiętywała, a dzięki temu lepiej radziła sobie z obrazami, których nie widziała. Wszystko to jest wypróbowane na cyfrach.

## Pęd

Zwykłe SGD robi krok równy współczynnikowi uczenia razy nachylenie i o nim zapomina. Z **pędem** (ang. momentum) optymalizator trzyma dla każdego parametru **prędkość**. W każdym kroku prędkość staje się 0,9 tego, czym była, plus nowe nachylenie, a parametr przesuwa się o współczynnik uczenia razy prędkość. Kroki w tym samym kierunku się sumują, jak u piłki, która nabiera prędkości, tocząc się w dół.

Oto strata, której nachylenie jest wszędzie takie samo, żeby kroki łatwo było śledzić: `-w` ma nachylenie −1, gdziekolwiek jest `w`, więc w dół jest zawsze w prawo. Optymalizator bierze dowolną listę tensorów do zmieniania, nie tylko parametry modelu:

```python run
import torch

w = torch.tensor(0.0, requires_grad=True)
optimizer = torch.optim.SGD([w], lr=0.1, momentum=0.9)

for step in range(5):
    optimizer.zero_grad()
    loss = -w
    loss.backward()
    optimizer.step()
    print(step + 1, round(w.item(), 4))
```

Zwykłe SGD przesuwałoby `w` o 0,1 w każdym kroku. Z pędem 0,9 kroki to 0,1, 0,19, 0,271, 0,3439 i 0,4095: każdy to 0,9 poprzedniego plus nowe 0,1. Rosną w stronę 1, czyli dziesięciu zwykłych kroków, bo $0{,}1 / (1 - 0{,}9) = 1$. Gdy więc nachylenia wciąż wskazują w tę samą stronę, pęd 0,9 działa jak dziesięć razy większy współczynnik uczenia. Gdy wskazują raz w jedną, raz w drugą stronę, jak wtedy, gdy kroki przeskakują cel, znoszą się w prędkości, czego większy współczynnik uczenia by dla nich nie zrobił.

## Adam

Pęd nadal ma jeden współczynnik uczenia dla wszystkich parametrów. Ale nachylenia parametrów sieci nie są tej samej wielkości, a współczynnik uczenia dobry dla dużych ledwo rusza małe. **Adam** daje każdemu parametrowi krok o własnej wielkości. Trzyma dla każdego parametru dwie średnie kroczące: jedną z jego nachyleń, tak jak pęd, i jedną z ich kwadratów. Krok to pierwsza średnia podzielona przez pierwiastek z drugiej, razy współczynnik uczenia. Nachylenie zawsze duże i nachylenie zawsze małe wychodzą oba jako mniej więcej 1:

```python run
import torch

slopes = torch.tensor([100.0, 0.01])

for optimizer_class in [torch.optim.SGD, torch.optim.Adam]:
    w = torch.zeros(2, requires_grad=True)
    optimizer = optimizer_class([w], lr=0.1)
    for step in range(3):
        optimizer.zero_grad()
        loss = (w * slopes).sum()
        loss.backward()
        optimizer.step()
    print(optimizer_class.__name__, [round(number, 4) for number in w.tolist()])
```

Dwa parametry mają w każdym kroku nachylenia 100 i 0,01. Po 3 krokach SGD przesunęło pierwszy o 30, a drugi o 0,003, dziesięć tysięcy razy mniej. Adam przesunął oba o 0,3, czyli o współczynnik uczenia w każdym kroku: dla Adama liczy się to, w którą stronę wskazuje nachylenie i jak stale, a nie to, jak jest duże. Dzięki temu jest dużo mniej czuły na współczynnik uczenia, a jego domyślny, 0,001, pasuje do wielu sieci bez żadnego próbowania.

## Na cyfrach

Oto wszystkie trzy na sieci z lekcji [Klasyfikacja obrazów](09-classifying-images.pl.md#trening), z tym samym współczynnikiem uczenia 0,01, tymi samymi wagami początkowymi i tymi samymi porcjami danych. `train` bierze klasę optymalizatora i jego ustawienia i zwraca dokładność na obrazach walidacyjnych po każdej z 5 epok. `**settings` zbiera ustawienia podane przez nazwę, jak `lr=0.01`, w słownik i przekazuje je optymalizatorowi, tak jak `**inputs` robiło to dla modelu w lekcji [Własne moduły](08-your-own-modules.pl.md#wejścia-z-nazwami):

```python run
import torch
import torch.nn as nn
from sklearn.datasets import load_digits
from torch.utils.data import DataLoader, TensorDataset, random_split

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)
train_set, valid_set = random_split(TensorDataset(X, y), [1500, 297], generator=torch.Generator().manual_seed(1))
train_loader = DataLoader(train_set, batch_size=32, shuffle=True)
X_valid, y_valid = X[valid_set.indices], y[valid_set.indices]


def train(optimizer_class, **settings):
    torch.manual_seed(42)
    model = nn.Sequential(nn.Flatten(), nn.Linear(64, 100), nn.ReLU(), nn.Linear(100, 50), nn.ReLU(), nn.Linear(50, 10))
    criterion = nn.CrossEntropyLoss()
    optimizer = optimizer_class(model.parameters(), **settings)
    accuracies = []
    for epoch in range(5):
        model.train()
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()
        model.eval()
        with torch.no_grad():
            accuracy = (model(X_valid).argmax(dim=1) == y_valid).float().mean().item()
        accuracies.append(round(accuracy, 3))
    return accuracies


print("SGD     ", train(torch.optim.SGD, lr=0.01))
print("momentum", train(torch.optim.SGD, lr=0.01, momentum=0.9))
print("Adam    ", train(torch.optim.Adam, lr=0.01))
```

Po 5 epokach zwykłe SGD czyta dobrze 24% obrazów walidacyjnych, SGD z pędem 88%, a Adam 96%. To nie znaczy, że SGD jest gorszym optymalizatorem: ze współczynnikiem uczenia 0,1 czytało dobrze 94% po 10 epokach w lekcji [Klasyfikacja obrazów](09-classifying-images.pl.md#trening), a pęd przy 0,01 też dochodzi do 95% w 10 epok, tak jak powinien według dziesięciu razy z pierwszej części. Dla SGD współczynnik uczenia trzeba znaleźć, a kroki Adama same wychodzą mniej więcej odpowiedniej wielkości.

## Współczynnik uczenia, który się zmienia

Duży współczynnik uczenia szybko doprowadza sieć w pobliże dobrego miejsca, a potem każe jej wokół niego skakać. Mały się uspokaja, ale dochodzi tam w nieskończoność. **Harmonogram** (ang. schedule) zaczyna od dużego i kończy na małym. Harmonogramy są w `torch.optim.lr_scheduler`: harmonogram tworzy się dla optymalizatora, a jego `step()`, wywoływane raz na końcu każdej epoki, ustawia współczynnik uczenia optymalizatora na następną.

`CosineAnnealingLR` obniża współczynnik uczenia wzdłuż połowy fali cosinusa, od wartości początkowej do 0 w ciągu `T_max` epok: najpierw powoli, najszybciej w środku i znowu powoli na końcu. Oto Adam ze stałym 0,01 i z harmonogramem. Kolumny to epoka, współczynnik uczenia w jej trakcie i dokładność po niej:

```python run
import torch
import torch.nn as nn
from sklearn.datasets import load_digits
from torch.utils.data import DataLoader, TensorDataset, random_split

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)
train_set, valid_set = random_split(TensorDataset(X, y), [1500, 297], generator=torch.Generator().manual_seed(1))
train_loader = DataLoader(train_set, batch_size=32, shuffle=True)
X_valid, y_valid = X[valid_set.indices], y[valid_set.indices]


def train(with_schedule, n_epochs=10):
    torch.manual_seed(42)
    model = nn.Sequential(nn.Flatten(), nn.Linear(64, 100), nn.ReLU(), nn.Linear(100, 50), nn.ReLU(), nn.Linear(50, 10))
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    scheduler = None
    if with_schedule:
        scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=n_epochs)
    for epoch in range(n_epochs):
        learning_rate = optimizer.param_groups[0]["lr"]
        model.train()
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()
        if scheduler is not None:
            scheduler.step()
        model.eval()
        with torch.no_grad():
            accuracy = (model(X_valid).argmax(dim=1) == y_valid).float().mean().item()
        print(epoch + 1, round(learning_rate, 4), round(accuracy, 3))


print("constant")
train(with_schedule=False)
print("cosine")
train(with_schedule=True)
```

Ze stałym współczynnikiem uczenia ostatnie pięć epok skacze między 94,6% a 97,3%, a trening kończy się akurat na najgorszej z nich. Z harmonogramem kroki maleją, gdy sieć jest już blisko, i ostatnie pięć epok mieści się między 96,6% a 97,3%.

W `optimizer.param_groups[0]["lr"]` optymalizator trzyma swój współczynnik uczenia. Jego ustawienia są w liście słowników, po jednym dla każdej grupy parametrów, a tutaj grupa jest jedna. Są też inne harmonogramy: `StepLR(optimizer, step_size=3, gamma=0.5)` zmniejsza współczynnik uczenia o połowę co 3 epoki, a `ExponentialLR(optimizer, gamma=0.9)` mnoży go przez 0,9 po każdej epoce. Którykolwiek to jest, kolejność w pętli to `optimizer.step()` dla każdej porcji, a potem `scheduler.step()`, gdy epoka się skończy.

## Zanik wag

Żeby zobaczyć, jak sieć uczy się na pamięć, daj jej mniej do nauki: 200 z 1500 obrazów treningowych, przez 100 epok. Sieć ma 12 060 parametrów, aż nadto, żeby nauczyć się 200 obrazów na pamięć. To [nadmierne dopasowanie](../04-foundations/04-neural-networks/03-training.pl.md#nadmierne-dopasowanie-i-walidacja) z rozdziału o sieciach neuronowych, który przerywał trening wcześniej albo brał mniejszą sieć. PyTorch ma wbudowane dwa kolejne lekarstwa i oba są rodzajami **regularyzacji**: wszystkiego, co sprawia, że model mniej ściśle dopasowuje się do danych treningowych, a dzięki temu lepiej radzi sobie z nowymi.

Sieć, która zapamiętuje pojedyncze obrazy, potrzebuje dużych wag, przez które jej odpowiedzi skaczą przy małych zmianach obrazu. **Zanik wag** (ang. weight decay) ciągnie każdą wagę w stronę 0 w każdym kroku: z `weight_decay=0.5` krok odejmuje też współczynnik uczenia razy 0,5 razy samą wagę. To [dodatkowa kara za duże wagi](../04-foundations/03-logistic-regression/03-training.pl.md#gdy-grupy-się-nie-nakładają) z regresji logistycznej, jako ustawienie optymalizatora. Oto dwie wagi, od których strata nie zależy, więc jej nachylenie względem nich to 0:

```python run
import torch

w = torch.tensor([1.0, -2.0], requires_grad=True)
optimizer = torch.optim.SGD([w], lr=0.1, weight_decay=0.5)

for step in range(3):
    optimizer.zero_grad()
    loss = (w * 0.0).sum()
    loss.backward()
    optimizer.step()
    print(step + 1, [round(number, 4) for number in w.tolist()])
```

Każdy krok zabiera obu wagom 0,1 × 0,5 = 5%, niezależnie od ich znaku. Wagę, której dane potrzebują, trzymają na miejscu nachylenia straty, a ta, której nie potrzebują, zanika.

Z Adamem zanik wag nazywa się `AdamW`. Odejmuje on zanik wprost od wag, tak jak wyżej. `Adam(..., weight_decay=...)` dodaje zamiast tego ciągnięcie do nachylenia, a Adam dzieli je potem przez wielkość nachyleń danego parametru, więc każdy parametr zanika we własnym tempie. `AdamW` to optymalizator, którym trenuje się większość dzisiejszych sieci. Oto mały zbiór treningowy bez zaniku i z nim. Kolumny to epoka, strata na 200 obrazach treningowych i strata na obrazach walidacyjnych:

```python run
import torch
import torch.nn as nn
from sklearn.datasets import load_digits
from torch.utils.data import DataLoader, TensorDataset, random_split

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)
train_set, valid_set = random_split(TensorDataset(X, y), [1500, 297], generator=torch.Generator().manual_seed(1))
X_train, y_train = X[train_set.indices[:200]], y[train_set.indices[:200]]
X_valid, y_valid = X[valid_set.indices], y[valid_set.indices]
train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)
criterion = nn.CrossEntropyLoss()


def train(weight_decay):
    torch.manual_seed(42)
    model = nn.Sequential(nn.Flatten(), nn.Linear(64, 100), nn.ReLU(), nn.Linear(100, 50), nn.ReLU(), nn.Linear(50, 10))
    optimizer = torch.optim.AdamW(model.parameters(), lr=0.01, weight_decay=weight_decay)
    for epoch in range(100):
        model.train()
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()
        if epoch + 1 in [10, 30, 100]:
            model.eval()
            with torch.no_grad():
                train_loss = criterion(model(X_train), y_train).item()
                valid_loss = criterion(model(X_valid), y_valid).item()
            print(epoch + 1, round(train_loss, 3), round(valid_loss, 3))
    with torch.no_grad():
        accuracy = (model(X_valid).argmax(dim=1) == y_valid).float().mean().item()
        size = sum((parameter ** 2).sum().item() for parameter in model.parameters())
    print("accuracy", round(accuracy, 3), "weights", round(size))


print("no weight decay")
train(weight_decay=0.0)
print("weight decay 0.1")
train(weight_decay=0.1)
```

Bez zaniku, z którym `AdamW` jest zwykłym Adamem, strata na obrazach treningowych spada do 0,001: sieć zna je na pamięć. Tymczasem jej strata na obrazach walidacyjnych rośnie, z 0,39 do 0,55. Z zanikiem wagi zostają mniejsze: kwadraty wszystkich liczb sieci sumują się do 218, a nie do 332. Strata treningowa nie spada aż tak nisko, a strata walidacyjna trzyma się w okolicy 0,37.

Dokładność prawie się nie różni: 91,6% i 91,9%. Strata pokazuje nadmierne dopasowanie wcześniej niż dokładność, bo liczy też to, jak bardzo sieć jest pewna, a sieć, która uczy się na pamięć, jest coraz pewniejsza swoich błędnych odpowiedzi.

## Dropout

**Dropout** utrudnia uczenie się na pamięć w inny sposób. Podczas treningu warstwa `nn.Dropout(p)` ustawia każdą z przechodzących przez nią liczb na 0 z prawdopodobieństwem `p`, w każdym kroku inne, a resztę mnoży przez $1 / (1 - p)$, żeby sumowały się mniej więcej do tego samego co przedtem. Sieć nie może liczyć na to, że któraś konkretna liczba ukryta będzie na miejscu, więc musi rozłożyć to, co wie, na wiele z nich. Gdy sieć jest używana, nic nie jest zerowane:

```python run
import torch
import torch.nn as nn

torch.manual_seed(42)
dropout = nn.Dropout(p=0.5)
x = torch.ones(10)

print(dropout.training)
print(dropout(x))
print(dropout(x))

dropout.eval()
print(dropout.training)
print(dropout(x))
```

W trybie treningu każda z dziesięciu jedynek miała równe szanse stać się 0 i za każdym razem stały się nim inne. Reszta stała się 2. Po `eval()` warstwa przekazuje swoje wejście bez zmian. Do tego właśnie służą `model.train()` i `model.eval()` od lekcji [Porcje danych i ocena](06-batches-and-evaluation.pl.md#epoka): do tej pory niczego nie zmieniały. Z dropoutem zapomniane `model.eval()` oznacza predykcje, które zmieniają się od wywołania do wywołania, każda zrobiona bez połowy sieci.

> [!NOTE]
> To, które liczby są zerowane, jest losowane, a ta strona losuje je po swojemu. Dlatego z dropoutem, nawet po `torch.manual_seed`, twój komputer nie da liczb z tej strony: wyżej zerowane są inne liczby, a straty poniżej wychodzą trochę inne. Wszystko bez dropoutu jest w obu miejscach takie samo, jak dotąd.

Oto jeszcze raz mały zbiór treningowy, z warstwą dropoutu po każdej warstwie ukrytej:

```python run
import torch
import torch.nn as nn
from sklearn.datasets import load_digits
from torch.utils.data import DataLoader, TensorDataset, random_split

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)
train_set, valid_set = random_split(TensorDataset(X, y), [1500, 297], generator=torch.Generator().manual_seed(1))
X_train, y_train = X[train_set.indices[:200]], y[train_set.indices[:200]]
X_valid, y_valid = X[valid_set.indices], y[valid_set.indices]
train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)
criterion = nn.CrossEntropyLoss()

torch.manual_seed(42)
model = nn.Sequential(
    nn.Flatten(),
    nn.Linear(64, 100),
    nn.ReLU(),
    nn.Dropout(0.5),
    nn.Linear(100, 50),
    nn.ReLU(),
    nn.Dropout(0.5),
    nn.Linear(50, 10),
)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

for epoch in range(100):
    model.train()
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        criterion(model(X_batch), y_batch).backward()
        optimizer.step()
    if epoch + 1 in [10, 30, 100]:
        model.eval()
        with torch.no_grad():
            train_loss = criterion(model(X_train), y_train).item()
            valid_loss = criterion(model(X_valid), y_valid).item()
        print(epoch + 1, round(train_loss, 3), round(valid_loss, 3))

with torch.no_grad():
    accuracy = (model(X_valid).argmax(dim=1) == y_valid).float().mean().item()
print("accuracy", round(accuracy, 3))
```

Na tej stronie strata na obrazach walidacyjnych kończy na 0,25, mniej niż połowie z 0,55 bez dropoutu, a sieć czyta dobrze 93,6% z nich, podczas gdy tamte dwie czytają poniżej 92%. Obrazów treningowych i tak się nauczyła: ich strata to 0,005, zmierzona z wyłączonym dropoutem, bo najpierw idzie `model.eval()`.

Zaniku wag i dropoutu można używać razem i żadne z nich nie zastępuje najstarszego lekarstwa, czyli większej liczby obrazów: bez żadnego z nich ta sama sieć czytała dobrze 97% obrazów walidacyjnych w części [Współczynnik uczenia, który się zmienia](#współczynnik-uczenia-który-się-zmienia), gdzie miała do nauki wszystkie 1500.

## Podsumowanie

- Pęd trzyma prędkość dla każdego parametru, więc kroki w tym samym kierunku się sumują: `torch.optim.SGD(..., momentum=0.9)`.
- Adam daje każdemu parametrowi krok o własnej wielkości, ze średniej jego nachyleń i średniej ich kwadratów, więc wymaga mniej strojenia: `torch.optim.Adam`, z domyślnym współczynnikiem uczenia 0,001.
- Harmonogram zmienia współczynnik uczenia w trakcie treningu. Jego `step()` wywołuje się raz na epokę, po krokach optymalizatora.
- Regularyzacja sprawia, że model mniej ściśle dopasowuje się do danych treningowych. Zanik wag ciągnie każdą wagę w stronę 0 w każdym kroku: `weight_decay=`, a z Adamem `AdamW`.
- `nn.Dropout(p)` losowo ustawia liczby na 0 podczas treningu i nic nie robi w trybie oceny. `model.train()` i `model.eval()` przełączają między jednym a drugim.
- Nadmierne dopasowanie widać w stracie walidacyjnej, która rośnie, gdy strata treningowa wciąż spada, zanim widać je w dokładności.

## Sprawdź się

<details>
<summary>SGD z <code>lr=0.01</code> i <code>momentum=0.9</code> trafia w każdym kroku na to samo nachylenie. Jak duże robią się jego kroki?</summary>

Dziesięć razy większe od zwykłego kroku. Każda prędkość to 0,9 poprzedniej plus nachylenie, co rośnie w stronę nachylenia podzielonego przez $1 - 0{,}9$, czyli dziesięciu nachyleń. Kroki zbliżają się do kroków zwykłego SGD ze współczynnikiem uczenia 0,1.

</details>

<details>
<summary>Nachylenie jednego parametru to zawsze 100, a drugiego zawsze 0,01. O ile Adam przesunął każdy z nich po 3 krokach z <code>lr=0.1</code>?</summary>

Oba o mniej więcej 0,3. Adam dzieli średnie nachylenie parametru przez zwykłą wielkość jego nachyleń, co dla stałego nachylenia dowolnej wielkości daje mniej więcej 1, więc każdy krok przesuwa parametr o mniej więcej współczynnik uczenia.

</details>

<details>
<summary>Sieć z dropoutem daje dla tego samego obrazu inne predykcje za każdym razem, gdy się ją wywoła. O czym zapomniano?</summary>

O `model.eval()`. W trybie treningu warstwa dropoutu przy każdym wywołaniu ustawia na 0 inne liczby, więc odpowiedzi się zmieniają. Tryb oceny wyłącza zerowanie i sieć odpowiada wszystkimi swoimi liczbami ukrytymi.

</details>

## Twoja kolej

W ćwiczeniu [Porównaj optymalizatory](../../exercises/05-pytorch/11-regularization-and-optimizers/01-compare-optimizers/task.pl.md) utworzysz optymalizatory na podstawie nazw i porównasz je uczciwie, od tych samych wag początkowych. W ćwiczeniu [Dropout i zanik wag](../../exercises/05-pytorch/11-regularization-and-optimizers/02-dropout-and-weight-decay/task.pl.md) zbudujesz sieć z dropoutem, dasz jej optymalizator z zanikiem wag i będziesz przewidywać z wyłączonym dropoutem.
