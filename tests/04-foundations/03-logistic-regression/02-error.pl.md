# Mierzenie błędu

## Reguła daje czterem zamówieniom prawdopodobieństwa anulowania 0,8; 0,4; 0,6 i 0,3, a anulowano tylko dwa pierwsze. Ile wynosi jej dokładność przy progu 0,5?

- [x] 0,5
- [ ] 2
- [ ] 0,525
- [ ] 0,75

Decyzje to 1, 0, 1 i 0. Pierwsza i ostatnia są trafne, drugie zamówienie anulowano, choć reguła przewidywała, że nie zostanie anulowane, a trzeciego nie anulowano, choć przewidywała, że zostanie: 2 trafne decyzje z 4, czyli 0,5. 2 to liczba trafnych decyzji przed podzieleniem przez liczbę zamówień, a 0,525 to średnia prawdopodobieństw, która w ogóle nie jest oceną.

## Dlaczego dokładność to kiepska ocena do treningu?

- [x] Mała zmiana $w$ albo $b$ zwykle w ogóle jej nie zmienia
- [x] Gdy decyzja jest trafna, prawdopodobieństwo 0,51 liczy się tak samo jak 0,99
- [ ] Nie da się jej policzyć bez punktu odniesienia
- [ ] Może być ujemna

Dokładność zmienia się tylko wtedy, gdy granica przeskakuje przez jakieś zamówienie, więc małe przesunięcie zwykle niczego nie zmienia i nie może pokazać treningowi, w którą stronę jest lepiej. Dokładność ignoruje też to, jak pewna była reguła. Nadal dobrze nadaje się do podawania wyników i zawsze mieści się między 0 a 1.

## Reguła dała zamówieniu, którego nie anulowano, prawdopodobieństwo anulowania 0,75. $\ln 0{,}25$ to około −1,386, a $\ln 0{,}75$ około −0,288. Ile wynosi kara tego zamówienia?

- [x] Około 1,386
- [ ] Około 0,288
- [ ] Około −1,386
- [ ] 0,25

Zamówienia nie anulowano, więc reguła dała temu, co się stało, prawdopodobieństwo 1 − 0,75 = 0,25, a kara to $-\ln 0{,}25$, czyli około 1,386. 0,288 korzysta z prawdopodobieństwa anulowania, które się nie wydarzyło, −1,386 pomija minus przed logarytmem, a 0,25 to prawdopodobieństwo, zanim weźmie się jego logarytm.

## Która z tych predykcji dostaje największą karę?

- [x] Prawdopodobieństwo 0,99 dla zamówienia, którego nie anulowano
- [ ] Prawdopodobieństwo 0,6 dla zamówienia, którego nie anulowano
- [ ] Prawdopodobieństwo 0,5 dla zamówienia, które anulowano
- [ ] Prawdopodobieństwo 0,01 dla zamówienia, którego nie anulowano

Kara zależy od prawdopodobieństwa, które reguła dała temu, co się stało: 1 − 0,99 = 0,01 dla pierwszego zamówienia, 0,4 dla drugiego, 0,5 dla trzeciego i 0,99 dla czwartego. Im jest ono mniejsze, tym większa kara, a $-\ln 0{,}01$ to około 4,605. Najwięcej kosztuje pewność połączona z pomyłką.

## W zeszłym tygodniu anulowano 1 zamówienie na 4. Jakie prawdopodobieństwo najlepszy punkt odniesienia daje każdemu zamówieniu?

- [x] 0,25
- [ ] 0,5
- [ ] 0,75
- [ ] 0

Punkt odniesienia ignoruje czas oczekiwania i daje każdemu zamówieniu to samo prawdopodobieństwo, a najmniejszą stratę logarytmiczną daje odsetek zamówień, które anulowano. 0,5 jest najlepsze tylko wtedy, gdy anulowano połowę z nich, 0,75 to odsetek tych, których nie anulowano, a 0 oznacza pewność, że żadne zamówienie nie zostanie anulowane, więc te, które anulowano, dostałyby nieskończenie dużą karę.

## Dwie reguły podejmują te same decyzje przy tych samych zamówieniach, więc mają tę samą dokładność. Czy ich straty logarytmiczne mogą się różnić?

- [x] Tak, bo strata logarytmiczna zależy też od tego, jak pewna jest każda z reguł
- [ ] Nie, te same decyzje zawsze dają tę samą stratę logarytmiczną
- [ ] Tylko jeśli jedna z reguł ma ujemną wagę
- [ ] Tylko jeśli niektóre zamówienia leżą dokładnie na granicy

Stratę logarytmiczną liczy się z prawdopodobieństw, a nie z decyzji. Reguły z $w = 0{,}5$ i $b = -4$ oraz z $w = 1$ i $b = -8$ mają granicę przy 8 minutach i podejmują te same decyzje, ale ich straty logarytmiczne na sześciu zamówieniach to 0,496 i 0,716.
