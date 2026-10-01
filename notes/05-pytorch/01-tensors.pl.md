---
description: Policz opłaty za cały dzień naraz dzięki tensorom PyTorcha i poznaj kształty, typy i zmiany w miejscu, na których potykają się początkujący.
---

# Tensory

[Rozdział o sieciach neuronowych](../04-foundations/04-neural-networks/) liczył na listach Pythona, w pętlach i z modułem `math`. Dla trzech neuronów to wystarcza, a dla milionów jest beznadziejne. Prawdziwe modele pisze się w bibliotece, która liczy na całych tabelach liczb naraz, a najpopularniejszą z nich jest **PyTorch**. Jej podstawowym obiektem jest **tensor** i ta lekcja jest jego przeglądem, na paragonach dziennych firmy taksówkowej.

> [!NOTE]
> Kod na tej stronie działa w twojej przeglądarce, z małym PyTorchem napisanym dla tej witryny. W tym, z czego korzystają lekcje, wypisuje on te same liczby co prawdziwy PyTorch i kończy się tymi samymi komunikatami błędów, więc to, co widzisz tutaj, zobaczysz też na swoim komputerze po `pip install torch`. [Jak to działa](../01-start-here/01-how-this-works.pl.md#pytorch-na-stronie) wymienia różnice.

## Liczba, lista, tabela

Tensor to tabela liczb o dowolnej liczbie wymiarów. Kursy taksówki z jednego dnia mają trzy rozmiary:

- pojedyncza liczba, jak jedna opłata, to tensor o 0 wymiarów,
- lista liczb, jak odległości czterech kursów, ma 1 wymiar,
- tabela, z wierszem dla każdego kursu i kolumną dla każdej informacji o nim, ma 2 wymiary.

```python run
import torch

fare = torch.tensor(15.0)
kms = torch.tensor([2.0, 4.0, 6.0, 8.0])
rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])

print(fare)
print(kms)
print(rides)
print(fare.shape, kms.shape, rides.shape)
print(rides.ndim, rides.numel())
```

Tensor wypisuje się jako `tensor(...)`, z kropką po każdej liczbie całkowitej, żeby było widać, że to liczby zmiennoprzecinkowe. Jego **kształt** (ang. shape) mówi, ile liczb ma wzdłuż każdego wymiaru: `[4, 2]` to 4 wiersze i 2 kolumny, czyli tutaj 4 kursy, każdy z 2 liczbami: odległością i minutami postoju taksówki. Pojedyncza liczba nie ma wymiarów, wzdłuż których można liczyć, więc `fare.shape` jest puste. `ndim` to liczba wymiarów, a `numel()` to liczba wszystkich liczb w tensorze: 8 dla `rides`.

## Typy

Każdy tensor przechowuje liczby jednego typu, swojego `dtype`. Liczby z kropką dostają typ `float32`, czyli 32-bitowe liczby zmiennoprzecinkowe, a liczby całkowite typ `int64`. Dzielenie liczb całkowitych daje liczby zmiennoprzecinkowe, tak jak w Pythonie, a `dtype=` i `.float()` pozwalają wybrać typ samemu:

```python run
import torch

print(torch.tensor([2.0, 4.0]).dtype)
print(torch.tensor([2, 4]).dtype)
print(torch.tensor([2, 4], dtype=torch.float32))
print(torch.tensor([2, 4]) / 2)
print(torch.tensor([2, 4]).float())
```

Liczby zmiennoprzecinkowe Pythona mają 64 bity. Sieć neuronowa nie potrzebuje aż tylu, bo jej wagi i tak są znane tylko w przybliżeniu, a 32 bity zajmują o połowę mniej pamięci i działają szybciej. Dlatego 32 bity to domyślny typ PyTorcha i ten, o który trzeba poprosić, gdy zamieniasz liczby, które mają 64.

## Arytmetyka na każdej liczbie

Operator użyty na tensorze działa na każdej jego liczbie. Reguła z naklejki, 3 zł za każdy kilometr plus 8 zł na start, zajmuje jeden wiersz dla wszystkich czterech kursów i nie potrzebuje pętli:

```python run
import torch

kms = torch.tensor([2.0, 4.0, 6.0, 8.0])

fares = kms * 3 + 8
print(fares)
print(kms ** 2)
print(kms.exp())
print(kms.mean(), kms.sum(), kms.max())
print(fares[0], fares[0].item(), fares.tolist())
```

`mean()`, `sum()` i `max()` ściskają cały tensor do jednej liczby, która sama jest tensorem o 0 wymiarów. `.item()` wyjmuje liczbę jako zwykłą liczbę Pythona, a `.tolist()` zamienia cały tensor na listy.

## Wzdłuż wymiaru

Podaj metodzie `dim`, a zadziała wzdłuż tego wymiaru, a nie na całości. Wymiar, który wskażesz, to ten, który znika: `dim=0` zwija wiersze i zostawia liczbę dla każdej kolumny, a `dim=1` zwija kolumny i zostawia liczbę dla każdego wiersza.

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])

print(rides.sum(dim=0))
print(rides.sum(dim=1))
print(rides.mean(dim=0))
print(rides.max(dim=0))
```

Pierwszy wiersz to łączna liczba kilometrów i łączna liczba minut postoju, a trzeci to przeciętny kurs: 5 km i 4 minuty postoju. Drugi dodaje do siebie dwie liczby każdego kursu, co dla kilometrów i minut nie ma sensu, ale pokazuje kierunek. `max(dim=0)` daje dwie rzeczy: największą liczbę w każdej kolumnie i wiersz, w którym ona jest, czyli 3 dla kursu na 8 km i 1 dla 6 minut postoju. Są też w `.values` i `.indices`.

## Mnożenie macierzy

Z postojem opłata to $3 \times \text{km} + 0{,}5 \times \text{minuty} + 8$: dwie liczby kursu mnoży się przez dwie ceny i dodaje iloczyny. To **iloczyn skalarny** z części [Więcej wejść: wektory](../04-foundations/02-linear-regression/03-training.pl.md#więcej-wejść-wektory), a tabela razy wektor liczy go dla każdego wiersza naraz. Operatorem jest `@`, a `.T` zamienia miejscami wiersze i kolumny tabeli:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])
prices = torch.tensor([3.0, 0.5])

print(rides @ prices)
print(rides @ prices + 8)
print(rides.T)
print(rides.T.shape)
```

Drugi wiersz zawiera opłaty z paragonów dziennych z lekcji [Przewidywanie](../04-foundations/02-linear-regression/01-predictions.pl.md): 15, 23, 29 i 33. Iloczyn macierzy działa tylko wtedy, gdy ostatni wymiar lewego tensora ma tyle samo liczb co pierwszy wymiar prawego: `[4, 2] @ [2]` pasuje i daje `[4]`. Daj mu cenę dla trzeciej kolumny, której nie ma, a PyTorch powie, co do siebie nie pasuje:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])
prices = torch.tensor([3.0, 0.5, 1.0])

print(rides @ prices)
```

„mat (4x2)” to `rides`, a „vec (3)” to `prices`, które ma 3 liczby dla wierszy po 2.

## Wybieranie liczb

Nawiasy kwadratowe wybierają część tensora, tak jak w liście, z przecinkiem między wymiarami. `:` oznacza cały wymiar, a warunek zostawia te wiersze lub liczby, dla których jest prawdziwy:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])

print(rides[0])
print(rides[0, 1])
print(rides[:, 0])
print(rides[1:3])
print(rides[:, 0] > 4)
print(rides[rides[:, 0] > 4])
```

`rides[:, 0]` to kolumna 0 każdego wiersza: odległości. `rides[:, 0] > 4` to tensor z `True` i `False`, po jednej wartości dla każdego kursu, a wstawienie go w nawiasy zostawia kursy dłuższe niż 4 km.

## Zmiany w miejscu

Część tensora, jak `rides[0]`, nie jest kopią: to **widok** (ang. view), okno na te same liczby, więc zmiana jednego zmienia drugie. `.clone()` robi własną kopię. A metoda z podkreślnikiem na końcu nazwy, jak `relu_()`, zmienia tensor, na którym ją wywołano, zamiast dawać nowy:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])

first = rides[0]
first[0] = 100
print(rides)

copy = rides.clone()
copy[:, 1] = 0
print(copy)
print(rides)

x = torch.tensor([-1.0, 2.0, -3.0])
x.relu_()
print(x)
```

Ustawienie `first[0]` na 100 zmieniło też pierwszy kurs w `rides`, bo `first` jest oknem na niego. `copy` to osobny tensor, więc wyzerowanie jego drugiej kolumny zostawiło `rides` bez zmian. `relu` to funkcja aktywacji z części [ReLU](../04-foundations/04-neural-networks/01-layers.pl.md#relu), a `x.relu_()` zamieniło ujemne liczby w `x` na 0 w miejscu, w którym były.

## NumPy i PyTorch

Tablice NumPy zamieniają się w tensory i z powrotem. `torch.tensor(array)` kopiuje liczby, `torch.from_numpy(array)` dzieli je, jak widok, a `.numpy()` daje liczby tensora jako tablicę:

```python run
import numpy as np
import torch

numbers = np.array([[1.0, 2.0], [3.0, 4.0]])

print(torch.tensor(numbers).dtype)
print(torch.tensor(numbers, dtype=torch.float32).dtype)

shared = torch.from_numpy(numbers)
numbers[0, 0] = 99.0
print(shared)
print(shared.numpy())
```

Liczby zmiennoprzecinkowe NumPy mają 64 bity, więc tensor zrobiony z tablicy takich liczb też je ma, chyba że poprosisz o `dtype=torch.float32`.

> [!NOTE]
> Liczby całkowite NumPy mają w przeglądarce 32 bity, a na komputerze zwykle 64. Dlatego na tej stronie `torch.tensor(np.array([1, 2, 3]))` to tensor `int32`, a na twoim komputerze `int64`. Napisz, którego chcesz, z `dtype=torch.int64`, a kod będzie działał tak samo w obu miejscach.

## Liczby losowe

`torch.rand` tworzy liczby od 0 do 1, a `torch.randn` liczby skupione wokół 0, jak na krzywej dzwonowej. Model zaczyna od losowych wag, a `torch.manual_seed` ustala liczby, tak żeby ten sam kod dawał za każdym razem te same liczby. Strona tworzy je tak jak PyTorch, więc to dokładnie te liczby, które dostaniesz na każdym komputerze:

```python run
import torch

torch.manual_seed(42)
print(torch.rand(3))
print(torch.randn(2, 2))
print(torch.zeros(2, 3))
print(torch.ones(3))
print(torch.arange(5))
print(torch.linspace(0, 1, 5))
```

`zeros` i `ones` tworzą tensor o podanym kształcie, wypełniony zerami lub jedynkami, `arange` liczy jak `range`, a `linspace(0, 1, 5)` ustawia 5 liczb w równych odstępach od 0 do 1.

## Rozgłaszanie: standaryzacja kolumn

[Standaryzacja wejść](../04-foundations/04-neural-networks/04-inputs.pl.md#standaryzacja-wejść) odejmuje od wejścia jego średnią i dzieli przez jego rozrzut. Dla tabeli to jedna średnia i jeden rozrzut dla każdej kolumny, każde policzone z całej kolumny:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])

means = rides.mean(dim=0, keepdim=True)
stds = rides.std(dim=0, keepdim=True, correction=0)
print(means)
print(stds)
print((rides - means) / stds)
```

`means` ma kształt `[1, 2]`, a `rides` `[4, 2]`. Tensory o różnych kształtach można mimo to dodawać, odejmować i mnożyć, o ile każdy wymiar ma w obu ten sam rozmiar albo w jednym z nich jest równy 1. Ta 1 jest **rozgłaszana** (ang. broadcast): rozciągana tak, jakby skopiować ją tyle razy, ile trzeba. Dlatego `rides - means` odejmuje te same 2 średnie od każdego z 4 wierszy.

`keepdim=True` zostawia wymiar, który `mean` zwinęło, jako 1, żeby kształt `means` to było `[1, 2]`, a nie `[2]`. Dla kolumn zadziałałyby oba, ale dla wierszy działa tylko ten, który zachowuje wymiar. Bez niego 4 średnie mają kształt `[4]`, który ustawia się pod *ostatnim* wymiarem `rides`, tym z 2 liczbami, i PyTorch odmawia:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])

print(rides.mean(dim=1, keepdim=True).shape)
print(rides - rides.mean(dim=1, keepdim=True))
print(rides - rides.mean(dim=1))
```

`std` trzeba powiedzieć `correction=0`, żeby liczyło rozrzut tak jak lekcje, dzieląc przez liczbę kursów. Domyślnie dzieli przez o jeden mniej, $n - 1$, czego chcesz, gdy liczby są próbką z większej grupy, i daje tu 2,58 zamiast 2,24 dla odległości.

## Sprawdź się

<details>
<summary>Jaki kształt ma <code>torch.zeros(3, 4).sum(dim=0)</code>?</summary>

`[4]`. `dim=0` to wymiar, który znika, a 3 wiersze są dodawane do jednego, więc zostaje liczba dla każdej z 4 kolumn.

</details>

<details>
<summary>Dlaczego <code>torch.tensor([1, 2, 3]) / 2</code> wypisuje <code>tensor([0.5000, 1.0000, 1.5000])</code>, a nie liczby całkowite?</summary>

Dzielenie daje liczby zmiennoprzecinkowe, tak jak `1 / 2` w Pythonie, a liczby zmiennoprzecinkowe tensora mają typ `float32`. Tensor po lewej zawiera liczby `int64`, a PyTorch zamienia je na zmiennoprzecinkowe przed dzieleniem.

</details>

<details>
<summary>Tworzysz <code>b = a[:, 0]</code>, a potem <code>b[0] = -1</code>. Czy <code>a</code> się zmieniło?</summary>

Tak. `a[:, 0]` to widok pierwszej kolumny, a nie kopia, więc `b[0]` i `a[0, 0]` to ta sama liczba. `a[:, 0].clone()` byłoby własną kopią.

</details>

## Twoja kolej

W ćwiczeniu [Opłaty za każdy kurs](../../exercises/05-pytorch/01-tensors/01-fares-for-every-ride/task.pl.md) policzysz opłaty za cały dzień jednym wierszem arytmetyki na tensorach. W ćwiczeniu [Standaryzuj kolumny](../../exercises/05-pytorch/01-tensors/02-standardize-the-columns/task.pl.md) wystandaryzujesz tabelę, korzystając z tego, co wiesz o wymiarach i rozgłaszaniu.
