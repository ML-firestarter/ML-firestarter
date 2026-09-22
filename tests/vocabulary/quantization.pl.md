# Kwantyzacja

## Co robi kwantyzacja?

- [ ] Usuwa najmniej ważne wagi
- [ ] Trenuje mniejszy model, żeby naśladował większy
- [x] Zapisuje wagi na mniejszej liczbie bitów, na przykład 8 albo 4 zamiast 16
- [ ] Dzieli prompt na mniej tokenów

Wagi są zaokrąglane do niewielkiego zbioru poziomów, więc każda zajmuje mniej bitów.

## Ile pamięci potrzebują wagi modelu o 70 mld parametrów przy 4 bitach?

- [ ] Około 140 GB
- [ ] Około 70 GB
- [x] Około 35 GB
- [ ] Około 280 GB

4 bity to pół bajta, więc 70 mld wag zajmuje około 35 GB. Przy 16 bitach to 140 GB, a przy 8 bitach 70 GB.

## Dlaczego kwantyzacja często przyspiesza inferencję, a nie tylko zmniejsza model?

- [x] Generowanie tekstu jest zwykle ograniczone tym, jak szybko da się odczytywać wagi z pamięci
- [ ] Skwantyzowany model ma mniej warstw
- [ ] Skwantyzowane modele piszą krótsze odpowiedzi
- [ ] GPU pomija każdą wagę zaokrągloną do zera

Mniej bitów to mniej danych do odczytania przy każdym tokenie, który pisze model.

## Jaka jest cena kwantyzacji?

- [ ] Żadna: skwantyzowany model daje dokładnie te same odpowiedzi
- [x] Pewna utrata dokładności: 8 bitów zwykle daje prawie to samo co oryginał, a przy 4 bitach i mniej strata jest większa
- [ ] Modelu nie da się już dostroić
- [ ] Potrzebne jest większe okno kontekstowe

To, ile się traci, zależy od modelu i metody.

## Liczba 4-bitowa ma tylko 16 możliwych wartości. Jak skwantyzowane wagi zachowują właściwy zakres?

- [ ] Każda waga jest zapisywana dwa razy
- [ ] Po zaokrągleniu model trenuje się od nowa
- [ ] Wszystkie wagi są przycinane do zakresu od −8 do 7
- [x] Każda mała grupa wag przechowuje współczynnik skali, który przekłada wartości z powrotem na właściwy zakres

Dzięki współczynnikowi skali tymi samymi 16 poziomami da się opisać duże wagi w jednej grupie i małe w innej.
