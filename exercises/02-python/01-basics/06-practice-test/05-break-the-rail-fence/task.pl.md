---
description: Odwróć szyfr płotkowy i odzyskaj ukrytą wiadomość.
---

# Złam szyfr płotkowy

*Korzysta ze wszystkich lekcji z podstaw, a najbardziej z lekcji [Listy list](../../../../../notes/02-python/01-basics/05-lists-of-lists.pl.md).*

W edytorze jest działająca funkcja `rail_fence` z lekcji [Listy list](../../../../../notes/02-python/01-basics/05-lists-of-lists.pl.md). Napisz funkcję `rail_fence_decrypt(secret, rails)`, która działa odwrotnie: dostaje litery zwrócone przez `rail_fence` i liczbę szyn, a zwraca litery w ich pierwotnej kolejności. Spacje przepadły przy szyfrowaniu, więc nie wracają. Gdy szyn jest mniej niż 1, funkcja zgłasza `ValueError`, tak jak `rail_fence`.

| Wywołanie                                  | Zwraca               |
| ------------------------------------------ | -------------------- |
| `rail_fence_decrypt("Ptpoosayyhndwta", 3)` | `'Podstawypythona'`  |
| `rail_fence_decrypt("acebdf", 2)`          | `'abcdef'`           |
| `rail_fence_decrypt("abc", 1)`             | `'abc'`              |
| `rail_fence_decrypt("abc", 0)`             | zgłasza `ValueError` |

To najtrudniejsze zadanie z podstaw, więc oto jeden ze sposobów na jego rozwiązanie, na przykładzie `Ptpoosayyhndwta` na 3 szynach:

1. Zygzak zależy tylko od tego, ile jest liter, a nie od tego, jakie są. 15 liter na 3 szynach trafiło na szyny 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2. Utwórz taką listę, przesuwając wiersz w górę i w dół tak, jak robi to `rail_fence`.
2. Policz, ile razy każda szyna jest na liście: szyny 0 i 2 dostały po 4 litery, a szyna 1 dostała 7.
3. Szyfrogram to kolejne szyny zapisane jedna po drugiej, więc potnij go na kawałki o tych długościach: `Ptpo`, `osayyhn` i `dwta`.
4. Przejdź jeszcze raz przez listę szyn i za każdym razem weź pierwszą literę, która została w kawałku tej szyny: `P` z szyny 0, `o` z szyny 1, `d` z szyny 2, `s` z szyny 1 i tak dalej.

Program pod funkcjami szyfruje wiadomość i z powrotem ją odszyfrowuje, więc **Uruchom** pokazuje jedno i drugie.
