# Przygotowanie wejść

## Regresja logistyczna na samych km potrafi narysować tylko S. Z km² jako drugim wejściem rysuje U. Jak?

- [x] $z$ spada, a potem znów rośnie, bo waga km jest ujemna, waga km² dodatnia, a km² rośnie szybciej niż km
- [ ] km² zamienia regresję logistyczną w sieć z warstwą ukrytą
- [ ] Sigmoida wygina się w drugą stronę dla wejść większych niż 100
- [ ] km² mówi o zamówieniach coś, czego nie mówi km

Trening znajduje $w_1 = -1{,}51$ i $w_2 = 0{,}103$. Przy krótkich kursach waga km ciągnie $z$ w dół, ale km² rośnie dużo szybciej niż km, więc przy długich waga km² pcha je z powrotem w górę: $z$ osiąga najniższą wartość przy około 7,3 km, a sigmoida zamienia to w U. To wciąż regresja logistyczna, bez warstwy ukrytej i z tą samą sigmoidą. km² nie mówi o zamówieniach nic nowego, bo jest policzone z km: pozwala tylko wygiąć $z$.

## Sieć z pierwszej lekcji rysuje U z samych km, bez km². Jak?

- [x] Jej neurony ukryte liczą wejścia dla neuronu wyjściowego, z wag znalezionych przez trening
- [ ] Każdy jej neuron mnoży swoje wejście przez samo siebie, więc sama liczy km²
- [ ] Jej neuron wyjściowy nie ma sigmoidy, więc nie jest ograniczony do S
- [ ] Nie potrafi: rysuje U tylko wtedy, gdy dostaje też km²

Każdy neuron ukryty to mała regresja logistyczna na km: $h_1$ odpowiada za krótkie kursy, a $h_2$ za długie. To wejścia neuronu wyjściowego, który składa z nich U. Nikt nie musiał zobaczyć U i ich wybrać, bo ich wagi znalazł trening, tak samo jak wagi neuronu wyjściowego. Żaden neuron nie mnoży wejścia przez samo siebie: każdy mnoży swoje wejścia przez wagi, dodaje wyraz wolny i przepuszcza wynik przez sigmoidę, neuron wyjściowy też.

## Trening regresji logistycznej na km i km² w oryginalnej postaci trwa ponad 100 000 kroków. Dlaczego?

- [x] km² jest dużo większe niż km i 1, więc współczynnik uczenia, który pasuje do $w_2$, jest o wiele za mały dla $w_1$ i $b$
- [ ] Jej strata ma płaskie miejsca, jak strata sieci, w których każde nachylenie jest bliskie 0
- [ ] Każdy krok korzysta ze wszystkich 700 zamówień zamiast z minipaczki
- [ ] Spadek gradientu zmienia w każdym kroku tylko jedną z trzech wag

Krok zmienia $z$ przez każdą wagę o zmianę wagi razy jej wejście, a przy kursie na 14 km $w_2$ mnoży 196, $w_1$ mnoży 14, a $b$ tylko 1. Przy współczynniku uczenia na tyle dużym, żeby przesuwać $w_1$ i $b$, waga $w_2$ przestrzeliwuje, więc współczynnik uczenia musi pasować do $w_2$, a wtedy $w_1$ i $b$ się wloką. Regresja logistyczna nie ma płaskich miejsc takich jak sieć, bo jedynym miejscem, w którym wszystkie jej nachylenia wynoszą 0, jest dno. Każdy krok zmienia wszystkie trzy wagi, a minipaczki przyspieszyłyby każdy krok, ale nie zmniejszyłyby liczby kroków.

## Kursy treningowe mają średnią długość 8 km i rozrzut 4 km. Jako co wchodzi kurs na 14 km po standaryzacji?

- [x] 1,5
- [ ] 6
- [ ] 3,5
- [ ] 1,25

Standaryzacja odejmuje średnią i dzieli przez rozrzut: (14 − 8) ÷ 4 = 1,5. 6 tylko odejmuje średnią, 3,5 tylko dzieli przez rozrzut, a 1,25, czyli (14 − 4) ÷ 8, zamienia średnią i rozrzut miejscami.

## Co robi standaryzacja wejścia?

- [x] Daje wejściu średnią 0 i rozrzut 1 na zamówieniach treningowych
- [ ] Sprowadza każdą wartość wejścia do przedziału od 0 do 1
- [ ] Daje wejściu średnią 1 i rozrzut 0
- [ ] Zmienia model, tak że rysuje inne U

Odjęcie średniej wyśrodkowuje wejście na 0, a dzielenie przez rozrzut skaluje je tak, że jego rozrzut wynosi 1: kursy od 2 do 14 km wchodzą jako liczby od −1,5 do 1,5. Sprowadzanie każdej wartości do przedziału od 0 do 1 to skalowanie min-max, a wartości po standaryzacji mogą być ujemne albo większe niż 1, jak 1,77 dla km² kursu na 14 km. Rozrzut 0 oznaczałby, że wszystkie wartości są takie same. A model rysuje to samo U: standaryzacja tylko odejmuje jedną liczbę i dzieli przez drugą, więc wagi zmieniają się tak, żeby to wyrównać, a predykcje nie.

## Model wytrenowano na wejściach po standaryzacji. Jaką średnią i jakim rozrzutem trzeba wystandaryzować wejścia nowego zamówienia?

- [x] Tymi z zamówień treningowych, tak jak w treningu
- [ ] Ich własnymi, policzonymi na nowych zamówieniach z danego dnia
- [ ] Żadnymi, bo nowe zamówienia wchodzą bez zmian
- [ ] Średnią 0 i rozrzutem 1

Wagi działają tylko na wejściach wystandaryzowanych tak jak w treningu, więc średnie i rozrzuty są częścią modelu i przechowuje się je razem z jego wagami. Z własną średnią i rozrzutem nowych zamówień ten sam kurs wchodziłby jako inna liczba, zależnie od tego, jakie inne zamówienia przyszły razem z nim, a pojedyncze zamówienie miałoby rozrzut 0 i nie byłoby przez co dzielić. Wejścia bez zmian byłyby o wiele za duże: kurs na 5 km dostaje $z = 137{,}5$, a model jest pewien, że zostanie odrzucony. Średnią 0 i rozrzut 1 wejścia mają dopiero po standaryzacji, a nie standaryzuje się ich tymi liczbami.
