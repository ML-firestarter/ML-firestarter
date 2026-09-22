---
description: Nadzorowane dostrajanie (ang. supervised fine-tuning). Trenowanie wstępnie wytrenowanego modelu na przykładowych promptach połączonych z idealnymi odpowiedziami.
---

# SFT

SFT to zwykle pierwszy krok [post-trainingu](post-training.pl.md). Zbiera się prompty z wysokiej jakości odpowiedziami, napisanymi przez ludzi albo wygenerowanymi przez inne modele i potem przefiltrowanymi, i kontynuuje trening [modelu bazowego](base-model.pl.md), żeby tworzył takie odpowiedzi. Funkcja straty jest ta sama co w [pretreningu](pretraining.pl.md), czyli strata przewidywania następnego tokenu, zwykle liczona tylko na odpowiedzi, a nie na prompcie.

Nazywa się je *nadzorowanym*, bo każdy przykład ma odpowiedź do naśladowania, w odróżnieniu od [RL](rl.pl.md), gdzie model dostaje tylko ocenę. Zbiory danych liczą od około tysiąca starannie dobranych przykładów do milionów.

SFT to skuteczny sposób na nauczenie formatu, tonu i wykonywania poleceń. Ponieważ jednak model naśladuje przykłady, ogranicza go ich jakość. To jeden z powodów, dla których po SFT zwykle następuje [RLHF](rlhf.pl.md), [DPO](dpo.pl.md) albo [RLVR](rlvr.pl.md).

**Przykład:** jeden przykład treningowy.

```text
Prompt:     Wyjaśnij w jednym zdaniu, czym jest GPU.
Odpowiedź:  GPU to procesor z tysiącami małych rdzeni, które wykonują wiele obliczeń równolegle, dzięki czemu dobrze nadaje się do grafiki i do trenowania sieci neuronowych.
```

**Powiązane:** [Dostrajanie](fine-tuning.pl.md) · [Pretrening](pretraining.pl.md) · [RLHF](rlhf.pl.md) · [Post-training](post-training.pl.md)
