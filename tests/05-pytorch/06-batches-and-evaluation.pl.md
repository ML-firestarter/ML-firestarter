# Porcje danych i ocena

## 1000 kursów przechodzi przez `DataLoader` z `batch_size=32`. Ile porcji ma jedna epoka?

- [x] 32: trzydzieści jeden po 32 kursy i ostatnia z 8
- [ ] 31: ostatnia, mniejsza porcja jest odrzucana
- [ ] 1000: po jednej dla każdego kursu
- [ ] 32, wszystkie po 32 kursy

Loader zachowuje kursy, które zostały, jako mniejszą ostatnią porcję: 31 × 32 = 992 i jeszcze 8. Odrzuciłby ją tylko z `drop_last=True`.

## Co robi `shuffle=True`?

- [x] Oddaje kursy w nowej losowej kolejności w każdej epoce
- [ ] Miesza cechy każdego kursu
- [ ] Tasuje zbiór danych raz, gdy powstaje loader
- [ ] Sprawia, że w każdej porcji są kursy o różnej długości

Kolejność kursów zmienia się przy każdym przejściu przez loader, więc porcje różnią się między epokami. Same kursy i ich cechy zostają nietknięte, a ziarno sprawia, że kolejność da się powtórzyć.

## Dlaczego zbiór walidacyjny trzyma się osobno od treningowego?

- [x] Model mierzony na kursach, z których się uczył, wygląda lepiej, niż jest naprawdę
- [ ] Zbiór treningowy jest za mały do mierzenia
- [ ] Kursy walidacyjne służą do robienia kroków
- [ ] Dzięki temu trening jest szybszy

Model widział kursy treningowe, więc mógł nauczyć się ich na pamięć, a jego wynik na nich mówi niewiele o nowych kursach. Kursy walidacyjne służą do mierzenia i do wyboru między modelami.

## Ostatnia z 7 porcji walidacyjnych ma 8 kursów, a pozostałe 32. Dlaczego średnia z RMSE porcji nie jest RMSE wszystkich kursów?

- [x] Mała porcja liczy się w średniej tyle co pełna, a ma mniej kursów
- [ ] RMSE nie da się policzyć dla porcji
- [ ] Średnia z pierwiastków jest zawsze większa
- [ ] Porcje się nakładają

RMSE każdej porcji ma w średniej z średnich tę samą wagę, niezależnie od jej rozmiaru. Zsumowanie kwadratów błędów wszystkich kursów, podzielenie przez ich liczbę i wyciągnięcie pierwiastka liczy każdy kurs raz.

## Co robi `model.eval()` razem z `torch.no_grad()` w ocenie?

- [x] Model jest w trybie oceny i nic nie jest zapisywane na potrzeby `backward()`
- [ ] Model przestaje przewidywać i tylko mierzy
- [ ] Wagi są zapisywane, a potem przywracane
- [ ] Nachylenia są zerowane

`eval()` przełącza warstwy, które w użyciu zachowują się inaczej niż w treningu, a `no_grad()` pomija zapis, którego potrzebuje tylko `backward()`, co oszczędza czas i pamięć. Żadne z nich nie zmienia wag.
