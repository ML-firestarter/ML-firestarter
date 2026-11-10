# PGD

## Co robi PGD, czego nie robi FGSM?

- [ ] Robi krok wzdłuż samego nachylenia, gdzie FGSM używa jego znaku
- [x] Robi wiele małych kroków, z nowymi nachyleniami przed każdym, i po każdym kroku rzutuje obraz z powrotem do kuli
- [ ] Zmienia wagi sieci, a nie tylko obraz
- [ ] Pozwala pikselom przesunąć się dalej niż o ε

FGSM mierzy nachylenia raz, przy obrazie, i idzie za nimi do brzegu kuli. Sieć się wygina, więc po drodze nachylenia są inne. PGD mierzy je od nowa przed każdym małym krokiem, a rzut trzyma obraz najwyżej ε od miejsca, z którego wyszedł, czyli w tej samej kuli co FGSM.

## Piksel zaczął od 0,4. Po kroku PGD z ε = 0,1 ma wartość 0,27. Gdzie umieszcza go rzut?

- [ ] Na 0,27
- [x] Na 0,3
- [ ] Na 0,4
- [ ] Na 0,17

Piksel jest 0,13 poniżej miejsca, z którego wyszedł, czyli o więcej niż ε, więc wraca dokładnie na ε poniżej: 0,4 − 0,1 = 0,3. Piksel, który jest najwyżej ε od swojego początku, zostaje tam, gdzie jest.

## Który wiersz sprowadza `X_adv` z powrotem do kuli ε wokół `X`, z poprawnymi pikselami?

- [ ] `X_adv.clamp(-epsilon, epsilon).clamp(0, 1)`
- [ ] `(X_adv - X).clamp(-epsilon, epsilon)`
- [x] `(X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)`
- [ ] `X_adv.clamp(0, epsilon)`

Kula jest wokół `X`, więc to różnice `X_adv - X` przycina się do przedziału od −ε do ε, a potem dodaje z powrotem do `X`. Ostatnie `clamp(0, 1)` dba o to, żeby każdy piksel był pikselem. Przycięcie samego `X_adv` do przedziału od −ε do ε dałoby kulę wokół białego obrazu.

## PGD z ε = 0,1 i α = 0,025 robi 3 kroki, zaczynając od samego obrazu. Jak daleko od swojego początku może najwyżej skończyć piksel?

- [ ] 0,1
- [x] 0,075
- [ ] 0,025
- [ ] 0,3

Każdy krok przesuwa piksel o α, więc trzy kroki przesuwają go najwyżej o 0,075. To nie sięga brzegu kuli, więc części kuli atak nigdy nie sprawdza, a sieć wygląda na bardziej odporną, niż jest. Liczba kroków razy α powinna dawać wyraźnie więcej niż ε.

## Dlaczego PGD zwykle zaczyna od losowego obrazu w kuli?

- [ ] Bo sam obraz nie leży w kuli
- [ ] Żeby atak był szybszy
- [x] Bo nachylenia przy samym obrazie mogą być kiepskimi przewodnikami, a różne starty mogą kończyć się na różnych obrazach
- [ ] Żeby atak nie potrzebował etykiet

Przy samym obrazie nachylenia mogą wprowadzać w błąd albo nawet wynosić 0. A ponieważ każdy start może prowadzić gdzie indziej, atak można uruchomić kilka razy i liczyć obraz jako oszukany, gdy oszuka go którekolwiek z uruchomień. Sam obraz zawsze leży w swojej kuli.

## Sieć zachowuje dokładność 80% pod FGSM z ε = 8/255. Co to mówi o jej dokładności pod atakiem dla tego ε?

- [ ] Wynosi dokładnie 80%
- [ ] Wynosi 80% albo więcej
- [x] Wynosi najwyżej 80%: silniejszy atak, jak PGD, może oszukać więcej obrazów
- [ ] Nic, bo FGSM nie zostaje w kuli

Dokładność pod atakiem mówi tylko, czego nie zdołał zrobić jeden atak. FGSM to słaby atak, a to, co on oszuka, oszuka też silniejszy atak w tej samej kuli, zwykle razem z innymi obrazami. Liczba, której można ufać, to więc ta z najsilniejszego wypróbowanego ataku.

## Co dzieje się w treningu antagonistycznym z każdą porcją, zanim sieć się na niej uczy?

- [ ] Dodaje się do niej losowe zmiany wielkości ε
- [x] Jest atakowana, przeciwko sieci takiej, jaka jest w tej chwili
- [ ] Jest atakowana, przeciwko sieci takiej, jaka była przed treningiem
- [ ] Nic: atak przychodzi po treningu, żeby go zmierzyć

Każda porcja jest atakowana kilkoma krokami PGD przeciwko bieżącym wagom, a sieć uczy się potem na zaatakowanych obrazach z ich właściwymi etykietami. Wagi zmieniają się z każdym krokiem optymalizatora, więc atak trzeba robić od nowa dla każdej porcji.

## Ile kosztuje trening antagonistyczny?

- [ ] Nic: sieć staje się lepsza na każdym rodzaju obrazów
- [ ] Całą dokładność na nietkniętych obrazach
- [x] Trochę dokładności na nietkniętych obrazach i kilka razy dłuższy trening
- [ ] Większą sieć, bo atak potrzebuje własnych wag

Na cyfrach sieć wytrenowana na zaatakowanych obrazach czytała dobrze pod PGD 68% obrazów, wobec 51% dla zwykłej, a nietkniętych 90%, wobec 94%. Do tego każdy krok optymalizatora przychodził po 5 krokach ataku, więc trening trwał kilka razy dłużej.
