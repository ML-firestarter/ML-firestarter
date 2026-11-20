---
description: Napisz mały program uruchamiający testy, który wywołuje funkcję dla wielu przypadków i mówi, które wypadły źle.
---

# Uruchom testy

*Korzysta z lekcji [Testowanie kodu](../../../../../notes/02-python/03-errors-and-testing/02-testing-your-code.pl.md), z której przydadzą się przypadki testowe i to, co zgłaszają, oraz z lekcji [Wyjątki](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md), z której przydadzą się `try` i `except`.*

Program uruchamiający testy wywołuje funkcję dla listy przypadków i mówi, w których się pomyliła. W małej skali robi to samo co przycisk **Sprawdź** w ćwiczeniach. Dokończ funkcję `run_tests(function, cases)`:

- `cases` to lista par `(arguments, expected)`. `arguments` to krotka argumentów, z którymi trzeba wywołać funkcję, na przykład `([3, 1, 2],)`, a `expected` to wynik, który funkcja powinna dać.
- Gdy `expected` jest klasą wyjątku, na przykład `ValueError`, przypadek oczekuje, że funkcja **zgłosi** taki błąd albo błąd rodzaju, który od niego pochodzi. W kodzie jest już `is_exception(expected)`, które mówi, czy `expected` jest klasą wyjątku.
- Funkcja zwraca listę tekstów, po jednym dla każdego przypadku, który wypadł źle, w kolejności przypadków, albo `[]`, gdy takich nie ma. Przypadek, który wypadł dobrze, niczego nie dodaje.

Teksty dla każdego rodzaju pomyłki, z wywołaniem zapisanym jako `name(arguments)` i argumentami pokazanymi przez `repr()`:

| Co się stało                              | Tekst                                          |
| ----------------------------------------- | ---------------------------------------------- |
| funkcja dała inną wartość                 | `abs(-3) gave 3, expected 4`                   |
| zgłosiła błąd, którego nie oczekiwano     | `len('abc', 'd') raised TypeError`             |
| zgłosiła inny rodzaj błędu niż oczekiwany | `len(5) raised TypeError, expected ValueError` |
| dała wartość, gdy oczekiwano błędu        | `len('abc') gave 3, expected ValueError`       |

W kodzie są też `median`, poprawna funkcja, i `broken_median`, która sortuje listę, ale zapomina, że lista o parzystej długości ma dwa środkowe elementy, oraz `MEDIAN_CASES`, na których można je wypróbować. Program pod funkcjami uruchamia testy obu.

> [!TIP]
> `function.__name__` to nazwa funkcji. `", ".join(repr(a) for a in arguments)` zapisuje argumenty jako tekst, a `function(*arguments)` wywołuje z nimi funkcję. `try` z `except Exception as error` złapie wszystko, co funkcja zgłosi.
