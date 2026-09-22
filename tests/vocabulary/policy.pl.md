# Polityka

## Czym jest polityka w uczeniu przez wzmacnianie?

- [ ] Zasadami środowiska
- [ ] Funkcją, która oblicza nagrodę
- [x] Strategią, która na podstawie tego, co agent obserwuje, wybiera działanie
- [ ] Limitem liczby działań, które agent może wykonać

Polityka przyporządkowuje stanowi działanie, zwykle jako prawdopodobieństwa wszystkich możliwych działań, i zapisuje się ją jako $\pi(a \mid s)$.

## Co jest działaniem w przypadku modelu językowego?

- [x] Napisanie następnego tokenu
- [ ] Zmiana jego wag
- [ ] Przeczytanie promptu
- [ ] Wybór modelu nagrody

Stanem jest prompt razem z dotychczas napisanym tekstem, a każdym działaniem następny token.

## Dlaczego artykuły o RLHF nazywają trenowany model „polityką”?

- [ ] Decyduje, na których promptach trenować
- [ ] Pilnuje polityki treści firmy
- [ ] Ocenia odpowiedzi innych modeli
- [x] Prawdopodobieństwa następnego tokenu, które podaje, są dokładnie polityką

Model przypisuje prawdopodobieństwo każdemu możliwemu następnemu tokenowi na podstawie dotychczasowego tekstu, a to właśnie robi polityka.

## Co uczenie przez wzmacnianie robi z polityką?

- [ ] Kopiuje działania z przykładów z etykietami
- [x] Sprawia, że działania prowadzące do większej nagrody stają się bardziej prawdopodobne
- [ ] Sprawia, że każde działanie jest równie prawdopodobne
- [ ] Usuwa każde działanie, które kiedykolwiek przyniosło niską nagrodę

Działania prowadzące do większej nagrody stają się bardziej prawdopodobne. Kopiowanie przykładów z etykietami to uczenie nadzorowane.

## Co robi polityka programu szachowego?

- [ ] Podaje końcowy wynik partii
- [ ] Sprawdza, czy ruchy są zgodne z zasadami
- [x] Patrzy na szachownicę i przypisuje każdemu dozwolonemu ruchowi prawdopodobieństwo
- [ ] Przed każdym ruchem rozgrywa do końca każdą możliwą partię

Ruchy, które w trakcie treningu prowadziły do zwycięstw, z czasem stają się bardziej prawdopodobne.
