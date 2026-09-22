---
description: Jednostka tekstu, którą model językowy czyta i pisze, na przykład słowo, część słowa albo pojedynczy znak.
---

# Token

Modele nie widzą bezpośrednio liter ani słów. Tokenizator dzieli tekst na tokeny ze stałego słownika, zwykle liczącego od kilkudziesięciu do kilkuset tysięcy pozycji, a każdy token staje się liczbą, na której pracuje model. Częste słowa zwykle są jednym tokenem, a rzadsze dzielą się na kawałki.

Tokeny to jednostka stojąca za wieloma liczbami, które zobaczysz: wielkością [okna kontekstowego](context-window.pl.md) modelu, wielkością jego danych treningowych („wytrenowany na 15 bilionach tokenów”) i cenami API. W języku angielskim token to średnio około trzech czwartych słowa. Polskie słowa zwykle dzielą się na więcej tokenów, więc ten sam tekst po polsku zajmuje ich więcej.

**Przykład:** angielskie zdanie „Tokenization is unbelievable” może zostać podzielone na `Token` `ization` ` is` ` un` `believ` `able`. Wiele tokenów zawiera spację przed słowem, a dokładny podział zależy od tokenizatora.

**Powiązane:** [Okno kontekstowe](context-window.pl.md) · [Pretrening](pretraining.pl.md) · [Model bazowy](base-model.pl.md) · [Inferencja](inference.pl.md) · [Model przychodów](revenue-model.pl.md)
