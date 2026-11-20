---
description: Wyceluj atak w wybraną klasę, zmierz perturbację w normach L∞ i L2, zaatakuj w kuli L2 i odsuń embedding obrazu, nie używając żadnej etykiety.
---

# Cele i normy

Dotychczasowe ataki miały tylko sprawić, żeby sieć się pomyliła, obojętnie jak. Kierowcy nie jest to obojętne: jedynka odczytana jako czwórka nic mu nie da, jeśli chciał siódemki. W tej lekcji atak zostaje wycelowany w konkretną klasę. Potem zobaczysz, że wielkość zmiany można mierzyć inaczej niż największą zmianą piksela, a na koniec zaatakujesz embeddingi sieci, do czego klasy w ogóle nie są potrzebne.

## Atak ukierunkowany

Atak, któremu wystarczy jakakolwiek błędna odpowiedź, jest **nieukierunkowany** (ang. untargeted): zwiększa stratę dla prawdziwej etykiety. Atak **ukierunkowany** (ang. targeted) ma wybraną etykietę, **klasę docelową** (ang. target), i zmniejsza stratę dla niej, więc kroki idą przeciwnie do znaków nachyleń. To w gruncie rzeczy pętla treningowa skierowana na obraz: spadek gradientu w stronę wybranej etykiety, w którym zmieniają się piksele, a wagi pozostają takie, jakie były.

Oto [PGD](02-pgd.pl.md#rzutowany-spadek-gradientu) z jednym dodatkowym ustawieniem. Przy `targeted=True` w `y` są etykiety, których chce atakujący, a nachylenia mają odwrócony znak. Atakowany obraz to drugi z obrazów walidacyjnych, jedynka, a klasa docelowa to siódemka:

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

Kolumny to ε, cyfra, którą rozpoznaje sieć, i prawdopodobieństwo, jakie przypisuje siódemce. Przy ε = 0,1 sieć nadal widzi jedynkę i daje siódemce tylko 0,19. Przy 0,15 rozpoznaje już siódemkę, a przy 0,2 jest jej niemal pewna: daje jej 0,94. Poniżej wypisano obok siebie jedynkę kierowcy i obraz, który przy ε = 0,15 sieć odczytuje jako siódemkę.

Wymuszenie konkretnej klasy jest trudniejsze niż samo wywołanie błędu. Oto wyniki dla ε = 0,15 na wszystkich obrazach walidacyjnych: najpierw odsetek obrazów, na których nieukierunkowane PGD oszukało sieć, a potem dla każdej cyfry odsetek obrazów innych cyfr, które po ukierunkowanym PGD sieć rozpoznaje jako tę cyfrę. `torch.full_like(y_valid[others], digit)` to tensor o kształcie tych etykiet, wypełniony daną cyfrą:

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

Atak nieukierunkowany oszukuje sieć na 89,6% obrazów. Atak wycelowany w jedną cyfrę przy tym samym ε osiąga od 17,8% dla szóstki do 61,8% dla ósemki. Do niektórych cyfr łatwo dojść od większości pozostałych, do innych trudno, ale żadna nie zbliża się do wyniku ataku, któremu wystarczy dowolna pomyłka.

## Mierzenie perturbacji

Zmianę, jaką atak wprowadza do obrazu, `X_adv - X`, nazywa się **perturbacją** (ang. perturbation). Dotąd za jej wielkość uznawano największą zmianę pojedynczego piksela. To jedna z **norm**, czyli sposobów opisania wielkości całej listy liczb jedną liczbą, ale nie jedyna. Najczęściej używa się dwóch:

- **Norma L∞** to największa z wartości bezwzględnych zmian: `delta.abs().max()`.
- **Norma L2** to pierwiastek z sumy kwadratów zmian: `delta.norm()`. To długość perturbacji, czyli odległość w linii prostej między dwoma obrazami, liczona tak, jak twierdzenie Pitagorasa liczy przekątną prostokąta, tyle że w tylu wymiarach, ile jest pikseli.

Oto dwie perturbacje obrazu złożonego z czterech pikseli. Pierwsza zmienia każdy piksel o 0,1, druga tylko jeden piksel, za to o 0,2:

```python run
import torch

spread = torch.tensor([0.1, -0.1, 0.1, -0.1])
single = torch.tensor([0.2, 0.0, 0.0, 0.0])

for delta in [spread, single]:
    print(delta.abs().max(), delta.norm())
```

W normie L2 obie są tej samej wielkości: cztery kwadraty liczby 0,1 dają razem 0,04, tyle samo co kwadrat liczby 0,2, a pierwiastek z tego to 0,2. W normie L∞ druga jest dwa razy większa od pierwszej. To, która z dwóch zmian jest mniejsza, zależy od normy.

Każda norma wyznacza własną kulę. Przy dwóch pikselach obrazy odległe od danego najwyżej o 0,1 w normie L∞ tworzą kwadrat, bo każdy piksel ma osobny limit, a w normie L2 koło. Przy trzech pikselach są to sześcian i kula, a nazwę „kula” stosuje się dla dowolnej liczby pikseli i dowolnej normy. Kula z dwóch poprzednich lekcji była więc tą kwadratową.

## Kula w normie L2

W kuli L2 ograniczona jest długość całej perturbacji. Jeden piksel może się zmienić mocno, o ile pozostałe zmienią się niewiele. Atak w takiej kuli różni się od PGD w dwóch miejscach:

- Krok idzie wzdłuż samych nachyleń, przeskalowanych do długości α, a nie wzdłuż ich znaków. Gdy ograniczona jest długość, strata rośnie najszybciej w kierunku nachyleń, więc najbardziej zmieniają się piksele o największych nachyleniach.
- Rzutowanie skraca perturbację dłuższą niż ε do długości ε, nie zmieniając jej kierunku.

Funkcja `lengths` poniżej daje normę L2 każdego obrazu w porcji: `flatten(1)` zamienia każdy obraz w wiersz 64 liczb, `norm(dim=1)` liczy normę każdego wiersza, a `reshape(-1, 1, 1, 1)` nadaje wynikowi kształt, który da się rozgłosić na porcję obrazów. Składnik `1e-12` chroni przed dzieleniem przez 0:

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

Trzy wiersze wyniku to PGD z poprzedniej lekcji z ε = 0,1 oraz atak w kuli L2 z ε = 0,5 i z ε = 0,68. Kolumny to dokładność pod atakiem oraz norma L∞ i norma L2 perturbacji, uśrednione po obrazach.

Atak w kuli kwadratowej zmienia większość pikseli o pełne 0,1, a jego perturbacje mają długość 0,68. Atak w kuli L2 z ε = 0,5 robi prawie tyle samo szkody (53,9% wobec 50,8%) krótszymi perturbacjami, w których jednak najbardziej zmieniony piksel zmienia się dwa razy mocniej: o 0,21. Gdy dostanie tę samą długość co atak w kuli kwadratowej, 0,68, dokładność spada do zaledwie 23,6%.

Dwie tabele pokazują w setnych perturbacje pierwszego obrazu, zera z lekcji [Oszukiwanie sieci](01-fooling-a-network.pl.md#jeden-krok-zgodnie-ze-znakiem). W kuli kwadratowej prawie każdy piksel zmienia się o 10, a te, które zmieniły się mniej, zatrzymało `clamp(0, 1)`. W kuli L2 kilka pikseli zmienia się o 14, 17 albo 21, a większość prawie wcale: cały budżet trafia tam, gdzie nachylenia są największe.

Która norma jest więc właściwa? Żadna nie mierzy tego, co widzi człowiek. To wygodne przybliżenia: mała norma L∞ mówi, że żaden piksel nie zmienił się mocno, a mała norma L2, że obraz jako całość zmienił się niewiele. Sieć, która wytrzymuje atak w jednej kuli, może ulec w drugiej, dlatego dokładność pod atakiem zawsze podaje się razem z normą i ε, na przykład „L∞, ε = 8/255”.

## Atak na embedding

Ostatnia warstwa sieci zamienia 50 liczb na 10 logitów. Te 50 liczb to wszystko, co sieć zdążyła wyczytać z obrazu, czyli jego [embedding](../vocabulary/embedding.pl.md): obrazy, które dla sieci wyglądają podobnie, dostają podobne liczby. Wycinek z `nn.Sequential` to sieć złożona z wyciętych warstw, więc `model[:-1]` to sieć bez ostatniej warstwy, z tymi samymi wagami:

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

`away` zawiera odległości od embeddingu pierwszego obrazu, zera, do embeddingów pozostałych 296 obrazów. Pozostałe zera są od niego średnio w odległości 3,55, a obrazy innych cyfr w odległości 9,24. Właśnie z tego korzysta ostatnia warstwa: zera skupiają się razem, z dala od reszty.

Wiele sieci wykorzystuje się wyłącznie ze względu na ich embeddingi, do porównywania albo wyszukiwania obrazów, a takie sieci nie mają żadnych klas, które można by zaatakować. `push_away` atakuje sam embedding. To PGD w kuli kwadratowej, które zwiększa inną stratę: kwadrat odległości między embeddingiem zaatakowanego obrazu a `home`, czyli embeddingiem obrazu sprzed ataku. Etykiety nie są tu potrzebne.

Ten atak nie ruszy bez [losowego punktu startowego](02-pgd.pl.md#losowy-punkt-startowy). W punkcie wyjścia odległość wynosi 0, mniej być nie może, a w minimum wszystkie nachylenia są zerowe. Ich znaki też są wtedy zerami i obraz w ogóle się nie zmienia: wiersz zaczynający się od `False` nie pokazuje żadnej zmiany ani w obrazie, ani w embeddingu. Startując z losowego obrazu w kuli, atak przesuwa embedding o 3,53. To mniej więcej tyle, ile dzieli jedno zero od innego, a sieć nadal rozpoznaje zero.

Oto ten atak na wszystkich obrazach walidacyjnych, obok losowych zmian tej samej wielkości. Kolumny to ε, średnie przesunięcie embeddingów, odsetek obrazów, które sieć rozpoznaje teraz jako inną cyfrę, i te same dwie liczby dla losowych zmian:

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

Przy ε = 0,2 atak przesuwa embeddingi średnio o 5,68, wyraźnie więcej niż średnia odległość 3,55 między pierwszym zerem a pozostałymi zerami, a sieć rozpoznaje 75,4% obrazów jako inną cyfrę niż wcześniej. Losowe zmiany tej samej wielkości przesuwają embeddingi o około 1 i zmieniają odczyt 2,7% obrazów.

Atak, który zna etykiety, osiąga przy tym samym ε więcej: przy ε = 0,2 dokładność po PGD wynosiła zaledwie 1%. Atak na embedding nie widział jednak żadnej etykiety, a psuje naraz wszystko, co zbudowano na embeddingu: ostatnią warstwę, wyszukiwanie i porównywanie obrazów. Żeby go wycelować, wystarczy zmienić jedną sumę w `push_away`: odległość do embeddingu innego obrazu, z krokami przeciwnymi do nachyleń, przyciąga embedding atakowanego obrazu do tamtego.

## Podsumowanie

- Atak nieukierunkowany zwiększa stratę dla prawdziwej etykiety. Ukierunkowany zmniejsza stratę dla wybranej klasy docelowej, robiąc kroki przeciwne do znaków nachyleń. Doprowadzenie do konkretnej klasy wymaga większego ε niż wywołanie dowolnej pomyłki.
- Perturbacja to zmiana wprowadzona przez atak, `X_adv - X`. Jej norma L∞ to największa zmiana piksela, a norma L2 to jej długość: `delta.abs().max()` i `delta.norm()`.
- Każda norma wyznacza własną kulę. W kuli L2 PGD robi kroki wzdłuż nachyleń przeskalowanych do długości α, a rzutowanie skraca zbyt długą perturbację.
- Dokładność pod atakiem ma sens tylko razem z normą i wartością ε.
- Embedding można zaatakować bez etykiet, odsuwając go od pierwotnego położenia. W punkcie wyjścia nachylenia są zerowe, więc ten atak potrzebuje losowego punktu startowego.

## Sprawdź się

<details>
<summary>Perturbacja zmienia cztery piksele o 0,3, −0,4, 0 i 0. Ile wynoszą jej norma L∞ i norma L2?</summary>

0,4 i 0,5. Norma L∞ to największa wartość bezwzględna zmiany, czyli 0,4. Norma L2 to pierwiastek z sumy kwadratów: 0,09 + 0,16 = 0,25, a pierwiastek z 0,25 to 0,5.

</details>

<details>
<summary>Co trzeba zmienić w kroku PGD, żeby atak był ukierunkowany?</summary>

Etykietę i kierunek. Stratę liczy się dla klasy docelowej, a krok idzie przeciwnie do znaków jej nachyleń, tak żeby ta strata malała: `X_adv - alpha * slope.sign()`. Rzutowanie pozostaje bez zmian.

</details>

<details>
<summary>Atak odsuwający embedding startuje z oryginalnego obrazu i zwraca go bez zmian. Dlaczego?</summary>

Odległość embeddingu od samego siebie wynosi 0, czyli najmniej, ile może wynosić odległość, a w minimum wszystkie nachylenia są zerowe. Znak zera to zero, więc żaden piksel się nie zmienia, ani w tym kroku, ani w następnych. Losowy punkt startowy w kuli daje atakowi kierunek, w którym odległość może rosnąć.

</details>

<details>
<summary>Jedna sieć zachowuje 60% dokładności przy „L∞, ε = 0,1”, a druga 60% przy „L2, ε = 0,1”, na obrazach z 64 pikseli. Która wytrzymała silniejszy atak?</summary>

Pierwsza, i to zdecydowanie. W kuli L∞ każdy z 64 pikseli może się zmienić o 0,1, co daje perturbacje o długości do 0,8. Kula L2 o promieniu 0,1 mieści tylko perturbacje o długości najwyżej 0,1. Bez norm tych liczb nie da się porównać.

</details>

## Twoja kolej

W ćwiczeniu [Wyceluj w klasę](../../exercises/07-adversarial-examples/03-targets-and-norms/01-aim-at-a-class/task.pl.md) napiszesz ukierunkowane PGD. W ćwiczeniu [Odsuń embedding](../../exercises/07-adversarial-examples/03-targets-and-norms/02-push-an-embedding-away/task.pl.md) napiszesz atak, który odsuwa embedding obrazu jak najdalej od jego pierwotnego położenia.
