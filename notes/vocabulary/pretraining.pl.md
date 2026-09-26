---
description: Pierwszy i największy etap treningu, w którym model uczy się przewidywać następny token w ogromnej ilości tekstu.
---

# Pretrening

Podczas pretreningu (ang. pretraining) model językowy czyta biliony [tokenów](token.pl.md) tekstu, takiego jak strony internetowe, książki i kod, i w każdym miejscu przewiduje następny token. Funkcja straty (entropia krzyżowa) jest niska, gdy model dał wysokie prawdopodobieństwo tokenowi, który rzeczywiście pojawił się jako następny, a spadek gradientu ją obniża. To ten sam pomysł co w [lekcji o regresji liniowej](../04-foundations/02-linear-regression.pl.md), tylko z miliardami parametrów zamiast dwóch.

Nikt nie musi niczego etykietować, bo odpowiedzi dostarcza sam tekst. Dlatego nazywa się to uczeniem *samonadzorowanym* (ang. self-supervised). Okazuje się, że dobre przewidywanie tekstu wymaga znajomości gramatyki, faktów i pewnej zdolności rozumowania, więc wynik, czyli [model bazowy](base-model.pl.md), wie bardzo dużo.

W przypadku dużych modeli to najdroższy etap: tygodnie albo miesiące pracy tysięcy GPU.

**Przykład:** zdanie „Kot siedzi na macie” daje naraz kilka przykładów treningowych: przewidzieć „siedzi” po „Kot”, „na” po „Kot siedzi” i tak dalej (przy założeniu, że każde słowo to jeden token).

**Powiązane:** [Model bazowy](base-model.pl.md) · [Token](token.pl.md) · [Post-training](post-training.pl.md)
