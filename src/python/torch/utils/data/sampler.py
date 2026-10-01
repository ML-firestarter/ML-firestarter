"""Samplers: the order in which a DataLoader visits the examples of a dataset."""

from ... import _random
from ..._creation import randperm


class Sampler:
    def __init__(self, data_source=None):
        pass

    def __iter__(self):
        raise NotImplementedError


class SequentialSampler(Sampler):
    def __init__(self, data_source):
        self.data_source = data_source

    def __iter__(self):
        return iter(range(len(self.data_source)))

    def __len__(self):
        return len(self.data_source)


class RandomSampler(Sampler):
    """Visits every example once, in a random order that's different each time."""

    def __init__(self, data_source, replacement=False, num_samples=None, generator=None):
        self.data_source = data_source
        self.replacement = replacement
        self._num_samples = num_samples
        self.generator = generator
        if not isinstance(self.replacement, bool):
            raise TypeError(f'replacement should be a boolean value, but got replacement={self.replacement}')
        if not isinstance(self.num_samples, int) or self.num_samples <= 0:
            raise ValueError(f'num_samples should be a positive integer value, but got num_samples={self.num_samples}')

    @property
    def num_samples(self):
        return len(self.data_source) if self._num_samples is None else self._num_samples

    def __iter__(self):
        n = len(self.data_source)
        if self.generator is None:
            # A private generator, seeded from the default one.
            seed = _random.full_range_int64(_random.default_generator)
            generator = _random.Generator()
            generator.manual_seed(seed)
        else:
            generator = self.generator
        if self.replacement:
            for _ in range(self.num_samples // 32):
                yield from _random.integers(32, 0, n, generator).tolist()
            yield from _random.integers(self.num_samples % 32, 0, n, generator).tolist()
        else:
            for _ in range(self.num_samples // n):
                yield from randperm(n, generator=generator).tolist()
            yield from randperm(n, generator=generator).tolist()[: self.num_samples % n]

    def __len__(self):
        return self.num_samples


class SubsetRandomSampler(Sampler):
    def __init__(self, indices, generator=None):
        self.indices = indices
        self.generator = generator

    def __iter__(self):
        for i in randperm(len(self.indices), generator=self.generator).tolist():
            yield self.indices[i]

    def __len__(self):
        return len(self.indices)


class BatchSampler(Sampler):
    """Groups the positions a sampler gives into lists of `batch_size`."""

    def __init__(self, sampler, batch_size, drop_last):
        if not isinstance(batch_size, int) or isinstance(batch_size, bool) or batch_size <= 0:
            raise ValueError(f'batch_size should be a positive integer value, but got batch_size={batch_size}')
        if not isinstance(drop_last, bool):
            raise ValueError(f'drop_last should be a boolean value, but got drop_last={drop_last}')
        self.sampler = sampler
        self.batch_size = batch_size
        self.drop_last = drop_last

    def __iter__(self):
        batch = []
        for idx in self.sampler:
            batch.append(idx)
            if len(batch) == self.batch_size:
                yield batch
                batch = []
        if len(batch) > 0 and not self.drop_last:
            yield batch

    def __len__(self):
        if self.drop_last:
            return len(self.sampler) // self.batch_size
        return (len(self.sampler) + self.batch_size - 1) // self.batch_size
