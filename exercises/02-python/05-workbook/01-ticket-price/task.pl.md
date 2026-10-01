---
description: Policz, ile kosztuje bilet do kina, z wieku kupującego i tego, czy jest uczniem lub studentem.
input: "15\nyes"
---

# Cena biletu

*Korzysta z lekcji [Warunki i funkcje](../../../../notes/02-python/01-basics/01-conditions-and-functions.pl.md) oraz, ze względu na listę wieków, [Pętle i słowniki](../../../../notes/02-python/01-basics/02-loops-and-dictionaries.pl.md).*

Kino ma trzy ceny. Dzieci poniżej 12 lat płacą 20, a osoby od 65 lat wzwyż płacą 25. Wszyscy pomiędzy płacą 35, a 30, gdy są uczniami lub studentami. Dla dzieci i seniorów to, czy ktoś się uczy, nie ma znaczenia.

Napisz dwie funkcje:

- `ticket_price(age, student)` zwraca cenę jednego biletu. `student` to `True` albo `False`.
- `group_price(ages, student)` zwraca cenę biletów dla całej listy wieków, gdy wszyscy są uczniami lub studentami albo nikt nie jest.

| Wywołanie                         | Zwraca |
| --------------------------------- | ------ |
| `ticket_price(8, False)`          | `20`   |
| `ticket_price(30, False)`         | `35`   |
| `ticket_price(30, True)`          | `30`   |
| `ticket_price(70, True)`          | `25`   |
| `group_price([8, 30, 70], False)` | `80`   |

Potem napisz program pod funkcjami. Wczytuje wiek i drugi wiersz, który mówi `yes`, gdy kupujący jest uczniem lub studentem, a cokolwiek innego, gdy nie jest, i wypisuje cenę. Porównanie daje `True` albo `False`, czyli dokładnie to, czego `ticket_price` chce jako `student`. Z `15` i `yes` w polu **Wejście** program wypisuje:

```text
15
yes
Price: 30
```

Pierwsze dwa wiersze to wiersze, które wczytało `input()`: strona pokazuje każdy z nich, tak jak zrobiłby to terminal.
