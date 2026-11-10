---
description: Write the projection of PGD, which brings a picture back into the ε-ball around the picture it started from, with every pixel still between 0 and 1.
---

# Back into the ball

After each of its steps, PGD brings the picture [back into the ball](../../../../notes/07-adversarial-examples/02-pgd.md#back-into-the-ball). Write the function that does it:

- `project(X_adv, X, epsilon)` returns the pictures of `X_adv`, each brought back into the ε-ball around its picture in `X`: no pixel is more than `epsilon` above or below the same pixel of `X`, and every pixel is between 0 and 1. A pixel that was inside the ball already, and valid, stays where it is.

`X_adv` and `X` are batches of the same shape, and the function returns a new tensor, without changing either of them.

| `X`, one picture             | `X_adv`                       | `epsilon` | `project` returns            |
| ---------------------------- | ----------------------------- | --------- | ---------------------------- |
| `[[0.5, 0.5], [0.5, 0.5]]`   | `[[0.75, 0.42], [0.5, 0.2]]`  | `0.1`     | `[[0.6, 0.42], [0.5, 0.4]]`  |
| `[[0.5, 0.5], [0.5, 0.5]]`   | `[[0.75, 0.42], [0.5, 0.2]]`  | `0.3`     | `[[0.75, 0.42], [0.5, 0.2]]` |
| `[[0.5, 0.5], [0.5, 0.5]]`   | `[[0.75, 0.42], [0.5, 0.2]]`  | `0.0`     | `[[0.5, 0.5], [0.5, 0.5]]`   |
| `[[0.97, 0.02], [0.0, 1.0]]` | `[[1.3, -0.2], [0.04, 0.96]]` | `0.1`     | `[[1.0, 0.0], [0.04, 0.96]]` |
| `[[0.97, 0.02], [0.0, 1.0]]` | `[[0.8, 0.2], [0.3, 0.7]]`    | `0.1`     | `[[0.87, 0.12], [0.1, 0.9]]` |

In the first row, 0.75 is 0.25 above its 0.5 and comes back to 0.1 above, 0.2 is 0.3 below and comes back to 0.1 below, and the two pixels in between were inside the ball. With ε = 0.3, the whole picture is inside, and nothing moves. With ε = 0, the ball holds only `X` itself.

In the fourth row, the ball would let the first pixel go up to 1.07 and the second down to −0.08, and neither is a pixel: they stop at 1 and at 0.

The code you start from keeps the pixels between 0 and 1, and never looks at `X`. The ball is around each pixel's own value in `X`, so the limits are different for every pixel: it's the differences, `X_adv - X`, that have to end up between `-epsilon` and `epsilon`.
