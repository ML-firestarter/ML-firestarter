---
description: Adaptacja niskiego rzędu (ang. low-rank adaptation). Tani sposób na dostrojenie dużego modelu przez trenowanie małych dodatkowych macierzy przy zamrożonych wagach modelu.
---

# LoRA

Pełne [dostrajanie](fine-tuning.pl.md) zmienia każdą wagę modelu. Wymaga to pamięci na wszystkie wagi, ich gradienty i stan optymalizatora, a każda dostrojona wersja jest pełną kopią modelu. LoRA (ang. low-rank adaptation, Hu i in., 2021) zamiast tego zamraża oryginalne wagi i trenuje niewielką poprawkę, którą się do nich dodaje.

Dla macierzy wag $W$ o $d$ wierszach i $k$ kolumnach poprawka jest iloczynem dwóch wąskich macierzy:

$$
W' = W + BA, \qquad B \in \mathbb{R}^{d \times r}, \quad A \in \mathbb{R}^{r \times k}
$$

Rząd $r$ jest mały, często od 8 do 64, więc $B$ i $A$ mają razem $r(d + k)$ liczb zamiast $dk$. Trenuje się tylko $B$ i $A$. Macierz $B$ startuje od zer, więc trening zaczyna się dokładnie od oryginalnego modelu.

Wytrenowane macierze tworzą *adapter*, zwykle o rozmiarze od kilku do kilkuset megabajtów, przechowywany osobno. Jeden model bazowy może obsługiwać wiele adapterów, na przykład po jednym na klienta albo zadanie. Po treningu $BA$ można też dodać do $W$, więc model działa dokładnie tak szybko jak wcześniej. QLoRA (Dettmers i in., 2023) trzyma zamrożony model w postaci [skwantyzowanej](quantization.pl.md) do 4 bitów podczas trenowania adapterów, dzięki czemu udało się dostroić model o 65 mld parametrów na jednym GPU z 48 GB pamięci.

**Przykład:** macierz wag 4096 × 4096 zawiera około 16,8 mln liczb. LoRA rzędu 8 dla tej macierzy ma 8 × (4096 + 4096) = 65 536 liczb, czyli około 0,4% tego, co pełna macierz.

**Powiązane:** [Dostrajanie](fine-tuning.pl.md) · [SFT](sft.pl.md) · [Kwantyzacja](quantization.pl.md) · [Model bazowy](base-model.pl.md)
