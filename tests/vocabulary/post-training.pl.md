# Post-training

## Co przede wszystkim kształtuje post-training?

- [ ] Większość faktów, które zna model
- [x] To, jak model korzysta z tego, co wie: wykonywanie poleceń, prowadzenie rozmowy, odmawianie szkodliwych próśb
- [ ] Wielkość okna kontekstowego
- [ ] Słownik tokenizatora

Pretrening daje modelowi szeroką wiedzę i wyczucie języka. Post-training w dużej mierze decyduje o tym, jak model się zachowuje.

## Co zwykle jest pierwszym krokiem post-trainingu?

- [x] SFT na przykładach dobrych odpowiedzi
- [ ] Dostrajanie do preferencji za pomocą RLHF albo DPO
- [ ] RLVR na zadaniach z matematyki i programowania
- [ ] Pretrening

Typowy przepis to SFT, potem dostrajanie do preferencji za pomocą RLHF albo DPO, a często też RLVR. Pretrening odbywa się przed post-trainingiem.

## Który krok uczy umiejętności, w których odpowiedzi da się sprawdzić, takich jak matematyka i programowanie?

- [ ] SFT
- [ ] DPO
- [x] RLVR
- [ ] Pretrening

RLVR nagradza odpowiedzi, które potrafi sprawdzić program.

## Model bazowy i zbudowany na nim model czatowy odpowiadają zupełnie inaczej. Dlaczego?

- [ ] Model czatowy przeszedł pretrening na większej ilości tekstu
- [x] Post-training zmienił to, jak model się zachowuje, a ich wiedza pozostała w dużej mierze ta sama
- [ ] Model czatowy jest większym modelem
- [ ] Model czatowy wyszukuje odpowiedzi w internecie

Różnica w tym, jak odpowiadają, bierze się z post-trainingu.

## Ile mocy obliczeniowej zużywa post-training w porównaniu z pretreningiem?

- [ ] Zawsze więcej niż pretrening
- [ ] Wcale, bo post-training nie zmienia wag
- [ ] Dokładnie tyle samo
- [x] Tradycyjnie niewielki ułamek, choć modele rozumujące przeznaczają coraz większą jej część na RL

Mimo to post-training w dużej mierze decyduje o tym, jak model się zachowuje.
