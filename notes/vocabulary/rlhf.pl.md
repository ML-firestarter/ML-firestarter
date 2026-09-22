---
description: Uczenie przez wzmacnianie z informacją zwrotną od ludzi (ang. reinforcement learning from human feedback). Użycie RL do kierowania modelu w stronę odpowiedzi, które ludzie wolą.
---

# RLHF

RLHF to technika, dzięki której modele takie jak InstructGPT i pierwszy ChatGPT stały się pomocne i przyjemne w rozmowie. Klasyczny przepis ma trzy kroki:

1. **[SFT](sft.pl.md)**: dostrój [model bazowy](base-model.pl.md) na przykładach dobrych odpowiedzi.
2. **[Model nagrody](reward-model.pl.md)**: zbierz ludzkie porównania odpowiedzi i wytrenuj model, który przewiduje, którą z nich ludzie wolą.
3. **[RL](rl.pl.md)**: pozwól modelowi po SFT, teraz nazywanemu [polityką](policy.pl.md), pisać odpowiedzi; oceń je modelem nagrody i zaktualizuj politykę w stronę wyższych ocen, zwykle algorytmem PPO.

Krok RL maksymalizuje nagrodę pomniejszoną o karę za oddalanie się od modelu po SFT:

$$
\max_{\pi} \; \mathbb{E}\big[ r(x, y) \big] - \beta \, \mathrm{KL}\big( \pi \,\|\, \pi_\text{SFT} \big)
$$

Dywergencja KL mierzy, jak daleko prawdopodobieństwa polityki odeszły od prawdopodobieństw modelu po SFT, a $\beta$ określa, jak mocno jest to karane. Bez tej kary polityka dryfuje w stronę dziwnych odpowiedzi, które akurat oszukują model nagrody, co nazywa się [hakowaniem nagrody](reward-hacking.pl.md).

Warianty zastępują ludzi oceniających odpowiedzi sędzią AI (RLAIF) albo całkiem pomijają model nagrody i pętlę RL ([DPO](dpo.pl.md)).

**Przykład:** na pytanie „Co oznacza KeyError w Pythonie?” jedna odpowiedź wyjaśnia, że klucza nie ma w słowniku, i pokazuje `d.get(key)`, a druga mówi tylko „sprawdź klucze”. Oceniający wolą pierwszą, model nagrody uczy się tej preferencji, a RL sprawia, że polityka pisze więcej takich odpowiedzi.

**Powiązane:** [SFT](sft.pl.md) · [Model nagrody](reward-model.pl.md) · [Polityka](policy.pl.md) · [DPO](dpo.pl.md) · [Hakowanie nagrody](reward-hacking.pl.md)
