"""
The random numbers behind torch.rand, torch.randn, torch.randperm, nn.Linear's starting weights and
DataLoader's shuffling.

PyTorch's CPU generator is a Mersenne Twister, MT19937, and every random tensor is made from its
32-bit words in a fixed way. This file makes the tensors the same way, so that after
`torch.manual_seed(42)`, `torch.randn(3)` is `tensor([0.3367, 0.1288, 0.2345])` here, as it is on a
computer with PyTorch on it, and a seeded training run starts from the same weights and sees the
same batches in the same order.
"""

import math
import os

import numpy as np

# What a Generator() starts from until it's seeded; the default generator starts from a random seed.
DEFAULT_SEED = 67280421310721


def init_genrand(seed):
    """The state MT19937 starts from for a seed: the 624 words that its reference code, init_genrand, fills in."""
    key = [seed & 0xFFFFFFFF]
    for i in range(1, 624):
        previous = key[-1]
        key.append((1812433253 * (previous ^ (previous >> 30)) + i) & 0xFFFFFFFF)
    return np.array(key, dtype=np.uint32)


class Generator:
    """torch.Generator: a stream of random numbers that can be seeded."""

    def __init__(self, device='cpu'):
        self.device = device
        self.manual_seed(DEFAULT_SEED)

    def manual_seed(self, seed):
        seed = int(seed)
        if not -(1 << 63) <= seed < (1 << 64):
            raise RuntimeError('Overflow when unpacking long long')
        self._initial_seed = seed % (1 << 64)
        self._bits = np.random.MT19937()
        # Only the 32 lowest bits of a seed matter, as in PyTorch.
        self._bits.state = {
            'bit_generator': 'MT19937',
            'state': {'key': init_genrand(self._initial_seed & 0xFFFFFFFF), 'pos': 624},
        }
        # Normal numbers are made two at a time; the second one waits here for the next request.
        self._spare_normal = None
        return self

    def initial_seed(self):
        return self._initial_seed

    def seed(self):
        """Seeds the generator from the operating system's randomness, and returns the seed."""
        seed = int.from_bytes(os.urandom(8), 'little')
        self.manual_seed(seed)
        return seed

    def words(self, count):
        """The next `count` 32-bit words of the stream, as a uint64 array."""
        return self._bits.random_raw(count)

    def word(self):
        return int(self._bits.random_raw())

    def word64(self):
        """A 64-bit number made of two words, the first one on top."""
        high, low = self.words(2)
        return (int(high) << 32) | int(low)

    def words64(self, count):
        pairs = self.words(2 * count).reshape(count, 2)
        return (pairs[:, 0] << np.uint64(32)) | pairs[:, 1]

    def __repr__(self):
        return f'<torch._C.Generator object at {hex(id(self))}>'


default_generator = Generator()
default_generator.seed()


def manual_seed(seed):
    """torch.manual_seed: seeds the default generator, which the functions use unless given another."""
    return default_generator.manual_seed(seed)


def seed():
    return default_generator.seed()


def initial_seed():
    return default_generator.initial_seed()


# ---------- Uniform numbers ----------


def uniform(count, low, high, kind, generator):
    """`count` numbers from [low, high), as PyTorch makes them: the lowest 24 (float32) or 53 (float64) bits of each word."""
    if kind.itemsize == 8:
        bits = generator.words64(count) & np.uint64((1 << 53) - 1)
        scaled = bits.astype(np.float64) * 2.0**-53
        return scaled * (high - low) + low
    bits = generator.words(count) & np.uint64((1 << 24) - 1)
    scaled = bits.astype(np.float64) * 2.0**-24
    low32, high32 = np.float32(low), np.float32(high)
    return (scaled * float(high32 - low32) + float(low32)).astype(np.float32)


# ---------- Normal numbers ----------


def normal(count, mean, std, kind, generator):
    """
    `count` numbers from a normal distribution. A tensor with 16 or more numbers is filled with
    uniform ones that are turned into normal ones 16 at a time, and one with fewer is made number
    by number, with the two halves of each pair taken in turns.
    """
    if count >= 16:
        return _normal_in_blocks(count, mean, std, kind, generator)
    out = np.empty(count, dtype=np.float64)
    for i in range(count):
        if generator._spare_normal is not None:
            number, generator._spare_normal = generator._spare_normal, None
        else:
            first, second = (float(x) for x in uniform(2, 0.0, 1.0, _FLOAT64, generator))
            radius = math.sqrt(-2.0 * math.log1p(-second))
            angle = 2.0 * math.pi * first
            generator._spare_normal = radius * math.sin(angle)
            number = radius * math.cos(angle)
        out[i] = number * std + mean
    return out.astype(kind.numpy)


def _normal_in_blocks(count, mean, std, kind, generator):
    wide = kind.itemsize == 8
    work = np.float64 if wide else np.float32
    data = uniform(count, 0.0, 1.0, kind, generator).astype(work)
    full = count // 16 * 16
    data[:full] = _box_muller(data[:full].reshape(-1, 16), mean, std, work).reshape(-1)
    if count % 16:
        # The last 16 numbers are drawn again, so that the ones left over get a block of their own.
        data[-16:] = _box_muller(uniform(16, 0.0, 1.0, kind, generator).astype(work).reshape(1, 16), mean, std, work)[0]
    return data.astype(kind.numpy)


def _box_muller(blocks, mean, std, work):
    """Each block of 16 uniform numbers becomes 16 normal ones: the first 8 give a radius and the last 8 an angle."""
    first, second = blocks[:, :8], blocks[:, 8:]
    radius = np.sqrt(work(-2) * np.log(work(1) - first))
    angle = work(2 * math.pi) * second
    out = np.empty_like(blocks)
    out[:, :8] = radius * np.cos(angle) * work(std) + work(mean)
    out[:, 8:] = radius * np.sin(angle) * work(std) + work(mean)
    return out


class _Float64:
    itemsize = 8


_FLOAT64 = _Float64()


# ---------- Whole numbers ----------


def permutation(count, generator):
    """torch.randperm: 0 to count - 1 shuffled, one swap for each number but the last."""
    order = np.arange(count, dtype=np.int64)
    if count > 1:
        words = generator.words(count - 1)
        picks = (words % np.arange(count, 1, -1, dtype=np.uint64)).tolist()
        items = order.tolist()
        for i, pick in enumerate(picks):
            j = i + pick
            items[i], items[j] = items[j], items[i]
        order = np.array(items, dtype=np.int64)
    return order


def integers(count, low, high, generator):
    """torch.randint: `count` whole numbers from [low, high)."""
    span = high - low
    if span >= 1 << 32:
        words = generator.words64(count)
    else:
        words = generator.words(count)
    return (words % np.uint64(span)).astype(np.int64) + low


def full_range_int64(generator):
    """What `torch.empty((), dtype=torch.int64).random_()` gives: the seeds that DataLoader's shuffling starts from."""
    return generator.word64() % (1 << 63)
