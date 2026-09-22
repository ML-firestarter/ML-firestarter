# Token

## Czym jest token?

- [ ] Zawsze dokładnie jednym słowem
- [ ] Zawsze dokładnie jednym znakiem
- [x] Jednostką tekstu, którą model czyta i pisze, na przykład słowem, częścią słowa albo pojedynczym znakiem
- [ ] Jednostką płatności za korzystanie z API

Tokenizator dzieli tekst na tokeny ze stałego słownika, a każdy token staje się liczbą, na której pracuje model. Ceny API liczy się w tokenach, ale token nie jest płatnością.

## Co zwykle dzieje się z rzadkim słowem podczas tokenizacji?

- [x] Dzieli się je na kilka kawałków
- [ ] Jest jednym tokenem, jak częste słowo
- [ ] Usuwa się je z tekstu
- [ ] Za każdym razem jest rozpisywane po jednej literze na token

Częste słowa zwykle są jednym tokenem, a rzadsze dzielą się na kawałki ze słownika.

## Ile tekstu to średnio jeden token w języku angielskim?

- [ ] Jedna litera
- [ ] Dokładnie jedno słowo
- [ ] Około czterech słów
- [x] Około trzech czwartych słowa

Tak więc 1000 tokenów mieści mniej więcej 750 angielskich słów. Polskie słowa zwykle dzielą się na więcej tokenów, więc ten sam tekst po polsku zajmuje ich więcej.

## Co z tego liczy się w tokenach?

- [x] Wielkość okna kontekstowego modelu
- [x] Wielkość jego danych treningowych
- [x] Ceny API
- [ ] Wielkość samego modelu

Wielkość modelu to liczba jego parametrów, jak w „model o 70 mld parametrów”.

## Angielskie zdanie „Tokenization is unbelievable” może zostać podzielone na `Token` `ization` ` is` ` un` `believ` `able`. Co to pokazuje?

- [x] Wiele tokenów zawiera spację przed słowem
- [ ] Każda sylaba to jeden token
- [x] Rzadsze słowa dzielą się na kawałki
- [ ] Każdy tokenizator dzieli to zdanie tak samo

Dokładny podział zależy od tokenizatora.
