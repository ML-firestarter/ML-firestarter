# Halucynacja

## Czym jest halucynacja?

- [ ] Odmową udzielenia odpowiedzi
- [ ] Zmyśloną historią, o którą poprosił użytkownik
- [x] Fałszywym albo zmyślonym stwierdzeniem, które model przedstawia jako fakt
- [ ] Odpowiedzią, która nie mieści się w oknie kontekstowym

Gdy model czegoś nie wie, może wypełnić lukę płynną, pewną siebie, ale błędną odpowiedzią. Historia, o którą prosisz, nie jest halucynacją, bo nie jest przedstawiana jako fakt.

## Dlaczego modele językowe halucynują?

- [x] Pretrening nagradza tekst, który wygląda poprawnie, a model nie ma wbudowanego sposobu, żeby sprawdzać fakty
- [ ] Są trenowane głównie na fałszywym tekście
- [ ] Kwantyzacja dodaje do ich odpowiedzi losowe błędy
- [ ] Ich okno kontekstowe jest za małe, żeby zmieścić fakty

Wiarygodnie brzmiąca odpowiedź nie zawsze jest prawdziwa, a model nie potrafi odróżnić tego, co wie, od tego, co zgaduje.

## Czy post-training może całkowicie wyeliminować halucynacje?

- [ ] Tak, jeśli nauczy model mówić „nie wiem”
- [ ] Tak, przy odpowiednio dużej ilości RLHF
- [x] Nie: sprawia, że są rzadsze, a nie niemożliwe
- [ ] Nie, bo post-training sprawia, że są częstsze

Post-training może nauczyć model częściej mówić „nie wiem”, ale to sprawia tylko, że halucynacje są rzadsze.

## Co ogranicza halucynacje?

- [x] Podanie modelowi faktów w prompcie i prośba, żeby je cytował
- [ ] Prośba, żeby model brzmiał pewniej
- [x] Pozwolenie modelowi, żeby sprawdzał swoją pracę narzędziami, takimi jak wyszukiwarka albo uruchomienie napisanego przez niego kodu
- [ ] Prośba o dłuższe odpowiedzi

Pomaga oparcie modelu na prawdziwym tekście, na przykład za pomocą RAG, i pozwolenie mu na sprawdzanie własnej pracy. Pomaga też samodzielne sprawdzanie ważnych twierdzeń.

## Model podaje ci trzy artykuły na niszowy temat, z wiarygodnymi tytułami, autorami i latami wydania. Co warto zrobić?

- [ ] Zaufać im, bo szczegóły są bardzo konkretne
- [ ] Zapytać model, czy jest pewien, i zaufać jego odpowiedzi
- [x] Sprawdzić, czy każdy z artykułów istnieje, zanim się na nim oprzesz
- [ ] Zaufać im, bo model powiedziałby, gdyby nie wiedział

Wiarygodne szczegóły nie są dowodem. W przykładzie z lekcji dwa z trzech artykułów istnieją, a trzeciego nikt nigdy nie napisał. Nazwiska, liczby, cytaty i źródła sprawdzaj samodzielnie.
