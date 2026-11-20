# Porcje danych i ocena

## 1000 kursów przechodzi przez `DataLoader` z `batch_size=32`. Ile porcji ma jedna epoka?

- [x] 32: trzydzieści jeden po 32 kursy i ostatnia z 8
- [ ] 31: ostatnia, mniejsza porcja jest odrzucana
- [ ] 1000: po jednej na każdy kurs
- [ ] 32 i wszystkie mają po 32 kursy

`DataLoader` nie odrzuca kursów, które zostały, tylko tworzy z nich mniejszą, ostatnią porcję: 31 × 32 = 992 i jeszcze 8. Odrzuciłby ją tylko z `drop_last=True`.

## Co robi `shuffle=True`?

- [x] Podaje kursy w nowej, losowej kolejności w każdej epoce
- [ ] Miesza cechy każdego kursu
- [ ] Tasuje zbiór danych raz, gdy powstaje `DataLoader`
- [ ] Sprawia, że w każdej porcji są kursy o różnej długości

Kolejność kursów zmienia się przy każdym przejściu przez `DataLoader`, więc w każdej epoce porcje są inne. Same kursy i ich cechy zostają nietknięte, a dzięki ziarnu kolejność da się powtórzyć.

## Dlaczego zbiór walidacyjny trzyma się osobno od treningowego?

- [x] Model mierzony na kursach, na których się uczył, wygląda lepiej, niż jest naprawdę
- [ ] Zbiór treningowy jest za mały, żeby na nim mierzyć
- [ ] Kursy walidacyjne służą do robienia kroków
- [ ] Dzięki temu trening jest szybszy

Model widział kursy treningowe, więc mógł się ich nauczyć na pamięć, a jego wynik na nich mówi niewiele o nowych kursach. Kursy walidacyjne służą do pomiaru i do wyboru między modelami.

## Ostatnia z 7 porcji walidacyjnych ma 8 kursów, a pozostałe po 32. Dlaczego średnia z RMSE porcji nie jest RMSE wszystkich kursów?

- [x] W średniej mała porcja liczy się tak samo jak pełna, choć ma mniej kursów
- [ ] RMSE nie da się policzyć dla porcji
- [ ] Średnia z pierwiastków jest zawsze większa
- [ ] Porcje się nakładają

W średniej ze średnich RMSE każdej porcji ma tę samą wagę, niezależnie od jej rozmiaru. Jeśli zsumujesz kwadraty błędów wszystkich kursów, podzielisz przez ich liczbę i wyciągniesz pierwiastek, każdy kurs policzysz dokładnie raz.

## Co w ocenie robi `model.eval()` razem z `torch.no_grad()`?

- [x] Model przechodzi w tryb oceny, a na potrzeby `backward()` nic nie jest zapisywane
- [ ] Model przestaje przewidywać i tylko mierzy
- [ ] Wagi są zapisywane, a potem przywracane
- [ ] Nachylenia są zerowane

`eval()` przełącza warstwy, które w użyciu zachowują się inaczej niż w treningu, a `no_grad()` pomija zapis potrzebny tylko `backward()`, co oszczędza czas i pamięć. Żadne z nich nie zmienia wag.
