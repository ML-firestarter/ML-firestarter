---
description: Przewiduj opłatę za taksówkę na podstawie długości kursu, zmierz, jak bardzo predykcja się myli, i pozwól modelowi samemu znaleźć swoje liczby.
---

# Regresja liniowa

Regresja liniowa przewiduje liczbę na podstawie innych liczb: cenę mieszkania na podstawie jego powierzchni, dzienną sprzedaż lodów na podstawie temperatury, opłatę za taksówkę na podstawie długości kursu. To najprostszy model, który się uczy, a pojęcia, które poznasz po drodze, czyli funkcja straty, gradient i współczynnik uczenia, wracają w każdej [sieci neuronowej](../04-neural-networks/).

Trzy lekcje budują go kawałek po kawałku, wszystkie na tym samym przykładzie: opłatach za taksówkę. Najpierw reguła, która przewiduje opłatę, potem ocena, która mówi, jak bardzo reguła się myli, a na koniec trening, w którym reguła sama znajduje swoje liczby. Każdy wzór pojawia się dopiero po rachunkach, które podsumowuje, więc każdy policzysz ręcznie, zanim zobaczysz go zapisanego symbolami, a kod aż do samego końca jest zwykłym Pythonem.
