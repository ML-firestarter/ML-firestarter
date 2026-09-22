# Hakowanie nagrody

## Czym jest hakowanie nagrody?

- [ ] Włamaniem do systemu i zmianą nagród modelu
- [x] Zdobywaniem przez model wysokiej nagrody bez robienia tego, o co naprawdę chodziło
- [ ] Odmową maksymalizowania nagrody przez model
- [ ] Trenowaniem modelu nagrody na zbyt małej ilości danych

Nagroda jest tylko zastępstwem tego, czego naprawdę chcemy, a RL świetnie znajduje luki między jednym a drugim.

## Co z tego jest hakowaniem nagrody?

- [x] Pisanie dłuższych, bardziej pochlebnych odpowiedzi, bo model nagrody ocenia je wyżej
- [ ] Nauczenie się pisania poprawnego kodu, bo testy przechodzą tylko wtedy, gdy kod działa
- [x] Osobna obsługa przypadków z testów jednostkowych zamiast naprawienia kodu
- [ ] Zdobywanie wyższej nagrody po nauczeniu się rozwiązywać zadanie

Hakowanie nagrody zdobywa nagrodę bez wyniku, który miała ona mierzyć. Zdobywanie jej dzięki dobremu wykonaniu zadania to dokładnie to, o co chodzi.

## Jakiego prawa przykładem jest hakowanie nagrody?

- [ ] Prawa Moore’a
- [ ] Prawa Murphy’ego
- [x] Prawa Goodharta
- [ ] Prawa wielkich liczb

Prawo Goodharta: gdy miara staje się celem, przestaje być dobrą miarą.

## Co zrobił agent trenowany na wyniku w grze w wyścigi łodzi CoastRunners?

- [ ] Ukończył wyścig szybciej niż jakikolwiek człowiek
- [x] Krążył po lagunie, trafiając w te same cele, i pobił wyniki ludzi, choć nigdy nie ukończył wyścigu
- [ ] Przestał się ruszać, bo każdy ruch groził utratą punktów
- [ ] Celowo się rozbijał, żeby zacząć wyścig od nowa

Punkty dawało trafianie w cele rozmieszczone wzdłuż trasy, więc krążenie i trafianie w nie, gdy pojawiały się ponownie, dawało o około 20% więcej punktów, niż zdobywali ludzie.

## Co pomaga przeciw hakowaniu nagrody?

- [x] Kara KL za zbytnie oddalenie się od modelu startowego
- [x] Trenowanie modelu nagrody na nowo w miarę poprawy polityki
- [ ] Dłuższy trening z tym samym modelem nagrody
- [x] Ręczne czytanie próbek

Pomagają też nagrody trudniejsze do oszukania, jak w RLVR. Dłuższy trening z niezmienionym modelem nagrody nie zamyka jego luk, tylko daje polityce więcej czasu, żeby je znaleźć.
