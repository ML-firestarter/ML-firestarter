# Autograd

## Ile wynosi `x.grad` po `x = torch.tensor(3.0, requires_grad=True)`, `f = x ** 2 + 1` i `f.backward()`?

- [x] `tensor(6.)`
- [ ] `tensor(10.)`
- [ ] `tensor(9.)`
- [ ] `None`

Nachylenie $x^2 + 1$ to $2x$, czyli 6 dla $x = 3$. 10 to wartość $f$, 9 to wartość $x^2$, a `None` jest w `.grad`, zanim wywoła się `backward()`.

## Pętla treningowa w każdym kroku wywołuje `loss.backward()`, ale nigdy nie zeruje nachyleń przez `zero_()`. Co pójdzie nie tak?

- [x] Nachylenia z każdego kroku dodają się do tych, które zostawiły poprzednie kroki, więc kroki są za duże
- [ ] Nic: `backward()` za każdym razem zastępuje nachylenia
- [ ] Straty nie da się policzyć drugi raz
- [ ] Parametry przestają wymagać gradientu

`backward()` dodaje to, co policzy, do `.grad`. Przydaje się to, gdy strata składa się z kilku części, ale w pętli treningowej nachylenia ze wszystkich dotychczasowych kroków się kumulują, a każdy krok używa ich sumy. Stratę można liczyć dowolnie wiele razy, a parametry nadal wymagają gradientu.

## Dlaczego krok spadku gradientu, `w -= learning_rate * w.grad`, jest wewnątrz `with torch.no_grad():`?

- [x] Krok nie jest częścią modelu: nie powinien być zapisywany, a parametru, który wymaga gradientu, nie można poza `no_grad` zmienić w miejscu
- [ ] `no_grad` zwiększa krok
- [ ] `no_grad` liczy nachylenia potrzebne do kroku
- [ ] Bez niego krok zostałby wykonany dwa razy

Autograd zapisuje każdą operację na tensorze, który wymaga gradientu, żeby `backward()` mogło potem przejść po nich wstecz. Krok zmienia sam parametr, a takiej zmiany w miejscu PyTorch w trakcie zapisywania nie pozwala zrobić. `no_grad` wyłącza zapisywanie i krok wykonuje się raz, dokładnie tak, jak go napisano.

## `loss = w * kms`, gdzie `kms` ma 4 liczby, a potem `loss.backward()`. Co się stanie?

- [x] PyTorch zatrzyma się z błędem: może zacząć tylko od pojedynczej liczby
- [ ] Zadziała, a `w.grad` będzie zawierać po jednym nachyleniu dla każdej z 4 liczb
- [ ] Zadziała, a `w.grad` będzie zawierać sumę 4 nachyleń
- [ ] Zadziała, a `w.grad` będzie równe `None`

Strata musi być jedną liczbą, bo nachylenie całej tabeli wyników względem parametru nie jest pojedynczą liczbą. Najpierw policz `mean()` albo `sum()` wyników, a `backward()` będzie miało stratę, od której może zacząć.

## Wewnątrz `with torch.no_grad():` liczysz `y = w * 2`, a `w` wymaga gradientu. Ile wynosi `y.requires_grad`?

- [x] `False`
- [ ] `True`
- [ ] `None`
- [ ] Nic, bo używanie `w` wewnątrz `no_grad` to błąd

Wewnątrz `no_grad` nic nie jest zapisywane, więc `y` nie pamięta, jak powstało, i nic nie może przez nie przejść wstecz. Właśnie tego chcesz, gdy potrzebujesz tylko predykcji. Samo `w` nadal wymaga gradientu i można go bez problemu używać.

## Którego tensora nie da się utworzyć z `requires_grad=True`?

- [x] `torch.tensor(5)`
- [ ] `torch.tensor(5.0)`
- [ ] `torch.tensor([5.0, 6.0])`
- [ ] `torch.zeros(3)`

`torch.tensor(5)` zawiera liczbę całkowitą, a nachylenia mają sens tylko dla liczb zmiennoprzecinkowych. PyTorch zgłasza wtedy błąd „Only Tensors of floating point and complex dtype can require gradients”. Pozostałe trzy zawierają liczby zmiennoprzecinkowe.

## `km = torch.tensor(5.0)` zostaje oznaczone przez `km.requires_grad_()`, a potem wykonuje się `fare = 3 * km + 10` i `fare.backward()`. Ile wynosi `km.grad`?

- [x] `tensor(3.)`
- [ ] `tensor(5.)`
- [ ] `tensor(25.)`
- [ ] `None`

Nachylenie opłaty względem odległości to cena kilometra, czyli 3: oznaczone wejście dostaje nachylenie tak samo jak parametr. 5 to sama odległość, czyli nachylenie względem wagi, a 25 to opłata. `None` to wartość `.grad` tensora, który nie jest oznaczony.

## `loss` policzono z oznaczonego `ride` i z parametrów `prices`, które też są oznaczone. Co jest w `prices.grad` po `slopes = torch.autograd.grad(loss, ride)`?

- [x] To, co było wcześniej, czyli `None`, jeśli nic tam nie było: nachylenia zostają zwrócone, a żadne `.grad` nie jest wypełniane
- [ ] Nachylenie straty względem `prices`
- [ ] Ten sam tensor co `slopes[0]`
- [ ] Zera

`torch.autograd.grad` liczy nachylenia względem tensorów, o które się go pyta, tutaj względem kursu, i zwraca je w krotce, więc nachylenie kursu to `slopes[0]`. To `backward()` zapisuje nachylenie w `.grad` wszystkiego, co jest oznaczone.

## Co `prices.requires_grad_(False)` robi z parametrem?

- [x] Zamraża go: operacje na nim nie są zapisywane, więc nie dostaje nachyleń i żaden krok go nie zmienia
- [ ] Zeruje jego liczby
- [ ] Zeruje jego `.grad`, jak `zero_()`
- [ ] Zamienia jego liczby na całkowite, które nie mogą mieć nachyleń

Zdjęcie oznaczenia nie zmienia liczb, tylko wyłącza zapisywanie obliczeń. `backward()` pomija wtedy ten parametr i właśnie o to chodzi w przypadku modelu, który skończył już naukę, albo części modelu, która ma pozostać bez zmian, podczas gdy reszta się uczy.
