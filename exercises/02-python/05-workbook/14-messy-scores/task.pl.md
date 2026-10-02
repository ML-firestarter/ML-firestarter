---
description: Przeczytaj arkusz ocen szkoły przez csv, zachowaj dobre wiersze i zgłoś złe z numerem linii, a potem policz średnie.
---

# Bałagan w ocenach

*Korzysta z lekcji [Moduły i biblioteka standardowa](../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.pl.md) dla `csv`, [Wyjątki](../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md) dla łapania błędów oraz [Odczyt i zapis plików](../../../../notes/02-python/01-basics/04-files.pl.md) dla pliku.*

Plik `students.csv` ma wiersz dla każdego ucznia: imię i wynik od 0 do 100 z każdego z trzech przedmiotów, pod wierszem nagłówka. Wpisano go ręcznie i niektóre wiersze są błędne. Dokończ trzy funkcje.

`read_scores(path)` czyta plik przez `csv.reader` i zwraca parę: słownik dobrych wierszy, od imienia ucznia do listy jego wyników jako liczb całkowitych, i listę problemów, po jednym `[line_number, message]` dla każdego złego wiersza, w kolejności pliku. Numery linii to numery z pliku, z nagłówkiem jako linią 1: `line_num` czytnika csv ma numer linii, którą dopiero co przeczytał. Program idzie dalej po złym wierszu. Sprawdzenia dla każdego wiersza idą w tej kolejności i zgłaszane jest pierwsze, które zawiedzie:

| Co jest nie tak                                           | Komunikat                            |
| --------------------------------------------------------- | ------------------------------------ |
| wiersz nie ma tylu komórek co nagłówek                    | `wrong number of columns`            |
| imię jest puste albo same spacje                          | `missing name`                       |
| wynik nie jest liczbą całkowitą, z pustą komórką włącznie | `bad score: x`, z tekstem komórki    |
| wynik jest poniżej 0 albo powyżej 100                     | `score out of range: 120`            |

Puste linie w pliku są pomijane bez słowa, a spacje wokół wyniku nie mają znaczenia: `" 70 "` to 70. Imię jest zachowane bez spacji wokół niego.

`averages(scores)` bierze taki słownik i zwraca słownik od każdego imienia do średniej jego wyników, zaokrąglonej do jednego miejsca po przecinku. `best_student(scores)` zwraca imię z najwyższą średnią, a przy remisie pierwsze w kolejności alfabetycznej.

| Wywołanie                             | Zwraca                                              |
| ------------------------------------- | --------------------------------------------------- |
| `read_scores("students.csv")[1][0]`   | `[3, "bad score: "]`                                |
| `averages({"cy": [100, 95, 98]})`     | `{"cy": 97.7}`                                      |

Program pod funkcjami wypisuje średnie, problemy i najlepszego ucznia z `students.csv`.

> [!TIP]
> Funkcja, która sprawdza jeden wiersz i zgłasza `ValueError` z komunikatem, skraca pętlę: pętla łapie błąd, dodaje `[reader.line_num, str(error)]` do problemów i idzie dalej. `int(" 70 ")` to 70, a `int("")` i `int("x")` zgłaszają `ValueError`.
