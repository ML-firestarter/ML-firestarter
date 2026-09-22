# Pretrening

## Co model językowy robi podczas pretreningu w każdym miejscu tekstu?

- [ ] Odpowiada na pytanie napisane przez człowieka
- [x] Przewiduje następny token
- [ ] Porównuje dwie możliwe odpowiedzi
- [ ] Streszcza dotychczasowy tekst

Czyta biliony tokenów tekstu, takiego jak strony internetowe, książki i kod, i w każdym miejscu przewiduje następny token.

## Dlaczego pretrening nazywa się uczeniem *samonadzorowanym*?

- [ ] Model sam pisze swoje dane treningowe
- [ ] Model sprawdza swoje odpowiedzi narzędziami
- [ ] Nie potrzebuje funkcji straty
- [x] Odpowiedzi dostarcza sam tekst, więc nikt nie musi niczego etykietować

Następny token to odpowiedź, a ta jest już w tekście.

## Jakie przykłady treningowe daje zdanie „Kot siedzi na macie”, jeśli każde słowo to jeden token?

- [ ] Jeden: całe zdanie
- [x] Kilka: przewidzieć „siedzi” po „Kot”, „na” po „Kot siedzi” i tak dalej
- [ ] Żadnych, bo nikt nie oznaczył tego zdania
- [ ] Dwa: pierwszą i drugą połowę zdania

Każde miejsce w tekście to osobny przykład, więc jedno zdanie daje ich naraz kilka.

## Jaka jest funkcja straty w pretreningu?

- [ ] Błąd średniokwadratowy między przewidzianymi a prawdziwymi słowami
- [ ] Ocena od modelu nagrody
- [x] Entropia krzyżowa, która jest niska, gdy model dał wysokie prawdopodobieństwo tokenowi, który rzeczywiście pojawił się jako następny
- [ ] Liczba słów, które model przewidział źle

Spadek gradientu ją obniża, tak jak w lekcji o regresji liniowej, tylko z miliardami parametrów zamiast dwóch.

## Który etap treningu jest zwykle najdroższy w przypadku dużego modelu?

- [x] Pretrening
- [ ] SFT
- [ ] RLHF
- [ ] DPO

Pretrening to tygodnie albo miesiące pracy tysięcy GPU. Post-training tradycyjnie zużywał niewielki ułamek tej mocy obliczeniowej.
