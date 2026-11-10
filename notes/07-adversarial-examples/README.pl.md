---
description: Zmień obraz odrobinę, celowo, tak żeby sieć przeczytała go źle. FGSM, PGD, ataki wycelowane w klasę, normy, którymi mierzy się zmianę, i ataki na embeddingi, z kodem uruchamianym na stronie.
---

# Przykłady antagonistyczne

Sieć, która czyta dobrze 94% cyfr, da się doprowadzić do tego, że nie przeczyta dobrze prawie żadnej, zmianami w obrazach, których człowiek prawie by nie zauważył. Obraz zmieniony w ten sposób, celowo, to **przykład antagonistyczny**. Ten rozdział je tworzy. Atakuje sieć, która czyta paragony firmy taksówkowej, mierzy, jak bardzo spada jej dokładność, i sprawdza, czego trzeba, żeby sieć wytrzymała.

Każdy atak to kilka wierszy PyTorcha i działa w twojej przeglądarce, jak reszta kursu. Potrzebuje tylko nachylenia straty względem obrazu, które lekcja [Autograd](../05-pytorch/02-autograd.pl.md#nachylenie-względem-wejścia) policzyła dla kursu.

Rozdział opiera się na rozdziale [PyTorch](../05-pytorch/). Trzeba wiedzieć, jak trenuje się sieć z lekcji [Klasyfikacja obrazów](../05-pytorch/09-classifying-images.pl.md) i jak czyta ona cyfrę, i swobodnie posługiwać się tensorami, `torch.autograd.grad` i `clamp`.

## Czego się nauczysz

1. [Oszukiwanie sieci](01-fooling-a-network.pl.md): przesuń każdy piksel odrobinę, zgodnie ze znakiem nachylenia, i zmierz dokładność pod atakiem.
2. [PGD](02-pgd.pl.md): rób wiele małych kroków, po każdym sprowadzaj obraz z powrotem do kuli ε i wytrenuj sieć na zaatakowanych obrazach.
3. [Cele i normy](03-targets-and-norms.pl.md): spraw, żeby obraz był czytany jako wybrana cyfra, zmierz zmianę na dwa sposoby i odepchnij embedding obrazu bez żadnej etykiety.

Każda lekcja kończy się ćwiczeniami, które rozwiązujesz na stronie.
