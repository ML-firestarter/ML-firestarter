# SFT

## Na czym trenuje się model w SFT?

- [ ] Na parach lepszych i gorszych odpowiedzi
- [x] Na promptach połączonych z wysokiej jakości odpowiedziami
- [ ] Na nagrodach ze sprawdzania odpowiedzi
- [ ] Na surowym tekście z internetu

Model uczy się tworzyć odpowiedzi takie jak w przykładach. Pary odpowiedzi służą do RLHF i DPO, sprawdzane odpowiedzi do RLVR, a surowy tekst do pretreningu.

## Jakiej funkcji straty używa SFT?

- [ ] Błędu średniokwadratowego
- [ ] Oceny od modelu nagrody
- [ ] Straty przewidywania następnego tokenu, liczonej tylko na prompcie
- [x] Tej samej straty przewidywania następnego tokenu co pretrening, zwykle liczonej tylko na odpowiedzi

Model uczy się pisać odpowiedź, a nie przewidywać prompt.

## Dlaczego SFT nazywa się dostrajaniem *nadzorowanym*?

- [x] Każdy przykład ma odpowiedź do naśladowania
- [ ] Ludzie obserwują model podczas treningu
- [ ] Model sam nadzoruje swój trening
- [ ] Robi się je dopiero wtedy, gdy nadzorca zatwierdzi model

W RL model dostaje za to tylko ocenę.

## Dlaczego po SFT zwykle następuje RLHF, DPO albo RLVR?

- [ ] SFT nie potrafi nauczyć formatu ani tonu
- [ ] SFT potrzebuje milionów przykładów, żeby w ogóle działać
- [x] Model naśladuje przykłady, więc ogranicza go ich jakość
- [ ] SFT sprawia, że model zapomina to, czego nauczył się w pretreningu

SFT to skuteczny sposób na nauczenie formatu, tonu i wykonywania poleceń, a zbiory danych zaczynają się od około tysiąca starannie dobranych przykładów. Ponieważ jednak model naśladuje przykłady, ogranicza go ich jakość.

## Skąd pochodzą odpowiedzi w zbiorze danych do SFT?

- [x] Piszą je ludzie
- [ ] Losuje się je z modelu bazowego i używa bez sprawdzania
- [x] Generują je inne modele, a zostawia się najlepsze
- [ ] Kopiuje się je z internetu w niezmienionej postaci

Odpowiedzi piszą ludzie albo generują je inne modele, a potem się je filtruje.
