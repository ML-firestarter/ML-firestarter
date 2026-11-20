---
description: Wytrenuj tę samą regresję liniową z warstwą nn.Linear, optymalizatorem i funkcją straty z PyTorcha i przekonaj się, że liczby zgadzają się z wersją ręczną.
---

# Regresja liniowa z nn.Linear

[Poprzednia lekcja](04-linear-regression-by-hand.pl.md) rozpisywała wszystko ręcznie: wagi, iloczyn, stratę i kroki. Każdy model składa się z tych samych części, więc PyTorch ma gotowy element do każdej z nich, a trening modelu dowolnej wielkości, niezależnie od liczby warstw, wygląda tak jak w tej lekcji. Tutaj gotowe elementy zastępują ręczne, jeden po drugim, na tych samych stu kursach.

## Warstwa dla prostej

`nn.Linear(in_features, out_features)` to $Xw + b$ z parametrami w środku: po jednej wadze na każdą parę wejścia i wyjścia i po jednym wyrazie wolnym na każde wyjście. Model wywołuje się jak funkcję, na tabeli cech, a on liczy predykcję dla każdego wiersza:

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

Wagi to `Parameter`, czyli tensor, który ma już `requires_grad`, więc nie trzeba go oznaczać. Mają kształt `[1, 2]`, czyli `[out_features, in_features]`: to transpozycja kształtu `[2, 1]`, jaki miało `w` w wersji ręcznej, bo warstwa liczy $Xw^\top + b$. Model ma 3 liczby do nauczenia: 2 wagi i wyraz wolny. `model.parameters()` zwraca je wszystkie, a właśnie tego potrzebuje optymalizator. Liczby są losowe, a `manual_seed` sprawia, że na twoim komputerze wyjdą takie same.

`grad_fn` predykcji to `AddmmBackward0`: iloczyn macierzy i dodawanie w jednym kroku, z którego korzysta warstwa.

## Strata i optymalizator

`nn.MSELoss()` to błąd średniokwadratowy, czyli funkcja predykcji i etykiet, a `torch.optim.SGD` robi kroki spadku gradientu: `step()` przesuwa każdy parametr przeciwnie do jego nachylenia, a `zero_grad()` zeruje nachylenia. Funkcję straty PyTorch nazywa **kryterium** (ang. criterion):

```python run
import torch
import torch.nn as nn

criterion = nn.MSELoss()
print(criterion(torch.tensor([1.0, 2.0]), torch.tensor([2.0, 4.0])))
```

Kwadraty błędów wynoszą 1 i 4, a ich średnia 2,5.

## Trening

Żeby dało się porównać wyniki z lekcją ręczną, model zaczyna od wag, jakie miało tam `w`, a wyraz wolny od 0. Dane i standaryzacja też są te same. Pętla ma te same cztery kroki: przejście w przód, przejście wstecz, krok i zerowanie, tyle że krok i zerowanie zajmują teraz po jednym wierszu:

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

Straty są takie same jak w lekcji ręcznej, od 1147 do 0,71, podobnie wagi, 10,63 i 1,20, i wyraz wolny, 31,85: to ten sam trening, tylko krótszy w zapisie. `model.weight.copy_(...)` kopiuje liczby do wag w miejscu, i to wewnątrz `torch.no_grad()`, bo wagi wymagają gradientu. Bez tego model zacząłby od własnych losowych wag, a i tak skończyłby na tej samej prostej.

## Przewidywanie

Wytrenowany model przewiduje opłaty za nowe kursy, wystandaryzowane, jak wcześniej, średnimi i rozrzutami kursów treningowych. `torch.no_grad()` sprawia, że predykcje nie trafiają do zapisu obliczeń:

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

Ten model zaczynał od losowych wag i trenował przez 200 epok, a przewiduje te same opłaty co model z lekcji ręcznej: 24,98 zł za 5 km z 4 minutami postoju i 38,34 zł za 10 km bez postoju.

## Podsumowanie

- `nn.Linear(in_features, out_features)` to warstwa z wagą dla każdej pary wejścia i wyjścia oraz wyrazem wolnym dla każdego wyjścia. Jej waga ma kształt `[out_features, in_features]`. Model wywołuje się na tabeli, a `model.parameters()` zwraca to, czego się uczy.
- `nn.MSELoss()` to błąd średniokwadratowy, a funkcje straty nazywa się kryteriami. Kroki robi `torch.optim.SGD(model.parameters(), lr=...)`.
- Pętla to przejście w przód, `loss.backward()`, `optimizer.step()` i `optimizer.zero_grad()`.
- Przy tym samym starcie, tych samych danych i tym samym współczynniku uczenia ten trening daje te same liczby co ręczny.
- Predykcje liczy się wewnątrz `torch.no_grad()`.

## Sprawdź się

<details>
<summary>Ile parametrów ma <code>nn.Linear(5, 3)</code> i jaki kształt ma jej waga?</summary>

18 parametrów: po jednej wadze na każdą parę z 5 wejść i 3 wyjść, czyli 15, i po jednym wyrazie wolnym na każde wyjście, czyli jeszcze 3. Waga ma kształt `[3, 5]`, czyli `[out_features, in_features]`.

</details>

<details>
<summary>Co się stanie, jeśli w pętli zabraknie <code>optimizer.zero_grad()</code>?</summary>

Nachylenia będą się kumulować, jak w części [Nachylenia się sumują](02-autograd.pl.md#nachylenia-się-sumują): każdy krok użyje sumy wszystkich dotychczasowych nachyleń i trening się rozjedzie. Optymalizator sam ich nie zeruje.

</details>

<details>
<summary>Dlaczego w przykładzie z treningiem <code>copy_</code> jest wewnątrz <code>torch.no_grad()</code>?</summary>

Wagi wymagają gradientu, a zmiana w miejscu tensora, który wymaga gradientu, jest poza `no_grad` błędem. Poza tym kopiowanie początkowych liczb do modelu nie jest krokiem modelu, więc nie powinno trafić do zapisu obliczeń.

</details>

## Twoja kolej

W ćwiczeniu [Model z wybranymi wagami](../../exercises/05-pytorch/05-linear-regression-with-nn-linear/01-a-model-with-chosen-weights/task.pl.md) utworzysz warstwę z wagami, które jej podasz. W ćwiczeniu [Wytrenuj model](../../exercises/05-pytorch/05-linear-regression-with-nn-linear/02-train-a-model/task.pl.md) wytrenujesz dowolny model optymalizatorem i zapiszesz jego kolejne straty.
