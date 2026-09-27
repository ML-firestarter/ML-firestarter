# Warstwy neuronów

## Kierowcy odrzucają krótkie i długie kursy, a przyjmują te pośrodku. Dlaczego regresja logistyczna, której wejściem jest długość kursu, nie potrafi tego oddać?

- [x] Jej S zawsze idzie tylko w jedną stronę, a policzone odsetki najpierw spadają, a potem znów rosną
- [ ] Jej prawdopodobieństwa nigdy nie przekraczają 0,5
- [ ] Potrzebowałaby więcej niż 700 zamówień
- [ ] Sigmoida nie daje prawdopodobieństw bliskich 0

Krzywa $\sigma(wx + b)$ może być stroma albo łagodna, leżeć bardziej w lewo albo w prawo i opadać zamiast rosnąć, ale nie potrafi zawrócić. Najlepsze S dla tych odsetków tylko łagodnie rośnie, od 0,18 do 0,48. To, że nie dochodzi do 0,5, wynika z kształtu U, a nie z sigmoidy, która może zbliżyć się do 0 albo do 1 tak bardzo, jak pozwolą na to waga i wyraz wolny. Więcej zamówień dałoby tylko dokładniej to samo U.

## Dla pewnego kursu neurony ukryte dają $h_1 = 0{,}5$ i $h_2 = 0$, a neuron wyjściowy to $p = \sigma(4h_1 + 4h_2 - 1)$. Ile wynosi $p$?

- [x] $\sigma(1)$, około 0,731
- [ ] $\sigma(3)$, około 0,953
- [ ] 1
- [ ] 0,5

Prosta neuronu wyjściowego daje $z = 4 \times 0{,}5 + 4 \times 0 - 1 = 1$, a sigmoida zamienia to w $p = \sigma(1) = 0{,}731$. $\sigma(3)$ bierze wyraz wolny ze złym znakiem, 1 to samo $z$, bez sigmoidy, a 0,5 to $h_1$, aktywacja neuronu ukrytego, a nie predykcja sieci.

## W sieci z lekcji $b_1$ zmienia się z 6 na 10, a nic innego się nie zmienia. Co się dzieje?

- [x] Pierwsze S przesuwa się z 3 na 5 km, więc kursy na 4 km też dostają wysokie prawdopodobieństwo
- [ ] Pierwsze S przesuwa się z 3 na 1 km, więc wysokie prawdopodobieństwo dostają tylko najkrótsze kursy
- [ ] Pierwsze S staje się bardziej strome, ale zostaje przy 3 km
- [ ] Długie kursy dostają wyższe prawdopodobieństwo

S jest w połowie wysokości tam, gdzie prosta wewnątrz niego wynosi 0. Dla $h_1 = \sigma(-2x + 10)$ to $x = 5$, 2 km dalej w prawo niż wcześniej, więc teraz $h_1$ jest bliskie 1 mniej więcej do 4 km, a sieć daje kursom na 4 km 0,628. To, jak strome jest S, zależy od wagi, −2, która się nie zmieniła, a $b_1$ należy do pierwszego neuronu ukrytego, który odpowiada za krótkie kursy.

## Usuń sigmoidy z warstwy ukrytej, tak żeby $h_1 = w_1 x + b_1$ i $h_2 = w_2 x + b_2$, a neuron wyjściowy zostaw bez zmian. Jakie kształty może wtedy narysować sieć?

- [x] Tylko S, tak jak pojedyncza regresja logistyczna
- [ ] U, tak jak wcześniej
- [ ] Dowolny kształt, jeśli ma dość neuronów ukrytych
- [ ] Tylko płaską linię, z tym samym prawdopodobieństwem dla każdego kursu

Wstaw obie proste do prostej neuronu wyjściowego, a wynik nadal będzie prostą: $z = (v_1 w_1 + v_2 w_2)\,x + (v_1 b_1 + v_2 b_2 + c)$. $p$ to więc sigmoida prostej, czyli S, tak samo jak w regresji logistycznej, a więcej neuronów ukrytych dodałoby do sumy tylko więcej prostych. Prosta jest płaska tylko wtedy, gdy wagi się znoszą, jak te z lekcji, które dają $z = -67$ dla każdego kursu.

## Sieć ma 3 wejścia, jedną warstwę ukrytą z 4 neuronami i 1 neuron wyjściowy, a jej warstwy są w pełni połączone. Ile ma parametrów?

- [x] 21
- [ ] 16
- [ ] 13
- [ ] 8

Każdy neuron ukryty ma wagę dla każdego z 3 wejść i wyraz wolny, więc warstwa ukryta ma 4 × (3 + 1) = 16 parametrów. Neuron wyjściowy ma wagę dla każdego z 4 neuronów ukrytych i wyraz wolny, czyli jeszcze 5, razem 21. 16 to tylko warstwa ukryta, 13 daje każdemu neuronowi ukrytemu jedną wagę, jakby wejście było jedno, a 8 to liczba wejść i neuronów, a nie parametrów.

## Sieć ma $h_1 = \text{ReLU}(-x + 3)$, $h_2 = \text{ReLU}(x - 11)$ i $p = \sigma(4h_1 + 4h_2 - 3)$. Jakie prawdopodobieństwo daje kursowi na 13 km?

- [x] $\sigma(5)$, około 0,993
- [ ] $\sigma(1)$, około 0,731
- [ ] $\sigma(-3)$, około 0,047
- [ ] $\sigma(-35)$, praktycznie 0

Przy 13 km $-x + 3 = -10$, co ReLU zamienia na 0, a $x - 11 = 2$, co ReLU zostawia bez zmian. Stąd $z = 4 \times 0 + 4 \times 2 - 3 = 5$. $\sigma(1)$ traktuje $h_2$ tak, jakby zatrzymywało się na 1, jak sigmoida, ale ReLU rośnie dalej. $\sigma(-3)$ zamienia oba na 0, a $\sigma(-35)$ zostawia −10, które ReLU zamienia na 0.
