---
description: Maksymalna ilość tekstu, liczona w tokenach, którą model językowy może wziąć pod uwagę naraz.
---

# Okno kontekstowe

Wszystko, czego model używa do napisania odpowiedzi, musi się zmieścić w jego oknie kontekstowym (ang. context window): instrukcje, dotychczasowa rozmowa, dokumenty i wyniki narzędzi, a także sama odpowiedź w trakcie pisania. Okno mierzy się w [tokenach](token.pl.md). Okna urosły od około 2000 tokenów w GPT-3 (2020) do setek tysięcy, a w niektórych modelach do miliona i więcej.

Model nie ma pamięci między zapytaniami. Aplikacja czatu stwarza pozór, że pamięta, bo przy każdej wiadomości wysyła całą rozmowę od nowa, więc długie rozmowy zajmują coraz więcej okna i coraz więcej kosztują. Gdy okno się zapełni, coś trzeba poświęcić: stare wiadomości są usuwane albo streszczane, a dokumenty skracane albo przeszukiwane za pomocą [RAG](rag.pl.md), zamiast być wklejane w całości.

Duże okno nie gwarantuje, że model dobrze wykorzysta wszystko, co w nim jest. Modele potrafią przeoczyć szczegóły ukryte w środku długiego kontekstu, a każdy dodatkowy token zwiększa koszt i czas [inferencji](inference.pl.md).

**Przykład:** w oknie o wielkości 200 000 tokenów, przy około trzech czwartych słowa na token, model może naraz przyjąć mniej więcej 150 000 angielskich słów, czyli mniej więcej dwie powieści. Tekstu po polsku zmieści się mniej, bo polskie słowa zwykle dzielą się na więcej tokenów.

**Powiązane:** [Token](token.pl.md) · [RAG](rag.pl.md) · [Inferencja](inference.pl.md) · [Agent](agent.pl.md)
