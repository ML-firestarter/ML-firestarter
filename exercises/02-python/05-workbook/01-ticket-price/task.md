---
description: Work out the price of a cinema ticket from the buyer's age and whether they're a student.
input: "15\nyes"
---

# Ticket price

*Draws on [Conditions and functions](../../../../notes/02-python/01-basics/01-conditions-and-functions.md) and, for the list of ages, [Loops and dictionaries](../../../../notes/02-python/01-basics/02-loops-and-dictionaries.md).*

A cinema has three prices. Children under 12 pay 20, and people of 65 and over pay 25. Everyone in between pays 35, or 30 when they're students. For children and seniors, being a student makes no difference.

Write two functions:

- `ticket_price(age, student)` returns the price of one ticket. `student` is `True` or `False`.
- `group_price(ages, student)` returns the price of tickets for a whole list of ages, when all of them are students, or none of them is.

| Call                              | Returns |
| --------------------------------- | ------- |
| `ticket_price(8, False)`          | `20`    |
| `ticket_price(30, False)`         | `35`    |
| `ticket_price(30, True)`          | `30`    |
| `ticket_price(70, True)`          | `25`    |
| `group_price([8, 30, 70], False)` | `80`    |

Then write the program under the functions. It reads an age, and a second line that says `yes` when the buyer is a student, and anything else when they're not, and prints the price. A comparison gives `True` or `False`, which is just what `ticket_price` wants for `student`. With `15` and `yes` in the **Input** box, the program prints:

```text
15
yes
Price: 30
```

The first two lines are the lines that `input()` read: the page shows each of them, as a terminal would.
