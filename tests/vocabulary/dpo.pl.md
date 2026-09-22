# DPO

## Z jakich danych uczy się DPO?

- [ ] Z promptów, z których każdy ma jedną idealną odpowiedź
- [x] Z promptów, z których każdy ma odpowiedź preferowaną przez ludzi i odpowiedź odrzuconą
- [ ] Z nagród przyznawanych po sprawdzeniu, czy odpowiedź jest poprawna
- [ ] Z surowego tekstu z internetu

Podobnie jak RLHF, DPO uczy się z preferencji. SFT uczy się z idealnych odpowiedzi, a RLVR z automatycznego sprawdzania odpowiedzi.

## Które kroki RLHF DPO zastępuje jedną funkcją straty?

- [x] Trenowanie modelu nagrody
- [ ] SFT na przykładach dobrych odpowiedzi
- [x] Uruchomienie RL, w którym nagrodę daje model nagrody
- [ ] Zbieranie danych o preferencjach

DPO wciąż potrzebuje danych o preferencjach i zwykle zaczyna od modelu po SFT. Zastępuje model nagrody i krok RL jedną funkcją straty, która zwiększa różnicę między odpowiedzią preferowaną a odrzuconą.

## Czym jest $\pi_\text{ref}$ w funkcji straty DPO?

- [ ] Trenowanym modelem
- [ ] Modelem nagrody
- [x] Zamrożoną kopią modelu startowego, zwykle modelu po SFT
- [ ] Odpowiedzią preferowaną

Prawdopodobieństwo każdej odpowiedzi porównuje się z jej prawdopodobieństwem w zamrożonej kopii, a funkcja straty zwiększa różnicę między odpowiedzią preferowaną a odrzuconą.

## Co określa $\beta$ w DPO?

- [x] Jak mocno model jest trzymany blisko modelu odniesienia
- [ ] Współczynnik uczenia
- [ ] Ile par odpowiedzi jest używanych w jednym kroku
- [ ] Jak długie mogą być odpowiedzi

Pełni tę samą funkcję co kara KL w RLHF.

## Dlaczego DPO to popularny wybór, zwłaszcza w przypadku modeli otwartych?

- [ ] Nie potrzebuje danych o preferencjach
- [ ] Daje modelowi nową wiedzę
- [x] Optymalizuje ten sam cel co RLHF, a trening przebiega jak w zwykłym uczeniu nadzorowanym
- [ ] To jedyna metoda, która działa bez SFT

Artykuł o DPO (Rafailov i in., 2023) pokazał, że ta metoda optymalizuje ten sam cel co RLHF, a przy tym trenuje się ją prościej, taniej i stabilniej.
