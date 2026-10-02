"""Datasets: things that have a length and give back the example at a position."""

import bisect
import itertools
import math
import warnings

from ... import _random
from ..._creation import randperm


class Dataset:
    """Base class of datasets: a subclass defines `__getitem__(index)` and `__len__()`."""

    def __getitem__(self, index):
        raise NotImplementedError('Subclasses of Dataset should implement __getitem__.')

    def __add__(self, other):
        return ConcatDataset([self, other])


class IterableDataset(Dataset):
    def __iter__(self):
        raise NotImplementedError


class TensorDataset(Dataset):
    """A dataset of tensors that all have the same first dimension: example i is row i of each."""

    def __init__(self, *tensors):
        if not all(tensors[0].size(0) == tensor.size(0) for tensor in tensors):
            raise AssertionError('Size mismatch between tensors')
        self.tensors = tensors

    def __getitem__(self, index):
        return tuple(tensor[index] for tensor in self.tensors)

    def __len__(self):
        return self.tensors[0].size(0)


class Subset(Dataset):
    """The examples of a dataset at some positions."""

    def __init__(self, dataset, indices):
        self.dataset = dataset
        self.indices = indices

    def __getitem__(self, idx):
        if isinstance(idx, list):
            return self.dataset[[self.indices[i] for i in idx]]
        return self.dataset[self.indices[idx]]

    def __getitems__(self, indices):
        if callable(getattr(self.dataset, '__getitems__', None)):
            return self.dataset.__getitems__([self.indices[idx] for idx in indices])
        return [self.dataset[self.indices[idx]] for idx in indices]

    def __len__(self):
        return len(self.indices)


class ConcatDataset(Dataset):
    def __init__(self, datasets):
        self.datasets = list(datasets)
        if len(self.datasets) == 0:
            raise AssertionError('datasets should not be an empty iterable')
        self.cumulative_sizes = list(itertools.accumulate(len(d) for d in self.datasets))

    def __len__(self):
        return self.cumulative_sizes[-1]

    def __getitem__(self, idx):
        if idx < 0:
            if -idx > len(self):
                raise ValueError('absolute value of index should not exceed dataset length')
            idx = len(self) + idx
        dataset_idx = bisect.bisect_right(self.cumulative_sizes, idx)
        sample_idx = idx if dataset_idx == 0 else idx - self.cumulative_sizes[dataset_idx - 1]
        return self.datasets[dataset_idx][sample_idx]


def random_split(dataset, lengths, generator=None):
    """Splits a dataset into random parts, of the given lengths or fractions of its length."""
    generator = generator if generator is not None else _random.default_generator
    if math.isclose(sum(lengths), 1) and sum(lengths) <= 1:
        subset_lengths = [int(math.floor(len(dataset) * fraction)) for fraction in lengths]
        remainder = len(dataset) - sum(subset_lengths)
        for i in range(remainder):
            subset_lengths[i % len(subset_lengths)] += 1
        lengths = subset_lengths
        for i, length in enumerate(lengths):
            if length == 0:
                warnings.warn(f'Length of split at index {i} is 0. This might result in an empty dataset.', stacklevel=2)
    if sum(lengths) != len(dataset):
        raise ValueError('Sum of input lengths does not equal the length of the input dataset!')
    indices = randperm(sum(lengths), generator=generator).tolist()
    return [
        Subset(dataset, indices[offset - length : offset])
        for offset, length in zip(itertools.accumulate(lengths), lengths)
    ]
