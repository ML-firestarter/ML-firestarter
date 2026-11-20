# Urządzenia

## Który wiersz sprawia, że program działa na karcie graficznej, gdy komputer ją ma, a na procesorze, gdy jej nie ma?

- [x] `device = "cuda" if torch.cuda.is_available() else "cpu"`
- [ ] `device = "cuda"`
- [ ] `device = torch.cuda.is_available()`
- [ ] `device = "cpu" if torch.cuda.is_available() else "cuda"`

`is_available()` mówi, czy PyTorch może użyć karty NVIDIA, więc rozstrzyga, którą z dwóch nazw wybrać. Samo `"cuda"` kończy się błędem na komputerze bez karty, `is_available()` daje `True` albo `False`, a nie urządzenie, a w ostatnim wierszu nazwy są zamienione miejscami.

## Na jakim urządzeniu leży `torch.tensor([1.0, 2.0])`?

- [x] Na CPU
- [ ] Na GPU, jeśli komputer je ma
- [ ] Na najszybszym dostępnym urządzeniu
- [ ] Na żadnym, dopóki nie zostanie użyty

Nowy tensor leży na CPU, chyba że `device=` mówi inaczej. PyTorch nie przenosi tensorów sam ani nie szuka najszybszego urządzenia: do tego służy `device`, które program wybiera sam.

## Co robi `M.to(device)`?

- [x] Daje kopię `M` na `device`
- [ ] Zmienia `M` tak, żeby leżał na `device`
- [ ] Sprawia, że `M` wymaga gradientu na `device`
- [ ] Liczy `M` na `device`, ale przechowuje go na CPU

`.to` nie zmienia `M`, tylko daje tensor na wskazanym urządzeniu, dlatego w lekcji jest `M = M.to(device)`. Dla tensora, który już tam leży, daje ten sam tensor.

## `a` leży na GPU, a `b` na CPU. Co robi `a + b`?

- [x] Zatrzymuje program z błędem o dwóch różnych urządzeniach
- [ ] Przenosi `b` na GPU i tam liczy sumę
- [ ] Przenosi `a` na CPU i tam liczy sumę
- [ ] Liczy sumę na CPU i na GPU, a potem dodaje oba wyniki

PyTorch nigdy nie przenosi tensorów za twoimi plecami. Przenieś jeden z nich samodzielnie, na przykład przez `b.to(a.device)`, a suma zostanie policzona tam, gdzie leżą oba.

## Tworzysz `W` z `device="cuda"` i liczysz `y = W @ x`, gdzie `x` też leży na `cuda`. Gdzie leży `y`?

- [x] Na `cuda`
- [ ] Na CPU
- [ ] Na żadnym, dopóki nie zostanie wypisany
- [ ] Na obu

Operacja jest liczona tam, gdzie leżą jej tensory, i tam zostaje wynik. Żeby wypisać go jako tablicę NumPy, trzeba go najpierw sprowadzić z powrotem do procesora przez `.cpu()`.
