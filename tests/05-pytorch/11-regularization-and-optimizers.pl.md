# Regularyzacja i optymalizatory

## SGD z `momentum=0.9` dostaje w każdym kroku to samo nachylenie. Jak długie robią się jego kroki w porównaniu ze zwykłym SGD z tym samym współczynnikiem uczenia?

- [x] Mniej więcej dziesięć razy dłuższe
- [ ] Takie same
- [ ] Równe 0,9 zwykłego kroku
- [ ] Dwa razy dłuższe

Prędkość to 0,9 jej poprzedniej wartości plus nowe nachylenie, więc zbliża się do nachylenia podzielonego przez $1 - 0{,}9$, czyli dziesięciu nachyleń. Kroki w tę samą stronę się sumują. Gdy nachylenia zmieniają znak z kroku na krok, ich wkłady w prędkość się znoszą.

## Pierwszy parametr ma w każdym kroku nachylenie 100, a drugi 0,01. Co się z nimi dzieje po kilku krokach Adama z jednym współczynnikiem uczenia dla obu?

- [x] Oba przesuwają się mniej więcej o tyle samo
- [ ] Pierwszy przesuwa się dziesięć tysięcy razy dalej niż drugi
- [ ] Drugi przesuwa się dalej, bo małe nachylenia są wzmacniane
- [ ] Żaden się nie przesuwa, bo nachylenia się znoszą

Adam dzieli średnie nachylenie każdego parametru przez typową wielkość nachyleń tego parametru, co dla każdego stałego nachylenia daje mniej więcej 1. Każdy krok przesuwa więc każdy parametr mniej więcej o współczynnik uczenia. To zwykłe SGD przesuwa pierwszy dziesięć tysięcy razy dalej.

## Pętla treningowa raz na epokę zmniejsza współczynnik uczenia za pomocą harmonogramu. Gdzie powinno się znaleźć `scheduler.step()`?

- [x] Po pętli po porcjach, raz w każdej epoce
- [ ] Przed `loss.backward()`, dla każdej porcji
- [ ] Zamiast `optimizer.step()`
- [ ] Przed pierwszą epoką i nigdzie więcej

Optymalizator robi krok dla każdej porcji, a harmonogram ustawia potem współczynnik uczenia na następną epokę. Harmonogram tylko zmienia współczynnik uczenia optymalizatora i sam nie robi żadnych kroków, więc nie zastąpi `optimizer.step()`.

## Co `weight_decay=0.1` robi w każdym kroku optymalizatora?

- [x] Dodatkowo ściąga każdą wagę w stronę 0, tym mocniej, im większa jest waga
- [ ] Zmniejsza współczynnik uczenia o 10%
- [ ] Zeruje jedną dziesiątą wag
- [ ] Zatrzymuje trening, gdy strata przestaje spadać

Zanik wag w każdym kroku, oprócz kroku przeciwnego do nachylenia, zabiera każdej wadze niewielką jej część. Wagi, których potrzebują dane, podtrzymują nachylenia straty, a pozostałe zanikają, więc wagi pozostają małe. Losowe zerowanie liczb to dropout, a współczynnik uczenia zmniejsza harmonogram.

## W trybie treningowym warstwa `nn.Dropout(0.5)` dostaje tensor jedynek. Co z niej wychodzi?

- [x] Zera i dwójki: każda liczba jest zerowana z prawdopodobieństwem 0,5, a pozostałe są podwajane
- [ ] Zera i jedynki: każda liczba jest zerowana z prawdopodobieństwem 0,5
- [ ] Same liczby 0,5
- [ ] Niezmienione jedynki

Liczby, które zostają, są mnożone przez $1 / (1 - p)$, czyli przez 2 dla $p = 0{,}5$, żeby to, co trafia do następnej warstwy, dawało w sumie mniej więcej tyle co bez dropoutu. Niezmienione jedynki wychodzą tylko w trybie oceny.

## Model ma warstwę `nn.Dropout(0.5)`. Co ta warstwa robi po `model.eval()`?

- [x] Nic: przepuszcza wejście bez zmian
- [ ] Zeruje połowę liczb, jak w treningu
- [ ] Mnoży każdą liczbę przez 0,5
- [ ] Przy każdym wywołaniu zeruje te same liczby

Dropout działa tylko w treningu. W trybie oceny nic nie jest zerowane ani skalowane, więc sieć odpowiada, korzystając ze wszystkich swoich liczb ukrytych, i za każdym razem daje tę samą odpowiedź. Dlatego predykcje liczy się po `model.eval()`.

## Podczas treningu strata na obrazach treningowych spada do 0,001, a strata na obrazach walidacyjnych rośnie z 0,39 do 0,55. Co się dzieje?

- [x] Sieć uczy się obrazów treningowych na pamięć i coraz gorzej radzi sobie z obrazami, których nie widziała
- [ ] Współczynnik uczenia jest za mały
- [ ] Sieć jest za mała, żeby nauczyć się obrazów
- [ ] Sieć jest trenowana na obrazach walidacyjnych

To nadmierne dopasowanie: strata treningowa bliska 0 mówi, że sieć ma dość parametrów, żeby uczyć się na pamięć, a rosnąca strata walidacyjna, że to, co sieć zapamiętuje, nie przenosi się na nowe obrazy. Za mały współczynnik uczenia albo za mała sieć zostawiłyby wysoką stratę treningową. Pomagają zanik wag, dropout, wcześniejsze zatrzymanie treningu i więcej danych.
