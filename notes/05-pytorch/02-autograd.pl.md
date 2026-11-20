---
description: Pozwól PyTorchowi liczyć za ciebie nachylenia, oznaczając parametry i wywołując backward po przejściu w przód, rób kroki spadku gradientu bez śledzenia i znajdź nachylenie straty względem wejścia.
---

# Autograd

Trening potrzebuje nachylenia straty względem każdego parametru. W części [Trening](../04-foundations/02-linear-regression/03-training.pl.md#oba-parametry-naraz) nachylenia względem $w$ i $b$ dawały dwa wzory, a w przypadku [sieci](../04-foundations/04-neural-networks/02-backpropagation.pl.md) potrzebna była na nie cała lekcja o regule łańcuchowej. PyTorch liczy je sam, dla dowolnego obliczenia złożonego z tensorów. To **autograd**, od ang. *automatic gradients*, czyli automatyczne gradienty, i to dzięki niemu trening sieci z milionami parametrów mieści się w kilku wierszach kodu.

## Jedna liczba

Tensor utworzony z `requires_grad=True` to liczba, względem której liczy się nachylenia. PyTorch zapisuje wszystko, co się z nią robi, a wynik takiego obliczenia pamięta, jak powstał: to `grad_fn` w jego wydruku. Wywołanie `backward()` na wyniku przechodzi wstecz przez ten zapis i zostawia nachylenie wyniku względem tensora w jego `.grad`:

```python run
import torch

x = torch.tensor(5.0, requires_grad=True)
f = x ** 2
print(f)

f.backward()
print(x.grad)
```

$f(x) = x^2$ ma nachylenie $2x$, które przy $x = 5$ wynosi 10, i właśnie tyle jest w `x.grad`. `PowBackward0` to nazwa kroku w zapisie obliczeń, który utworzył `f`, czyli potęgowania: kroku, który odtwarzany wstecz zamienia nachylenie $f$ na nachylenie względem $x$.

Nachylenia mają tylko liczby zmiennoprzecinkowe. `torch.tensor(5, requires_grad=True)` składa się z liczby całkowitej i PyTorch odmawia z komunikatem „Only Tensors of floating point and complex dtype can require gradients”: trzeba napisać `5.0`.

## Nachylenia straty

To samo działa dla całego modelu. Weźmy jeden paragon taksówki: 4 km i opłata 23 zł. Prosta z wagą $w = 2$ i wyrazem wolnym $b = 5$ przewiduje $2 \times 4 + 5 = 13$, a kwadrat błędu wynosi $(13 - 23)^2 = 100$:

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

Nachylenia wynoszą −80 względem $w$ i −20 względem $b$: to dwa wzory z rozdziału dla jednego kursu, $2(\hat{y} - y)\,x = 2 \times (13 - 23) \times 4 = -80$ i $2(\hat{y} - y) = -20$. Oba są ujemne, więc zwiększenie każdego z parametrów zmniejsza stratę. Nikt nie musiał wyprowadzać wzorów: `loss.backward()` przeszło wstecz przez potęgowanie, odejmowanie, dodawanie i mnożenie i na każdym kroku zastosowało regułę łańcuchową.

Przy czterech paragonach strata to średnia z czterech kwadratów błędów, a tensory mogą przechowywać je wszystkie:

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

Dla $w = 0$ i $b = 0$ strata wynosi 671, a nachylenia −280 i −50, czyli tyle, ile dają wzory dla dziennych paragonów.

> [!NOTE]
> `backward()` potrzebuje straty, która jest pojedynczą liczbą. Na tensorze z kilkoma liczbami, takim jak `w * kms`, zatrzymuje się z komunikatem „grad can be implicitly created only for scalar outputs”. Najpierw uśrednij liczby przez `mean()` albo zsumuj je przez `sum()`.

## Nachylenia się sumują

Każde wywołanie `backward()` *dodaje* znalezione nachylenia do tego, co jest w `.grad`, zamiast je zastępować. Przydaje się to, gdy strata ma kilka części, ale pętla treningowa, która rusza w kolejną rundę ze starymi nachyleniami, robi za duże kroki:

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

Za każdym razem strata ma to samo nachylenie, 32. Bez `zero_()` nachylenia się kumulują: 32, 64 i 96. `zero_()` to jedna z metod z podkreślnikiem z lekcji [Tensory](01-tensors.pl.md#zmiany-w-miejscu): ustawia liczby na 0 w miejscu.

## Krok w dół

Krok spadku gradientu zmienia parametry: $w \leftarrow w - \eta \, \frac{\partial L}{\partial w}$. Ale parametr to tensor, który wymaga gradientu, a PyTorch nie pozwoli zmienić go krokiem, bo krok stałby się częścią zapisu obliczeń. Ten kod zatrzymuje się z komunikatem „a leaf Variable that requires grad is being used in an in-place operation”, gdzie liść (ang. leaf) to tensor utworzony bezpośrednio przez ciebie, taki jak `w`:

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

Pętla treningowa za każdym razem ma te same cztery kroki, niezależnie od modelu:

1. **Przejście w przód**: policz stratę z parametrów.
2. **Przejście wstecz**: `loss.backward()` zapisuje nachylenia w `.grad`.
3. **Krok**: przesuń każdy parametr przeciwnie do jego nachylenia, wewnątrz `torch.no_grad()`.
4. **Zerowanie**: ustaw każde `.grad` z powrotem na 0.

Oto te kroki dla $f(x) = x^2$, od $x = 5$, ze współczynnikiem uczenia 0,1. Co 20 kroków pętla wypisuje numer kroku i $x$ po nim:

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

Nachylenie w punkcie $x$ to $2x$, więc każdy krok odejmuje od $x$ wartość $0{,}1 \times 2x = 0{,}2x$, czyli mnoży je przez 0,8. $x$ maleje w stronę 0, czyli dna miski.

## Trening prostej opłat

Oto jeszcze raz trening z części [Trening](../04-foundations/02-linear-regression/03-training.pl.md#oba-parametry-naraz), na dziennych paragonach, z tym samym współczynnikiem uczenia 0,01 i tymi samymi 5000 kroków. Pętla po kursach i dwa wzory na nachylenia zniknęły: strata to jeden wiersz, a resztę robi `backward()`:

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

Liczby są takie same jak w rozdziale, gdzie wypisywał je zwykły Python: strata spada z 671 do 1, a prosta kończy z $w = 3$ i $b = 10$. Autograd równie łatwo znalazłby nachylenia straty każdego innego modelu i właśnie do tego służy w kolejnych lekcjach.

## Wyłączanie śledzenia

Liczenie predykcji nie wymaga zapisu, bo nic nie będzie się przez nie cofać. `torch.no_grad()` pomija zapis, co oszczędza czas i pamięć:

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

Pierwsza opłata pamięta, jak powstała, a druga nie. Tensora z zapisem obliczeń nie da się bezpośrednio zamienić na tablicę NumPy: `.detach()` daje te same liczby bez zapisu, więc `fare.detach().numpy()` działa tam, gdzie `fare.numpy()` zgłasza, że nie może.

## Nachylenie względem wejścia

Do tej pory nachylenia liczyło się względem parametrów, bo to je zmienia trening. Ale `backward()` daje nachylenie względem wszystkiego, co jest oznaczone, a oznaczyć można także wejście. `requires_grad_()` oznacza istniejący już tensor w miejscu, na co wskazuje podkreślnik na końcu nazwy. Tak oznacza się dane, które zwykle przychodzą z zewnątrz, na przykład z pliku. Oto wytrenowana prosta opłat z $w = 3$ i $b = 10$ oraz kurs na 5 km:

```python run
import torch

w = torch.tensor(3.0, requires_grad=True)
b = torch.tensor(10.0, requires_grad=True)
km = torch.tensor(5.0)
km.requires_grad_()

fare = w * km + b
fare.backward()
print(km.grad)
print(w.grad, b.grad)
```

Nachylenie opłaty względem odległości wynosi 3: każdy dodatkowy kilometr kosztuje 3 zł więcej, i to właśnie mówi waga. W przypadku prostej nachylenie względem wejścia jest równe wadze, niezależnie od długości kursu. Przy okazji policzyły się też nachylenia względem $w$ i $b$, 5 i 1, bo te nadal są oznaczone.

Często potrzebne jest tylko nachylenie względem wejścia, a nachylenia względem parametrów przeszkadzają: dodałyby się do tego, co pętla treningowa trzyma w `.grad`. `torch.autograd.grad(loss, ride)` liczy nachylenie straty wyłącznie względem kursu i zwraca je, zamiast zapisywać w `.grad`. Weźmy opłaty z postojem z lekcji [Tensory](01-tensors.pl.md#mnożenie-macierzy): 3 zł za kilometr, 0,50 zł za minutę postoju i 8 zł na start. Za kurs na 4 km z 6 minutami postoju wychodzi 23 zł. Załóżmy, że na paragonie widnieje 30 zł:

```python run
import torch

prices = torch.tensor([3.0, 0.5], requires_grad=True)
start = torch.tensor(8.0, requires_grad=True)
ride = torch.tensor([4.0, 6.0], requires_grad=True)

prediction = ride @ prices + start
loss = (prediction - 30.0) ** 2
print(prediction, loss)

slopes = torch.autograd.grad(loss, ride)
print(slopes)
print(ride.grad, prices.grad, start.grad)
```

Strata wynosi $(23 - 30)^2 = 49$, a jej nachylenia względem kursu to −42 dla kilometrów i −7 dla minut: $2(\hat{y} - y)$ razy odpowiednia cena, czyli $2 \times (-7) \times 3$ i $2 \times (-7) \times 0{,}5$. `torch.autograd.grad` zwraca krotkę z jednym tensorem dla każdego tensora, o który go zapytano, więc nachylenie to `slopes[0]`. Wszystkie `.grad` są nadal równe `None`: nic do nich nie trafiło.

Drugi sposób na pominięcie parametrów to zdjęcie z nich oznaczenia przez `requires_grad_(False)`. Parametr bez oznaczenia jest **zamrożony**: operacje na nim nie są zapisywane, `backward()` go pomija, więc żaden krok go nie zmieni. Tak postępuje się z modelem, który skończył już naukę, albo z częścią modelu, która ma pozostać bez zmian, podczas gdy reszta się uczy:

```python run
import torch

prices = torch.tensor([3.0, 0.5], requires_grad=True)
start = torch.tensor(8.0, requires_grad=True)
prices.requires_grad_(False)
start.requires_grad_(False)

ride = torch.tensor([4.0, 6.0], requires_grad=True)
loss = (ride @ prices + start - 30.0) ** 2
loss.backward()
print(ride.grad)
print(prices.grad, start.grad)
```

Kurs ma swoje nachylenia, a zamrożone ceny nie mają żadnych.

Do czego przydaje się nachylenie względem wejścia? Mówi, w którą stronę przesunąć wejście, żeby zmienić wynik. Krok spadku gradientu przesuwa parametry *przeciwnie* do ich nachyleń, żeby zmniejszyć stratę. Tutaj kurs przesuwa się *zgodnie* ze swoimi nachyleniami, każda jego liczba o jedną dziesiątą, i strata rośnie. `sign()` zostawia z każdego nachylenia tylko kierunek: −1, 0 albo 1:

```python run
import torch

prices = torch.tensor([3.0, 0.5])
start = torch.tensor(8.0)
ride = torch.tensor([4.0, 6.0], requires_grad=True)

loss = (ride @ prices + start - 30.0) ** 2
slope = torch.autograd.grad(loss, ride)[0]
print(slope.sign())

changed = ride.detach() + 0.1 * slope.sign()
new_loss = (changed @ prices + start - 30.0) ** 2
print(changed)
print(round(loss.item(), 2), round(new_loss.item(), 2))
```

Oba nachylenia są ujemne, więc kurs, który najbardziej zwiększa stratę, jest trochę krótszy i ma trochę krótszy postój: 3,9 km i 5,9 minuty. Przewidywana opłata jest dla niego niższa, więc bardziej odbiega od 30: strata rośnie z 49 do 54,02. Ceny przez cały ten czas się nie zmieniły. `ride.detach()` daje liczby kursu bez zapisu obliczeń, dzięki czemu `changed` jest nowym wejściem, a nie kolejnym krokiem obliczania starej straty.

Te same kilka linijek kodu działa też dla obrazu i sieci, która go rozpoznaje. Każdy piksel przesuwa się niezauważalnie, zgodnie ze znakiem swojego nachylenia, i sieć, która dotąd rozpoznawała obraz poprawnie, może zacząć się mylić. Tak zmieniony obraz nazywa się **przykładem adwersarialnym** (ang. adversarial example), a jego tworzenie zaczyna się od nachylenia straty względem wejścia. Tym zajmuje się rozdział [Przykłady adwersarialne](../07-adversarial-examples/).

## Podsumowanie

- `requires_grad=True` oznacza tensor liczb zmiennoprzecinkowych, względem którego liczy się nachylenia. Wyniki obliczeń z jego udziałem pamiętają w swoim `grad_fn`, jak powstały, a `backward()` wywołane na wyniku, który jest pojedynczą liczbą, zapisuje nachylenia w `.grad` każdego takiego tensora.
- `backward()` dodaje do `.grad`, więc pętla treningowa po każdym kroku zeruje nachylenia przez `zero_()`.
- Krok spadku gradientu zmienia parametry wewnątrz `torch.no_grad()`, żeby krok nie trafił do zapisu obliczeń. `torch.no_grad()` przydaje się też przy liczeniu predykcji.
- Pętla treningowa ma cztery kroki: przejście w przód, przejście wstecz, krok i zerowanie.
- Oznaczyć można też wejście, przez `requires_grad_()`, i wtedy dostaje ono nachylenie tak jak parametr. `torch.autograd.grad(loss, x)` zwraca nachylenia wyłącznie względem `x`, w postaci krotki, i nie wypełnia żadnego `.grad`. `requires_grad_(False)` zamraża parametr.

## Sprawdź się

<details>
<summary>Co zawiera <code>x.grad</code> po <code>f.backward()</code> dla <code>x = torch.tensor(2.0, requires_grad=True)</code> i <code>f = x ** 3</code>?</summary>

12. Nachylenie $x^3$ to $3x^2$, a $3 \times 2^2 = 12$. Autograd znajduje je tak samo, jak znalazł 10 dla $x^2$ w punkcie 5, i nie potrzebuje do tego wzoru.

</details>

<details>
<summary>Pętla treningowa zapomina o <code>.grad.zero_()</code>. Co się dzieje?</summary>

Każde `backward()` dodaje swoje nachylenia do tych, które zostały po poprzednich krokach, więc krok używa sumy wszystkich nachyleń od początku. Kroki robią się coraz większe, a strata może się nigdy nie ustabilizować albo nawet rosnąć.

</details>

<details>
<summary>Dlaczego <code>w -= learning_rate * w.grad</code> jest wewnątrz <code>torch.no_grad()</code>?</summary>

Krok nie jest częścią modelu: zmienia parametry i nic nie powinno się przez niego cofać. Poza `no_grad` PyTorch nie pozwala też zmieniać w miejscu tensora, który wymaga gradientu, bo zafałszowałoby to zapis tego, jak policzono stratę.

</details>

<details>
<summary>Nachylenia straty względem kursu to <code>tensor([-42., -7.])</code>. W którą stronę trzeba przesunąć kurs, żeby strata wzrosła?</summary>

W dół w obu liczbach: mniej kilometrów i krótszy postój. Nachylenie mówi, jak zmienia się strata, gdy dana liczba rośnie, a oba są ujemne, więc zwiększanie liczb zmniejsza stratę, a zmniejszanie ją zwiększa. `ride + step * slope.sign()` przesuwa każdą liczbę właśnie w tę stronę, o `step`.

</details>

## Twoja kolej

W ćwiczeniu [Nachylenie dowolnej funkcji](../../exercises/05-pytorch/02-autograd/01-slope-of-any-function/task.pl.md) pozwolisz autogradowi znaleźć nachylenie funkcji w punkcie. W ćwiczeniu [Wytrenuj prostą opłat](../../exercises/05-pytorch/02-autograd/02-train-a-fare-line/task.pl.md) umieścisz cztery kroki w pętli i wytrenujesz prostą na dowolnych paragonach. W ćwiczeniu [Przesuń wejście](../../exercises/05-pytorch/02-autograd/03-nudge-the-input/task.pl.md) policzysz nachylenie straty względem kursu i przesuniesz kurs tak, żeby strata wzrosła.
