---
description: Everything you can use in a lesson, from math and code to callouts and self-check questions.
---

# Markdown cheatsheet

Lessons are written in [GitHub Flavored Markdown](https://github.github.com/gfm/), plus math. GitHub understands the same syntax, so your notes look right in both places.

## Text

`**bold**` gives **bold**, `*italic*` gives *italic*, `~~struck~~` gives ~~struck~~ and `` `code` `` gives `code`. A line with only `---` draws a divider.

## Math

Put inline math between single dollar signs and display math between double dollar signs. It's rendered with KaTeX when the site is built.

```md
The loss is $L(w) = \frac{1}{n}\sum_i (w x_i - y_i)^2$.

$$
\frac{\partial L}{\partial w} = \frac{2}{n} \sum_{i=1}^{n} (w x_i - y_i)\, x_i
$$
```

The loss is $L(w) = \frac{1}{n}\sum_i (w x_i - y_i)^2$.

$$
\frac{\partial L}{\partial w} = \frac{2}{n} \sum_{i=1}^{n} (w x_i - y_i)\, x_i
$$

## Code

Name the language after the opening fence to get syntax highlighting:

```python
import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))
```

## Callouts

Start a quote with `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]`:

```md
> [!TIP]
> Explain a new idea out loud before moving on.
```

> [!NOTE]
> A **feature** is one input variable, like the floor area of a house.

> [!TIP]
> Fit a simple baseline before a clever model, so you know what "good" looks like.

> [!IMPORTANT]
> Never tune your model on the test set.

> [!WARNING]
> Features on very different scales make gradient descent slow. Standardize them first.

> [!CAUTION]
> Data leakage (information from the test set sneaking into training) makes results look better than they are.

## Tables

```md
| Model               | Predicts      | Usual loss         |
| ------------------- | ------------- | ------------------ |
| Linear regression   | a number      | mean squared error |
```

| Model               | Predicts      | Usual loss                      |
| ------------------- | ------------- | ------------------------------- |
| Linear regression   | a number      | mean squared error              |
| Logistic regression | a probability | cross-entropy                   |
| k-means             | a cluster     | within-cluster squared distance |

## Checklists

```md
- [x] Read the lesson
- [ ] Redo the derivation on paper
```

- [x] Read the lesson
- [ ] Redo the derivation on paper
- [ ] Run the code with a different learning rate

## Self-check questions

Hide an answer until you've tried the question. Leave a blank line after `<summary>` and before `</details>` so the answer is read as Markdown:

```html
<details>
<summary>Why do we square the errors?</summary>

Your answer, in Markdown.

</details>
```

<details>
<summary>Why do we square the errors instead of adding them up?</summary>

Positive and negative errors would cancel out. Squaring makes every error count, punishes big errors more than small ones, and gives a smooth function that's easy to differentiate.

</details>

## Footnotes

```md
Gradient descent goes back to Cauchy.[^cauchy]

[^cauchy]: A.-L. Cauchy, 1847.
```

Gradient descent goes back to Cauchy.[^cauchy]

## Links and images

- Link to a lesson by its file path: [What is machine learning?](../02-foundations/01-what-is-machine-learning.md)
- Link to a chapter by its folder: [Foundations](../02-foundations/)
- Add an image with `![What it shows](images/plot.png)`. There's an example in [Linear regression](../02-foundations/02-linear-regression.md).

[^cauchy]: Augustin-Louis Cauchy, "Méthode générale pour la résolution des systèmes d'équations simultanées", 1847.
