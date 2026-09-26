# Czym jest uczenie maszynowe?

## Czym uczenie maszynowe różni się od zwykłego programowania?

- [ ] Piszesz dokładniejsze reguły, więc program popełnia mniej błędów
- [x] Dajesz komputerowi przykłady z poprawnymi wynikami, a on sam wypracowuje reguły
- [ ] Komputer pisze przykłady, a ty sprawdzasz jego reguły
- [ ] Nie potrzeba danych, bo reguły są wbudowane w algorytm

W zwykłym programowaniu reguły piszesz ty. W uczeniu maszynowym algorytm uczący zamienia przykłady i odpowiedzi w model. Dlatego wyuczony filtr antyspamowy nadąża, gdy spamerzy zmieniają sformułowania, a ręcznie pisane reguły przestają działać.

## Grupujesz klientów według zachowań, bez żadnych etykiet. Jaki to rodzaj uczenia?

- [ ] Uczenie nadzorowane
- [ ] Uczenie przez wzmacnianie
- [x] Uczenie nienadzorowane
- [ ] Klasyfikacja

Uczenie nienadzorowane dostaje wejścia bez odpowiedzi i znajduje w nich strukturę. Uczenie nadzorowane potrzebuje odpowiedzi, a uczenie przez wzmacnianie środowiska i nagrody.

## Które z tych zadań to klasyfikacja?

- [x] Czy ten e-mail to spam?
- [ ] Za ile sprzeda się dom o danej powierzchni?
- [x] Jaka cyfra jest na tym obrazku?
- [ ] Jaka będzie jutro temperatura?

Klasyfikacja przewiduje kategorię. Regresja przewiduje liczbę, na przykład cenę albo temperaturę.

## Czym jest powierzchnia w zbiorze danych o domach?

- [x] Cechą
- [ ] Etykietą
- [ ] Parametrem
- [ ] Funkcją straty

Cecha to jeden pomiar wejściowy. Cena, którą chcesz przewidzieć, byłaby etykietą, a parametry to liczby wewnątrz modelu, które dostosowuje uczenie.

## Model wypada prawie idealnie na danych treningowych, ale słabo na nowych. Jak to się nazywa?

- [ ] Niedopasowanie
- [ ] Wyciek danych
- [ ] Uogólnianie
- [x] Nadmierne dopasowanie

Model zapamiętał dane treningowe, zamiast nauczyć się wzorców, które sprawdzają się też na nowych danych. Wychwycisz to na danych, na których model się nie uczył.

## Do czego służy zbiór walidacyjny?

- [ ] Do dopasowania parametrów modelu
- [x] Do porównywania modeli i dobierania ustawień, takich jak współczynnik uczenia
- [ ] Do jednorazowego oszacowania na samym końcu, jak model poradzi sobie z nowymi danymi
- [ ] Do zastąpienia zbioru treningowego, gdy model już go zapamięta

Zbiór treningowy służy do dopasowania parametrów, walidacyjny do porównywania modeli i dobierania ustawień, a testowy do jednej, końcowej oceny.

## Sprawdzasz model na zbiorze testowym, wynik ci się nie podoba, więc zmieniasz współczynnik uczenia i sprawdzasz jeszcze raz. W czym problem?

- [x] Zbiór testowy wpłynął na decyzję, więc przestał dawać uczciwą ocenę
- [ ] Nie ma problemu, dopóki zbiór treningowy się nie zmienia
- [ ] Współczynnik uczenia można dobierać tylko na zbiorze treningowym
- [ ] Przed każdym sprawdzeniem model trzeba wytrenować od zera

Gdy zbiór testowy wpłynie na jakąkolwiek decyzję, przestaje dawać uczciwą ocenę. Ustawienia dobieraj na zbiorze walidacyjnym, a testowy zostaw na sam koniec.
