---
description: Tensory i automatyczne gradienty w PyTorchu, bibliotece, w której napisana jest większość sieci neuronowych, na paragonach firmy taksówkowej, z kodem uruchamianym na stronie.
---

# PyTorch

PyTorch to biblioteka, w której napisana jest większość dzisiejszych sieci neuronowych, od małych z tych lekcji po modele językowe. To, co [rozdział o sieciach neuronowych](../04-foundations/04-neural-networks/) robił na listach i w pętlach, PyTorch robi na całych tabelach liczb naraz. Sam liczy nachylenia i działa na karcie graficznej, gdy jest dostępna.

Nie musisz niczego instalować. Kod w tych lekcjach działa w twojej przeglądarce, z małym PyTorchem napisanym dla tej witryny, który wypisuje to, co prawdziwy, jak wyjaśnia [PyTorch na stronie](../01-start-here/01-how-this-works.pl.md#pytorch-na-stronie). Ten sam kod działa bez zmian na twoim komputerze po `pip install torch`.

Rozdział opiera się na rozdziałach [Python](../02-python/) i [Podstawy](../04-foundations/): powinieneś swobodnie posługiwać się funkcjami, listami i pętlami, a w lekcji 8 także [klasami](../02-python/04-programs/01-classes.pl.md), oraz wiedzieć, czym jest strata i krok spadku gradientu. Lekcje zachowują firmę taksówkową i jej paragony.

## Czego się nauczysz

1. [Tensory](01-tensors.pl.md): policz opłaty za cały dzień naraz i poznaj kształty, typy, widoki i rozgłaszanie.
2. [Autograd](02-autograd.pl.md): pozwól PyTorchowi liczyć nachylenia i wytrenuj z nimi prostą opłat.
3. [Urządzenia](03-devices.pl.md): powiedz, gdzie leżą tensory, i napisz kod, który działa na karcie graficznej, gdy jest.
4. [Regresja liniowa ręcznie](04-linear-regression-by-hand.pl.md): wytrenuj regresję liniową na stu kursach tensorami i autogradem.
5. [Regresja liniowa z nn.Linear](05-linear-regression-with-nn-linear.pl.md): ten sam trening z warstwą, stratą i optymalizatorem z PyTorcha.
6. [Porcje danych i ocena](06-batches-and-evaluation.pl.md): podawaj modelowi dane w porcjach, podziel kursy na trzy zbiory i zmierz model.
7. [Sieć z nn.Sequential](07-a-network-with-nn-sequential.pl.md): ułóż warstwy i ReLU w sieć, która rysuje zakręty.
8. [Własne moduły](08-your-own-modules.pl.md): napisz własny model szeroki i głęboki, z kilkoma wejściami i wyjściami.
9. [Klasyfikacja obrazów](09-classifying-images.pl.md): wytrenuj sieć do czytania cyfr, ze stratą entropii krzyżowej, dokładnością i softmaxem.
10. [Zapis, wczytywanie i strojenie](10-saving-loading-and-tuning.pl.md): zachowaj wytrenowany model, wczytaj go z powrotem i poszukaj dobrych ustawień.

Każda lekcja kończy się ćwiczeniami, które rozwiązujesz na stronie.
