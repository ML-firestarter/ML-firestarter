# Model bazowy

## Czego nauczył się model bazowy?

- [x] Przewidywać następny token tekstu
- [ ] Wykonywać polecenia i prowadzić rozmowę
- [ ] Odmawiać spełnienia szkodliwych próśb
- [ ] Wyszukiwać fakty w bazie danych

Pretrening uczy go jednej rzeczy: przewidywania następnego tokenu w ogromnej ilości tekstu. Wykonywania poleceń model uczy się później, w post-trainingu.

## Co może zrobić model bazowy, gdy dostanie „Napisz haiku o morzu.”?

- [ ] Odmówić, bo nikt go nie nauczył wykonywać poleceń
- [x] Dopisać „Napisz haiku o górach.”, jakby prompt był częścią listy ćwiczeń z pisania
- [ ] Odpowiedzieć komunikatem o błędzie
- [ ] Zawsze napisać haiku, bo wie, czym jest haiku

Model bazowy kontynuuje tekst, a kolejne ćwiczenie z pisania to prawdopodobna kontynuacja. Może napisać haiku, ale nic go nie skłania, żeby potraktował prompt jak polecenie.

## Co zamienia model bazowy w model czatowy?

- [ ] Dalszy pretrening na większej ilości tekstu
- [ ] Większe okno kontekstowe
- [x] Post-training
- [ ] Kwantyzacja

Post-training zamienia model bazowy w model instrukcyjny albo czatowy, który wykonuje polecenia i prowadzi rozmowę.

## Skąd pochodzi wiedza modelu bazowego?

- [ ] Z post-trainingu na przykładach dobrych odpowiedzi
- [x] Z przewidywania następnego tokenu w ogromnej ilości tekstu podczas pretreningu
- [ ] Z faktów, które jego twórcy wpisali ręcznie
- [ ] Z wyszukiwarki, którą odpytuje podczas odpowiadania

Żeby dobrze przewidywać tekst, trzeba znać gramatykę i fakty, a także trochę rozumować, więc model bazowy dużo wie. Post-training zmienia to, jak korzysta z tej wiedzy.

## Do czego wciąż przydają się modele bazowe?

- [ ] Do rozmów z użytkownikami, bo są bezpieczniejsze od modeli czatowych
- [ ] Do odpowiadania na pytania o najnowsze wydarzenia
- [ ] Do wykonywania poleceń dokładniej niż modele czatowe
- [x] Jako punkt wyjścia do własnego dostrajania

Model bazowy dużo wie, ale nie jest jeszcze asystentem, więc dobrze nadaje się na punkt wyjścia do własnego dostrajania.
