# Oszukiwanie sieci

## Czym jest przykład adwersarialny?

- [ ] Obrazem, który sieć rozpoznaje błędnie, bo od początku był trudny do odczytania
- [x] Obrazem zmienionym celowo i tak nieznacznie, że człowiek widzi w nim to samo co wcześniej, a sieć rozpoznaje go błędnie
- [ ] Obrazem treningowym z błędną etykietą
- [ ] Obrazem z dodanym losowym szumem

Zmianę wprowadza się celowo, w kierunku, który szkodzi sieci, i jest ona na tyle mała, że człowiek nadal widzi na obrazie to samo. Obraz po prostu trudny do odczytania albo obraz z losowym szumem nie jest przykładem adwersarialnym, bo nikt nie przygotował go przeciwko sieci.

## `slope` zawiera nachylenie straty względem każdego piksela obrazów z `X`. Która linijka to krok FGSM?

- [x] `(X + epsilon * slope.sign()).clamp(0, 1)`
- [ ] `(X - epsilon * slope.sign()).clamp(0, 1)`
- [ ] `(X + epsilon * slope).clamp(0, 1)`
- [ ] `(X + slope.sign()).clamp(0, epsilon)`

Każdy piksel przesuwa się o ε w stronę znaku swojego nachylenia, czyli tak, żeby strata rosła, a `clamp` utrzymuje piksele między 0 a 1. Z minusem krok zmniejszałby stratę i sieć byłaby jeszcze pewniejsza poprawnej odpowiedzi. Bez `sign()` piksel przesuwa się o ε razy swoje nachylenie, czyli zwykle o dużo mniej niż ε.

## Piksel ma wartość 0,02, a jego nachylenie jest ujemne. Jaką wartość będzie miał po FGSM z ε = 0,1?

- [ ] −0,08
- [ ] 0,12
- [x] 0
- [ ] 0,02

Krok przenosi go do −0,08, a takiej wartości piksel mieć nie może, więc `clamp(0, 1)` przycina go do 0. Zmienił się o 0,02, mniej niż ε, więc obraz nadal leży w kuli o promieniu ε.

## Trzy piksele obrazu mają wartości 0,5, 0,2 i 0,9. Po ataku mają 0,58, 0,2 i 0,85, a pozostałe piksele się nie zmieniły. Ile wynosi odległość L∞ między tymi obrazami?

- [ ] 0,13
- [x] 0,08
- [ ] 0,05
- [ ] 0,03

Odległość L∞ to największa zmiana pojedynczego piksela. Zmiany wynoszą 0,08, 0 i 0,05, więc odległość to 0,08, a zaatakowany obraz leży w kuli o promieniu ε dla każdego ε od 0,08 w górę. 0,13 to suma zmian, czyli inny sposób mierzenia.

## FGSM z ε = 0,1 obniża dokładność sieci z 94% do 56%. Losowa zmiana każdego piksela o 0,1 w górę albo w dół obniża ją tylko do 92%. Skąd ta różnica?

- [ ] FGSM zmienia więcej pikseli niż losowe zmiany
- [ ] FGSM zmienia każdy piksel bardziej niż losowe zmiany
- [x] FGSM przesuwa każdy piksel w stronę, w którą rośnie strata, a losowe kierunki w dużej mierze się znoszą
- [ ] Losowe zmiany cofa `clamp(0, 1)`

W obu przypadkach każdy piksel zmienia się o te same 0,1. Przy losowych znakach mniej więcej połowa pikseli zwiększa stratę, a połowa ją zmniejsza. FGSM bierze znak każdego piksela z nachylenia, więc wszystkie działają w tę samą stronę.

## `fgsm` dostaje porcję 297 obrazów i liczy nachylenia średniej straty z całej porcji. Jaki krok dostaje każdy obraz?

- [ ] Taki sam jak każdy inny obraz, wyznaczony ze średniej z 297 nachyleń
- [ ] 297 razy mniejszy niż krok, który dostałby sam
- [x] Zgodny z własnymi nachyleniami, taki sam jak wtedy, gdy atakuje się go osobno
- [ ] Żaden, bo nachylenia da się liczyć tylko dla jednego obrazu naraz

Piksele obrazu wpływają tylko na jego składnik straty, więc jego nachylenia zależą tylko od niego. Średnia dzieli je przez 297, a `sign()` daje ten sam znak dla nachylenia i dla jego 297. części.

## Po ataku sieć rozróżniająca dziesięć cyfr ma dokładność 4%. Co to oznacza?

- [ ] Sieć zgaduje
- [x] Atak prowadzi sieć do błędnych odpowiedzi: zgadując, trafiałaby mniej więcej w 10% przypadków
- [ ] Atak zmienił etykiety
- [ ] Sieć była za krótko trenowana

Sieć, która zgadywałaby jedną z dziesięciu cyfr, trafiałaby mniej więcej co dziesiąty raz. Wynik poniżej tego oznacza, że atak systematycznie odpycha sieć od poprawnej odpowiedzi, bo wie, w którą stronę ją pchać.

## Dlaczego atak wywołuje `requires_grad_()` na kopii obrazów?

- [ ] Żeby optymalizator mógł zmieniać obrazy
- [ ] Żeby zamrozić wagi modelu
- [x] Żeby autograd policzył nachylenie straty względem każdego piksela
- [ ] Żeby dało się przyciąć piksele

Autograd zapisuje tylko obliczenia na oznaczonych tensorach. Obrazy to dane i nie są oznaczone, więc atak oznacza ich kopię, a potem prosi o nachylenie przez `torch.autograd.grad(loss, X)`. Optymalizator nie jest tu potrzebny: atak wykonuje swój krok samodzielnie.
