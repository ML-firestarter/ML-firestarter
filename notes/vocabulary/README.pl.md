---
description: Krótkie wyjaśnienia pojęć, które ciągle się pojawiają, połączone ze sobą linkami.
---

# Słownik

Jedna strona na jedno pojęcie. Każda zaczyna się od jednozdaniowej definicji, potem wyjaśnia ideę, podaje przykład i linkuje do powiązanych pojęć.

Pojęcia związane z trenowaniem łączą się tak: [pretrening](pretraining.pl.md) daje [model bazowy](base-model.pl.md), a [post-training](post-training.pl.md) zamienia go w asystenta za pomocą [SFT](sft.pl.md), potem [RLHF](rlhf.pl.md) albo [DPO](dpo.pl.md), a często też [RLVR](rlvr.pl.md). [LoRA](lora.pl.md) obniża koszt [dostrajania](fine-tuning.pl.md), a [kwantyzacja](quantization.pl.md) robi to samo dla [inferencji](inference.pl.md).

Praca z modelami ma własne pojęcia. Model czyta i pisze [tokeny](token.pl.md), a wszystko, na czym pracuje, musi się zmieścić w jego [oknie kontekstowym](context-window.pl.md). [RAG](rag.pl.md) wyszukuje pasujące dokumenty za pomocą [embeddingów](embedding.pl.md) i wkłada je do tego okna, co ogranicza [halucynacje](hallucination.pl.md). [Agent](agent.pl.md) idzie dalej i korzysta z narzędzi w pętli.

Pojęcia biznesowe zaczynają się od [modelu przychodów](revenue-model.pl.md), czyli tego, jak produkt zarabia. [ARR](arr.pl.md) i [churn](churn.pl.md) opisują subskrypcje, a [marża brutto](gross-margin.pl.md) i [ekonomika jednostkowa](unit-economics.pl.md) pokazują, czy biznes się opłaca.

<details>
<summary>Jak dodać pojęcie</summary>

Dodaj do `notes/vocabulary/` plik nazwany od angielskiej nazwy pojęcia, na przykład `perplexity.md`, a obok jego polską wersję, `perplexity.pl.md`. Z nazwy pliku powstaje adres strony wspólny dla obu języków. Pojęcia są ułożone alfabetycznie według tytułów, więc nie numeruj plików. Polska wersja może zaczynać się od tego szablonu:

```md
---
description: Jedno zdanie definiujące pojęcie.
---

# Perpleksja

Kilka zdań wyjaśniających ideę.

**Przykład:** konkretny przypadek.

**Powiązane:** [Token](token.pl.md)
```

W polskiej wersji linkuj do polskich plików innych pojęć, na przykład `token.pl.md`.

</details>
