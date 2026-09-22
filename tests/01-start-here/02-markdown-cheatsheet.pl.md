# Ściąga z Markdowna

## Na co zamienia się `$\hat{y} = wx + b$` w lekcji?

- [ ] Na wzór wyświetlany osobno, we własnym wierszu
- [x] Na wzór w tekście, który KaTeX zamienia na gotowy wzór podczas budowania strony
- [ ] Na kod pisany czcionką o stałej szerokości
- [ ] Na zwykły tekst, razem ze znakami dolara

Pojedyncze znaki dolara dają wzór w tekście, a podwójne wzór wyświetlany osobno, we własnym wierszu. KaTeX zamienia oba na gotowe wzory podczas budowania strony.

## Co rozpoczyna ramkę z ostrzeżeniem?

- [ ] `**Ostrzeżenie:**` na początku akapitu
- [ ] `:::warning` w osobnym wierszu
- [x] `> [!WARNING]` w pierwszym wierszu cytatu
- [ ] `<warning>` wokół tekstu

Ramka z uwagą to cytat, którego pierwszy wiersz to `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` albo `[!CAUTION]`. GitHub rozumie tę samą składnię.

## Jak włączyć kolorowanie składni w bloku kodu?

- [x] Podać nazwę języka zaraz za otwierającymi znakami `` ``` ``, na przykład `python`
- [ ] Wciąć kod o cztery spacje
- [ ] Dopisać język do frontmattera lekcji
- [ ] Otoczyć kod znacznikami `<code>`

Nazwa za otwierającymi znakami mówi stronie, jaki język pokolorować.

## Po co w pytaniu kontrolnym zostawiać pusty wiersz po `<summary>` i przed `</details>`?

- [ ] Żeby odpowiedź była na początku schowana
- [x] Żeby odpowiedź była czytana jako Markdown
- [ ] Żeby pytanie pojawiło się w spisie treści
- [ ] Żeby GitHub pogrubił pytanie

Bez pustych wierszy odpowiedź jest czytana jako surowy HTML, więc Markdown w niej, na przykład `**pogrubienie**` albo wzory, nie zamienia się w formatowanie. Odpowiedź i tak jest schowana, bo robi to element `<details>`.

## Co robi `[^cauchy]` na końcu zdania?

- [ ] Linkuje do lekcji o nazwie Cauchy
- [ ] Zamienia poprzedzające słowo w indeks górny
- [ ] Wstawia cytat z pliku z bibliografią
- [x] Dodaje numerowany link do przypisu, którego treść podaje się w wierszu zaczynającym się od `[^cauchy]:`

Treść przypisu może się znaleźć w dowolnym miejscu pliku, a na stronie pojawia się na samym dole.
