---
description: Model prosto po pretreningu. Dobrze kontynuuje tekst, ale nikt go jeszcze nie nauczył wykonywać poleceń.
---

# Model bazowy

Model bazowy nauczył się jednej rzeczy: przewidywania następnego [tokenu](token.pl.md) w ogromnej ilości tekstu. Dzięki temu dużo wie, ale nie jest jeszcze asystentem. Zadaj mu pytanie, a może odpowie, ale może też dopisać kolejne pytania, bo to również prawdopodobna kontynuacja.

[Post-training](post-training.pl.md) zamienia model bazowy w model *instrukcyjny* albo *czatowy* (ang. instruct, chat), który wykonuje polecenia i prowadzi rozmowę. Modele bazowe wciąż się przydają jako punkt wyjścia do własnego [dostrajania](fine-tuning.pl.md).

**Przykład:** po „Stolicą Francji jest” model bazowy dopisze „Paryż”. Po „Napisz haiku o morzu.” może dodać „Napisz haiku o górach.”, jakby kontynuował listę ćwiczeń z pisania.

**Powiązane:** [Pretrening](pretraining.pl.md) · [Post-training](post-training.pl.md) · [SFT](sft.pl.md)
