---
description: Napisz mały program uruchamiający testy, który wywołuje funkcję na wielu przypadkach i mówi, które wyszły źle.
---

# Uruchom testy

*Korzysta z lekcji [Testowanie kodu](../../../../../notes/02-python/03-errors-and-testing/02-testing-your-code.pl.md) dla przypadków testowych i tego, co zgłaszają, oraz [Wyjątki](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md) dla `try` i `except`.*

Program uruchamiający testy wywołuje funkcję na liście przypadków i mówi, w których się pomyliła. To w małej skali robi przycisk **Sprawdź** w ćwiczeniu. Dokończ `run_tests(function, cases)`:

- `cases` to lista par, `(arguments, expected)`. `arguments` to krotka tego, z czym wywołać funkcję, jak `([3, 1, 2],)`, a `expected` to to, co ma dać.
- Gdy `expected` jest klasą wyjątku, jak `ValueError`, przypadek oczekuje, że funkcja **zgłosi** taki błąd albo błąd rodzaju od niego pochodzącego. Kod daje ci `is_exception(expected)`, które mówi, czy `expected` nią jest.
- Zwraca listę tekstów, po jednym dla każdego przypadku, który wyszedł źle, po kolei, i `[]`, gdy żaden. Dobry przypadek nic nie dodaje.

Co mówi błąd, z wywołaniem zapisanym jako `name(arguments)` i argumentami pokazanymi przez `repr()`:

| Co się stało                                           | Tekst                                                 |
| ------------------------------------------------------ | ----------------------------------------------------- |
| dała inną wartość                                      | `abs(-3) gave 3, expected 4`                          |
| zgłosiła błąd, którego nie oczekiwano                  | `len('abc', 'd') raised TypeError`                    |
| zgłosiła inny rodzaj błędu niż oczekiwany              | `len(5) raised TypeError, expected ValueError`        |
| dała wartość, gdy oczekiwano błędu                     | `len('abc') gave 3, expected ValueError`              |

Kod ma też `median`, poprawną funkcję, i `broken_median`, która sortuje, ale zapomina o środku listy o parzystej długości, oraz `MEDIAN_CASES` do wypróbowania ich. Program pod funkcjami uruchamia obie.

> [!TIP]
> `function.__name__` to nazwa funkcji. `", ".join(repr(a) for a in arguments)` zapisuje argumenty, a `function(*arguments)` wywołuje ją z nimi. `try` z `except Exception as error` łapie to, co zgłosi.
