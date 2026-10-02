"""torch.utils.data: datasets and the DataLoader that serves them in batches."""

from .dataset import Dataset, IterableDataset, TensorDataset, Subset, ConcatDataset, random_split  # noqa: F401
from .sampler import Sampler, SequentialSampler, RandomSampler, SubsetRandomSampler, BatchSampler  # noqa: F401
from .dataloader import DataLoader, default_collate, default_convert  # noqa: F401
from . import dataset as _dataset, sampler as _sampler, dataloader as _dataloader

for _module, _label in ((_dataset, 'dataset'), (_sampler, 'sampler'), (_dataloader, 'dataloader')):
    for _name in dir(_module):
        _obj = getattr(_module, _name)
        if isinstance(_obj, type) and _obj.__module__ == _module.__name__:
            _obj.__module__ = f'torch.utils.data.{_label}'
del _module, _label, _name, _obj
