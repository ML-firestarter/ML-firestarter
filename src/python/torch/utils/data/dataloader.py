"""DataLoader: hands a dataset over in batches, in order or shuffled."""

import collections.abc
import copy

import numpy as np

from ... import _dtype, _random
from ..._creation import as_tensor, tensor
from ..._ops import stack
from ..._tensor import Tensor
from .dataset import Dataset, Subset, TensorDataset
from .sampler import BatchSampler, RandomSampler, SequentialSampler


def default_convert(data):
    if isinstance(data, Tensor):
        return data
    if isinstance(data, np.ndarray):
        return as_tensor(data)
    if isinstance(data, collections.abc.Mapping):
        return {key: default_convert(value) for key, value in data.items()}
    if isinstance(data, tuple) and hasattr(data, '_fields'):
        return type(data)(*(default_convert(d) for d in data))
    if isinstance(data, (list, tuple)):
        return [default_convert(d) for d in data]
    return data


def default_collate(batch):
    """Turns a list of examples into one batch: tensors are stacked, numbers become tensors, and lists and dicts are collated item by item."""
    elem = batch[0]
    kind = type(elem)
    if isinstance(elem, Tensor):
        return stack(list(batch), 0)
    if kind.__module__ == 'numpy' and kind.__name__ != 'str_' and kind.__name__ != 'string_':
        if kind.__name__ == 'ndarray' or kind.__name__ == 'memmap':
            return default_collate([as_tensor(b) for b in batch])
        if elem.shape == ():
            return as_tensor(np.asarray(batch))
    if isinstance(elem, float):
        return tensor(batch, dtype=_dtype.float64)
    if isinstance(elem, bool):
        return tensor(batch)
    if isinstance(elem, int):
        return tensor(batch)
    if isinstance(elem, (str, bytes)):
        return batch
    if isinstance(elem, collections.abc.Mapping):
        try:
            return kind({key: default_collate([d[key] for d in batch]) for key in elem})
        except TypeError:
            return {key: default_collate([d[key] for d in batch]) for key in elem}
    if isinstance(elem, tuple) and hasattr(elem, '_fields'):
        return kind(*(default_collate(samples) for samples in zip(*batch)))
    if isinstance(elem, collections.abc.Sequence):
        it = iter(batch)
        size = len(next(it))
        if not all(len(e) == size for e in it):
            raise RuntimeError('each element in list of batch should be of equal size')
        transposed = list(zip(*batch))
        if isinstance(elem, tuple):
            return [default_collate(samples) for samples in transposed]
        try:
            if isinstance(elem, collections.abc.MutableSequence):
                clone = copy.copy(elem)
                for i, samples in enumerate(transposed):
                    clone[i] = default_collate(samples)
                return clone
            return kind([default_collate(samples) for samples in transposed])
        except TypeError:
            return [default_collate(samples) for samples in transposed]
    raise TypeError(f'default_collate: batch must contain tensors, numpy arrays, numbers, dicts or lists; found {kind}')


class DataLoader:
    """Goes through a dataset in batches, shuffling the order each time when `shuffle=True`."""

    def __init__(self, dataset, batch_size=1, shuffle=None, sampler=None, batch_sampler=None, num_workers=0,
                 collate_fn=None, pin_memory=False, drop_last=False, timeout=0, worker_init_fn=None,
                 multiprocessing_context=None, generator=None, *, prefetch_factor=None, persistent_workers=False,
                 pin_memory_device='', in_order=True):
        if num_workers < 0:
            raise ValueError('num_workers option should be non-negative; use num_workers=0 to disable multiprocessing.')
        self.dataset = dataset
        self.num_workers = num_workers
        self.pin_memory = pin_memory
        self.timeout = timeout
        self.generator = generator
        if sampler is not None and shuffle:
            raise ValueError('sampler option is mutually exclusive with shuffle')
        if batch_sampler is not None:
            if batch_size != 1 or shuffle or sampler is not None or drop_last:
                raise ValueError('batch_sampler option is mutually exclusive with batch_size, shuffle, sampler, and drop_last')
            batch_size = None
            drop_last = False
        elif batch_size is None:
            if drop_last:
                raise ValueError('batch_size=None option disables auto-batching and is mutually exclusive with drop_last')
        if sampler is None:
            if shuffle:
                sampler = RandomSampler(dataset, generator=generator)
            else:
                sampler = SequentialSampler(dataset)
        if batch_size is not None and batch_sampler is None:
            batch_sampler = BatchSampler(sampler, batch_size, drop_last)
        self.batch_size = batch_size
        self.drop_last = drop_last
        self.sampler = sampler
        self.batch_sampler = batch_sampler
        if collate_fn is None:
            collate_fn = default_collate if self._auto_collation else default_convert
        self.collate_fn = collate_fn

    @property
    def _auto_collation(self):
        return self.batch_sampler is not None

    @property
    def _index_sampler(self):
        return self.batch_sampler if self._auto_collation else self.sampler

    def __len__(self):
        return len(self._index_sampler)

    def __iter__(self):
        return _SingleProcessIterator(self)


class _SingleProcessIterator:
    def __init__(self, loader):
        self.loader = loader
        self.dataset = loader.dataset
        self.collate_fn = loader.collate_fn
        self.sampler_iter = iter(loader._index_sampler)
        # Every pass draws a seed for the workers, even without any, so the default generator moves on.
        self.base_seed = _random.full_range_int64(loader.generator or _random.default_generator)
        self.fast = self._fast_source()

    def _fast_source(self):
        """For a TensorDataset, or a part of one, batches can be cut out of its tensors directly, which gives the same batches as stacking examples."""
        if not self.loader._auto_collation or self.collate_fn is not default_collate:
            return None
        dataset, offsets = self.dataset, None
        if type(dataset) is Subset:
            offsets, dataset = dataset.indices, dataset.dataset
        if type(dataset) is TensorDataset and all(t._data.ndim >= 1 for t in dataset.tensors):
            return dataset, offsets
        return None

    def __iter__(self):
        return self

    def __len__(self):
        return len(self.loader._index_sampler)

    def __next__(self):
        index = next(self.sampler_iter)
        if self.loader._auto_collation:
            if self.fast is not None:
                dataset, offsets = self.fast
                rows = np.asarray(index if offsets is None else [offsets[i] for i in index], dtype=np.int64)
                return [Tensor._wrap(t._data[rows], t._dtype) for t in dataset.tensors]
            if callable(getattr(self.dataset, '__getitems__', None)):
                data = self.dataset.__getitems__(index)
            else:
                data = [self.dataset[i] for i in index]
        else:
            data = self.dataset[index]
        return self.collate_fn(data)
