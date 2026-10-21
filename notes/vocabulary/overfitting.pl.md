---
description: Sytuacja, w której model zbyt ściśle dopasowuje się do danych treningowych i gorzej działa na nowych danych.
---

# Nadmierne dopasowanie

Nadmierne dopasowanie występuje, gdy model uczy się szczegółów albo szumu właściwych danym treningowym zamiast wzorców, które uogólniają się na nowe dane. Może dobrze działać na przykładach treningowych, a słabo na nowych; porównanie wyników na zbiorach treningowym i walidacyjnym może je ujawnić.

**Przykład:** strata sieci na danych treningowych cały czas spada, a na walidacyjnych rośnie, gdy sieć uczy się przypadkowych wyników ze zbioru treningowego.

**Powiązane:** [Dostrajanie](fine-tuning.pl.md) · [Pretrening](pretraining.pl.md)
