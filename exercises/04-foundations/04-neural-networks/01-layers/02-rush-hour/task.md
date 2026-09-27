---
description: Choose the 7 parameters of a network yourself, so that it expects orders to be turned down only in the evening rush hour.
---

# Rush hour

In the evening rush hour, the streets are jammed, so a ride takes much longer for the same fare, and drivers turn down more orders. This time, the network's input isn't the length of the ride, but the hour the order came in: a whole number from 0 to 23, so an order at 17:45 has the hour 17.

`predict(hour, net)` is done: it's the network from [Two S's make a U](../../../../../notes/04-foundations/04-neural-networks/01-layers.md#two-ss-make-a-u), with the hour as its input. Change only the 7 numbers in `NET`, so that the network gives a probability of 0.5 or more to the orders from 16 to 19 o'clock, the rush hour, and less than 0.5 to the orders at every other hour. For now, `NET` has the parameters of the lesson's U, so the network expects orders to be turned down up to 2 o'clock, and from 12 on.

| Call                                                        | Returns            |
| ----------------------------------------------------------- | ------------------ |
| `[hour for hour in range(24) if predict(hour, NET) >= 0.5]` | `[16, 17, 18, 19]` |

There are many right answers, and any of them passes. Run the code to see the probability for each hour.

An S is halfway up where the line inside it is 0, like `h1` at 3 km in the lesson, where −2 × 3 + 6 = 0. If every hour from 16 on gets 0.5 or more, the probability never comes back down after the rush hour. A second S that rises around 20 o'clock can bring it down, with a negative weight in the output neuron.
