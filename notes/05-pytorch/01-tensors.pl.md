---
description: Policz opłaty za cały dzień naraz dzięki tensorom PyTorcha, poznaj kształty, typy i zmiany w miejscu, na których łatwo się potknąć, i zamień obraz na tensor.
---

# Tensory

[Rozdział o sieciach neuronowych](../04-foundations/04-neural-networks/) liczył na listach Pythona, w pętlach i z modułem `math`. Przy trzech neuronach to wystarcza, ale przy milionach nie ma szans. Prawdziwe modele pisze się z użyciem biblioteki, która liczy na całych tabelach liczb naraz, a najpopularniejsza z nich to **PyTorch**. Jego podstawowym obiektem jest **tensor** i ta lekcja go przedstawia, na przykładzie dziennych paragonów firmy taksówkowej.

> [!NOTE]
> Kod na tej stronie działa w twojej przeglądarce, z małym PyTorchem napisanym dla tej strony. We wszystkim, z czego korzystają tutejsze lekcje, wypisuje on te same liczby co prawdziwy PyTorch i zgłasza te same błędy, więc to, co widzisz tutaj, zobaczysz też na swoim komputerze po `pip install torch`. Różnice wymienia część [PyTorch na stronie](../01-start-here/01-how-this-works.pl.md#pytorch-na-stronie).

## Liczba, lista, tabela

Tensor to tabela liczb o dowolnej liczbie wymiarów. Dzienne kursy taksówki występują w trzech rozmiarach:

- pojedyncza liczba, na przykład jedna opłata, to tensor o 0 wymiarach,
- lista liczb, na przykład odległości czterech kursów, ma 1 wymiar,
- tabela z wierszem dla każdego kursu i kolumną dla każdej informacji o nim ma 2 wymiary.

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

Tensor wypisuje się jako `tensor(...)`, z kropką po każdej liczbie całkowitej na znak, że to liczba zmiennoprzecinkowa. Jego **kształt** (ang. shape) mówi, ile liczb ma wzdłuż każdego wymiaru: `[4, 2]` to 4 wiersze i 2 kolumny, czyli tutaj 4 kursy, każdy z 2 liczbami: odległością i liczbą minut, przez które taksówka czekała. Pojedyncza liczba nie ma wymiarów, wzdłuż których można by liczyć, więc `fare.shape` jest pusty. `ndim` to liczba wymiarów, a `numel()` łączna liczba elementów tensora: w przypadku `rides` 8.

## Typy

Każdy tensor przechowuje liczby jednego typu, swojego `dtype`. Liczby z kropką dostają typ `float32`, czyli 32-bitowe liczby zmiennoprzecinkowe, a liczby całkowite typ `int64`. Dzielenie liczb całkowitych daje liczby zmiennoprzecinkowe, jak w Pythonie, a `dtype=` i `.float()` pozwalają samemu wybrać typ:

```python run
import torch

print(torch.tensor([2.0, 4.0]).dtype)
print(torch.tensor([2, 4]).dtype)
print(torch.tensor([2, 4], dtype=torch.float32))
print(torch.tensor([2, 4]) / 2)
print(torch.tensor([2, 4]).float())
```

Zwykłe liczby zmiennoprzecinkowe Pythona mają 64 bity. Sieć neuronowa tylu nie potrzebuje, bo jej wagi i tak są znane tylko w przybliżeniu, a 32 bity zajmują połowę pamięci i są szybsze. Dlatego 32 bity to domyślny typ w PyTorchu i właśnie o niego warto poprosić przy konwersji liczb, które przychodzą w 64 bitach.

## Arytmetyka na każdej liczbie

Operator użyty na tensorze działa na każdej jego liczbie. Reguła z naklejki, 3 zł za każdy kilometr plus 8 zł na start, zajmuje jeden wiersz dla wszystkich czterech kursów, bez żadnej pętli:

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

`mean()`, `sum()` i `max()` ściskają cały tensor do jednej liczby, która sama jest tensorem o 0 wymiarach. `.item()` wyciąga ją jako zwykłą liczbę Pythona, a `.tolist()` zamienia cały tensor na listy.

## Wzdłuż wymiaru

Jeśli metoda dostanie `dim`, działa wzdłuż tego wymiaru, a nie na wszystkim naraz. Wskazany wymiar to ten, który znika: `dim=0` ściska wiersze i zostawia po liczbie dla każdej kolumny, a `dim=1` ściska kolumny i zostawia po liczbie dla każdego wiersza.

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])

print(rides.sum(dim=0))
print(rides.sum(dim=1))
print(rides.mean(dim=0))
print(rides.max(dim=0))
```

Pierwszy wiersz to łączna liczba kilometrów i łączna liczba minut postoju, a trzeci to średni kurs: 5 km i 4 minuty postoju. Drugi dodaje do siebie dwie liczby każdego kursu, co w przypadku kilometrów i minut nie ma sensu, ale dobrze pokazuje kierunek. `max(dim=0)` zwraca dwie rzeczy: największą liczbę w każdej kolumnie i wiersz, w którym się znajduje, czyli 3 dla kursu na 8 km i 1 dla 6 minut postoju. Są one dostępne także jako `.values` i `.indices`.

## Mnożenie macierzy

Z postojem opłata wynosi $3 \times \text{km} + 0{,}5 \times \text{minuty} + 8$: dwie liczby kursu mnoży się przez dwie ceny, a iloczyny dodaje. To **iloczyn skalarny** z części [Więcej wejść: wektory](../04-foundations/02-linear-regression/03-training.pl.md#więcej-wejść-wektory), a tabela razy wektor liczy go dla wszystkich wierszy naraz. Operatorem jest `@`, a `.T` zamienia wiersze tabeli z kolumnami:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])
prices = torch.tensor([3.0, 0.5])

print(rides @ prices)
print(rides @ prices + 8)
print(rides.T)
print(rides.T.shape)
```

Drugi wiersz zawiera opłaty z dziennych paragonów z lekcji [Przewidywanie](../04-foundations/02-linear-regression/01-predictions.pl.md): 15, 23, 29 i 33. Iloczyn macierzy działa tylko wtedy, gdy ostatni wymiar lewego tensora jest tak długi jak pierwszy wymiar prawego: `[4, 2] @ [2]` jest w porządku i daje `[4]`. Jeśli podać cenę dla trzeciej kolumny, której nie ma, PyTorch powie, co do siebie nie pasuje:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])
prices = torch.tensor([3.0, 0.5, 1.0])

print(rides @ prices)
```

„mat (4x2)” to `rides`, a „vec (3)” to `prices`, które ma 3 liczby dla wierszy z 2 liczbami.

## Wybieranie liczb

Nawiasy kwadratowe wybierają część tensora, tak jak w liście, z przecinkiem między wymiarami. `:` oznacza cały wymiar, a warunek zostawia wiersze albo liczby, dla których jest spełniony:

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

`rides[:, 0]` to kolumna 0 każdego wiersza, czyli odległości. `rides[:, 0] > 4` to tensor wartości `True` i `False`, po jednej dla każdego kursu, który wstawiony w nawiasy zostawia kursy dłuższe niż 4 km.

## Zmiany w miejscu

Część tensora, na przykład `rides[0]`, nie jest kopią, tylko **widokiem** (ang. view): okienkiem na te same liczby, więc zmiana jednego zmienia drugie. `.clone()` robi osobną kopię. Z kolei metoda z podkreślnikiem na końcu nazwy, na przykład `relu_()`, zmienia tensor, na którym ją wywołano, zamiast zwracać nowy:

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

Ustawienie `first[0]` na 100 zmieniło też pierwszy kurs w `rides`, bo `first` jest okienkiem na niego. `copy` to osobny tensor, więc wyzerowanie jego drugiej kolumny nie zmieniło `rides`. `relu` to funkcja aktywacji z części [ReLU](../04-foundations/04-neural-networks/01-layers.pl.md#relu), a `x.relu_()` zamieniło ujemne liczby `x` na 0 tam, gdzie były.

## NumPy i PyTorch

Tablice NumPy zamieniają się w tensory i z powrotem. `torch.tensor(array)` kopiuje liczby, `torch.from_numpy(array)` je współdzieli, tak jak widok, a `.numpy()` zwraca liczby tensora jako tablicę:

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

Liczby zmiennoprzecinkowe NumPy mają 64 bity, więc tensor utworzony z takiej tablicy też je ma, chyba że poprosi się o `dtype=torch.float32`.

> [!NOTE]
> Liczby całkowite NumPy mają w przeglądarce 32 bity, a na komputerze zwykle 64. Dlatego na tej stronie `torch.tensor(np.array([1, 2, 3]))` jest tensorem typu `int32`, a na twoim komputerze typu `int64`. Podaj typ, jakiego chcesz, przez `dtype=torch.int64`, a kod będzie działał tak samo w obu miejscach.

## Liczby losowe

`torch.rand` tworzy liczby między 0 a 1, a `torch.randn` liczby skupione wokół 0, jak w krzywej dzwonowej. Model zaczyna od losowych wag, a `torch.manual_seed` ustala liczby losowe, żeby ten sam kod za każdym razem dawał te same wyniki. Strona tworzy je tak samo jak PyTorch, więc to są dokładnie te liczby, które dostaniesz na każdym komputerze:

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

`zeros` i `ones` tworzą tensor o podanym kształcie wypełniony zerami albo jedynkami, `arange` liczy jak `range`, a `linspace(0, 1, 5)` rozmieszcza 5 liczb w równych odstępach od 0 do 1.

## Rozgłaszanie: standaryzacja kolumn

[Standaryzacja wejść](../04-foundations/04-neural-networks/04-inputs.pl.md#standaryzacja-wejść) odejmuje od wejścia jego średnią i dzieli wynik przez jego rozrzut. W przypadku tabeli to jedna średnia i jeden rozrzut dla każdej kolumny, liczone z całej kolumny:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])

means = rides.mean(dim=0, keepdim=True)
stds = rides.std(dim=0, keepdim=True, correction=0)
print(means)
print(stds)
print((rides - means) / stds)
```

`means` ma kształt `[1, 2]`, a `rides` kształt `[4, 2]`. Tensory o różnych kształtach można dodawać, odejmować i mnożyć, o ile każdy wymiar ma w obu ten sam rozmiar albo w jednym z nich rozmiar 1. Wymiar o rozmiarze 1 jest **rozgłaszany** (ang. broadcast): rozciągany tak, jakby skopiowano go tyle razy, ile trzeba. Dlatego `rides - means` odejmuje te same 2 średnie od każdego z 4 wierszy.

`keepdim=True` zostawia wymiar, który `mean` ścisnęło, jako 1, dzięki czemu `means` ma kształt `[1, 2]`, a nie `[2]`. W przypadku kolumn rozgłosiłby się jeden i drugi kształt, ale w przypadku wierszy tylko ten, który zachowuje wymiar. Bez niego 4 średnie mają kształt `[4]`, który zostaje dopasowany do *ostatniego* wymiaru `rides`, tego z 2 liczbami, i PyTorch odmawia:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])

print(rides.mean(dim=1, keepdim=True).shape)
print(rides - rides.mean(dim=1, keepdim=True))
print(rides - rides.mean(dim=1))
```

`std` trzeba podać `correction=0`, żeby liczyło rozrzut tak jak lekcje, czyli dzieląc przez liczbę kursów. Domyślnie dzieli przez liczbę o jeden mniejszą, $n - 1$, co jest właściwe, gdy liczby są próbką z większej populacji, i daje dla odległości 2,58 zamiast 2,24.

## Zmiana kształtu

Tensor przechowuje swoje liczby w jednym długim ciągu, a kształt mówi, gdzie ten ciąg podzielić na wiersze i kolumny. `reshape` dzieli te same liczby inaczej. Załóżmy, że paragony z trzech dni przyszły jako jedna lista 12 opłat, po 4 kursy dziennie:

```python run
import torch

fares = torch.tensor([15.0, 23.0, 29.0, 33.0, 12.0, 18.0, 21.0, 40.0, 9.0, 14.0, 26.0, 31.0])

days = fares.reshape(3, 4)
print(days)
print(days.sum(dim=1))
print(fares.reshape(-1, 6).shape)
print(days.flatten())
```

`reshape(3, 4)` układa je w 3 wiersze po 4: pierwsze 4 opłaty to pierwszy dzień, kolejne 4 drugi. Kolejność liczb się nie zmienia, zmienia się tylko to, gdzie kończą się wiersze, więc utarg z każdego dnia to suma wzdłuż jego wiersza: 100, 91 i 80. `-1` oznacza „tyle, ile wyjdzie”: przy 6 liczbach w wierszu z 12 liczb wychodzą 2 wiersze. `flatten()` układa je z powrotem w jeden ciąg.

Liczba elementów musi się zgadzać. 5 wierszy po 2 to 10 liczb, a jest ich 12:

```python run
import torch

fares = torch.tensor([15.0, 23.0, 29.0, 33.0, 12.0, 18.0, 21.0, 40.0, 9.0, 14.0, 26.0, 31.0])

print(fares.reshape(5, 2))
```

„Input of size 12” to `fares` z jego 12 liczbami.

Zmiana kształtu to nie to samo co zamiana wierszy z kolumnami. `days.T` i `days.reshape(4, 3)` mają ten sam kształt `[4, 3]`, ale zawierają różne tabele:

```python run
import torch

fares = torch.tensor([15.0, 23.0, 29.0, 33.0, 12.0, 18.0, 21.0, 40.0, 9.0, 14.0, 26.0, 31.0])
days = fares.reshape(3, 4)

print(days.T)
print(days.reshape(4, 3))

days[0, 0] = 99.0
print(fares[:3])
```

`.T` transponuje tabelę, więc jej pierwszy wiersz to pierwszy kurs każdego dnia: 15, 12 i 9. `reshape(4, 3)` tnie ten sam ciąg 12 liczb co trzy, więc jego pierwszy wiersz to 15, 23 i 29, czyli trzy kursy z jednego dnia, a wiersze nie mają żadnego sensu. Jeśli tensor ma dobry kształt, a złe liczby, zwykle właśnie z tego powodu.

Dwa ostatnie wiersze pokazują, że `reshape`, jeśli tylko może, zwraca widok, tak jak nawiasy kwadratowe: zmiana `days[0, 0]` zmieniła też `fares`. W cudzym kodzie często zobaczysz `view` tam, gdzie ta lekcja używa `reshape`. Działa tak samo, ale kończy się błędem, gdy liczby trzeba by skopiować, jak po `.T`. `reshape` w takiej sytuacji po prostu je kopiuje.

## Obraz jako tensor

Obraz to tabela pikseli, a obraz kolorowy ma dla każdego piksela trzy liczby: ile jest w nim czerwieni, zieleni i niebieskiego, od 0 do 255. Pliki i biblioteki, które je wczytują, przechowują obraz w kształcie `[wysokość, szerokość, kanały]`, w liczbach całkowitych typu `uint8`, który mieści wartości od 0 do 255 i nic poza tym. Oto obraz złożony z 2 wierszy po 3 piksele: czerwony, żółty i niebieski, a pod nimi czarny, szary i biały:

```python run
import torch

picture = torch.tensor(
    [
        [[255, 0, 0], [255, 255, 0], [0, 0, 255]],
        [[0, 0, 0], [128, 128, 128], [255, 255, 255]],
    ],
    dtype=torch.uint8,
)

print(picture.shape, picture.dtype)
print(picture[0, 1])
print(picture[1, 1] + 100)
print(picture[1, 2] + 1)
```

`picture[0, 1]` to piksel w wierszu 0 i kolumnie 1: pełna czerwień, pełna zieleń i zero niebieskiego, czyli żółty. Dwa ostatnie wypisane wiersze pokazują pułapkę `uint8`. Szary piksel plus 100 daje 228, tak jak powinien, ale biały plus 1 daje 0: w `uint8` nie ma 256, więc licznik zaczyna od nowa od zera, jak licznik kilometrów w samochodzie, który po 999999 pokazuje 000000. Nic przed tym nie ostrzega, a obraz rozjaśniany przez dodawanie dostaje czarne plamy tam, gdzie był najjaśniejszy.

Warstwy PyTorcha oczekują czegoś innego: liczb zmiennoprzecinkowych od 0 do 1 i kanałów na początku, `[kanały, wysokość, szerokość]`. `permute` ustawia wymiary w nowej kolejności: `permute(2, 0, 1)` znaczy, że najpierw idzie dawny wymiar 2, czyli kanały, a po nim dawne wymiary 0 i 1, czyli wysokość i szerokość. `.float() / 255` zamienia liczby całkowite na zmiennoprzecinkowe od 0 do 1:

```python run
import torch

picture = torch.tensor(
    [
        [[255, 0, 0], [255, 255, 0], [0, 0, 255]],
        [[0, 0, 0], [128, 128, 128], [255, 255, 255]],
    ],
    dtype=torch.uint8,
)

x = picture.permute(2, 0, 1).float() / 255
print(x.shape, x.dtype)
print(x[0])
print(picture.reshape(3, 2, 3)[0])
```

`x[0]` to kanał czerwony: tabela tak wysoka i szeroka jak obraz, z ilością czerwieni w każdym pikselu. W pierwszym wierszu czerwony i żółty piksel mają jej pełno, a niebieski wcale. W drugim czarny nie ma jej wcale, szary ma połowę, a biały pełno. `reshape(3, 2, 3)` daje ten sam kształt, ale błędny tensor, tak jak wcześniej `reshape(4, 3)` w przykładzie z dniami: jego pierwszy „kanał” to trzy liczby czerwonego piksela, a po nich trzy liczby żółtego. Do przestawiania wymiarów służy `permute`, a `.T` to `permute` dla tabeli, w której wymiary można ustawić tylko w jednej innej kolejności.

W drugą stronę: żeby zapisać albo wyświetlić obraz, liczby zmiennoprzecinkowe zamienia się z powrotem na `uint8`:

```python run
import torch

picture = torch.tensor(
    [
        [[255, 0, 0], [255, 255, 0], [0, 0, 255]],
        [[0, 0, 0], [128, 128, 128], [255, 255, 255]],
    ],
    dtype=torch.uint8,
)
x = picture.permute(2, 0, 1).float() / 255

brighter = (x * 1.5).clamp(0, 1)
back = (brighter * 255).round().to(torch.uint8).permute(1, 2, 0)
print(back.shape, back.dtype)
print(back[1])
print(x.unsqueeze(0).shape)
```

Liczby zmiennoprzecinkowe mogą bez szkody przekroczyć 1, więc obraz rozjaśnia się o połowę przez mnożenie, a `clamp(0, 1)` sprowadza potem każdą liczbę spoza przedziału od 0 do 1 do bliższego z jego końców. Mnożenie przez 255, `round()` i `.to(torch.uint8)` dają z powrotem liczby całkowite od 0 do 255, a `permute(1, 2, 0)` przenosi kanały z powrotem na koniec. Drugi wiersz to czarny, szary 192 i biały: szary się rozjaśnił, a biały pozostał biały, choć w arytmetyce na `uint8` licznik by się przekręcił.

Oba kroki przed konwersją są potrzebne. `.to(torch.uint8)` nie zaokrągla, tylko odcina część po przecinku, więc z 63,75 zrobiłoby 63. A to, co zrobi z liczbą mniejszą od 0 albo większą od 255, zależy od komputera, dlatego najpierw stosuje się `clamp`.

Sieć przyjmuje wiele obrazów naraz, w kształcie `[obrazy, kanały, wysokość, szerokość]`, a `unsqueeze(0)` dodaje ten pierwszy wymiar do pojedynczego obrazu: `[1, 3, 2, 3]`. W lekcji [Klasyfikacja obrazów](09-classifying-images.pl.md) sieć jest trenowana na tensorach o takim kształcie.

## Podsumowanie

- Tensor to tabela liczb z **kształtem**, który mówi, ile liczb ma wzdłuż każdego wymiaru. Wszystkie jego liczby mają jeden typ, `dtype`: `float32` dla liczb z kropką i `int64` dla liczb całkowitych.
- Operatory działają na każdej liczbie. Metoda z `dim` ściska ten wymiar, a `@` to iloczyn macierzy, który wymaga, żeby ostatni wymiar lewego tensora był tak długi jak pierwszy wymiar prawego.
- Nawiasy kwadratowe wybierają liczby, wiersze i kolumny i zwracają widoki, które współdzielą liczby z oryginałem. `clone()` robi kopię, a metoda zakończona na `_` zmienia tensor w miejscu.
- Tensory o różnych kształtach można łączyć, gdy w każdej parze wymiarów oba są równe albo jeden z nich wynosi 1: ten zostaje rozgłoszony. `keepdim=True` pomaga dopasować kształty.
- `std` dzieli przez liczbę o jeden mniejszą od liczby elementów, chyba że dostanie `correction=0`.
- `reshape` dzieli te same liczby na inny kształt, z `-1` w miejscu wymiaru do wyliczenia, a `flatten()` układa je w jeden ciąg. `permute` zmienia kolejność wymiarów. Dwa tensory mogą mieć ten sam kształt, a liczby w różnych miejscach.
- Obraz przychodzi w kształcie `[wysokość, szerokość, kanały]` jako `uint8`, czyli liczby całkowite od 0 do 255, które po przekroczeniu 255 liczą się od zera. Sieć przyjmuje `[kanały, wysokość, szerokość]` w liczbach zmiennoprzecinkowych od 0 do 1: `permute(2, 0, 1).float() / 255`, a z powrotem `clamp`, `round`, `.to(torch.uint8)` i `permute(1, 2, 0)`.

## Sprawdź się

<details>
<summary>Jaki kształt ma <code>torch.zeros(3, 4).sum(dim=0)</code>?</summary>

`[4]`. `dim=0` to wymiar, który znika: 3 wiersze sumują się w jeden, więc zostaje po jednej liczbie dla każdej z 4 kolumn.

</details>

<details>
<summary>Dlaczego <code>torch.tensor([1, 2, 3]) / 2</code> wypisuje <code>tensor([0.5000, 1.0000, 1.5000])</code>, a nie liczby całkowite?</summary>

Dzielenie daje liczby zmiennoprzecinkowe, tak jak `1 / 2` w Pythonie, a liczby zmiennoprzecinkowe w tensorze są typu `float32`. Tensor po lewej zawiera liczby typu `int64`, a PyTorch zamienia je na zmiennoprzecinkowe przed dzieleniem.

</details>

<details>
<summary>Tworzysz <code>b = a[:, 0]</code>, a potem <code>b[0] = -1</code>. Czy <code>a</code> się zmieniło?</summary>

Tak. `a[:, 0]` to widok pierwszej kolumny, a nie kopia, więc `b[0]` i `a[0, 0]` to ta sama liczba. Osobną kopię dałoby `a[:, 0].clone()`.

</details>

<details>
<summary>Obraz ma kształt <code>[4, 6, 3]</code>: 4 piksele wysokości, 6 szerokości i 3 kanały. Co jest nie tak z <code>picture.reshape(3, 4, 6)</code> jako sposobem na przeniesienie kanałów na początek?</summary>

Kształt wychodzi dobry, `[3, 4, 6]`, ale liczby trafiają w złe miejsca. `reshape` nie zmienia kolejności liczb, tylko inaczej je dzieli, więc jego pierwszy „kanał” to pierwsze 24 liczby, czyli trzy kolory pierwszych 8 pikseli. `picture.permute(2, 0, 1)` przestawia wymiary i jego pierwszy kanał to czerwień każdego piksela.

</details>

## Twoja kolej

W ćwiczeniu [Opłaty za każdy kurs](../../exercises/05-pytorch/01-tensors/01-fares-for-every-ride/task.pl.md) policzysz opłaty za cały dzień jednym wierszem arytmetyki na tensorach. W ćwiczeniu [Standaryzuj kolumny](../../exercises/05-pytorch/01-tensors/02-standardize-the-columns/task.pl.md) wystandaryzujesz tabelę, korzystając z tego, co wiesz o wymiarach i rozgłaszaniu. W ćwiczeniu [Obraz jako tensor](../../exercises/05-pytorch/01-tensors/03-a-picture-as-a-tensor/task.pl.md) zamienisz obraz na tensor, który przyjmuje sieć, i z powrotem.
