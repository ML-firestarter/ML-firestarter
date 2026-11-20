---
description: Wytrenuj regresję liniową na stu kursach, krok po kroku, samymi tensorami i autogradem, i odzyskaj ceny z naklejki na szybie taksówki.
---

# Regresja liniowa ręcznie

W części [Trening prostej opłat](02-autograd.pl.md#trening-prostej-opłat) prosta była dopasowywana do czterech paragonów. Prawdziwa firma ma ich setki, a kurs opisuje coś więcej niż sama odległość. W tej lekcji wytrenujesz regresję liniową na stu kursach, każdy z dwiema cechami, wyłącznie za pomocą tensorów i autogradu: na razie bez warstw i bez optymalizatorów. To, co PyTorch ma do tego samego zadania, pokazuje [następna lekcja](05-linear-regression-with-nn-linear.pl.md).

## Sto kursów

Kursy są wymyślone, ale tak, jak wyliczyłaby je naklejka na szybie taksówki: 3 zł za każdy kilometr, 0,50 zł za każdą minutę postoju i 8 zł na start, do tego mniej więcej złotówka szumu, którego naklejka nie wyjaśnia. Dzięki ziarnu za każdym razem powstają te same kursy, tutaj i na twoim komputerze:

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

`X` to tabela cech, z wierszem dla każdego kursu i kolumną dla każdej cechy: odległości i minut postoju. `y` zawiera opłaty i też jest tabelą, z jedną kolumną: ma kształt `[100, 1]`, a nie `[100]`. To ważne, za chwilę zobaczysz dlaczego.

## Cechy po standaryzacji

Odległości sięgają 13, a minuty 10, więc ich skale są zbliżone, ale prawdziwe cechy potrafią różnić się o rzędy wielkości. [Standaryzacja](01-tensors.pl.md#rozgłaszanie-standaryzacja-kolumn) sprowadza je do tej samej skali, dzięki czemu jeden współczynnik uczenia pasuje do wszystkich wag:

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

Średnie wystandaryzowanych kolumn wynoszą 0, z dokładnością do zaokrągleń liczb 32-bitowych, a ich rozrzuty 1.

## Model i jego strata

Predykcja dla każdego kursu to iloczyn skalarny jego cech i wag plus wyraz wolny: $\hat{y} = Xw + b$. `X` ma kształt `[100, 2]`, więc `w` ma kształt `[2, 1]`, po jednej wadze na cechę, a iloczyn ma kształt `[100, 1]`, po jednej predykcji na kurs. Wagi są na początku losowe, a wyraz wolny wynosi 0:

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

Funkcją straty jest błąd średniokwadratowy. Dwa ostatnie wiersze pokazują pomyłkę, przed którą PyTorch nie chroni. `y_pred` ma kształt `[100, 1]`, a `y.flatten()` kształt `[100]`, więc [rozgłaszanie](01-tensors.pl.md#rozgłaszanie-standaryzacja-kolumn) robi z nich tabelę `[100, 100]`, w której każda predykcja jest porównana z każdą opłatą. Jej średnia też jest liczbą, ale niczego nie mierzy. Predykcje i etykiety trzeba trzymać w tym samym kształcie: oba `[100, 1]`.

## Trening

Pętla jest taka sama jak w lekcji [Autograd](02-autograd.pl.md#krok-w-dół): przejście w przód, przejście wstecz, krok wewnątrz `torch.no_grad()` i zerowanie nachyleń. Co 20 epok wypisuje numer epoki i stratę. **Epoka** to jedno przejście przez wszystkie dane treningowe, tutaj jeden krok, bo wszystkie 100 kursów trafia do modelu naraz:

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

Strata spada z 1147 do 0,71 i tam się zatrzymuje. Do 0 dojść nie może z powodu szumu: kursy mają go w błędzie średniokwadratowym około 1, a prosta dopasowana do tej próbki osiąga 0,71. Wagi, 10,63 i 1,20, oraz wyraz wolny, 31,85, nie przypominają cen z naklejki, bo działają na wystandaryzowanych cechach.

## Z powrotem do złotych

Wystandaryzowana cecha to $(x - m) / s$, gdzie $m$ to średnia, a $s$ rozrzut. Prosta $w_1 \frac{x_1 - m_1}{s_1} + w_2 \frac{x_2 - m_2}{s_2} + b$ jest więc też prostą w pierwotnych cechach, z wagami $w_1 / s_1$ i $w_2 / s_2$ oraz wyrazem wolnym $b - w_1 m_1 / s_1 - w_2 m_2 / s_2$. W kodzie, z tensorami, które obsługują obie cechy naraz:

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

Trening znalazł 3,02 zł za kilometr, 0,44 zł za minutę postoju i 8,12 zł na start, czyli blisko 3, 0,5 i 8 z naklejki, i to ze stu zaszumionych kursów. Żeby przewidzieć opłaty za nowe kursy, najpierw standaryzuje się je średnimi i rozrzutami kursów treningowych, jak w [rozdziale o sieciach neuronowych](../04-foundations/04-neural-networks/04-inputs.pl.md#nowe-zamówienia), a `torch.no_grad()` sprawia, że predykcja nie trafia do zapisu obliczeń.

## Podsumowanie

- Regresja liniowa na tabeli to $\hat{y} = Xw + b$: `X` ma kształt `[n, cechy]`, `w` kształt `[cechy, 1]`, a predykcje `[n, 1]`.
- Etykiety trzeba trzymać w kształcie predykcji, `[n, 1]`. Przy `[n]` rozgłaszanie bez żadnego błędu tworzy stratę `[n, n]`, która nic nie znaczy.
- Cechy standaryzuje się średnimi i rozrzutami danych treningowych, a nowe kursy dokładnie tak samo.
- Pętla to przejście w przód, przejście wstecz, krok wewnątrz `torch.no_grad()` i zerowanie. Epoka to jedno przejście przez dane treningowe.
- Wagi znalezione dla wystandaryzowanych cech zamienia się z powrotem na wagi dla pierwotnych cech, dzieląc je przez rozrzut.

## Sprawdź się

<details>
<summary>Wagi mają kształt <code>[2, 1]</code>, a <code>X</code> kształt <code>[50, 2]</code>. Jaki kształt ma <code>X @ w + b</code>?</summary>

`[50, 1]`: iloczyn ma wiersz dla każdego z 50 wierszy `X` i kolumnę dla jedynej kolumny `w`, a wyraz wolny, pojedyncza liczba, jest dodawany do każdego elementu.

</details>

<details>
<summary>Strata spada do 0,71, a nie do 0. Czy coś jest nie tak?</summary>

Nie. Opłaty zawierają szum, którego żadna prosta nie wyjaśni, więc nawet najlepsza prosta myli się o mniej więcej złotówkę. Powodem do niepokoju byłaby strata równa dokładnie 0: oznaczałaby, że prosta nauczyła się szumu.

</details>

<details>
<summary>Dlaczego nowy kurs standaryzuje się średnimi kursów treningowych, a nie jego własnymi?</summary>

Wagi znaleziono dla cech wystandaryzowanych średnimi i rozrzutami kursów treningowych, więc działają tylko na cechach wystandaryzowanych tak samo. Średnia z jednego kursu to on sam, więc po standaryzacji zawsze wychodziłoby 0.

</details>

## Twoja kolej

W ćwiczeniu [Predykcje i strata](../../exercises/05-pytorch/04-linear-regression-by-hand/01-predict-and-score/task.pl.md) policzysz predykcje i stratę dla dowolnych wag. W ćwiczeniu [Dopasuj prostą](../../exercises/05-pytorch/04-linear-regression-by-hand/02-fit-a-line/task.pl.md) wytrenujesz regresję liniową na dowolnej tabeli cech.
