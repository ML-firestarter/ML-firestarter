---
description: Work out the price per km and the starting fee from two receipts.
---

# Work out the tariff

Receipts from rides without any waiting follow the taxi's prices exactly. Write `tariff(km1, fare1, km2, fare2)`: it takes the distance and the fare from each of two such receipts, works out the price per km and the starting fee the way [Making predictions](../../../../../notes/04-foundations/02-linear-regression/01-predictions.md#where-do-w-and-b-come-from) did, and returns them as the list `[w, b]`.

When both receipts are for the same distance, there's no way to work out the price per km, so `tariff` raises a `ValueError`.

| Call                   | Returns             |
| ---------------------- | ------------------- |
| `tariff(3, 17, 7, 29)` | `[3.0, 8.0]`        |
| `tariff(2, 10, 4, 13)` | `[1.5, 7.0]`        |
| `tariff(5, 30, 1, 10)` | `[5.0, 5.0]`        |
| `tariff(4, 10, 4, 12)` | raises `ValueError` |

The second receipt can be for a shorter ride than the first one, as in the third call. If `tariff(2, 10, 4, 13)` gives `[1, 8]`, you're dividing with `//`, which rounds down: use `/`.
