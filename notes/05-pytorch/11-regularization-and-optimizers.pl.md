---
description: Przyspiesz trening za pomocą momentum i Adama, zmniejszaj współczynnik uczenia w trakcie treningu, a zanik wag i dropout nie pozwolą sieci uczyć się obrazów treningowych na pamięć.
---

# Regularyzacja i optymalizatory

Sieć z lekcji [Klasyfikacja obrazów](09-classifying-images.pl.md) była trenowana zwykłym SGD i nic nie powstrzymywało jej przed uczeniem się obrazów treningowych na pamięć. Prawdziwy trening prawie nigdy tak nie wygląda. Ta lekcja pokazuje to, z czego korzysta niemal każdy trening: optymalizatory, które robią lepsze kroki, współczynnik uczenia zmieniający się w trakcie treningu i dwa sposoby na to, żeby sieci trudniej było uczyć się na pamięć, dzięki czemu lepiej radzi sobie z obrazami, których nie widziała. Wszystko to wypróbujesz na cyfrach.

## Momentum

Zwykłe SGD robi krok równy współczynnikowi uczenia razy nachylenie i od razu o nim zapomina. Przy **momentum** (czyli pędzie) optymalizator pamięta dla każdego parametru jego **prędkość**. W każdym kroku prędkość to 0,9 jej poprzedniej wartości plus nowe nachylenie, a parametr przesuwa się o współczynnik uczenia razy prędkość. Kroki w tę samą stronę się sumują, jak u kuli, która, tocząc się z górki, nabiera rozpędu.

Oto strata, której nachylenie jest wszędzie takie samo, żeby łatwo było śledzić kroki: `-w` ma nachylenie −1 niezależnie od `w`, więc „w dół” oznacza zawsze w prawo. Optymalizator przyjmuje dowolną listę tensorów do zmieniania, nie tylko parametry modelu:

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

Zwykłe SGD przesuwałoby `w` o 0,1 w każdym kroku. Z momentum 0,9 kolejne kroki mają długość 0,1, 0,19, 0,271, 0,3439 i 0,4095: każdy to 0,9 poprzedniego plus nowe 0,1. Zbliżają się do 1, czyli dziesięciokrotności zwykłego kroku, bo $0{,}1 / (1 - 0{,}9) = 1$. Gdy więc nachylenia uparcie wskazują ten sam kierunek, momentum 0,9 działa jak dziesięć razy większy współczynnik uczenia. Gdy wskazują to w jedną, to w drugą stronę, jak przy krokach, które przeskakują minimum, ich wkłady w prędkość się znoszą, a większy współczynnik uczenia by tego nie zrobił.

## Adam

Momentum wciąż używa jednego współczynnika uczenia dla wszystkich parametrów. Tymczasem nachylenia parametrów sieci bywają bardzo różnej wielkości, a współczynnik dobry dla parametrów o dużych nachyleniach ledwie rusza te o małych. **Adam** daje każdemu parametrowi krok o jego własnej długości. Dla każdego parametru śledzi dwie średnie kroczące: nachyleń, jak momentum, i ich kwadratów. Krok to pierwsza średnia podzielona przez pierwiastek z drugiej, pomnożona przez współczynnik uczenia. Zarówno stale duże, jak i stale małe nachylenie daje w tym ilorazie mniej więcej 1:

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

Pierwszy parametr ma w każdym kroku nachylenie 100, a drugi 0,01. Po 3 krokach SGD przesunęło pierwszy o 30, a drugi o 0,003, czyli dziesięć tysięcy razy mniej. Adam przesunął oba o 0,3, w każdym kroku o współczynnik uczenia: dla Adama liczy się to, w którą stronę wskazuje nachylenie i jak konsekwentnie, a nie jego wielkość. Dzięki temu jest dużo mniej wrażliwy na wybór współczynnika uczenia, a jego domyślna wartość, 0,001, sprawdza się w wielu sieciach bez żadnego strojenia.

## Na cyfrach

Oto trzy optymalizatory trenujące sieć z lekcji [Klasyfikacja obrazów](09-classifying-images.pl.md#trening), z tym samym współczynnikiem uczenia 0,01, tymi samymi wagami początkowymi i tymi samymi porcjami. `train` przyjmuje klasę optymalizatora i jego ustawienia, a zwraca dokładność na obrazach walidacyjnych po każdej z 5 epok. `**settings` zbiera ustawienia przekazane jako argumenty nazwane, takie jak `lr=0.01`, w słownik i przekazuje je dalej optymalizatorowi, tak jak `**inputs` przekazywało wejścia modelowi w lekcji [Własne moduły](08-your-own-modules.pl.md#wejścia-z-nazwami):

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

Po 5 epokach dokładność na obrazach walidacyjnych wynosi 24% przy zwykłym SGD, 88% przy SGD z momentum i 96% przy Adamie. Nie znaczy to, że SGD jest gorszym optymalizatorem: ze współczynnikiem uczenia 0,1 osiągnęło w lekcji [Klasyfikacja obrazów](09-classifying-images.pl.md#trening) 94% po 10 epokach, a SGD z momentum przy 0,01 dochodzi w 10 epokach do 95%, co zgadza się z dziesięciokrotnym przyspieszeniem z pierwszej części. SGD wymaga dobrania współczynnika uczenia, a kroki Adama same mają mniej więcej właściwą długość.

## Zmienny współczynnik uczenia

Duży współczynnik uczenia szybko doprowadza sieć w pobliże dobrego miejsca, ale potem sieć skacze wokół niego. Mały pozwala jej się ustabilizować, tylko że dojście do celu trwa w nieskończoność. **Harmonogram** (ang. schedule) zaczyna od dużego współczynnika i kończy na małym. Harmonogramy są w `torch.optim.lr_scheduler`: tworzy się je dla optymalizatora, a ich `step()`, wywoływane raz na końcu każdej epoki, ustawia współczynnik uczenia optymalizatora na następną epokę.

`CosineAnnealingLR` zmniejsza współczynnik uczenia wzdłuż połowy okresu cosinusa, od wartości początkowej do 0 w ciągu `T_max` epok: najpierw powoli, najszybciej w połowie i znów powoli pod koniec. Oto Adam ze stałym współczynnikiem 0,01 i z harmonogramem. Kolumny to epoka, współczynnik uczenia w tej epoce i dokładność po niej:

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

Przy stałym współczynniku uczenia dokładność w ostatnich pięciu epokach skacze między 94,6% a 97,3%, a trening akurat kończy się na najgorszym z tych wyników. Z harmonogramem kroki maleją, gdy sieć zbliża się do celu, i w ostatnich pięciu epokach dokładność mieści się między 96,6% a 97,3%.

`optimizer.param_groups[0]["lr"]` to miejsce, w którym optymalizator trzyma współczynnik uczenia. Ustawienia optymalizatora są zapisane na liście słowników, po jednym dla każdej grupy parametrów, a tutaj jest tylko jedna grupa. Harmonogramów jest więcej: `StepLR(optimizer, step_size=3, gamma=0.5)` co 3 epoki zmniejsza współczynnik uczenia o połowę, a `ExponentialLR(optimizer, gamma=0.9)` po każdej epoce mnoży go przez 0,9. Niezależnie od harmonogramu kolejność w pętli jest ta sama: `optimizer.step()` dla każdej porcji, a `scheduler.step()` po zakończeniu epoki.

## Zanik wag

Żeby zobaczyć, jak sieć uczy się na pamięć, wystarczy dać jej mniej danych: 200 z 1500 obrazów treningowych i 100 epok. Sieć ma 12 060 parametrów, aż nadto, żeby zapamiętać 200 obrazów. To [nadmierne dopasowanie](../04-foundations/04-neural-networks/03-training.pl.md#nadmierne-dopasowanie-i-walidacja) z rozdziału o sieciach neuronowych, gdzie lekarstwem było wcześniejsze zatrzymanie treningu albo mniejsza sieć. PyTorch ma wbudowane jeszcze dwa lekarstwa i oba są formami **regularyzacji**, czyli wszystkiego, co sprawia, że model słabiej dopasowuje się do danych treningowych, za to lepiej radzi sobie z nowymi.

Sieć, która zapamiętuje pojedyncze obrazy, potrzebuje dużych wag, przez które jej odpowiedzi gwałtownie zmieniają się przy drobnych zmianach obrazu. **Zanik wag** (ang. weight decay) w każdym kroku ściąga każdą wagę w stronę 0: przy `weight_decay=0.5` krok dodatkowo odejmuje od wagi współczynnik uczenia razy 0,5 razy samą wagę. To [dodatkowa kara za duże wagi](../04-foundations/03-logistic-regression/03-training.pl.md#gdy-grupy-się-nie-nakładają) z regresji logistycznej, tyle że w postaci ustawienia optymalizatora. Oto dwie wagi, od których strata nie zależy, więc jej nachylenie względem nich wynosi 0:

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

Każdy krok zmniejsza obie wagi o 0,1 × 0,5 = 5%, niezależnie od ich znaku. Wagę, której potrzebują dane, utrzymują na miejscu nachylenia straty, a ta niepotrzebna stopniowo zanika.

Dla Adama zanik wag zapewnia `AdamW`, który odejmuje go bezpośrednio od wag, tak jak powyżej. `Adam(..., weight_decay=...)` dodaje go natomiast do nachylenia, a Adam dzieli go potem przez typową wielkość nachyleń danego parametru, więc każdy parametr zanika we własnym tempie. Większość dzisiejszych sieci trenuje się właśnie z `AdamW`. Oto trening na małym zbiorze bez zaniku wag i z zanikiem. Kolumny to epoka, strata na 200 obrazach treningowych i strata na obrazach walidacyjnych:

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

Bez zaniku wag, czyli gdy `AdamW` działa jak zwykły Adam, strata na obrazach treningowych spada do 0,001: sieć zna je na pamięć. W tym samym czasie jej strata na obrazach walidacyjnych rośnie z 0,39 do 0,55. Z zanikiem wagi sieci pozostają mniejsze: suma kwadratów wszystkich jej parametrów wynosi 218, a nie 332. Strata treningowa nie spada aż tak nisko, a walidacyjna trzyma się w okolicy 0,37.

Dokładność prawie się nie różni: 91,6% i 91,9%. Nadmierne dopasowanie widać w stracie wcześniej niż w dokładności, bo strata uwzględnia też to, jak pewna jest sieć, a sieć, która uczy się na pamięć, jest coraz pewniejsza także swoich błędnych odpowiedzi.

## Dropout

**Dropout** utrudnia uczenie się na pamięć w inny sposób. Podczas treningu warstwa `nn.Dropout(p)` zeruje każdą przechodzącą przez nią liczbę z prawdopodobieństwem `p`, za każdym razem losując inne, a pozostałe mnoży przez $1 / (1 - p)$, żeby w sumie dawały mniej więcej tyle co wcześniej. Sieć nie może polegać na żadnej konkretnej liczbie ukrytej, więc musi rozłożyć to, czego się nauczyła, na wiele z nich. Gdy sieć jest używana, nic nie jest zerowane:

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

W trybie treningowym każda z dziesięciu jedynek miała równe szanse na wyzerowanie i za każdym razem wyzerowane zostały inne. Pozostałe zamieniły się w dwójki. Po `eval()` warstwa przepuszcza wejście bez zmian. Właśnie do tego służą `model.train()` i `model.eval()`, obecne w kodzie od lekcji [Porcje danych i ocena](06-batches-and-evaluation.pl.md#epoka): do tej pory niczego nie zmieniały. Z dropoutem zapomniane `model.eval()` oznacza predykcje, które zmieniają się z wywołania na wywołanie, bo za każdym razem brakuje połowy sieci.

> [!NOTE]
> To, które liczby zostaną wyzerowane, jest losowane, a ta strona losuje je po swojemu. Dlatego przy dropoucie, nawet po `torch.manual_seed`, na twoim komputerze wyjdą inne liczby niż na tej stronie: wyzerowane zostaną inne liczby, a straty poniżej będą trochę inne. Wszystko, co nie używa dropoutu, daje w obu miejscach te same wyniki, tak jak dotąd.

Oto znowu trening na małym zbiorze, tym razem z warstwą dropoutu po każdej warstwie ukrytej:

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

Na tej stronie strata na obrazach walidacyjnych kończy się na 0,25, czyli niecałej połowie straty 0,55 bez dropoutu, a sieć rozpoznaje 93,6% tych obrazów, podczas gdy dwie poprzednie sieci poniżej 92%. Obrazy treningowe i tak zna na pamięć: ich strata wynosi 0,005, mierzona przy wyłączonym dropoucie, bo wcześniej wywołano `model.eval()`.

Zanik wag i dropout można stosować razem i żadne z nich nie zastępuje najstarszego lekarstwa, czyli większej liczby obrazów: bez obu ta sama sieć rozpoznawała 97% obrazów walidacyjnych w części [Zmienny współczynnik uczenia](#zmienny-współczynnik-uczenia), gdy miała do nauki wszystkie 1500.

## Podsumowanie

- Momentum utrzymuje dla każdego parametru prędkość, dzięki czemu kroki w tę samą stronę się sumują: `torch.optim.SGD(..., momentum=0.9)`.
- Adam daje każdemu parametrowi krok o własnej długości, liczony ze średniej jego nachyleń i średniej ich kwadratów, więc wymaga mniej strojenia: `torch.optim.Adam`, z domyślnym współczynnikiem uczenia 0,001.
- Harmonogram zmienia współczynnik uczenia w trakcie treningu. Jego `step()` wywołuje się raz na epokę, po krokach optymalizatora.
- Regularyzacja sprawia, że model słabiej dopasowuje się do danych treningowych. Zanik wag ściąga w każdym kroku każdą wagę w stronę 0: `weight_decay=`, a w przypadku Adama `AdamW`.
- `nn.Dropout(p)` losowo zeruje liczby podczas treningu i nic nie robi w trybie oceny. Między tymi trybami przełączają `model.train()` i `model.eval()`.
- Nadmierne dopasowanie widać najpierw w stracie walidacyjnej, która rośnie, choć strata treningowa dalej spada, a dopiero potem w dokładności.

## Sprawdź się

<details>
<summary>SGD z <code>lr=0.01</code> i <code>momentum=0.9</code> dostaje w każdym kroku to samo nachylenie. Jak długie robią się jego kroki?</summary>

Dziesięć razy dłuższe niż zwykły krok. Prędkość to za każdym razem 0,9 poprzedniej plus nachylenie, więc zbliża się do nachylenia podzielonego przez $1 - 0{,}9$, czyli dziesięciu nachyleń. Kroki zbliżają się do kroków zwykłego SGD ze współczynnikiem uczenia 0,1.

</details>

<details>
<summary>Nachylenie jednego parametru wynosi zawsze 100, a drugiego zawsze 0,01. O ile Adam przesunie każdy z nich po 3 krokach z <code>lr=0.1</code>?</summary>

Oba mniej więcej o 0,3. Adam dzieli średnie nachylenie parametru przez typową wielkość jego nachyleń, co dla stałego nachylenia dowolnej wielkości daje około 1, więc każdy krok przesuwa parametr mniej więcej o współczynnik uczenia.

</details>

<details>
<summary>Sieć z dropoutem przy każdym wywołaniu daje inne predykcje dla tego samego obrazu. O czym zapomniano?</summary>

O `model.eval()`. W trybie treningowym warstwa dropoutu przy każdym wywołaniu zeruje inne liczby, więc odpowiedzi się zmieniają. Tryb oceny wyłącza zerowanie i sieć odpowiada, korzystając ze wszystkich swoich liczb ukrytych.

</details>

## Twoja kolej

W ćwiczeniu [Porównaj optymalizatory](../../exercises/05-pytorch/11-regularization-and-optimizers/01-compare-optimizers/task.pl.md) utworzysz optymalizatory na podstawie ich nazw i porównasz je uczciwie, startując z tych samych wag. W ćwiczeniu [Dropout i zanik wag](../../exercises/05-pytorch/11-regularization-and-optimizers/02-dropout-and-weight-decay/task.pl.md) zbudujesz sieć z dropoutem, dasz jej optymalizator z zanikiem wag i sprawisz, że będzie przewidywać przy wyłączonym dropoucie.
