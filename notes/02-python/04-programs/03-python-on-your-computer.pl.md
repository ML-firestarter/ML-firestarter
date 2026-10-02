---
description: Ustaw Pythona na własnym komputerze z uv, trzymaj zależności projektu w pyproject.toml i uruchamiaj tam kod z lekcji.
---

# Python na twoim komputerze

Strona uruchamia Pythona za ciebie i dla większości tych lekcji to wystarcza. Kończy się w kilku miejscach: nie ma karty graficznej, nie pobierze dużych zbiorów danych, a PyTorch, który uruchamia, to mała kopia prawdziwego. Prawdziwe projekty żyją na twoim własnym komputerze, z własnymi plikami i bibliotekami, które instalują. Ta lekcja ustawia to z **uv**, szybkim narzędziem, które instaluje Pythona i biblioteki potrzebne projektowi.

W ćwiczeniach do tej lekcji przeczytasz to, co zapisuje `uv`, i zdecydujesz, co zainstaluje. Potrzebujesz do tego:

- **poleceń**, które tworzą projekt i dodają do niego biblioteki,
- **`pyproject.toml`**, pliku, w którym projekt wypisuje swoje zależności,
- **specyfikatorów wersji**, jak `>=2.0,<3`, które mówią, jakie wersje są w porządku,
- **nagłówków skryptów**, dzięki którym pojedynczy plik niesie własne zależności.

> [!NOTE]
> Polecenia z tej lekcji działają w terminalu na twoim komputerze, więc strona nie może ich uruchomić i są pokazane jako zwykłe bloki. Strona może uruchomić Pythona, który czyta pliki przez nie zapisane, i to właśnie robią ćwiczenia. Polecenia dla projektu uruchomiono z `uv`, zanim tu trafiły. Instalator i polecenie dla PyTorcha pochodzą z ich własnej dokumentacji.

## Co robi uv

Komputer może mieć wiele wersji Pythona, a każdy projekt potrzebuje własnych bibliotek, w wersjach, które do siebie pasują. Projekt, który potrzebuje `numpy` 2, nie powinien psuć tego, który potrzebuje `numpy` 1, więc każdy projekt dostaje **środowisko wirtualne**: folder z własnym Pythonem i własnymi bibliotekami. **Plik blokady** (ang. lockfile) zapisuje dokładne wersje, które zainstalowano, żeby projekt działał tak samo na innym komputerze.

`uv` robi to wszystko, w jednym narzędziu. Instaluje Pythony, tworzy środowiska wirtualne, dodaje do nich biblioteki i zapisuje plik blokady. Zastępuje garść starszych narzędzi, `pip`, `venv`, `pyenv` i `pipx`, z których każde robiło jedną część.

## Instalacja uv

Na macOS i Linuksie uruchom to w terminalu:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

W Windowsie uruchom to w PowerShellu:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Otwórz nowy terminal, a `uv --version` pokaże, że jest. [Dokumentacja uv](https://docs.astral.sh/uv/getting-started/installation/) wymienia inne sposoby, jak `brew install uv` albo `pip install uv`.

## Projekt

`uv init` tworzy projekt w nowym folderze:

```bash
uv init fares
cd fares
```

W folderze jest kilka plików:

| Plik               | Co to jest                                                              |
| ------------------ | ----------------------------------------------------------------------- |
| `pyproject.toml`   | nazwa projektu i jego zależności, zapisywane przez ciebie i przez `uv`  |
| `main.py`          | mały program na początek                                                |
| `.python-version`  | której wersji Pythona używa projekt                                     |
| `README.md`        | miejsce na opis projektu                                                |

`pyproject.toml` to plik TOML, zwykły format tekstowy z liniami `klucz = wartość` w `[tabelach]`. Python potrafi go czytać biblioteką standardową `tomllib`, tak jak zrobią to ćwiczenia:

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

Tabela taka jak `[project]` staje się słownikiem, a lista w nawiasach kwadratowych listą Pythona. `dependencies` to biblioteki, których potrzebuje projekt, każda z **specyfikatorem wersji** po nazwie.

## Dodawanie bibliotek

`uv add` instaluje bibliotekę w projekcie:

```bash
uv add numpy
```

Robi trzy rzeczy. Tworzy środowisko wirtualne w folderze o nazwie `.venv`, jeśli projekt jeszcze go nie ma. Instaluje tam numpy, z tym, czego potrzebuje. I zapisuje numpy w `pyproject.toml`, który ma teraz `dependencies = ["numpy>=2.4.6"]`, a każdą dokładną wersję w drugim pliku, `uv.lock`. Nie edytuj `uv.lock` ręcznie: pilnuje go `uv`.

Biblioteki, których używasz tylko podczas pracy nad projektem, jak narzędzie do testów, idą do osobnej grupy z `--dev`, a `uv remove` usuwa bibliotekę z powrotem:

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

Na innym komputerze, albo po pobraniu projektu z Gita, `uv sync` instaluje dokładnie to, co wypisuje `uv.lock`.

## Uruchamianie kodu

`uv run` uruchamia program ze środowiskiem projektu, więc nic nie trzeba aktywować:

```bash
uv run main.py
```

Najpierw upewnia się, że środowisko zgadza się z `pyproject.toml`, więc dopiero co dodana biblioteka jest na miejscu. `uv run python` uruchamia znak zachęty Pythona w tym samym środowisku, a `uv run pytest` uruchamia narzędzie, które projekt zainstalował.

Zwykła niespodzianka dla początkującego to `ModuleNotFoundError` dla biblioteki, która na pewno jest zainstalowana. Prawie zawsze znaczy to, że program uruchomiono innym Pythonem niż ten z projektu. Naprawia to uruchomienie przez `uv run`.

## Która wersja

Biblioteki mają wersje, jak `2.4.6`, a specyfikator mówi, które projekt przyjmuje:

| Specyfikator | Pasuje do wersji                       |
| ------------ | -------------------------------------- |
| `>=2.0`      | 2.0 i wyższych                         |
| `>=2.0,<3`   | od 2.0 do 3, ale bez 3                 |
| `==2.4.6`    | dokładnie 2.4.6                        |
| `!=2.4.6`    | każdej wersji oprócz 2.4.6             |

Klauzule rozdzielone przecinkami muszą zachodzić wszystkie. `uv add numpy` zapisuje `numpy>=2.4.6`, dla wersji, którą zainstalował, a plik blokady trzyma dokładną. Wersje to liczby rozdzielone kropkami i porównuje się je część po części jako liczby, dlatego `1.10` jest nowsze niż `1.9`. Krotki Pythona porównują się tak samo:

```python run
print((1, 10) > (1, 9))
print("1.10" > "1.9")
print((2, 4, 6) >= (2, 0) and (2, 4, 6) < (3,))
```

Druga linia porównuje *tekst* i się myli. Ćwiczenie zamienia wersje najpierw na krotki.

Python ma też swoją wersję. `requires-python = ">=3.12"` w `pyproject.toml` mówi, z którymi projekt działa, a `.python-version` mówi, której użyć. `uv python install 3.13` instaluje inną, a `uv python pin 3.13` sprawia, że projekt jej używa.

## Skrypt, który niesie swoje zależności

Pojedynczy plik nie potrzebuje projektu. Blok komentarza na początku skryptu wypisuje, czego potrzebuje, w TOML, który właśnie poznałeś, z każdą linią zaczynającą się od `# `:

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

`uv run script.py` czyta blok, tworzy tymczasowe środowisko z numpy i uruchamia skrypt, więc ten plik działa na każdym komputerze z `uv`. `uv add --script script.py numpy` zapisuje blok za ciebie. Na jednorazowe użycie `uv run --with rich python` uruchamia Pythona z dostępnym `rich` i niczego nie zachowuje.

Przeczytanie bloku to krótka praca dla modułu `re` i `tomllib` i to jest druga rzecz, którą robi ćwiczenie.

## Rozdział o PyTorchu na twoim komputerze

Wszystko z [rozdziału o PyTorchu](../05-pytorch/README.pl.md) działa bez zmian na twoim komputerze. W nowym projekcie:

```bash
uv init torch-lessons
cd torch-lessons
uv add torch
```

Wstaw kod lekcji do `main.py`, a `uv run main.py` uruchomi go z prawdziwym PyTorchem, który wypisze to, co wypisała kopia ze strony. PyTorch to duże pobranie, a właściwa wersja dla karty graficznej zależy od twojego komputera: [strona instalacji PyTorcha](https://pytorch.org/get-started/locally/) ma do tego polecenie i to także miejsce, żeby sprawdzić, czy `torch.cuda.is_available()` może być dla ciebie `True`.

## Polecenia w skrócie

| Polecenie                  | Co robi                                               |
| -------------------------- | ----------------------------------------------------- |
| `uv init name`             | tworzy projekt w nowym folderze                       |
| `uv add library`           | instaluje bibliotekę i zapisuje ją w `pyproject.toml` |
| `uv add --dev library`     | to samo, w grupie `dev`                               |
| `uv remove library`        | usuwa bibliotekę                                      |
| `uv sync`                  | instaluje to, co wypisuje `uv.lock`                   |
| `uv run file.py`           | uruchamia program w środowisku projektu               |
| `uv python install 3.13`   | instaluje wersję Pythona                              |

Dodaj do Gita `pyproject.toml`, `uv.lock` i `.python-version`, a `.venv` pomiń: można go zrobić od nowa z pozostałych, a `uv init` już wpisuje go do `.gitignore`.

## Twoja kolej

W ćwiczeniu [Przeczytaj projekt](../../../exercises/02-python/04-programs/03-python-on-your-computer/01-read-the-project/task.pl.md) wyczytasz zależności z `pyproject.toml` i z nagłówka skryptu. W ćwiczeniu [Czy pasuje](../../../exercises/02-python/04-programs/03-python-on-your-computer/02-does-it-fit/task.pl.md) zdecydujesz, czy wersja pasuje do specyfikatora takiego jak `>=2.0,<3`.
