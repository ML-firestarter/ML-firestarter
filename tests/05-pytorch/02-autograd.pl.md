# Autograd

## Po `x = torch.tensor(3.0, requires_grad=True)`, `f = x ** 2 + 1` i `f.backward()` ile wynosi `x.grad`?

- [x] `tensor(6.)`
- [ ] `tensor(10.)`
- [ ] `tensor(9.)`
- [ ] `None`

Nachylenie $x^2 + 1$ to $2x$, czyli 6 dla $x = 3$. 10 to wartość $f$, 9 to wartość $x^2$, a `None` to to, co `.grad` zawiera przed wywołaniem `backward()`.

## Pętla treningowa wywołuje `loss.backward()` w każdym kroku, ale nigdy nie robi `zero_()` na nachyleniach. Co idzie źle?

- [x] Nachylenia każdego kroku dodają się do tych, które zostawiły wcześniejsze kroki, więc kroki są za duże
- [ ] Nic: `backward()` za każdym razem zastępuje nachylenia
- [ ] Straty nie da się policzyć po raz drugi
- [ ] Parametry przestają wymagać gradientu

`backward()` dodaje to, co znajdzie, do `.grad`. To pomaga, gdy strata składa się z części, ale w pętli treningowej nachylenia ze wszystkich dotychczasowych kroków piętrzą się, a każdy krok używa ich sumy. Stratę można liczyć w kółko, a parametry nadal wymagają gradientu.

## Dlaczego krok spadku gradientu, `w -= learning_rate * w.grad`, jest wewnątrz `with torch.no_grad():`?

- [x] Krok nie jest częścią modelu: nie wolno go zapisywać, a parametru, który wymaga gradientu, nie można zmienić w miejscu poza `no_grad`
- [ ] `no_grad` powiększa krok
- [ ] `no_grad` liczy nachylenia dla kroku
- [ ] Bez tego krok zostałby wykonany dwa razy

Autograd zapisuje każdą operację na tensorze, który wymaga gradientu, żeby `backward()` mogło się po nich cofnąć. Krok zmienia sam parametr, a PyTorch odmawia zrobienia tego w miejscu podczas zapisywania. `no_grad` wyłącza zapisywanie i krok jest wykonywany raz, tak jak napisano.

## `loss = w * kms`, gdzie `kms` ma 4 liczby, a potem `loss.backward()`. Co się dzieje?

- [x] PyTorch kończy z błędem: może wystartować tylko od jednej liczby
- [ ] Działa, a `w.grad` zawiera jedno nachylenie dla każdej z 4 liczb
- [ ] Działa, a `w.grad` zawiera sumę 4 nachyleń
- [ ] Działa, a `w.grad` to `None`

Strata musi być jedną liczbą, bo nachylenie całej tabeli wyników względem parametru nie jest jedną liczbą. Najpierw weź `mean()` albo `sum()` wyników, a `backward()` będzie miało stratę, od której może wystartować.

## Wewnątrz `with torch.no_grad():` liczysz `y = w * 2`, a `w` wymaga gradientu. Ile wynosi `y.requires_grad`?

- [x] `False`
- [ ] `True`
- [ ] `None`
- [ ] Użycie `w` wewnątrz `no_grad` to błąd

Wewnątrz `no_grad` nic nie jest zapisywane, więc `y` nie pamięta, jak powstało, i nic nie może się przez niego cofnąć. Tego właśnie chcesz, gdy potrzebujesz tylko predykcji. Samo `w` nadal wymaga gradientu, a używanie go nie jest problemem.

## Którego tensora nie da się utworzyć z `requires_grad=True`?

- [x] `torch.tensor(5)`
- [ ] `torch.tensor(5.0)`
- [ ] `torch.tensor([5.0, 6.0])`
- [ ] `torch.zeros(3)`

`torch.tensor(5)` zawiera liczbę całkowitą, a nachylenia mają sens tylko dla liczb zmiennoprzecinkowych: PyTorch mówi „Only Tensors of floating point and complex dtype can require gradients”. Pozostałe trzy zawierają liczby zmiennoprzecinkowe.
