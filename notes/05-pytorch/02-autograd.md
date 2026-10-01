---
description: Let PyTorch work out the slopes for you, by marking the parameters and calling backward after a forward pass, and take gradient descent steps without tracking them.
---

# Autograd

Training needs the slope of the loss for every parameter. In [Training](../04-foundations/02-linear-regression/03-training.md#both-parameters-at-once), two formulas gave the slopes for $w$ and $b$, and for [a network](../04-foundations/04-neural-networks/02-backpropagation.md), they took a whole lesson of the chain rule. PyTorch works them out by itself, for any computation made of tensors. This is **autograd**, short for automatic gradients, and it's what makes training a network with millions of parameters a few lines of code.

## One number

A tensor made with `requires_grad=True` is a number to take slopes for. PyTorch keeps a record of everything that's done with it, and the result of such a computation remembers how it was made: that's the `grad_fn` in its printout. Calling `backward()` on the result goes back through the record, and leaves the slope of the result for the tensor in its `.grad`:

```python run
import torch

x = torch.tensor(5.0, requires_grad=True)
f = x ** 2
print(f)

f.backward()
print(x.grad)
```

$f(x) = x^2$ has the slope $2x$, which is 10 at $x = 5$, and that's what `x.grad` is. `PowBackward0` is the name of the step that made `f`, the power, in the record: the step that turns the slope of $f$ into the slope for $x$ when it's played backwards.

Only floats have slopes. `torch.tensor(5, requires_grad=True)` is made of a whole number, and PyTorch refuses with "Only Tensors of floating point and complex dtype can require gradients": write `5.0`.

## Slopes for a loss

The same works for a whole model. Take one receipt of the taxi: 4 km, and a fare of 23. A line with the weight $w = 2$ and the bias $b = 5$ predicts $2 \times 4 + 5 = 13$, and the squared error is $(13 - 23)^2 = 100$:

```python run
import torch

km = 4.0
fare = 23.0
w = torch.tensor(2.0, requires_grad=True)
b = torch.tensor(5.0, requires_grad=True)

prediction = w * km + b
loss = (prediction - fare) ** 2
print(prediction)
print(loss)

loss.backward()
print(w.grad, b.grad)
```

The slopes are −80 for $w$ and −20 for $b$: the chapter's two formulas for a single ride, $2(\hat{y} - y)\,x = 2 \times (13 - 23) \times 4 = -80$ and $2(\hat{y} - y) = -20$. Both are negative, so raising either of them lowers the loss. Nobody had to work the formulas out: `loss.backward()` went back through the power, the subtraction, the addition and the multiplication, and applied the chain rule at each one.

With four receipts, the loss is the mean of the four squared errors, and the tensors can hold all of them:

```python run
import torch

kms = torch.tensor([2.0, 4.0, 6.0, 8.0])
fares = torch.tensor([15.0, 23.0, 29.0, 33.0])
w = torch.tensor(0.0, requires_grad=True)
b = torch.tensor(0.0, requires_grad=True)

loss = ((w * kms + b - fares) ** 2).mean()
print(loss)

loss.backward()
print(w.grad, b.grad)
```

From $w = 0$ and $b = 0$, the loss is 671 and the slopes are −280 and −50, the same as the formulas give for the day receipts.

> [!NOTE]
> `backward()` needs a loss that's a single number. On a tensor with several numbers, like `w * kms`, it stops with "grad can be implicitly created only for scalar outputs". Average the numbers with `mean()` or add them up with `sum()` first.

## Slopes add up

Every call to `backward()` *adds* the slopes it finds to what's in `.grad`, it doesn't replace them. That's useful when a loss has several parts, but a training loop that goes round again with the old slopes still there takes steps that are too big:

```python run
import torch

w = torch.tensor(3.0, requires_grad=True)

print("not reset")
for step in range(3):
    loss = (w * 4 - 8) ** 2
    loss.backward()
    print(w.grad)

w.grad.zero_()

print("reset")
for step in range(3):
    loss = (w * 4 - 8) ** 2
    loss.backward()
    print(w.grad)
    w.grad.zero_()
```

The loss has the same slope, 32, every time it's worked out. Without `zero_()`, the slopes pile up as 32, 64 and 96. `zero_()` is one of the methods with an underscore from [Tensors](01-tensors.md#changing-a-tensor-in-place): it sets the numbers to 0 in place.

## A step downhill

A step of gradient descent changes the parameters: $w \leftarrow w - \eta \, \frac{\partial L}{\partial w}$. But a parameter is a tensor that requires grad, and PyTorch won't let a step change it, because the step would become part of the record. This stops with "a leaf Variable that requires grad is being used in an in-place operation", where a leaf is a tensor you made yourself, like `w`:

```python run
import torch

w = torch.tensor(3.0, requires_grad=True)
loss = (w * 4 - 8) ** 2
loss.backward()

w -= 0.01 * w.grad
```

Inside `with torch.no_grad():`, nothing is recorded, and the parameter can change:

```python run
import torch

w = torch.tensor(3.0, requires_grad=True)
loss = (w * 4 - 8) ** 2
loss.backward()

with torch.no_grad():
    w -= 0.01 * w.grad

print(w)
```

3 − 0.01 × 32 = 2.68. `w` is still a tensor that requires grad, so it's ready for the next round.

A training loop has the same four steps every time, whatever the model:

1. **Forward**: work out the loss from the parameters.
2. **Backward**: `loss.backward()` puts the slopes in `.grad`.
3. **Step**: change each parameter against its slope, inside `torch.no_grad()`.
4. **Reset**: set every `.grad` back to 0.

Here they are on $f(x) = x^2$, starting from $x = 5$, with a learning rate of 0.1. Every 20 steps, the loop prints the step and $x$ after it:

```python run
import torch

x = torch.tensor(5.0, requires_grad=True)
learning_rate = 0.1

for step in range(101):
    f = x ** 2
    f.backward()
    with torch.no_grad():
        x -= learning_rate * x.grad
    x.grad.zero_()
    if step % 20 == 0:
        print(step, round(x.item(), 4))
```

The slope at $x$ is $2x$, so each step takes $0.1 \times 2x = 0.2x$ off $x$, and multiplies it by 0.8. $x$ shrinks towards 0, the bottom of the bowl.

## Training the fare line

Here's the training from [Training](../04-foundations/02-linear-regression/03-training.md#both-parameters-at-once) again, on the day receipts, with the same learning rate of 0.01 and the same 5,000 steps. The loop over the rides and the two slope formulas are gone: the loss is one line, and `backward()` does the rest:

```python run
import torch

kms = torch.tensor([2.0, 4.0, 6.0, 8.0])
fares = torch.tensor([15.0, 23.0, 29.0, 33.0])
w = torch.tensor(0.0, requires_grad=True)
b = torch.tensor(0.0, requires_grad=True)
learning_rate = 0.01

for step in range(5001):
    loss = ((w * kms + b - fares) ** 2).mean()
    loss.backward()
    if step % 1000 == 0:
        print(step, round(loss.item(), 2), round(w.item(), 2), round(b.item(), 2))
    with torch.no_grad():
        w -= learning_rate * w.grad
        b -= learning_rate * b.grad
    w.grad.zero_()
    b.grad.zero_()
```

The numbers are the same as the chapter's, which plain Python printed: the loss falls from 671 to 1, and the line ends at $w = 3$ and $b = 10$. Autograd would have found the slopes of any other model's loss just as easily, and that's what the next lessons use it for.

## Turning tracking off

Working out a prediction doesn't need a record, because nothing will go backwards through it. `torch.no_grad()` skips the record, which saves time and memory:

```python run
import torch

w = torch.tensor(3.0, requires_grad=True)
b = torch.tensor(10.0, requires_grad=True)

fare = w * 5 + b
print(fare)

with torch.no_grad():
    fare = w * 5 + b
print(fare)
```

The first fare remembers how it was made, and the second doesn't. A tensor with a record can't become a NumPy array directly: `.detach()` gives the same numbers without the record, and `fare.detach().numpy()` works where `fare.numpy()` says that it can't.

## Summary

- `requires_grad=True` marks a tensor of floats to take slopes for. The results of computations with it remember how they were made, in their `grad_fn`, and `backward()` on a result that's a single number puts the slopes in the `.grad` of each such tensor.
- `backward()` adds to `.grad`, so a training loop sets the slopes back to 0 with `zero_()` after every step.
- A step of gradient descent changes the parameters inside `torch.no_grad()`, so that the step isn't recorded. `torch.no_grad()` is also what to use to work out predictions.
- A training loop has four steps: forward, backward, step, reset.

## Check yourself

<details>
<summary>What does <code>x.grad</code> hold after <code>f.backward()</code> for <code>x = torch.tensor(2.0, requires_grad=True)</code> and <code>f = x ** 3</code>?</summary>

12. The slope of $x^3$ is $3x^2$, and $3 \times 2^2 = 12$. Autograd finds it the way it found 10 for $x^2$ at 5, without being told the formula.

</details>

<details>
<summary>A training loop forgets <code>.grad.zero_()</code>. What happens?</summary>

Every `backward()` adds its slopes to the ones left by the steps before, so the slope that a step uses is the sum of all the slopes since the start. The steps get bigger and bigger, and the loss may never settle, or may even grow.

</details>

<details>
<summary>Why is <code>w -= learning_rate * w.grad</code> inside <code>torch.no_grad()</code>?</summary>

A step is not part of the model: it changes the parameters, and nothing should go backwards through it. Outside of `no_grad`, PyTorch also refuses to change a tensor that requires grad in place, because that would make the record of how the loss was computed wrong.

</details>

## Your turn

In [The slope of any function](../../exercises/05-pytorch/02-autograd/01-slope-of-any-function/task.md), you'll let autograd find the slope of a function at a point. In [Train a fare line](../../exercises/05-pytorch/02-autograd/02-train-a-fare-line/task.md), you'll put the four steps in a loop and train a line on any receipts.
