---
description: Bezpośrednia optymalizacja preferencji (ang. direct preference optimization). Uczenie się z par lepszych i gorszych odpowiedzi, bez modelu nagrody i bez RL.
---

# DPO

Podobnie jak [RLHF](rlhf.pl.md), DPO uczy się z danych o preferencjach, czyli z promptów, z których każdy ma odpowiedź preferowaną przez ludzi i odpowiedź odrzuconą. RLHF najpierw trenuje na tych danych [model nagrody](reward-model.pl.md), a potem uruchamia [RL](rl.pl.md). DPO zastępuje oba kroki jedną funkcją straty, która zwiększa różnicę między odpowiedzią preferowaną a odrzuconą, mierząc każdą z nich względem zamrożonej kopii modelu startowego (zwykle modelu po [SFT](sft.pl.md)):

$$
\mathcal{L}_\text{DPO} = -\log \sigma\left( \beta \log \frac{\pi_\theta(y_w \mid x)}{\pi_\text{ref}(y_w \mid x)} - \beta \log \frac{\pi_\theta(y_l \mid x)}{\pi_\text{ref}(y_l \mid x)} \right)
$$

Tutaj $x$ to prompt, $y_w$ i $y_l$ to odpowiedź preferowana i odrzucona, $\pi_\theta$ to trenowany model, $\pi_\text{ref}$ to zamrożona kopia, $\sigma$ to funkcja sigmoidalna, a $\beta$ określa, jak mocno model jest trzymany blisko modelu odniesienia, podobnie jak kara KL w RLHF.

Artykuł o DPO (Rafailov i in., 2023) pokazał, że ta metoda optymalizuje ten sam cel co RLHF, a trenuje się ją jak zwykłe uczenie nadzorowane: prościej, taniej i stabilniej. Dlatego stała się popularnym wyborem, zwłaszcza w przypadku modeli otwartych.

**Przykład:** dla polecenia „Wyjaśnij rekurencję dziesięcioletniemu dziecku” ludzie woleli odpowiedź opartą na matrioszkach, z których każda po otwarciu odsłania mniejszą, niż podręcznikową definicję. DPO popycha model w stronę odpowiedzi takich jak pierwsza.

**Powiązane:** [RLHF](rlhf.pl.md) · [Model nagrody](reward-model.pl.md) · [SFT](sft.pl.md)
