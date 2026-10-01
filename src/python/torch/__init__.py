"""
A small PyTorch for the page.

PyTorch itself can't run in a browser, so lessons that use `import torch` get this: a NumPy-backed
tensor library that behaves like PyTorch for what the lessons use. Tensors print the way PyTorch's
do, errors say what PyTorch's say, and after `torch.manual_seed(42)` the random numbers are the
same ones PyTorch makes, so a lesson's numbers are the ones a reader gets on their own computer.
"""

from . import _dtype, _random, _printing
from ._dtype import (  # noqa: F401
    dtype, device, Size, float16, float32, float64, uint8, int8, int16, int32, int64,
    get_default_dtype, set_default_dtype, promote_types, result_type,
)
from ._dtype import bool_ as bool  # noqa: A001
from ._dtype import ALIASES as _ALIASES

globals().update(_ALIASES)
del _ALIASES

from ._autograd import (  # noqa: E402,F401
    no_grad, enable_grad, set_grad_enabled, is_grad_enabled, inference_mode, is_inference_mode_enabled,
)
from ._tensor import Tensor  # noqa: E402,F401
from . import _ops, _creation  # noqa: E402
from ._random import Generator, manual_seed, seed, initial_seed, default_generator  # noqa: E402,F401
from ._printing import set_printoptions  # noqa: E402,F401
from .serialization import save, load  # noqa: E402,F401
from . import autograd, backends, cuda, nn, optim, utils  # noqa: E402,F401

from ._creation import (  # noqa: E402,F401
    tensor, as_tensor, from_numpy, zeros, ones, empty, full, zeros_like, ones_like, empty_like, full_like,
    arange, linspace, eye, tril, triu, diag, rand, randn, rand_like, randn_like, randint, randint_like, randperm,
    normal, bernoulli,
    FloatTensor, DoubleTensor, HalfTensor, LongTensor, IntTensor, ShortTensor, CharTensor, ByteTensor, BoolTensor,
)
from ._ops import (  # noqa: E402,F401
    add, sub, rsub, mul, div, true_divide, floor_divide, remainder, fmod, pow,
    eq, ne, lt, le, gt, ge, logical_and, logical_or, logical_xor, logical_not,
    bitwise_and, bitwise_or, bitwise_xor, bitwise_not, maximum, minimum,
    neg, exp, log, log1p, log2, log10, expm1, sqrt, rsqrt, sin, cos, tan, tanh, sigmoid, reciprocal, abs, absolute,
    sign, floor, ceil, trunc, square, round, clamp, clip, isnan, isinf, isfinite, nan_to_num, where, nonzero,
    masked_fill, relu,
    sum, mean, var, std, prod, cumsum, max, min, amax, amin, argmax, argmin, logsumexp, norm, softmax, log_softmax,
    matmul, mm, bmm, mv, dot, outer, addmm,
    reshape, flatten, squeeze, unsqueeze, permute, transpose, t, movedim, expand_as, broadcast_to, flip,
    clone, detach, cat, concat, concatenate, stack, unbind, split, chunk, narrow, select, index_select, gather,
    topk, sort, argsort,
)

all = _ops.all_  # noqa: A001
any = _ops.any_  # noqa: A001


def is_tensor(obj):
    return isinstance(obj, Tensor)


def is_floating_point(input):
    return input._dtype.is_floating_point


def numel(input):
    return input._data.size


def allclose(input, other, rtol=1e-05, atol=1e-08, equal_nan=False):
    return Tensor.allclose(input, other, rtol, atol, equal_nan)


def isclose(input, other, rtol=1e-05, atol=1e-08, equal_nan=False):
    return Tensor.isclose(input, other, rtol, atol, equal_nan)


def equal(input, other):
    return Tensor.equal(input, other)


def can_cast(from_, to):
    return from_.rank <= to.rank


__version__ = '2.14.1+browser'


# Classes print as torch.Tensor, torch.Size and so on, as they do in PyTorch.
for _cls in (Tensor, Size, dtype, device, Generator):
    _cls.__module__ = 'torch'
del _cls
