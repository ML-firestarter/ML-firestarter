---
description: Dalsze trenowanie już wytrenowanego modelu na mniejszym, ukierunkowanym zbiorze danych.
---

# Dostrajanie

Trenowanie dużego modelu od zera wymaga ogromnych ilości danych i mocy obliczeniowej. Dostrajanie (ang. fine-tuning) wykorzystuje to, co wytrenowany model już wie, i koryguje go odrobiną dodatkowego treningu na znacznie mniejszym zbiorze danych, zwykle z mniejszym współczynnikiem uczenia.

W ten sposób dopasowuje się ogólny model do zadania, dziedziny albo stylu. [SFT](sft.pl.md) to dostrajanie na przykładach dobrych odpowiedzi, a [RLHF](rlhf.pl.md) i [DPO](dpo.pl.md) dostrajają model na podstawie preferencji.

Pełne dostrajanie zmienia wszystkie wagi modelu. Metody oszczędne pod względem liczby parametrów (ang. parameter-efficient), takie jak [LoRA](lora.pl.md), zamrażają oryginalne wagi i trenują niewielką liczbę dodatkowych, co wymaga dużo mniej pamięci.

Dostrajanie najlepiej sprawdza się wtedy, gdy trzeba zmienić to, jak model się zachowuje. Żeby dać mu nową wiedzę, na przykład dokumenty firmy, zwykle prościej użyć [RAG](rag.pl.md), który łatwiej też aktualizować.

**Przykład:** dostrojenie ogólnego modelu na kilku tysiącach dawnych rozmów z działem obsługi klienta, żeby odpowiadał klientom w tonie i formacie firmy.

**Powiązane:** [Pretrening](pretraining.pl.md) · [SFT](sft.pl.md) · [Model bazowy](base-model.pl.md) · [LoRA](lora.pl.md) · [RAG](rag.pl.md)
