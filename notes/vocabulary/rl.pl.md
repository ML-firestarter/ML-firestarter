---
description: Uczenie przez wzmacnianie (ang. reinforcement learning). Uczenie się metodą prób i błędów, z nagród, a nie z poprawnych odpowiedzi.
---

# RL

W [uczeniu nadzorowanym](../02-foundations/01-what-is-machine-learning.pl.md#trzy-rodzaje-uczenia) każdy przykład ma poprawną odpowiedź. W uczeniu przez wzmacnianie nikt jej nie podaje. Uczący się system dostaje tylko nagrodę, która mówi, jak dobrze poszło, czasem długo po działaniach, które do tego doprowadziły, i musi sam ustalić, którym działaniom należy się zasługa.

Elementy:

- **Agent**: ten, kto się uczy. Działa zgodnie ze swoją [polityką](policy.pl.md).
- **Środowisko**: świat, w którym agent działa.
- **Stan**: to, co agent obserwuje.
- **Działanie** (akcja): to, co agent robi.
- **Nagroda**: liczba, która mówi, jak dobry był wynik.

Celem jest polityka, która zbiera jak najwięcej nagrody. RL odegrało kluczową rolę w systemach grających w gry, takich jak AlphaGo. W modelach językowych używa się go w [RLHF](rlhf.pl.md), gdzie nagrodę daje [model nagrody](reward-model.pl.md), i w [RLVR](rlvr.pl.md), gdzie nagroda pochodzi ze sprawdzenia odpowiedzi. PPO i GRPO to dwa szeroko stosowane algorytmy do tego celu.

**Przykład:** agent uczący się gry wideo widzi ekran (stan), naciska przyciski (działania) i jako nagrodę dostaje zmianę wyniku punktowego.

**Powiązane:** [Polityka](policy.pl.md) · [Model nagrody](reward-model.pl.md) · [RLHF](rlhf.pl.md) · [RLVR](rlvr.pl.md) · [Hakowanie nagrody](reward-hacking.pl.md)
