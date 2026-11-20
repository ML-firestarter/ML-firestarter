---
description: Sprawdź, gdzie PyTorch może trzymać tensory, na procesorze czy na karcie graficznej, napisz kod, który wybiera najlepsze urządzenie, i przenieś na nie tensory.
---

# Urządzenia

Policzenie predykcji dla kilku kursów taksówki nie zajmuje praktycznie żadnego czasu. Trening sieci na milionach kursów trwa godzinami, chyba że obliczenia wykonuje **karta graficzna** (GPU), która robi tysiące drobnych rachunków naraz. PyTorch potrafi trzymać na niej tensory i wymaga przy tym tylko jednego: żeby wskazać, gdzie ma leżeć każdy tensor. O tym jest ta lekcja.

> [!NOTE]
> Na tej stronie nie ma karty graficznej, więc wszystko działa tu na procesorze, czyli **CPU**. Kod jest napisany tak, jak pisze się go na komputer z GPU, i na takim komputerze działa bez żadnych zmian. Co jeszcze jest tu inaczej, opisuje część [PyTorch na stronie](../01-start-here/01-how-this-works.pl.md#pytorch-na-stronie).

## Gdzie leży tensor

Każdy tensor ma swoje urządzenie, `device`: `cpu` to procesor, `cuda` karta graficzna NVIDIA, a `mps` układ graficzny komputera Apple. Nowy tensor trafia na CPU, chyba że wskażesz inaczej:

```python run
import torch

M = torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
print(M.device)
print(M.device.type)
print(torch.device("cpu"))
```

## Wybór urządzenia

O to, jakie urządzenia ma komputer, można zapytać PyTorch. Zwykle wybiera się kartę graficzną, jeśli jest, a procesor, jeśli jej nie ma, żeby ten sam kod działał wszędzie:

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

Tutaj wypisuje się `cpu`, a na komputerze z kartą NVIDIA `cuda`. Wystarczy napisać to raz, na początku programu, i dalej wszędzie używać `device`, a reszta programu nie musi wiedzieć, w co wyposażony jest komputer.

## Przenoszenie tensorów

`.to(device)` zwraca kopię tensora na danym urządzeniu, a `device=` od razu tworzy tensor na nim. Działania wykonują się tam, gdzie leżą ich tensory, i tam też trafiają ich wyniki:

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

Na GPU drugie `M` i `N` leżałyby na karcie graficznej, podobnie jak `R`, które zostałoby tam policzone. `.to` zmienia też typ: `M.to(torch.float64)` zostawia urządzenie i zmienia `dtype`, a `M.to("cpu", torch.float64)` zmienia jedno i drugie.

Tensory, których używa się razem, muszą leżeć na tym samym urządzeniu. Dodanie tensora z CPU do tensora z GPU kończy się błędem, w którym PyTorch pisze, że znalazł tensory na dwóch urządzeniach. Dlatego cały model przenosi się na urządzenie raz, przez `model.to(device)`, jak w [kolejnych lekcjach](04-linear-regression-by-hand.pl.md), a każdą porcję danych tuż przed tym, jak użyje jej model. Tensor, który ma wrócić na procesor, żeby go wypisać albo zamienić na tablicę NumPy, przenosi się przez `.cpu()`.

> [!NOTE]
> Prośba o urządzenie, którego komputer nie ma, jak tutaj `device="cuda"`, kończy się błędem. Właśnie dlatego najpierw sprawdza się `is_available()`.

## Podsumowanie

- Tensor leży na urządzeniu: `cpu`, `cuda` (karta graficzna NVIDIA) albo `mps` (układ graficzny Apple). Nowe tensory trafiają na CPU.
- Urządzenie wybiera się raz, przez `torch.cuda.is_available()` i `torch.backends.mps.is_available()`, i używa go wszędzie.
- `.to(device)` zwraca kopię na danym urządzeniu, `device=` od razu tworzy tensor na nim, a wyniki trafiają tam, gdzie leżą ich tensory.
- Tensory używane razem muszą leżeć na tym samym urządzeniu.

## Sprawdź się

<details>
<summary>Dlaczego nie napisać po prostu <code>device = "cuda"</code>?</summary>

Na komputerze bez karty NVIDIA każda próba utworzenia tensora na `"cuda"` zgłosi błąd, więc program zadziała tylko na komputerach takich jak twój. Sprawdzenie `is_available()` pozwala temu samemu kodowi korzystać z karty graficznej tam, gdzie jest, a z CPU tam, gdzie jej nie ma.

</details>

<details>
<summary><code>a</code> leży na GPU, a <code>b</code> na CPU. Co zrobi <code>a + b</code>?</summary>

Zatrzyma się z błędem o dwóch urządzeniach. PyTorch nigdy nie przenosi tensorów za twoimi plecami: przenieś jeden z nich, `b.to(a.device)`, a suma policzy się tam, gdzie leży `a`.

</details>

<details>
<summary><code>W</code> utworzono z <code>device="cuda"</code>, a potem policzono <code>y = W @ x</code>. Na którym urządzeniu jest <code>y</code>?</summary>

Na `cuda`, o ile `x` też tam leży. Działanie wykonuje się tam, gdzie leżą jego tensory, i tam zostaje jego wynik.

</details>

## Twoja kolej

W ćwiczeniu [Wybierz urządzenie](../../exercises/05-pytorch/03-devices/01-pick-the-device/task.pl.md) napiszesz wybór urządzenia dla dowolnego komputera. W ćwiczeniu [Przenieś porcję danych](../../exercises/05-pytorch/03-devices/02-move-a-batch/task.pl.md) przeniesiesz na wybrane urządzenie wszystkie tensory z porcji.
