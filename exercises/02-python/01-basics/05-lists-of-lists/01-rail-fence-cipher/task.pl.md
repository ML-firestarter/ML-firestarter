---
description: Ukryj wiadomość w zygzaku na kilku szynach, a potem odczytaj ją szyna po szynie.
---

# Szyfr płotkowy

Napisz `rail_fence(text, rails)`, która szyfruje `text` szyfrem płotkowym na `rails` szynach, tak jak w lekcji:

1. Gdy szyn jest mniej niż 1, nie ma na czym zapisać liter, więc funkcja zgłasza `ValueError`.
2. Pomija spacje.
3. Zapisuje litery zygzakiem. Pierwsza litera trafia na górną szynę, a każda następna na szynę niżej, aż do dolnej. Stamtąd litery wracają w górę, szyna po szynie, do górnej, a potem znów idą w dół.
4. Zwraca litery górnej szyny, po nich litery szyny pod nią i tak dalej, aż do dolnej szyny.

| Wywołanie                           | Zwraca               |
| ----------------------------------- | -------------------- |
| `rail_fence("Podstawy pythona", 3)` | `'Ptpoosayyhndwta'`  |
| `rail_fence("abcdef", 2)`           | `'acebdf'`           |
| `rail_fence("abc", 1)`              | `'abc'`              |
| `rail_fence("abc", 0)`              | zgłasza `ValueError` |

Na jednej szynie wszystkie litery zostają na górnej szynie, więc tekst wraca bez spacji. Uważaj, żeby zygzak nie zszedł wtedy z płotu.
