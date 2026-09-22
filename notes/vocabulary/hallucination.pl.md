---
description: Fałszywe albo zmyślone stwierdzenie, które model językowy przedstawia jako fakt.
---

# Halucynacja

Model językowy jest trenowany, żeby tworzyć wiarygodnie brzmiący tekst, a wiarygodnie brzmiąca odpowiedź nie zawsze jest prawdziwa. Gdy model czegoś nie wie, może wypełnić lukę płynną, pewną siebie, ale błędną odpowiedzią: cytatem, którego nikt nie powiedział, artykułem, który nie istnieje, złą datą albo funkcją, której nie ma w bibliotece. To właśnie halucynacja.

Dzieje się tak, bo [pretrening](pretraining.pl.md) nagradza tekst, który wygląda poprawnie, a model nie ma wbudowanego sposobu, żeby sprawdzać fakty albo odróżniać to, co wie, od tego, co zgaduje. [Post-training](post-training.pl.md) może go nauczyć częściej mówić „nie wiem”, ale to sprawia, że halucynacje są rzadsze, a nie niemożliwe.

Jak je ograniczać:

- Podaj modelowi fakty w prompcie, na przykład za pomocą [RAG](rag.pl.md), i poproś, żeby odpowiadał tylko na ich podstawie i je cytował.
- Pozwól mu sprawdzać własną pracę narzędziami, takimi jak wyszukiwarka albo uruchomienie napisanego przez niego kodu (zob. [agent](agent.pl.md)).
- Sprawdzaj ważne twierdzenia samodzielnie, zwłaszcza nazwiska, liczby, cytaty i źródła.

**Przykład:** poproszony o źródła na niszowy temat model podaje trzy artykuły z wiarygodnymi tytułami, autorami i latami wydania. Dwa z nich istnieją, trzeciego nikt nigdy nie napisał.

**Powiązane:** [RAG](rag.pl.md) · [Pretrening](pretraining.pl.md) · [Post-training](post-training.pl.md) · [Agent](agent.pl.md)
