---
description: Przewiduj, czy zamówienie taksówki zostanie anulowane, zmierz, jak bardzo predykcja się myli, i wytrenuj model metodą spadku gradientu.
---

# Regresja logistyczna

Regresja logistyczna odpowiada na pytania, na które odpowiedź brzmi „tak” albo „nie”: czy ten e-mail to spam, czy ten klient anuluje zamówienie, czy jutro będzie padać. To najprostszy model, który przydziela przykłady do kategorii, a neurony sieci neuronowej opierają się na tym samym pomyśle.

Nazwa pochodzi od dwóch części modelu. **Funkcja logistyczna**, częściej nazywana sigmoidą, ściska dowolną liczbę do prawdopodobieństwa między 0 a 1. **Regresja**, bo tak jak regresja liniowa model przewiduje liczbę: prawdopodobieństwo odpowiedzi „tak”. Dopiero próg zamienia prawdopodobieństwo w odpowiedź, tak albo nie, i to robi z modelu klasyfikator.

Trzy lekcje idą tą samą drogą co [Regresja liniowa](../02-linear-regression/), z tą samą firmą taksówkową. Najpierw reguła, która przewiduje prawdopodobieństwo, że klient anuluje zamówienie, potem ocena, która mówi, jak bardzo reguła się myli, a na koniec trening. Waga, wyraz wolny i spadek gradientu wracają prawie bez zmian, więc większość nowego materiału jest w dwóch miejscach: w funkcji, która zamienia prostą w prawdopodobieństwo, i w funkcji straty dla prawdopodobieństw.
