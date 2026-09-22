# Embedding

## Czym jest embedding?

- [ ] Numerem tokenu w słowniku modelu
- [x] Listą liczb, która reprezentuje fragment treści tak, że podobne rzeczy dostają podobne liczby
- [ ] Skompresowaną kopią tekstu, z której można go odtworzyć
- [ ] Krótkim streszczeniem tekstu napisanym przez model

Model embeddingów jest trenowany tak, żeby rzeczy o podobnym znaczeniu lądowały blisko siebie.

## „Jak zresetować hasło?” i „Nie pamiętam danych logowania” nie mają prawie żadnych wspólnych słów. Co z ich embeddingami?

- [ ] Są daleko od siebie, bo słowa są inne
- [ ] Są identyczne
- [x] Są skierowane niemal w tę samą stronę
- [ ] Nie da się ich porównać, bo zdania mają różną długość

Embeddingi oddają znaczenie, a nie sformułowanie, więc dwa sposoby zadania tego samego pytania dostają podobne wektory.

## Dwa wektory wskazują dokładnie ten sam kierunek. Ile wynosi ich podobieństwo kosinusowe?

- [x] 1
- [ ] 0
- [ ] −1
- [ ] To zależy od długości wektorów

Podobieństwo kosinusowe to kosinus kąta między wektorami. Wynosi 1, gdy wskazują ten sam kierunek, i jest tym mniejsze, im mniej mają ze sobą wspólnego. Dzielenie przez obie długości sprawia, że liczy się tylko kierunek.

## Do czego używa się embeddingów?

- [x] Do wyszukiwania semantycznego
- [ ] Do sprawdzania, czy odpowiedź modelu jest poprawna
- [x] Do znajdowania fragmentów, które trafią do promptu w RAG
- [x] Do zamiany każdego tokenu w wektor w pierwszej warstwie modelu językowego

Embeddingi napędzają wyszukiwanie semantyczne, rekomendacje, grupowanie i etap wyszukiwania w RAG, a modele językowe używają ich też w środku.

## Centrum pomocy chce znajdować właściwe artykuły dla każdego pytania. Dla czego oblicza embeddingi i kiedy?

- [ ] Tylko dla pytań, a artykuły przeszukuje według słów kluczowych
- [x] Dla każdego artykułu raz, z góry, a dla każdego pytania, gdy przychodzi
- [ ] Dla każdego artykułu od nowa przy każdym nowym pytaniu
- [ ] Tylko dla artykułów, a potem prosi model, żeby wybrał jeden

Wektory artykułów oblicza się raz i zapisuje. Embedding pytania liczy się, gdy pytanie przychodzi, a potem zwraca się artykuły o najbliższych wektorach, nawet jeśli używają innych słów.
