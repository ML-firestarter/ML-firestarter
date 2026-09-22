# Okno kontekstowe

## Co musi się zmieścić w oknie kontekstowym?

- [x] Instrukcje i dotychczasowa rozmowa
- [x] Dokumenty i wyniki narzędzi
- [x] Sama odpowiedź, w trakcie pisania
- [ ] Dane treningowe modelu

Musi się zmieścić wszystko, czego model używa do napisania odpowiedzi, łącznie z samą odpowiedzią. Dane treningowe ukształtowały wagi modelu; w oknie ich nie ma.

## Jak aplikacja czatu sprawia, że model zdaje się pamiętać rozmowę?

- [ ] Model przechowuje między zapytaniami pamięć o każdym użytkowniku
- [ ] Dostraja model po każdej wiadomości
- [x] Przy każdej wiadomości wysyła całą rozmowę od nowa
- [ ] Model zapisuje rozmowę w swoich wagach

Model nie ma pamięci między zapytaniami. Ponieważ cała rozmowa jest wysyłana za każdym razem, długie rozmowy zajmują coraz więcej okna i coraz więcej kosztują.

## Okno kontekstowe się zapełniło. Co może zrobić aplikacja?

- [x] Usunąć albo streścić stare wiadomości
- [ ] Skwantyzować model, żeby powiększyć okno
- [x] Przeszukiwać dokumenty za pomocą RAG, zamiast wklejać je w całości
- [ ] Nic: model po prostu czyta dalej, poza końcem okna

Coś trzeba poświęcić: stare wiadomości są usuwane albo streszczane, a dokumenty skracane albo przeszukiwane za pomocą RAG. Kwantyzacja zmniejsza wagi, a nie ilość tekstu, którą model może przyjąć.

## Ile mniej więcej angielskich słów mieści się w oknie o wielkości 200 000 tokenów?

- [ ] Około 270 000
- [ ] Około 200 000
- [x] Około 150 000
- [ ] Około 50 000

Token to około trzech czwartych angielskiego słowa, więc 200 000 tokenów mieści mniej więcej 150 000 słów, czyli mniej więcej dwie powieści. Tekstu po polsku zmieści się mniej, bo polskie słowa zwykle dzielą się na więcej tokenów.

## Czy większe okno kontekstowe oznacza, że model dobrze wykorzystuje wszystko, co w nim jest?

- [ ] Tak, bo każdy token liczy się tak samo
- [x] Nie: modele potrafią przeoczyć szczegóły w środku długiego kontekstu, a każdy token zwiększa koszt i czas
- [ ] Tak, o ile tekst jest po angielsku
- [ ] Nie, bo model czyta tylko ostatnie 2000 tokenów

Duże okno nie gwarantuje, że model dobrze je wykorzysta, a każdy dodatkowy token sprawia, że inferencja jest wolniejsza i droższa.
