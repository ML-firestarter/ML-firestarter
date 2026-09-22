# Regresja liniowa

## Czym jest $b$ w $\hat{y} = w x + b$?

- [ ] Nachyleniem prostej
- [x] Wyrazem wolnym, czyli miejscem, w którym prosta przecina oś $y$
- [ ] Współczynnikiem uczenia
- [ ] Średnim błędem na danych treningowych

$w$ to waga, która ustala nachylenie, a $b$ to wyraz wolny, który przesuwa prostą w górę albo w dół. To predykcja dla $x = 0$.

## Jak błąd średniokwadratowy ocenia prostą?

- [ ] Sumuje różnice między predykcjami a etykietami, razem z ich znakami
- [ ] Liczy przykłady, przez które prosta nie przechodzi
- [x] Uśrednia kwadraty różnic między predykcjami a etykietami
- [ ] Mierzy, jak stroma jest prosta

$L = \frac{1}{n} \sum_{i=1}^{n} (\hat{y}_i - y_i)^2$. Dzięki kwadratom błędy nad prostą i pod nią nie znoszą się nawzajem, a duże pomyłki są karane mocniej niż małe. Najlepsza prosta ma najmniejsze $L$.

## Dlaczego spadek gradientu robi krok *przeciwnie* do gradientu?

- [x] Gradient wskazuje pod górę, w stronę większej straty
- [ ] Krok w przeciwną stronę utrzymuje mały współczynnik uczenia
- [ ] Gradient wskazuje prosto na minimum, więc krok w przeciwną stronę chroni przed jego przeskoczeniem
- [ ] Oba kierunki zmniejszają stratę, a przeciwny to tylko konwencja

Gradient wskazuje kierunek, w którym strata rośnie najszybciej. Mały krok w przeciwną stronę ją zmniejsza.

## Strata rośnie i skacze z kroku na krok. Co warto spróbować?

- [ ] Zwiększyć współczynnik uczenia
- [ ] Trenować przez więcej kroków
- [x] Zmniejszyć współczynnik uczenia
- [ ] Usunąć wyraz wolny

Każdy krok przeskakuje minimum, więc współczynnik uczenia jest za duży. Gdy strata prawie się nie zmienia, jest odwrotnie: współczynnik uczenia jest za mały.

## Przykład w NumPy z lekcji trenuje ze współczynnikiem uczenia 0,01. Co się stanie przy 0,05?

- [ ] Trening zbiegnie mniej więcej pięć razy szybciej
- [ ] Prosta wyląduje dokładnie na $y = 3x + 2$
- [x] Trening się rozbiegnie: strata będzie rosła, aż przekroczy zakres liczb zmiennoprzecinkowych
- [ ] Nic się nie zmieni, bo współczynnik uczenia wpływa tylko na wyraz wolny

Przy 0,02 trening zbiega mniej więcej dwa razy szybciej. Przy 0,05 każdy krok przeskakuje minimum bardziej niż poprzedni.

## Po co spadek gradientu, skoro regresja liniowa ma rozwiązanie dokładne?

- [x] Rozwiązywanie równania normalnego robi się kosztowne przy wielu cechach
- [x] Większość modeli, od regresji logistycznej po sieci neuronowe, w ogóle nie ma dokładnego rozwiązania
- [ ] Spadek gradientu znajduje lepszą prostą niż równanie normalne
- [ ] Równanie normalne nie może uwzględnić wyrazu wolnego

W regresji liniowej obie metody znajdują tę samą prostą, a wyraz wolny obsługuje kolumna jedynek w $X$. Ale rozwiązywanie równania drożeje, gdy przybywa cech, a większość modeli w ogóle nie ma dokładnego rozwiązania. Spadek gradientu działa dla nich wszystkich.
