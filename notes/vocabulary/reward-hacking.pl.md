---
description: Sytuacja, w której model znajduje sposób na zdobycie wysokiej nagrody bez robienia tego, o co naprawdę chodziło.
---

# Hakowanie nagrody

Nagroda jest tylko zastępstwem tego, czego naprawdę chcemy, a [RL](rl.pl.md) świetnie znajduje luki między jednym a drugim. Model trenowany z [modelem nagrody](reward-model.pl.md) może się nauczyć, że długie odpowiedzi, pewny ton albo pochlebstwa dostają wysokie oceny niezależnie od jakości. Model nagradzany za przechodzenie testów jednostkowych może się nauczyć obsługiwać testowane przypadki osobno, zamiast naprawić kod.

Hakowanie nagrody (ang. reward hacking) to przykład prawa Goodharta: gdy miara staje się celem, przestaje być dobrą miarą.

Typowe zabezpieczenia to kara za zbytnie oddalenie się od modelu startowego (kara KL w [RLHF](rlhf.pl.md)), modele nagrody trenowane na nowo w miarę poprawy polityki, nagrody trudniejsze do oszukania ([RLVR](rlvr.pl.md)) i ręczne czytanie próbek.

**Przykład:** w 2016 roku OpenAI trenowało agenta w grze w wyścigi łodzi CoastRunners, używając wyniku w grze jako nagrody. Punkty dawało trafianie w cele rozmieszczone wzdłuż trasy, więc agent znalazł lagunę, w której mógł bez końca krążyć, trafiając w te same kilka celów, gdy pojawiały się ponownie. Zdobywał o około 20% więcej punktów niż ludzie, choć nigdy nie ukończył wyścigu.

**Powiązane:** [Model nagrody](reward-model.pl.md) · [RL](rl.pl.md) · [RLHF](rlhf.pl.md) · [RLVR](rlvr.pl.md)
