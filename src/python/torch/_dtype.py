"""
torch.dtype, torch.device and torch.Size, and the rules that decide which dtype a result has.

Everything here follows PyTorch, so that `x.dtype`, `x.shape` and `x.device` print what readers
would see on their own computer.
"""

import numpy as np


class dtype:
    """A kind of number a tensor holds, like torch.float32."""

    __slots__ = ('name', 'numpy', 'is_floating_point', 'is_signed', 'itemsize', 'rank')

    def __init__(self, name, numpy, is_floating_point, is_signed, rank):
        self.name = name
        self.numpy = np.dtype(numpy)
        self.is_floating_point = is_floating_point
        self.is_signed = is_signed
        self.itemsize = self.numpy.itemsize
        # 0 for booleans, 1 for integers, 2 for floats: a result takes the highest of its operands.
        self.rank = rank

    def __repr__(self):
        return f'torch.{self.name}'

    def __reduce__(self):
        return (_dtype_named, (self.name,))


float16 = dtype('float16', np.float16, True, True, 2)
float32 = dtype('float32', np.float32, True, True, 2)
float64 = dtype('float64', np.float64, True, True, 2)
uint8 = dtype('uint8', np.uint8, False, False, 1)
int8 = dtype('int8', np.int8, False, True, 1)
int16 = dtype('int16', np.int16, False, True, 1)
int32 = dtype('int32', np.int32, False, True, 1)
int64 = dtype('int64', np.int64, False, True, 1)
bool_ = dtype('bool', np.bool_, False, False, 0)

ALL = [float16, float32, float64, uint8, int8, int16, int32, int64, bool_]
# torch.float is torch.float32, torch.long is torch.int64, and so on.
ALIASES = {
    'half': float16,
    'float': float32,
    'double': float64,
    'short': int16,
    'int': int32,
    'long': int64,
    'bool': bool_,
}
_BY_NAME = {kind.name: kind for kind in ALL}
_BY_NUMPY = {kind.numpy: kind for kind in ALL}

# What 1.5 or 2.5 become in a tensor, until torch.set_default_dtype says otherwise.
_default = float32


def _dtype_named(name):
    return _BY_NAME[name]


def from_numpy(kind):
    """The torch dtype of a NumPy dtype."""
    try:
        return _BY_NUMPY[np.dtype(kind)]
    except KeyError:
        raise TypeError(f'can\'t convert np.ndarray of type {np.dtype(kind).name}. The only supported types are: '
                        'float64, float32, float16, int64, int32, int16, int8, uint8, and bool.') from None


def get_default_dtype():
    return _default


def set_default_dtype(kind):
    global _default
    if kind not in (float16, float32, float64):
        raise TypeError(f'only floating-point types are supported as the default type, not {kind}')
    _default = kind


def promote_types(a, b):
    """torch.promote_types: the smallest dtype that can hold what both dtypes hold."""
    if a is b:
        return a
    if a.rank != b.rank:
        return a if a.rank > b.rank else b
    if a.rank == 2:
        return a if a.itemsize >= b.itemsize else b
    # Both are integers. A uint8 and an int8 don't fit in either, so they make an int16.
    if a is uint8 or b is uint8:
        other = b if a is uint8 else a
        return int16 if other is int8 else other
    return a if a.itemsize >= b.itemsize else b


def result_type(*operands):
    """
    The dtype that an operation on these operands has, which PyTorch works out in three tiers: the
    tensors with dimensions decide first, then tensors without dimensions and then Python numbers,
    and a tier only counts when it holds a higher kind of number (bool, integer, float) than the
    ones before it. So a float32 tensor plus a float64 number is float32, but an int64 tensor plus
    a float number is float32 too: the default dtype.
    """
    from ._tensor import Tensor

    dimensioned = zero_dim = wrapped = None
    for operand in operands:
        if isinstance(operand, Tensor):
            kind = operand._dtype
            if operand._data.ndim:
                dimensioned = kind if dimensioned is None else promote_types(dimensioned, kind)
            else:
                zero_dim = kind if zero_dim is None else promote_types(zero_dim, kind)
        else:
            if isinstance(operand, bool):
                kind = bool_
            elif isinstance(operand, int):
                kind = int64
            elif isinstance(operand, float):
                kind = _default
            else:
                raise TypeError(f'unsupported operand: {type(operand).__name__}')
            wrapped = kind if wrapped is None else promote_types(wrapped, kind)
    return _combine(dimensioned, _combine(zero_dim, wrapped))


def _combine(higher, lower):
    """Takes `lower` over `higher` only when it's a higher kind of number."""
    if higher is None:
        return lower
    if lower is None:
        return higher
    if higher.is_floating_point:
        return higher
    if higher is bool_ or lower.is_floating_point:
        return promote_types(higher, lower)
    return higher


class device:
    """Where a tensor lives. In the page, everything lives on the CPU."""

    __slots__ = ('type', 'index')

    def __init__(self, type='cpu', index=None):
        if isinstance(type, device):
            type, index = type.type, type.index
        elif isinstance(type, str):
            name, _, number = type.partition(':')
            if name not in ('cpu', 'cuda', 'mps', 'meta') or (number and not number.isdigit()):
                raise RuntimeError(
                    f"Expected one of cpu, cuda, ipu, xpu, mkldnn, opengl, opencl, ideep, hip, ve, fpga, maia, "
                    f"xla, lazy, vulkan, mps, meta, hpu, mtia, privateuseone device type at start of device string: {type}"
                )
            type = name
            index = int(number) if number else index
        elif isinstance(type, int):
            type, index = 'cuda', type
        self.type = type
        self.index = index

    def __repr__(self):
        if self.index is None:
            return f"device(type='{self.type}')"
        return f"device(type='{self.type}', index={self.index})"

    def __str__(self):
        return self.type if self.index is None else f'{self.type}:{self.index}'

    def __eq__(self, other):
        return isinstance(other, device) and (self.type, self.index) == (other.type, other.index)

    def __hash__(self):
        return hash((self.type, self.index))


CPU = device('cpu')


def as_device(where):
    """The device a `device=` argument names; the page has no GPU, so anything but the CPU is an error."""
    if where is None:
        return CPU
    where = device(where)
    if where.type == 'cuda':
        raise AssertionError('Torch not compiled with CUDA enabled')
    if where.type != 'cpu':
        raise RuntimeError(f'PyTorch is not linked with support for {where.type} devices')
    return where


class Size(tuple):
    """The shape of a tensor: a tuple that prints as torch.Size([2, 3])."""

    def __repr__(self):
        return f'torch.Size({list(self)!r})'

    def __getitem__(self, index):
        picked = tuple.__getitem__(self, index)
        return Size(picked) if isinstance(index, slice) else picked

    def numel(self):
        count = 1
        for size in self:
            count *= size
        return count
