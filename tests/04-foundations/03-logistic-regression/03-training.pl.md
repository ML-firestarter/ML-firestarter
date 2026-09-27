# Trening

## Zamówienia z czasem oczekiwania 10 minut nie anulowano, a reguła daje mu $p = 0{,}9$. Ile dodaje ono do sumy w nachyleniu względem $w$, zanim suma zostanie podzielona przez liczbę zamówień?

- [x] 9
- [ ] −9
- [ ] 0,9
- [ ] 18

Każde zamówienie dodaje swój błąd, $p - y = 0{,}9 - 0 = 0{,}9$, razy swój czas oczekiwania: 0,9 × 10 = 9. −9 to odejmowanie w odwrotnej kolejności, 0,9 pomija czas oczekiwania, co robi tylko nachylenie względem $b$, a 18 to dwa razy tyle, jak w nachyleniu MSE.

## Przy obecnej regule nachylenie względem $w$ wynosi 0,5, a względem $b$ −0,2. Co zrobi jeden krok przy współczynniku uczenia 0,1?

- [x] $w$ zmaleje o 0,05, a $b$ wzrośnie o 0,02
- [ ] $w$ wzrośnie o 0,05, a $b$ zmaleje o 0,02
- [ ] Oba zmaleją o 0,07
- [ ] $w$ zmaleje o 0,5, a $b$ wzrośnie o 0,2

Każdy parametr przesuwa się przeciwnie do własnego nachylenia, o współczynnik uczenia razy nachylenie: $w - 0{,}1 \times 0{,}5$ to o 0,05 mniej niż $w$, a $b - 0{,}1 \times (-0{,}2)$ to o 0,02 więcej niż $b$. Druga odpowiedź idzie pod górę, a ostatnia pomija współczynnik uczenia.

## Przy $w = 0$ i $b = 0$ nachylenie względem $b$ na sześciu zamówieniach wynosi 0. Dlaczego?

- [x] Każde zamówienie dostaje 0,5, a anulowano połowę z nich, więc ich błędy, 0,5 i −0,5, się znoszą
- [ ] Nachylenie względem $b$ zawsze wynosi 0
- [ ] $b$ ma już najlepszą wartość
- [ ] Nachylenie względem $b$ nie zależy od etykiet

Nachylenie względem $b$ uśrednia błędy, $p - y$. Gdy każde $p$ wynosi 0,5, trzy zamówienia, których nie anulowano, mają błąd 0,5, a trzy, które anulowano, −0,5, więc błędy sumują się do 0. Tak jest tylko na początku: gdy pierwszy krok zmieni $w$, zmieniają się prawdopodobieństwa, a $b$ też zaczyna się ruszać, w stronę swojej najlepszej wartości, −2,93.

## Trening na sześciu zamówieniach nie może zejść ze stratą logarytmiczną poniżej 0,479. Dlaczego?

- [x] Dwóch klientów zrobiło odwrotnie, niż sugerowały ich czasy oczekiwania, więc żadna reguła nie może być pewna i mieć racji przy każdym zamówieniu
- [ ] Współczynnik uczenia jest za mały, żeby zejść niżej
- [ ] Spadek gradientu nigdy nie daje straty logarytmicznej poniżej około 0,5
- [ ] Sigmoida nie może dać prawdopodobieństwa powyżej 0,9

Strata bliska 0 wymaga reguły, która przy każdym zamówieniu daje temu, co się stało, prawdopodobieństwo bliskie 1. Ale klient, który czekał 6 minut, anulował, a ten, który czekał 10 minut, nie, więc żadna reguła nie może być pewna i mieć racji przy wszystkich sześciu. 0,479 to najmniejsza strata, jaką może na nich osiągnąć jakakolwiek reguła, a przy mniejszym współczynniku uczenia trening tylko wolniej by do niej doszedł.

## W pięciu kolejnych krokach strata wynosi 0,60; 0,95; 0,58; 1,10; 0,57. Co należy zrobić?

- [x] Zmniejszyć współczynnik uczenia
- [ ] Zwiększyć współczynnik uczenia
- [ ] Trenować przez więcej kroków
- [ ] Zacząć od innego $w$

Strata, która skacze w górę i w dół, oznacza, że kroki przeskakują dno, a następne skaczą z powrotem. Mniejszy współczynnik uczenia daje krótsze kroki i strata spada płynnie. Przy stracie logarytmicznej za duży współczynnik uczenia sprawia, że trening właśnie tak skacze i nigdy się nie stabilizuje, niezależnie od liczby kroków.

## Regresję liniową da się rozwiązać wprost, równaniem normalnym. Dlaczego regresję logistyczną trenuje się krok po kroku?

- [x] Nie ma wzoru na $w$ i $b$, przy których jej nachylenia wynoszą 0
- [ ] Rozwiązanie wprost dałoby gorszą regułę
- [ ] Spadek gradientu znajduje lepszą regułę niż jakikolwiek wzór
- [ ] Regresja logistyczna ma więcej parametrów niż regresja liniowa

Najlepsza reguła leży tam, gdzie oba nachylenia wynoszą 0, ale każde $p_i$ w nich to sigmoida czegoś, w czym są $w$ i $b$, i żaden wzór nie rozwiązuje tych równań względem $w$ i $b$. Spadek gradientu nie potrzebuje wzoru na odpowiedź, tylko wzoru na nachylenia, i dlatego może trenować zarówno regresję logistyczną, jak i sieci neuronowe czy modele językowe.
