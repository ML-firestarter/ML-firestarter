# Regresja liniowa z nn.Linear

## Jaki kształt ma waga `nn.Linear(4, 2)` i ile ta warstwa ma parametrów?

- [x] `[2, 4]` i 10 parametrów
- [ ] `[4, 2]` i 8 parametrów
- [ ] `[2, 4]` i 8 parametrów
- [ ] `[4, 2]` i 10 parametrów

Waga ma kształt `[out_features, in_features]`, czyli `[2, 4]`, co daje 8 liczb, a każde z 2 wyjść ma jeszcze swój wyraz wolny, więc razem jest ich 10.

## Co się dzieje w pętli treningowej bez `optimizer.zero_grad()`?

- [x] Nachylenia z kolejnych epok się sumują i kroki są za duże
- [ ] Nic: `step()` zeruje nachylenia
- [ ] Optymalizator przestaje robić kroki
- [ ] Model zapomina swoje wagi

`backward()` dodaje do `.grad`, a optymalizator tylko je odczytuje: `step()` niczego nie zeruje. Krok w każdej epoce używa więc sumy wszystkich dotychczasowych nachyleń.

## Co daje `criterion(y_pred, y)` dla `criterion = nn.MSELoss()`?

- [x] Średnią kwadratów różnic, czyli pojedynczą liczbę
- [ ] Tensor z kwadratem różnicy dla każdego kursu
- [ ] Sumę wartości bezwzględnych różnic
- [ ] Nachylenie straty względem każdej wagi

`MSELoss` podnosi różnice do kwadratu i liczy ich średnią, a strata musi być jedną liczbą, żeby dało się na niej wywołać `backward()`. Nachylenia pojawiają się dopiero po `backward()`, w `.grad` parametrów.

## Po treningu model przewiduje opłaty za nowe kursy. Dlaczego predykcję liczy się wewnątrz `torch.no_grad()`?

- [x] Nic nie będzie przez nią przechodzić wstecz, więc nie trzeba jej zapisywać
- [ ] Bez tego zmieniłyby się wagi
- [ ] `no_grad` sprawia, że predykcje są dokładniejsze
- [ ] Poza `no_grad` model nie może przewidywać

Zapis jest potrzebny tylko `backward()`. Predykcja nie potrzebuje nachyleń, więc `no_grad` oszczędza czas i pamięć. Liczb to nie zmienia, a wagi bez kroku i tak się nie zmieniają.

## Jak wypada `nn.Linear` z `SGD` w porównaniu z treningiem ręcznym, przy tych samych danych, wagach startowych i współczynniku uczenia?

- [x] Straty i wagi wychodzą takie same
- [ ] Zbiega szybciej, bo optymalizator jest sprytniejszy
- [ ] Kończy z mniejszą stratą
- [ ] Nie da się ich porównać, bo to różne modele

To ten sam model i te same kroki spadku gradientu, tyle że zapisane z gotową warstwą, stratą i optymalizatorem, a nie ręcznie. Dlatego oba treningi z lekcji wypisują te same liczby.
