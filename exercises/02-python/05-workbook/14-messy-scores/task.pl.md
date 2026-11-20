---
description: Przeczytaj przez csv arkusz z wynikami uczniów, zachowaj poprawne wiersze, zgłoś błędne z numerem linijki, a potem policz średnie.
---

# Bałagan w wynikach

*Korzysta z lekcji [Moduły i biblioteka standardowa](../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.pl.md), z której przyda się `csv`, z lekcji [Wyjątki](../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md), z której przyda się łapanie błędów, oraz z lekcji [Odczyt i zapis plików](../../../../notes/02-python/01-basics/04-files.pl.md), z której przyda się czytanie pliku.*

Plik `students.csv` ma pod wierszem nagłówka po jednym wierszu na ucznia: imię i wyniki od 0 do 100 z trzech przedmiotów. Plik był wypełniany ręcznie i niektóre wiersze są błędne. Dokończ trzy funkcje.

`read_scores(path)` czyta plik przez `csv.reader` i zwraca parę: słownik poprawnych wierszy, w którym imieniu ucznia odpowiada lista jego wyników jako liczb całkowitych, i listę problemów z jedną parą `[line_number, message]` dla każdego błędnego wiersza, w kolejności z pliku. Numery linijek to numery w pliku, w którym nagłówek jest linijką 1: `line_num` czytnika csv to numer linijki, którą właśnie przeczytał. Po błędnym wierszu program działa dalej. Każdy wiersz sprawdza się w tej kolejności i zgłasza się pierwszy znaleziony problem:

| Co jest nie tak                                               | Komunikat                         |
| ------------------------------------------------------------- | --------------------------------- |
| wiersz ma inną liczbę komórek niż nagłówek                    | `wrong number of columns`         |
| imię jest puste albo składa się z samych spacji               | `missing name`                    |
| wynik nie jest liczbą całkowitą, także gdy komórka jest pusta | `bad score: x`, z tekstem komórki |
| wynik jest mniejszy od 0 albo większy od 100                  | `score out of range: 120`         |

Puste linijki w pliku są po cichu pomijane, a spacje wokół wyniku nie mają znaczenia: `" 70 "` to 70. Imię jest zapisywane bez otaczających je spacji.

`averages(scores)` dostaje taki słownik i zwraca słownik, w którym każdemu imieniu odpowiada średnia wyników ucznia, zaokrąglona do jednego miejsca po przecinku. `best_student(scores)` zwraca imię ucznia z najwyższą średnią, a przy remisie to imię, które jest pierwsze w kolejności alfabetycznej.

| Wywołanie                           | Zwraca               |
| ----------------------------------- | -------------------- |
| `read_scores("students.csv")[1][0]` | `[3, "bad score: "]` |
| `averages({"cy": [100, 95, 98]})`   | `{"cy": 97.7}`       |

Program pod funkcjami wypisuje średnie, problemy i najlepszego ucznia z `students.csv`.

> [!TIP]
> Funkcja, która sprawdza jeden wiersz i zgłasza `ValueError` z komunikatem, upraszcza pętlę: pętla łapie błąd, dodaje `[reader.line_num, str(error)]` do problemów i idzie dalej. `int(" 70 ")` to 70, a `int("")` i `int("x")` zgłaszają `ValueError`.
