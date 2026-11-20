---
description: Wystarczy nieznacznie zmienić obraz, żeby sieć rozpoznała go błędnie. FGSM, PGD, ataki wycelowane w wybraną klasę, normy, którymi mierzy się zmianę, i ataki na embeddingi, z kodem uruchamianym na stronie.
---

# Przykłady adwersarialne

Sieć, która poprawnie rozpoznaje 94% cyfr, da się doprowadzić do tego, że nie rozpozna prawie żadnej, i to zmianami w obrazach, których człowiek ledwie by się dopatrzył. Tak celowo zmieniony obraz to **przykład adwersarialny** (ang. adversarial example; spotyka się też nazwę *przykład antagonistyczny*). W tym rozdziale będziesz je tworzyć: zaatakujesz sieć, która odczytuje paragony firmy taksówkowej, zmierzysz, jak bardzo spada jej dokładność, i sprawdzisz, czego trzeba, żeby sieć wytrzymała atak.

Każdy atak to kilka linijek kodu w PyTorchu, które, jak cały kurs, działają w przeglądarce. Potrzebne jest do tego tylko nachylenie straty względem obrazu, a takie nachylenie, tyle że dla kursu taksówki, liczyła już lekcja [Autograd](../05-pytorch/02-autograd.pl.md#nachylenie-względem-wejścia).

Ten rozdział opiera się na rozdziale [PyTorch](../05-pytorch/). Musisz wiedzieć, jak trenuje się sieć z lekcji [Klasyfikacja obrazów](../05-pytorch/09-classifying-images.pl.md) i jak rozpoznaje ona cyfry, a także swobodnie posługiwać się tensorami, `torch.autograd.grad` i `clamp`.

## Czego się nauczysz

1. [Oszukiwanie sieci](01-fooling-a-network.pl.md): zmienisz każdy piksel odrobinę, zgodnie ze znakiem nachylenia, i zmierzysz dokładność pod atakiem.
2. [PGD](02-pgd.pl.md): zrobisz wiele małych kroków, po każdym sprowadzając obraz z powrotem do kuli o promieniu ε, i wytrenujesz sieć na zaatakowanych obrazach.
3. [Cele i normy](03-targets-and-norms.pl.md): sprawisz, że sieć rozpozna wybraną cyfrę, zmierzysz zmianę na dwa sposoby i odsuniesz embedding obrazu, nie używając żadnej etykiety.

Każda lekcja kończy się ćwiczeniami, które rozwiązujesz na stronie.
