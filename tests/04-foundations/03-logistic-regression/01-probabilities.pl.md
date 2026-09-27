# Przewidywanie prawdopodobieństwa

## Dlaczego prosta nie może przewidywać prawdopodobieństwa anulowania?

- [x] Jeśli odejść dostatecznie daleko, każda prosta, która nie jest płaska, schodzi poniżej 0 albo wychodzi ponad 1
- [ ] Prosta nie może zbliżyć się do policzonych odsetków pośrodku
- [ ] Prosta może przewidywać tylko liczby całkowite
- [ ] Prosta potrzebuje więcej niż jednej cechy

Prosta nigdy nie przestaje rosnąć, więc przy jakimś czasie oczekiwania przewiduje prawdopodobieństwo powyżej 1, a przy innym poniżej 0. Prosta przez policzone odsetki przy 6 i 10 minutach była pośrodku blisko nich, ale przy 2 minutach przewidywała −0,19, a przy 14 minutach 1,19.

## Reguła ma $w = 1$ i $b = -8$. Sigmoida w punkcie 2 wynosi około 0,881, a w punkcie −2 około 0,119. Jakie prawdopodobieństwo anulowania reguła daje zamówieniu z czasem oczekiwania 10 minut?

- [x] Około 0,881
- [ ] 2
- [ ] Około 0,119
- [ ] Około 0,731

Wynik prostej to $z = 1 \times 10 - 8 = 2$, a sigmoida ściska go do około 0,881. 2 to wynik prostej przed ściśnięciem, 0,119 byłoby prawdopodobieństwem przy 6 minutach, gdzie $z = -2$, a 0,731 daje przy 10 minutach reguła z $w = 0{,}5$ i $b = -4$.

## Reguła przewiduje prawdopodobieństwo, że klient dobrze oceni kierowcę, na podstawie czasu oczekiwania w minutach. Jej $w$ wynosi −0,3. Co oznacza ujemna waga?

- [x] Im dłuższe oczekiwanie, tym mniej prawdopodobna dobra ocena
- [ ] Im dłuższe oczekiwanie, tym bardziej prawdopodobna dobra ocena
- [ ] Reguła przewiduje ujemne prawdopodobieństwa przy długim oczekiwaniu
- [ ] Ocena nie zależy od czasu oczekiwania

Ujemne $w$ odwraca krzywą: wynik prostej maleje, gdy czas oczekiwania rośnie, a razem z nim maleje prawdopodobieństwo. Sigmoida nadal utrzymuje je między 0 a 1, niezależnie od tego, jak długie jest oczekiwanie.

## Reguła ma $w = 0{,}25$ i $b = -3$. Od jakiego czasu oczekiwania reguła przewiduje przy progu 0,5, że zamówienie zostanie anulowane?

- [x] Od 12 minut
- [ ] Od 0,75 minuty
- [ ] Od −12 minut
- [ ] Od 3 minut

Przy progu 0,5 decyzja zmienia się tam, gdzie wynik prostej wynosi 0, a $0{,}25x - 3 = 0$ przy $x = 3 \div 0{,}25 = 12$. 0,75 to mnożenie zamiast dzielenia, −12 ma zły znak, a 3 pomija wagę.

## Firma obniża próg z 0,5 do 0,3. Co się dzieje?

- [x] Reguła przewiduje anulowanie większej liczby zamówień
- [ ] Reguła przewiduje anulowanie mniejszej liczby zamówień
- [ ] Przewidywane prawdopodobieństwa maleją
- [ ] Zmieniają się $w$ i $b$ reguły

Prawdopodobieństwa się nie zmieniają, ale reguła przewiduje teraz anulowanie już od prawdopodobieństwa 0,3, więc do zamówień, przy których przewidywała je wcześniej, dołączają te z prawdopodobieństwem między 0,3 a 0,5. Przy $w = 0{,}5$ i $b = -4$ granica przesuwa się z 8 minut do około 6,3. Próg to decyzja biznesowa o tym, co zrobić z prawdopodobieństwami, i nie zmienia ani $w$, ani $b$.

## Reguła z dwiema cechami to $p = \sigma(0{,}5 x_1 - 0{,}25 x_2 - 3)$, gdzie $x_1$ to czas oczekiwania w minutach, a $x_2$ długość kursu w km. O których z tych zamówień przewiduje przy progu 0,5, że zostaną anulowane?

- [x] Czas oczekiwania 14 minut i kurs na 8 km
- [x] Czas oczekiwania 8 minut i kurs na 2 km
- [ ] Czas oczekiwania 10 minut i kurs na 12 km
- [ ] Czas oczekiwania 4 minuty i kurs na 2 km

Reguła przewiduje anulowanie wszędzie tam, gdzie wynik prostej wynosi 0 lub więcej. Dla pierwszego zamówienia to 7 − 2 − 3 = 2, dla drugiego 4 − 0,5 − 3 = 0,5, dla trzeciego 5 − 3 − 3 = −1, a dla czwartego 2 − 0,5 − 3 = −1,5. Przez długi kurs 10 minut oczekiwania to mniejsze ryzyko niż 8 minut.
