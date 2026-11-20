---
description: Zamiast jednego kroku atak robi wiele małych, a po każdym rzutuje obraz z powrotem do kuli o promieniu ε. PGD, losowy punkt startowy, długość i liczba kroków oraz trening na zaatakowanych obrazach.
---

# PGD

[FGSM](01-fooling-a-network.pl.md) liczy nachylenia tylko raz, w punkcie wyjścia, i idzie za nimi aż do brzegu kuli o promieniu ε. To szybkie, ale na części obrazów, na których dałoby się oszukać sieć, FGSM zawodzi. W tej lekcji atak robi zamiast tego wiele małych kroków, przed każdym liczy nachylenia od nowa, a gdy krok wyprowadzi obraz poza kulę, sprowadza go z powrotem. To **rzutowany spadek gradientu** (ang. projected gradient descent, PGD), atak, którym standardowo mierzy się odporność sieci.

## Nachylenia się zmieniają

Oto obraz, z którym FGSM sobie nie radzi: obraz walidacyjny numer 207, kolejne zero. Przykład liczy nachylenia dla tego obrazu, wykonuje krok FGSM z ε = 0,1, a potem liczy nachylenia jeszcze raz w miejscu, w którym krok się skończył. Pierwsze linijki kodu są takie same jak w [każdym przykładzie tego rozdziału](01-fooling-a-network.pl.md#sieć):

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

Strata wzrosła z 0,012 do 1,187, ale sieć nadal rozpoznaje zero. Ostatni wypisany wiersz podaje, ile pikseli ma na końcu kroku nachylenie o innym znaku niż na początku: 10 z 64. Pod koniec kroku tych dziesięć pikseli przesuwało się więc w złą stronę.

Nachylenia się zmieniają, bo sieć nie jest funkcją liniową. Jej ReLU włączają się i wyłączają, gdy obraz się zmienia, a każde takie przełączenie zmienia to, przez które wagi piksele wpływają na wynik. Jedyny pomiar, jaki wykonuje FGSM, jest trafny tylko w pobliżu wyjściowego obrazu.

## Małe kroki

Lepiej więc zrobić mały krok, o długości oznaczanej α (alfa), i policzyć nachylenia jeszcze raz. Cztery kroki po 0,025 mogą przesunąć piksel tak samo daleko jak jeden krok o 0,1, a każdy z nich kieruje się nachyleniami w miejscu, w którym obraz akurat jest. Kolumny to numer kroku, strata po nim i cyfra, którą rozpoznaje sieć:

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

Po czwartym kroku strata wynosi 1,424, więcej niż 1,187 po FGSM, a sieć rozpoznaje dwójkę. Żaden piksel nie oddalił się o więcej niż 0,1 od wartości początkowej, więc ten obraz leży w tej samej kuli co obraz z FGSM. Małe kroki znalazły w niej po prostu lepsze miejsce.

## Z powrotem do kuli

Kolejne kroki mogłyby znaleźć jeszcze lepsze miejsce, ale piąty krok o 0,025 oddaliłby niektóre piksele o 0,125 od wartości początkowej, czyli wyprowadziłby obraz poza kulę. Dlatego po każdym kroku obraz jest **rzutowany** z powrotem: zastępuje go najbliższy obraz z wnętrza kuli. W tej kuli najbliższy obraz wyznacza się osobno dla każdego piksela. Piksel, który przekroczył wartość początkową o więcej niż ε, wraca na wartość początkową plus ε. Piksel, który spadł o więcej niż ε poniżej niej, wraca na wartość początkową minus ε. Pozostałe zostają bez zmian. Wystarczy więc przyciąć różnice funkcją `clamp`:

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

Pierwszy piksel był o 0,15 powyżej wartości początkowej, więc wraca na 0,1 powyżej, czyli do 0,3. Drugi mieścił się w kuli i zostaje na miejscu. Trzeci wraca na 0,1 powyżej 0,95, czyli do 1,05, a końcowe `clamp(0, 1)` przycina go do 1. Czwarty wraca do −0,1, a potem do 0. Wszystkie cztery różnice mieszczą się teraz między −0,1 a 0,1.

## Rzutowany spadek gradientu

Dzięki rzutowaniu po każdym kroku atak może zrobić dowolnie wiele kroków:

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

W każdym przebiegu pętli obraz zostaje oznaczony, nachylenia są liczone w miejscu, w którym obraz akurat jest, krok jest robiony zgodnie z ich znakami, a wynik jest rzutowany z powrotem do kuli wokół `X`, czyli obrazu, od którego atak się zaczął. `X_adv.detach() + ...` tworzy w każdym kroku nowy, nieoznaczony tensor, tak jak `changed` w części [Nachylenie względem wejścia](../05-pytorch/02-autograd.pl.md#nachylenie-względem-wejścia), więc autograd nie zapisuje obliczeń z poprzednich kroków.

Po 4 krokach strata wynosi 1,424, jak wcześniej. Po 10 krokach już 1,813, a sieć rozpoznaje dwójkę z prawdopodobieństwem 0,60. Kolejne dziesięć kroków niczego już nie poprawia, a obraz ani razu nie wychodzi poza kulę: największa zmiana za każdym razem wynosi 0,1.

Nazwa mówi o spadku, choć atak zwiększa stratę. To nazwa ogólnej metody, czyli kroków wzdłuż nachyleń z rzutowaniem po każdym z nich, niezależnie od tego, w którą stronę idą kroki.

## Losowy punkt startowy

Pętla powyżej zaczyna od samego obrazu. PGD zwykle zaczyna gdzie indziej: od losowego obrazu z wnętrza kuli. `torch.rand_like(X)` daje losowe liczby od 0 do 1 o kształcie `X`, więc `torch.rand_like(X) * 2 - 1` daje liczby od −1 do 1, a po pomnożeniu przez ε losowe przesunięcie każdego piksela w obrębie kuli.

Są ku temu dwa powody. Po pierwsze, w punkcie wyjścia nachylenia mogą słabo wskazywać kierunek albo wręcz wynosić 0, jak w lekcji [Cele i normy](03-targets-and-norms.pl.md#atak-na-embedding). Po drugie, z różnych punktów startowych atak może dojść do różnych obrazów, więc można go uruchomić kilka razy i uznać atak na obraz za udany, jeśli udało się którekolwiek uruchomienie. Takie ponowne uruchomienia nazywa się **restartami** (ang. restarts). Oto PGD z 8 restartami na wszystkich obrazach walidacyjnych. Kolumny to numer restartu, dokładność na jego obrazach i odsetek obrazów, na których dotąd nie udał się żaden restart:

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

Po pojedynczym restarcie dokładność wynosi od 50,5% do 52,9%. Po wszystkich ośmiu na 50,5% obrazów nie udał się ani jeden restart, czyli na jednym obrazie mniej niż przy PGD startującym z oryginału, po którym dokładność wynosi 50,8%. W tak małej sieci punkt startowy prawie nie ma znaczenia: skądkolwiek PGD zacznie, udaje mu się na niemal tych samych obrazach. Strata dużej sieci ma wewnątrz kuli wiele lokalnych maksimów i to od punktu startowego zależy, do którego z nich atak dojdzie, dlatego przy dużych sieciach losowy start i kilka restartów należą do standardowego ataku.

## Długość i liczba kroków

PGD ma dwa ustawienia, których nie ma FGSM. Oto dokładność na obrazach walidacyjnych przy ε = 0,1 dla kilku ich kombinacji, bez losowego startu, żeby wiersze dało się porównać:

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

Jeden krok o pełne ε to po prostu FGSM, z jego 55,9%. Przy krokach po 0,025 dokładność po czterech krokach wynosi 53,2%, po dziesięciu 51,5%, a po dwudziestu 50,8%. Sto kroków nie daje nic więcej niż dwadzieścia: atak znalazł już w tej kuli wszystko, co było do znalezienia.

Za krótkie kroki marnują atak. Dwadzieścia kroków po 0,005 ledwie dochodzi do brzegu kuli, a dokładność zostaje na 52,5%. Za długie kroki tutaj nie szkodzą, bo rzutowanie trzyma obraz w kuli: 20 kroków o pełne ε też daje 50,8%. W większych sieciach takie kroki mogą jednak przeskakiwać z jednej strony kuli na drugą i omijać to, co pomiędzy.

Iloczyn liczby kroków i α powinien więc wyraźnie przekraczać ε: na tyle, żeby atak przeszedł przez kulę i miał jeszcze kroki na szukanie. Popularna reguła mówi, że α = 2,5 ε / liczba kroków. Dla zdjęć typowe ustawienie to ε = 8/255, α = 2/255 i 10 albo 20 kroków.

## Dokładność a ε

Oto oba ataki na obrazach walidacyjnych, z α równym ćwierci ε i 20 krokami w przypadku PGD. Kolumny to ε, dokładność pod FGSM i dokładność pod PGD:

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

PGD nigdy nie jest słabsze od FGSM, a różnica rośnie wraz z ε: przy 0,15 po FGSM sieć rozpoznaje poprawnie 19,9% obrazów, a po PGD tylko 10,4%, mniej więcej o połowę mniej.

Dlatego podając odporność sieci, trzeba powiedzieć, jakim atakiem ją zmierzono. Dokładność pod atakiem mówi tylko tyle, że ten konkretny atak nie poradził sobie lepiej, więc słaby atak sprawia, że sieć wydaje się bardziej odporna, niż jest. Wiarygodna jest liczba uzyskana najsilniejszym z wypróbowanych ataków, a punktem wyjścia jest PGD z odpowiednią liczbą kroków.

## Dla chętnych: trening adwersarialny

Do tej pory sieć widziała tylko niezmienione obrazy. **Trening adwersarialny** (ang. adversarial training) pokazuje jej obrazy zaatakowane: każdą porcję atakuje się przed krokiem treningu za pomocą PGD skierowanego przeciwko sieci w jej obecnym stanie. Atak robi tylko kilka kroków, tutaj 5, bo uruchamia się go dla każdej porcji. Nie zmienia `.grad` parametrów, bo prosi `torch.autograd.grad` wyłącznie o nachylenia względem obrazów, więc można go wstawić w środek pętli treningowej:

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

Kolumny mówią, czy trening był adwersarialny, jaka jest dokładność na niezmienionych obrazach walidacyjnych i jaka pod PGD z ε = 0,1, przygotowanym przeciwko mierzonej sieci. Zwykła sieć ma 94,3% i 50,8%. Sieć trenowana na zaatakowanych obrazach ma pod atakiem 68%. Płaci za to dokładnością na niezmienionych obrazach, która spada do 90,2%, i czasem: każdy krok optymalizatora poprzedza teraz 5 kroków ataku, więc trening trwa kilka razy dłużej.

Po 20 epokach zamiast 10 sieć trenowana adwersarialnie rozpoznaje 94,3% niezmienionych obrazów i 75,4% zaatakowanych, a zwykła sieć trenowana równie długo 96% i 47,8%. To wciąż daleko do odporności, i to na obrazach z 64 pikseli. Spośród wypróbowanych dotąd obron ta sprawdza się najlepiej, a uodpornienie sieci za rozsądną cenę pozostaje otwartym problemem.

## Podsumowanie

- Nachylenia, którymi kieruje się FGSM, są trafne tylko w pobliżu wyjściowego obrazu. PGD robi wiele małych kroków o długości α i przed każdym liczy nachylenia od nowa.
- Po każdym kroku obraz jest rzutowany z powrotem do kuli o promieniu ε wokół obrazu, od którego atak się zaczął: `X + (X_adv - X).clamp(-epsilon, epsilon)`, a potem `clamp(0, 1)`.
- Przy losowym starcie atak zaczyna się od losowego obrazu z kuli, a restarty uruchamiają go z kilku takich punktów.
- Iloczyn liczby kroków i α powinien wyraźnie przekraczać ε. Więcej kroków pozwala znaleźć więcej, ale tylko do pewnego momentu.
- Dokładność pod atakiem jest tylko tak wiarygodna jak sam atak. PGD jest co najmniej tak silne jak FGSM i to nim zwykle mierzy się odporność.
- W treningu adwersarialnym każdą porcję atakuje się przed krokiem treningu. Sieć staje się odporniejsza, ale nieco gorzej radzi sobie z niezmienionymi obrazami.

## Sprawdź się

<details>
<summary>Piksel miał na początku wartość 0,4. Po kroku PGD z ε = 0,1 ma 0,56. Jaką wartość nada mu rzutowanie?</summary>

0,5. Oddalił się od wartości początkowej o 0,16, czyli o więcej niż ε, więc wraca dokładnie na ε powyżej niej: 0,4 + 0,1. Kula otacza obraz, od którego atak się zaczął, a nie obraz z poprzedniego kroku.

</details>

<details>
<summary>PGD działa z ε = 0,1, α = 0,001 i 20 krokami. Co jest nie tak z tymi ustawieniami?</summary>

Kroki są za krótkie. Dwadzieścia kroków po 0,001 przesuwa piksel najwyżej o 0,02, jedną piątą drogi do brzegu kuli, więc większa część kuli pozostaje poza zasięgiem ataku, a sieć wydaje się bardziej odporna, niż jest. Iloczyn liczby kroków i α powinien wyraźnie przekraczać ε.

</details>

<details>
<summary>Pod FGSM z ε = 0,1 sieć rozpoznaje poprawnie 80% obrazów. Czy jej dokładność pod atakiem dla tego ε wynosi 80%?</summary>

Najwyżej 80%. FGSM to słaby atak, a silniejszy, na przykład PGD z odpowiednią liczbą kroków, zwykle w tej samej kuli oszuka sieć na większej liczbie obrazów. 80% mówi tylko, czego nie zdołało zrobić FGSM, a nie, czego w ogóle nie da się zrobić.

</details>

<details>
<summary>Dlaczego <code>pgd</code> można wywołać w środku pętli treningowej bez szkody dla treningu?</summary>

Bo nachylenia bierze z `torch.autograd.grad(loss, X_adv)`, które zwraca nachylenia względem obrazów i niczego nie zapisuje w `.grad` parametrów. Atak, który wywoływałby `backward()`, dodawałby swoje nachylenia do `.grad` parametrów, a optymalizator by ich użył, gdyby nikt ich wcześniej nie wyzerował.

</details>

## Twoja kolej

W ćwiczeniu [Z powrotem do kuli](../../exercises/07-adversarial-examples/02-pgd/01-back-into-the-ball/task.pl.md) napiszesz rzutowanie i sprawdzisz, co robi z pikselami po każdej stronie kuli. W ćwiczeniu [Rzutowany spadek gradientu](../../exercises/07-adversarial-examples/02-pgd/02-projected-gradient-descent/task.pl.md) napiszesz cały atak.
