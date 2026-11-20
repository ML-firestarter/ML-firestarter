---
description: Przeczytaj log czatu za pomocą re, datetime i Counter i ustal, kto pisze najwięcej, którego dnia było najwięcej wiadomości, kogo się wspomina i jakie słowa są najczęstsze.
---

# Statystyki czatu

*Korzysta z lekcji [Moduły i biblioteka standardowa](../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.pl.md), z której przydadzą się `re`, `datetime` i `Counter`, oraz z lekcji [Odczyt i zapis plików](../../../../notes/02-python/01-basics/04-files.pl.md), z której przyda się czytanie pliku.*

Plik `chat.log` ma po jednej linijce na każdą wiadomość z czatu grupy osób, które uczą się razem, na przykład taką:

```text
[2024-03-04 09:12] ann: Good morning @bob, did you read the python lesson? #python
```

Niektóre linijki są uszkodzone: jedna w ogóle nie jest wiadomością, a w jednej jest czas, który nie może istnieć. `read_messages(path)` jest już gotowe: czyta plik i zachowuje, po kolei, wiadomości, które udało się przetworzyć przez `parse_message`. Gotowe jest też `ranked(counter, limit=None)`, które zamienia `Counter` na pary `[name, count]`, od największej liczby, a przy równych liczbach alfabetycznie. Dokończ pięć funkcji:

- `parse_message(line)` zwraca słownik z `"day"` (na przykład `"2024-03-04"`), `"hour"` (liczba całkowita od 0 do 23), `"author"` i `"text"` albo `None` dla linijki, która nie jest wiadomością. Wiadomość musi mieć postać `[data czas] autor: tekst`, nazwa autora musi się składać z liter, cyfr i podkreślników, a czas musi istnieć. Znak nowej linii na końcu nie przeszkadza, a tekst może zawierać dwukropki.
- `messages_per_author(path)` zwraca uszeregowane pary `[author, count]`.
- `busiest_day(path)` zwraca dzień, w którym było najwięcej wiadomości, a przy remisie wcześniejszy z dni.
- `mentions(path)` zwraca uszeregowane pary `[name, count]` dla imion po `@` w tekstach wiadomości.
- `top_words(path, n)` zwraca `n` najczęstszych słów jako uszeregowane pary `[word, count]`. Słowa to ciągi liter zapisane małymi literami, a liczą się tylko te, które mają co najmniej 4 litery. `@wzmianki` i `#tagi` usuwa się, zanim zacznie się szukać słów.

| Wywołanie                  | Zwraca                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `busiest_day("chat.log")`  | `"2024-03-04"`, który ma tyle samo wiadomości co następny dzień, ale jest wcześniejszy |
| `mentions("chat.log")[0]`  | `["bob", 3]`                                                                           |
| `top_words("chat.log", 2)` | `[["great", 6], ["lesson", 4]]`                                                        |

Program pod funkcjami wypisuje wszystkie cztery wyniki dla `chat.log`.

> [!TIP]
> `re.sub(r"[@#]\w+", " ", text)` usuwa z tekstu wzmianki i tagi, a `re.findall(r"[a-z]+", text.lower())` daje jego słowa. `Counter.update()` dolicza elementy listy do liczników, więc jeden `Counter` może zebrać słowa ze wszystkich wiadomości.
