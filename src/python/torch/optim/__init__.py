"""torch.optim: the optimizers that update a model's parameters."""

from .optimizer import Optimizer  # noqa: F401
from .sgd import SGD  # noqa: F401
from .adam import Adam, AdamW  # noqa: F401
from . import lr_scheduler  # noqa: F401

for _cls in (SGD, Adam, AdamW):
    _cls.__module__ = 'torch.optim.' + _cls.__name__.lower()
del _cls
