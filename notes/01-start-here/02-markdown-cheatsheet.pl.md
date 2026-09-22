---
description: Wszystko, czego można użyć w lekcji, od wzorów i kodu po ramki z uwagami i pytania kontrolne.
---

# Ściąga z Markdowna

Lekcje pisze się w [GitHub Flavored Markdown](https://github.github.com/gfm/), z dodatkiem wzorów matematycznych. GitHub rozumie tę samą składnię, więc notatki wyglądają dobrze w obu miejscach.

## Tekst

`**pogrubienie**` daje **pogrubienie**, `*kursywa*` daje *kursywę*, `~~skreślenie~~` daje ~~skreślenie~~, a `` `kod` `` daje `kod`. Wiersz, w którym jest tylko `---`, rysuje poziomą linię podziału.

## Wzory

Wzory w tekście umieść między pojedynczymi znakami dolara, a wzory wyświetlane osobno między podwójnymi. KaTeX zamienia je na gotowe wzory podczas budowania strony.

```md
Strata wynosi $L(w) = \frac{1}{n}\sum_i (w x_i - y_i)^2$.

$$
\frac{\partial L}{\partial w} = \frac{2}{n} \sum_{i=1}^{n} (w x_i - y_i)\, x_i
$$
```

Strata wynosi $L(w) = \frac{1}{n}\sum_i (w x_i - y_i)^2$.

$$
\frac{\partial L}{\partial w} = \frac{2}{n} \sum_{i=1}^{n} (w x_i - y_i)\, x_i
$$

## Kod

Podaj nazwę języka zaraz za otwierającymi znakami `` ``` ``, a kod dostanie kolorowanie składni:

```python
import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))
```

## Ramki z uwagami

Zacznij cytat od `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` albo `[!CAUTION]`. Na stronie nagłówek ramki pojawi się w języku notatki:

```md
> [!TIP]
> Zanim przejdziesz dalej, wyjaśnij nowy pomysł na głos.
```

> [!NOTE]
> **Cecha** to jedna zmienna wejściowa, na przykład powierzchnia domu.

> [!TIP]
> Zanim sięgniesz po sprytny model, sprawdź prosty punkt odniesienia (ang. baseline), żeby wiedzieć, jak wygląda „dobry” wynik.

> [!IMPORTANT]
> Nigdy nie dobieraj ustawień modelu na podstawie zbioru testowego.

> [!WARNING]
> Cechy o bardzo różnych skalach spowalniają spadek gradientu. Najpierw je ustandaryzuj.

> [!CAUTION]
> Wyciek danych (ang. data leakage), czyli informacje ze zbioru testowego przedostające się do treningu, sprawia, że wyniki wyglądają lepiej, niż są naprawdę.

## Tabele

```md
| Model                | Przewiduje         | Typowa funkcja straty  |
| -------------------- | ------------------ | ---------------------- |
| Regresja liniowa     | liczbę             | błąd średniokwadratowy |
```

| Model                | Przewiduje         | Typowa funkcja straty                      |
| -------------------- | ------------------ | ------------------------------------------ |
| Regresja liniowa     | liczbę             | błąd średniokwadratowy                     |
| Regresja logistyczna | prawdopodobieństwo | entropia krzyżowa                          |
| k-średnich           | skupienie          | suma kwadratów odległości wewnątrz skupień |

## Listy zadań

```md
- [x] Przeczytać lekcję
- [ ] Powtórzyć wyprowadzenie na papierze
```

- [x] Przeczytać lekcję
- [ ] Powtórzyć wyprowadzenie na papierze
- [ ] Uruchomić kod z innym współczynnikiem uczenia

## Pytania kontrolne

Schowaj odpowiedź, żeby najpierw samodzielnie spróbować odpowiedzieć. Zostaw pusty wiersz po `<summary>` i przed `</details>`, żeby odpowiedź była czytana jako Markdown:

```html
<details>
<summary>Dlaczego podnosimy błędy do kwadratu?</summary>

Twoja odpowiedź w Markdownie.

</details>
```

<details>
<summary>Dlaczego podnosimy błędy do kwadratu, zamiast po prostu je zsumować?</summary>

Dodatnie i ujemne błędy znosiłyby się nawzajem. Kwadrat sprawia, że liczy się każdy błąd, duże błędy są karane mocniej niż małe, a funkcja wychodzi gładka i łatwo ją zróżniczkować.

</details>

## Przypisy

```md
Metoda spadku gradientu pochodzi od Cauchy’ego.[^cauchy]

[^cauchy]: A.-L. Cauchy, 1847.
```

Metoda spadku gradientu pochodzi od Cauchy’ego.[^cauchy]

## Linki i obrazy

- Do lekcji linkuj przez ścieżkę jej pliku: [Czym jest uczenie maszynowe?](../02-foundations/01-what-is-machine-learning.pl.md)
- Do rozdziału linkuj przez jego folder: [Podstawy](../02-foundations/)
- Obraz dodasz za pomocą `![Co przedstawia](images/plot.png)`. Przykład znajdziesz w lekcji [Regresja liniowa](../02-foundations/02-linear-regression.pl.md).

[^cauchy]: Augustin-Louis Cauchy, „Méthode générale pour la résolution des systèmes d’équations simultanées”, 1847.
