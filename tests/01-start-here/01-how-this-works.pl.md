# Jak to działa

## Który z tych plików w `notes/` *nie* jest lekcją?

- [ ] `04-foundations/02-linear-regression.md`
- [ ] `vocabulary/agent.md`
- [x] `04-foundations/README.md`
- [ ] `01-start-here/02-markdown-cheatsheet.md`

Plik `README.md` (albo `index.md`) w folderze to wstęp na stronie jego rozdziału. Każdy inny plik `.md` to lekcja, a każdy folder to rozdział.

## Pod jakim adresem jest publikowany plik `04-foundations/01-what-is-machine-learning.md`?

- [ ] `/04-foundations/01-what-is-machine-learning/`
- [x] `/foundations/what-is-machine-learning/`
- [ ] `/foundations/01-what-is-machine-learning/`
- [ ] `/what-is-machine-learning/`

Numery ustalają tylko kolejność, więc nie trafiają ani do adresu, ani do tytułu. Dlatego zmiana numeru lekcji nie zmienia jej adresu, a zmiana nazwy już tak.

## Lekcja zapisana jako `03-descent.md` ma we frontmatterze `title: Spadek gradientu krok po kroku` i zaczyna się od `# Spadek gradientu`. Jaki ma tytuł?

- [ ] Spadek gradientu
- [ ] Descent
- [x] Spadek gradientu krok po kroku
- [ ] 03 descent

Pierwszeństwo ma pole `title` we frontmatterze, potem nagłówek `# Nagłówek` w pierwszym wierszu, a dopiero na końcu nazwa pliku.

## Jak dodać polską wersję pliku `notes/vocabulary/sft.md`?

- [x] Zapisać ją obok oryginału jako `sft.pl.md`
- [ ] Zapisać ją jako `notes/pl/vocabulary/sft.md`
- [ ] Dopisać polską sekcję na końcu `sft.md`
- [ ] Dodać `lang: pl` do frontmattera `sft.md`

Tłumaczenie leży obok oryginału, z kodem języka przed `.md`. Jest publikowane pod adresem oryginału z przedrostkiem `/pl/`, jak `/pl/vocabulary/sft/`.

## Co jest prawdą o przycisku **Oznacz lekcję jako ukończoną**?

- [x] Postęp jest zapisywany tylko w tej przeglądarce
- [ ] Postęp synchronizuje się między twoimi urządzeniami
- [x] Lekcja oznaczona jako ukończona po angielsku jest ukończona także po polsku
- [ ] Po zmianie nazwy pliku lekcja zachowuje znacznik ukończenia

Postęp jest przechowywany w przeglądarce, więc nie synchronizuje się między urządzeniami, i jest wspólny dla obu języków. Lekcja o nowej nazwie dostaje nowy adres i traci znacznik ukończenia.

## Gdzie zapisać test do `notes/vocabulary/sft.md`?

- [ ] Na końcu `notes/vocabulary/sft.md`, pod nagłówkiem `## Test`
- [x] W `tests/vocabulary/sft.md`
- [ ] W `notes/vocabulary/sft.test.md`
- [ ] W `tests/sft.md`

Test ma w `tests/` tę samą ścieżkę co jego lekcja w `notes/`, a jego polskie tłumaczenie to `tests/vocabulary/sft.pl.md`.

## Pytanie w teście ma dwie odpowiedzi oznaczone `[x]`. Jak działa?

- [ ] Dostaje przyciski opcji i wystarczy zaznaczyć jedną z dwóch dobrych odpowiedzi
- [x] Dostaje pola wyboru i jest uznane za rozwiązane poprawnie tylko wtedy, gdy zaznaczysz obie dobre odpowiedzi i nic więcej
- [ ] Dostaje pola wyboru, a każda zaznaczona dobra odpowiedź daje pół punktu
- [ ] Budowanie strony się nie powiedzie, bo pytanie może mieć tylko jedną dobrą odpowiedź

Jedno `[x]` daje przyciski opcji, a kilka daje pola wyboru. Pytanie jest rozwiązane poprawnie tylko wtedy, gdy zaznaczysz dokładnie jego dobre odpowiedzi; nie ma połówek punktów.

## Gdzie działa kod, który piszesz w ćwiczeniu?

- [ ] Na serwerze strony
- [x] W twojej przeglądarce
- [ ] Na GitHubie, w workflow
- [ ] Nigdzie, dopóki nie zainstalujesz Pythona

Python działa w twojej przeglądarce, więc nie trzeba niczego instalować. Pierwsze uruchomienie go pobiera, co trwa kilka sekund.

## Kiedy na stronie ćwiczenia pojawia się **Nasze rozwiązanie**?

- [ ] Od razu, pod treścią zadania
- [ ] Po trzech nieudanych próbach
- [x] Gdy twój kod przejdzie wszystkie sprawdzenia
- [ ] Nigdy, bo rozwiązania są tylko w repozytorium

Rozwiązanie pojawia się, gdy twój kod przejdzie sprawdzenia, żeby można było je porównać. Dobry jest każdy kod, który przechodzi sprawdzenia, nawet jeśli wygląda inaczej.
