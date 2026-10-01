"""torch.nn: the building blocks of neural networks."""

from . import functional, init, utils  # noqa: F401
from .parameter import Parameter, UninitializedParameter  # noqa: F401
from .module import Module  # noqa: F401
from .layers import (  # noqa: F401
    Identity, Linear, ReLU, Sigmoid, Tanh, LeakyReLU, ELU, GELU, SiLU, Softplus, Softmax, LogSoftmax, Flatten, Unflatten,
    Dropout,
)
from .containers import Sequential, ModuleList, ModuleDict  # noqa: F401
from .loss import (  # noqa: F401
    MSELoss, L1Loss, SmoothL1Loss, HuberLoss, NLLLoss, CrossEntropyLoss, BCELoss, BCEWithLogitsLoss,
)

from . import layers as _layers, containers as _containers, loss as _loss

for _module in (_layers, _containers, _loss):
    for _name in dir(_module):
        _obj = getattr(_module, _name)
        if isinstance(_obj, type) and _obj.__module__ == _module.__name__:
            _obj.__module__ = 'torch.nn.modules.' + _module.__name__.rsplit('.', 1)[-1]
del _module, _name, _obj
