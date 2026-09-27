# Trening sieci

## W minipaczce 4 zamówień nachylenia zamówień względem $c$ wynoszą 0,3; −0,5; 0,1 i −0,3, a $c$ wynosi 1. Ile wynosi $c$ po kroku przy współczynniku uczenia 0,5?

- [x] 1,05
- [ ] 1,2
- [ ] 0,95
- [ ] 1,1

Nachylenie minipaczki to średnia nachyleń zamówień: (0,3 − 0,5 + 0,1 − 0,3) ÷ 4 = −0,1. Krok przesuwa $c$ przeciwnie do niego: $1 - 0{,}5 \times (-0{,}1) = 1{,}05$. 1,2 używa sumy nachyleń, −0,4, zamiast ich średniej, 0,95 przesuwa $c$ zgodnie z nachyleniem zamiast przeciwnie do niego, a 1,1 pomija współczynnik uczenia.

## Oba neurony ukryte zaczynają z tą samą wagą, tym samym wyrazem wolnym i tą samą wagą do neuronu wyjściowego. Co dzieje się podczas treningu?

- [x] W każdym kroku dostają te same nachylenia, więc pozostają takie same, a sieć nie narysuje U
- [ ] Po kilku krokach się rozchodzą, bo zamówienia są różne
- [ ] Trening zatrzymuje się po pierwszym kroku
- [ ] Zmieniają się tylko parametry neuronu wyjściowego

Neurony, które zaczynają tak samo, dają tę samą aktywację dla każdego zamówienia i dostają te same błędy, więc dostają też te same nachylenia i robią te same kroki, na zawsze: zostają bliźniakami, niezależnie od zamówień. Do U potrzebne jest jedno S, które opada, i drugie, które rośnie. Zapobiega temu start, w którym każda waga i każdy wyraz wolny to inna losowa liczba.

## Dlaczego w lekcji sieć dostaje odległość każdego kursu od 7 km, km − 7, zamiast jego długości w km?

- [x] Środek losowego S wypada wtedy wśród zamówień, więc dużo mniej startów utyka
- [ ] km − 7 tworzy inną sieć, z większą liczbą parametrów
- [ ] Sigmoida nie przyjmuje liczb większych niż 7
- [ ] Dzięki temu strata od początku wynosi 0

Gdy $w$ i $b$ są losowe między −1 a 1, środek S, gdzie $wx + b = 0$, wypada między −1 a 1 w połowie przypadków. Z km jako wejściem to skrajnie na lewo od zamówień, które mają od 1 do 14 km, a z km − 7 to między 6 a 8 km, w samym środku zamówień. Na ośmiu zamówieniach zmniejszyło to liczbę utykających startów z 11 na 20 do zera. To nadal ta sama sieć, bo S względem km jest też S względem km − 7, tylko z innym wyrazem wolnym.

## Trening utyka przy stracie 0,49, a każde nachylenie jest bliskie 0, choć z innych startów strata spada prawie do 0. Co może pomóc?

- [x] Zacząć od nowa z innym ziarnem
- [x] Wyśrodkować wejścia na 0, jeśli jeszcze nie są wyśrodkowane
- [ ] Zrobić dużo więcej kroków od tego samego startu
- [ ] Zacząć od wszystkich parametrów równych 0

Sieć jest w płaskim miejscu: każde nachylenie jest bliskie 0, więc spadek gradientu prawie się nie rusza, choć strata mogłaby być dużo niższa. Po 50 000 kroków ziarno 1 z lekcji wciąż miało stratę 0,478. To, gdzie kończy się trening, zależy od tego, gdzie się zaczyna, więc inny losowy start może dać dużo lepszy wynik, a wyśrodkowane wejścia sprawiają, że złe starty zdarzają się rzadziej. Start ze wszystkimi parametrami równymi 0 jest jeszcze gorszy: neurony ukryte zostają bliźniakami, a na ośmiu zamówieniach trening w ogóle się nie rusza.

## Zbiór treningowy ma 1000 przykładów, a każda minipaczka 50. Ile kroków trwa jedna epoka?

- [x] 20
- [ ] 50
- [ ] 1000
- [ ] 50 000

Epoka używa każdego przykładu raz, a każdy krok jednej minipaczki, więc trwa 1000 ÷ 50 = 20 kroków. 50 to wielkość minipaczki, 1000 to jeden krok na każdy przykład, a 50 000 to mnożenie zamiast dzielenia.

## Podczas treningu strata na zbiorze treningowym cały czas spada, ale strata na zbiorze walidacyjnym rośnie od kroku 400. Którą sieć warto zachować?

- [x] Tę z kroku 400, w którym strata walidacyjna była najniższa
- [ ] Tę z ostatniego kroku, w którym strata treningowa jest najniższa
- [ ] Sieć trenowaną dłużej, aż strata treningowa dojdzie do 0
- [ ] Tę z kroku 0, zanim czegokolwiek się nauczyła

Sieć nigdy nie trenuje się na zamówieniach walidacyjnych, więc ich strata pokazuje, jak radzi sobie z zamówieniami, których nie widziała. Od kroku 400 uczy się samych zamówień treningowych, aż po ich przypadkowe wyniki: to nadmierne dopasowanie. Zachowanie sieci z najniższą stratą walidacyjną i przerwanie treningu, gdy ta strata przestaje spadać, to wczesne zatrzymanie. Strata treningowa cały czas spada, więc nie powie, kiedy przestać, a w kroku 0 sieć jest jeszcze losowa.
