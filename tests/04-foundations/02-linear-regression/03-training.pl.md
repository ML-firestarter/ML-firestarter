# Trening

## Przy obecnym $w$ nachylenie straty wynosi −40. W którą stronę następny krok przesunie $w$?

- [x] W górę: $w$ się zwiększy
- [ ] W dół: $w$ się zmniejszy
- [ ] Nigdzie: $w$ zostanie na miejscu
- [ ] To zależy od wyrazu wolnego

Ujemne nachylenie oznacza, że strata maleje, gdy $w$ rośnie, więc w dół miski prowadzi większe $w$. Krok odejmuje nachylenie, a $w - \eta \times (-40)$ jest większe niż $w$.

## Przy $w = 5$ nachylenie względem $w$ wynosi 20, a współczynnik uczenia to 0,05. Ile wynosi $w$ po jednym kroku?

- [x] 4
- [ ] 6
- [ ] 4,95
- [ ] −15

Krok to współczynnik uczenia razy nachylenie, 0,05 × 20 = 1, i się go odejmuje: 5 − 1 = 4. 6 dodaje krok, czyli idzie pod górę, 4,95 odejmuje sam współczynnik uczenia, a −15 pomija współczynnik uczenia.

## Przez cztery kroki strata wynosi kolejno 50, 80, 150 i 310. Co zrobić?

- [x] Zmniejszyć współczynnik uczenia
- [ ] Zwiększyć współczynnik uczenia
- [ ] Trenować przez więcej kroków
- [ ] Zacząć od innego $w$

Strata, która rośnie z każdym krokiem, oznacza, że każdy krok przeskakuje dno bardziej niż poprzedni: trening się rozbiegł, bo współczynnik uczenia jest za duży. Więcej kroków tylko by to pogorszyło.

## Współczynnik uczenia przez cały czas jest taki sam. Dlaczego kroki skracają się przy dnie miski?

- [x] Miska jest tam bardziej płaska, więc nachylenie jest mniejsze
- [ ] Współczynnik uczenia maleje w miarę treningu
- [ ] Strata jest mniejsza, a każdy krok to współczynnik uczenia razy strata
- [ ] Każdy krok jest o połowę krótszy od poprzedniego

Każdy krok to współczynnik uczenia razy nachylenie, a nachylenie maleje, gdy miska spłaszcza się przy dnie. Współczynnik uczenia się nie zmienia, a krok zależy od nachylenia, a nie od samej straty.

## Regresję liniową da się rozwiązać dokładnie, bez żadnych kroków. Po co więc uczyć się na niej spadku gradientu?

- [x] Większość modeli, na przykład sieci neuronowe, nie ma dokładnego rozwiązania, a spadek gradientu trenuje je wszystkie
- [ ] Spadek gradientu znajduje lepszą prostą niż dokładne rozwiązanie
- [ ] Dokładne rozwiązanie działa tylko dla dwóch paragonów
- [ ] Spadek gradientu nie potrzebuje współczynnika uczenia

Dla regresji liniowej obie metody znajdują tę samą prostą. Ale prawie żaden inny model nie ma dokładnego rozwiązania, a spadek gradientu działa dla wszystkich, więc warto poznać go najpierw na najprostszym modelu.

## Strata wynosi 30 przy $w = 2$ i 24 przy $w = 2{,}1$. Ile mniej więcej wynosi tam nachylenie?

- [x] Około −60
- [ ] Około −6
- [ ] Około 60
- [ ] Około −0,6

Strata spadła o 6, gdy $w$ wzrosło o 0,1, więc spada mniej więcej o 6 ÷ 0,1 = 60 na każde 1 dodane do $w$. To spadek, więc nachylenie jest ujemne: około −60. −6 to zmiana straty, zanim podzieli się ją przez zmianę $w$, a 60 ma zły znak.
