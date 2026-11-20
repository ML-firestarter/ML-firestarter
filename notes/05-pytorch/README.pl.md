---
description: Tensory i automatyczne liczenie nachyleń w PyTorchu, bibliotece, w której powstaje większość sieci neuronowych, na paragonach firmy taksówkowej i z kodem uruchamianym na stronie.
---

# PyTorch

PyTorch to biblioteka, w której napisano większość dzisiejszych sieci neuronowych, od małych sieci z tych lekcji po modele językowe. To, co [rozdział o sieciach neuronowych](../04-foundations/04-neural-networks/) robił na listach i w pętlach, PyTorch robi na całych tabelach liczb naraz. Sam liczy nachylenia i potrafi korzystać z karty graficznej, jeśli jest dostępna.

Nie trzeba niczego instalować. Kod z tych lekcji działa w twojej przeglądarce dzięki małemu PyTorchowi napisanemu dla tej strony, który wypisuje to samo co prawdziwy, o czym więcej w części [PyTorch na stronie](../01-start-here/01-how-this-works.pl.md#pytorch-na-stronie). Ten sam kod działa bez zmian na twoim komputerze po `pip install torch`.

Rozdział opiera się na rozdziałach [Python](../02-python/) i [Podstawy](../04-foundations/): trzeba swobodnie posługiwać się funkcjami, listami i pętlami, a w lekcji 8 także [klasami](../02-python/04-programs/01-classes.pl.md), i wiedzieć, czym są strata i krok spadku gradientu. W lekcjach wciąż pojawia się firma taksówkowa i jej paragony.

## Czego się nauczysz

1. [Tensory](01-tensors.pl.md): policzysz opłaty za cały dzień naraz, poznasz kształty, typy, widoki i rozgłaszanie, a na koniec zamienisz obraz na tensor.
2. [Autograd](02-autograd.pl.md): PyTorch policzy za ciebie nachylenia, wytrenujesz dzięki nim prostą opłat i znajdziesz nachylenie względem wejścia.
3. [Urządzenia](03-devices.pl.md): wskażesz, gdzie mają leżeć tensory, i napiszesz kod, który korzysta z karty graficznej, jeśli jest dostępna.
4. [Regresja liniowa ręcznie](04-linear-regression-by-hand.pl.md): wytrenujesz regresję liniową na stu kursach za pomocą tensorów i autogradu.
5. [Regresja liniowa z nn.Linear](05-linear-regression-with-nn-linear.pl.md): powtórzysz ten sam trening z warstwą, funkcją straty i optymalizatorem z PyTorcha.
6. [Porcje danych i ocena](06-batches-and-evaluation.pl.md): podasz modelowi dane porcjami, podzielisz kursy na trzy zbiory i ocenisz model.
7. [Sieć z nn.Sequential](07-a-network-with-nn-sequential.pl.md): połączysz warstwy i ReLU w sieć, która potrafi odtworzyć załamania opłat.
8. [Własne moduły](08-your-own-modules.pl.md): napiszesz własny model szeroki i głęboki, z kilkoma wejściami i wyjściami.
9. [Klasyfikacja obrazów](09-classifying-images.pl.md): wytrenujesz sieć rozpoznającą cyfry, z entropią krzyżową jako funkcją straty, dokładnością i softmaxem.
10. [Zapis, wczytywanie i strojenie](10-saving-loading-and-tuning.pl.md): zapiszesz wytrenowany model, wczytasz go z powrotem i poszukasz dobrych ustawień.
11. [Regularyzacja i optymalizatory](11-regularization-and-optimizers.pl.md): przyspieszysz trening za pomocą momentum i Adama, będziesz zmniejszać współczynnik uczenia w trakcie treningu, a zanik wag i dropout nie pozwolą sieci uczyć się na pamięć.
12. [Zeszyt ćwiczeń](13-workbook.pl.md): dziesięć dodatkowych ćwiczeń łączących lekcje, od najłatwiejszego do najtrudniejszego.

Każda lekcja kończy się ćwiczeniami, które rozwiązujesz na stronie.
