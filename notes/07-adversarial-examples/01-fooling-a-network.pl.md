---
description: Przesuń każdy piksel obrazu odrobinę, zgodnie ze znakiem nachylenia straty, a sieć przeczyta go źle. FGSM, kula ε, piksele, które zostają poprawne, i dokładność pod atakiem.
---

# Oszukiwanie sieci

Kierowcy firmy taksówkowej oddają paragony wypisane ręcznie, a cyfry na nich czyta sieć z lekcji [Klasyfikacja obrazów](../05-pytorch/09-classifying-images.pl.md). Czyta dobrze 94% z nich. Tyle że zmierzono to na obrazach, których nikt nie ruszał, a kierowca, który chciałby, żeby opłata została odczytana jako wyższa, niż była, ma wszelkie powody, żeby któryś ruszyć.

Ta lekcja zmienia obraz celowo: każdy piksel odrobinę, za mało, żeby zmienić to, co odczyta z niego człowiek, i każdy w kierunku, który najbardziej szkodzi sieci. Tak zmieniony obraz nazywa się **przykładem antagonistycznym** (ang. adversarial example), a jego tworzenie **atakiem**. Firma atakuje tu własną sieć, bo tylko tak może się dowiedzieć, na ile jej ufać.

## Sieć

Każdy przykład w tym rozdziale zaczyna się od tych samych wierszy. Wczytują cyfry i trenują sieć, tak jak w lekcji [Klasyfikacja obrazów](../05-pytorch/09-classifying-images.pl.md#odczytywanie-odpowiedzi), a 297 obrazów walidacyjnych i ich etykiety trzymają w `X_valid` i `y_valid`. Zajmuje to mniej więcej sekundę. To, co w każdym przykładzie nowe, przychodzi po `model.eval()`:

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


def as_text(picture):
    return ["".join(" .:*#"[int(pixel * 4.99)] for pixel in row) for row in picture.tolist()]


with torch.no_grad():
    accuracy = (model(X_valid).argmax(dim=1) == y_valid).float().mean().item()
print(round(accuracy, 3))

picture, label = X_valid[:1], y_valid[:1]
print(picture.shape, label)
for row in as_text(picture[0, 0]):
    print(row)
with torch.no_grad():
    probabilities = F.softmax(model(picture), dim=1)
print([round(p, 2) for p in probabilities[0].tolist()])
```

Sieć czyta dobrze 94,3% obrazów walidacyjnych. `X_valid[:1]` to pierwszy z nich, jako porcja z jednym obrazem: kształt to `[1, 1, 8, 8]`, bo sieć i strata biorą porcje. `as_text` zamienia obraz w 8 wierszy tekstu, ze znakiem dla każdego piksela, od spacji dla jasnego, poniżej 0,2, do `#` dla ciemnego, powyżej 0,8. Na obrazie jest 0. Ostatni wiersz to prawdopodobieństwa, które sieć daje dziesięciu cyfrom: 0,98 dla 0 i 0,01 dla 9.

## Nachylenie względem obrazu

W części [Nachylenie względem wejścia](../05-pytorch/02-autograd.pl.md#nachylenie-względem-wejścia) kurs przesunął się zgodnie z nachyleniami straty i strata prostej opłat wzrosła, a ceny zostały takie, jakie były. Obraz to wejście z 64 liczb, a strata ma nachylenie względem każdej z nich. `clone()` robi kopię obrazu, żeby oznaczenie trafiło na kopię, a obrazy walidacyjne zostały takie, jakie są:

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

picture = X_valid[:1].clone().requires_grad_()
label = y_valid[:1]

loss = criterion(model(picture), label)
slope = torch.autograd.grad(loss, picture)[0]
print(loss)
print(slope.shape)
for row in slope[0, 0]:
    print("".join("+" if number > 0 else "-" for number in row))
```

Strata wynosi 0,016, tak mało, bo sieć jest prawie pewna swojego 0. Nachylenie ma kształt obrazu, z liczbą dla każdego piksela. `+` to piksel o dodatnim nachyleniu: jeśli go przyciemnić, strata rośnie, czyli sieć jest mniej pewna 0. `-` to piksel, który robi to samo, gdy się rozjaśnia.

Porównaj znaki z obrazem. W czterech środkowych wierszach lewa strona pierścienia to same `-`, a dziura obok niej ma `+` w każdym wierszu. Bledszy pierścień z czymś w środku to mniej 0. Nikt tego sieci nie powiedział: to jest w nachyleniach.

## Jeden krok zgodnie ze znakiem

Atak przesuwa każdy piksel o tę samą małą wielkość, nazywaną ε, epsilon: w górę tam, gdzie nachylenie jest dodatnie, i w dół tam, gdzie jest ujemne. To jeden krok spadku gradientu, odwrócony, żeby wspinać się po stracie, i z samym znakiem każdego nachylenia. Nachylenia względem wszystkich pikseli razem to gradient straty względem obrazu, dlatego ta metoda nazywa się **metodą szybkiego znaku gradientu** (ang. fast gradient sign method), w skrócie **FGSM**. Oto ona z ε = 0,1, czyli jedną dziesiątą drogi od bieli do czerni:

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


def as_text(picture):
    return ["".join(" .:*#"[int(pixel * 4.99)] for pixel in row) for row in picture.tolist()]


original, label = X_valid[:1], y_valid[:1]
picture = original.clone().requires_grad_()
loss = criterion(model(picture), label)
slope = torch.autograd.grad(loss, picture)[0]

epsilon = 0.1
attacked = (original + epsilon * slope.sign()).clamp(0, 1)

with torch.no_grad():
    new_loss = criterion(model(attacked), label)
    probabilities = F.softmax(model(attacked), dim=1)
print(round(loss.item(), 3), round(new_loss.item(), 3))
print([round(p, 2) for p in probabilities[0].tolist()])
for before, after in zip(as_text(original[0, 0]), as_text(attacked[0, 0])):
    print(before, "  ", after)
print((attacked - original).abs().max())
```

Strata wzrosła z 0,016 do 1,194. Sieć daje teraz 0 prawdopodobieństwo 0,30, a 9 dostaje 0,52: czyta 0 z paragonu jako 9. Oba obrazy stoją obok siebie, obraz kierowcy po lewej, a zaatakowany po prawej. Niektóre znaki się różnią, tam, gdzie piksel przeszedł z jednego z pięciu poziomów na następny, ale na obu wyraźnie widać 0. Żaden piksel nie przesunął się o więcej niż 0,1, jak mówi ostatni wiersz. `clamp(0, 1)` pilnuje, żeby piksele zostały między 0 a 1, i następna część do tego wraca.

Dlaczego znak, a nie samo nachylenie, jak w spadku gradientu? Przez to, jak ograniczona jest zmiana: każdy piksel może przesunąć się o ε i nie dalej. Przy małej zmianie strata rośnie mniej więcej o nachylenie razy zmianę dla każdego piksela, zsumowane po pikselach. Gdy każdy piksel ma swój limit, ta suma jest największa, kiedy każdy piksel idzie tak daleko, jak może, w kierunku swojego nachylenia, a to jest ε razy znak. Piksel o małym nachyleniu dokłada niewiele, ale wszystkie 64 małe kawałki wskazują w tę samą stronę, w górę straty, i się sumują. Zdjęcie ma tysiące razy więcej pikseli do zsumowania, dlatego do oszukania sieci, która czyta zdjęcia, wystarcza dużo mniejsze ε.

## Kula ε i poprawne piksele

Atak obiecuje coś o obrazie, który zwraca: żaden piksel nie jest dalej niż ε od miejsca, w którym był. Wszystkie obrazy, które dotrzymują tej obietnicy, tworzą **kulę ε** (ang. ε-ball) wokół obrazu wyjściowego. Największa zmiana któregokolwiek piksela to to, jak daleko od siebie są dwa obrazy w tym sensie, i nazywa się ją ich **odległością L∞**, czytaj „L nieskończoność”. Lekcja [Cele i normy](03-targets-and-norms.pl.md) pokazuje inne sposoby mierzenia.

Piksel musi też zostać pikselem, między 0 a 1. Cyfry mają wokół siebie dużo bieli, pikseli równych 0, a krok w dół od 0 dałby −0,1, czego nie zapisze żaden plik z obrazem. Dlatego atak kończy się na `clamp(0, 1)`. Oto cztery piksele ze znakami ich nachyleń:

```python run
import torch

pixels = torch.tensor([0.0, 0.5, 0.95, 1.0])
signs = torch.tensor([-1.0, 1.0, 1.0, -1.0])
epsilon = 0.1

moved = pixels + epsilon * signs
print(moved)
attacked = moved.clamp(0, 1)
print(attacked)
print((attacked - pixels).abs())
print((attacked - pixels).abs().max())
```

Pierwszy piksel poszedłby do −0,1, a trzeci do 1,05, i `clamp` sprowadza je z powrotem do 0 i do 1. Pierwszy piksel w ogóle się więc nie rusza, trzeci przesuwa się o 0,05, a pozostałe dwa o całe 0,1. Przycinanie może tylko przybliżyć piksel do miejsca, z którego wyszedł, bo wyszedł spomiędzy 0 a 1, więc obraz zostaje w kuli: największa zmiana to nadal 0,1.

To ε sprawia, że zmieniony obraz jest przykładem antagonistycznym, a nie po prostu innym obrazem. Przy ε = 0,5 atak mógłby namalować na 0 dziewiątkę i sieć słusznie przeczytałaby 9. Kula musi być na tyle mała, żeby wszystko w niej było dla człowieka nadal tą samą cyfrą, i wtedy każdy obraz w niej, który sieć czyta inaczej, to błąd sieci.

## Dokładność pod atakiem

Jeden oszukany obraz mówi o sieci niewiele. Miarą jest jej dokładność, gdy zaatakowany jest każdy obraz: **dokładność pod atakiem** (ang. accuracy under attack) dla danego ε. `fgsm` poniżej atakuje całą porcję naraz. Strata to średnia po obrazach, a piksele obrazu zmieniają tylko jego część tej średniej, więc jedno wywołanie `torch.autograd.grad` daje każdemu obrazowi jego własne nachylenia. Przez średnią wychodzą podzielone przez liczbę obrazów, a `sign()` to nie przeszkadza.

Dla porównania ostatnia kolumna zmienia każdy piksel o to samo ε, w górę albo w dół losowo: `torch.randn_like(X_valid)` daje tensor losowych liczb o kształcie `X_valid`, a ich znaki to kierunki.

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


def fgsm(model, X, y, epsilon):
    X = X.clone().requires_grad_()
    loss = criterion(model(X), y)
    slope = torch.autograd.grad(loss, X)[0]
    return (X.detach() + epsilon * slope.sign()).clamp(0, 1)


def accuracy(model, X, y):
    with torch.no_grad():
        return (model(X).argmax(dim=1) == y).float().mean().item()


torch.manual_seed(0)
for epsilon in [0.0, 0.05, 0.1, 0.15, 0.2]:
    X_adv = fgsm(model, X_valid, y_valid, epsilon)
    X_noisy = (X_valid + epsilon * torch.randn_like(X_valid).sign()).clamp(0, 1)
    print(epsilon, round(accuracy(model, X_adv, y_valid), 3), round(accuracy(model, X_noisy, y_valid), 3))
```

Przy ε = 0 nic się nie zmienia, a dokładność to wcześniejsze 94,3%. Przy 0,05 sieć czyta dobrze 81,5% zaatakowanych obrazów, przy 0,1 już tylko 55,9%, a przy 0,2 zaledwie 4%. To mniej niż 10%, które dałoby zgadywanie: atak nie wprawia sieci w zakłopotanie, tylko prowadzi ją do złych odpowiedzi.

Losowe zmiany tej samej wielkości prawie nie mają znaczenia: przy ε = 0,1 sieć nadal czyta dobrze 91,6% takich obrazów. To więc nie wielkość zmiany oszukuje sieć, tylko jej kierunek, a który to kierunek, mówią nachylenia.

Sieć, która zachowuje dokładność pod atakiem, nazywa się **odporną** (ang. robust), a ta odporna nie jest. Nic w jej treningu tego od niej nie wymagało: pokazywano jej tylko obrazy takie, jakie były.

> [!NOTE]
> Atak liczył nachylenia z wag samej sieci. Trzymanie wag w tajemnicy nie jest jednak obroną, na której można polegać: obrazy zrobione przeciwko jednej sieci często oszukują też inną, wytrenowaną na tego samego rodzaju obrazach.

## Podsumowanie

- Przykład antagonistyczny to obraz zmieniony odrobinę, celowo, tak żeby sieć przeczytała go źle, a człowiek tak samo jak przedtem.
- Strata ma nachylenie względem każdego piksela: `torch.autograd.grad(loss, X)[0]`, dla obrazów oznaczonych przez `requires_grad_()`.
- FGSM, metoda szybkiego znaku gradientu, robi jeden krok: `X + epsilon * slope.sign()`. Każdy piksel przesuwa się o ε w kierunku, w którym strata rośnie.
- Kula ε wokół obrazu to obrazy, których wszystkie piksele są najwyżej ε od jego pikseli. Największa zmiana piksela to odległość L∞. `clamp(0, 1)` utrzymuje piksele w poprawnym zakresie, a obraz zostaje w kuli.
- Dokładność pod atakiem to dokładność na obrazach, z których każdy został zaatakowany, dla danego ε. Losowe zmiany tej samej wielkości prawie nic nie robią: liczy się kierunek.

## Sprawdź się

<details>
<summary>Piksel ma wartość 0,95, a jego nachylenie jest dodatnie. Gdzie jest po FGSM z ε = 0,1?</summary>

Na 1. Krok przenosi go na 1,05, a `clamp(0, 1)` sprowadza go z powrotem do 1, najciemniejszej wartości, jaką może mieć piksel. Przesunął się o 0,05, mniej niż ε, więc obraz nadal jest w kuli ε.

</details>

<details>
<summary>Dlaczego FGSM przesuwa piksel o malutkim nachyleniu tak samo daleko jak piksel o dużym?</summary>

Bo limit dotyczy każdego piksela z osobna: żaden nie może przesunąć się o więcej niż ε. Przy takim limicie strata rośnie najbardziej, gdy każdy piksel idzie do końca w swoim kierunku. Piksel o malutkim nachyleniu dokłada niewiele, ale dokłada we właściwym kierunku i nic nie odbiera pozostałym.

</details>

<details>
<summary>Losowe zmiany o ±0,1 zostawiają dokładność na 92%, a FGSM z ε = 0,1 obniża ją do 56%. Jedne i drugie przesuwają każdy piksel o 0,1. Na czym polega różnica?</summary>

Na kierunku. Przy losowych znakach mniej więcej połowa pikseli pcha stratę w górę, a połowa w dół, i w większości się znoszą. FGSM bierze każdy znak z nachylenia, więc każdy piksel pcha stratę w górę.

</details>

<details>
<summary>Dlaczego obraz zaatakowany z ε = 0,5 nie jest przykładem antagonistycznym?</summary>

Zmiana o połowę drogi od bieli do czerni może zamienić cyfrę w inną, także dla człowieka, a wtedy sieć, która czyta tę inną cyfrę, ma rację. Przykład antagonistyczny zachowuje dla człowieka swoje znaczenie i po to jest małe ε.

</details>

## Twoja kolej

W ćwiczeniu [Jeden krok FGSM](../../exercises/07-adversarial-examples/01-fooling-a-network/01-one-step-with-fgsm/task.pl.md) napiszesz atak dla dowolnej sieci i dowolnej porcji obrazów. W ćwiczeniu [Dokładność pod atakiem](../../exercises/07-adversarial-examples/01-fooling-a-network/02-accuracy-under-attack/task.pl.md) zmierzysz, jak spada dokładność sieci, gdy rośnie ε.
