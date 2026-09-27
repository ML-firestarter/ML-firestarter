---
description: Połącz neurony w sieć, która potrafi narysować coś więcej niż S, policz nachylenie względem każdej wagi metodą propagacji wstecznej, wytrenuj sieć i przygotuj dla niej wejścia.
---

# Sieci neuronowe

Sieć neuronowa składa się z **neuronów**, a każdy neuron działa jak mała regresja logistyczna: mnoży swoje wejścia przez wagi, dodaje wyraz wolny i przepuszcza wynik przez funkcję taką jak sigmoida. Jeden neuron potrafi narysować tylko S. Połącz kilka, tak żeby to, co liczą jedne, trafiało do innych, a razem narysują prawie każdy kształt. Tym właśnie jest sieć neuronowa, czy ma trzy neurony, czy miliardy.

Nazwa pochodzi od mózgu, którego komórki nerwowe, też nazywane neuronami, przekazują sobie sygnały. Pierwsze sztuczne neurony były nimi inspirowane, ale neuron w sieci to tylko wzór i na tym podobieństwo w zasadzie się kończy.

Cztery lekcje opierają się na rozdziale [Regresja logistyczna](../03-logistic-regression/), z tą samą firmą taksówkową i pytaniem, na które pojedyncze S nie odpowie. Najpierw sieć z trzech neuronów złożona ręcznie, potem **propagacja wsteczna**, która liczy nachylenie straty względem każdej wagi w sieci, niezależnie od tego, ile sieć ma warstw, a dalej trening, z dwoma pytaniami, których regresja logistyczna nie musiała sobie zadawać: od czego zacząć i kiedy skończyć. Na koniec wejścia: nowe wejście, policzone z długości kursu, dzięki któremu regresja logistyczna jednak narysuje U, i **standaryzacja**, która sprowadza wejścia bardzo różnej wielkości do tej samej skali, żeby spadek gradientu się nie wlókł.
