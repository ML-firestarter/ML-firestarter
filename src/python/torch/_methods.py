"""The operators and methods of a tensor, which pass on to the functions in _ops.py."""

import numpy as np

from . import _dtype, _ops
from ._tensor import Tensor


def _accepts(other):
    return isinstance(other, (Tensor, bool, int, float, np.generic, np.ndarray))


def _operator(function, swap=False):
    def method(self, other):
        if not _accepts(other):
            return NotImplemented
        return function(other, self) if swap else function(self, other)

    return method


def _in_place_operator(function):
    def method(self, other):
        if not _accepts(other):
            return NotImplemented
        return _ops.apply_in_place(self, function, other)

    return method


def _rdiv(self, other):
    return _ops.mul(_ops.reciprocal(self), other)


def _method(function):
    def method(self, *args, **kwargs):
        return function(self, *args, **kwargs)

    method.__name__ = function.__name__
    return method


def _in_place(function):
    def method(self, *args, **kwargs):
        return _ops.apply_in_place(self, function, *args, **kwargs)

    return method


for _name, _function in {
    '__add__': _operator(_ops.add),
    '__radd__': _operator(_ops.add, swap=True),
    '__sub__': _operator(_ops.sub),
    '__rsub__': _operator(_ops.sub, swap=True),
    '__mul__': _operator(_ops.mul),
    '__rmul__': _operator(_ops.mul, swap=True),
    '__truediv__': _operator(_ops.div),
    '__rtruediv__': lambda self, other: _rdiv(self, other) if _accepts(other) else NotImplemented,
    '__floordiv__': _operator(_ops.floor_divide),
    '__rfloordiv__': _operator(_ops.floor_divide, swap=True),
    '__mod__': _operator(_ops.remainder),
    '__rmod__': _operator(_ops.remainder, swap=True),
    '__pow__': _operator(_ops.pow),
    '__rpow__': _operator(_ops.pow, swap=True),
    '__matmul__': lambda self, other: _ops.matmul(self, other) if isinstance(other, Tensor) else NotImplemented,
    '__rmatmul__': lambda self, other: _ops.matmul(other, self) if isinstance(other, Tensor) else NotImplemented,
    '__and__': _operator(_ops.bitwise_and),
    '__rand__': _operator(_ops.bitwise_and, swap=True),
    '__or__': _operator(_ops.bitwise_or),
    '__ror__': _operator(_ops.bitwise_or, swap=True),
    '__xor__': _operator(_ops.bitwise_xor),
    '__rxor__': _operator(_ops.bitwise_xor, swap=True),
    '__iadd__': _in_place_operator(_ops.add),
    '__isub__': _in_place_operator(_ops.sub),
    '__imul__': _in_place_operator(_ops.mul),
    '__itruediv__': _in_place_operator(_ops.div),
    '__ifloordiv__': _in_place_operator(_ops.floor_divide),
    '__imod__': _in_place_operator(_ops.remainder),
    '__ipow__': _in_place_operator(_ops.pow),
    '__iand__': _in_place_operator(_ops.bitwise_and),
    '__ior__': _in_place_operator(_ops.bitwise_or),
    '__ixor__': _in_place_operator(_ops.bitwise_xor),
    '__neg__': _method(_ops.neg),
    '__pos__': lambda self: self,
    '__abs__': _method(_ops.abs),
    '__invert__': _method(_ops.bitwise_not),
}.items():
    setattr(Tensor, _name, _function)


def _compare_operator(function):
    def method(self, other):
        if other is None or isinstance(other, (str, bytes)):
            return NotImplemented
        if not _accepts(other):
            return NotImplemented
        return function(self, other)

    return method


Tensor.__eq__ = _compare_operator(_ops.eq)
Tensor.__ne__ = _compare_operator(_ops.ne)
Tensor.__lt__ = _compare_operator(_ops.lt)
Tensor.__le__ = _compare_operator(_ops.le)
Tensor.__gt__ = _compare_operator(_ops.gt)
Tensor.__ge__ = _compare_operator(_ops.ge)
Tensor.__hash__ = lambda self: id(self)

# Methods that are the function of the same name with the tensor first.
for _name in (
    'add', 'sub', 'mul', 'div', 'true_divide', 'floor_divide', 'remainder', 'fmod', 'pow',
    'neg', 'exp', 'log', 'log1p', 'log2', 'log10', 'expm1', 'sqrt', 'rsqrt', 'sin', 'cos', 'tan', 'tanh', 'sigmoid',
    'reciprocal', 'sign', 'floor', 'ceil', 'trunc', 'round', 'square', 'clamp', 'clip', 'nan_to_num',
    'isnan', 'isinf', 'isfinite',
    'sum', 'mean', 'std', 'var', 'prod', 'cumsum', 'max', 'min', 'amax', 'amin', 'argmax', 'argmin', 'logsumexp', 'norm',
    'softmax', 'log_softmax', 'relu',
    'matmul', 'mm', 'bmm', 'mv', 'dot', 'outer',
    'reshape', 'flatten', 'squeeze', 'unsqueeze', 'permute', 'transpose', 't', 'movedim', 'expand', 'expand_as',
    'repeat', 'flip', 'unbind', 'split', 'chunk', 'narrow', 'select', 'index_select', 'gather', 'topk', 'sort', 'argsort',
    'masked_fill', 'maximum', 'minimum', 'nonzero',
    'eq', 'ne', 'lt', 'le', 'gt', 'ge',
    'logical_and', 'logical_or', 'logical_xor', 'logical_not',
    'bitwise_and', 'bitwise_or', 'bitwise_xor', 'bitwise_not',
    'view', 'broadcast_to', 'abs', 'absolute',
):
    setattr(Tensor, _name, _method(getattr(_ops, _name)))

Tensor.all = _method(_ops.all_)
Tensor.any = _method(_ops.any_)
Tensor.rsub = _method(_ops.rsub)
Tensor.view_as = lambda self, other: _ops.view(self, other._data.shape)
Tensor.reshape_as = lambda self, other: _ops.reshape(self, other._data.shape)
Tensor.greater = Tensor.gt
Tensor.less = Tensor.lt
Tensor.where = lambda self, condition, other: _ops.where(condition, self, other)
Tensor.tril = lambda self, diagonal=0: _ops_creation().tril(self, diagonal)
Tensor.triu = lambda self, diagonal=0: _ops_creation().triu(self, diagonal)
Tensor.diag = lambda self, diagonal=0: _ops_creation().diag(self, diagonal)


def _ops_creation():
    from . import _creation

    return _creation


# In-place versions: the same function, with the result written into the tensor.
for _name in (
    'add', 'sub', 'mul', 'div', 'true_divide', 'floor_divide', 'remainder', 'fmod', 'pow',
    'neg', 'exp', 'log', 'log1p', 'sqrt', 'rsqrt', 'sin', 'cos', 'tan', 'tanh', 'sigmoid', 'reciprocal', 'sign',
    'floor', 'ceil', 'trunc', 'round', 'square', 'clamp', 'clip', 'relu', 'abs', 'masked_fill', 'nan_to_num',
):
    setattr(Tensor, _name + '_', _in_place(getattr(_ops, _name)))


def _lerp(input, end, weight):
    return _ops.add(input, _ops.mul(_ops.sub(end, input), weight))


def _addcmul(input, tensor1, tensor2, *, value=1):
    return _ops.add(input, _ops.mul(_ops.mul(tensor1, tensor2), value))


def _addcdiv(input, tensor1, tensor2, *, value=1):
    return _ops.add(input, _ops.mul(_ops.div(tensor1, tensor2), value))


Tensor.lerp = _method(_lerp)
Tensor.lerp_ = _in_place(_lerp)
Tensor.addcmul = _method(_addcmul)
Tensor.addcmul_ = _in_place(_addcmul)
Tensor.addcdiv = _method(_addcdiv)
Tensor.addcdiv_ = _in_place(_addcdiv)


def _allclose(input, other, rtol=1e-05, atol=1e-08, equal_nan=False):
    return bool(np.allclose(input._data, other._data, rtol=rtol, atol=atol, equal_nan=equal_nan))


def _isclose(input, other, rtol=1e-05, atol=1e-08, equal_nan=False):
    return Tensor._wrap(np.isclose(input._data, other._data, rtol=rtol, atol=atol, equal_nan=equal_nan), _dtype.bool_)


def _equal(input, other):
    return bool(input._data.shape == other._data.shape and np.array_equal(input._data, other._data))


Tensor.allclose = _method(_allclose)
Tensor.isclose = _method(_isclose)
Tensor.equal = _method(_equal)
Tensor.masked_select = lambda self, mask: self[mask]
