---
description: Wystarczy lekko zmienić każdy piksel obrazu zgodnie ze znakiem nachylenia straty, a sieć przestaje go rozpoznawać. FGSM, kula o promieniu ε, dozwolony zakres wartości pikseli i dokładność pod atakiem.
---

# Oszukiwanie sieci

Kierowcy firmy taksówkowej wypisują paragony ręcznie, a cyfry z nich odczytuje sieć z lekcji [Klasyfikacja obrazów](../05-pytorch/09-classifying-images.pl.md). Rozpoznaje poprawnie 94% cyfr. Tyle że tę dokładność zmierzono na obrazach, przy których nikt nie majstrował, a kierowca, który chciałby, żeby sieć odczytała wyższą kwotę, niż jest na paragonie, ma dobry powód, żeby pomajstrować.

W tej lekcji celowo zmienisz obraz: każdy piksel tylko odrobinę, za mało, żeby człowiek zobaczył na obrazie co innego, ale zawsze w tę stronę, która najbardziej szkodzi sieci. Tak zmieniony obraz nazywa się **przykładem adwersarialnym** (ang. adversarial example; spotyka się też nazwę *przykład antagonistyczny*), a jego tworzenie **atakiem**. Firma atakuje tu własną sieć, bo tylko tak może sprawdzić, na ile można jej ufać.

## Sieć

Każdy przykład w tym rozdziale zaczyna się od tych samych linijek kodu. Wczytują one cyfry i trenują sieć tak samo jak w lekcji [Klasyfikacja obrazów](../05-pytorch/09-classifying-images.pl.md#odczytywanie-odpowiedzi), a 297 obrazów walidacyjnych z etykietami zapisują w `X_valid` i `y_valid`. Trwa to około sekundy. To, co w danym przykładzie nowe, zaczyna się po `model.eval()`:

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

Sieć poprawnie rozpoznaje 94,3% obrazów walidacyjnych. `X_valid[:1]` to pierwszy z nich, podany jako porcja złożona z jednego obrazu: ma kształt `[1, 1, 8, 8]`, bo sieć i funkcja straty przyjmują porcje. `as_text` zamienia obraz na 8 wierszy tekstu, po jednym znaku na piksel: od spacji dla jasnych pikseli, poniżej 0,2, do `#` dla ciemnych, powyżej 0,8. Na obrazie jest zero. Ostatni wypisany wiersz to prawdopodobieństwa, jakie sieć przypisuje dziesięciu cyfrom: 0,98 zeru i 0,01 dziewiątce.

## Nachylenie względem obrazu

W części [Nachylenie względem wejścia](../05-pytorch/02-autograd.pl.md#nachylenie-względem-wejścia) przesunięcie kursu zgodnie z nachyleniami straty zwiększyło stratę prostej opłat, choć ceny się nie zmieniły. Obraz to wejście złożone z 64 liczb, a strata ma nachylenie względem każdej z nich. `clone()` tworzy kopię obrazu: oznacza się kopię, a obrazy walidacyjne zostają nietknięte:

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

Strata wynosi 0,016, bo sieć jest prawie pewna, że widzi zero. Nachylenie ma kształt obrazu, po jednej liczbie na piksel. `+` oznacza piksel o dodatnim nachyleniu: jeśli go przyciemnić, strata rośnie, czyli sieć traci pewność, że to zero. `-` oznacza piksel, który działa tak samo, gdy się go rozjaśni.

Porównaj znaki z obrazem. W czterech środkowych wierszach po lewej stronie pierścienia są same `-`, a w dziurze tuż obok w każdym wierszu jest `+`. Bledszy pierścień z czymś w środku mniej przypomina zero. Nikt sieci tego nie powiedział, a jednak widać to w nachyleniach.

## Jeden krok zgodnie ze znakiem

Atak przesuwa każdy piksel o tę samą niewielką wartość, oznaczaną ε (epsilon): w górę tam, gdzie nachylenie jest dodatnie, i w dół tam, gdzie jest ujemne. To jeden krok spadku gradientu, tylko w odwrotną stronę, żeby strata rosła, i ze znakiem każdego nachylenia zamiast jego wartości. Nachylenia względem wszystkich pikseli razem tworzą gradient straty względem obrazu, stąd nazwa metody: **FGSM**, od ang. *fast gradient sign method*, czyli szybka metoda znaku gradientu. Oto ona dla ε = 0,1, czyli jednej dziesiątej drogi od bieli do czerni:

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

Strata wzrosła z 0,016 do 1,194. Sieć przypisuje teraz zeru prawdopodobieństwo 0,30, a dziewiątce 0,52, czyli odczytuje zero z paragonu jako dziewiątkę. Oba obrazy są wypisane obok siebie: po lewej oryginał kierowcy, po prawej obraz po ataku. Niektóre znaki się różnią, bo piksel przeszedł z jednego z pięciu poziomów jasności na sąsiedni, ale na obu wyraźnie widać zero. Jak pokazuje ostatni wiersz, żaden piksel nie zmienił się o więcej niż 0,1. `clamp(0, 1)` pilnuje, żeby wartości pikseli zostały między 0 a 1. Po co, wyjaśnia następna część.

Dlaczego znak, a nie samo nachylenie, jak w spadku gradientu? Chodzi o to, jak ograniczona jest zmiana: każdy piksel może się zmienić najwyżej o ε. Przy małej zmianie strata rośnie mniej więcej o sumę iloczynów nachylenia i zmiany, liczoną po wszystkich pikselach. Skoro każdy piksel ma osobny limit, ta suma jest największa wtedy, gdy każdy piksel wykorzysta cały limit w kierunku swojego nachylenia, a to jest właśnie ε razy znak. Piksel o małym nachyleniu dokłada niewiele, ale wszystkie 64 małe przyrosty działają w tę samą stronę i się sumują. Zdjęcie ma tysiące razy więcej pikseli, dlatego do oszukania sieci rozpoznającej zdjęcia wystarcza dużo mniejsze ε.

## Kula o promieniu ε i zakres pikseli

Atak gwarantuje jedno: żaden piksel zwróconego obrazu nie różni się od swojej pierwotnej wartości o więcej niż ε. Wszystkie obrazy, które spełniają ten warunek, tworzą **kulę o promieniu ε** (ang. ε-ball) wokół oryginału. Największa różnica pojedynczego piksela to miara odległości między dwoma obrazami, nazywana **odległością L∞** (czytaj „L nieskończoność”). Inne sposoby mierzenia opisuje lekcja [Cele i normy](03-targets-and-norms.pl.md).

Piksel musi też pozostać pikselem, czyli mieć wartość od 0 do 1. Cyfry są otoczone bielą, czyli pikselami równymi 0, a krok w dół od zera dałby −0,1, czego żaden plik graficzny nie zapisze. Dlatego atak kończy się wywołaniem `clamp(0, 1)`. Oto cztery piksele i znaki ich nachyleń:

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

Pierwszy piksel trafiłby do −0,1, a trzeci do 1,05, więc `clamp` przycina je do 0 i do 1. W efekcie pierwszy piksel w ogóle się nie zmienia, trzeci zmienia się o 0,05, a dwa pozostałe o pełne 0,1. Przycinanie może piksel tylko przybliżyć do wartości początkowej, bo ta leżała między 0 a 1, więc obraz nie wychodzi poza kulę: największa zmiana nadal wynosi 0,1.

Właśnie od ε zależy, czy zmieniony obraz jest przykładem adwersarialnym, czy po prostu innym obrazem. Przy ε = 0,5 atak mógłby dorysować zeru ogonek dziewiątki i sieć słusznie rozpoznałaby dziewiątkę. Kula musi być na tyle mała, żeby w każdym obrazie z jej wnętrza człowiek widział tę samą cyfrę. Wtedy każdy obraz z kuli, który sieć rozpoznaje inaczej, jest błędem sieci.

## Dokładność pod atakiem

Jeden udany atak niewiele mówi o sieci. Miarą jest jej dokładność na obrazach, z których każdy został zaatakowany: **dokładność pod atakiem** (ang. accuracy under attack) dla danego ε. Funkcja `fgsm` poniżej atakuje całą porcję naraz. Strata jest średnią po obrazach, a piksele danego obrazu wpływają tylko na jego składnik tej średniej, więc jedno wywołanie `torch.autograd.grad` daje każdemu obrazowi jego własne nachylenia. Przez średnią są one podzielone przez liczbę obrazów, ale na znak to nie wpływa.

Dla porównania ostatnia kolumna dotyczy obrazów, w których każdy piksel zmieniono o to samo ε, ale w losową stronę: `torch.randn_like(X_valid)` daje tensor losowych liczb o kształcie `X_valid`, a ich znaki wyznaczają kierunki.

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

Przy ε = 0 nic się nie zmienia i dokładność wynosi 94,3%, jak wcześniej. Przy ε = 0,05 sieć rozpoznaje poprawnie 81,5% zaatakowanych obrazów, przy 0,1 już tylko 55,9%, a przy 0,2 zaledwie 4%. To mniej niż 10%, jakie dałoby zgadywanie na ślepo: atak nie tyle dezorientuje sieć, ile prowadzi ją prosto do złych odpowiedzi.

Losowe zmiany tej samej wielkości prawie nic nie zmieniają: przy ε = 0,1 sieć nadal rozpoznaje 91,6% takich obrazów. Sieć oszukuje więc nie wielkość zmiany, tylko jej kierunek, a ten wskazują nachylenia.

Sieć, która zachowuje dokładność pod atakiem, nazywa się **odporną** (ang. robust). Ta odporna nie jest i nic w jej treningu tego nie wymagało: widziała wyłącznie obrazy, przy których nikt nie majstrował.

> [!NOTE]
> Atak liczył nachylenia na podstawie wag atakowanej sieci. Utajnienie wag nie jest jednak skuteczną obroną: obrazy przygotowane przeciwko jednej sieci często oszukują też inną, wytrenowaną na podobnych obrazach.

## Podsumowanie

- Przykład adwersarialny to obraz zmieniony celowo i tak nieznacznie, że człowiek widzi w nim to samo co wcześniej, a sieć rozpoznaje go błędnie.
- Strata ma nachylenie względem każdego piksela: `torch.autograd.grad(loss, X)[0]` dla obrazów oznaczonych przez `requires_grad_()`.
- FGSM, szybka metoda znaku gradientu, wykonuje jeden krok: `X + epsilon * slope.sign()`. Każdy piksel przesuwa się o ε w stronę, w którą rośnie strata.
- Kula o promieniu ε wokół obrazu zawiera obrazy, których każdy piksel różni się od oryginału najwyżej o ε. Największa zmiana piksela to odległość L∞. `clamp(0, 1)` utrzymuje piksele w dozwolonym zakresie, a obraz pozostaje w kuli.
- Dokładność pod atakiem to dokładność na obrazach, z których każdy zaatakowano przy danym ε. Losowe zmiany tej samej wielkości prawie nic nie zmieniają: liczy się kierunek.

## Sprawdź się

<details>
<summary>Piksel ma wartość 0,95, a jego nachylenie jest dodatnie. Jaką wartość będzie miał po FGSM z ε = 0,1?</summary>

Będzie miał wartość 1. Krok przenosi go do 1,05, a `clamp(0, 1)` przycina go do 1, najciemniejszej możliwej wartości. Piksel zmienił się o 0,05, mniej niż ε, więc obraz nadal leży w kuli o promieniu ε.

</details>

<details>
<summary>Dlaczego FGSM przesuwa piksel o znikomym nachyleniu tak samo daleko jak piksel o dużym?</summary>

Bo limit dotyczy każdego piksela osobno: żaden nie może się zmienić o więcej niż ε. Przy takim ograniczeniu strata rośnie najbardziej, gdy każdy piksel wykorzysta cały swój limit, każdy w swoją stronę. Piksel o znikomym nachyleniu dokłada niewiele, ale zawsze we właściwą stronę, i niczego nie odbiera pozostałym.

</details>

<details>
<summary>Losowe zmiany o ±0,1 obniżają dokładność do 92%, a FGSM z ε = 0,1 do 56%. W obu przypadkach każdy piksel zmienia się o 0,1. Skąd ta różnica?</summary>

Wynika z kierunku. Przy losowych znakach mniej więcej połowa pikseli zwiększa stratę, a połowa ją zmniejsza, więc ich wpływ w dużej mierze się znosi. FGSM bierze znak każdego piksela z nachylenia, więc każdy piksel zwiększa stratę.

</details>

<details>
<summary>Dlaczego obraz zaatakowany przy ε = 0,5 nie jest przykładem adwersarialnym?</summary>

Zmiana o połowę drogi od bieli do czerni może zamienić cyfrę w inną także dla człowieka, a wtedy sieć, która rozpoznaje tę inną cyfrę, ma rację. W przykładzie adwersarialnym człowiek widzi to samo co w oryginale i właśnie temu służy małe ε.

</details>

## Twoja kolej

W ćwiczeniu [Jeden krok FGSM](../../exercises/07-adversarial-examples/01-fooling-a-network/01-one-step-with-fgsm/task.pl.md) napiszesz atak, który działa dla dowolnej sieci i dowolnej porcji obrazów. W ćwiczeniu [Dokładność pod atakiem](../../exercises/07-adversarial-examples/01-fooling-a-network/02-accuracy-under-attack/task.pl.md) zmierzysz, jak dokładność sieci spada wraz ze wzrostem ε.
