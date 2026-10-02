# Regresja liniowa z nn.Linear

## Jaki kształt ma waga `nn.Linear(4, 2)` i ile ma parametrów?

- [x] `[2, 4]` i 10 parametrów
- [ ] `[4, 2]` i 8 parametrów
- [ ] `[2, 4]` i 8 parametrów
- [ ] `[4, 2]` i 10 parametrów

Waga ma `[out_features, in_features]`, czyli `[2, 4]`, z 8 liczbami, a 2 wyjścia mają po wyrazie wolnym, co daje 10.

## Co się dzieje w pętli treningu bez `optimizer.zero_grad()`?

- [x] Nachylenia z każdej epoki się sumują, a kroki są za duże
- [ ] Nic: `step()` zeruje nachylenia
- [ ] Optymalizator przestaje robić kroki
- [ ] Model zapomina swoje wagi

`backward()` dodaje do `.grad`, a optymalizator tylko je czyta: `step()` niczego nie zeruje. Krok każdej epoki używa wtedy sumy wszystkich dotychczasowych nachyleń.

## Co daje `criterion(y_pred, y)` dla `criterion = nn.MSELoss()`?

- [x] Średnią z kwadratów różnic, pojedynczą liczbę
- [ ] Tensor z kwadratem różnicy każdego kursu
- [ ] Sumę wartości bezwzględnych różnic
- [ ] Nachylenie straty względem każdej wagi

`MSELoss` podnosi różnice do kwadratu i liczy ich średnią, a strata musi być jedną liczbą, żeby można było wywołać na niej `backward()`. Nachylenia istnieją dopiero po `backward()`, w `.grad` parametrów.

## Model przewiduje nowe kursy po treningu. Dlaczego predykcja jest wewnątrz `torch.no_grad()`?

- [x] Nic nie będzie się przez nią cofać, więc nie trzeba jej zapisywać
- [ ] Bez tego wagi by się zmieniły
- [ ] `no_grad` sprawia, że predykcje są dokładniejsze
- [ ] Model nie może przewidywać poza nim

Zapis służy tylko `backward()`. Predykcja nie potrzebuje nachyleń, więc `no_grad` oszczędza czas i pamięć. Nie zmienia liczb, a wagi nie zmieniają się bez kroku.

## Jak ma się `nn.Linear` z `SGD` do treningu ręcznego, przy tych samych danych, tych samych wagach startowych i tym samym współczynniku uczenia?

- [x] Straty i wagi wychodzą takie same
- [ ] Zbiega szybciej, bo optymalizator jest sprytniejszy
- [ ] Kończy z mniejszą stratą
- [ ] Nie da się ich porównać: to różne modele

To ten sam model i te same kroki spadku gradientu, zapisane z gotową warstwą, stratą i optymalizatorem zamiast ręcznie. Dlatego dwa treningi z lekcji wypisują te same liczby.
