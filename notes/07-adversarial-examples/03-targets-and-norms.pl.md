---
description: Wyceluj atak w wybraną klasę, zmierz zaburzenie normami L∞ i L2, atakuj w okrągłej kuli i odepchnij embedding obrazu bez żadnej etykiety.
---

# Cele i normy

Dotychczasowe ataki chciały, żeby sieć się pomyliła, i było im obojętne jak. Kierowcy obojętne nie jest: 1 przeczytana jako 4 nic nie da komuś, kto chciał 7. Ta lekcja celuje atakiem w klasę. Potem patrzy, jak mierzy się wielkość zmiany, bo największa zmiana piksela to nie jedyny sposób, a kończy się atakiem na embeddingi sieci, który w ogóle nie potrzebuje klas.

## W stronę klasy

Atak, któremu wystarczy każda zła odpowiedź, jest **nieukierunkowany** (ang. untargeted). Wspina się po stracie dla właściwej etykiety. Atak **ukierunkowany** (ang. targeted) ma etykietę, którą chce uzyskać, **cel** (ang. target), i schodzi w dół straty dla tej etykiety, więc kroki idą przeciwnie do znaków nachyleń. To pętla treningowa skierowana na obraz: spadek gradientu w stronę etykiety, przy którym zmieniają się piksele, a wagi zostają takie, jakie są.

Oto [PGD](02-pgd.pl.md#rzutowany-spadek-gradientu) z jednym ustawieniem więcej. Przy `targeted=True` w `y` są etykiety, których chce atakujący, a nachylenia są odwracane. Obraz to drugi z obrazów walidacyjnych, 1, a cel to 7:

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


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


def pgd(model, X, y, epsilon, alpha, steps, targeted=False):
    X_adv = X.clone()
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        if targeted:
            slope = -slope
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


original, label = X_valid[1:2], y_valid[1:2]
target = torch.tensor([7])

for epsilon in [0.1, 0.15, 0.2]:
    attacked = pgd(model, original, target, epsilon, epsilon / 4, 20, targeted=True)
    with torch.no_grad():
        probabilities = F.softmax(model(attacked), dim=1)
    print(epsilon, probabilities.argmax(dim=1), round(probabilities[0, 7].item(), 2))

attacked = pgd(model, original, target, 0.15, 0.15 / 4, 20, targeted=True)
for before, after in zip(as_text(original[0, 0]), as_text(attacked[0, 0])):
    print(before, "  ", after)
```

Kolumny to ε, to, co czyta sieć, i prawdopodobieństwo, które daje 7. Przy ε = 0,1 sieć nadal czyta 1 i daje 7 tylko 0,19. Przy 0,15 czyta 7, a przy 0,2 jest go prawie pewna, z 0,94. Obrazy poniżej to 1 kierowcy i obraz, który przy ε = 0,15 jest czytany jako 7.

Cel kosztuje więcej niż pomyłka. Oto ε = 0,15 na wszystkich obrazach walidacyjnych: najpierw ułamek obrazów, które oszukuje nieukierunkowane PGD, a potem, dla każdej cyfry, ułamek obrazów innych cyfr, które po ukierunkowanym PGD sieć czyta jako tę cyfrę. `torch.full_like(y_valid[others], digit)` to tensor taki jak te etykiety, wypełniony cyfrą:

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


def pgd(model, X, y, epsilon, alpha, steps, targeted=False):
    X_adv = X.clone()
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        if targeted:
            slope = -slope
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


def accuracy(model, X, y):
    with torch.no_grad():
        return (model(X).argmax(dim=1) == y).float().mean().item()


epsilon = 0.15
X_adv = pgd(model, X_valid, y_valid, epsilon, epsilon / 4, 20)
print("any", round(1 - accuracy(model, X_adv, y_valid), 3))

for digit in range(10):
    others = y_valid != digit
    targets = torch.full_like(y_valid[others], digit)
    X_adv = pgd(model, X_valid[others], targets, epsilon, epsilon / 4, 20, targeted=True)
    print(digit, round(accuracy(model, X_adv, targets), 3))
```

Atak nieukierunkowany oszukuje sieć na 89,6% obrazów. Wycelowane w jedną cyfrę to samo ε osiąga od 17,8% obrazów dla 6 do 61,8% dla 8. Do niektórych cyfr łatwo dojść od większości innych, do innych trudno, ale żadna nie zbliża się do tego, co osiąga atak, któremu wystarczy każda pomyłka.

## Mierzenie zaburzenia

Zmiana, którą atak robi w obrazie, `X_adv - X`, nazywa się **zaburzeniem** (ang. perturbation). Do tej pory jej wielkością była największa zmiana któregokolwiek piksela. To jedna **norma**, jeden sposób wyrażenia wielkości całej listy liczb jedną liczbą, a są też inne. Dwie najczęściej używane:

- **Norma L∞** to największa ze zmian, bez ich znaków: `delta.abs().max()`.
- **Norma L2** to pierwiastek z sumy ich kwadratów: `delta.norm()`. To długość zaburzenia: odległość w linii prostej między dwoma obrazami, liczona tak, jak twierdzenie Pitagorasa liczy przekątną prostokąta, z bokiem dla każdego piksela.

Oto dwa zaburzenia obrazu z czterech pikseli. Pierwsze zmienia każdy piksel o 0,1, a drugie jeden piksel o 0,2:

```python run
import torch

spread = torch.tensor([0.1, -0.1, 0.1, -0.1])
single = torch.tensor([0.2, 0.0, 0.0, 0.0])

for delta in [spread, single]:
    print(delta.abs().max(), delta.norm())
```

W L2 oba są tej samej wielkości: cztery kwadraty 0,1 dają razem 0,04, tak jak jeden kwadrat 0,2, a pierwiastek z tego to 0,2. W L∞ drugie jest dwa razy większe od pierwszego. To, która z dwóch zmian jest mniejsza, zależy od normy.

Każda norma ma swoją kulę. Przy dwóch pikselach obrazy odległe od danego obrazu najwyżej o 0,1 w L∞ tworzą kwadrat, bo każdy piksel ma własny limit, a te odległe najwyżej o 0,1 w L2 tworzą koło. Przy trzech pikselach to sześcian i kula, a nazwa przylgnęła do każdej liczby pikseli i każdej normy. Kula ε z dwóch poprzednich lekcji była tą kwadratową.

## Okrągła kula

W okrągłej kuli limit dotyczy długości całego zaburzenia. Piksel może przesunąć się daleko, byle pozostałe przesunęły się niewiele. Atak w niej różni się od PGD w dwóch miejscach:

- Krok idzie wzdłuż samych nachyleń, przeskalowanych do długości α, a nie wzdłuż ich znaków. Przy limicie na długość strata rośnie najbardziej w kierunku nachyleń, więc najbardziej przesuwają się piksele o dużych nachyleniach.
- Rzut skraca zaburzenie dłuższe niż ε do długości ε, nie zmieniając jego kierunku.

`lengths` poniżej daje normę L2 każdego obrazu w porcji: `flatten(1)` robi z każdego wiersz 64 liczb, `norm(dim=1)` bierze normę każdego wiersza, a `reshape(-1, 1, 1, 1)` nadaje wynikowi kształt, który rozgłasza się na porcję obrazów. `1e-12` chroni przed dzieleniem przez 0:

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


def lengths(pictures):
    return pictures.flatten(1).norm(dim=1).reshape(-1, 1, 1, 1)


def project_l2(X_adv, X, epsilon):
    delta = X_adv - X
    delta = delta * (epsilon / (lengths(delta) + 1e-12)).clamp(max=1)
    return (X + delta).clamp(0, 1)


def pgd_l2(model, X, y, epsilon, alpha, steps):
    X_adv = X.clone()
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        direction = slope / (lengths(slope) + 1e-12)
        X_adv = project_l2(X_adv.detach() + alpha * direction, X, epsilon)
    return X_adv


def accuracy(model, X, y):
    with torch.no_grad():
        return (model(X).argmax(dim=1) == y).float().mean().item()


X_square = pgd(model, X_valid, y_valid, 0.1, 0.1 / 4, 20)
X_round = pgd_l2(model, X_valid, y_valid, 0.5, 0.5 / 4, 20)
X_longer = pgd_l2(model, X_valid, y_valid, 0.68, 0.68 / 4, 20)

for X_adv in [X_square, X_round, X_longer]:
    delta = (X_adv - X_valid).flatten(1)
    print(round(accuracy(model, X_adv, y_valid), 3), round(delta.abs().max(dim=1).values.mean().item(), 3), round(delta.norm(dim=1).mean().item(), 3))

for X_adv in [X_square, X_round]:
    print((100 * (X_adv - X_valid)[0, 0]).round().int())
```

Trzy wiersze to PGD z poprzedniej lekcji z ε = 0,1 oraz okrągłe z ε = 0,5 i z ε = 0,68. Kolumny to dokładność pod atakiem oraz norma L∞ i norma L2 zaburzeń, uśrednione po obrazach.

Kwadratowy atak zmienia większość pikseli o całe swoje 0,1, a jego zaburzenia mają długość 0,68. Okrągły atak z ε = 0,5 robi prawie tyle samo szkody, 53,9% wobec 50,8%, zaburzeniami, które są krótsze, a których największa zmiana piksela jest dwa razy większa, 0,21. Z tą samą długością co kwadratowy, 0,68, zostawia 23,6%.

Dwie tabele to zaburzenia pierwszego obrazu, 0 z lekcji [Oszukiwanie sieci](01-fooling-a-network.pl.md#jeden-krok-zgodnie-ze-znakiem), w setnych. W kwadratowej kuli prawie każdy piksel przesuwa się o 10, a te, które przesuwają się mniej, zatrzymało `clamp(0, 1)`. W okrągłej kuli kilka pikseli przesuwa się o 14, 17 albo 21, a większość prawie się nie rusza: budżet idzie tam, gdzie nachylenia są największe.

Która norma jest więc właściwa? Żadna nie mierzy tego, co widzi człowiek. To zastępstwa, z którymi łatwo pracować: mała norma L∞ mówi, że żaden piksel nie zmienił się bardzo, a mała norma L2, że obraz jako całość nie zmienił się bardzo. Sieć, która wytrzymuje w jednej kuli, może upaść w drugiej, dlatego dokładność pod atakiem podaje się zawsze z jej normą i jej ε, na przykład „L∞, ε = 8/255”.

## Atak na embedding

Ostatnia warstwa sieci zamienia 50 liczb w 10 logitów. Te 50 liczb to to, co sieć do tego miejsca zrobiła z obrazu, i są jego [embeddingiem](../vocabulary/embedding.pl.md): obrazy, które dla sieci wyglądają podobnie, dostają liczby, które są blisko siebie. Wycinek z `nn.Sequential` daje warstwy z tego wycinka, więc `model[:-1]` to sieć bez ostatniej warstwy, z tymi samymi wagami:

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


embed = model[:-1]
with torch.no_grad():
    embeddings = embed(X_valid)
print(embeddings.shape)

away = (embeddings[1:] - embeddings[0]).norm(dim=1)
print(y_valid[0], round(away[y_valid[1:] == 0].mean().item(), 2), round(away[y_valid[1:] != 0].mean().item(), 2))


def push_away(embed, X, epsilon, alpha, steps, random_start=True):
    with torch.no_grad():
        home = embed(X)
    X_adv = X.clone()
    if random_start:
        X_adv = project(X + (torch.rand_like(X) * 2 - 1) * epsilon, X, epsilon)
    for step in range(steps):
        X_adv.requires_grad_()
        distance = ((embed(X_adv) - home) ** 2).sum()
        slope = torch.autograd.grad(distance, X_adv)[0]
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


original = X_valid[:1]
torch.manual_seed(0)
for random_start in [False, True]:
    attacked = push_away(embed, original, 0.1, 0.1 / 4, 20, random_start)
    with torch.no_grad():
        moved = (embed(attacked) - embed(original)).norm(dim=1)
        print(random_start, (attacked - original).abs().max(), moved, model(attacked).argmax(dim=1))
```

`away` to odległości od embeddingu pierwszego obrazu, 0, do embeddingów pozostałych 296. Pozostałe zera są od niego średnio 3,55, a obrazy innych cyfr 9,24. Z tym pracuje ostatnia warstwa: zera trzymają się razem, z dala od reszty.

Wiele sieci używa się tylko dla ich embeddingów, do porównywania obrazów albo przeszukiwania ich, i nie mają one klas, które dałoby się zaatakować. `push_away` atakuje sam embedding. To PGD w kwadratowej kuli, które wspina się po innej stracie: kwadracie odległości między embeddingiem zaatakowanego obrazu a `home`, embeddingiem obrazu takiego, jaki był. Nie ma w tym żadnej etykiety.

To atak, który nie ruszy bez [losowego startu](02-pgd.pl.md#losowy-start). Przy samym obrazie odległość wynosi 0, najmniej, ile może, a w najniższym punkcie każde nachylenie to 0. Znaki nachyleń też są wtedy równe 0 i obraz nigdy się nie rusza: wiersz, który zaczyna się od `False`, nie pokazuje żadnej zmiany ani w obrazie, ani w embeddingu. Z losowego obrazu w kuli atak przesuwa embedding o 3,53. To tyle, ile od jednego 0 do innego, a sieć nadal czyta 0.

Oto ten atak na wszystkich obrazach walidacyjnych, obok losowych zmian tej samej wielkości. Kolumny to ε, o ile atak średnio przesunął embeddingi, ułamek obrazów, które sieć czyta teraz jako inną cyfrę, i te same dwie liczby dla losowych zmian:

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


def push_away(embed, X, epsilon, alpha, steps):
    with torch.no_grad():
        home = embed(X)
    X_adv = project(X + (torch.rand_like(X) * 2 - 1) * epsilon, X, epsilon)
    for step in range(steps):
        X_adv.requires_grad_()
        distance = ((embed(X_adv) - home) ** 2).sum()
        slope = torch.autograd.grad(distance, X_adv)[0]
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


embed = model[:-1]


def moved(X_adv):
    with torch.no_grad():
        return (embed(X_adv) - embed(X_valid)).norm(dim=1).mean().item()


def reads_changed(X_adv):
    with torch.no_grad():
        return (model(X_adv).argmax(dim=1) != model(X_valid).argmax(dim=1)).float().mean().item()


torch.manual_seed(0)
for epsilon in [0.1, 0.15, 0.2]:
    X_adv = push_away(embed, X_valid, epsilon, epsilon / 4, 20)
    X_noisy = project(X_valid + (torch.rand_like(X_valid) * 2 - 1) * epsilon, X_valid, epsilon)
    print(epsilon, round(moved(X_adv), 2), round(reads_changed(X_adv), 3), round(moved(X_noisy), 2), round(reads_changed(X_noisy), 3))
```

Przy ε = 0,2 atak przesuwa embeddingi średnio o 5,68, wyraźnie więcej niż 3,55 między pierwszym 0 a pozostałymi zerami, a sieć czyta 75,4% obrazów jako inną cyfrę niż przedtem. Losowe zmiany tej samej wielkości przesuwają embeddingi o około 1 i zmieniają 2,7% odczytów.

Atak, który zna etykiety, robi więcej przy tym samym ε: PGD zostawiło sieci przy 0,2 zaledwie 1%. Ale ten nie widział żadnej etykiety, a psuje naraz wszystko, co zbudowano na embeddingu, czy to ostatnią warstwę, wyszukiwanie, czy porównanie dwóch obrazów. Jedną sumę w `push_away` można zamienić na inną, żeby go wycelować: odległość od embeddingu jakiegoś innego obrazu, z krokiem przeciwnym do nachyleń, przyciąga embedding obrazu do embeddingu tamtego obrazu.

## Podsumowanie

- Atak nieukierunkowany wspina się po stracie dla właściwej etykiety. Ukierunkowany schodzi w dół straty dla etykiety, której chce, krokami przeciwnymi do znaków nachyleń. Dojście do wybranej klasy wymaga większego ε niż jakakolwiek pomyłka.
- Zaburzenie to zmiana, którą robi atak, `X_adv - X`. Jego norma L∞ to jego największa zmiana piksela, a norma L2 to jego długość: `delta.abs().max()` i `delta.norm()`.
- Każda norma ma swoją kulę. W kuli L2 PGD robi kroki wzdłuż nachyleń, przeskalowanych do długości α, a rzut skraca zaburzenie, które jest za długie.
- Dokładność pod atakiem coś znaczy tylko razem z jej normą i jej ε.
- Embedding można zaatakować bez etykiet, odpychając go od miejsca, w którym był. Przy samym obrazie nachylenia są równe 0, więc ten atak potrzebuje losowego startu.

## Sprawdź się

<details>
<summary>Zaburzenie zmienia cztery piksele o 0,3, −0,4, 0 i 0. Ile wynoszą jego norma L∞ i norma L2?</summary>

0,4 i 0,5. Norma L∞ to największa zmiana bez znaku, 0,4. Norma L2 to pierwiastek z sumy kwadratów: 0,09 + 0,16 = 0,25, a pierwiastek z tego to 0,5.

</details>

<details>
<summary>Co zmienia się w kroku PGD, żeby atak był ukierunkowany?</summary>

Etykieta i kierunek. Strata jest liczona dla celu, etykiety, której chce atakujący, a krok idzie przeciwnie do znaków jej nachyleń, żeby ta strata malała: `X_adv - alpha * slope.sign()`. Rzut zostaje bez zmian.

</details>

<details>
<summary>Atak, który odpycha embedding, zaczyna od samego obrazu i zwraca obraz niezmieniony. Dlaczego?</summary>

Odległość embeddingu od niego samego to 0, najmniej, ile może wynosić odległość, a w najniższym punkcie wszystkie nachylenia są równe 0. Znak 0 to 0, więc żaden piksel się nie rusza, ani w tym kroku, ani w żadnym następnym. Losowy start w kuli daje atakowi kierunek, w którym odległość może rosnąć.

</details>

<details>
<summary>Jedna sieć zachowuje 60% pod „L∞, ε = 0,1”, a druga 60% pod „L2, ε = 0,1”, na obrazach z 64 pikseli. Która wytrzymała więcej?</summary>

Pierwsza, i to zdecydowanie. W kuli L∞ każdy z 64 pikseli może przesunąć się o 0,1, co daje zaburzenia o długości do 0,8. Kula L2 o promieniu 0,1 mieści tylko zaburzenia o długości najwyżej 0,1. Tych liczb nie da się porównać bez ich norm.

</details>

## Twoja kolej

W ćwiczeniu [Wyceluj w klasę](../../exercises/07-adversarial-examples/03-targets-and-norms/01-aim-at-a-class/task.pl.md) napiszesz ukierunkowane PGD. W ćwiczeniu [Odepchnij embedding](../../exercises/07-adversarial-examples/03-targets-and-norms/02-push-an-embedding-away/task.pl.md) napiszesz atak, który przesuwa embedding obrazu jak najdalej od miejsca, w którym był.
