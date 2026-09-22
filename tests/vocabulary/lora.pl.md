# LoRA

## Co trenuje LoRA?

- [ ] Wszystkie wagi, z mniejszym współczynnikiem uczenia
- [ ] Tylko ostatnią warstwę modelu
- [ ] Mniejszą kopię modelu
- [x] Dwie małe macierze, których iloczyn dodaje się do zamrożonych wag

Oryginalne wagi pozostają zamrożone. Trenuje się tylko $B$ i $A$, a $W' = W + BA$.

## Macierz wag 4096 × 4096 dostaje LoRA rzędu 8. Ile liczb zawiera ta LoRA?

- [ ] Około 16,8 mln
- [x] 65 536
- [ ] 32 768
- [ ] 131 072

$B$ i $A$ mają razem $r(d + k)$ liczb: 8 × (4096 + 4096) = 65 536, czyli około 0,4% z 16,8 mln liczb pełnej macierzy.

## Dlaczego macierz $B$ startuje od zer?

- [x] Żeby trening zaczynał się dokładnie od oryginalnego modelu
- [ ] Żeby plik adaptera był mniejszy
- [ ] Żeby rząd pozostał mały
- [ ] Żeby nie trzeba było trenować $A$

Gdy $B = 0$, poprawka $BA$ też jest zerowa, więc na początku treningu $W' = W$.

## Co można zrobić z wytrenowanym adapterem LoRA?

- [x] Trzymać wiele adapterów, po jednym na klienta albo zadanie, dla jednego modelu bazowego
- [ ] Uruchomić go bez modelu bazowego
- [x] Dodać $BA$ do $W$, żeby model działał dokładnie tak szybko jak wcześniej
- [ ] Użyć go, żeby zmniejszyć model bazowy do rozmiaru adaptera

Adapter to poprawka do wag modelu bazowego, zwykle o rozmiarze od kilku do kilkuset megabajtów, przechowywana osobno. Bez modelu, który poprawia, jest bezużyteczny.

## Co wnosi QLoRA w porównaniu z LoRA?

- [ ] Trenuje wszystkie wagi w 4 bitach
- [x] Trzyma zamrożony model skwantyzowany do 4 bitów podczas trenowania adapterów
- [ ] Kwantyzuje adaptery do 1 bitu
- [ ] Sprawia, że GPU nie jest potrzebne

Dzięki temu udało się dostroić model o 65 mld parametrów na jednym GPU z 48 GB pamięci.
