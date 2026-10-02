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
