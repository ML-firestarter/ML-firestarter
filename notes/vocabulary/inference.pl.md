---
description: Uruchamianie wytrenowanego modelu, żeby uzyskać wyniki, w odróżnieniu od jego trenowania.
---

# Inferencja

Trening zmienia wagi modelu. Inferencja (ang. inference, po polsku też: wnioskowanie) korzysta z nich bez zmian, żeby wytworzyć wyniki. Za każdym razem, gdy wysyłasz chatbotowi wiadomość, model przeprowadza inferencję, żeby napisać odpowiedź.

Model językowy pisze odpowiedź po jednym [tokenie](token.pl.md). Cały prompt czyta w jednym równoległym przebiegu, co jest stosunkowo szybkie, ale każdy nowy token wymaga kolejnego przebiegu przez cały model. Dlatego długie odpowiedzi trwają dłużej i więcej kosztują, co jest jednym z powodów, dla których API liczą sobie więcej za tokeny wyjściowe niż za wejściowe.

Trening odbywa się raz, a inferencja przy każdym zapytaniu każdego użytkownika, więc w przypadku popularnego modelu łączny koszt inferencji może przekroczyć koszt treningu. Przyspieszanie i obniżanie kosztów inferencji za pomocą mniejszych modeli, [kwantyzacji](quantization.pl.md), grupowania zapytań (ang. batching) i lepszego sprzętu to duża część inżynierii ML.

**Przykład:** w [lekcji o regresji liniowej](../02-foundations/02-linear-regression.pl.md) znalezienie $w$ i $b$ na podstawie danych to trening. Użycie ich do przewidzenia $y$ dla nowego $x$ to inferencja.

**Powiązane:** [Token](token.pl.md) · [Kwantyzacja](quantization.pl.md) · [Pretrening](pretraining.pl.md) · [Model przychodów](revenue-model.pl.md)
