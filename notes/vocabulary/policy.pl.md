---
description: W uczeniu przez wzmacnianie strategia, która wybiera działanie w każdej sytuacji. W przypadku modelu językowego to sam model.
---

# Polityka

Polityka (ang. policy, po polsku czasem też: strategia) to reguła, która na podstawie tego, co agent obserwuje (jego *stanu*), wybiera to, co zrobi (*działanie*). Zwykle podaje prawdopodobieństwa wszystkich możliwych działań i zapisuje się ją jako $\pi(a \mid s)$. [Uczenie przez wzmacnianie](rl.pl.md) zmienia politykę tak, żeby działania prowadzące do większej nagrody stawały się bardziej prawdopodobne.

W przypadku modelu językowego stanem jest prompt razem z dotychczas napisanym tekstem, a działaniem następny [token](token.pl.md). Prawdopodobieństwa następnego tokenu, które podaje model, są dokładnie polityką, dlatego artykuły o [RLHF](rlhf.pl.md) nazywają trenowany model „polityką”.

**Przykład:** polityka programu szachowego patrzy na szachownicę i przypisuje każdemu dozwolonemu ruchowi prawdopodobieństwo. Ruchy, które w trakcie treningu prowadziły do zwycięstw, z czasem stają się bardziej prawdopodobne.

**Powiązane:** [RL](rl.pl.md) · [Model nagrody](reward-model.pl.md) · [RLHF](rlhf.pl.md)
