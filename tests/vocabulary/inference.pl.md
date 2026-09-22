# Inferencja

## Czym różni się trening od inferencji?

- [ ] Inferencja to trening na nowych danych
- [x] Trening zmienia wagi; inferencja korzysta z nich bez zmian, żeby wytworzyć wyniki
- [ ] Inferencja trochę zmienia wagi przy każdym zapytaniu
- [ ] Trening działa na GPU, a inferencja na CPU

Za każdym razem, gdy wysyłasz chatbotowi wiadomość, model przeprowadza inferencję, żeby napisać odpowiedź. Jego wagi się przy tym nie zmieniają.

## Dlaczego API liczą sobie więcej za tokeny wyjściowe niż za wejściowe?

- [x] Prompt jest czytany w jednym równoległym przebiegu, a każdy token wyjściowy wymaga kolejnego przebiegu przez cały model
- [ ] Tokeny wyjściowe są dłuższe od wejściowych
- [ ] Tokeny wyjściowe są zapisywane, żeby wytrenować na nich następny model
- [ ] Tokeny wejściowe nie przechodzą przez model

Długie odpowiedzi trwają dłużej i więcej kosztują, bo model pisze je po jednym tokenie.

## Który krok w lekcji o regresji liniowej to inferencja?

- [ ] Znalezienie $w$ i $b$ na podstawie danych
- [ ] Obliczenie gradientu funkcji straty
- [x] Użycie $w$ i $b$ do przewidzenia $y$ dla nowego $x$
- [ ] Wybór współczynnika uczenia

Znalezienie $w$ i $b$ to trening. Użycie ich dla nowego wejścia to inferencja.

## Jak łączny koszt inferencji popularnego modelu może się mieć do kosztu jego treningu?

- [ ] Zawsze jest jego niewielkim ułamkiem
- [ ] Po wytrenowaniu modelu inferencja jest darmowa
- [ ] Oba koszty są zawsze mniej więcej równe
- [x] Może go przekroczyć, bo trening odbywa się raz, a inferencja przy każdym zapytaniu

Trening odbywa się raz, a inferencja przy każdym zapytaniu każdego użytkownika.

## Co sprawia, że inferencja jest tańsza albo szybsza?

- [x] Kwantyzacja
- [x] Mniejsze modele
- [ ] Dłuższe prompty
- [x] Grupowanie zapytań
- [ ] Więcej pretreningu

Pomagają mniejsze modele, kwantyzacja, grupowanie zapytań i lepszy sprzęt, a praca nad nimi to duża część inżynierii ML. Każdy dodatkowy token w prompcie zwiększa koszt.
