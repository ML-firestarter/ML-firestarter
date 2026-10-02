---
description: Przeczytaj log czatu przez re, datetime i Counter i ustal, kto pisze najwięcej, który dzień był najbardziej ruchliwy, kto jest wspominany i jakie są częste słowa.
---

# Statystyki czatu

*Korzysta z lekcji [Moduły i biblioteka standardowa](../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.pl.md) dla `re`, `datetime` i `Counter` oraz [Odczyt i zapis plików](../../../../notes/02-python/01-basics/04-files.pl.md) dla pliku.*

Plik `chat.log` ma linię dla każdej wiadomości z czatu grupy do nauki, taką:

```text
[2024-03-04 09:12] ann: Good morning @bob, did you read the python lesson? #python
```

Niektóre linie są uszkodzone: jedna w ogóle nie jest wiadomością, a jedna ma czas, który nie może istnieć. `read_messages(path)` jest już napisane. Czyta plik i zachowuje wiadomości, które udało się zrobić `parse_message`, po kolei, a `ranked(counter, limit=None)` zamienia `Counter` na pary `[name, count]`, największa liczba pierwsza, a przy równych liczbach alfabetycznie. Dokończ pięć funkcji:

- `parse_message(line)` zwraca słownik z `"day"` (jak `"2024-03-04"`), `"hour"` (liczba całkowita, 0 do 23), `"author"` i `"text"`, albo `None` dla linii, która nie jest wiadomością: musi mieć postać `[data czas] autor: tekst`, z nazwą autora z liter, cyfr i podkreślników oraz czasem, który istnieje. Znak nowej linii na końcu jest w porządku, a tekst może mieć w sobie dwukropki.
- `messages_per_author(path)` zwraca pary `[author, count]`, uszeregowane.
- `busiest_day(path)` zwraca dzień z największą liczbą wiadomości, a przy remisie dwóch dni wcześniejszy.
- `mentions(path)` zwraca pary `[name, count]`, uszeregowane, dla imion po `@` w tekstach wiadomości.
- `top_words(path, n)` zwraca `n` najczęstszych słów, uszeregowanych, jako pary `[word, count]`. Słowa to ciągi liter, małymi literami, i liczą się tylko słowa z 4 liter lub więcej. `@wzmianki` i `#tagi` są pomijane, zanim znajdzie się słowa.

| Wywołanie                           | Zwraca                                                          |
| ----------------------------------- | --------------------------------------------------------------- |
| `busiest_day("chat.log")`           | `"2024-03-04"`, który remisuje z następnym dniem i jest pierwszy |
| `mentions("chat.log")[0]`           | `["bob", 3]`                                                    |
| `top_words("chat.log", 2)`          | `[["great", 6], ["lesson", 4]]`                                 |

Program pod funkcjami wypisuje wszystkie cztery wyniki dla `chat.log`.

> [!TIP]
> `re.sub(r"[@#]\w+", " ", text)` usuwa z tekstu wzmianki i tagi, a `re.findall(r"[a-z]+", text.lower())` daje jego słowa. `Counter.update()` dodaje elementy listy do liczb licznika, więc jeden licznik może przejść przez każdą wiadomość.
