# Zapis, wczytywanie i strojenie

## Dlaczego punkt kontrolny zawiera oprócz słownika stanu także hiperparametry?

- [x] Wagi nie mówią, jak warstwy są ze sobą połączone, a żeby je wczytać, trzeba zbudować model o tej samej strukturze
- [ ] Słownik stanu nie zawiera wag
- [ ] `torch.save` nie potrafi zapisać samych tensorów
- [ ] Dzięki hiperparametrom plik wczytuje się szybciej

Słownik stanu to tylko słownik tensorów pod nazwami warstw. Żeby go wczytać, `load_state_dict` potrzebuje modelu z tymi samymi warstwami i kształtami, a model buduje się właśnie z hiperparametrów, takich jak rozmiary warstw.

## `make_model(64, 40, 10).load_state_dict(saved)`, gdzie `saved` pochodzi z `make_model(64, 50, 10)`. Co się stanie?

- [x] Błąd z listą wag, których kształty się nie zgadzają
- [ ] 40 liczb warstwy ukrytej dostanie pierwsze 40 z 50
- [ ] Zadziała, a model zacznie od losowych wag
- [ ] Zapisane wagi zostaną przycięte do nowego rozmiaru

`load_state_dict` pilnuje nazw i kształtów: waga `[10, 50]` nie może trafić tam, gdzie oczekiwane jest `[10, 40]`. Zatrzymuje się z komunikatem o każdej niezgodności i niczego nie zmienia.

## Co robi `weights_only=True` w `torch.load`?

- [x] Przyjmuje tylko tensory i zwykłe dane Pythona, więc plik nie może uruchomić kodu
- [ ] Wczytuje wagi, ale pomija wyrazy wolne
- [ ] Wczytuje plik szybciej
- [ ] Przełącza model w tryb oceny

Plik punktu kontrolnego może zawierać obiekty, których wczytanie uruchamia kod, więc wczytanie cudzego pliku mogłoby uruchomić cudzy kod. `weights_only=True` odrzuca wszystko poza tensorami i prostymi danymi, a punktowi kontrolnemu z wagami nic więcej nie jest potrzebne.

## Dlaczego współczynnik uczenia losuje się jako `10 ** (u * 1.5 - 2)`, gdzie `u` jest między 0 a 1?

- [x] Żeby wykładnik był losowany równomiernie, a każdy rząd wielkości współczynnika dostał mniej więcej tyle samo prób
- [ ] Żeby zawsze był liczbą całkowitą
- [ ] Żeby zawsze był większy od 1
- [ ] Bo PyTorch nie potrafi wylosować liczby mniejszej od 1

Przy współczynnikach uczenia liczą się krotności: 0,01 i 0,03 różnią się tak samo jak 0,1 i 0,3. Równomierne losowanie wykładnika daje każdemu takiemu krokowi mniej więcej tyle samo prób, a równomierne losowanie między 0,01 a 0,3 dałoby większość prób powyżej 0,03.

## Dlaczego najlepszą próbę wybiera się na zbiorze walidacyjnym, a zbiór testowy zostawia się na koniec?

- [x] Zbiór testowy mierzy wybrany model raz i nie brał udziału w wyborze
- [ ] Zbiór testowy jest za mały, żeby na nim wybierać
- [ ] To zbiór walidacyjny trenuje model
- [ ] Zbiór testowy można wykorzystać tylko przed treningiem

Gdyby to wynik na zbiorze testowym wyłaniał zwycięzcę, ten wynik byłby po części kwestią szczęścia: najlepsza z wielu prób wygląda dobrze na każdym zbiorze, który posłużył do jej wyboru. Zbiór, który nie brał udziału w wyborze, daje uczciwe oszacowanie dla nowych danych.
