# Autograd

## After `x = torch.tensor(3.0, requires_grad=True)`, `f = x ** 2 + 1` and `f.backward()`, what's `x.grad`?

- [x] `tensor(6.)`
- [ ] `tensor(10.)`
- [ ] `tensor(9.)`
- [ ] `None`

The slope of $x^2 + 1$ is $2x$, which is 6 at $x = 3$. 10 is the value of $f$, 9 is the value of $x^2$, and `None` is what `.grad` holds before `backward()` has been called.

## A training loop calls `loss.backward()` in every step, but never `zero_()`s the slopes. What goes wrong?

- [x] Every step's slopes are added to the ones left by the steps before, so the steps are too big
- [ ] Nothing: `backward()` replaces the slopes every time
- [ ] The loss can't be worked out a second time
- [ ] The parameters stop requiring grad

`backward()` adds what it finds to `.grad`. That helps when a loss comes in parts, but in a training loop, the slopes of all the steps so far pile up, and each step uses their sum. The loss can be worked out again and again, and the parameters keep requiring grad.

## Why does the step of gradient descent, `w -= learning_rate * w.grad`, go inside `with torch.no_grad():`?

- [x] The step isn't part of the model: it mustn't be recorded, and a parameter that requires grad can't be changed in place outside of it
- [ ] `no_grad` makes the step bigger
- [ ] `no_grad` works out the slopes for the step
- [ ] Without it, the step would be taken twice

Autograd records every operation on a tensor that requires grad, so that `backward()` can go back through them. A step changes the parameter itself, and PyTorch refuses to do that in place while recording. `no_grad` switches the recording off, and the step is taken once, as written.

## `loss = w * kms`, where `kms` has 4 numbers, and then `loss.backward()`. What happens?

- [x] PyTorch stops with an error: it can only start from a single number
- [ ] It works, and `w.grad` holds one slope for each of the 4 numbers
- [ ] It works, and `w.grad` holds the sum of the 4 slopes
- [ ] It works, and `w.grad` is `None`

The loss has to be one number, because the slope of a whole table of results for a parameter isn't a single number. Take the `mean()` or the `sum()` of the results first, and `backward()` has a loss to start from.

## Inside `with torch.no_grad():`, you work out `y = w * 2`, and `w` requires grad. What's `y.requires_grad`?

- [x] `False`
- [ ] `True`
- [ ] `None`
- [ ] It's an error to use `w` inside `no_grad`

Nothing is recorded inside `no_grad`, so `y` doesn't remember how it was made, and nothing can go backwards through it. That's what you want when you only need a prediction. `w` itself still requires grad, and using it is no problem.

## Which tensor can't be made with `requires_grad=True`?

- [x] `torch.tensor(5)`
- [ ] `torch.tensor(5.0)`
- [ ] `torch.tensor([5.0, 6.0])`
- [ ] `torch.zeros(3)`

`torch.tensor(5)` holds a whole number, and slopes only make sense for floats: PyTorch says "Only Tensors of floating point and complex dtype can require gradients". The other three hold floats.
