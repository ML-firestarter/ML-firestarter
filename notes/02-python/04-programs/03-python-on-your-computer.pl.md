---
description: Przygotuj Pythona na własnym komputerze za pomocą uv, zapisuj zależności projektu w pyproject.toml i uruchamiaj tam kod z lekcji.
---

# Python na twoim komputerze

Strona uruchamia Pythona za ciebie i w większości lekcji to wystarcza. W kilku miejscach jednak nie daje rady: nie ma karty graficznej, nie może pobierać dużych zbiorów danych, a PyTorch, którego używa, to mała kopia prawdziwego. Prawdziwe projekty żyją na twoim komputerze, z własnymi plikami i bibliotekami, które instalują. W tej lekcji przygotujesz to wszystko za pomocą **uv**, szybkiego narzędzia, które instaluje Pythona i biblioteki potrzebne projektowi.

W ćwiczeniach do tej lekcji przeczytasz to, co zapisuje `uv`, i zdecydujesz, co zostanie zainstalowane. Będą ci potrzebne:

- **polecenia**, które tworzą projekt i dodają do niego biblioteki,
- **`pyproject.toml`**, plik, w którym projekt wymienia swoje zależności,
- **specyfikatory wersji**, takie jak `>=2.0,<3`, które mówią, jakie wersje są w porządku,
- **nagłówki skryptów**, dzięki którym pojedynczy plik może zawierać własne zależności.

> [!NOTE]
> Polecenia z tej lekcji uruchamia się w terminalu na twoim komputerze, więc strona nie może ich wykonać i pokazuje je jako zwykłe bloki. Może za to uruchomić kod w Pythonie, który czyta zapisane przez nie pliki, i tym właśnie są ćwiczenia. Polecenia dotyczące projektu zostały przed umieszczeniem w lekcji uruchomione przez `uv`. Polecenie instalatora i polecenie PyTorcha pochodzą z ich własnej dokumentacji.

## Co robi uv

Na jednym komputerze może być wiele wersji Pythona, a każdy projekt potrzebuje własnych bibliotek, w wersjach, które ze sobą współpracują. Projekt, który potrzebuje `numpy` 2, nie powinien zepsuć projektu, który potrzebuje `numpy` 1, dlatego każdy projekt dostaje **środowisko wirtualne**: folder z własnym Pythonem i własnymi bibliotekami. **Plik blokady** (ang. lockfile) zapisuje dokładne wersje, które zostały zainstalowane, żeby projekt działał tak samo na innym komputerze.

`uv` robi to wszystko w jednym narzędziu. Instaluje Pythony, tworzy środowiska wirtualne, dodaje do nich biblioteki i zapisuje plik blokady. Zastępuje kilka starszych narzędzi, `pip`, `venv`, `pyenv` i `pipx`, z których każde robiło tylko część tej pracy.

## Instalacja uv

Na macOS i Linuksie uruchom w terminalu:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Na Windowsie uruchom w PowerShellu:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Otwórz nowy terminal, a `uv --version` pokaże, że narzędzie jest zainstalowane. [Dokumentacja uv](https://docs.astral.sh/uv/getting-started/installation/) wymienia też inne sposoby, na przykład `brew install uv` albo `pip install uv`.

## Projekt

`uv init` tworzy projekt w nowym folderze:

```bash
uv init fares
cd fares
```

W folderze jest kilka plików:

| Plik              | Co to jest                                                             |
| ----------------- | ---------------------------------------------------------------------- |
| `pyproject.toml`  | nazwa projektu i jego zależności, zapisywane przez ciebie i przez `uv` |
| `main.py`         | mały program na początek                                               |
| `.python-version` | wersja Pythona, której używa projekt                                   |
| `README.md`       | miejsce na opis projektu                                               |

`pyproject.toml` to plik TOML, czyli prosty format tekstowy z linijkami `klucz = wartość` w `[tabelach]`. Python może go przeczytać modułem `tomllib` z biblioteki standardowej i tak będą to robić ćwiczenia:

```python run
import tomllib

text = """\
[project]
name = "fares"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "numpy>=2.4.6",
]
"""

project = tomllib.loads(text)
print(project["project"]["name"])
print(project["project"]["dependencies"])
```

Tabela taka jak `[project]` zamienia się w słownik, a lista w nawiasach kwadratowych w listę Pythona. `dependencies` to biblioteki, których potrzebuje projekt, każda ze **specyfikatorem wersji** po nazwie.

## Dodawanie bibliotek

`uv add` instaluje bibliotekę w projekcie:

```bash
uv add numpy
```

Robi przy tym trzy rzeczy. Tworzy środowisko wirtualne w folderze `.venv`, jeśli projekt jeszcze go nie ma. Instaluje w nim numpy razem ze wszystkim, czego ta biblioteka potrzebuje. Zapisuje też numpy w `pyproject.toml`, który ma teraz `dependencies = ["numpy>=2.4.6"]`, a dokładne wersje wszystkiego w drugim pliku, `uv.lock`. Nie edytuj `uv.lock` ręcznie: zajmuje się nim `uv`.

Biblioteki, których używasz tylko podczas pracy nad projektem, na przykład narzędzie do testów, trafiają z `--dev` do osobnej grupy, a `uv remove` usuwa bibliotekę z projektu:

```bash
uv add --dev pytest
uv remove numpy
```

Grupa dev jest zapisana w osobnej tabeli, `[dependency-groups]`:

```toml
[dependency-groups]
dev = [
    "pytest>=9.1.1",
]
```

Na innym komputerze albo po pobraniu projektu z Gita `uv sync` instaluje dokładnie to, co wymienia `uv.lock`.

## Uruchamianie kodu

`uv run` uruchamia program w środowisku projektu, więc niczego nie trzeba aktywować:

```bash
uv run main.py
```

Najpierw upewnia się, że środowisko zgadza się z `pyproject.toml`, więc biblioteka, którą przed chwilą dodano, już w nim jest. `uv run python` uruchamia znak zachęty Pythona w tym samym środowisku, a `uv run pytest` uruchamia narzędzie zainstalowane w projekcie.

Typowa niespodzianka na początku to `ModuleNotFoundError` dla biblioteki, która na pewno jest zainstalowana. Prawie zawsze oznacza to, że program uruchomiono innym Pythonem niż ten z projektu. Rozwiązaniem jest uruchomienie go przez `uv run`.

## Która wersja

Biblioteki mają wersje, na przykład `2.4.6`, a specyfikator mówi, które z nich projekt akceptuje:

| Specyfikator | Pasujące wersje           |
| ------------ | ------------------------- |
| `>=2.0`      | 2.0 i wyższe              |
| `>=2.0,<3`   | od 2.0 do 3, ale bez 3    |
| `==2.4.6`    | dokładnie 2.4.6           |
| `!=2.4.6`    | każda wersja oprócz 2.4.6 |

Wszystkie warunki rozdzielone przecinkami muszą być spełnione jednocześnie. `uv add numpy` zapisuje `numpy>=2.4.6`, czyli zainstalowaną wersję, a plik blokady przechowuje tę dokładną. Wersje to liczby rozdzielone kropkami, porównywane część po części jako liczby, dlatego `1.10` jest nowsza niż `1.9`. Krotki w Pythonie porównują się tak samo:

```python run
print((1, 10) > (1, 9))
print("1.10" > "1.9")
print((2, 4, 6) >= (2, 0) and (2, 4, 6) < (3,))
```

Drugi wiersz porównuje *tekst* i daje zły wynik. Ćwiczenie najpierw zamienia wersje na krotki.

Sam Python też ma wersję. `requires-python = ">=3.12"` w `pyproject.toml` mówi, z którymi wersjami projekt działa, a `.python-version`, której z nich użyć. `uv python install 3.13` instaluje kolejną wersję, a `uv python pin 3.13` ustawia ją dla projektu.

## Skrypt z własnymi zależnościami

Pojedynczy plik nie potrzebuje projektu. Blok komentarza na początku skryptu wymienia, czego skrypt potrzebuje, w znanym już formacie TOML, a każda linijka zaczyna się od `# `:

```python
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "numpy",
# ]
# ///
import numpy as np

print(np.ones(2))
```

`uv run script.py` czyta ten blok, tworzy tymczasowe środowisko z numpy i uruchamia skrypt, więc ten plik działa na każdym komputerze z `uv`. `uv add --script script.py numpy` zapisuje blok za ciebie. Do jednorazowego użycia `uv run --with rich python` uruchamia Pythona z dostępną biblioteką `rich` i niczego po sobie nie zostawia.

Odczytanie takiego bloku to krótkie zadanie dla modułu `re` i `tomllib`, i to druga rzecz, którą robi ćwiczenie.

## Rozdział o PyTorchu na twoim komputerze

Cały kod z [rozdziału o PyTorchu](../../05-pytorch/README.pl.md) działa bez zmian na twoim komputerze. W nowym projekcie:

```bash
uv init torch-lessons
cd torch-lessons
uv add torch
```

Wklej kod z lekcji do `main.py`, a `uv run main.py` uruchomi go z prawdziwym PyTorchem, który wypisze to samo co kopia na stronie. PyTorch to duże pobieranie, a właściwa wersja dla karty graficznej zależy od twojego komputera: [strona instalacji PyTorcha](https://pytorch.org/get-started/locally/) podaje odpowiednie polecenie i tam też sprawdzisz, czy `torch.cuda.is_available()` może u ciebie zwrócić `True`.

## Polecenia w skrócie

| Polecenie                | Co robi                                               |
| ------------------------ | ----------------------------------------------------- |
| `uv init name`           | tworzy projekt w nowym folderze                       |
| `uv add library`         | instaluje bibliotekę i zapisuje ją w `pyproject.toml` |
| `uv add --dev library`   | to samo, w grupie `dev`                               |
| `uv remove library`      | usuwa bibliotekę                                      |
| `uv sync`                | instaluje to, co wymienia `uv.lock`                   |
| `uv run file.py`         | uruchamia program w środowisku projektu               |
| `uv python install 3.13` | instaluje wersję Pythona                              |

Zapisz w Gicie `pyproject.toml`, `uv.lock` i `.python-version`, a pomiń `.venv`: da się go odtworzyć z pozostałych plików, a `uv init` już dopisuje go do `.gitignore`.

## Twoja kolej

W ćwiczeniu [Przeczytaj projekt](../../../exercises/02-python/04-programs/03-python-on-your-computer/01-read-the-project/task.pl.md) wyczytasz zależności z `pyproject.toml` i z nagłówka skryptu. W ćwiczeniu [Czy wersja pasuje?](../../../exercises/02-python/04-programs/03-python-on-your-computer/02-does-it-fit/task.pl.md) zdecydujesz, czy wersja pasuje do specyfikatora takiego jak `>=2.0,<3`.
