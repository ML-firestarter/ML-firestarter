# Cele i normy

## Atakujący chce, żeby sieć rozpoznała jedynkę jako siódemkę. Co robi krok ataku ukierunkowanego?

- [ ] Zwiększa stratę dla etykiety 1, jak atak nieukierunkowany
- [x] Zmniejsza stratę dla etykiety 7, idąc przeciwnie do znaków nachyleń
- [ ] Zwiększa stratę dla etykiety 7, idąc zgodnie ze znakami nachyleń
- [ ] Zamienia wagi wyjść dla 1 i dla 7

Atak ukierunkowany liczy stratę dla klasy docelowej i ją zmniejsza: im bardziej sieć jest przekonana, że widzi siódemkę, tym ta strata niższa. Zwiększenie straty dla jedynki sprawiłoby, że sieć się pomyli, ale mogłaby wtedy rozpoznać dowolną inną cyfrę.

## Przy tym samym ε nieukierunkowane PGD oszukuje sieć na 90% obrazów. Co można powiedzieć o ukierunkowanym PGD, które chce, żeby sieć rozpoznawała wszystkie obrazy jako szóstki?

- [ ] Też osiąga mniej więcej 90%
- [ ] Osiąga więcej, bo ma wyraźny cel
- [x] Osiąga mniej: doprowadzenie do jednej wybranej klasy jest trudniejsze niż do dowolnej błędnej
- [ ] Nie uda mu się na żadnym obrazie, który nie jest już szóstką

Atak nieukierunkowany odnosi sukces, gdy tylko sieć przypisze obraz do jakiejkolwiek innej klasy, zwykle najbliższej. Atak ukierunkowany musi dojść do jednej konkretnej klasy, która może być daleko. Na cyfrach przy ε = 0,15 atak nieukierunkowany oszukał sieć na 90% obrazów, a atak wycelowany w szóstkę sprawił, że sieć rozpoznała jako szóstkę 18% z nich.

## Perturbacja zmienia cztery piksele o 0,3, −0,4, 0 i 0. Ile wynosi jej norma L∞?

- [ ] 0,3
- [x] 0,4
- [ ] 0,5
- [ ] 0,7

Norma L∞ to największa wartość bezwzględna zmiany: 0,4. 0,5 to norma L2, a 0,7 to suma wartości bezwzględnych zmian.

## A ile wynosi norma L2 tej perturbacji, ze zmianami o 0,3, −0,4, 0 i 0?

- [ ] 0,4
- [ ] 0,7
- [x] 0,5
- [ ] 0,25

Norma L2 to pierwiastek z sumy kwadratów: 0,09 + 0,16 = 0,25, a pierwiastek z 0,25 to 0,5. To długość perturbacji.

## `delta` zawiera perturbacje porcji obrazów i ma kształt `[obrazy, 1, 8, 8]`. Która linijka daje normę L2 perturbacji każdego obrazu?

- [ ] `delta.norm()`
- [x] `delta.flatten(1).norm(dim=1)`
- [ ] `delta.abs().max()`
- [ ] `delta.flatten(1).abs().max(dim=1).values`

`flatten(1)` zamienia każdy obraz w wiersz 64 liczb, a `norm(dim=1)` liczy normę każdego wiersza. `delta.norm()` daje jedną liczbę dla całej porcji, a ostatnia odpowiedź daje normę L∞ każdego obrazu.

## Czym krok PGD w kuli L2 różni się od kroku PGD w kuli L∞?

- [ ] Przesuwa każdy piksel o α w stronę znaku jego nachylenia
- [ ] Przesuwa tylko piksel o największym nachyleniu
- [x] Przesuwa piksele wzdłuż samych nachyleń, przeskalowanych tak, żeby cały krok miał długość α
- [ ] Robi jeden krok o pełne ε

Gdy ograniczona jest długość perturbacji, strata rośnie najszybciej w kierunku nachyleń, więc piksele o dużych nachyleniach zmieniają się najbardziej, a pozostałe prawie wcale. Przesunięcie każdego piksela o α zgodnie ze znakiem nachylenia to krok w kuli L∞, gdzie każdy piksel ma osobny limit.

## Dwie sieci rozpoznają obrazy z 64 pikseli. Jedna zachowuje 60% przy „L∞, ε = 0,1”, a druga 60% przy „L2, ε = 0,1”. Która z nich wytrzymała silniejszy atak?

- [x] Pierwsza: w kuli L∞ każdy piksel może się zmienić o 0,1, co dopuszcza perturbacje o długości do 0,8
- [ ] Druga: kula L2 jest większa
- [ ] Żadna: ε jest takie samo, więc ataki są równie silne
- [ ] Nie da się tego ocenić bez liczby kroków

Kula L2 o promieniu 0,1 mieści tylko perturbacje o długości najwyżej 0,1. Kula L∞ o promieniu 0,1 pozwala wszystkim 64 pikselom zmienić się naraz o 0,1, co daje perturbację o długości $0{,}1 \times \sqrt{64} = 0{,}8$. Wartość ε bez normy nic nie mówi.

## Atak odsuwa embedding obrazu od pierwotnego położenia, zwiększając kwadrat odległości między dwoma embeddingami. Startuje z oryginalnego obrazu i zwraca go bez zmian. Dlaczego?

- [ ] Embedding nie ma nachyleń względem pikseli
- [ ] Rzutowanie po każdym kroku sprowadza obraz do punktu wyjścia
- [x] W punkcie wyjścia odległość wynosi 0, czyli najmniej, ile może, więc wszystkie nachylenia są zerowe i żaden piksel się nie zmienia
- [ ] Atak potrzebuje etykiet, żeby wiedzieć, dokąd iść

Odległość nie może być mniejsza od 0, a w minimum wszystkie nachylenia są zerowe. Znak zera to zero, więc krok niczego nie zmienia, a następny zaczyna z tego samego miejsca. Losowy punkt startowy w kuli ustawia obraz tam, gdzie nachylenia wskazują jakiś kierunek.

## Czego potrzebuje atak na embedding sieci ponad to, czego potrzebuje atak na jej klasy?

- [ ] Etykiet obrazów
- [ ] Większego ε
- [x] Niczego więcej: nie potrzebuje nawet etykiet, tylko obrazu i sieci
- [ ] Sieci po treningu adwersarialnym

Strata to odległość między dwoma embeddingami tego samego obrazu, przed zmianą i po niej, więc nie ma tu czego etykietować. Dlatego ten atak działa na sieci, których używa się wyłącznie ze względu na ich embeddingi, na przykład do porównywania albo wyszukiwania obrazów.
