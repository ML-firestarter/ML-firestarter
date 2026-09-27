# Propagacja wsteczna

## Zamówienie odrzucono, a sieć daje mu $p = 0{,}2$, przy $h_1 = 0{,}5$. Ile wynosi nachylenie jego kary względem $v_1$?

- [x] −0,4
- [ ] 0,4
- [ ] −0,8
- [ ] −0,1

Błąd neuronu wyjściowego to $\delta = p - y = 0{,}2 - 1 = -0{,}8$, a $v_1$ mnoży $h_1$, więc nachylenie względem $v_1$ to $\delta h_1 = -0{,}8 \times 0{,}5 = -0{,}4$. 0,4 liczy błąd odwrotnie, jako $y - p$, a −0,8 pomija $h_1$: to nachylenie względem $c$. −0,1 mnoży jeszcze przez nachylenie sigmoidy, $h_1(1 - h_1) = 0{,}25$, które należy do błędów neuronów ukrytych, a nie do nachyleń neuronu wyjściowego.

## Dla pewnego zamówienia $p - y = -0{,}5$, $h_1 = 0{,}9$, a $v_1 = 2$. Ile wynosi błąd pierwszego neuronu ukrytego, $\delta_1$?

- [x] −0,09
- [ ] −1
- [ ] −0,9
- [ ] −0,1

$\delta_1 = \delta\,v_1\,h_1(1 - h_1) = -0{,}5 \times 2 \times 0{,}9 \times 0{,}1 = -0{,}09$. −1 pomija nachylenie sigmoidy, $h_1(1 - h_1)$, −0,9 mnoży przez $h_1$ zamiast przez $h_1(1 - h_1)$, a −0,1 mnoży przez samo $1 - h_1$.

## Dla pewnego zamówienia pierwszy neuron ukryty daje $h_1 = 0{,}9999$. Co to oznacza dla nachyleń tego zamówienia względem $w_1$ i $b_1$?

- [x] Są bliskie 0, bo S tego neuronu jest tam prawie płaskie
- [ ] Są duże, bo neuron jest prawie pewny
- [ ] Są takie same jak dla zamówienia z $h_1 = 0{,}5$
- [ ] Zależą tylko od etykiety, a nie od $h_1$

W obu nachyleniach jest $\delta_1$, a w $\delta_1$ jest nachylenie sigmoidy, $h_1(1 - h_1)$, które wynosi 0,9999 × 0,0001, czyli około 0,0001. Daleko na płaskim szczycie S mała zmiana $w_1$ albo $b_1$ prawie nie zmienia $h_1$, więc prawie nie zmienia też kary. Przy $h_1 = 0{,}5$ S jest najbardziej strome, a nachylenie sigmoidy wynosi 0,25.

## Dla jednego parametru propagacja wsteczna daje nachylenie 0,52, a przesunięcie w obie strony −0,52. Co to oznacza?

- [x] Gdzieś jest pomyłka, w propagacji wstecznej albo w przesunięciu
- [ ] Oba wyniki są poprawne, bo przesunięcie daje tylko wielkość nachylenia, a nie jego znak
- [ ] Przesunięcie było za duże
- [ ] Parametr ma już najlepszą wartość

Przesunięcie w obie strony i propagacja wsteczna powinny dawać prawie to samo nachylenie, jak −2,19317 i −2,19318 dla $w_1$ w lekcji. Przesunięcie daje też znak: jeśli kara rośnie, gdy parametr rośnie, nachylenie jest dodatnie. Za duże przesunięcie sprawiłoby, że wyniki trochę by się różniły, ale nie odwróciłoby znaku, a przy najlepszej wartości oba dawałyby około 0. W jednym z obliczeń jest więc pomyłka, na przykład błąd policzony jako $y - p$ zamiast $p - y$, co odwraca każdy znak.

## Sieć ma 1000 parametrów. Ile przejść w przód trzeba, żeby przesunięciem w obie strony policzyć nachylenia względem nich wszystkich dla jednego przykładu?

- [x] 2000
- [ ] 1000
- [ ] 2
- [ ] 1 000 000

Przesunięcie w obie strony wymaga dwóch przejść w przód dla każdego parametru: jednego z parametrem trochę większym i jednego z trochę mniejszym. Propagacja wsteczna liczy wszystkie 1000 nachyleń w jednym przejściu w przód i jednym wstecz, dlatego trening używa właśnie jej, a przesunięcia służą tylko do jej sprawdzania.

## Dlaczego warstwy ukryte głębokich sieci zwykle używają ReLU, a nie sigmoidy?

- [x] Jego nachylenie wynosi 1 dla każdego dodatniego $z$, więc błędy przechodzą przez nie wstecz, nie malejąc
- [ ] Daje liczbę między 0 a 1, jak prawdopodobieństwo
- [ ] Jego nachylenie wynosi najwyżej 0,25, dzięki czemu kroki są małe
- [ ] Sprawia, że przejście wstecz nie jest potrzebne

W głębokiej sieci błąd w drodze od wyjścia wraca przez wiele warstw, a każda funkcja aktywacji po drodze mnoży go przez swoje nachylenie. Nachylenie sigmoidy wynosi najwyżej 0,25, więc przy wielu warstwach z sigmoidą błędy pierwszych warstw maleją prawie do zera: to problem zanikającego gradientu. Nachylenie ReLU wynosi 1 wszędzie tam, gdzie $z$ jest dodatnie. To sigmoida daje liczbę między 0 a 1, dlatego zostaje przy niej neuron wyjściowy, a przejście wstecz jest potrzebne niezależnie od funkcji aktywacji.
