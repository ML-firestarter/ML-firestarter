---
description: Wybierz urządzenie do obliczeń i przenieś na nie porcję o dowolnej strukturze, z tensorami w krotkach, listach i słownikach.
---

# Właściwe urządzenie

*Korzysta z lekcji [Urządzenia](../../../../notes/05-pytorch/03-devices.pl.md), z której przydadzą się urządzenia i `.to()`, oraz z lekcji [Własne moduły](../../../../notes/05-pytorch/08-your-own-modules.pl.md), z której przydadzą się porcje w postaci słowników.*

Modele z kilkoma wejściami dostają porcje różnego rodzaju: tensor, krotkę tensorów albo słownik z tensorami, a nawet z listami tensorów w środku. Dokończ dwie funkcje:

- `get_device()` zwraca `"cuda"`, gdy `torch.cuda.is_available()`, a w przeciwnym razie `"cpu"`.
- `to_device(batch, device)` zwraca porcję, w której każdy tensor jest przeniesiony na `device`, z zachowaniem struktury: krotka zostaje krotką, lista listą, a słownik słownikiem z tymi samymi kluczami. Struktury mogą być zagnieżdżone, jak w `{"X": [a, b], "y": (c,)}`. Pojedynczy tensor też zostaje przeniesiony.

| Wywołanie                                                    | Zwraca                                                         |
| ------------------------------------------------------------ | -------------------------------------------------------------- |
| `get_device()` na tej stronie, gdzie nie ma karty graficznej | `"cpu"`                                                        |
| `to_device((a, {"b": b}), "cpu")`                            | krotkę z `a` i słownikiem, w którym pod kluczem `"b"` jest `b` |

Funkcja wywołuje samą siebie dla każdego elementu krotki, listy albo słownika i przenosi tensory, które znajdzie. `isinstance(batch, (list, tuple))` mówi, czy porcja jest listą albo krotką, a `type(batch)(...)` tworzy nową listę albo krotkę tego samego rodzaju.
