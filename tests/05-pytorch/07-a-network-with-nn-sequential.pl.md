# Sieć z nn.Sequential

## Ile parametrów ma `nn.Sequential(nn.Linear(3, 4), nn.ReLU(), nn.Linear(4, 1))`?

- [x] 21
- [ ] 16
- [ ] 17
- [ ] 12

Pierwsza warstwa ma 3 × 4 = 12 wag i 4 wyrazy wolne, razem 16, a druga 4 × 1 = 4 wagi i 1 wyraz wolny, jeszcze 5. `ReLU` nie ma parametrów. 12 to same wagi pierwszej warstwy.

## Co jest nie tak z `nn.Sequential(nn.Linear(2, 50), nn.ReLU(), nn.Linear(40, 1))`?

- [x] Pierwsza warstwa daje 50 liczb, a druga bierze 40, więc kształty do siebie nie pasują
- [ ] Nic: Sequential dopasowuje rozmiary
- [ ] ReLU nie może stać po pierwszej warstwie
- [ ] Ostatnia warstwa musi mieć 2 wyjścia

`out_features` jednej warstwy musi być `in_features` następnej. Tutaj 50 liczb trafia do warstwy, która oczekuje 40, i iloczyn kończy się błędem o kształtach.

## W co składają się trzy warstwy `nn.Linear` bez ReLU między nimi?

- [x] W jedną warstwę liniową: prostą, ile by warstw nie było
- [ ] W sieć, która rysuje dowolny kształt
- [ ] W warstwę trzy razy dokładniejszą
- [ ] W błąd: warstwy potrzebują ReLU

Funkcja liniowa funkcji liniowej jest liniowa, więc warstwy zwijają się w jedną, a model nie potrafi narysować zakrętu. Dwie warstwy z niczym pomiędzy z lekcji nie były lepsze niż jedna.

## Dlaczego opłaty są standaryzowane przed treningiem sieci?

- [x] Są blisko 0, jak pierwsze predykcje sieci, więc pierwsze kroki są łagodne
- [ ] Sieć nie przyjmie liczb powyżej 1
- [ ] Dzięki temu sieć może pominąć standaryzację cech
- [ ] Dzięki temu opłaty są nieujemne

Sieć zaczyna od małych losowych wag, więc jej pierwsze predykcje są bliskie 0, a opłaty około 30 dają przy tym samym współczynniku uczenia ogromne straty i nachylenia. Predykcje zamienia się z powrotem na złote rozrzutem i średnią opłat.

## Jaki kształt ma waga środkowej warstwy `nn.Sequential(nn.Linear(2, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU(), nn.Linear(40, 1))`?

- [x] `[40, 50]`
- [ ] `[50, 40]`
- [ ] `[40, 1]`
- [ ] `[2, 50]`

Waga ma `[out_features, in_features]`, a środkowa warstwa bierze 50 liczb i daje 40.
