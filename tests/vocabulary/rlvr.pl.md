# RLVR

## Co sprawia, że nagroda jest weryfikowalna?

- [ ] Człowiek sprawdził model nagrody
- [ ] Model mówi, że jest pewien odpowiedzi
- [x] Program potrafi sprawdzić odpowiedź, na przykład porównując ją ze znanym wynikiem albo uruchamiając testy
- [ ] Model nagrody jest bardzo dokładny

Niektóre zadania mają odpowiedzi, które program potrafi sprawdzić, więc nagroda może po prostu wynosić 1, gdy odpowiedź jest poprawna, i 0, gdy nie jest.

## Model dostaje pytanie „Ile to jest 17 × 24?”, rozpisuje swoje rozumowanie i odpowiada 408. Jaka jest jego nagroda?

- [x] 1
- [ ] 0
- [ ] 408
- [ ] Taka, jaką da mu model nagrody

17 × 24 = 408, więc odpowiedź jest poprawna, a nagroda wynosi 1. Każda inna ostateczna odpowiedź dostałaby 0.

## Do jakich zadań nadaje się RLVR?

- [x] Do zadań matematycznych ze znanym wynikiem końcowym
- [ ] Do pisania przyjaznego e-maila
- [x] Do pisania kodu, który da się uruchomić z testami
- [ ] Do ciekawego streszczania powieści

RLVR potrzebuje odpowiedzi, które program potrafi sprawdzić. Przyjazny ton albo ciekawy styl to kwestie oceny, w których lepiej sprawdzają się preferencje, jak w RLHF albo DPO.

## Czy weryfikowalną nagrodę da się zhakować?

- [ ] Nie, bo sprawdza ją program
- [ ] Tak, łatwiej niż model nagrody
- [x] Tak, choć dużo trudniej ją oszukać niż wyuczony model nagrody
- [ ] Tylko wtedy, gdy model jest mały

Model nagradzany za przechodzenie testów jednostkowych może się nauczyć obsługiwać przypadki z testów osobno, zamiast naprawić kod.

## Czego modele rozumujące uczą się z RL na wielu sprawdzalnych problemach?

- [ ] Nowych faktów o świecie
- [ ] Kopiowania słowo w słowo rozwiązań napisanych przez ludzi
- [ ] Udzielania jak najkrótszych odpowiedzi
- [x] Długiego myślenia, sprawdzania swojej pracy i próbowania innego podejścia, gdy utkną

DeepSeek-R1 to znany, otwarcie opisany przykład.
