# Własne moduły

## `__init__` modułu wykonuje `self.layers = [nn.Linear(2, 3), nn.Linear(3, 1)]`. Co daje `model.parameters()`?

- [x] Nic: warstwy są w zwykłej liście, więc moduł o nich nie wie
- [ ] Wagi i wyrazy wolne obu warstw
- [ ] Tylko wagi i wyraz wolny pierwszej warstwy
- [ ] Błąd, bo moduł nie może przechowywać listy

`nn.Module` znajduje warstwy i parametry po atrybutach przypisanych do `self`. Lista to zwykły obiekt Pythona, więc warstwy w niej zostają pominięte i optymalizator nigdy by ich nie wytrenował. Każda warstwa potrzebuje własnego atrybutu.

## Jaki kształt ma `torch.cat([a, b], dim=1)`, gdy `a` ma kształt `[8, 2]`, a `b` kształt `[8, 40]`?

- [x] `[8, 42]`
- [ ] `[16, 40]`
- [ ] `[8, 80]`
- [ ] Żaden, to błąd, bo kształty się różnią

`dim=1` skleja kolumny obok siebie, więc liczba wierszy musi się zgadzać, a kolumny się sumują: 2 + 40 = 42. `dim=0` ułożyłoby wiersze jeden pod drugim i wtedy zgadzać musiałaby się liczba kolumn.

## Dlaczego model wywołuje się przez `model(X)`, a nie przez `model.forward(X)`?

- [x] `model(X)` uruchamia `forward` i robi wokół niego to, czego potrzebuje `nn.Module`
- [ ] `forward` nie można wywołać ręcznie
- [ ] `model(X)` to jedyny sposób, żeby trenować model
- [ ] `model(X)` sprawia, że `forward` działa na GPU

`nn.Module` ma metodę `__call__`, która uruchamia `forward`, więc model można wywołać jak funkcję, a to wywołanie robi przy okazji jeszcze kilka rzeczy. `model.forward(X)` daje to samo wyjście, ale je pomija.

## Co robi `model(**inputs)` dla `inputs = {"X_wide": a, "X_deep": b}`?

- [x] Wywołuje `model(X_wide=a, X_deep=b)`
- [ ] Wywołuje `model(a, b)` z wartościami słownika w ich kolejności, niezależnie od nazw
- [ ] Wywołuje `model(inputs)` ze słownikiem jako jedynym argumentem
- [ ] Mnoży oba tensory

`**` rozkłada słownik na argumenty nazwane: klucze stają się nazwami parametrów. Muszą to być nazwy z sygnatury `forward`, a nazwa, której tam nie ma, kończy się błędem `TypeError`.

## Ścieżka szeroka bierze 3 kolumny, a stos głęboki kończy się 16 liczbami. Ile wynosi `in_features` warstwy wyjściowej, która przyjmuje jedno i drugie?

- [x] 19
- [ ] 16
- [ ] 48
- [ ] 3

`torch.cat([X_wide, deep_output], dim=1)` układa 3 kolumny obok 16 liczb, więc warstwa wyjściowa przyjmuje 3 + 16 = 19 liczb dla każdego wiersza.

## Model zwraca `main_output, aux_output`. Jak oba wyjścia mogą pomóc go wytrenować?

- [x] Strata to suma błędu wyjścia głównego i ważonego błędu wyjścia pomocniczego
- [ ] Stratę może mieć tylko wyjście główne
- [ ] Przed liczeniem straty oba wyjścia trzeba uśrednić
- [ ] Po treningu wyjście pomocnicze zastępuje główne

`forward` może zwrócić kilka wartości, a strata to dowolne ich połączenie, które napiszesz, na przykład `criterion(main, y) + 0.2 * criterion(aux, y)`. `backward()` wysyła nachylenia każdą ścieżką, która do straty prowadziła. Wyjście pomocnicze zmusza stos głęboki, żeby sam nauczył się czegoś użytecznego, a do przewidywania służy tylko wyjście główne.
