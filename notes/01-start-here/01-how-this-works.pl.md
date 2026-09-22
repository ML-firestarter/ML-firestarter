---
description: Jak pliki Markdown stają się lekcjami i jak wypchnięcie zmian na GitHuba aktualizuje stronę.
---

# Jak to działa

Ta strona powstaje z folderu `notes` w repozytorium ML-workout na GitHubie. Po każdym wypchnięciu zmian (ang. push) Netlify buduje stronę od nowa i publikuje nową wersję, zwykle w ciągu minuty.

## Lekcje i rozdziały

- Każdy plik `.md` w `notes/` to **lekcja**.
- Każdy folder to **rozdział**. Foldery w folderach stają się podrozdziałami.
- Plik `README.md` (albo `index.md`) nie jest lekcją, tylko wstępem na stronie swojego rozdziału. Ten, który leży bezpośrednio w `notes/`, jest wstępem na stronie głównej.

```text
notes/
├── README.md                        ← wstęp na stronie głównej
├── README.pl.md                     ← to samo po polsku
├── 01-start-here/
│   ├── README.md                    ← wstęp rozdziału
│   ├── 01-how-this-works.md         ← lekcja
│   ├── 01-how-this-works.pl.md      ← jej polskie tłumaczenie
│   └── 02-markdown-cheatsheet.md
├── 02-foundations/
│   ├── README.md
│   ├── 01-what-is-machine-learning.md
│   ├── 02-linear-regression.md
│   └── images/
│       └── linear-regression.svg
└── vocabulary/                      ← bez numerów: kolejność według tytułów
    ├── README.md
    ├── agent.md
    └── arr.md
```

## Kolejność i nazwy

Najpierw idą pliki i foldery, których nazwy zaczynają się od numeru, jak `01-`, `02-`, `03-`…, w kolejności numerów. Po nich jest cała reszta, alfabetycznie według tytułów, co pasuje do rozdziałów podręcznych, takich jak słownik. Numer nie trafia ani do adresu strony, ani do tytułu, więc `02-foundations/01-what-is-machine-learning.md` jest publikowany pod adresem `/foundations/what-is-machine-learning/`.

Tytuł lekcji pochodzi z pierwszego dostępnego źródła:

1. pola `title` we frontmatterze,
2. nagłówka `# Nagłówek` w pierwszym wierszu,
3. nazwy pliku: `03-gradient-descent.md` staje się „Gradient descent”.

Tytuł rozdziału to pierwszy nagłówek jego pliku `README.md`, a jeśli takiego nie ma, nazwa folderu.

> [!NOTE]
> Zmiana nazwy pliku zmienia adres strony, chyba że zmienia się tylko numer. Linki między notatkami dalej działają, bo są wyznaczane przy każdym budowaniu strony, ale lekcja o nowej nazwie traci znacznik ukończenia.

## Frontmatter

Opcjonalne ustawienia umieszcza się na samym początku pliku, między wierszami `---`:

```yaml
---
title: Spadek gradientu krok po kroku
description: Jednozdaniowe podsumowanie wyświetlane pod tytułem i na listach lekcji.
draft: true # ukrywa lekcję, dopóki nie usuniesz tego wiersza albo nie zmienisz wartości na false
---
```

## Linki i obrazy

Do innej notatki linkuj przez ścieżkę jej pliku, tak jak na GitHubie, na przykład `[Regresja liniowa](../02-foundations/02-linear-regression.pl.md)`. Taki link działa i na GitHubie, i na tej stronie. Dopisz `#nazwa-sekcji`, żeby przejść do konkretnego nagłówka, jak tutaj: [równanie normalne](../02-foundations/02-linear-regression.pl.md#równanie-normalne).

Obrazy trzymaj obok notatek (dobrze sprawdza się folder `images`) i podawaj do nich ścieżkę względną: `![Wykres punktowy](images/scatter.png)`.

## Tłumaczenia

Strona jest po angielsku i po polsku. Angielskie strony mają zwykłe adresy, jak `/vocabulary/sft/`, a polskie są pod `/pl/`, jak `/pl/vocabulary/sft/`. Przyciski **PL** i **EN** na górze przełączają na tę samą stronę w drugim języku.

Żeby przetłumaczyć notatkę, zapisz tłumaczenie obok niej, z kodem języka przed `.md`: `sft.pl.md` to polska wersja `sft.md`. Przetłumacz też plik `README.md` każdego rozdziału, bo z niego pochodzi tytuł rozdziału. Obrazy z tekstem mogą mieć własną przetłumaczoną kopię, jak `images/linear-regression.pl.svg` w polskiej lekcji o regresji liniowej.

- Strona, której jeszcze nie przetłumaczono, i tak pojawia się w polskiej wersji, tyle że po angielsku, z linkiem do dodania tłumaczenia na GitHubie.
- Na stronie link do `sft.md` i link do `sft.pl.md` prowadzą w to samo miejsce, czyli do strony w języku czytelnika. Mimo to w polskich notatkach linkuj do polskich plików, żeby linki działały też na GitHubie.
- Postęp jest wspólny: lekcja oznaczona jako ukończona w jednym języku jest ukończona także w drugim.

## Pisanie i publikowanie

1. Zmień notatkę. Każda lekcja ma link **Edytuj na GitHubie**, możesz też sklonować repozytorium i pracować w dowolnym edytorze.
2. Zrób commit i wypchnij zmiany na gałąź `main`.
3. Netlify zbuduje i opublikuje stronę. Jeśli coś jest nie tak z notatką (na przykład dwa pliki dostałyby ten sam adres), budowanie się nie powiedzie, w logu wdrożenia na Netlify pojawi się wyjaśnienie, a w sieci zostanie poprzednia wersja.

Żeby przed wypchnięciem zobaczyć zmiany na swoim komputerze, uruchom w folderze repozytorium:

```sh
npm install
npm run dev
```

Potem otwórz <http://localhost:4321>. Strony odświeżają się przy każdym zapisie pliku.

## Testy

Każda lekcja może mieć krótki test w zakładce **Testy**. Test to plik Markdown w folderze `tests`, pod tą samą ścieżką co jego lekcja w `notes`: `tests/vocabulary/sft.md` to test do `notes/vocabulary/sft.md`, a `tests/vocabulary/sft.pl.md` to jego polskie tłumaczenie. Test ma ten sam tytuł co jego lekcja.

Każdy nagłówek `## Nagłówek` w teście to pytanie. Lista zadań pod nim zawiera odpowiedzi: `[x]` przy dobrych i `[ ]` przy złych. Tekst pod listą to wyjaśnienie, które pojawia się po sprawdzeniu odpowiedzi:

```md
## Dlaczego SFT nazywa się dostrajaniem *nadzorowanym*?

- [x] Każdy przykład ma odpowiedź do naśladowania
- [ ] Ludzie obserwują model podczas treningu
- [ ] Model sam nadzoruje swój trening

W RL model dostaje za to tylko ocenę.
```

- Pytanie z kilkoma odpowiedziami oznaczonymi `[x]` dostaje pola wyboru i jest rozwiązane poprawnie tylko wtedy, gdy zaznaczysz dokładnie jego dobre odpowiedzi.
- Tekst, wzór, kod albo obraz między nagłówkiem a listą należy do pytania.
- Przy każdym podejściu odpowiedzi są w innej kolejności, więc unikaj odpowiedzi w rodzaju „Obie powyższe”.
- Test jest zaliczony, gdy dobrze odpowiesz na co najmniej 80% pytań. Próg zaliczenia to pole `passScore` w pliku `src/site.config.ts`.
- `draft: true` we frontmatterze ukrywa test, a test ukrytej lekcji też jest ukryty.
- Jeśli w teście jest błąd, na przykład pytanie bez dobrej odpowiedzi, albo pod jego ścieżką nie ma lekcji, budowanie się nie powiedzie, a komunikat błędu powie, co poprawić.

## Śledzenie postępów

Na końcu lekcji naciśnij **Oznacz lekcję jako ukończoną**. Po rozwiązaniu testu twój najlepszy wynik widać w zakładce **Testy** i na końcu lekcji. Postęp i wyniki są wspólne dla obu języków i zapisywane tylko w tej przeglądarce, więc nie synchronizują się między urządzeniami.
