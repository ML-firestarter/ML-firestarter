---
description: Wytrenuj tę samą regresję liniową z nn.Linear, optymalizatorem i funkcją straty z PyTorcha i zobacz, że liczby zgadzają się z wersją ręczną.
---

# Regresja liniowa z nn.Linear

[Poprzednia lekcja](04-linear-regression-by-hand.pl.md) wypisała wszystko: wagi, iloczyn, stratę i kroki. Każdy model ma te same części, więc PyTorch ma gotową do każdej z nich, a trening modelu dowolnej wielkości wygląda jak w tej lekcji, ile by miał warstw. Tutaj zastępują one części ręczne, jedna po drugiej, na tych samych stu kursach.

## Warstwa dla prostej

`nn.Linear(in_features, out_features)` to $Xw + b$ z parametrami w środku: wagą dla każdej pary wejścia i wyjścia i wyrazem wolnym dla każdego wyjścia. Model wywołuje się jak funkcję, na tabeli cech, a on liczy predykcję dla każdego wiersza:

```python run
import torch
import torch.nn as nn

torch.manual_seed(42)
model = nn.Linear(in_features=2, out_features=1)

print(model)
print(model.weight)
print(model.bias)
print([name for name, parameter in model.named_parameters()])
print(sum(parameter.numel() for parameter in model.parameters()))

X = torch.tensor([[0.5, -1.0], [1.5, 2.0]])
print(model(X))
```

Wagi to `Parameter`, tensor, który już ma `requires_grad`, więc niczego nie trzeba oznaczać. Jego kształt to `[1, 2]`: `[out_features, in_features]`, transpozycja `[2, 1]`, które miało `w` ręcznie, bo warstwa liczy $Xw^\top + b$. Model ma do nauczenia 3 liczby: 2 wagi i wyraz wolny. `model.parameters()` wymienia je wszystkie, a tego potrzebuje optymalizator. Liczby są losowe, a `manual_seed` sprawia, że na twoim komputerze są takie same.

`grad_fn` predykcji to `AddmmBackward0`: iloczyn macierzy i dodawanie w jednym kroku, który wykonuje warstwa.

## Strata i optymalizator

`nn.MSELoss()` to błąd średniokwadratowy, funkcja predykcji i etykiet, a `torch.optim.SGD` wykonuje kroki spadku gradientu: `step()` zmienia każdy parametr przeciwnie do jego nachylenia, a `zero_grad()` zeruje nachylenia. PyTorch nazywa funkcję straty **kryterium** (ang. criterion):

```python run
import torch
import torch.nn as nn

criterion = nn.MSELoss()
print(criterion(torch.tensor([1.0, 2.0]), torch.tensor([2.0, 4.0])))
```

Błędy do kwadratu to 1 i 4, a ich średnia to 2,5.

## Trening

Żeby porównać z lekcją ręczną, model zaczyna od wag, które miało tam `w`, a wyraz wolny od 0. Dane i standaryzacja są takie same. Pętla ma te same cztery kroki, przód, wstecz, krok i zerowanie, a dwa wiersze kroku i zerowania to teraz po jednym:

```python run
import torch
import torch.nn as nn

torch.manual_seed(42)
n = 100
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)
X_std = (X - X.mean(dim=0, keepdim=True)) / X.std(dim=0, keepdim=True, correction=0)

w_start = torch.randn(2, 1)
model = nn.Linear(2, 1)
with torch.no_grad():
    model.weight.copy_(w_start.T)
    model.bias.zero_()

criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)

n_epochs = 100
for epoch in range(n_epochs):
    y_pred = model(X_std)
    loss = criterion(y_pred, y)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()
    if epoch % 20 == 0 or epoch == n_epochs - 1:
        print(epoch + 1, round(loss.item(), 4))

print(model.weight)
print(model.bias)
```

Straty są te z lekcji ręcznej, od 1147 do 0,71, tak samo jak wagi, 10,63 i 1,20, i wyraz wolny, 31,85: ten sam trening, w mniejszej liczbie wierszy. `model.weight.copy_(...)` kopiuje liczby do wag, w miejscu, i to wewnątrz `torch.no_grad()`, bo wagi wymagają gradientu. Bez tego model zaczynałby od własnych losowych wag i i tak skończył na tej samej prostej.

## Predykcja

Wytrenowany model przewiduje nowe kursy, ustandaryzowane ze średnimi i rozrzutami kursów treningowych, jak wcześniej. `torch.no_grad()` trzyma predykcje poza zapisem:

```python run
import torch
import torch.nn as nn

torch.manual_seed(42)
n = 100
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)
means = X.mean(dim=0, keepdim=True)
stds = X.std(dim=0, keepdim=True, correction=0)
X_std = (X - means) / stds

model = nn.Linear(2, 1)
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
for epoch in range(200):
    loss = criterion(model(X_std), y)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()

new_rides = torch.tensor([[5.0, 4.0], [10.0, 0.0]])
with torch.no_grad():
    print(model((new_rides - means) / stds))
```

Ten model zaczął od losowych wag i trenował 200 epok, a przewiduje te same opłaty co ręczny: 24,98 zł za 5 km z 4 minutami postoju i 38,34 zł za 10 km bez postoju.

## Podsumowanie

- `nn.Linear(in_features, out_features)` to warstwa z wagą dla każdego wejścia i wyjścia oraz wyrazem wolnym dla każdego wyjścia. Jej waga ma kształt `[out_features, in_features]`. Model wywołuje się na tabeli, a `model.parameters()` wymienia to, czego się uczy.
- `nn.MSELoss()` to błąd średniokwadratowy, a funkcje straty nazywa się kryteriami. `torch.optim.SGD(model.parameters(), lr=...)` wykonuje kroki.
- Pętla to przód, `loss.backward()`, `optimizer.step()` i `optimizer.zero_grad()`.
- Z tym samym startem, tymi samymi danymi i tym samym współczynnikiem uczenia ten trening daje te same liczby co ręczny.
- Predykcje liczy się wewnątrz `torch.no_grad()`.

## Sprawdź się

<details>
<summary>Ile parametrów ma <code>nn.Linear(5, 3)</code> i jaki kształt ma jego waga?</summary>

18 parametrów: waga dla każdego z 5 wejść i każdego z 3 wyjść, razem 15, i wyraz wolny dla każdego wyjścia, jeszcze 3. Waga ma `[3, 5]`: `[out_features, in_features]`.

</details>

<details>
<summary>Co się stanie, jeśli w pętli zabraknie <code>optimizer.zero_grad()</code>?</summary>

Nachylenia się sumują, jak w części [Nachylenia się sumują](02-autograd.pl.md#nachylenia-się-sumują): każdy krok używa sumy wszystkich dotychczasowych nachyleń i trening idzie źle. Optymalizator sam ich nie zeruje.

</details>

<details>
<summary>Dlaczego <code>copy_</code> jest w przykładzie treningu wewnątrz <code>torch.no_grad()</code>?</summary>

Wagi wymagają gradientu, a zmiana w miejscu tensora, który wymaga gradientu, jest poza `no_grad` błędem. Kopiowanie liczb startowych do modelu nie jest krokiem modelu, więc też nie powinno być zapisywane.

</details>

## Twoja kolej

W ćwiczeniu [Model z wybranymi wagami](../../exercises/05-pytorch/05-linear-regression-with-nn-linear/01-a-model-with-chosen-weights/task.pl.md) zrobisz warstwę, która ma wagi, które jej podasz. W ćwiczeniu [Wytrenuj model](../../exercises/05-pytorch/05-linear-regression-with-nn-linear/02-train-a-model/task.pl.md) wytrenujesz dowolny model optymalizatorem i zachowasz jego straty.
