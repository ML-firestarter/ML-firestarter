---
description: Atakuj wieloma małymi krokami zamiast jednym, a po każdym z nich rzutuj obraz z powrotem do kuli ε. PGD, losowy start, wielkość i liczba kroków oraz trening na zaatakowanych obrazach.
---

# PGD

[FGSM](01-fooling-a-network.pl.md) mierzy nachylenia raz, przy samym obrazie, i idzie za nimi aż do brzegu kuli ε. To szybkie, ale zostawia nieoszukane obrazy, które dałoby się oszukać. Ta lekcja robi zamiast tego wiele małych kroków, przed każdym mierzy nachylenia od nowa i sprowadza obraz z powrotem do kuli, ilekroć krok z niej wyjdzie. To **rzutowany spadek gradientu** (ang. projected gradient descent), w skrócie **PGD**, i to nim mierzy się odporność sieci.

## Nachylenia, które się zmieniają

Oto obraz, z którym FGSM sobie nie radzi: obraz walidacyjny numer 207, kolejne 0. Przykład bierze nachylenia przy obrazie, robi krok FGSM z ε = 0,1 i bierze nachylenia jeszcze raz tam, gdzie krok się kończy. Pierwsze wiersze to te z [każdego przykładu w tym rozdziale](01-fooling-a-network.pl.md#sieć):

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


def slope_at(pictures, labels):
    pictures = pictures.clone().requires_grad_()
    return torch.autograd.grad(criterion(model(pictures), labels), pictures)[0]


original, label = X_valid[207:208], y_valid[207:208]
epsilon = 0.1

before = slope_at(original, label)
attacked = (original + epsilon * before.sign()).clamp(0, 1)
after = slope_at(attacked, label)

with torch.no_grad():
    print(label, model(attacked).argmax(dim=1))
    print(round(criterion(model(original), label).item(), 3), round(criterion(model(attacked), label).item(), 3))
print((before.sign() != after.sign()).sum())
```

Strata wzrosła z 0,012 do 1,187, a sieć nadal czyta 0. Ostatni wiersz liczy piksele, których nachylenie ma na końcu kroku inny znak niż na jego początku: 10 z 64. Pod koniec kroku tych dziesięć pikseli było pchanych w złą stronę.

Nachylenia się zmieniają, bo sieć nie jest prostą. Jej ReLU włączają się i wyłączają, gdy obraz się przesuwa, a każde przełączenie zmienia, przez które wagi działają piksele. Jeden pomiar FGSM jest trafny tylko blisko obrazu.

## Małe kroki

Zrób więc mały krok, o wielkości nazywanej α, alfa, i zmierz jeszcze raz. Cztery kroki po 0,025 mogą zanieść piksel tak daleko jak jeden krok o 0,1, a każdy z nich idzie za nachyleniami miejsca, w którym obraz akurat jest. Kolumny to krok, strata po nim i to, co czyta sieć:

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


def slope_at(pictures, labels):
    pictures = pictures.clone().requires_grad_()
    return torch.autograd.grad(criterion(model(pictures), labels), pictures)[0]


original, label = X_valid[207:208], y_valid[207:208]
alpha = 0.025

attacked = original.clone()
for step in range(4):
    slope = slope_at(attacked, label)
    attacked = (attacked + alpha * slope.sign()).clamp(0, 1)
    with torch.no_grad():
        print(step + 1, round(criterion(model(attacked), label).item(), 3), model(attacked).argmax(dim=1))
print((attacked - original).abs().max())
```

Po czwartym kroku strata wynosi 1,424, więcej niż 1,187 z FGSM, a sieć czyta 2. Żaden piksel nie jest dalej niż 0,1 od miejsca, w którym był, więc ten obraz leży w tej samej kuli ε co obraz z FGSM. Małe kroki znalazły w niej lepsze miejsce.

## Z powrotem do kuli

Więcej kroków mogłoby znaleźć jeszcze lepsze miejsce, ale piąty krok o 0,025 zaniósłby niektóre piksele 0,125 od miejsca, z którego wyszły, poza kulę. Dlatego po każdym kroku obraz jest **rzutowany** z powrotem: zastępuje go najbliższy mu obraz z wnętrza kuli. W tej kuli najbliższy obraz znajduje się piksel po pikselu. Piksel, który jest o więcej niż ε powyżej swojego początku, trafia dokładnie ε powyżej, piksel o więcej niż ε poniżej trafia dokładnie ε poniżej, a pozostałe zostają, jak są. To `clamp` różnic:

```python run
import torch


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


original = torch.tensor([0.2, 0.5, 0.95, 0.0])
moved = torch.tensor([0.35, 0.45, 1.2, -0.3])
print(moved - original)

projected = project(moved, original, 0.1)
print(projected)
print(projected - original)
```

Pierwszy piksel był 0,15 powyżej swojego początku i wraca na 0,1 powyżej, czyli na 0,3. Drugi był w kuli i zostaje tam, gdzie jest. Trzeci wraca na 0,1 powyżej 0,95, czyli na 1,05, a ostatnie `clamp(0, 1)` robi z niego poprawny piksel, równy 1. Czwarty wraca na −0,1, a potem na 0. Wszystkie cztery różnice są teraz między −0,1 a 0,1.

## Rzutowany spadek gradientu

Z rzutem po każdym kroku atak może zrobić tyle kroków, ile chce:

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
X_valid, y_valid = X[valid_set.indices], y[valid_set.indices]

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


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


def pgd(model, X, y, epsilon, alpha, steps):
    X_adv = X.clone()
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


original, label = X_valid[207:208], y_valid[207:208]
for steps in [4, 10, 20]:
    attacked = pgd(model, original, label, 0.1, 0.025, steps)
    with torch.no_grad():
        loss = criterion(model(attacked), label)
        probabilities = F.softmax(model(attacked), dim=1)
    print(steps, round(loss.item(), 3), probabilities.argmax(dim=1), round(probabilities.max().item(), 2), (attacked - original).abs().max())
```

Każdy obrót pętli oznacza obraz, bierze nachylenia tam, gdzie obraz jest, robi krok zgodnie z ich znakami i rzutuje wynik do kuli wokół `X`, obrazu, od którego atak zaczął. `X_adv.detach() + ...` robi w każdym kroku nowy, nieoznaczony tensor, tak jak `changed` w części [Nachylenie względem wejścia](../05-pytorch/02-autograd.pl.md#nachylenie-względem-wejścia), więc nic nie zapisuje się z kroku na krok.

Po 4 krokach strata to wcześniejsze 1,424. Po 10 to 1,813, a sieć czyta 2 z prawdopodobieństwem 0,60. Dziesięć kolejnych kroków nie znajduje już nic więcej, a obraz nigdy nie wychodzi z kuli: największa zmiana to za każdym razem 0,1.

Nazwa mówi o spadku, choć atak się wspina. To nazwa ogólnej metody, kroków wzdłuż nachyleń z rzutem po każdym z nich, w którąkolwiek stronę idą kroki.

## Losowy start

Pętla powyżej zaczyna od samego obrazu. PGD zwykle zaczyna gdzie indziej: od losowego obrazu w kuli. `torch.rand_like(X)` daje losowe liczby od 0 do 1 w kształcie `X`, więc `torch.rand_like(X) * 2 - 1` idzie od −1 do 1, a razy ε to losowe przesunięcie w obrębie kuli dla każdego piksela.

Są ku temu dwa powody. Przy samym obrazie nachylenia mogą być kiepskimi przewodnikami albo wynosić 0, jak będzie w lekcji [Cele i normy](03-targets-and-norms.pl.md#atak-na-embedding). Do tego każdy start może skończyć się na innym obrazie, więc atak można uruchomić kilka razy i liczyć obraz jako oszukany, jeśli oszukało go którekolwiek z uruchomień. Oto PGD z 8 **ponownymi startami** (ang. restarts) na wszystkich obrazach walidacyjnych. Kolumny to numer startu, dokładność na jego obrazach i ułamek obrazów, których nie oszukał dotąd żaden start:

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


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


def pgd(model, X, y, epsilon, alpha, steps, random_start=False):
    X_adv = X.clone()
    if random_start:
        X_adv = project(X + (torch.rand_like(X) * 2 - 1) * epsilon, X, epsilon)
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


torch.manual_seed(0)
never_fooled = torch.ones(len(X_valid))
for restart in range(8):
    X_adv = pgd(model, X_valid, y_valid, 0.1, 0.025, 20, random_start=True)
    with torch.no_grad():
        right = (model(X_adv).argmax(dim=1) == y_valid).float()
    never_fooled = never_fooled * right
    print(restart + 1, round(right.mean().item(), 3), round(never_fooled.mean().item(), 3))
```

Pojedynczy start zostawia sieci od 50,5% do 52,9%. Po wszystkich 8 startach 50,5% obrazów nie zostało oszukanych ani razu, o jeden obraz mniej niż 50,8%, które zostawia PGD zaczynające od samego obrazu. W tej małej sieci start prawie nie ma znaczenia: gdziekolwiek PGD zacznie, oszukuje prawie te same obrazy. Strata dużej sieci ma w kuli wiele szczytów, a start decyduje, na który z nich atak się wspina, dlatego dla dużych sieci losowy start i kilka ponownych startów to część standardowego ataku.

## Wielkość kroku i liczba kroków

PGD ma dwa ustawienia, których FGSM nie ma. Oto dokładność na obrazach walidacyjnych przy ε = 0,1 dla kilku ich wartości, bez losowego startu, żeby wiersze dało się porównać:

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


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


def pgd(model, X, y, epsilon, alpha, steps):
    X_adv = X.clone()
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


def accuracy(model, X, y):
    with torch.no_grad():
        return (model(X).argmax(dim=1) == y).float().mean().item()


for alpha, steps in [(0.1, 1), (0.025, 4), (0.025, 10), (0.025, 20), (0.025, 100), (0.005, 20), (0.1, 20)]:
    X_adv = pgd(model, X_valid, y_valid, 0.1, alpha, steps)
    print(alpha, steps, round(accuracy(model, X_adv, y_valid), 3))
```

Jeden krok o całe ε to FGSM, z jego 55,9%. Przy krokach po 0,025 cztery z nich zostawiają 53,2%, dziesięć 51,5%, a dwadzieścia 50,8%. Sto kroków nie radzi sobie lepiej niż 20: atak znalazł w tej kuli to, co było do znalezienia.

Za małe kroki marnują atak. Dwadzieścia kroków po 0,005 ledwie dochodzi do brzegu kuli i zostawia 52,5%. Za duże kroki tutaj nie szkodzą, 20 kroków o całe ε też zostawia 50,8%, bo rzut trzyma je w kuli. W większych sieciach mogą przeskakiwać z jednej strony kuli na drugą i omijać to, co jest pomiędzy.

Liczba kroków razy α powinna więc dawać sporo więcej niż ε: tyle, żeby przejść przez kulę, i jeszcze kroki na szukanie, gdy już się przez nią przeszło. Częsta reguła kciuka to α = 2,5 ε / liczba kroków. Dla zdjęć typowe ustawienie to ε = 8/255 z α = 2/255 i 10 albo 20 krokami.

## Dokładność a ε

Oto oba ataki na obrazach walidacyjnych, z α równym ćwierci ε i 20 krokami dla PGD. Kolumny to ε, dokładność pod FGSM i dokładność pod PGD:

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


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


def pgd(model, X, y, epsilon, alpha, steps):
    X_adv = X.clone()
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


def accuracy(model, X, y):
    with torch.no_grad():
        return (model(X).argmax(dim=1) == y).float().mean().item()


for epsilon in [0.0, 0.05, 0.1, 0.15, 0.2]:
    X_fgsm = pgd(model, X_valid, y_valid, epsilon, epsilon, 1)
    X_pgd = pgd(model, X_valid, y_valid, epsilon, epsilon / 4, 20)
    print(epsilon, round(accuracy(model, X_fgsm, y_valid), 3), round(accuracy(model, X_pgd, y_valid), 3))
```

PGD nigdy nie jest słabszym z dwóch ataków, a różnica rośnie z ε: przy 0,15 FGSM zostawia 19,9% dobrze przeczytanych obrazów, a PGD 10,4%, mniej więcej o połowę mniej.

Dlatego, gdy podaje się odporność sieci, liczy się atak. Dokładność pod atakiem mówi tylko, że ten atak nie poradził sobie lepiej, więc słaby atak sprawia, że sieć wygląda na bardziej odporną, niż jest. Liczba, której można ufać, to ta z najsilniejszego wypróbowanego ataku, a zaczyna się to od PGD z wystarczającą liczbą kroków.

## Dla chętnych: trening antagonistyczny

Sieć widziała do tej pory tylko obrazy takie, jakie były. **Trening antagonistyczny** (ang. adversarial training) pokazuje jej zaatakowane: każda porcja jest atakowana, zanim sieć się na niej uczy, przez PGD przeciwko sieci takiej, jaka jest w tej chwili. Atak robi tylko kilka kroków, tutaj 5, bo uruchamia się dla każdej porcji. Nie rusza `.grad` parametrów, bo prosi `torch.autograd.grad` o nachylenia względem obrazów i o nic więcej, więc mieści się w środku pętli treningowej:

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
criterion = nn.CrossEntropyLoss()


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


def pgd(model, X, y, epsilon, alpha, steps):
    X_adv = X.clone()
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


def accuracy(model, X, y):
    with torch.no_grad():
        return (model(X).argmax(dim=1) == y).float().mean().item()


def train(adversarial):
    torch.manual_seed(42)
    model = nn.Sequential(nn.Flatten(), nn.Linear(64, 100), nn.ReLU(), nn.Linear(100, 50), nn.ReLU(), nn.Linear(50, 10))
    optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
    for epoch in range(10):
        for X_batch, y_batch in train_loader:
            if adversarial:
                X_batch = pgd(model, X_batch, y_batch, 0.1, 0.025, 5)
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()
    model.eval()
    return model


for adversarial in [False, True]:
    model = train(adversarial)
    X_adv = pgd(model, X_valid, y_valid, 0.1, 0.025, 20)
    print(adversarial, round(accuracy(model, X_valid, y_valid), 3), round(accuracy(model, X_adv, y_valid), 3))
```

Kolumny to to, czy trening był antagonistyczny, dokładność na obrazach walidacyjnych takich, jakie są, i dokładność pod PGD z ε = 0,1, zrobionym przeciwko mierzonej sieci. Zwykła sieć czyta dobrze 94,3% i 50,8%. Sieć wytrenowana na zaatakowanych obrazach czyta pod atakiem 68%. Płaci za to nietkniętymi obrazami, z których czyta dobrze 90,2%, i czasem: każdy krok optymalizatora przychodzi teraz po 5 krokach ataku, więc trening trwa kilka razy dłużej.

Po 20 epokach zamiast 10 czyta dobrze 94,3% nietkniętych obrazów i 75,4% pod atakiem, podczas gdy zwykła sieć, trenowana tak samo długo, czyta 96% i 47,8%. To wciąż daleko od odporności, i to na obrazach z 64 pikseli. Spośród wypróbowanych obron ta trzyma się najlepiej, a uodparnianie sieci za cenę, którą warto zapłacić, to otwarty problem.

## Podsumowanie

- Nachylenia FGSM są trafne tylko blisko obrazu. PGD robi wiele małych kroków o wielkości α, z nowymi nachyleniami przed każdym.
- Po każdym kroku obraz jest rzutowany z powrotem do kuli ε wokół obrazu, od którego atak zaczął: `X + (X_adv - X).clamp(-epsilon, epsilon)`, a potem `clamp(0, 1)`.
- Losowy start wybiera na początek losowy obraz w kuli, a ponowne starty uruchamiają atak z kilku takich obrazów.
- Liczba kroków razy α powinna dawać wyraźnie więcej niż ε. Więcej kroków znajduje więcej, do pewnego momentu.
- Dokładność pod atakiem jest tylko tak dobra jak atak. PGD jest co najmniej tak silne jak FGSM i to nim zwykle się mierzy.
- Trening antagonistyczny atakuje każdą porcję, zanim się na niej uczy. Sieć staje się odporniejsza i trochę gorsza na nietkniętych obrazach.

## Sprawdź się

<details>
<summary>Piksel zaczął od 0,4. Po kroku PGD z ε = 0,1 ma wartość 0,56. Gdzie umieszcza go rzut?</summary>

Na 0,5. Jest 0,16 powyżej miejsca, z którego wyszedł, więcej niż ε, więc wraca dokładnie na ε powyżej: 0,4 + 0,1. Kula jest wokół obrazu, od którego atak zaczął, a nie wokół obrazu z poprzedniego kroku.

</details>

<details>
<summary>PGD działa z ε = 0,1, α = 0,001 i 20 krokami. Co jest nie tak z tymi ustawieniami?</summary>

Kroki są za małe. Dwadzieścia kroków po 0,001 przesuwa piksel najwyżej o 0,02, jedną piątą drogi do brzegu kuli, więc większość kuli pozostaje poza zasięgiem, a sieć wygląda na bardziej odporną, niż jest. Liczba kroków razy α powinna dawać wyraźnie więcej niż ε.

</details>

<details>
<summary>Sieć czyta dobrze 80% obrazów pod FGSM z ε = 0,1. Czy jej dokładność pod atakiem dla tego ε to 80%?</summary>

Najwyżej 80%. FGSM to słaby atak, a silniejszy, jak PGD z wystarczającą liczbą kroków, zwykle oszuka w tej samej kuli więcej obrazów. 80% mówi, czego nie zdołało zrobić FGSM, a nie, czego nie da się zrobić.

</details>

<details>
<summary>Dlaczego <code>pgd</code> można wywołać w środku pętli treningowej, nie psując jej?</summary>

Bierze nachylenia z `torch.autograd.grad(loss, X_adv)`, które zwraca nachylenia względem obrazów i nic nie wkłada do `.grad` parametrów. Atak, który wywołałby `backward()`, dodałby swoje nachylenia do `.grad` parametrów, a optymalizator by ich użył, gdyby nikt ich wcześniej nie wyzerował.

</details>

## Twoja kolej

W ćwiczeniu [Z powrotem do kuli](../../exercises/07-adversarial-examples/02-pgd/01-back-into-the-ball/task.pl.md) napiszesz rzut i zobaczysz, co robi z pikselami po każdej stronie kuli. W ćwiczeniu [Rzutowany spadek gradientu](../../exercises/07-adversarial-examples/02-pgd/02-projected-gradient-descent/task.pl.md) napiszesz cały atak.
