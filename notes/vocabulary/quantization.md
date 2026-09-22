---
description: Storing a model's weights with fewer bits, so it needs less memory and runs faster, at some cost in accuracy.
---

# Quantization

Models are usually trained with each weight stored as a 16- or 32-bit floating-point number. Quantization stores the weights with fewer bits, usually 8 or 4, by rounding them to a small set of levels. A 4-bit number has only 16 possible values, so each small group of weights also keeps a scale factor that maps those values back to the right range.

Fewer bits mean less memory, so a model fits on fewer or smaller GPUs, which makes it cheaper to serve, or even on a laptop or a phone. It often means faster [inference](inference.md) too, because generating text is usually limited by how fast the weights can be read from memory. The cost is some accuracy: 8 bits is usually almost as good as the original, while 4 bits and below lose more, depending on the model and the method.

Most models are quantized after training. Quantization-aware training instead simulates the lower precision during training, so the model learns to work with it.

**Example:** a model with 70 billion parameters needs about 140 GB for its weights at 16 bits (2 bytes each), 70 GB at 8 bits and 35 GB at 4 bits. At 16 bits it needs at least two 80 GB GPUs; at 4 bits it fits on one, with memory to spare.

**Related:** [Inference](inference.md) · [LoRA](lora.md) · [Gross margin](gross-margin.md)
