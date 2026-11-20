---
description: Wczytaj słowa z pliku, pogrupuj je według długości i zapisz grupy w drugim pliku.
---

# Pogrupuj słowa według długości

W każdym wierszu pliku `words.txt` jest jedno słowo, a są to słowa Pythona, które już znasz, takie jak `print`, `if` i `return`. Dokończ dwie funkcje.

`group_by_length(path)` wczytuje plik spod ścieżki `path` i zwraca słownik z kluczem dla każdej długości słowa. Wartość klucza to lista słów tej długości, w kolejności z pliku. Klucze są uporządkowane od najmniejszej długości do największej, bez względu na kolejność słów w pliku:

```python
{2: ['if', 'in'], 3: ['for', 'def', 'len'], 4: ['else', 'list', 'dict', 'open', 'with'], ...}
```

`write_groups(groups, path)` dostaje taki słownik i zapisuje go w pliku pod ścieżką `path`, po jednym wierszu dla każdej długości: długość, dwukropek i słowa, rozdzielone przecinkami.

Program pod funkcjami grupuje słowa z `words.txt`, zapisuje je w `result.txt` i wypisuje ten plik, więc **Uruchom** pokazuje, co zapisały twoje funkcje. Gdy zadziałają, program wypisze:

```text
2: if, in
3: for, def, len
4: else, list, dict, open, with
5: print, input, range
6: return
```
