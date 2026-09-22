---
description: Zapisywanie wag modelu na mniejszej liczbie bitów, żeby potrzebował mniej pamięci i działał szybciej, kosztem części dokładności.
---

# Kwantyzacja

Modele zwykle trenuje się z każdą wagą zapisaną jako 16- albo 32-bitowa liczba zmiennoprzecinkowa. Kwantyzacja zapisuje wagi na mniejszej liczbie bitów, zwykle 8 albo 4, zaokrąglając je do niewielkiego zbioru poziomów. Liczba 4-bitowa ma tylko 16 możliwych wartości, więc każda mała grupa wag przechowuje też współczynnik skali, który przekłada te wartości z powrotem na właściwy zakres.

Mniej bitów to mniej pamięci, więc model mieści się na mniejszej liczbie GPU albo na mniejszych kartach, a nawet na laptopie czy telefonie. Dzięki temu taniej go obsługiwać. Często oznacza to też szybszą [inferencję](inference.pl.md), bo generowanie tekstu jest zwykle ograniczone tym, jak szybko da się odczytywać wagi z pamięci. Ceną jest pewna utrata dokładności: 8 bitów zwykle daje prawie to samo co oryginał, a przy 4 bitach i mniej strata jest większa, zależnie od modelu i metody.

Większość modeli kwantyzuje się po treningu. Trening z uwzględnieniem kwantyzacji (ang. quantization-aware training) symuluje niższą precyzję już podczas treningu, żeby model nauczył się z nią działać.

**Przykład:** model o 70 mld parametrów potrzebuje na wagi około 140 GB przy 16 bitach (2 bajty na wagę), 70 GB przy 8 bitach i 35 GB przy 4 bitach. Przy 16 bitach potrzebuje co najmniej dwóch GPU po 80 GB, a przy 4 bitach mieści się na jednym, z zapasem pamięci.

**Powiązane:** [Inferencja](inference.pl.md) · [LoRA](lora.pl.md) · [Marża brutto](gross-margin.pl.md)
