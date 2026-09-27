# Mierzenie błędu

## Prosta przewiduje opłatę 20, a na paragonie jest 23. Ile wynosi błąd $\hat{y} - y$?

- [x] −3
- [ ] 3
- [ ] 9
- [ ] 43

Błąd to predykcja minus prawdziwa opłata: 20 − 23 = −3. Jest ujemny, bo predykcja była za niska. 3 to odejmowanie w odwrotnej kolejności, a 9 to błąd podniesiony do kwadratu, co jest dopiero następnym krokiem.

## Błędy prostej na trzech kursach to 1, −2 i 1. Ile wynosi jej MSE?

- [x] 2
- [ ] 0
- [ ] 6
- [ ] 1,33

Po podniesieniu do kwadratu błędy to 1, 4 i 1, które sumują się do 6, a 6 ÷ 3 kursy = 2. Same błędy sumują się do 0, bo −2 znosi się z dwiema jedynkami, 6 to suma kwadratów przed podzieleniem przez liczbę kursów, a 1,33 to średnia błędów bez ich znaków, a nie średnia kwadratów.

## Dlaczego błędy podnosi się do kwadratu przed uśrednieniem?

- [x] Żeby błędy za wysokie i za niskie nie mogły się znosić
- [x] Żeby duże pomyłki liczyły się bardziej niż małe
- [ ] Żeby MSE był w złotych, tak jak opłaty
- [ ] Żeby MSE był zawsze liczbą całkowitą

Kwadrat nigdy nie jest ujemny, więc nic się nie znosi, a błąd 10 dodaje 100, podczas gdy błąd 2 tylko 4. MSE jest w złotych do kwadratu, a nie w złotych, i często nie jest liczbą całkowitą.

## Co zwykły punkt odniesienia przewiduje dla każdego kursu?

- [x] Średnią opłatę z paragonów
- [ ] Opłatę za najkrótszy kurs
- [ ] 0
- [ ] Opłatę, którą przewiduje reguła z naklejki

Punkt odniesienia ignoruje swoje wejście, więc przewiduje tę samą opłatę dla każdego kursu, a spośród takich płaskich prostych najmniejszy MSE ma ta na wysokości średniej opłaty. Model musi mieć lepszą ocenę niż punkt odniesienia, żeby pokazać, że nauczył się czegoś ze swojego wejścia.

## Na paragonach dziennych najlepsza prosta ma opłatę początkową 10, a nie 8 z naklejki. Dlaczego?

- [x] Paragony nie pokazują postoju, więc prosta dolicza jego średni koszt, 2, do każdej opłaty
- [ ] Ceny na naklejce są błędne
- [ ] MSE zawsze trochę zwiększa wyraz wolny
- [ ] Dłuższe kursy kosztują mniej za kilometr

Cztery kursy dzienne stały w korku średnio 4 minuty, a 4 minuty po 0,50 zł za minutę to 2. Prosta nie widzi postoju, więc najlepsze, co może zrobić, to doliczyć jego średni koszt do każdej opłaty. Z minutami jako drugą cechą model znalazłby ceny z naklejki.
