"""The layers of a network: Linear, the activation functions, Flatten and Dropout."""

import math

from .. import _dtype, _ops
from .._creation import empty
from . import functional as F
from . import init
from .module import Module
from .parameter import Parameter


class Identity(Module):
    def __init__(self, *args, **kwargs):
        super().__init__()

    def forward(self, input):
        return input


class Linear(Module):
    """A fully connected layer: output = input @ weight.T + bias, with a weight for every input and output pair."""

    def __init__(self, in_features, out_features, bias=True, device=None, dtype=None):
        super().__init__()
        _dtype.as_device(device)
        self.in_features = in_features
        self.out_features = out_features
        self.weight = Parameter(empty((out_features, in_features), dtype=dtype))
        if bias:
            self.bias = Parameter(empty(out_features, dtype=dtype))
        else:
            self.register_parameter('bias', None)
        self.reset_parameters()

    def reset_parameters(self):
        init.kaiming_uniform_(self.weight, a=math.sqrt(5))
        if self.bias is not None:
            fan_in, _ = init._calculate_fan_in_and_fan_out(self.weight)
            bound = 1 / math.sqrt(fan_in) if fan_in > 0 else 0
            init.uniform_(self.bias, -bound, bound)

    def forward(self, input):
        return F.linear(input, self.weight, self.bias)

    def extra_repr(self):
        return f'in_features={self.in_features}, out_features={self.out_features}, bias={self.bias is not None}'


class ReLU(Module):
    def __init__(self, inplace=False):
        super().__init__()
        self.inplace = inplace

    def forward(self, input):
        return F.relu(input, inplace=self.inplace)

    def extra_repr(self):
        return 'inplace=True' if self.inplace else ''


class Sigmoid(Module):
    def forward(self, input):
        return F.sigmoid(input)


class Tanh(Module):
    def forward(self, input):
        return F.tanh(input)


class LeakyReLU(Module):
    def __init__(self, negative_slope=0.01, inplace=False):
        super().__init__()
        self.negative_slope = negative_slope
        self.inplace = inplace

    def forward(self, input):
        return F.leaky_relu(input, self.negative_slope)

    def extra_repr(self):
        inplace = ', inplace=True' if self.inplace else ''
        return f'negative_slope={self.negative_slope}{inplace}'


class ELU(Module):
    def __init__(self, alpha=1.0, inplace=False):
        super().__init__()
        self.alpha = alpha
        self.inplace = inplace

    def forward(self, input):
        return F.elu(input, self.alpha)

    def extra_repr(self):
        inplace = ', inplace=True' if self.inplace else ''
        return f'alpha={self.alpha}{inplace}'


class GELU(Module):
    def __init__(self, approximate='none'):
        super().__init__()
        self.approximate = approximate

    def forward(self, input):
        return F.gelu(input, approximate=self.approximate)

    def extra_repr(self):
        return f'approximate={self.approximate!r}'


class SiLU(Module):
    def __init__(self, inplace=False):
        super().__init__()

    def forward(self, input):
        return F.silu(input)


class Softplus(Module):
    def __init__(self, beta=1.0, threshold=20.0):
        super().__init__()
        self.beta = beta
        self.threshold = threshold

    def forward(self, input):
        return F.softplus(input, self.beta, self.threshold)

    def extra_repr(self):
        return f'beta={self.beta}, threshold={self.threshold}'


class Softmax(Module):
    def __init__(self, dim=None):
        super().__init__()
        self.dim = dim

    def forward(self, input):
        return F.softmax(input, self.dim, _stacklevel=5)

    def extra_repr(self):
        return f'dim={self.dim}'


class LogSoftmax(Module):
    def __init__(self, dim=None):
        super().__init__()
        self.dim = dim

    def forward(self, input):
        return F.log_softmax(input, self.dim, _stacklevel=5)

    def extra_repr(self):
        return f'dim={self.dim}'


class Flatten(Module):
    """Reshapes each example of a batch into one long row: (32, 1, 28, 28) becomes (32, 784)."""

    def __init__(self, start_dim=1, end_dim=-1):
        super().__init__()
        self.start_dim = start_dim
        self.end_dim = end_dim

    def forward(self, input):
        return input.flatten(self.start_dim, self.end_dim)

    def extra_repr(self):
        return f'start_dim={self.start_dim}, end_dim={self.end_dim}'


class Unflatten(Module):
    def __init__(self, dim, unflattened_size):
        super().__init__()
        self.dim = dim
        self.unflattened_size = unflattened_size

    def forward(self, input):
        axis = self.dim % input.dim()
        shape = tuple(input.shape[:axis]) + tuple(self.unflattened_size) + tuple(input.shape[axis + 1 :])
        return input.reshape(shape)

    def extra_repr(self):
        return f'dim={self.dim}, unflattened_size={self.unflattened_size}'


class Dropout(Module):
    """While training, sets a share `p` of the numbers to zero at random, and scales the rest up to make up for it."""

    def __init__(self, p=0.5, inplace=False):
        super().__init__()
        if p < 0 or p > 1:
            raise ValueError(f'dropout probability has to be between 0 and 1, but got {p}')
        self.p = p
        self.inplace = inplace

    def forward(self, input):
        return F.dropout(input, self.p, self.training, self.inplace)

    def extra_repr(self):
        return f'p={self.p}, inplace={self.inplace}'
