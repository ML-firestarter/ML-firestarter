# RL

## Na czym polega główna różnica między uczeniem nadzorowanym a uczeniem przez wzmacnianie?

- [x] W RL nikt nie podaje poprawnej odpowiedzi; uczący się system dostaje tylko nagrodę, która mówi, jak dobrze poszło
- [ ] RL nie używa żadnych danych
- [ ] RL działa tylko w grach
- [ ] Uczenie nadzorowane potrzebuje modelu nagrody

W uczeniu nadzorowanym każdy przykład ma poprawną odpowiedź. W RL uczący się system musi znaleźć dobre działania metodą prób i błędów.

## Nagroda może przyjść długo po działaniach, które do niej doprowadziły. Co musi zrobić uczący się system?

- [ ] Ignorować nagrody, które przychodzą późno
- [ ] Czekać z nauką do końca treningu
- [ ] Prosić o poprawną odpowiedź po każdym działaniu
- [x] Sam ustalić, którym działaniom należy się zasługa

To w dużej mierze sprawia, że RL jest trudne.

## Agent uczy się gry wideo. Co jest jego nagrodą?

- [ ] Ekran, który widzi
- [ ] Przyciski, które naciska
- [x] Zmiana wyniku punktowego
- [ ] Sama gra

Ekran to stan, przyciski to działania, a gra to środowisko.

## Skąd pochodzi nagroda, gdy RL stosuje się do modeli językowych?

- [x] Od modelu nagrody, w RLHF
- [ ] Z następnego tokenu w tekście treningowym
- [x] Ze sprawdzenia odpowiedzi, w RLVR
- [ ] Z idealnej odpowiedzi do naśladowania

Przewidywanie następnego tokenu istniejącego tekstu to pretrening, a naśladowanie idealnych odpowiedzi to SFT.

## Jaki jest cel uczenia przez wzmacnianie?

- [ ] Model, który dokładnie kopiuje działania ekspertów
- [ ] Model nagrody, który zgadza się z ludźmi
- [x] Polityka, która zbiera jak najwięcej nagrody
- [ ] Środowisko, które daje każdemu działaniu tę samą nagrodę

PPO i GRPO to dwa szeroko stosowane algorytmy, które prowadzą do tego celu w modelach językowych.
