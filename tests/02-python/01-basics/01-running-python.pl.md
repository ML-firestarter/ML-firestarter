# Uruchamianie Pythona

## Co wypisze `print("2 + 3")`?

- [x] `2 + 3`
- [ ] `5`
- [ ] `"2 + 3"`
- [ ] Nic, bo tekstu w cudzysłowie nie da się wypisać

Cudzysłów sprawia, że `2 + 3` jest tekstem, więc Python wypisuje go tak, jak jest, bez cudzysłowu. `print(2 + 3)`, bez cudzysłowu, obliczyłoby wynik i wypisało `5`.

## Co wypisze `print("3 + 4 =", 3 + 4)`?

- [ ] `3 + 4 = 3 + 4`
- [ ] `"3 + 4 =" 7`
- [x] `3 + 4 = 7`
- [ ] `3 + 4 =7`

`print()` wypisuje po kolei każdą swoją wartość, ze spacją między nimi: najpierw tekst `3 + 4 =`, potem wynik `3 + 4`, czyli `7`.

## Co wypisze `print(9 / 3)`?

- [ ] `3`
- [x] `3.0`
- [ ] `3,0`
- [ ] `0`

`/` zawsze daje liczbę zmiennoprzecinkową, z częścią dziesiętną, nawet gdy dzielenie wychodzi bez reszty. Python oddziela ją kropką, nie przecinkiem. `9 // 3` dałoby `3`.

## Które z nich wypiszą `3`?

- [x] `print(7 // 2)`
- [x] `print(15 % 4)`
- [ ] `print(6 / 2)`
- [ ] `print(3 ** 2)`

2 mieści się w 7 trzy razy w całości, więc `7 // 2` to `3`, a z dzielenia 15 przez 4 zostaje 3, więc `15 % 4` to `3`. `6 / 2` wypisze `3.0`, bo `/` zawsze daje liczbę zmiennoprzecinkową, a `3 ** 2` to 3 do kwadratu, czyli `9`.

## Co wypisze `print(2 + 3 * 4)`?

- [ ] `20`
- [x] `14`
- [ ] `24`
- [ ] `2 + 3 * 4`

Mnożenie ma pierwszeństwo przed dodawaniem, więc Python najpierw oblicza `3 * 4`, a potem dodaje 2. `(2 + 3) * 4` dałoby `20`.

## Który wiersz Python pomija w całości?

- [ ] `print("# Cześć")`
- [ ] `print("Cześć")  # powitanie`
- [x] `# print("Cześć")`
- [ ] `print("Cześć #1")`

`#` zaczyna komentarz, a Python pomija wszystko od niego do końca wiersza. W trzecim wierszu to cały wiersz. Drugi wiersz wypisuje `Cześć` i pomija tylko komentarz po nim, a `#` w cudzysłowie to zwykła część tekstu.

## W pierwszym wierszu tego programu brakuje nawiasu. Co się stanie po uruchomieniu?

```python
print("Cześć"
print("Pa")
```

- [ ] Wypisze `Cześć`, a potem zatrzyma się z błędem
- [ ] Wypisze `Cześć` i `Pa`
- [ ] Wypisze `Pa` i pominie błędny wiersz
- [x] Zatrzyma się z błędem `SyntaxError` i nic nie wypisze

`SyntaxError`, błąd składni, oznacza, że kod nie jest poprawnym Pythonem, więc Python nie wykonuje niczego, nawet poprawnych wierszy. Wskazuje nawias `(`, który nie został zamknięty.

## Program zatrzymuje się z takim komunikatem. Co jest nie tak?

```text
Traceback (most recent call last):
  File "main.py", line 3, in <module>
    Print("Koniec")
    ^^^^^
NameError: name 'Print' is not defined. Did you mean: 'print'?
```

- [x] W wierszu 3 jest `Print` z wielkiej litery, a powinno być `print`
- [ ] Brakuje wiersza 1, bo każdy program musi zaczynać się od `print`
- [ ] `"Koniec"` powinno być w apostrofach
- [ ] Błędy są w wierszach 1 i 2, a Python zauważył je dopiero w wierszu 3

Komunikaty o błędach czyta się od dołu. Ostatni wiersz mówi, co jest nie tak: Python nie zna niczego o nazwie `Print` i podpowiada `print`. Wiersz nad nim mówi, gdzie: w wierszu 3, ze znakami `^` pod `Print`.
