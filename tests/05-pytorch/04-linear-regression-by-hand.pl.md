# Regresja liniowa ręcznie

## `X` ma kształt `[100, 3]`. Jaki kształt musi mieć `w`, żeby `X @ w + b` dawało predykcję dla każdego ze 100 kursów?

- [x] `[3, 1]`
- [ ] `[100, 1]`
- [ ] `[1, 3]`
- [ ] `[3, 100]`

Ostatni wymiar `X`, 3, musi być równy pierwszemu wymiarowi `w`, więc `w` ma 3 wiersze, a jedna kolumna daje jedną predykcję na kurs: `[100, 3] @ [3, 1]` to `[100, 1]`.

## `y_pred` ma kształt `[100, 1]`, a `y` ma kształt `[100]`. Co robi `((y_pred - y) ** 2).mean()`?

- [x] Daje liczbę, średnią z tabeli `[100, 100]`, która nie jest stratą
- [ ] Zatrzymuje program z błędem o kształtach
- [ ] Daje stratę
- [ ] Daje tensor ze 100 liczbami

`[100, 1]` i `[100]` rozgłaszają się do `[100, 100]`: każda predykcja zostaje zestawiona z każdą opłatą. PyTorchowi to nie przeszkadza, więc dostajesz stratę, która nic nie znaczy. Etykiety muszą mieć kształt `[100, 1]`.

## Dlaczego pętla treningowa potrzebuje `zero_()` tylko dla parametrów, a nie dla `X_std`?

- [x] Tylko parametry wymagają gradientu, więc tylko one zbierają nachylenia
- [ ] `X_std` jest standaryzowane, więc jego nachylenia wynoszą 0
- [ ] `zero_()` działa tylko na tensorach z jedną liczbą
- [ ] Nachylenia `X_std` zeruje `backward()`

Nachylenia są zachowywane tylko dla tensorów, które wymagają gradientu, czyli `w` i `b`. `X_std` i `y` to dane, a nie parametry, więc nie mają `.grad`, które trzeba by zerować.

## Wagi znalezione na standaryzowanych cechach to 10,63 i 1,20, a rozrzut odległości wynosi 3,52. Ile wynosi waga kilometra?

- [x] Około 3,02 za kilometr: 10,63 podzielone przez 3,52
- [ ] Około 10,63 za kilometr
- [ ] Około 37,4 za kilometr: 10,63 razy 3,52
- [ ] Około 1,20 za kilometr

Standaryzowana odległość to $(x - m) / s$, więc krok o 1 w niej to krok o $s$ kilometrów, a waga dla oryginalnej odległości to $w / s$: 10,63 ÷ 3,52 = 3,02. Mnożenie przez rozrzut działa w odwrotną stronę.

## Dlaczego nowy kurs standaryzuje się średnimi i rozrzutami kursów treningowych?

- [x] Wagi znaleziono na cechach standaryzowanych w ten sposób, więc działają tylko na takich cechach
- [ ] Pojedynczy kurs nie ma średniej
- [ ] Dzięki temu predykcja jest o złotówkę wyższa
- [ ] Średnie kursów treningowych zawsze wynoszą 0

Liczby modelu pasują tylko do skali, na której je znaleziono. Średnia z jednego kursu to po prostu jego własna wartość, więc standaryzacja nią dałaby 0 dla każdej cechy, niezależnie od kursu.
