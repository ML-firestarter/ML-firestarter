---
description: Lista liczb, która reprezentuje fragment tekstu (albo obraz czy cokolwiek innego) tak, że podobne rzeczy dostają podobne liczby.
---

# Embedding

Komputer nie porównuje znaczeń bezpośrednio, ale potrafi porównywać liczby. Model embeddingów, wytrenowany tak, żeby rzeczy o podobnym znaczeniu lądowały blisko siebie, zamienia fragment treści w wektor, czyli listę setek albo tysięcy liczb. „Jak zresetować hasło?” i „Nie pamiętam danych logowania” nie mają prawie żadnych wspólnych słów, ale dostają wektory skierowane niemal w tę samą stronę. Po polsku mówi się też *osadzenie* albo *reprezentacja wektorowa*, ale zwykle zostaje angielskie słowo.

Bliskość mierzy się zwykle podobieństwem kosinusowym, czyli kosinusem kąta między dwoma wektorami:

$$
\cos(u, v) = \frac{u \cdot v}{\lVert u \rVert \, \lVert v \rVert}
$$

Wynosi ono 1, gdy wektory wskazują ten sam kierunek, i jest tym mniejsze, im mniej mają ze sobą wspólnego.

Embeddingi napędzają wyszukiwanie semantyczne, rekomendacje, grupowanie i etap wyszukiwania w [RAG](rag.pl.md). Modele językowe też używają ich w środku: ich pierwsza warstwa zamienia każdy [token](token.pl.md) w wektor.

**Przykład:** centrum pomocy raz oblicza embedding każdego artykułu i zapisuje wektory. Gdy przychodzi pytanie, liczy embedding pytania i zwraca artykuły o najbliższych wektorach, nawet jeśli używają innych słów niż pytanie.

**Powiązane:** [RAG](rag.pl.md) · [Token](token.pl.md)
