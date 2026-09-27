---
description: Work out the slope of one order's penalty for any parameter with a nudge both ways, without changing the network.
---

# Check with a nudge

Write `nudged_slope(km, turned_down, net, name)`, which works out the slope of one order's penalty for the parameter called `name`, like `"w1"`, with a nudge both ways, as in [Checking with a nudge](../../../../../notes/04-foundations/04-neural-networks/02-backpropagation.md#checking-with-a-nudge): the penalty with the parameter 0.001 bigger, minus the penalty with it 0.001 smaller, divided by the distance between the two, 0.002. `penalty(km, turned_down, net)` is done, and so are `predict` and `sigmoid`.

`nudged_slope` mustn't change `net`: the code that calls it may still need the network as it was.

| Call                             | Returns                                                              |
| -------------------------------- | -------------------------------------------------------------------- |
| `nudged_slope(3, 1, NET, "w1")`  | about `-2.193`                                                       |
| `nudged_slope(3, 1, NET, "v1")`  | about `-0.366`                                                       |
| `nudged_slope(12, 1, NET, "w2")` | about `-1.875`                                                       |
| `nudged_slope(11, 0, NET, "b2")` | about `0.269`                                                        |
| `NET`, after the calls above     | `{"w1": -2, "b1": 6, "w2": 2, "b2": -22, "v1": 4, "v2": 4, "c": -3}` |

The table rounds the numbers to 3 decimal places, but the checks don't. A nudge gives almost the same slope as backpropagation, but not exactly: for `"w1"` at 3 km, it gives −2.19317, and backpropagation −2.19318. The checks expect what the nudge gives, so nudge by exactly 0.001.

If the slopes come out twice as big as in the table, the difference is divided by 0.001, but the two values of the parameter are 0.002 apart. If the third call gives about `-1.864` or `-1.887`, the nudge only goes one way. If `NET` has changed after the calls, `nudged_slope` changes the dict it was given: work on copies, made with `dict(net)`.
