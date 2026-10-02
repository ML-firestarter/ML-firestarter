# Regresja liniowa ręcznie

## `X` ma kształt `[100, 3]`. Jaki kształt musi mieć `w`, żeby `X @ w + b` było predykcją dla każdego ze 100 kursów?

- [x] `[3, 1]`
- [ ] `[100, 1]`
- [ ] `[1, 3]`
- [ ] `[3, 100]`

Ostatni wymiar `X`, 3, musi mieć tyle samo liczb co pierwszy wymiar `w`, więc `w` ma 3 wiersze, a jedna kolumna daje jedną predykcję na kurs: `[100, 3] @ [3, 1]` to `[100, 1]`.

## `y_pred` ma kształt `[100, 1]`, a `y` ma kształt `[100]`. Co robi `((y_pred - y) ** 2).mean()`?

- [x] Daje liczbę, średnią z tabeli `[100, 100]`, która nie jest stratą
- [ ] Zatrzymuje się z błędem o kształtach
- [ ] Daje stratę
- [ ] Daje tensor ze 100 liczbami

`[100, 1]` i `[100]` rozgłaszają się w `[100, 100]`: każda predykcja zestawiona z każdą opłatą. PyTorchowi to nie przeszkadza, więc strata, którą daje, jest liczbą, która nic nie znaczy. Etykiety muszą mieć `[100, 1]`.

## Dlaczego pętla treningu potrzebuje `zero_()` tylko dla parametrów, a nie dla `X_std`?

- [x] Tylko parametry wymagają gradientu, więc tylko one zbierają nachylenia
- [ ] `X_std` jest ustandaryzowane, więc jego nachylenia wynoszą 0
- [ ] `zero_()` działa tylko na tensorach z jedną liczbą
- [ ] Nachylenia `X_std` są zerowane przez `backward()`

Nachylenia są zachowywane tylko dla tensorów, które wymagają gradientu: `w` i `b`. `X_std` i `y` to dane, a nie parametry, więc nie mają `.grad` do zerowania.

## Wagi znalezione na ustandaryzowanych cechach to 10,63 i 1,20, a rozrzut odległości wynosi 3,52. Ile wynosi waga kilometra?

- [x] Około 3,02 za kilometr: 10,63 podzielone przez 3,52
- [ ] Około 10,63 za kilometr
- [ ] Około 37,4 za kilometr: 10,63 razy 3,52
- [ ] Około 1,20 za kilometr

Ustandaryzowana odległość to $(x - m) / s$, więc krok 1 w niej to krok $s$ kilometrów, a waga na oryginalnej odległości to $w / s$. 10,63 ÷ 3,52 = 3,02. Mnożenie przez rozrzut idzie w złą stronę.

## Dlaczego nowy kurs standaryzuje się ze średnimi i rozrzutami kursów treningowych?

- [x] Wagi znaleziono na cechach ustandaryzowanych w ten sposób, więc działają tylko na takich
- [ ] Pojedynczy kurs nie ma średniej
- [ ] Dzięki temu predykcja jest o złotówkę wyższa
- [ ] Średnie kursów treningowych zawsze wynoszą 0

Liczby modelu należą do skali, na której je znaleziono. Średnia kursu to jego własna wartość, więc standaryzacja z nią dałaby 0 dla każdej cechy, jakikolwiek by był kurs.
