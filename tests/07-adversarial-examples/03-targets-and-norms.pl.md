# Cele i normy

## Atakujący chce, żeby obraz 1 został przeczytany jako 7. Co robi krok ataku ukierunkowanego?

- [ ] Podnosi stratę dla etykiety 1, jak atak nieukierunkowany
- [x] Obniża stratę dla etykiety 7, robiąc krok przeciwnie do znaków nachyleń
- [ ] Podnosi stratę dla etykiety 7, robiąc krok zgodnie ze znakami nachyleń
- [ ] Zamienia wagi wyjść dla 1 i dla 7

Atak ukierunkowany liczy stratę dla etykiety, której chce, i schodzi po niej w dół: im bardziej sieć wierzy w 7, tym ta strata niższa. Podniesienie straty dla 1 sprawiłoby, że sieć się pomyli, ale mogłaby przeczytać dowolną inną cyfrę.

## Przy tym samym ε nieukierunkowane PGD oszukuje sieć na 90% obrazów. Co można powiedzieć o ukierunkowanym PGD, które chce, żeby wszystkie były czytane jako 6?

- [ ] Też udaje mu się na mniej więcej 90% z nich
- [ ] Udaje mu się na większej ich liczbie, bo ma jasny cel
- [x] Udaje mu się na mniejszej ich liczbie: dojście do jednej wybranej klasy jest trudniejsze niż do jakiejkolwiek złej
- [ ] Nie może się udać na żadnym obrazie, który nie jest już 6

Atak nieukierunkowany kończy się, gdy tylko obraz przejdzie do jakiejkolwiek innej klasy, najbliższej. Atak ukierunkowany musi dojść do jednej konkretnej klasy, która może być daleko. Na cyfrach, przy ε = 0,15, atak nieukierunkowany oszukał 90% obrazów, a atak wycelowany w 6 sprawił, że jako 6 czytane było 18% z nich.

## Zaburzenie zmienia cztery piksele o 0,3, −0,4, 0 i 0. Ile wynosi jego norma L∞?

- [ ] 0,3
- [x] 0,4
- [ ] 0,5
- [ ] 0,7

Norma L∞ to największa zmiana, bez znaku: 0,4. 0,5 to jego norma L2, a 0,7 to suma zmian bez znaków.

## A ile wynosi norma L2 tego zaburzenia, ze zmianami o 0,3, −0,4, 0 i 0?

- [ ] 0,4
- [ ] 0,7
- [x] 0,5
- [ ] 0,25

Norma L2 to pierwiastek z sumy kwadratów: 0,09 + 0,16 = 0,25, a pierwiastek z 0,25 to 0,5. To długość zaburzenia.

## `delta` ma zaburzenia porcji obrazów, o kształcie `[obrazy, 1, 8, 8]`. Który wiersz daje normę L2 zaburzenia każdego obrazu?

- [ ] `delta.norm()`
- [x] `delta.flatten(1).norm(dim=1)`
- [ ] `delta.abs().max()`
- [ ] `delta.flatten(1).abs().max(dim=1).values`

`flatten(1)` robi z każdego obrazu wiersz 64 liczb, a `norm(dim=1)` bierze normę każdego wiersza. `delta.norm()` daje jedną liczbę dla całej porcji. Ostatni wiersz daje normę L∞ każdego obrazu.

## PGD w kuli L2 różni się od PGD w kuli L∞ swoim krokiem. Czym?

- [ ] Przesuwa każdy piksel o α w kierunku znaku jego nachylenia
- [ ] Przesuwa tylko piksel o największym nachyleniu
- [x] Przesuwa piksele wzdłuż samych nachyleń, przeskalowanych tak, żeby cały krok miał długość α
- [ ] Robi jeden krok o całe ε

Przy limicie na długość zaburzenia strata rośnie najbardziej w kierunku nachyleń, więc piksele o dużych nachyleniach przesuwają się najbardziej, a pozostałe prawie wcale. Przesuwanie każdego piksela o α zgodnie ze znakiem jego nachylenia to krok dla kuli L∞, gdzie każdy piksel ma własny limit.

## Dwie sieci czytają obrazy z 64 pikseli. Jedna zachowuje 60% pod „L∞, ε = 0,1”, a druga 60% pod „L2, ε = 0,1”. Która z nich wytrzymała silniejszy atak?

- [x] Pierwsza: w kuli L∞ każdy piksel może przesunąć się o 0,1, co pozwala na zaburzenia o długości do 0,8
- [ ] Druga: kula L2 jest większa z tych dwóch
- [ ] Żadna: ε jest to samo, więc ataki są tak samo silne
- [ ] Nie da się tego powiedzieć bez liczby kroków

Kula L2 o promieniu 0,1 mieści tylko zaburzenia o długości 0,1 lub mniejszej. Kula L∞ o promieniu 0,1 pozwala wszystkim 64 pikselom przesunąć się o 0,1 naraz, co daje zaburzenie o długości $0{,}1 \times \sqrt{64} = 0{,}8$. ε bez normy nic nie znaczy.

## Atak odpycha embedding obrazu od miejsca, w którym był, wspinając się po kwadracie odległości między dwoma embeddingami. Zaczyna od samego obrazu i zwraca go niezmienionego. Dlaczego?

- [ ] Embedding nie ma nachyleń względem pikseli
- [ ] Rzut sprowadza obraz po każdym kroku z powrotem tam, gdzie zaczął
- [x] Przy samym obrazie odległość wynosi 0, najmniej, ile może, więc każde nachylenie to 0 i żaden piksel się nie rusza
- [ ] Atak potrzebuje etykiet, żeby wiedzieć, dokąd iść

Odległość nie może być mniejsza niż 0, a w najniższym punkcie wszystkie nachylenia są równe 0. Znak 0 to 0, więc krok niczego nie przesuwa, a następny zaczyna z tego samego miejsca. Losowy start w kuli stawia obraz tam, gdzie nachylenia wskazują jakiś kierunek.

## Czego potrzebuje atak na embedding sieci ponad to, czego potrzebuje atak na jej klasy?

- [ ] Etykiet obrazów
- [ ] Większego ε
- [x] Niczego więcej: nie potrzebuje etykiet, tylko obrazu i sieci
- [ ] Sieci wytrenowanej treningiem antagonistycznym

Strata to odległość między dwoma embeddingami tego samego obrazu, przed zmianą i po niej, więc nie ma czego etykietować. Dlatego ten atak działa na sieci, których używa się tylko dla ich embeddingów, do porównywania obrazów albo przeszukiwania ich.
