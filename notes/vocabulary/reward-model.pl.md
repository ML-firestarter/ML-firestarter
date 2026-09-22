---
description: Model, który ocenia, jak dobra jest odpowiedź, wytrenowany na preferencjach ludzi. Często w skrócie RM (ang. reward model).
---

# Model nagrody

Ludzie są niekonsekwentni, gdy mają ocenić odpowiedź w skali od 1 do 10, ale dużo pewniej wskazują, która z dwóch odpowiedzi jest lepsza. Dlatego dane o preferencjach zbiera się jako porównania: prompt, dwie odpowiedzi i ta, którą ktoś wybrał.

Model nagrody to zwykle model językowy, którego ostatnią warstwę zastąpiono taką, która zwraca jedną liczbę: ocenę $r(x, y)$ odpowiedzi $y$ na prompt $x$. Trenuje się go tak, żeby preferowana odpowiedź $y_w$ dostawała wyższą ocenę niż odrzucona $y_l$:

$$
\mathcal{L} = -\log \sigma\big( r(x, y_w) - r(x, y_l) \big)
$$

gdzie $\sigma$ to funkcja sigmoidalna. Im większa różnica we właściwą stronę, tym mniejsza strata.

Po wytrenowaniu model nagrody może ocenić miliony odpowiedzi podczas [RLHF](rlhf.pl.md) bez udziału człowieka. Tylko jednak przybliża ludzki osąd, a [polityka](policy.pl.md) wykorzysta jego błędy, jeśli tylko zdoła; zob. [hakowanie nagrody](reward-hacking.pl.md).

**Przykład:** dla pytania „Jak odwrócić listę w Pythonie?” odpowiedź, która pokazuje `items[::-1]` i `items.reverse()` i wyjaśnia różnicę, powinna dostać wyższą ocenę niż „Użyj pętli”.

**Powiązane:** [RLHF](rlhf.pl.md) · [Hakowanie nagrody](reward-hacking.pl.md) · [DPO](dpo.pl.md) · [Polityka](policy.pl.md)
