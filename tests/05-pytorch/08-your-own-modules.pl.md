# Własne moduły

## `__init__` modułu robi `self.layers = [nn.Linear(2, 3), nn.Linear(3, 1)]`. Co daje `model.parameters()`?

- [x] Nic: warstwy są w zwykłej liście, więc moduł o nich nie wie
- [ ] Wagi i wyrazy wolne obu warstw
- [ ] Tylko wagi i wyraz wolny pierwszej warstwy
- [ ] Błąd, bo moduł nie może trzymać listy

`nn.Module` znajduje warstwy i parametry przez atrybuty przypisane do `self`. Lista to zwykły obiekt Pythona, więc warstwy w niej są pomijane, a optymalizator nigdy by ich nie trenował. Każda warstwa potrzebuje własnego atrybutu.

## Jaki kształt ma `torch.cat([a, b], dim=1)`, gdy `a` ma kształt `[8, 2]`, a `b` ma `[8, 40]`?

- [x] `[8, 42]`
- [ ] `[16, 40]`
- [ ] `[8, 80]`
- [ ] Błąd: kształty się różnią

`dim=1` skleja kolumny obok siebie, więc wiersze muszą się zgadzać, a kolumny się sumują: 2 + 40 = 42. `dim=0` ułożyłoby wiersze jeden pod drugim i wtedy zgadzać by się musiały kolumny.

## Dlaczego model wywołuje się jako `model(X)`, a nie `model.forward(X)`?

- [x] `model(X)` uruchamia `forward` i robi wokół niego to, czego potrzebuje `nn.Module`
- [ ] `forward` nie można wywołać ręcznie
- [ ] `model(X)` to jedyny sposób na trenowanie modelu
- [ ] `model(X)` sprawia, że `forward` działa na GPU

`nn.Module` ma `__call__`, które uruchamia `forward`, więc model można wywołać jak funkcję, a to wywołanie robi też wokół niego kilka rzeczy więcej. `model.forward(X)` daje to samo wyjście, ale je pomija.

## Co robi `model(**inputs)` dla `inputs = {"X_wide": a, "X_deep": b}`?

- [x] Wywołuje `model(X_wide=a, X_deep=b)`
- [ ] Wywołuje `model(a, b)` w kolejności wartości słownika, jakiekolwiek są nazwy
- [ ] Wywołuje `model(inputs)` ze słownikiem jako jedynym argumentem
- [ ] Mnoży dwa tensory

`**` rozkłada słownik na argumenty nazwane, z kluczami jako nazwami parametrów. Muszą to być nazwy z sygnatury `forward`, a nazwa, której tam nie ma, kończy się `TypeError`.

## Ścieżka szeroka bierze 3 kolumny, a stos głęboki kończy się 16 liczbami. Ile wynosi `in_features` warstwy wyjściowej, która bierze oba?

- [x] 19
- [ ] 16
- [ ] 48
- [ ] 3

`torch.cat([X_wide, deep_output], dim=1)` układa 3 kolumny obok 16 liczb, więc warstwa wyjściowa bierze 3 + 16 = 19 liczb dla każdego wiersza.

## Model zwraca `main_output, aux_output`. Jak oba mogą pomagać w jego trenowaniu?

- [x] Strata dodaje błąd wyjścia głównego i ważony błąd wyjścia pomocniczego
- [ ] Tylko wyjście główne może mieć stratę
- [ ] Oba wyjścia trzeba uśrednić przed stratą
- [ ] Wyjście pomocnicze zastępuje główne po treningu

`forward` może zwrócić kilka wartości, a strata to dowolna kombinacja, którą napiszesz, jak `criterion(main, y) + 0.2 * criterion(aux, y)`. `backward()` wysyła nachylenia przez każdą ścieżkę, która do niej prowadziła. Wyjście pomocnicze zmusza stos głęboki do nauczenia się czegoś użytecznego samodzielnie, a do predykcji służy tylko wyjście główne.
