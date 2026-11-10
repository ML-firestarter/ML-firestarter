# Oszukiwanie sieci

## Czym jest przykład antagonistyczny?

- [ ] Obrazem, który sieć czyta źle, bo od początku był trudny do odczytania
- [x] Obrazem zmienionym odrobinę, celowo, tak żeby sieć przeczytała go źle, a człowiek tak samo jak przedtem
- [ ] Obrazem treningowym, który dostał złą etykietę
- [ ] Obrazem z dodanym losowym szumem

Zmiana jest robiona celowo, w kierunku, który szkodzi sieci, i jest na tyle mała, że obraz znaczy dla człowieka to samo. Obraz, który jest po prostu trudny do odczytania, ani obraz z losowym szumem nim nie jest: nikt nie wycelował go w sieć.

## `slope` ma nachylenie straty względem każdego piksela obrazów w `X`. Który wiersz to krok FGSM?

- [x] `(X + epsilon * slope.sign()).clamp(0, 1)`
- [ ] `(X - epsilon * slope.sign()).clamp(0, 1)`
- [ ] `(X + epsilon * slope).clamp(0, 1)`
- [ ] `(X + slope.sign()).clamp(0, epsilon)`

Każdy piksel przesuwa się o ε w kierunku znaku swojego nachylenia, w górę straty, a `clamp` trzyma piksele między 0 a 1. Z minusem krok idzie w dół straty i sieć staje się pewniejsza właściwej odpowiedzi. Bez `sign()` piksel przesuwa się o ε razy swoje nachylenie, czyli dla większości pikseli o dużo mniej niż ε.

## Piksel ma wartość 0,02, a jego nachylenie jest ujemne. Gdzie jest po FGSM z ε = 0,1?

- [ ] Na −0,08
- [ ] Na 0,12
- [x] Na 0
- [ ] Na 0,02

Krok zabiera go na −0,08, co nie jest pikselem, a `clamp(0, 1)` sprowadza go z powrotem na 0. Przesunął się o 0,02, mniej niż ε, więc obraz nadal jest w kuli ε.

## Trzy piksele obrazu mają wartości 0,5, 0,2 i 0,9. Po ataku mają 0,58, 0,2 i 0,85, a żaden inny piksel się nie zmienił. Ile wynosi odległość L∞ między tymi dwoma obrazami?

- [ ] 0,13
- [x] 0,08
- [ ] 0,05
- [ ] 0,03

Odległość L∞ to największa zmiana któregokolwiek piksela. Trzy zmiany to 0,08, 0 i 0,05, więc wynosi 0,08, a zaatakowany obraz jest w kuli ε dla każdego ε równego co najmniej 0,08. 0,13 to suma zmian, czyli inny sposób mierzenia.

## FGSM z ε = 0,1 obniża dokładność sieci z 94% do 56%. Zmiana każdego piksela o 0,1 w górę albo w dół losowo zostawia ją na 92%. Skąd ta różnica?

- [ ] FGSM zmienia więcej pikseli niż losowe zmiany
- [ ] FGSM zmienia każdy piksel bardziej niż losowe zmiany
- [x] FGSM przesuwa każdy piksel w kierunku, w którym rośnie strata, a losowe kierunki w większości się znoszą
- [ ] Losowe zmiany cofa `clamp(0, 1)`

Jedne i drugie przesuwają każdy piksel o te same 0,1. Przy losowych znakach mniej więcej połowa pikseli pcha stratę w górę, a połowa w dół. FGSM bierze każdy znak z nachylenia, więc wszystkie piksele pchają w tę samą stronę.

## `fgsm` dostaje porcję 297 obrazów i bierze nachylenia średniej straty porcji. Co dostaje każdy obraz?

- [ ] Ten sam krok co każdy inny obraz, ze średniej z 297 nachyleń
- [ ] Krok 297 razy mniejszy niż ten, który dostałby sam
- [x] Krok zgodny z jego własnymi nachyleniami, taki sam, jaki dostałby sam
- [ ] Nic, bo nachylenia można brać tylko dla jednego obrazu naraz

Piksele obrazu zmieniają tylko jego część straty, więc jego nachylenia są jego własne. Średnia dzieli je przez 297, a `sign()` daje te same znaki dla nachylenia i dla jego 297. części.

## Atak zostawia sieci, która rozróżnia dziesięć cyfr, dokładność 4%. Co to mówi?

- [ ] Sieć zgaduje
- [x] Atak prowadzi sieć do złych odpowiedzi: zgadywanie byłoby trafne mniej więcej w 10% przypadków
- [ ] Atak zmienił etykiety
- [ ] Sieć była za krótko trenowana

Sieć, która zgadywałaby spośród dziesięciu cyfr, trafiałaby mniej więcej co dziesiąty obraz. Mniej niż tyle znaczy, że sieć jest za każdym razem spychana od właściwej odpowiedzi, przez atak, który wie, w którą stronę pchać.

## Dlaczego atak wywołuje `requires_grad_()` na kopii obrazów?

- [ ] Żeby optymalizator mógł zmieniać obrazy
- [ ] Żeby wagi modelu zostały zamrożone
- [x] Żeby autograd policzył nachylenie straty względem każdego piksela
- [ ] Żeby piksele dało się przyciąć

Autograd zapisuje tylko to, co robi się z oznaczonymi tensorami. Obrazy to dane i przychodzą nieoznaczone, więc atak je oznacza, na kopii, a potem prosi o nachylenie przez `torch.autograd.grad(loss, X)`. Nie ma tu żadnego optymalizatora: atak robi swój krok ręcznie.
