---
description: Uczenie się reguł z przykładów, zamiast pisania ich ręcznie.
---

# Czym jest uczenie maszynowe?

W zwykłym programowaniu to ty piszesz reguły: kod decyduje, jaki wynik dostaje każde wejście. W uczeniu maszynowym dajesz komputerowi **przykłady** wejść razem z poprawnymi wynikami, a on sam wypracowuje reguły.

$$
\text{przykłady} + \text{odpowiedzi} \;\longrightarrow\; \text{algorytm uczący} \;\longrightarrow\; \text{model}
$$

Klasycznym przykładem jest filtr antyspamowy. Ręcznie pisane reguły („blokuj e-maile, w których jest *darmowa kasa*”) przestają działać, gdy tylko spamerzy zmienią sformułowania. Wyuczony filtr analizuje tysiące e-maili oznaczonych jako *spam* albo *nie spam* i sam wychwytuje wzorce, także takie, na których spisanie nikt by nie wpadł.

## Trzy rodzaje uczenia

| Rodzaj            | Co dostarczasz               | Czego się uczy                          | Przykład                            |
| ----------------- | ---------------------------- | --------------------------------------- | ----------------------------------- |
| Nadzorowane       | wejścia **z** odpowiedziami  | przewidywać odpowiedź dla nowych wejść  | cena domu na podstawie powierzchni  |
| Nienadzorowane    | wejścia **bez** odpowiedzi   | znajdować strukturę w danych            | grupowanie klientów według zachowań |
| Przez wzmacnianie | środowisko i nagrodę         | wybierać działania przynoszące nagrodę  | granie w gry                        |

Uczenie nadzorowane dzieli się dalej według tego, co przewiduje:

- **Regresja** przewiduje liczbę, na przykład cenę albo temperaturę.
- **Klasyfikacja** przewiduje kategorię, na przykład spam albo nie spam, albo to, jaka cyfra jest na obrazku.

## Podstawowe pojęcia

- **Przykład** (albo próbka, ang. example, sample): jeden wiersz danych, na przykład jeden dom.
- **Cecha** (ang. feature): jeden pomiar wejściowy, na przykład powierzchnia. Cechy jednego przykładu tworzą wektor $x$.
- **Etykieta** (albo cel, ang. label, target): odpowiedź do przewidzenia, $y$.
- **Model**: funkcja, która zamienia cechy w predykcję, $\hat{y} = f(x)$.
- **Parametry**: liczby wewnątrz modelu, które dostosowuje uczenie.
- **Funkcja straty** (ang. loss): miara tego, jak daleko predykcje są od etykiet. Trening polega na jej zmniejszaniu.

Więcej pojęć, takich jak [SFT](../vocabulary/sft.pl.md) i [RL](../vocabulary/rl.pl.md), znajdziesz w rozdziale [Słownik](../vocabulary/).

## Dane treningowe, walidacyjne i testowe

Model, który zapamiętał dane treningowe, może wyglądać na idealny, a mimo to zawodzić na nowych danych. Nazywa się to **nadmiernym dopasowaniem** (ang. overfitting). Żeby je wychwycić, podziel dane na trzy części:

1. **Zbiór treningowy** służy do dopasowania parametrów.
2. **Zbiór walidacyjny** służy do porównywania modeli i dobierania ustawień, takich jak współczynnik uczenia.
3. **Zbiór testowy** jest używany raz, na samym końcu, żeby oszacować, jak model poradzi sobie z danymi, których nigdy nie widział.

> [!IMPORTANT]
> Gdy zbiór testowy wpłynie na jakąkolwiek decyzję, przestaje dawać uczciwą ocenę.

## Sprawdź się

<details>
<summary>Czy przewidywanie jutrzejszej temperatury to regresja, czy klasyfikacja?</summary>

Regresja, bo odpowiedzią jest liczba. Przewidywanie „będzie padać albo nie” byłoby klasyfikacją.

</details>

<details>
<summary>Dlaczego nie oceniać modelu na danych treningowych?</summary>

Model już widział te przykłady, więc może wypaść dobrze tylko dlatego, że je zapamiętał. Dopiero dane, których nie widział, pokazują, czy potrafi uogólniać.

</details>
