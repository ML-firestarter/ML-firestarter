---
description: Pozwól PyTorchowi liczyć nachylenia za ciebie, oznaczając parametry i wywołując backward po przejściu w przód, a kroki spadku gradientu wykonuj bez śledzenia.
---

# Autograd

Trening potrzebuje nachylenia straty względem każdego parametru. W części [Trening](../04-foundations/02-linear-regression/03-training.pl.md#oba-parametry-naraz) dwa wzory dawały nachylenia względem $w$ i $b$, a dla [sieci](../04-foundations/04-neural-networks/02-backpropagation.pl.md) reguła łańcuchowa zajęła całą lekcję. PyTorch liczy je sam, dla każdego obliczenia złożonego z tensorów. To **autograd**, czyli automatyczne gradienty, i dzięki niemu trening sieci z milionami parametrów to kilka wierszy kodu.

## Jedna liczba

Tensor utworzony z `requires_grad=True` to liczba, dla której liczy się nachylenia. PyTorch zapisuje wszystko, co się z nią robi, a wynik takiego obliczenia pamięta, jak powstał: to `grad_fn` w jego wydruku. Wywołanie `backward()` na wyniku cofa się po tym zapisie i zostawia nachylenie wyniku względem tensora w jego `.grad`:

```python run
import torch

x = torch.tensor(5.0, requires_grad=True)
f = x ** 2
print(f)

f.backward()
print(x.grad)
```

$f(x) = x^2$ ma nachylenie $2x$, czyli 10 dla $x = 5$, i to właśnie jest `x.grad`. `PowBackward0` to nazwa kroku, który w zapisie utworzył `f`, czyli potęgowania: kroku, który odtwarzany wstecz zamienia nachylenie $f$ w nachylenie względem $x$.

Nachylenia mają tylko liczby zmiennoprzecinkowe. `torch.tensor(5, requires_grad=True)` składa się z liczby całkowitej i PyTorch odmawia komunikatem „Only Tensors of floating point and complex dtype can require gradients”: napisz `5.0`.

## Nachylenia straty

To samo działa dla całego modelu. Weź jeden paragon taksówki: 4 km i opłata 23. Prosta z wagą $w = 2$ i wyrazem wolnym $b = 5$ przewiduje $2 \times 4 + 5 = 13$, a błąd do kwadratu to $(13 - 23)^2 = 100$:

```python run
import torch

km = 4.0
fare = 23.0
w = torch.tensor(2.0, requires_grad=True)
b = torch.tensor(5.0, requires_grad=True)

prediction = w * km + b
loss = (prediction - fare) ** 2
print(prediction)
print(loss)

loss.backward()
print(w.grad, b.grad)
```

Nachylenia to −80 względem $w$ i −20 względem $b$: dwa wzory z rozdziału dla jednego kursu, $2(\hat{y} - y)\,x = 2 \times (13 - 23) \times 4 = -80$ i $2(\hat{y} - y) = -20$. Oba są ujemne, więc zwiększenie któregokolwiek z parametrów zmniejsza stratę. Nikt nie musiał liczyć wzorów: `loss.backward()` cofnęło się przez potęgowanie, odejmowanie, dodawanie i mnożenie i w każdym kroku zastosowało regułę łańcuchową.

Przy czterech paragonach strata to średnia z czterech błędów do kwadratu, a tensory mogą pomieścić je wszystkie:

```python run
import torch

kms = torch.tensor([2.0, 4.0, 6.0, 8.0])
fares = torch.tensor([15.0, 23.0, 29.0, 33.0])
w = torch.tensor(0.0, requires_grad=True)
b = torch.tensor(0.0, requires_grad=True)

loss = ((w * kms + b - fares) ** 2).mean()
print(loss)

loss.backward()
print(w.grad, b.grad)
```

Dla $w = 0$ i $b = 0$ strata wynosi 671, a nachylenia −280 i −50, tak jak dają wzory dla paragonów dziennych.

> [!NOTE]
> `backward()` potrzebuje straty, która jest jedną liczbą. Na tensorze z kilkoma liczbami, jak `w * kms`, kończy się komunikatem „grad can be implicitly created only for scalar outputs”. Najpierw uśrednij liczby przez `mean()` albo zsumuj je przez `sum()`.

## Nachylenia się sumują

Każde wywołanie `backward()` *dodaje* znalezione nachylenia do tego, co jest w `.grad`, a nie je zastępuje. To przydaje się, gdy strata składa się z części, ale pętla treningowa, która rusza od nowa ze starymi nachyleniami wciąż na miejscu, robi za duże kroki:

```python run
import torch

w = torch.tensor(3.0, requires_grad=True)

print("not reset")
for step in range(3):
    loss = (w * 4 - 8) ** 2
    loss.backward()
    print(w.grad)

w.grad.zero_()

print("reset")
for step in range(3):
    loss = (w * 4 - 8) ** 2
    loss.backward()
    print(w.grad)
    w.grad.zero_()
```

Strata ma za każdym razem to samo nachylenie, 32. Bez `zero_()` nachylenia piętrzą się jako 32, 64 i 96. `zero_()` to jedna z metod z podkreślnikiem z lekcji [Tensory](01-tensors.pl.md#zmiany-w-miejscu): ustawia liczby na 0 w miejscu.

## Krok w dół

Krok spadku gradientu zmienia parametry: $w \leftarrow w - \eta \, \frac{\partial L}{\partial w}$. Ale parametr to tensor, który wymaga gradientu, i PyTorch nie pozwoli kroku go zmienić, bo krok stałby się częścią zapisu. Kończy się to komunikatem „a leaf Variable that requires grad is being used in an in-place operation”, gdzie liść (ang. leaf) to tensor, który sam utworzyłeś, jak `w`:

```python run
import torch

w = torch.tensor(3.0, requires_grad=True)
loss = (w * 4 - 8) ** 2
loss.backward()

w -= 0.01 * w.grad
```

Wewnątrz `with torch.no_grad():` nic nie jest zapisywane i parametr może się zmienić:

```python run
import torch

w = torch.tensor(3.0, requires_grad=True)
loss = (w * 4 - 8) ** 2
loss.backward()

with torch.no_grad():
    w -= 0.01 * w.grad

print(w)
```

3 − 0,01 × 32 = 2,68. `w` nadal jest tensorem, który wymaga gradientu, więc jest gotowy na następną rundę.

Pętla treningowa ma za każdym razem te same cztery kroki, niezależnie od modelu:

1. **Przód**: policz stratę z parametrów.
2. **Wstecz**: `loss.backward()` wkłada nachylenia do `.grad`.
3. **Krok**: zmień każdy parametr przeciwnie do jego nachylenia, wewnątrz `torch.no_grad()`.
4. **Zerowanie**: ustaw każde `.grad` z powrotem na 0.

Oto one dla $f(x) = x^2$, od $x = 5$, ze współczynnikiem uczenia 0,1. Co 20 kroków pętla wypisuje numer kroku i $x$ po nim:

```python run
import torch

x = torch.tensor(5.0, requires_grad=True)
learning_rate = 0.1

for step in range(101):
    f = x ** 2
    f.backward()
    with torch.no_grad():
        x -= learning_rate * x.grad
    x.grad.zero_()
    if step % 20 == 0:
        print(step, round(x.item(), 4))
```

Nachylenie w $x$ to $2x$, więc każdy krok odejmuje od $x$ wartość $0{,}1 \times 2x = 0{,}2x$ i mnoży $x$ przez 0,8. $x$ maleje w stronę 0, czyli dna miski.

## Trening prostej opłat

Oto trening z części [Trening](../04-foundations/02-linear-regression/03-training.pl.md#oba-parametry-naraz) jeszcze raz, na paragonach dziennych, z tym samym współczynnikiem uczenia 0,01 i tymi samymi 5000 kroków. Pętla po kursach i dwa wzory na nachylenia zniknęły: strata to jeden wiersz, a resztę robi `backward()`:

```python run
import torch

kms = torch.tensor([2.0, 4.0, 6.0, 8.0])
fares = torch.tensor([15.0, 23.0, 29.0, 33.0])
w = torch.tensor(0.0, requires_grad=True)
b = torch.tensor(0.0, requires_grad=True)
learning_rate = 0.01

for step in range(5001):
    loss = ((w * kms + b - fares) ** 2).mean()
    loss.backward()
    if step % 1000 == 0:
        print(step, round(loss.item(), 2), round(w.item(), 2), round(b.item(), 2))
    with torch.no_grad():
        w -= learning_rate * w.grad
        b -= learning_rate * b.grad
    w.grad.zero_()
    b.grad.zero_()
```

Liczby są te same co w rozdziale, który liczył zwykłym Pythonem: strata spada z 671 do 1, a prosta kończy z $w = 3$ i $b = 10$. Autograd równie łatwo znalazłby nachylenia straty dowolnego innego modelu i do tego posłużą w następnych lekcjach.

## Wyłączanie śledzenia

Policzenie predykcji nie potrzebuje zapisu, bo nic nie będzie się przez nią cofać. `torch.no_grad()` pomija zapis, co oszczędza czas i pamięć:

```python run
import torch

w = torch.tensor(3.0, requires_grad=True)
b = torch.tensor(10.0, requires_grad=True)

fare = w * 5 + b
print(fare)

with torch.no_grad():
    fare = w * 5 + b
print(fare)
```

Pierwsza opłata pamięta, jak powstała, a druga nie. Tensor z zapisem nie może wprost stać się tablicą NumPy: `.detach()` daje te same liczby bez zapisu, a `fare.detach().numpy()` działa tam, gdzie `fare.numpy()` mówi, że nie może.

## Sprawdź się

<details>
<summary>Co zawiera <code>x.grad</code> po <code>f.backward()</code> dla <code>x = torch.tensor(2.0, requires_grad=True)</code> i <code>f = x ** 3</code>?</summary>

12. Nachylenie $x^3$ to $3x^2$, a $3 \times 2^2 = 12$. Autograd znajduje je tak, jak znalazł 10 dla $x^2$ w 5, bez podawania wzoru.

</details>

<details>
<summary>Pętla treningowa zapomina o <code>.grad.zero_()</code>. Co się dzieje?</summary>

Każde `backward()` dodaje swoje nachylenia do tych, które zostawiły poprzednie kroki, więc nachylenie, którego używa krok, to suma wszystkich nachyleń od początku. Kroki robią się coraz większe, a strata może się nigdy nie ustabilizować, a nawet rosnąć.

</details>

<details>
<summary>Dlaczego <code>w -= learning_rate * w.grad</code> jest wewnątrz <code>torch.no_grad()</code>?</summary>

Krok nie jest częścią modelu: zmienia parametry i nic nie powinno się przez niego cofać. Poza `no_grad` PyTorch odmawia też zmiany w miejscu tensora, który wymaga gradientu, bo zapis tego, jak policzono stratę, przestałby być prawdziwy.

</details>

## Twoja kolej

W ćwiczeniu [Nachylenie dowolnej funkcji](../../exercises/05-pytorch/02-autograd/01-slope-of-any-function/task.pl.md) pozwolisz autogradowi znaleźć nachylenie funkcji w punkcie. W ćwiczeniu [Wytrenuj prostą opłat](../../exercises/05-pytorch/02-autograd/02-train-a-fare-line/task.pl.md) umieścisz cztery kroki w pętli i wytrenujesz prostą na dowolnych paragonach.
