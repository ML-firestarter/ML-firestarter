---
description: Wczytaj oceny uczniów z pliku i zapisz raport z ich średnimi.
---

# Raport z ocen

*Korzysta z lekcji [Odczyt i zapis plików](../../../../../notes/02-python/01-basics/04-files.pl.md), [Pętle i słowniki](../../../../../notes/02-python/01-basics/02-loops-and-dictionaries.pl.md) i [Zakresy i listy](../../../../../notes/02-python/01-basics/03-ranges-and-lists.pl.md).*

W każdym wierszu pliku `grades.txt` jest imię ucznia i jedna z jego ocen, rozdzielone spacją. Oto trzy pierwsze wiersze:

```text
Max 5
Eva 3
Ada 5
```

Napisz trzy funkcje:

- `read_grades(path)` wczytuje plik spod ścieżki `path` i zwraca słownik z imieniem każdego ucznia i listą jego ocen, jako liczb, w kolejności z pliku: `{'Max': [5, 4], 'Eva': [3, 4, 5], ...}`.
- `average_grades(grades)` dostaje taki słownik i zwraca słownik ze średnią oceną każdego ucznia: sumą jego ocen podzieloną przez ich liczbę. `average_grades({'Ada': [5, 4]})` zwraca `{'Ada': 4.5}`.
- `write_report(averages, path)` zapisuje średnie w pliku pod ścieżką `path`, po wierszu dla każdego ucznia, na przykład `Ada: 4.5`, w kolejności alfabetycznej imion.

Program pod funkcjami wczytuje `grades.txt`, zapisuje raport w `report.txt` i go wypisuje. Gdy twoje funkcje zadziałają, program wypisze:

```text
Ada: 4.5
Eva: 4.0
Max: 4.5
Zoe: 2.5
```
