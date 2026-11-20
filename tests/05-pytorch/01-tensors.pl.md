# Tensory

## `rides` ma kształt `[4, 2]`. Co daje `rides.sum(dim=1)`?

- [x] Tensor o kształcie `[4]`: sumę liczb każdego kursu
- [ ] Tensor o kształcie `[2]`: sumę liczb każdej kolumny
- [ ] Tensor o kształcie `[4, 1]`
- [ ] Jedną liczbę: sumę wszystkiego

Wymiar, który wskażesz, to ten, który znika. `dim=1` to kolumny, więc dwie liczby z każdego wiersza sumują się do jednej i zostaje po liczbie dla każdego z czterech kursów. `dim=0` zsumowałoby wiersze i dało `[2]`, a `.sum()` bez `dim` daje jedną liczbę dla całej tabeli.

## Jaki `dtype` ma `torch.tensor([1, 2, 3])`?

- [x] `torch.int64`
- [ ] `torch.float32`
- [ ] `torch.float64`
- [ ] `torch.int32`

Liczby całkowite dają tensor typu `int64`. Kropka, jak w `torch.tensor([1.0, 2.0, 3.0])`, daje `float32`, domyślny typ zmiennoprzecinkowy PyTorcha. `float64` to typ, który NumPy wybiera dla liczb zmiennoprzecinkowych, a `int32` pojawia się tylko wtedy, gdy się o niego poprosi.

## Co zawiera `a` po `a = torch.tensor([1.0, 2.0, 3.0])`, `b = a[:2]` i `b[0] = 10`?

- [x] `tensor([10., 2., 3.])`
- [ ] `tensor([1., 2., 3.])`
- [ ] `tensor([10., 2.])`
- [ ] `tensor([10., 10., 10.])`

`a[:2]` to widok: okno na dwie pierwsze liczby `a`, a nie ich kopia. Zmiana `b[0]` zmienia więc liczbę, którą oba tensory mają wspólną. Gdyby `b` było kopią, utworzoną przez `.clone()`, `a` zostałoby bez zmian.

## Które z tych wywołań zgłasza błąd?

- [x] `torch.ones(4, 2) - torch.ones(4)`
- [ ] `torch.ones(4, 2) - torch.ones(2)`
- [ ] `torch.ones(4, 2) - torch.ones(4, 1)`
- [ ] `torch.ones(4, 2) - torch.ones(1, 2)`

PyTorch zestawia kształty od prawej i w każdej parze wymiary muszą być równe albo jeden z nich musi wynosić 1. `[4]` trafia naprzeciw dwóch kolumn, a 4 to nie 2. W pozostałych trzech każda para pasuje: naprzeciw 2 stoi 2 albo 1, a naprzeciw 4 stoi 4, 1 albo nic, więc kształty się rozgłaszają.

## `rides` ma kształt `[4, 2]`. Jaki kształt ma `rides @ torch.tensor([3.0, 0.5])`?

- [x] `[4]`
- [ ] `[2]`
- [ ] `[4, 2]`
- [ ] Żaden, to błąd, bo kształty się różnią

Ostatni wymiar lewego tensora, 2, ma tyle samo liczb co pierwszy (i jedyny) wymiar prawego, więc tensory do siebie pasują. Każdy z czterech wierszy jest mnożony przez dwie ceny i sumowany, co daje opłatę za każdy kurs: `[4]`.

## W lekcji `std(dim=0, keepdim=True)` dawało dla odległości 2,58 zamiast 2,24, dopóki nie dodano `correction=0`. Dlaczego?

- [x] Domyślnie dzieli przez liczbę o jeden mniejszą od liczby kursów, a nie przez liczbę kursów
- [ ] Domyślnie liczy po wierszach, a nie po kolumnach
- [ ] Domyślnie liczy na liczbach 16-bitowych
- [ ] Domyślnie dodaje średnią, zamiast ją odejmować

Rozrzut z lekcji uśrednia kwadraty odległości od średniej, więc dzieli przez liczbę kursów, czyli 4. `std` w PyTorchu domyślnie dzieli przez 3, co jest właściwe, gdy liczby są próbką z większej populacji, i daje większy rozrzut. `correction=0` każe mu dzielić przez 4.

## `fares` ma 12 liczb. Które z tych wywołań kończy się błędem?

- [x] `fares.reshape(5, 2)`
- [ ] `fares.reshape(3, 4)`
- [ ] `fares.reshape(-1, 6)`
- [ ] `fares.reshape(2, 2, 3)`

`reshape` układa te same liczby w inny kształt, więc nowy kształt musi mieścić tyle samo liczb co stary. 5 wierszy po 2 mieści 10 liczb, a jest ich 12. Pozostałe kształty mieszczą 12: 3 × 4, 2 × 2 × 3 i 2 wiersze po 6, bo `-1` zostaje wyliczone jako 2.

## `x` ma kształt `[2, 3, 4]`. Jaki kształt ma `x.permute(2, 0, 1)`?

- [x] `[4, 2, 3]`
- [ ] `[3, 4, 2]`
- [ ] `[4, 3, 2]`
- [ ] `[2, 3, 4]`

`permute` ustawia dawne wymiary w nowej kolejności. Najpierw idzie dawny wymiar 2, o długości 4, potem dawny wymiar 0, o długości 2, a na końcu dawny wymiar 1, o długości 3.

## Obraz wczytany z pliku ma kształt `[32, 48, 3]` i typ `uint8`. Która linijka tworzy tensor, jakiego oczekują warstwy PyTorcha?

- [x] `picture.permute(2, 0, 1).float() / 255`
- [ ] `picture.reshape(3, 32, 48).float() / 255`
- [ ] `picture.float() / 255`
- [ ] `picture.permute(2, 0, 1) + 0.5`

Warstwy oczekują liczb zmiennoprzecinkowych od 0 do 1 z kanałami na początku, `[3, 32, 48]`. Kanały przenosi tam `permute`. `reshape(3, 32, 48)` też daje ten kształt, ale tylko inaczej dzieli ten sam ciąg liczb, więc kolory każdego piksela rozjeżdżają się po całym obrazie. Bez `permute` kanały zostają na końcu, a dodanie 0,5 nie zamieni zakresu od 0 do 255 na zakres od 0 do 1.

## `pixel = torch.tensor([250, 100, 0], dtype=torch.uint8)`. Ile wynosi `pixel + 10`?

- [x] `tensor([  4, 110,  10], dtype=torch.uint8)`
- [ ] `tensor([260, 110,  10], dtype=torch.uint8)`
- [ ] `tensor([255, 110,  10], dtype=torch.uint8)`
- [ ] Błąd, bo 260 nie mieści się w `uint8`

`uint8` mieści wartości od 0 do 255, a po przekroczeniu 255 zaczyna liczyć od zera: 250 + 10 to 260, a 260 − 256 = 4. Nic przed tym nie ostrzega, a wartość nie zatrzymuje się na 255. Żeby rozjaśnić obraz, najpierw zamień go na liczby zmiennoprzecinkowe, a przed zamianą z powrotem przytnij je funkcją `clamp`.
