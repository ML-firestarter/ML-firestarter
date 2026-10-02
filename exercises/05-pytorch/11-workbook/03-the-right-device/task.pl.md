---
description: Wybierz urządzenie do obliczeń i przenieś na nie porcję o dowolnym kształcie, z tensorami w krotkach, listach i słownikach.
---

# Właściwe urządzenie

*Korzysta z [Urządzenia](../../../../notes/05-pytorch/03-devices.pl.md) dla urządzeń i `.to()` oraz [Własne moduły](../../../../notes/05-pytorch/08-your-own-modules.pl.md) dla porcji, które są słownikami.*

Modele z kilkoma wejściami robią porcje kilku rodzajów: tensor, krotkę tensorów albo słownik z nimi, nawet z listami w środku. Dokończ dwie funkcje:

- `get_device()` zwraca `"cuda"`, gdy `torch.cuda.is_available()`, a `"cpu"`, gdy nie.
- `to_device(batch, device)` zwraca porcję z każdym tensorem w niej przeniesionym na `device`, z tą samą strukturą: krotka zostaje krotką, lista listą, a słownik słownikiem z tymi samymi kluczami. Mogą być zagnieżdżone, jak `{"X": [a, b], "y": (c,)}`. Pojedynczy tensor też jest przenoszony.

| Wywołanie                                              | Zwraca                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------- |
| `get_device()` na stronie, która nie ma karty graficznej | `"cpu"`                                                  |
| `to_device((a, {"b": b}), "cpu")`                      | krotkę z `a` i słownik z kluczem `"b"` i `b`               |

Funkcja wywołuje samą siebie dla każdego elementu krotki, listy albo słownika i przenosi znalezione tensory. `isinstance(batch, (list, tuple))` mówi, czy porcja to lista albo krotka, a `type(batch)(...)` tworzy kolejną tego samego rodzaju.
