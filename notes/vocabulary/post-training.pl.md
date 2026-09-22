---
description: Wszystko, co robi się z modelem po pretreningu, żeby był pomocny, bezpieczny i sprawny.
---

# Post-training

[Pretrening](pretraining.pl.md) daje modelowi szeroką wiedzę i wyczucie języka. Post-training, czyli wszystko, co dzieje się z modelem później, kształtuje to, jak z nich korzysta: wykonywanie poleceń, prowadzenie rozmowy, odmawianie szkodliwych próśb, rozumowanie krok po kroku i używanie narzędzi.

Typowy przepis:

1. [SFT](sft.pl.md) na przykładach dobrych odpowiedzi.
2. Dostrajanie do preferencji za pomocą [RLHF](rlhf.pl.md) albo [DPO](dpo.pl.md), żeby model wybierał odpowiedzi, które ludzie lubią.
3. Często [RLVR](rlvr.pl.md) dla umiejętności, w których odpowiedzi da się sprawdzić, takich jak matematyka i programowanie.

Post-training tradycyjnie zużywał niewielki ułamek mocy obliczeniowej potrzebnej na pretrening, choć modele rozumujące przeznaczają coraz większą jej część na RL. Tak czy inaczej, to on w dużej mierze decyduje o tym, jak model się zachowuje.

**Przykład:** [model bazowy](base-model.pl.md) i zbudowany na nim model czatowy mają w dużej mierze tę samą wiedzę. Różnica w tym, jak odpowiadają, bierze się z post-trainingu.

**Powiązane:** [Pretrening](pretraining.pl.md) · [Model bazowy](base-model.pl.md) · [Dostrajanie](fine-tuning.pl.md)
