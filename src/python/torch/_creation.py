"""Making tensors: torch.tensor, torch.zeros, torch.arange, torch.randn and the rest."""

import math
import warnings

import numpy as np

from . import _dtype, _random
from ._dtype import Size
from ._tensor import Tensor


def _kind_for(data_kind, dtype):
    return dtype if dtype is not None else data_kind


def _scan(data, depth=0):
    """
    A nested list of numbers as NumPy reads it: returns its shape, its values in a flat list and
    the kinds of number it holds. A list whose items aren't the same length is an error, like PyTorch's.
    """
    if isinstance(data, Tensor):
        if data._data.ndim == 0:
            return (), [data._data.item()], {_python_kind(data._data.item())}
        return _scan(data._data.tolist(), depth)
    if isinstance(data, np.ndarray):
        return _scan(data.tolist(), depth)
    if isinstance(data, np.generic):
        return (), [data.item()], {_python_kind(data.item())}
    if isinstance(data, (bool, int, float)):
        return (), [data], {_python_kind(data)}
    if isinstance(data, (list, tuple)):
        if not data:
            return (0,), [], set()
        shapes, values, kinds = [], [], set()
        for item in data:
            shape, flat, found = _scan(item, depth + 1)
            shapes.append(shape)
            values.extend(flat)
            kinds |= found
        first = shapes[0]
        for shape in shapes:
            if shape != first:
                if len(shape) != len(first):
                    raise ValueError(f'expected sequence of length {len(data)} at dim {depth} (got {shape[0] if shape else "a number"})') from None
                bad = next(i for i, (x, y) in enumerate(zip(shape, first)) if x != y)
                raise ValueError(f'expected sequence of length {first[bad]} at dim {depth + 1 + bad} (got {shape[bad]})')
        return (len(data),) + first, values, kinds
    if isinstance(data, (str, bytes)):
        raise ValueError(f"too many dimensions '{type(data).__name__}'")
    raise TypeError(f"new(): invalid data type '{type(data).__name__}'")


def _python_kind(value):
    return 'bool' if isinstance(value, bool) else 'int' if isinstance(value, int) else 'float'


def tensor(data, *, dtype=None, device=None, requires_grad=False, pin_memory=False):
    """torch.tensor: a new tensor with a copy of the numbers: whole numbers make int64, others float32."""
    _dtype.as_device(device)
    if isinstance(data, Tensor):
        warnings.warn(
            'To copy construct from a tensor, it is recommended to use sourceTensor.detach().clone() or '
            'sourceTensor.detach().clone().requires_grad_(True), rather than torch.tensor(sourceTensor).',
            UserWarning,
            stacklevel=2,
        )
        array = data._data.copy()
        kind = data._dtype
    elif isinstance(data, np.ndarray):
        kind = _dtype.from_numpy(data.dtype)
        array = data.copy()
    elif isinstance(data, np.generic):
        kind = _dtype.from_numpy(data.dtype)
        array = np.asarray(data)
    else:
        shape, values, kinds = _scan(data)
        if 'float' in kinds:
            kind = _dtype.get_default_dtype()
        elif 'int' in kinds:
            kind = _dtype.int64
        elif 'bool' in kinds:
            kind = _dtype.bool_
        else:
            kind = _dtype.get_default_dtype()
        array = np.array(values, dtype=kind.numpy).reshape(shape)
    kind = dtype or kind
    array = array.astype(kind.numpy, copy=False)
    out = Tensor._wrap(array if array.flags.c_contiguous else array.copy(order='C'), kind)
    if requires_grad:
        out.requires_grad_()
    return out


def as_tensor(data, dtype=None, device=None):
    """torch.as_tensor: like torch.tensor, but a tensor or NumPy array that already fits is used as it is."""
    _dtype.as_device(device)
    if isinstance(data, Tensor):
        return data if dtype is None or dtype is data._dtype else data.to(dtype)
    if isinstance(data, np.ndarray):
        kind = _dtype.from_numpy(data.dtype)
        if dtype is None or dtype is kind:
            return Tensor._wrap(data, kind)
        return Tensor._wrap(data.astype(dtype.numpy), dtype)
    return tensor(data, dtype=dtype)


def from_numpy(ndarray):
    """torch.from_numpy: a tensor that shares its numbers with a NumPy array."""
    if not isinstance(ndarray, np.ndarray):
        raise TypeError(f'expected np.ndarray (got {type(ndarray).__name__})')
    return Tensor._wrap(ndarray, _dtype.from_numpy(ndarray.dtype))


def _size(args, name='zeros'):
    if len(args) == 1 and isinstance(args[0], (tuple, list, Size)):
        args = tuple(args[0])
    if len(args) == 1 and isinstance(args[0], Tensor):
        args = (int(args[0]),)
    for n in args:
        if not isinstance(n, (int, np.integer)) or isinstance(n, bool):
            raise TypeError(f'zeros(): argument \'size\' failed to unpack the object at pos {args.index(n) + 1} with error "type must be int, but got {type(n).__name__}"')
        if n < 0:
            raise RuntimeError(f'{name}: Dimension size must be non-negative.')
    return tuple(int(n) for n in args)


def _finish(array, kind, requires_grad):
    out = Tensor._wrap(array, kind)
    if requires_grad:
        out.requires_grad_()
    return out


def zeros(*size, dtype=None, device=None, requires_grad=False, out=None, layout=None, pin_memory=False):
    _dtype.as_device(device)
    kind = dtype or _dtype.get_default_dtype()
    return _finish(np.zeros(_size(size, 'zeros'), dtype=kind.numpy), kind, requires_grad)


def ones(*size, dtype=None, device=None, requires_grad=False, out=None, layout=None, pin_memory=False):
    _dtype.as_device(device)
    kind = dtype or _dtype.get_default_dtype()
    return _finish(np.ones(_size(size, 'ones'), dtype=kind.numpy), kind, requires_grad)


def empty(*size, dtype=None, device=None, requires_grad=False, out=None, layout=None, pin_memory=False):
    return zeros(*size, dtype=dtype, device=device, requires_grad=requires_grad)


def full(size, fill_value, *, dtype=None, device=None, requires_grad=False, out=None, layout=None, pin_memory=False):
    _dtype.as_device(device)
    if dtype is None:
        if isinstance(fill_value, bool):
            dtype = _dtype.bool_
        elif isinstance(fill_value, int):
            dtype = _dtype.int64
        else:
            dtype = _dtype.get_default_dtype()
    if isinstance(fill_value, Tensor):
        fill_value = fill_value.item()
    return _finish(np.full(_size((size,)), fill_value, dtype=dtype.numpy), dtype, requires_grad)


def zeros_like(input, *, dtype=None, device=None, requires_grad=False, memory_format=None):
    kind = dtype or input._dtype
    return _finish(np.zeros(input._data.shape, dtype=kind.numpy), kind, requires_grad)


def ones_like(input, *, dtype=None, device=None, requires_grad=False, memory_format=None):
    kind = dtype or input._dtype
    return _finish(np.ones(input._data.shape, dtype=kind.numpy), kind, requires_grad)


def empty_like(input, *, dtype=None, device=None, requires_grad=False, memory_format=None):
    return zeros_like(input, dtype=dtype, requires_grad=requires_grad)


def full_like(input, fill_value, *, dtype=None, device=None, requires_grad=False, memory_format=None):
    kind = dtype or input._dtype
    return _finish(np.full(input._data.shape, fill_value, dtype=kind.numpy), kind, requires_grad)


def arange(*args, dtype=None, device=None, requires_grad=False, out=None, layout=None, pin_memory=False):
    _dtype.as_device(device)
    args = [a.item() if isinstance(a, Tensor) else a for a in args]
    if len(args) == 1:
        start, end, step = 0, args[0], 1
    elif len(args) == 2:
        start, end, step = args[0], args[1], 1
    elif len(args) == 3:
        start, end, step = args
    else:
        raise TypeError(f'arange() received an invalid combination of arguments - got ({", ".join(type(a).__name__ for a in args)})')
    if step == 0:
        raise RuntimeError('step must be nonzero')
    if (step > 0 and start > end) or (step < 0 and start < end):
        raise RuntimeError('upper bound and larger bound inconsistent with step sign')
    floating = any(isinstance(a, float) for a in (start, end, step))
    kind = dtype or (_dtype.get_default_dtype() if floating else _dtype.int64)
    count = int(math.ceil((end - start) / step))
    values = start + np.arange(count, dtype=np.float64 if floating else np.int64) * step
    return _finish(values.astype(kind.numpy), kind, requires_grad)


def linspace(start, end, steps, *, dtype=None, device=None, requires_grad=False, out=None, layout=None, pin_memory=False):
    start = start.item() if isinstance(start, Tensor) else start
    end = end.item() if isinstance(end, Tensor) else end
    kind = dtype or _dtype.get_default_dtype()
    return _finish(np.linspace(start, end, steps).astype(kind.numpy), kind, requires_grad)


def eye(n, m=None, *, dtype=None, device=None, requires_grad=False, out=None, layout=None, pin_memory=False):
    kind = dtype or _dtype.get_default_dtype()
    return _finish(np.eye(n, m, dtype=kind.numpy), kind, requires_grad)


def tril(input, diagonal=0):
    return Tensor._wrap(np.tril(input._data, diagonal), input._dtype)


def triu(input, diagonal=0):
    return Tensor._wrap(np.triu(input._data, diagonal), input._dtype)


def diag(input, diagonal=0):
    return Tensor._wrap(np.diag(input._data, diagonal).copy(), input._dtype)


# ---------- Random tensors ----------


def _generator(generator):
    return generator if generator is not None else _random.default_generator


def rand(*size, generator=None, dtype=None, device=None, requires_grad=False, out=None, layout=None, pin_memory=False):
    _dtype.as_device(device)
    kind = dtype or _dtype.get_default_dtype()
    shape = _size(size)
    values = _random.uniform(int(np.prod(shape)), 0.0, 1.0, kind, _generator(generator))
    return _finish(values.astype(kind.numpy).reshape(shape), kind, requires_grad)


def randn(*size, generator=None, dtype=None, device=None, requires_grad=False, out=None, layout=None, pin_memory=False):
    _dtype.as_device(device)
    kind = dtype or _dtype.get_default_dtype()
    shape = _size(size)
    values = _random.normal(int(np.prod(shape)), 0.0, 1.0, kind, _generator(generator))
    return _finish(values.reshape(shape), kind, requires_grad)


def rand_like(input, *, dtype=None, device=None, requires_grad=False, memory_format=None):
    return rand(input._data.shape, dtype=dtype or input._dtype, requires_grad=requires_grad)


def randn_like(input, *, dtype=None, device=None, requires_grad=False, memory_format=None):
    return randn(input._data.shape, dtype=dtype or input._dtype, requires_grad=requires_grad)


def randint(low=0, high=None, size=None, *, generator=None, dtype=None, device=None, requires_grad=False, out=None, layout=None, pin_memory=False):
    if size is None:
        # randint(high, size)
        low, high, size = 0, low, high
    if high is None or size is None:
        raise TypeError('randint() received an invalid combination of arguments')
    if low >= high:
        raise RuntimeError(f'random_ expects \'from\' to be less than \'to\', but got from={low} >= to={high}')
    kind = dtype or _dtype.int64
    shape = _size((size,))
    values = _random.integers(int(np.prod(shape)), low, high, _generator(generator))
    return _finish(values.astype(kind.numpy).reshape(shape), kind, requires_grad)


def randint_like(input, low=0, high=None, *, dtype=None, device=None, requires_grad=False, memory_format=None):
    if high is None:
        low, high = 0, low
    return randint(low, high, input._data.shape, dtype=dtype or input._dtype, requires_grad=requires_grad)


def randperm(n, *, generator=None, dtype=None, device=None, requires_grad=False, out=None, layout=None, pin_memory=False):
    if n < 0:
        raise RuntimeError(f'randperm: n must be non-negative, got {n}')
    kind = dtype or _dtype.int64
    return _finish(_random.permutation(n, _generator(generator)).astype(kind.numpy), kind, requires_grad)


def normal(mean=0.0, std=1.0, size=None, *, generator=None, dtype=None, device=None, requires_grad=False, out=None):
    if isinstance(mean, Tensor) or isinstance(std, Tensor):
        m = mean if isinstance(mean, Tensor) else None
        s = std if isinstance(std, Tensor) else None
        shape = (m if m is not None else s)._data.shape
        kind = (m if m is not None else s)._dtype
        noise = _random.normal(int(np.prod(shape)), 0.0, 1.0, kind, _generator(generator)).reshape(shape)
        means = m._data if m is not None else mean
        stds = s._data if s is not None else std
        return _finish((noise * stds + means).astype(kind.numpy), kind, requires_grad)
    kind = dtype or _dtype.get_default_dtype()
    shape = _size((size,))
    return _finish(_random.normal(int(np.prod(shape)), mean, std, kind, _generator(generator)).reshape(shape), kind, requires_grad)


def bernoulli(input, p=None, *, generator=None):
    probabilities = input._data if p is None else p
    draws = _random.uniform(input._data.size, 0.0, 1.0, _dtype.float32, _generator(generator)).reshape(input._data.shape)
    return Tensor._wrap((draws < probabilities).astype(input._data.dtype), input._dtype)


# ---------- The older ways of making tensors ----------


def legacy(kind, args, kwargs, cls=None):
    """torch.Tensor(...), torch.FloatTensor(...) and the like: the numbers, or the size of a tensor to fill with zeros."""
    if kwargs and set(kwargs) - {'device', 'dtype'}:
        raise TypeError(f'new() received an invalid combination of arguments - got ({", ".join(kwargs)})')
    if not args:
        return Tensor._wrap(np.zeros((0,), dtype=kind.numpy), kind, cls=cls)
    if len(args) == 1 and not isinstance(args[0], (int, np.integer)) or (len(args) == 1 and isinstance(args[0], bool)):
        data = args[0]
        if isinstance(data, Size):
            return Tensor._wrap(np.zeros(tuple(data), dtype=kind.numpy), kind, cls=cls)
        if isinstance(data, Tensor):
            if data._dtype is not kind:
                raise TypeError(f'expected {kind} (got {data._dtype})')
            return Tensor._wrap(data._data, kind, cls=cls)
        out = tensor(data, dtype=kind)
        return Tensor._wrap(out._data, kind, cls=cls)
    if all(isinstance(n, (int, np.integer)) and not isinstance(n, bool) for n in args):
        return Tensor._wrap(np.zeros(_size(args), dtype=kind.numpy), kind, cls=cls)
    raise TypeError(f'new(): argument \'size\' must be tuple of ints, but found element of type {type(args[1]).__name__} at pos 1')


def _legacy_class(name, kind):
    class Legacy(type):
        def __instancecheck__(cls, instance):
            return isinstance(instance, Tensor) and instance._dtype is kind

    def construct(cls, *args, **kwargs):
        return legacy(kind, args, kwargs)

    return Legacy(name, (), {'__new__': construct, '__module__': 'torch'})


FloatTensor = _legacy_class('FloatTensor', _dtype.float32)
DoubleTensor = _legacy_class('DoubleTensor', _dtype.float64)
HalfTensor = _legacy_class('HalfTensor', _dtype.float16)
LongTensor = _legacy_class('LongTensor', _dtype.int64)
IntTensor = _legacy_class('IntTensor', _dtype.int32)
ShortTensor = _legacy_class('ShortTensor', _dtype.int16)
CharTensor = _legacy_class('CharTensor', _dtype.int8)
ByteTensor = _legacy_class('ByteTensor', _dtype.uint8)
BoolTensor = _legacy_class('BoolTensor', _dtype.bool_)
