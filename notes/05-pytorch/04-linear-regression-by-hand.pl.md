---
description: Wytrenuj regresję liniową na stu kursach przy użyciu tensorów i autogradu, krok po kroku, i odzyskaj ceny z naklejki taksówki.
---

# Regresja liniowa ręcznie

[Trening prostej opłat](02-autograd.pl.md#trening-prostej-opłat) dopasował prostą do czterech paragonów. Prawdziwa firma ma ich setki, a każdy kurs ma więcej niż odległość. Ta lekcja trenuje regresję liniową na stu kursach, z których każdy ma dwie cechy, używając samych tensorów i autogradu: jeszcze bez warstw i optymalizatorów. [Następna lekcja](05-linear-regression-with-nn-linear.pl.md) pokazuje, co PyTorch ma do tego samego zadania.

## Sto kursów

Kursy są zmyślone, ale zmyślone tak, jak zrobiłaby je naklejka taksówki: 3 zł za każdy kilometr, 0,50 zł za każdą minutę postoju i 8 zł na start, plus złotówka szumu, której naklejka nie tłumaczy. Ziarno sprawia, że kursy są za każdym razem te same, tutaj i na twoim komputerze:

```python run
import torch

torch.manual_seed(42)
n = 100
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)

print(X.shape, y.shape)
print(X[:3])
print(y[:3])
```

`X` to tabela cech, z wierszem dla każdego kursu i kolumną dla każdej cechy: odległości i minut postoju. `y` zawiera opłaty i to też jest tabela, z jedną kolumną: kształt `[100, 1]`, a nie `[100]`. To ma znaczenie, jak zaraz zobaczysz.

## Cechy po standaryzacji

Odległości sięgają 13, a minuty 10, co jest dość blisko siebie, ale prawdziwe cechy mogą dzielić całe światy. [Standaryzacja](01-tensors.pl.md#rozgłaszanie-standaryzacja-kolumn) sprowadza je do tej samej skali, żeby jeden współczynnik uczenia pasował do wszystkich wag:

```python run
import torch

torch.manual_seed(42)
n = 100
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)

means = X.mean(dim=0, keepdim=True)
stds = X.std(dim=0, keepdim=True, correction=0)
X_std = (X - means) / stds
print(means, stds)
print(X_std.mean(dim=0).abs() < 1e-5)
print(X_std.std(dim=0, correction=0).round(decimals=3))
```

Średnie ustandaryzowanych kolumn wynoszą 0, z dokładnością do zaokrągleń liczb 32-bitowych, a ich rozrzuty 1.

## Model i jego strata

Predykcja dla każdego kursu to iloczyn skalarny jego cech z wagami plus wyraz wolny: $\hat{y} = Xw + b$. `X` ma kształt `[100, 2]`, więc `w` ma `[2, 1]`, po jednej wadze na cechę, a iloczyn ma `[100, 1]`, po jednej predykcji na kurs. Wagi zaczynają losowo, a wyraz wolny od 0:

```python run
import torch

torch.manual_seed(42)
n = 100
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)
X_std = (X - X.mean(dim=0, keepdim=True)) / X.std(dim=0, keepdim=True, correction=0)

w = torch.randn(2, 1, requires_grad=True)
b = torch.tensor(0.0, requires_grad=True)

y_pred = X_std @ w + b
print(y_pred.shape)

loss = ((y_pred - y) ** 2).mean()
print(loss)

wrong = ((y_pred - y.flatten()) ** 2).mean()
print((y_pred - y.flatten()).shape, wrong)
```

Strata to błąd średniokwadratowy. Dwa ostatnie wiersze pokazują pomyłkę, której PyTorch nie powstrzyma. `y_pred` ma `[100, 1]`, a `y.flatten()` ma `[100]`, i [rozgłaszanie](01-tensors.pl.md#rozgłaszanie-standaryzacja-kolumn) robi z nich tabelę `[100, 100]`, każda predykcja zestawiona z każdą opłatą. Średnia z niej to też liczba, ale to strata niczego. Trzymaj predykcje i etykiety w tym samym kształcie: obie `[100, 1]`.

## Trening

Pętla jest ta z lekcji [Autograd](02-autograd.pl.md#krok-w-dół): przód, wstecz, krok wewnątrz `torch.no_grad()` i zerowanie. Co 20 epok wypisuje epokę i stratę. **Epoka** to jedno przejście przez wszystkie dane treningowe, tutaj pojedynczy krok, bo wszystkie 100 kursów wchodzi naraz:

```python run
import torch

torch.manual_seed(42)
n = 100
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)
X_std = (X - X.mean(dim=0, keepdim=True)) / X.std(dim=0, keepdim=True, correction=0)

w = torch.randn(2, 1, requires_grad=True)
b = torch.tensor(0.0, requires_grad=True)

learning_rate = 0.1
n_epochs = 100
for epoch in range(n_epochs):
    y_pred = X_std @ w + b
    loss = ((y_pred - y) ** 2).mean()
    loss.backward()
    with torch.no_grad():
        w -= learning_rate * w.grad
        b -= learning_rate * b.grad
        w.grad.zero_()
        b.grad.zero_()
    if epoch % 20 == 0 or epoch == n_epochs - 1:
        print(epoch + 1, round(loss.item(), 4))

print(w.flatten(), b)
```

Strata spada z 1147 do 0,71 i tam zostaje. Nie może dojść do 0 przez szum: kursy mają około 1 szumu w błędzie do kwadratu, a prosta osiąga na tej próbce 0,71. Wagi, 10,63 i 1,20, oraz wyraz wolny, 31,85, nie wyglądają jak naklejka, bo działają na cechach po standaryzacji.

## Z powrotem do złotych

Ustandaryzowana cecha to $(x - \text{średnia}) / \text{rozrzut}$, więc prosta $w_1 \frac{x_1 - m_1}{s_1} + w_2 \frac{x_2 - m_2}{s_2} + b$ jest prostą także na oryginalnych cechach, z wagami $w_1 / s_1$ i $w_2 / s_2$ oraz wyrazem wolnym $b - w_1 m_1 / s_1 - w_2 m_2 / s_2$. W kodzie, z tensorami liczącymi obie cechy naraz:

```python run
import torch

torch.manual_seed(42)
n = 100
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)
means = X.mean(dim=0, keepdim=True)
stds = X.std(dim=0, keepdim=True, correction=0)
X_std = (X - means) / stds

w = torch.randn(2, 1, requires_grad=True)
b = torch.tensor(0.0, requires_grad=True)
for epoch in range(100):
    loss = ((X_std @ w + b - y) ** 2).mean()
    loss.backward()
    with torch.no_grad():
        w -= 0.1 * w.grad
        b -= 0.1 * b.grad
        w.grad.zero_()
        b.grad.zero_()

w_eur = w.detach().flatten() / stds.flatten()
b_eur = b.item() - (w.detach().flatten() * means.flatten() / stds.flatten()).sum().item()
print(w_eur, b_eur)

new_rides = torch.tensor([[5.0, 4.0], [10.0, 0.0]])
with torch.no_grad():
    print((new_rides - means) / stds @ w + b)
```

Trening znalazł 3,02 zł za kilometr, 0,44 zł za minutę postoju i 8,12 zł na start, blisko 3, 0,5 i 8 z naklejki, ze stu zaszumionych kursów. Żeby przewidzieć nowe kursy, najpierw standaryzuje się je ze średnimi i rozrzutami kursów treningowych, jak mówi [rozdział o sieciach neuronowych](../04-foundations/04-neural-networks/04-inputs.pl.md#nowe-zamówienia), a `torch.no_grad()` trzyma predykcję poza zapisem.

## Podsumowanie

- Regresja liniowa na tabeli to $\hat{y} = Xw + b$: `X` ma `[n, cechy]`, `w` ma `[cechy, 1]`, a predykcje mają `[n, 1]`.
- Trzymaj etykiety w kształcie predykcji, `[n, 1]`. Przy `[n]` rozgłaszanie robi `[n, n]` i stratę niczego, bez żadnego błędu.
- Standaryzuj cechy ze średnimi i rozrzutami danych treningowych i tak samo standaryzuj nowe kursy.
- Pętla to przód, wstecz, krok wewnątrz `torch.no_grad()` i zerowanie. Epoka to jedno przejście przez dane treningowe.
- Wagi znalezione na ustandaryzowanych cechach zamieniają się z powrotem w wagi na oryginalnych cechach przez podzielenie przez rozrzut.

## Sprawdź się

<details>
<summary>Wagi mają kształt <code>[2, 1]</code>, a <code>X</code> ma <code>[50, 2]</code>. Jaki kształt ma <code>X @ w + b</code>?</summary>

`[50, 1]`: iloczyn ma wiersz dla każdego z 50 wierszy `X` i kolumnę dla jedynej kolumny `w`, a wyraz wolny, pojedyncza liczba, jest dodawany do każdego.

</details>

<details>
<summary>Strata spada do 0,71, a nie do 0. Czy coś jest nie tak?</summary>

Nie. Opłaty mają szum, którego żadna prosta nie tłumaczy, więc nawet najlepsza prosta myli się o około złotówkę. Strata dokładnie 0 byłaby powodem do niepokoju: oznaczałaby, że prosta nauczyła się szumu.

</details>

<details>
<summary>Dlaczego nowy kurs standaryzuje się ze średnimi i rozrzutami kursów treningowych, a nie własnymi?</summary>

Wagi znaleziono na cechach o średnich i rozrzutach kursów treningowych, więc działają tylko na cechach ustandaryzowanych tak samo. Średnia pojedynczego kursu to on sam i zawsze wychodziłby z niej 0.

</details>

## Twoja kolej

W ćwiczeniu [Policz predykcje i błąd](../../exercises/05-pytorch/04-linear-regression-by-hand/01-predict-and-score/task.pl.md) policzysz predykcje i stratę dla dowolnych wag. W ćwiczeniu [Dopasuj prostą](../../exercises/05-pytorch/04-linear-regression-by-hand/02-fit-a-line/task.pl.md) wytrenujesz regresję liniową na dowolnej tabeli cech.
