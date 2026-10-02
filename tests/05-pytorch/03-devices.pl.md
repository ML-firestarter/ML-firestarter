# Urządzenia

## Który wiersz sprawia, że program działa na karcie graficznej, gdy komputer ją ma, a na procesorze, gdy jej nie ma?

- [x] `device = "cuda" if torch.cuda.is_available() else "cpu"`
- [ ] `device = "cuda"`
- [ ] `device = torch.cuda.is_available()`
- [ ] `device = "cpu" if torch.cuda.is_available() else "cuda"`

`is_available()` mówi, czy PyTorch może użyć karty NVIDIA, więc rozstrzyga między dwiema nazwami. Samo `"cuda"` zgłasza błąd na komputerze bez karty, `is_available()` daje `True` albo `False`, a nie urządzenie, a ostatni wiersz ma obie nazwy w złej kolejności.

## Na jakim urządzeniu leży `torch.tensor([1.0, 2.0])`?

- [x] Na CPU
- [ ] Na GPU, gdy jest
- [ ] Na tym urządzeniu, które jest najszybsze
- [ ] Nie ma urządzenia, dopóki nie zostanie użyty

Nowy tensor leży na CPU, chyba że `device=` mówi inaczej. PyTorch nie przenosi tensorów sam i nie szuka najszybszego urządzenia: do tego służy własny wybór `device` w programie.

## Co robi `M.to(device)`?

- [x] Daje kopię `M` na `device`
- [ ] Zmienia `M`, tak że leży na `device`
- [ ] Sprawia, że `M` wymaga gradientu na `device`
- [ ] Liczy `M` na `device`, a trzyma go na CPU

`.to` nie zmienia `M`: daje tensor na urządzeniu, dlatego lekcja pisze `M = M.to(device)`. Dla tensora, który już tam leży, daje ten sam tensor.

## `a` leży na GPU, a `b` na CPU. Co robi `a + b`?

- [x] Zatrzymuje się z błędem o dwóch urządzeniach
- [ ] Przenosi `b` na GPU i liczy tam sumę
- [ ] Przenosi `a` na CPU i liczy tam sumę
- [ ] Liczy sumę na CPU i na GPU i dodaje je

PyTorch nigdy nie przenosi tensorów za twoimi plecami. Przenieś jeden z nich samodzielnie, jak `b.to(a.device)`, a suma zostanie policzona tam, gdzie leżą oba.

## Utworzyłeś `W` z `device="cuda"` i liczysz `y = W @ x`, gdzie `x` też leży na `cuda`. Gdzie leży `y`?

- [x] Na `cuda`
- [ ] Na CPU
- [ ] Nie ma urządzenia, dopóki nie zostanie wypisany
- [ ] Na obu

Operacja jest liczona tam, gdzie leżą jej tensory, a wynik tam zostaje. Żeby wypisać go jako tablicę NumPy, trzeba go najpierw sprowadzić z powrotem na procesor, przez `.cpu()`.
