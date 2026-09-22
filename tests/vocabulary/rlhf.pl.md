# RLHF

## Jakie są trzy kroki klasycznego przepisu na RLHF, po kolei?

- [ ] Model nagrody, potem SFT, potem RL
- [x] SFT, potem model nagrody, potem RL
- [ ] SFT, potem RL, potem model nagrody
- [ ] RL, potem SFT, potem model nagrody

Najpierw dostraja się model bazowy na przykładach dobrych odpowiedzi, potem trenuje model nagrody na ludzkich porównaniach, a na końcu za pomocą RL kieruje model w stronę odpowiedzi, które model nagrody wysoko ocenia.

## Czym jest polityka na początku kroku RL?

- [x] Modelem po SFT
- [ ] Modelem bazowym, jeszcze przed dostrajaniem
- [ ] Modelem nagrody
- [ ] Nowym modelem wytrenowanym od zera

Model po SFT, teraz nazywany polityką, pisze odpowiedzi, które są oceniane.

## Kto w kroku RL pisze odpowiedzi i co je ocenia?

- [ ] Piszą je ludzie, a ocenia model nagrody
- [ ] Pisze je polityka, a ludzie oceniają każdą z nich
- [x] Pisze je polityka, a ocenia model nagrody
- [ ] Pisze je model nagrody, a ocenia polityka

Ludzie tylko porównują odpowiedzi, żeby wytrenować model nagrody. Potem model nagrody ocenia odpowiedzi polityki bez udziału człowieka.

## Co robi kara KL?

- [ ] Skraca odpowiedzi
- [x] Karze politykę za oddalanie się od modelu po SFT
- [ ] Przyspiesza trening
- [ ] Nagradza politykę za zgadzanie się z ludźmi

Bez niej polityka dryfuje w stronę dziwnych odpowiedzi, które akurat oszukują model nagrody, czyli w stronę hakowania nagrody. $\beta$ określa, jak mocno oddalanie się jest karane.

## Czym jest RLAIF?

- [ ] RLHF bez kroku SFT
- [ ] RLHF bez modelu nagrody
- [ ] RLHF z nagrodami ze sprawdzania odpowiedzi
- [x] RLHF z sędzią AI zamiast ludzi oceniających odpowiedzi

Całkowite pominięcie modelu nagrody i pętli RL to DPO, a nagrody ze sprawdzania odpowiedzi to RLVR.
