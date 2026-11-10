# Regularyzacja i optymalizatory

## SGD z `momentum=0.9` trafia w każdym kroku na to samo nachylenie. Jak duże robią się jego kroki w porównaniu ze zwykłym SGD z tym samym współczynnikiem uczenia?

- [x] Mniej więcej dziesięć razy większe
- [ ] Takie same
- [ ] 0,9 razy tak duże
- [ ] Dwa razy większe

Prędkość to 0,9 tego, czym była, plus nowe nachylenie, więc rośnie w stronę nachylenia podzielonego przez $1 - 0{,}9$: dziesięciu nachyleń. Kroki w tym samym kierunku się sumują. Gdy nachylenia zmieniają znak z kroku na krok, znoszą się za to w prędkości.

## Dwa parametry mają w każdym kroku nachylenia 100 i 0,01. Po kilku krokach Adama, z jednym współczynnikiem uczenia dla obu:

- [x] Oba przesunęły się mniej więcej o tyle samo
- [ ] Pierwszy przesunął się dziesięć tysięcy razy dalej niż drugi
- [ ] Drugi przesunął się dalej, bo małe nachylenia są powiększane
- [ ] Żaden się nie przesunął, bo nachylenia się znoszą

Adam dzieli średnie nachylenie każdego parametru przez zwykłą wielkość nachyleń tego parametru, co dla każdego stałego nachylenia daje mniej więcej 1. Każdy krok przesuwa więc każdy parametr o mniej więcej współczynnik uczenia. To zwykłe SGD przesuwa pierwszy dziesięć tysięcy razy dalej.

## Pętla treningowa obniża współczynnik uczenia raz na epokę za pomocą harmonogramu. Gdzie trafia `scheduler.step()`?

- [x] Po pętli po porcjach danych, raz w każdej epoce
- [ ] Przed `loss.backward()`, dla każdej porcji
- [ ] Zamiast `optimizer.step()`
- [ ] Przed pierwszą epoką i nigdzie więcej

Optymalizator robi krok dla każdej porcji, a harmonogram ustawia potem współczynnik uczenia na następną epokę. Harmonogram zmienia współczynnik uczenia optymalizatora i sam nie robi żadnych kroków, więc nie zastąpi `optimizer.step()`.

## Co `weight_decay=0.1` robi w każdym kroku optymalizatora?

- [x] Ciągnie też każdą wagę w stronę 0, tym mocniej, im większa jest waga
- [ ] Obniża współczynnik uczenia o 10%
- [ ] Ustawia jedną dziesiątą wag na 0
- [ ] Przerywa trening, gdy strata przestaje spadać

Zanik wag w każdym kroku zabiera małą część każdej wagi, oprócz kroku przeciwnego do nachylenia. Wagi, których dane potrzebują, podtrzymują nachylenia straty, a pozostałe zanikają, więc wagi zostają małe. Losowe ustawianie liczb na 0 to dropout, a współczynnik uczenia obniża harmonogram.

## W trybie treningu warstwa `nn.Dropout(0.5)` dostaje tensor jedynek. Co z niej wychodzi?

- [x] Zera i dwójki: każda liczba jest ustawiana na 0 z prawdopodobieństwem jednej drugiej, a reszta jest podwajana
- [ ] Zera i jedynki: każda liczba jest ustawiana na 0 z prawdopodobieństwem jednej drugiej
- [ ] Każda liczba to 0,5
- [ ] Jedynki, bez zmian

Liczby, które zostają, są mnożone przez $1 / (1 - p)$, czyli przez 2 dla $p = 0{,}5$, żeby to, co idzie do następnej warstwy, sumowało się mniej więcej do tego samego co bez dropoutu. Jedynki wychodzą bez zmian tylko w trybie oceny.

## Model ma warstwę `nn.Dropout(0.5)`. Co ta warstwa robi po `model.eval()`?

- [x] Nic: przekazuje swoje wejście bez zmian
- [ ] Ustawia połowę liczb na 0, tak jak w treningu
- [ ] Mnoży każdą liczbę przez 0,5
- [ ] Przy każdym wywołaniu ustawia na 0 te same liczby

Dropout służy do treningu. W trybie oceny nic nie jest zerowane ani skalowane, więc sieć odpowiada wszystkimi swoimi liczbami ukrytymi i za każdym razem daje tę samą odpowiedź. Dlatego predykcje robi się po `model.eval()`.

## Podczas treningu strata na obrazach treningowych spada do 0,001, a strata na obrazach walidacyjnych rośnie z 0,39 do 0,55. Co się dzieje?

- [x] Sieć uczy się obrazów treningowych na pamięć i coraz gorzej radzi sobie z obrazami, których nie widziała
- [ ] Współczynnik uczenia jest za mały
- [ ] Sieć jest za mała, żeby nauczyć się obrazów
- [ ] Sieć jest trenowana na obrazach walidacyjnych

To nadmierne dopasowanie: strata treningowa bliska 0 mówi, że sieć ma miejsce na zapamiętywanie, a rosnąca strata walidacyjna, że to, co zapamiętuje, nie przenosi się na nowe obrazy. Za mały współczynnik uczenia albo za mała sieć zostawiłyby stratę treningową wysoko. Pomagają zanik wag, dropout, wcześniejsze zatrzymanie i więcej danych.
