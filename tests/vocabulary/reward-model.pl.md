# Model nagrody

## Dlaczego dane o preferencjach zbiera się jako porównania, a nie oceny w skali od 1 do 10?

- [x] Ludzie dużo pewniej wskazują, która z dwóch odpowiedzi jest lepsza
- [ ] Porównania w ogóle nie wymagają ludzi
- [ ] Model nagrody nie potrafi zwrócić liczby
- [ ] Oceny w skali od 1 do 10 zajmują za dużo miejsca

Ludzie są niekonsekwentni, gdy mają ocenić odpowiedź w skali od 1 do 10, ale konsekwentni, gdy wybierają lepszą z dwóch.

## Co zwraca model nagrody?

- [ ] Lepszą wersję odpowiedzi
- [ ] Prawdopodobieństwo następnego tokenu
- [ ] Tak albo nie: czy odpowiedź jest poprawna
- [x] Jedną liczbę: ocenę $r(x, y)$ odpowiedzi $y$ na prompt $x$

To zwykle model językowy, którego ostatnią warstwę zastąpiono taką, która zwraca jedną liczbę.

## Jak trenuje się model nagrody?

- [ ] Tak, żeby każda odpowiedź dostawała ocenę 10
- [x] Tak, żeby odpowiedź preferowana dostawała wyższą ocenę niż odrzucona
- [ ] Tak, żeby odtwarzał oceny w skali od 1 do 10, które dali ludzie
- [ ] Tak, żeby krótsze odpowiedzi dostawały wyższe oceny

Funkcja straty $-\log \sigma\big(r(x, y_w) - r(x, y_l)\big)$ jest tym mniejsza, im większa jest różnica we właściwą stronę.

## Co sprawia, że wytrenowany model nagrody przydaje się w RLHF?

- [ ] Pisze odpowiedzi, z których uczy się polityka
- [ ] Porównuje każdą odpowiedź ze znanym rozwiązaniem
- [x] Może ocenić miliony odpowiedzi bez udziału człowieka
- [ ] Sprawia, że polityka jest odporna na hakowanie nagrody

Zbieranie ludzkiej oceny każdej odpowiedzi podczas RL byłoby o wiele za wolne i za drogie.

## Jakie ryzyko niesie trenowanie polityki z modelem nagrody?

- [ ] Model nagrody stopniowo zapomina, czego się nauczył
- [x] Model nagrody tylko przybliża ludzki osąd, a polityka wykorzysta jego błędy
- [ ] Żadne, bo model nagrody uczył się od ludzi
- [ ] Polityka przestaje cokolwiek pisać

To hakowanie nagrody: wysokie oceny od modelu nagrody bez jakości, którą miały mierzyć.
