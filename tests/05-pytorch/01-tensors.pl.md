# Tensory

## `rides` ma kształt `[4, 2]`. Co daje `rides.sum(dim=1)`?

- [x] Tensor o kształcie `[4]`: zsumowane liczby każdego kursu
- [ ] Tensor o kształcie `[2]`: zsumowane liczby każdej kolumny
- [ ] Tensor o kształcie `[4, 1]`
- [ ] Jedną liczbę: wszystko zsumowane

Wymiar, który wskażesz, to ten, który znika. `dim=1` to kolumny, więc 2 liczby każdego wiersza zamieniają się w 1 i zostaje liczba dla każdego z 4 kursów. `dim=0` zsumowałoby wiersze i dało `[2]`, a `.sum()` bez `dim` daje jedną liczbę dla całej tabeli.

## Jaki `dtype` ma `torch.tensor([1, 2, 3])`?

- [x] `torch.int64`
- [ ] `torch.float32`
- [ ] `torch.float64`
- [ ] `torch.int32`

Liczby całkowite dają tensor `int64`. Kropka, jak w `torch.tensor([1.0, 2.0, 3.0])`, daje `float32`, domyślny typ zmiennoprzecinkowy PyTorcha. `float64` to to, co NumPy daje dla liczb zmiennoprzecinkowych, a `int32` jest używany tylko wtedy, gdy się o niego poprosi.

## Co zawiera `a` po `a = torch.tensor([1.0, 2.0, 3.0])`, `b = a[:2]` i `b[0] = 10`?

- [x] `tensor([10., 2., 3.])`
- [ ] `tensor([1., 2., 3.])`
- [ ] `tensor([10., 2.])`
- [ ] `tensor([10., 10., 10.])`

`a[:2]` to widok: okno na dwie pierwsze liczby `a`, a nie ich kopia. Zmiana `b[0]` zmienia liczbę, którą dzielą. `b.clone()` byłoby kopią, która zostawia `a` w spokoju.

## Które z poniższych wywołań zgłasza błąd?

- [x] `torch.ones(4, 2) - torch.ones(4)`
- [ ] `torch.ones(4, 2) - torch.ones(2)`
- [ ] `torch.ones(4, 2) - torch.ones(4, 1)`
- [ ] `torch.ones(4, 2) - torch.ones(1, 2)`

PyTorch ustawia kształty od prawej, a każda para wymiarów musi być równa albo jeden z nich musi być równy 1. `[4]` ustawia się pod 2 kolumnami, a 4 to nie 2. W pozostałych trzech pod 2 jest 2, a przy 4 stoi 1 albo 4, więc się rozgłaszają.

## `rides` ma kształt `[4, 2]`. Jaki kształt ma `rides @ torch.tensor([3.0, 0.5])`?

- [x] `[4]`
- [ ] `[2]`
- [ ] `[4, 2]`
- [ ] To błąd, bo kształty są różne

Ostatni wymiar lewego tensora, 2, ma tyle samo liczb co pierwszy (i jedyny) wymiar prawego, więc pasują. Każdy z 4 wierszy jest mnożony przez 2 ceny i sumowany, co daje opłatę za każdy kurs: `[4]`.

## W lekcji `std(dim=0, keepdim=True)` dało 2,58, a nie 2,24 dla odległości, dopóki nie dodano `correction=0`. Dlaczego?

- [x] Domyślnie dzieli przez o jeden mniej niż liczba kursów, a nie przez liczbę kursów
- [ ] Domyślnie działa na wierszach, a nie na kolumnach
- [ ] Domyślnie pracuje na liczbach 16-bitowych
- [ ] Domyślnie dodaje średnią zamiast ją odejmować

Rozrzut z lekcji uśrednia kwadraty odległości od średniej, więc dzieli przez liczbę kursów, 4. `std` w PyTorchu domyślnie dzieli przez 3, co jest dobre dla liczb będących próbką z większej grupy, i daje większy rozrzut. `correction=0` każe mu dzielić przez 4.

## `fares` ma 12 liczb. Które z tych wywołań kończy się błędem?

- [x] `fares.reshape(5, 2)`
- [ ] `fares.reshape(3, 4)`
- [ ] `fares.reshape(-1, 6)`
- [ ] `fares.reshape(2, 2, 3)`

`reshape` tnie te same liczby w inny kształt, więc nowy kształt musi mieścić tyle liczb co stary. 5 wierszy po 2 mieści 10, a jest ich 12. Pozostałe mieszczą 12: 3 × 4, 2 × 2 × 3 i 2 wiersze po 6, gdzie `-1` zostaje wyliczone jako 2.

## `x` ma kształt `[2, 3, 4]`. Jaki kształt ma `x.permute(2, 0, 1)`?

- [x] `[4, 2, 3]`
- [ ] `[3, 4, 2]`
- [ ] `[4, 3, 2]`
- [ ] `[2, 3, 4]`

`permute` wymienia stare wymiary w ich nowej kolejności. Stary wymiar 2, z 4 liczbami, idzie pierwszy, potem stary 0, z 2, a potem stary 1, z 3.

## Obraz wczytany z pliku ma kształt `[32, 48, 3]` i typ `uint8`. Który wiersz robi tensor, jaki biorą warstwy PyTorcha?

- [x] `picture.permute(2, 0, 1).float() / 255`
- [ ] `picture.reshape(3, 32, 48).float() / 255`
- [ ] `picture.float() / 255`
- [ ] `picture.permute(2, 0, 1) + 0.5`

Warstwy chcą liczb zmiennoprzecinkowych od 0 do 1 z kanałami na początku, `[3, 32, 48]`. `permute` przestawia tam kanały. `reshape(3, 32, 48)` też daje ten kształt, ale tylko inaczej tnie ten sam ciąg liczb, więc kolory każdego piksela rozchodzą się po obrazie. Bez `permute` kanały zostają na końcu, a dodanie 0,5 nie sprowadza liczb od 0 do 255 do przedziału od 0 do 1.

## `pixel = torch.tensor([250, 100, 0], dtype=torch.uint8)`. Ile wynosi `pixel + 10`?

- [x] `tensor([  4, 110,  10], dtype=torch.uint8)`
- [ ] `tensor([260, 110,  10], dtype=torch.uint8)`
- [ ] `tensor([255, 110,  10], dtype=torch.uint8)`
- [ ] Błąd, bo 260 nie mieści się w `uint8`

`uint8` mieści liczby od 0 do 255, a po 255 liczenie zaczyna się od nowa od 0: 250 + 10 to 260, a 260 − 256 = 4. Nic cię nie ostrzega i nic nie zatrzymuje się na 255. Żeby rozjaśnić obraz, najpierw zamień go na liczby zmiennoprzecinkowe, a przed zamianą z powrotem użyj na nich `clamp`.
