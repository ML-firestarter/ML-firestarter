---
description: Dowiedz się, gdzie PyTorch może liczyć twoje tensory, na procesorze czy na karcie graficznej, napisz kod, który wybiera najlepsze urządzenie, i przenieś na nie tensory.
---

# Urządzenia

Policzenie predykcji dla kilku kursów taksówki nie zajmuje wcale czasu. Trening sieci na milionach z nich trwa godzinami, chyba że arytmetyka działa na **karcie graficznej**, czyli GPU, która liczy tysiące małych działań naraz. PyTorch potrafi liczyć tensory na takiej karcie i prosi tylko o jedno: żebyś powiedział, gdzie każdy tensor leży. Ta lekcja jest o tym, jak to powiedzieć.

> [!NOTE]
> Ta strona nie ma karty graficznej, więc wszystko tutaj działa na procesorze, czyli **CPU**. Kod jest napisany tak, jak napisałbyś go dla komputera z GPU, a na takim komputerze ten sam kod działa na karcie bez żadnej zmiany. [PyTorch na stronie](../01-start-here/01-how-this-works.pl.md#pytorch-na-stronie) mówi, co jeszcze jest inne.

## Gdzie leży tensor

Każdy tensor ma `device` (urządzenie): `cpu` to procesor, `cuda` to karta graficzna NVIDIA, a `mps` to układ graficzny komputera Apple. Nowy tensor leży na CPU, chyba że powiesz inaczej:

```python run
import torch

M = torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
print(M.device)
print(M.device.type)
print(torch.device("cpu"))
```

## Wybór urządzenia

O to, jakie urządzenia ma komputer, możesz zapytać PyTorcha. Zwykle wybiera się kartę graficzną, gdy jest, a procesor, gdy jej nie ma, żeby ten sam kod działał wszędzie:

```python run
import torch

if torch.cuda.is_available():
    device = "cuda"
elif torch.backends.mps.is_available():
    device = "mps"
else:
    device = "cpu"

print(device)
```

Tutaj wypisuje `cpu`, a na komputerze z kartą NVIDIA `cuda`. Napisz to raz, na początku programu, i używaj `device` wszędzie dalej, a nic innego w programie nie musi wiedzieć, co ma komputer.

## Przenoszenie tensorów

`.to(device)` daje kopię tensora na urządzeniu, a `device=` od razu tworzy tensor na nim. Operacje wykonują się tam, gdzie leżą ich tensory, i tam też leżą ich wyniki:

```python run
import torch

device = "cpu"

M = torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
M = M.to(device)
print(M.device)

N = torch.tensor([[9.0, 8.0, 7.0], [6.0, 5.0, 4.0]], device=device)
R = N @ N.T
print(R.device)
print(R)
```

Na GPU drugie `M` i `N` leżałyby na karcie graficznej, a razem z nimi `R`, policzone właśnie tam. `.to` zmienia też typ: `M.to(torch.float64)` zostawia urządzenie i zmienia `dtype`, a `M.to("cpu", torch.float64)` zmienia oba.

Dwa tensory muszą leżeć na tym samym urządzeniu, żeby można ich było użyć razem. Dodaj tensor z CPU do tensora z GPU, a PyTorch zatrzyma się z błędem, że znalazł tensory na dwóch urządzeniach. Dlatego cały model przenosi się na urządzenie raz, `model.to(device)`, jak w [następnych lekcjach](04-linear-regression-by-hand.pl.md), i tak samo każdą porcję danych, tuż przed użyciem jej przez model. Tensor, który wraca na procesor, żeby go wypisać albo zamienić w tablicę NumPy, przenosi się przez `.cpu()`.

> [!NOTE]
> Poproszenie o urządzenie, którego komputer nie ma, jak tutaj `device="cuda"`, to błąd. Dlatego najpierw sprawdza się `is_available()`.

## Podsumowanie

- Tensor leży na urządzeniu: `cpu`, `cuda` (karta graficzna NVIDIA) albo `mps` (karta Apple). Nowe tensory leżą na CPU.
- Wybierz urządzenie raz, przez `torch.cuda.is_available()` i `torch.backends.mps.is_available()`, i używaj go wszędzie.
- `.to(device)` daje kopię na urządzeniu, `device=` tworzy tam tensor, a wyniki leżą tam, gdzie ich tensory.
- Tensory używane razem muszą leżeć na tym samym urządzeniu.

## Sprawdź się

<details>
<summary>Dlaczego nie napisać po prostu <code>device = "cuda"</code>?</summary>

Na komputerze bez karty NVIDIA każdy tensor utworzony na `"cuda"` zgłasza błąd, więc program działa tylko na komputerach takich jak twój. Sprawdzenie `is_available()` pozwala temu samemu kodowi użyć karty graficznej tam, gdzie jest, a CPU tam, gdzie jej nie ma.

</details>

<details>
<summary><code>a</code> leży na GPU, a <code>b</code> na CPU. Co robi <code>a + b</code>?</summary>

Zatrzymuje się z błędem o dwóch urządzeniach. PyTorch nigdy nie przenosi tensorów za twoimi plecami: przenieś jeden z nich, `b.to(a.device)`, a suma zostanie policzona tam, gdzie leży `a`.

</details>

<details>
<summary>Utworzyłeś <code>W</code> z <code>device="cuda"</code> i liczysz <code>y = W @ x</code>. Na jakim urządzeniu leży <code>y</code>?</summary>

Na `cuda`, o ile `x` też tam leży. Operacja jest liczona tam, gdzie leżą jej tensory, a jej wynik tam zostaje.

</details>

## Twoja kolej

W ćwiczeniu [Wybierz urządzenie](../../exercises/05-pytorch/03-devices/01-pick-the-device/task.pl.md) napiszesz wybór urządzenia dla dowolnego komputera. W ćwiczeniu [Przenieś porcję danych](../../exercises/05-pytorch/03-devices/02-move-a-batch/task.pl.md) przeniesiesz na urządzenie wszystkie tensory porcji danych.
