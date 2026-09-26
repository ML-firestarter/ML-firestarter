---
description: Wypisywanie tekstu i liczb, działania na liczbach i czytanie komunikatów o błędach.
---

# Uruchamianie Pythona

Program w Pythonie to plik tekstowy z poleceniami. Python wykonuje je po kolei, wiersz po wierszu, od góry do dołu. Oto cały program; naciśnij **Uruchom**, żeby go uruchomić:

```python run
print("Cześć!")
```

`print` wypisuje to, co jest w nawiasach. Cudzysłów oznacza, że `Cześć!` to tekst, który Python nazywa **napisem** (ang. string). Python wypisuje go dokładnie tak, jak jest zapisany, tylko bez cudzysłowu.

> [!TIP]
> Każdy przykład w tej lekcji działa w twojej przeglądarce. Naciśnij **Edytuj**, żeby go zmienić, i znów **Uruchom**, a **Cofnij zmiany**, żeby wrócić do wersji z lekcji. Wypróbowywanie to najszybszy sposób nauki.

## Wypisywanie

Każde `print()` wypisuje osobny wiersz, więc program z trzema wypisuje trzy wiersze:

```python run
print("Python czyta")
print("wiersz")
print("po wierszu.")
```

`print()` może też dostać kilka wartości, rozdzielonych przecinkami. Wypisuje je wszystkie w jednym wierszu, ze spacją między każdymi dwiema:

```python run
print("Tydzień ma", 7, "dni.")
```

`7` nie ma cudzysłowu, bo to liczba, a nie tekst. Na liczbach można wykonywać działania.

## Działania na liczbach

Python to dobry kalkulator:

```python run
print(2 + 3)
print(10 - 4)
print(6 * 7)
print(7 / 2)
```

| Operator | Znaczenie                                | Przykład  | Wynik  |
| -------- | ---------------------------------------- | --------- | ------ |
| `+`      | dodawanie                                | `2 + 3`   | `5`    |
| `-`      | odejmowanie                              | `10 - 4`  | `6`    |
| `*`      | mnożenie                                 | `6 * 7`   | `42`   |
| `/`      | dzielenie                                | `7 / 2`   | `3.5`  |
| `//`     | dzielenie całkowite (zaokrąglone w dół)  | `7 // 2`  | `3`    |
| `%`      | reszta z dzielenia                       | `7 % 2`   | `1`    |
| `**`     | potęgowanie                              | `2 ** 10` | `1024` |

`/` zawsze daje liczbę z częścią dziesiętną, nawet gdy dzielenie wychodzi bez reszty: `6 / 3` to `2.0`. Python nazywa takie liczby **zmiennoprzecinkowymi** (ang. float), a liczby całkowite, takie jak `2`, po prostu **int**.

> [!IMPORTANT]
> W Pythonie część dziesiętną oddziela kropka, nie przecinek: `3.5`, a nie `3,5`. `print(3,5)` wypisze dwie liczby, `3 5`.

`//` i `%` działają w parze: `//` mówi, ile razy jedna liczba mieści się w drugiej w całości, a `%`, ile zostaje. 100 minut to 1 godzina i 40 minut:

```python run
print(100 // 60, "h", 100 % 60, "min")
```

Obowiązuje zwykła kolejność działań: najpierw `**`, potem `*`, `/`, `//` i `%`, a na końcu `+` i `-`. Nawiasy zmieniają kolejność:

```python run
print(2 + 3 * 4)
print((2 + 3) * 4)
```

## Tekst czy kod?

Cudzysłów decyduje, czy Python coś obliczy, czy wypisze to tak, jak jest:

```python run
print("2 + 3")
print(2 + 3)
```

Pierwszy wiersz wypisuje tekst `2 + 3`, a drugi wynik, `5`. Razem mogą pokazać działanie i jego wynik:

```python run
print("2 + 3 =", 2 + 3)
```

Napis można zapisać w cudzysłowie, `"o tak"`, albo w apostrofach, `'o tak'`. Oba zapisy działają tak samo, byle napis zaczynał się i kończył tym samym znakiem. Tekst z cudzysłowem w środku zapisz w apostrofach, na przykład `'Napisz "tak"'`, bo w `"Napisz "tak""` drugi cudzysłów zakończyłby napis.

## Komentarze

Python pomija wszystko od `#` do końca wiersza. To **komentarz** (ang. comment), notatka dla każdego, kto czyta kod:

```python run
# Ile sekund ma godzina?
print(60 * 60)  # 60 minut po 60 sekund
```

`#` w cudzysłowie to część tekstu, a nie komentarz: `print("#1")` wypisuje `#1`.

## Gdy coś pójdzie nie tak

Python robi dokładnie to, co mówi kod, a gdy nie może, zatrzymuje się i wypisuje **komunikat o błędzie**. Uruchom to:

```python run
print("Cześć"
```

Nawias nigdy nie zostaje zamknięty i Python to mówi: `'(' was never closed`, czyli „nawias nie został zamknięty”. To `SyntaxError`, **błąd składni**: kod nie jest poprawnym Pythonem. Wtedy Python nie wykonuje niczego, nawet poprawnych wierszy.

Python odróżnia też wielkie litery od małych, więc `print` i `Print` to dwie różne nazwy. Uruchom to:

```python run
print("Pierwszy wiersz")
Print("Drugi wiersz")
print("Trzeci wiersz")
```

Tym razem pierwszy wiersz się wykonuje, a program zatrzymuje się na drugim:

```text
Traceback (most recent call last):
  File "main.py", line 2, in <module>
    Print("Drugi wiersz")
    ^^^^^
NameError: name 'Print' is not defined. Did you mean: 'print'?
```

Python nie zna niczego o nazwie `Print`, więc to `NameError`, **błąd nazwy**, a trzeci wiersz nigdy się nie wykonuje. Komunikaty Pythona są po angielsku; ten mówi: „nazwa 'Print' nie jest zdefiniowana. Czy chodziło o 'print'?”. Czytaj je od dołu:

1. **Ostatni wiersz** mówi, co poszło nie tak: rodzaj błędu, a po nim szczegóły. Tutaj Python podpowiada nawet poprawkę.
2. **Nad nim** jest miejsce błędu: numer wiersza (`line 2`), sam wiersz i znaki `^` pod fragmentem, który zawiódł.

> [!TIP]
> Python zgłasza jeden błąd naraz. Gdy w programie jest ich kilka, popraw ten, który wskazuje, i uruchom program ponownie, żeby znaleźć następny.

## Sprawdź się

<details>
<summary>Co wypisze <code>print("6 * 7")</code>, a co <code>print(6 * 7)</code>?</summary>

Pierwsze wypisze tekst `6 * 7`, bo jest w cudzysłowie. Drugie obliczy wynik i wypisze `42`.

</details>

<details>
<summary>Ile to <code>17 // 5</code>, a ile <code>17 % 5</code>?</summary>

`17 // 5` to `3`, bo 5 mieści się w 17 trzy razy w całości, a `17 % 5` to `2`, czyli to, co zostaje: 17 = 3 × 5 + 2.

</details>

<details>
<summary>Dlaczego <code>print(8 / 2)</code> wypisuje <code>4.0</code>, a nie <code>4</code>?</summary>

`/` zawsze daje liczbę zmiennoprzecinkową, z częścią dziesiętną, nawet gdy dzielenie wychodzi bez reszty. `8 // 2` daje `4`.

</details>

<details>
<summary><code>print(Cześć)</code> kończy się błędem <code>NameError: name 'Cześć' is not defined</code>. Co jest nie tak?</summary>

`Cześć` nie ma cudzysłowu, więc Python bierze je za nazwę czegoś, a nie za tekst, a nic nie nazywa się `Cześć`. Z cudzysłowem `print("Cześć")` wypisze tekst.

</details>
