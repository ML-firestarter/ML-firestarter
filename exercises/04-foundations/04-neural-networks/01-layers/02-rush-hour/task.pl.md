---
description: Samodzielnie dobierz 7 parametrów sieci tak, żeby spodziewała się odrzuceń tylko w wieczornych godzinach szczytu.
---

# Godziny szczytu

W wieczornych godzinach szczytu ulice są zakorkowane, więc kurs trwa dużo dłużej za tę samą opłatę, a kierowcy odrzucają więcej zamówień. Tym razem wejściem sieci nie jest długość kursu, tylko godzina, o której przyszło zamówienie: liczba całkowita od 0 do 23, więc zamówienie z 17:45 ma godzinę 17.

Funkcja `predict(hour, net)` jest gotowa: to sieć z części [Z dwóch S powstaje U](../../../../../notes/04-foundations/04-neural-networks/01-layers.pl.md#z-dwóch-s-powstaje-u), z godziną jako wejściem. Zmień tylko 7 liczb w `NET` tak, żeby sieć dawała prawdopodobieństwo 0,5 lub więcej zamówieniom z godzin od 16 do 19, czyli z godzin szczytu, a mniej niż 0,5 zamówieniom z każdej innej godziny. Na razie `NET` ma parametry U z lekcji, więc sieć spodziewa się odrzuceń do godziny 2 i od godziny 12.

| Wywołanie                                                   | Zwraca             |
| ----------------------------------------------------------- | ------------------ |
| `[hour for hour in range(24) if predict(hour, NET) >= 0.5]` | `[16, 17, 18, 19]` |

Poprawnych odpowiedzi jest wiele i każda z nich przechodzi sprawdzenie. Uruchom kod, żeby zobaczyć prawdopodobieństwo dla każdej godziny.

S jest w połowie wysokości tam, gdzie prosta wewnątrz niego wynosi 0, jak `h1` przy 3 km w lekcji, gdzie −2 × 3 + 6 = 0. Jeśli każda godzina od 16 wzwyż dostaje 0,5 lub więcej, prawdopodobieństwo po godzinach szczytu już nie spada. Może je obniżyć drugie S, które rośnie około godziny 20, z ujemną wagą w neuronie wyjściowym.
