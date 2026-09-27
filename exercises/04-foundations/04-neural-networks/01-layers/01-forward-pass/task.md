---
description: Write a neuron with any number of inputs, and the prediction of a network with any 7 parameters.
---

# Forward pass

In [Neurons, layers and networks](../../../../../notes/04-foundations/04-neural-networks/01-layers.md#neurons-layers-and-networks), `predict(km, net)` wrote out each of the network's three neurons on its own line. But every neuron does the same thing: it multiplies each of its inputs by a weight, adds a bias, and puts the result through the sigmoid. Finish two functions:

- `neuron(inputs, weights, bias)` returns the activation of a neuron with the sigmoid as its activation function. `inputs` is the list of its inputs, and `weights` the list of its weights, one for each input, in the same order.
- `predict(km, net)` returns the probability that an order for a ride of `km` km will be turned down, by the network whose 7 parameters are in the dict `net`, under the same names as in the lesson. It can call `neuron` three times, once for each neuron.

`sigmoid` is done, and `NET` holds the 7 parameters from the lesson.

| Call                                  | Returns       |
| ------------------------------------- | ------------- |
| `neuron([3], [-2], 6)`                | `0.5`         |
| `neuron([2], [-2], 6)`                | about `0.881` |
| `neuron([0.5, 0.0], [4, 4], -3)`      | about `0.269` |
| `neuron([1, 2, 3], [0.5, -1, 2], -3)` | about `0.818` |
| `predict(3, NET)`                     | about `0.269` |
| `predict(14, NET)`                    | about `0.729` |

The table rounds the numbers to 3 decimal places, but the checks don't. The third call is the output neuron of the lesson's network for a 3 km ride, where `h1` is 0.5 and `h2` practically 0, which is why `predict(3, NET)` gives almost the same. The checks also try other parameters, so `predict` has to take them from `net`.

If `predict` raises a `TypeError`, check that it gives `neuron` lists, even for a neuron with a single input: `[km]`, not `km`. If the calls with one input are right, but `neuron([0.5, 0.0], [4, 4], -3)` gives about `0.018`, the bias is added once for each input, but it belongs in the sum only once.
