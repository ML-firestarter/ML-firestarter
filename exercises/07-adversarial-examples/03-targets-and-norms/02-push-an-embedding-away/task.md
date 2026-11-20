---
description: Write the attack that needs no labels. It moves a picture's embedding as far as it can from where it was, starting from a random picture in the ε-ball.
---

# Push an embedding away

[Attacking an embedding](../../../../notes/07-adversarial-examples/03-targets-and-norms.md#attacking-an-embedding) moved a picture's embedding away from where it was, without any label. Write that attack for any network that embeds pictures:

- `push_away(embed, X, noise, epsilon, alpha, steps)` starts from `X + epsilon * noise`, projected into the ε-ball around `X`, and takes `steps` steps. Each step takes the slopes of the squared distance between `embed(X_adv)` and `embed(X)`, summed over the batch, for the pictures as they are by then. It moves every pixel by `alpha` in the direction that makes the distance grow, and projects the result into the ball. It returns the pictures after the last step.

`noise` is a tensor in the shape of `X`, with numbers from −1 to 1: the random start, handed over by whoever calls the function, so that the checks know what to expect. `project` is written for you. As before, the function returns a tensor that doesn't require grad, and leaves no mark on `X` and nothing in the `.grad` of the parameters of `embed`.

`rows_and_columns()` makes a network that embeds a 2×2 picture as two numbers: how much darker its top row is than its bottom row, and how much darker its left column is than its right column. An evenly grey picture has the embedding `[0, 0]`:

| `X`, one picture           | `noise`                     | `epsilon` | `alpha` | `steps` | `push_away` returns          | Its embedding  |
| -------------------------- | --------------------------- | --------- | ------- | ------- | ---------------------------- | -------------- |
| `[[0.5, 0.5], [0.5, 0.5]]` | `[[1.0, 0.5], [0.0, -1.0]]` | `0.1`     | `0.04`  | `0`     | `[[0.6, 0.55], [0.5, 0.4]]`  | `[0.25, 0.15]` |
| `[[0.5, 0.5], [0.5, 0.5]]` | `[[1.0, 0.5], [0.0, -1.0]]` | `0.1`     | `0.04`  | `1`     | `[[0.6, 0.59], [0.46, 0.4]]` | `[0.33, 0.07]` |
| `[[0.5, 0.5], [0.5, 0.5]]` | `[[1.0, 0.5], [0.0, -1.0]]` | `0.1`     | `0.04`  | `3`     | `[[0.6, 0.6], [0.4, 0.4]]`   | `[0.4, 0.0]`   |
| `[[0.5, 0.5], [0.5, 0.5]]` | `[[-1.0, 0.5], [0.0, 0.2]]` | `0.1`     | `0.04`  | `10`    | `[[0.4, 0.6], [0.4, 0.6]]`   | `[0.0, -0.4]`  |
| `[[0.5, 0.5], [0.5, 0.5]]` | `[[0.0, 0.0], [0.0, 0.0]]`  | `0.1`     | `0.04`  | `10`    | `[[0.5, 0.5], [0.5, 0.5]]`   | `[0.0, 0.0]`   |

The first noise makes the top row a little darker than the bottom one, and the attack carries on that way until the ball stops it: the top row ends 0.1 darker and the bottom row 0.1 lighter, which is as far apart as the two rows can get. The second noise starts off towards a darker right column, and that's where its attack ends. The start decides where the attack goes.

With no noise at all, in the last row, the attack never leaves the picture. At the picture itself the distance is 0, every slope is 0, and so is the sign of every slope.

The code you start from makes the start and stops there. The checks also use `small_embedder()`, a network with a ReLU, whose slopes change as the pictures move.
