# LoRA

## What does LoRA train?

- [ ] All the weights, at a lower learning rate
- [ ] Only the model's last layer
- [ ] A smaller copy of the model
- [x] Two small matrices whose product is added to the frozen weights

The original weights stay frozen. Only $B$ and $A$ are trained, and $W' = W + BA$.

## A 4096 × 4096 weight matrix gets a rank-8 LoRA. How many numbers does the LoRA hold?

- [ ] About 16.8 million
- [x] 65,536
- [ ] 32,768
- [ ] 131,072

$B$ and $A$ together hold $r(d + k)$ numbers: 8 × (4096 + 4096) = 65,536, about 0.4% of the matrix's 16.8 million.

## Why does $B$ start at zero?

- [x] So training starts from exactly the original model
- [ ] So the adapter file is smaller
- [ ] So the rank stays small
- [ ] So $A$ doesn't need training

With $B = 0$, the correction $BA$ is zero too, so $W' = W$ when training starts.

## What can you do with a trained LoRA adapter?

- [x] Keep many adapters, one per customer or task, for one base model
- [ ] Run it without the base model
- [x] Add $BA$ into $W$, so the model runs exactly as fast as before
- [ ] Use it to shrink the base model to the adapter's size

An adapter is a correction to the base model's weights, usually a few megabytes to a few hundred, stored separately. It's no use without the model it corrects.

## What did QLoRA add to LoRA?

- [ ] It trains all the weights at 4 bits
- [x] It keeps the frozen model quantized to 4 bits while the adapters train
- [ ] It quantizes the adapters to 1 bit
- [ ] It removes the need for a GPU

That made it possible to fine-tune a 65-billion-parameter model on a single 48 GB GPU.
