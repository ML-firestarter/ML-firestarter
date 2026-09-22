---
description: Uczenie przez wzmacnianie z weryfikowalnymi nagrodami (ang. reinforcement learning with verifiable rewards). RL, w którym nagroda pochodzi z automatycznego sprawdzenia odpowiedzi.
---

# RLVR

Niektóre zadania mają odpowiedzi, które program potrafi sprawdzić. Zadanie matematyczne ma znany wynik końcowy, kod można uruchomić z testami, łamigłówka ma rozwiązanie. W takich zadaniach nagroda może po prostu wynosić 1, gdy odpowiedź jest poprawna, i 0, gdy nie jest, bez potrzeby używania [modelu nagrody](reward-model.pl.md).

Takie nagrody są tanie, spójne i dużo trudniejsze do oszukania niż wyuczony model nagrody, choć nie całkiem odporne na oszustwa; zob. [hakowanie nagrody](reward-hacking.pl.md). Trenując RL na wielu sprawdzalnych problemach, modele rozumujące uczą się długo myśleć, sprawdzać swoją pracę i próbować innego podejścia, gdy utkną. DeepSeek-R1 to znany, otwarcie opisany przykład. Sam termin pochodzi z pracy Ai2 nad Tülu 3 z 2024 roku.

**Przykład:** model dostaje pytanie „Ile to jest 17 × 24?” i rozpisuje swoje rozumowanie. Jeśli jego ostateczna odpowiedź to 408, nagroda wynosi 1, a w przeciwnym razie 0. Przy wielu zadaniach nawyki rozumowania prowadzące do poprawnych odpowiedzi stają się coraz bardziej prawdopodobne.

**Powiązane:** [RL](rl.pl.md) · [Model nagrody](reward-model.pl.md) · [Hakowanie nagrody](reward-hacking.pl.md) · [Post-training](post-training.pl.md)
