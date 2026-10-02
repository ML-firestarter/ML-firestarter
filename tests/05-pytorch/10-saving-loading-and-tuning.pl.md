# Zapis, wczytywanie i strojenie

## Dlaczego punkt kontrolny zawiera hiperparametry, a nie tylko słownik stanu?

- [x] Wagi nie mówią, jak warstwy do siebie pasują, a żeby je wczytać, trzeba zbudować model o tej samej strukturze
- [ ] Słownik stanu nie zawiera wag
- [ ] `torch.save` nie potrafi zapisać samych tensorów
- [ ] Dzięki hiperparametrom plik wczytuje się szybciej

Słownik stanu to tylko słownik tensorów według nazw warstw. Żeby go wczytać, `load_state_dict` potrzebuje modelu z tymi samymi warstwami i kształtami, a hiperparametry, jak rozmiary warstw, go budują.

## `make_model(64, 40, 10).load_state_dict(saved)`, gdzie `saved` pochodzi z `make_model(64, 50, 10)`. Co się dzieje?

- [x] Błąd, który wylicza wagi, których kształty się nie zgadzają
- [ ] 40 liczb ukrytych dostaje pierwsze 40 z 50
- [ ] Działa, a model zaczyna od losowych wag
- [ ] Zapisane wagi są zmieniane na inny rozmiar

`load_state_dict` jest ścisłe co do nazw i kształtów: waga `[10, 50]` nie może trafić tam, gdzie oczekiwane jest `[10, 40]`. Zatrzymuje się z komunikatem o każdej niezgodności i niczego nie zmienia.

## Co robi `weights_only=True` w `torch.load`?

- [x] Przyjmuje tylko tensory i zwykłe dane Pythona, więc plik nie może uruchomić kodu
- [ ] Wczytuje wagi i pomija wyrazy wolne
- [ ] Wczytuje plik szybciej
- [ ] Przełącza model w tryb oceny

Plik punktu kontrolnego może zawierać obiekty, których wczytanie uruchamia kod, a wczytanie cudzego pliku mogłoby wtedy uruchomić cudzy kod. `weights_only=True` odrzuca wszystko poza tensorami i prostymi danymi, a tyle wystarcza punktowi kontrolnemu z wagami.

## Dlaczego współczynnik uczenia losuje się jako `10 ** (u * 1.5 - 2)`, gdzie `u` jest między 0 a 1?

- [x] Żeby wykładnik był równomierny, a każdy rząd wielkości współczynnika dostał mniej więcej tyle samo prób
- [ ] Żeby zawsze był liczbą całkowitą
- [ ] Żeby zawsze był większy niż 1
- [ ] Bo PyTorch nie potrafi wylosować liczby poniżej 1

Współczynniki uczenia liczą się krotnościami: 0,01 i 0,03 różnią się tak samo jak 0,1 i 0,3. Równomierne losowanie wykładnika daje każdemu takiemu krokowi mniej więcej tyle samo prób, a równomierne losowanie między 0,01 a 0,3 umieściłoby większość powyżej 0,03.

## Dlaczego najlepszą próbę wybiera się na zbiorze walidacyjnym, a zbiór testowy zostaje na koniec?

- [x] Zbiór testowy mierzy wybrany model raz, bez udziału w wyborze
- [ ] Zbiór testowy jest za mały do wyboru
- [ ] Zbiór walidacyjny trenuje model
- [ ] Zbiór testowy można używać tylko przed treningiem

Gdyby wynik testowy wybierał zwycięzcę, jego wynik testowy byłby po części szczęściem: najlepszy z wielu prób wygląda dobrze na każdym zbiorze, który go wybrał. Zbiór, który nie brał udziału w wyborze, daje uczciwe oszacowanie dla nowych danych.
