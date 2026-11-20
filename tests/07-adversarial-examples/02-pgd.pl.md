# PGD

## Co robi PGD, czego nie robi FGSM?

- [ ] Robi krok wzdłuż samego nachylenia, a nie jego znaku
- [x] Robi wiele małych kroków, przed każdym liczy nachylenia od nowa, a po każdym rzutuje obraz z powrotem do kuli
- [ ] Zmienia nie tylko obraz, ale też wagi sieci
- [ ] Pozwala pikselom zmienić się o więcej niż ε

FGSM liczy nachylenia raz, w punkcie wyjścia, i idzie za nimi aż do brzegu kuli. Sieć nie jest liniowa, więc po drodze nachylenia się zmieniają. PGD liczy je od nowa przed każdym małym krokiem, a rzutowanie utrzymuje każdy piksel najwyżej ε od wartości początkowej, czyli w tej samej kuli co FGSM.

## Piksel miał na początku wartość 0,4. Po kroku PGD z ε = 0,1 ma 0,27. Jaką wartość nada mu rzutowanie?

- [ ] 0,27
- [x] 0,3
- [ ] 0,4
- [ ] 0,17

Piksel jest o 0,13 poniżej wartości początkowej, czyli o więcej niż ε, więc wraca dokładnie na ε poniżej niej: 0,4 − 0,1 = 0,3. Piksel, który oddalił się najwyżej o ε, zostaje na miejscu.

## Która linijka sprowadza `X_adv` z powrotem do kuli o promieniu ε wokół `X`, z pikselami w dozwolonym zakresie?

- [ ] `X_adv.clamp(-epsilon, epsilon).clamp(0, 1)`
- [ ] `(X_adv - X).clamp(-epsilon, epsilon)`
- [x] `(X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)`
- [ ] `X_adv.clamp(0, epsilon)`

Kula otacza `X`, więc przycina się różnice `X_adv - X` do przedziału od −ε do ε i dodaje je z powrotem do `X`. Końcowe `clamp(0, 1)` utrzymuje piksele w dozwolonym zakresie. Przycięcie samego `X_adv` do przedziału od −ε do ε dałoby kulę wokół białego obrazu.

## PGD z ε = 0,1 i α = 0,025 robi 3 kroki, startując z oryginalnego obrazu. Jak daleko od wartości początkowej może się najwyżej znaleźć piksel?

- [ ] 0,1
- [x] 0,075
- [ ] 0,025
- [ ] 0,3

Każdy krok przesuwa piksel o α, więc trzy kroki przesuwają go najwyżej o 0,075. To nie sięga brzegu kuli, więc część kuli pozostaje niezbadana, a sieć wydaje się bardziej odporna, niż jest. Iloczyn liczby kroków i α powinien wyraźnie przekraczać ε.

## Dlaczego PGD zwykle startuje z losowego obrazu z kuli?

- [ ] Bo oryginalny obraz nie leży w kuli
- [ ] Żeby atak był szybszy
- [x] Bo w punkcie wyjścia nachylenia mogą słabo wskazywać kierunek, a z różnych punktów startowych atak może dojść do różnych obrazów
- [ ] Żeby atak nie potrzebował etykiet

W punkcie wyjścia nachylenia mogą wprowadzać w błąd albo nawet wynosić 0. A ponieważ z różnych punktów startowych atak może dojść w różne miejsca, można go uruchomić kilka razy i uznać atak na obraz za udany, jeśli udało się którekolwiek uruchomienie. Oryginalny obraz zawsze leży w swojej kuli.

## Pod FGSM z ε = 8/255 sieć zachowuje dokładność 80%. Co to mówi o jej dokładności pod atakiem dla tego ε?

- [ ] Wynosi dokładnie 80%
- [ ] Wynosi 80% albo więcej
- [x] Wynosi najwyżej 80%: silniejszy atak, na przykład PGD, może oszukać sieć na większej liczbie obrazów
- [ ] Nic, bo FGSM wychodzi poza kulę

Dokładność pod atakiem mówi tylko, czego nie zdołał zrobić jeden konkretny atak. FGSM to słaby atak: silniejszy atak w tej samej kuli zwykle oszuka sieć na tych samych obrazach i jeszcze na kilku innych. Wiarygodna jest więc liczba z najsilniejszego wypróbowanego ataku.

## Co w treningu adwersarialnym dzieje się z każdą porcją przed krokiem treningu?

- [ ] Dodaje się do niej losowe zmiany o wielkości ε
- [x] Zostaje zaatakowana atakiem skierowanym przeciwko sieci w jej obecnym stanie
- [ ] Zostaje zaatakowana atakiem skierowanym przeciwko sieci sprzed treningu
- [ ] Nic: atak przeprowadza się po treningu, żeby go ocenić

Każdą porcję atakuje się kilkoma krokami PGD skierowanego przeciwko bieżącym wagom, a sieć uczy się potem na zaatakowanych obrazach z ich prawdziwymi etykietami. Wagi zmieniają się z każdym krokiem optymalizatora, więc atak trzeba przygotowywać od nowa dla każdej porcji.

## Ile kosztuje trening adwersarialny?

- [ ] Nic: sieć staje się lepsza na każdym rodzaju obrazów
- [ ] Całą dokładność na niezmienionych obrazach
- [x] Trochę dokładności na niezmienionych obrazach i kilka razy dłuższy trening
- [ ] Większą sieć, bo atak potrzebuje własnych wag

Na cyfrach sieć trenowana na zaatakowanych obrazach rozpoznawała pod PGD 68% obrazów, a zwykła 51%. Na niezmienionych obrazach wyniki wynosiły 90% i 94%. Do tego każdy krok optymalizatora poprzedzało 5 kroków ataku, więc trening trwał kilka razy dłużej.
