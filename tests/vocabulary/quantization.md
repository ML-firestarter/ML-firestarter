# Quantization

## What does quantization do?

- [ ] Removes the least important weights
- [ ] Trains a smaller model to copy a bigger one
- [x] Stores the weights with fewer bits, such as 8 or 4 instead of 16
- [ ] Splits the prompt into fewer tokens

The weights are rounded to a small set of levels, so each takes fewer bits.

## How much memory do the weights of a 70-billion-parameter model need at 4 bits?

- [ ] About 140 GB
- [ ] About 70 GB
- [x] About 35 GB
- [ ] About 280 GB

4 bits is half a byte, so 70 billion weights take about 35 GB. At 16 bits it's 140 GB, and at 8 bits 70 GB.

## Why does quantization often make inference faster, not just smaller?

- [x] Generating text is usually limited by how fast the weights can be read from memory
- [ ] A quantized model has fewer layers
- [ ] Quantized models write shorter answers
- [ ] The GPU skips every weight that rounds to zero

Fewer bits mean less to read for every token the model writes.

## What does quantization cost?

- [ ] Nothing: a quantized model gives exactly the same answers
- [x] Some accuracy: 8 bits is usually almost as good as the original, while 4 bits and below lose more
- [ ] The model can't be fine-tuned anymore
- [ ] It needs a bigger context window

How much is lost depends on the model and the method.

## A 4-bit number has only 16 possible values. How do quantized weights keep their right range?

- [ ] Every weight is stored twice
- [ ] The model is trained again after rounding
- [ ] All weights are clipped to the range from −8 to 7
- [x] Each small group of weights keeps a scale factor that maps the values back to the right range

The scale factor lets the same 16 levels cover large weights in one group and small ones in another.
