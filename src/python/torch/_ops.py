"""
The operations on tensors, written with NumPy: each works out its result, and when gradients are
tracked, makes the node that goes backward through it. The names and the errors are PyTorch's.
"""

import builtins
import math
import warnings

import numpy as np

from . import _autograd, _dtype, _random
from ._autograd import track
from ._dtype import Size, promote_types, result_type
from ._tensor import Tensor

# `max`, `min`, `sum`, `abs`, `round` and `any` are torch functions here, so the builtins get other names.
_max, _min, _sum, _abs, _round, _any, _all = builtins.max, builtins.min, builtins.sum, builtins.abs, builtins.round, builtins.any, builtins.all


# ---------- Helpers ----------


def _arr(value):
    """NumPy gives a number, not an array, for some results on 0-dimensional arrays."""
    return value if value.__class__ is np.ndarray else np.asarray(value)


def _is_tensor(x):
    return x.__class__ is Tensor or isinstance(x, Tensor)


def _number(x):
    """A Python number, a NumPy one as a Python one, or None for anything else."""
    if isinstance(x, (bool, int, float)):
        return x
    if isinstance(x, np.generic):
        return x.item()
    return None


def _operand(x, name='operand'):
    """A tensor or a Python number, whatever a NumPy array or number was given."""
    if isinstance(x, Tensor):
        return x
    number = _number(x)
    if number is not None:
        return number
    if isinstance(x, np.ndarray):
        return Tensor._wrap(x, _dtype.from_numpy(x.dtype))
    raise TypeError(f'{name} must be Tensor or a number, not {type(x).__name__}')


def _wrap(data, kind, node=None):
    return Tensor._wrap(data, kind, node)


def _shape_text(shape):
    return 'x'.join(str(n) for n in shape)


def _broadcast_error(a_shape, b_shape):
    """The error for two shapes that don't broadcast, and the same dimension PyTorch names in it."""
    rank = _max(len(a_shape), len(b_shape))
    a = (1,) * (rank - len(a_shape)) + tuple(a_shape)
    b = (1,) * (rank - len(b_shape)) + tuple(b_shape)
    for i in range(rank - 1, -1, -1):
        if a[i] != b[i] and a[i] != 1 and b[i] != 1:
            return RuntimeError(
                f'The size of tensor a ({a[i]}) must match the size of tensor b ({b[i]}) at non-singleton dimension {i}'
            )
    return RuntimeError('shapes cannot be broadcast')


def _unbroadcast(grad, shape):
    """Adds up the gradient over the dimensions that a number was repeated along to match a bigger shape."""
    if grad.shape == shape:
        return grad
    extra = grad.ndim - len(shape)
    if extra:
        grad = grad.sum(axis=tuple(range(extra)))
    axes = tuple(i for i, n in enumerate(shape) if n == 1 and grad.shape[i] != 1)
    if axes:
        grad = grad.sum(axis=axes, keepdims=True)
    return grad


def _grad_for(grad, tensor):
    """A gradient in the shape and dtype of the tensor it's for."""
    grad = _unbroadcast(grad, tensor._data.shape)
    if grad.dtype != tensor._dtype.numpy:
        grad = grad.astype(tensor._dtype.numpy)
    return grad


def _tensors(*values):
    return [v for v in values if isinstance(v, Tensor)]


def _float_kind(kind):
    """What a tensor's numbers become when an operation needs real ones, like exp(): integers become float32."""
    return kind if kind.is_floating_point else _dtype.get_default_dtype()


# ---------- Arithmetic ----------


def _arith(a, b, np_op, name, backward, kind=None, quiet=False, saves=True):
    """
    A binary operation. `backward(g, a, b, out)` gives the gradients for a and b (None for one
    that isn't a tensor or doesn't need one), before they're added up over broadcast dimensions.
    """
    a, b = _operand(a), _operand(b)
    ta, tb = a.__class__ is Tensor or isinstance(a, Tensor), b.__class__ is Tensor or isinstance(b, Tensor)
    kind = kind or result_type(a, b)
    npk = kind.numpy
    ad = a._data if ta else a
    bd = b._data if tb else b
    if ta and ad.dtype != npk:
        ad = ad.astype(npk)
    if tb and bd.dtype != npk:
        bd = bd.astype(npk)
    try:
        if quiet:
            with np.errstate(all='ignore'):
                out = _arr(np_op(ad, bd))
        else:
            out = _arr(np_op(ad, bd))
    except ValueError:
        raise _broadcast_error(ad.shape if ta else (), bd.shape if tb else ()) from None
    if out.dtype != npk:
        out = out.astype(npk)
    inputs = [t for t in (a, b) if isinstance(t, Tensor)]
    node = track(name, inputs, None, saves, inputs if saves else ()) if inputs else None
    if node is not None:
        need_a, need_b = ta and a._requires_grad, tb and b._requires_grad

        def fn(g):
            ga, gb = backward(g, ad, bd, out, need_a, need_b)
            grads = []
            if ta:
                grads.append(_grad_for(ga, a) if need_a else None)
            if tb:
                grads.append(_grad_for(gb, b) if need_b else None)
            return grads

        node.fn = fn
    return _wrap(out, kind, node)


def add(input, other, *, alpha=1):
    if alpha != 1:
        other = mul(other, alpha)
    return _arith(input, other, np.add, 'AddBackward0', lambda g, a, b, o, na, nb: (g, g), saves=False)


def sub(input, other, *, alpha=1):
    if alpha != 1:
        other = mul(other, alpha)
    first = isinstance(input, Tensor) and input._dtype is _dtype.bool_
    second = isinstance(other, Tensor) and other._dtype is _dtype.bool_
    if first and second:
        raise NotImplementedError(
            'Subtraction, the `-` operator, with two bool tensors is not supported. Use the `^` or `logical_xor()` '
            'operator instead.'
        )
    if first or second:
        raise NotImplementedError(
            'Subtraction, the `-` operator, with a bool tensor is not supported. If you are trying to invert a mask, '
            'use the `~` or `logical_not()` operator instead.'
        )
    name = 'SubBackward0' if isinstance(input, Tensor) else 'RsubBackward1'
    return _arith(input, other, np.subtract, name, lambda g, a, b, o, na, nb: (g, -g if nb else None), saves=False)


def rsub(input, other, *, alpha=1):
    return sub(other, input, alpha=alpha)


def mul(input, other):
    return _arith(
        input, other, np.multiply, 'MulBackward0',
        lambda g, a, b, o, na, nb: (g * b if na else None, g * a if nb else None),
    )


def _divide_backward(g, a, b, out, need_a, need_b):
    with np.errstate(all='ignore'):
        return (g / b if need_a else None, -g * a / (b * b) if need_b else None)


def div(input, other, *, rounding_mode=None):
    if rounding_mode is None:
        kind = _float_kind(result_type(input, other))
        return _arith(input, other, np.true_divide, 'DivBackward0', _divide_backward, kind, quiet=True)
    if rounding_mode not in ('trunc', 'floor'):
        raise RuntimeError(f"div expected rounding_mode to be one of None, 'trunc', or 'floor' but found '{rounding_mode}'")
    kind = result_type(input, other)

    def divide(a, b):
        with np.errstate(all='ignore'):
            if kind.is_floating_point:
                quotient = np.true_divide(a, b)
                return np.floor(quotient) if rounding_mode == 'floor' else np.trunc(quotient)
            if kind is _dtype.bool_:
                raise NotImplementedError('"div_floor_cpu" not implemented for \'Bool\'')
            if not np.all(b != 0):
                raise RuntimeError('ZeroDivisionError')
            return np.floor_divide(a, b) if rounding_mode == 'floor' else np.trunc(np.true_divide(a, b)).astype(a.dtype)

    name = 'DivBackward1'
    return _arith(input, other, divide, name, lambda g, a, b, o, na, nb: (np.zeros_like(g) if na else None, np.zeros_like(g) if nb else None))


true_divide = div


def _no_zero_divisors(kind, divisor):
    if not kind.is_floating_point and np.any(np.asarray(divisor) == 0):
        raise RuntimeError('ZeroDivisionError')


def floor_divide(input, other):
    return div(input, other, rounding_mode='floor')


def remainder(input, other):
    kind = result_type(input, other)
    if kind is _dtype.bool_:
        raise NotImplementedError('"remainder_cpu" not implemented for \'Bool\'')

    def modulo(a, b):
        _no_zero_divisors(kind, b)
        with np.errstate(all='ignore'):
            return np.remainder(a, b)

    return _arith(input, other, modulo, 'RemainderBackward0', lambda g, a, b, o, na, nb: (g if na else None, None))


def fmod(input, other):
    kind = result_type(input, other)

    def modulo(a, b):
        _no_zero_divisors(kind, b)
        with np.errstate(all='ignore'):
            return np.fmod(a, b)

    return _arith(input, other, modulo, 'FmodBackward0', lambda g, a, b, o, na, nb: (g if na else None, None))


def pow(input, exponent):
    if isinstance(input, (bool, int, float, np.generic)) and not isinstance(input, Tensor):
        # 2 ** x
        base, power = _operand(input), _operand(exponent)
        if not isinstance(power, Tensor):
            raise TypeError('pow(): expected at least one tensor')
        kind = result_type(base, power)

        def work(a, b):
            with np.errstate(all='ignore'):
                return np.power(a, b)

        def back(g, a, b, out, na, nb):
            with np.errstate(all='ignore'):
                return (None, g * out * math.log(a) if a > 0 else (np.where(b >= 0, 0.0, np.nan) * g))

        return _arith(base, power, work, 'PowBackward2', back, kind)
    a, b = _operand(input), _operand(exponent)
    kind = result_type(a, b)
    if not kind.is_floating_point and kind is not _dtype.bool_:
        exponent_data = b._data if isinstance(b, Tensor) else np.asarray(b)
        if np.any(exponent_data < 0) and (isinstance(a, Tensor) and not a._dtype.is_floating_point):
            raise RuntimeError('Integers to negative integer powers are not allowed.')

    def work(x, y):
        with np.errstate(all='ignore'):
            return np.power(x, y)

    if isinstance(b, Tensor):

        def back(g, x, y, out, na, nb):
            with np.errstate(all='ignore'):
                ga = g * y * np.power(x, y - 1) if na else None
                if ga is not None:
                    ga = np.where(y == 0, 0.0, ga).astype(out.dtype)
                gb = None
                if nb:
                    gb = g * out * np.log(x)
                    gb = np.where((x == 0) & (y >= 0), 0.0, gb).astype(out.dtype)
                return ga, gb

        return _arith(a, b, work, 'PowBackward1', back, kind)

    def back_scalar(g, x, y, out, na, nb):
        if y == 0:
            return np.zeros_like(g), None
        with np.errstate(all='ignore'):
            return g * y * np.power(x, y - 1), None

    return _arith(a, b, work, 'PowBackward0', back_scalar, kind)


def _compare(np_op):
    def compare(input, other):
        a, b = _operand(input), _operand(other)
        kind = result_type(a, b)
        ad = a._data if isinstance(a, Tensor) else a
        bd = b._data if isinstance(b, Tensor) else b
        if isinstance(a, Tensor) and ad.dtype != kind.numpy:
            ad = ad.astype(kind.numpy)
        if isinstance(b, Tensor) and bd.dtype != kind.numpy:
            bd = bd.astype(kind.numpy)
        try:
            out = _arr(np_op(ad, bd))
        except ValueError:
            raise _broadcast_error(getattr(ad, 'shape', ()), getattr(bd, 'shape', ())) from None
        return _wrap(out, _dtype.bool_)

    return compare


eq = _compare(np.equal)
ne = _compare(np.not_equal)
lt = _compare(np.less)
le = _compare(np.less_equal)
gt = _compare(np.greater)
ge = _compare(np.greater_equal)


def _logical(np_op):
    def logical(input, other):
        a, b = _operand(input), _operand(other)
        ad = a._data if isinstance(a, Tensor) else np.asarray(a)
        bd = b._data if isinstance(b, Tensor) else np.asarray(b)
        return _wrap(_arr(np_op(ad.astype(bool), bd.astype(bool))), _dtype.bool_)

    return logical


logical_and = _logical(np.logical_and)
logical_or = _logical(np.logical_or)
logical_xor = _logical(np.logical_xor)


def logical_not(input):
    return _wrap(_arr(np.logical_not(input._data)), _dtype.bool_)


def _bitwise(np_op, symbol):
    def bitwise(input, other):
        a, b = _operand(input), _operand(other)
        kind = result_type(a, b)
        if kind.is_floating_point:
            raise NotImplementedError(f"\"bitwise_{symbol}_cpu\" not implemented for '{_KIND_TITLES[kind.name]}'")
        ad = a._data if isinstance(a, Tensor) else np.asarray(a)
        bd = b._data if isinstance(b, Tensor) else np.asarray(b)
        return _wrap(_arr(np_op(ad.astype(kind.numpy), bd.astype(kind.numpy))), kind)

    return bitwise


_KIND_TITLES = {
    'float32': 'Float',
    'float64': 'Double',
    'float16': 'Half',
    'int64': 'Long',
    'int32': 'Int',
    'int16': 'Short',
    'int8': 'Char',
    'uint8': 'Byte',
    'bool': 'Bool',
}

bitwise_and = _bitwise(np.bitwise_and, 'and')
bitwise_or = _bitwise(np.bitwise_or, 'or')
bitwise_xor = _bitwise(np.bitwise_xor, 'xor')


def bitwise_not(input):
    if input._dtype.is_floating_point:
        raise TypeError('~ (operator.invert) is only implemented on integer and Boolean-type tensors')
    return _wrap(_arr(np.invert(input._data)), input._dtype)


def _both_tensors(name, input, other):
    for position, value in ((1, input), (2, other)):
        if not isinstance(value, Tensor):
            label = 'input' if position == 1 else 'other'
            raise TypeError(f"{name}(): argument '{label}' (position {position}) must be Tensor, not {type(value).__name__}")


def maximum(input, other):
    _both_tensors('maximum', input, other)
    return _arith(
        input, other, np.maximum, 'MaximumBackward0',
        lambda g, a, b, o, na, nb: (
            g * ((a > b) + 0.5 * (a == b)) if na else None,
            g * ((b > a) + 0.5 * (a == b)) if nb else None,
        ),
    )


def minimum(input, other):
    _both_tensors('minimum', input, other)
    return _arith(
        input, other, np.minimum, 'MinimumBackward0',
        lambda g, a, b, o, na, nb: (
            g * ((a < b) + 0.5 * (a == b)) if na else None,
            g * ((b < a) + 0.5 * (a == b)) if nb else None,
        ),
    )


# ---------- Functions of one tensor ----------


def _unary(name, np_fn, backward, floats=True, saves_output=False, saves=True):
    """
    An operation on each number of a tensor. `backward(g, x, out)` gives the gradient; integers
    are turned into floats first when `floats`, as PyTorch does for exp(), log() and the like.
    """

    def op(input):
        if not isinstance(input, Tensor):
            raise TypeError(f'{name_of(op)}(): argument \'input\' (position 1) must be Tensor, not {type(input).__name__}')
        if input._dtype is _dtype.bool_ and name in _BOOL_ERRORS:
            raise NotImplementedError(_BOOL_ERRORS[name])
        kind = _float_kind(input._dtype) if floats else input._dtype
        x = input._data if input._dtype is kind else input._data.astype(kind.numpy)
        with np.errstate(all='ignore'):
            out = _arr(np_fn(x))
        if out.dtype != kind.numpy:
            out = out.astype(kind.numpy)
        result = _wrap(out, kind)
        node = track(name, [input], None, saves, ([result] if saves_output else [input]) if saves else ())
        if node is not None:
            node.fn = lambda g: (_grad_for(backward(g, x, out), input),)
            result._grad_fn = node
            result._requires_grad = True
            if saves_output:
                _autograd.made_by(node, result)
        return result

    return op


_BOOL_ERRORS = {
    'FloorBackward0': '"floor_vml_cpu" not implemented for \'Bool\'',
    'CeilBackward0': '"ceil_vml_cpu" not implemented for \'Bool\'',
    'TruncBackward0': '"trunc_vml_cpu" not implemented for \'Bool\'',
    'NegBackward0': 'Negation, the `-` operator, on a bool tensor is not supported. If you are trying to invert a mask, '
                    'use the `~` or `logical_not()` operator instead.',
    'AbsBackward0': '"abs_cpu" not implemented for \'Bool\'',
}


def name_of(function):
    return getattr(function, '__name__', 'function')


neg = _unary('NegBackward0', np.negative, lambda g, x, o: -g, floats=False, saves=False)
exp = _unary('ExpBackward0', np.exp, lambda g, x, o: g * o, saves_output=True)
log = _unary('LogBackward0', np.log, lambda g, x, o: g / x)
log1p = _unary('Log1PBackward0', np.log1p, lambda g, x, o: g / (x + 1))
log2 = _unary('Log2Backward0', np.log2, lambda g, x, o: g / (x * math.log(2)))
log10 = _unary('Log10Backward0', np.log10, lambda g, x, o: g / (x * math.log(10)))
expm1 = _unary('Expm1Backward0', np.expm1, lambda g, x, o: g * (o + 1), saves_output=True)
sqrt = _unary('SqrtBackward0', np.sqrt, lambda g, x, o: g / (2 * o), saves_output=True)
rsqrt = _unary('RsqrtBackward0', lambda x: 1 / np.sqrt(x), lambda g, x, o: -0.5 * g * o * o * o, saves_output=True)
sin = _unary('SinBackward0', np.sin, lambda g, x, o: g * np.cos(x))
cos = _unary('CosBackward0', np.cos, lambda g, x, o: -g * np.sin(x))
tan = _unary('TanBackward0', np.tan, lambda g, x, o: g * (1 + o * o), saves_output=True)
tanh = _unary('TanhBackward0', np.tanh, lambda g, x, o: g * (1 - o * o), saves_output=True)
sigmoid = _unary('SigmoidBackward0', lambda x: 1 / (1 + np.exp(-x)), lambda g, x, o: g * o * (1 - o), saves_output=True)
reciprocal = _unary('ReciprocalBackward0', lambda x: 1 / x, lambda g, x, o: -g * o * o, saves_output=True)
abs = _unary('AbsBackward0', np.abs, lambda g, x, o: g * np.sign(x), floats=False)
sign = _unary('SignBackward0', np.sign, lambda g, x, o: np.zeros_like(g), floats=False, saves=False)
floor = _unary('FloorBackward0', np.floor, lambda g, x, o: np.zeros_like(g), floats=False, saves=False)
ceil = _unary('CeilBackward0', np.ceil, lambda g, x, o: np.zeros_like(g), floats=False, saves=False)
trunc = _unary('TruncBackward0', np.trunc, lambda g, x, o: np.zeros_like(g), floats=False, saves=False)
square = lambda input: pow(input, 2)  # noqa: E731
absolute = abs


def relu(input):
    if input._dtype is _dtype.bool_:
        raise NotImplementedError('Boolean inputs not supported for relu')
    out = np.maximum(input._data, 0) if input._data.dtype != np.bool_ else input._data.copy()
    out = _arr(out)
    result = _wrap(out, input._dtype)
    node = track('ReluBackward0', [input], None, True, [result])
    if node is not None:
        node.fn = lambda g: (g * (out > 0),)
        result._grad_fn = node
        result._requires_grad = True
        _autograd.made_by(node, result)
    return result


def round(input, *, decimals=0):
    if input._dtype is _dtype.bool_:
        raise NotImplementedError('"round_vml_cpu" not implemented for \'Bool\'')
    if decimals == 0:
        out = np.round(input._data)
    else:
        out = np.round(input._data.astype(np.float64) * 10.0**decimals) / 10.0**decimals
    result = _wrap(_arr(out).astype(input._data.dtype), input._dtype)
    node = track('RoundBackward0', [input], None, False)
    if node is not None:
        node.fn = lambda g: (np.zeros_like(g),)
        result._grad_fn = node
        result._requires_grad = True
    return result


def clamp(input, min=None, max=None):
    if min is None and max is None:
        raise RuntimeError("torch.clamp: At least one of 'min' or 'max' must not be None")
    low, high = (min._data if isinstance(min, Tensor) else min), (max._data if isinstance(max, Tensor) else max)
    kind = result_type(input, *[v for v in (min, max) if v is not None])
    x = input._data if input._dtype is kind else input._data.astype(kind.numpy)
    out = _arr(np.clip(x, low, high)).astype(kind.numpy, copy=False)
    result = _wrap(out, kind)
    node = track('ClampBackward1', [input], None, True, [input])
    if node is not None:

        def fn(g):
            keep = np.ones(x.shape, dtype=bool)
            if low is not None:
                keep &= x >= low
            if high is not None:
                keep &= x <= high
            return (g * keep,)

        node.fn = fn
        result._grad_fn = node
        result._requires_grad = True
    return result


clip = clamp


def isnan(input):
    return _wrap(_arr(np.isnan(input._data)), _dtype.bool_)


def isinf(input):
    return _wrap(_arr(np.isinf(input._data)), _dtype.bool_)


def isfinite(input):
    return _wrap(_arr(np.isfinite(input._data)), _dtype.bool_)


def nan_to_num(input, nan=0.0, posinf=None, neginf=None):
    info = np.finfo(input._data.dtype)
    out = np.nan_to_num(input._data, nan=nan, posinf=info.max if posinf is None else posinf,
                        neginf=info.min if neginf is None else neginf)
    return _wrap(_arr(out), input._dtype)


def where(condition, input=None, other=None):
    if input is None and other is None:
        if not isinstance(condition, Tensor):
            raise TypeError(f"where(): argument 'condition' (position 1) must be Tensor, not {type(condition).__name__}")
        return nonzero(condition, as_tuple=True)
    if not isinstance(condition, Tensor) or not all(isinstance(v, (Tensor, bool, int, float)) for v in (input, other)):
        raise TypeError(_where_signature_error(condition, input, other))
    a, b = _operand(input), _operand(other)
    kind = result_type(a, b)
    ad = a._data if isinstance(a, Tensor) else a
    bd = b._data if isinstance(b, Tensor) else b
    cond = condition._data.astype(bool)
    out = _arr(np.where(cond, ad, bd)).astype(kind.numpy, copy=False)
    inputs = _tensors(a, b)
    node = track('WhereBackward0', inputs, None, False) if inputs else None
    if node is not None:

        def fn(g):
            grads = []
            if isinstance(a, Tensor):
                grads.append(_grad_for(np.where(cond, g, 0), a) if a._requires_grad else None)
            if isinstance(b, Tensor):
                grads.append(_grad_for(np.where(cond, 0, g), b) if b._requires_grad else None)
            return grads

        node.fn = fn
    return _wrap(out, kind, node)


def _where_signature_error(condition, input, other):
    names = [type(v).__name__ if not isinstance(v, Tensor) else 'Tensor' for v in (condition, input, other)]
    kinds = ['Tensor' if isinstance(v, Tensor) else 'Number' if isinstance(v, (bool, int, float)) else 'other' for v in (condition, input, other)]
    lines = [
        f"where() received an invalid combination of arguments - got ({', '.join(names)}), but expected one of:",
        ' * (Tensor condition)',
        ' * (Tensor condition, Tensor input, Tensor other, *, Tensor out = None)',
    ]
    for second, third, label in (('Tensor', 'Tensor', None), ('Number', 'Tensor', 'Number self'), ('Tensor', 'Number', 'Tensor input'), ('Number', 'Number', 'Number self')):
        if label is None:
            continue
        signature = {
            ('Number', 'Tensor'): ' * (Tensor condition, Number self, Tensor other)',
            ('Tensor', 'Number'): ' * (Tensor condition, Tensor input, Number other)',
            ('Number', 'Number'): ' * (Tensor condition, Number self, Number other)',
        }[(second, third)]
        wanted = ['Tensor', second, third]
        marked = ', '.join(f'!{n}!' if k != w else n for n, k, w in zip(names, kinds, wanted))
        lines.append(signature)
        lines.append(f"      didn't match because some of the arguments have invalid types: ({marked})")
    return '\n'.join(lines) + '\n'


def nonzero(input, *, as_tuple=False):
    found = np.nonzero(input._data)
    if as_tuple:
        return tuple(_wrap(i.astype(np.int64), _dtype.int64) for i in found)
    return _wrap(np.stack(found, axis=1).astype(np.int64), _dtype.int64)


def masked_fill(input, mask, value):
    value_t = _operand(value)
    kind = input._dtype
    v = value_t._data if isinstance(value_t, Tensor) else value_t
    out = _arr(np.where(mask._data, np.asarray(v).astype(kind.numpy), input._data))
    node = track('MaskedFillBackward0', [input], None, False)
    if node is not None:
        node.fn = lambda g: (np.where(mask._data, 0, g).astype(g.dtype),)
    return _wrap(out, kind, node)


# ---------- Reductions ----------


def _axes(input, dim):
    """The dimensions a reduction runs over, as positions, or None for all of them."""
    if dim is None:
        return None
    if isinstance(dim, (list, tuple)):
        return tuple(input._axis(d) for d in dim) if len(dim) else None
    return input._axis(dim)


def _expand_reduced(g, shape, axes, keepdim):
    """A gradient of a reduction, spread back out over the dimensions that were reduced."""
    if axes is None:
        return np.broadcast_to(g, shape)
    if not keepdim:
        g = np.expand_dims(g, axes if isinstance(axes, tuple) else (axes,))
    return np.broadcast_to(g, shape)


def sum(input, dim=None, keepdim=False, *, dtype=None):
    axes = _axes(input, dim)
    kind = dtype or (input._dtype if input._dtype.is_floating_point else _dtype.int64)
    out = _arr(np.sum(input._data, axis=axes, keepdims=keepdim, dtype=kind.numpy))
    shape = input._data.shape
    node = track('SumBackward0' if dim is None else 'SumBackward1', [input], None, False)
    if node is not None:
        node.fn = lambda g: (_expand_reduced(g, shape, axes, keepdim).astype(input._dtype.numpy),)
    return _wrap(out, kind, node)


def mean(input, dim=None, keepdim=False, *, dtype=None):
    kind = dtype or input._dtype
    if not kind.is_floating_point:
        raise RuntimeError(
            'mean(): could not infer output dtype. Input dtype must be either a floating point or complex dtype. '
            f'Got: {_KIND_TITLES[input._dtype.name]}'
        )
    axes = _axes(input, dim)
    data = input._data if input._dtype is kind else input._data.astype(kind.numpy)
    with np.errstate(all='ignore'), warnings.catch_warnings():
        warnings.simplefilter('ignore')
        out = _arr(np.mean(data, axis=axes, keepdims=keepdim))
    if out.dtype != kind.numpy:
        out = out.astype(kind.numpy)
    shape = input._data.shape
    count = input._data.size // _max(out.size, 1) if input._data.size else 0
    node = track('MeanBackward0' if dim is None else 'MeanBackward1', [input], None, False)
    if node is not None:
        node.fn = lambda g: ((_expand_reduced(g, shape, axes, keepdim) / count).astype(input._dtype.numpy),)
    return _wrap(out, kind, node)


def _variance(input, dim, correction, keepdim, root, name):
    if not input._dtype.is_floating_point:
        raise RuntimeError('std and var only support floating point and complex dtypes')
    axes = _axes(input, dim)
    data = input._data
    reduced = data.size // _max(int(np.prod([data.shape[a] for a in (range(data.ndim) if axes is None else (axes if isinstance(axes, tuple) else (axes,)))])), 1) if data.size else 0
    elements = data.size // reduced if reduced else 0
    if data.size and elements - correction <= 0:
        warnings.warn(
            f"{'std' if root else 'var'}(): degrees of freedom is <= 0. Correction should be strictly less than the "
            'reduction factor (input numel divided by output numel).',
            UserWarning,
            stacklevel=4,
        )
    with np.errstate(all='ignore'), warnings.catch_warnings():
        warnings.simplefilter('ignore')
        out = _arr(np.var(data, axis=axes, ddof=correction, keepdims=keepdim))
        if root:
            out = _arr(np.sqrt(out))
    out = out.astype(data.dtype, copy=False)
    shape = data.shape
    count = data.size // _max(out.size, 1)
    node = track(name, [input], None, True, [input])
    if node is not None:

        def fn(g):
            with np.errstate(all='ignore'):
                centered = data - np.mean(data, axis=axes, keepdims=True)
                scale = 2.0 / (count - correction)
                if root:
                    # Where the standard deviation is 0 the gradient is 0, not 0 / 0.
                    spread = _expand_reduced(out, shape, axes, keepdim)
                    g = _expand_reduced(g, shape, axes, keepdim) / np.where(spread == 0, np.inf, 2 * spread)
                    return ((g * scale * centered).astype(data.dtype),)
                return ((_expand_reduced(g, shape, axes, keepdim) * scale * centered).astype(data.dtype),)

        node.fn = fn
    return _wrap(out, input._dtype, node)


def _correction(unbiased, correction):
    if correction is not None:
        return correction
    return 1 if unbiased is None or unbiased else 0


def var(input, dim=None, unbiased=None, keepdim=False, *, correction=None):
    if isinstance(dim, bool):
        unbiased, dim = dim, None
    return _variance(input, dim, _correction(unbiased, correction), keepdim, False, 'VarBackward0')


def std(input, dim=None, unbiased=None, keepdim=False, *, correction=None):
    if isinstance(dim, bool):
        unbiased, dim = dim, None
    return _variance(input, dim, _correction(unbiased, correction), keepdim, True, 'StdBackward0')


class _ReturnType(tuple):
    """What max(dim), min(dim), topk and sort give: a tuple whose items also have names."""

    _name = ''
    _fields = ()

    def __new__(cls, *values):
        return super().__new__(cls, values)

    def __getattr__(self, name):
        try:
            return self[self._fields.index(name)]
        except ValueError:
            raise AttributeError(name) from None

    def __repr__(self):
        body = ',\n'.join(f'{field}={value!r}' for field, value in zip(self._fields, self))
        return f'torch.return_types.{self._name}(\n{body})'


def _return_type(name, *fields):
    return type(name, (_ReturnType,), {'_name': name, '_fields': fields})


_MaxResult = _return_type('max', 'values', 'indices')
_MinResult = _return_type('min', 'values', 'indices')
_TopkResult = _return_type('topk', 'values', 'indices')
_SortResult = _return_type('sort', 'values', 'indices')


def _extreme(input, dim, keepdim, other, high):
    name = 'max' if high else 'min'
    np_all, np_arg, np_pick = (np.max, np.argmax, np.maximum) if high else (np.min, np.argmin, np.minimum)
    if isinstance(dim, Tensor):
        return (maximum if high else minimum)(input, dim)
    if dim is None:
        if input._data.size == 0:
            raise RuntimeError(f'{name}(): Expected reduction dim to be specified for input.numel() == 0. Specify the reduction dim with the \'dim\' argument.')
        data = input._data
        out = _arr(np_all(data))
        node = track('MaxBackward1' if high else 'MinBackward1', [input], None, True, [input])
        if node is not None:

            def fn(g):
                ties = data == out
                return ((ties * (g / ties.sum())).astype(data.dtype),)

            node.fn = fn
        return _wrap(out, input._dtype, node)
    axis = input._axis(dim)
    data = input._data
    if data.ndim == 0:
        values, indices = data, np.zeros((), dtype=np.int64)
    else:
        if data.shape[axis] == 0:
            raise IndexError(f'{name}(): Expected reduction dim {axis} to have non-zero size.')
        indices = np_arg(data, axis=axis, keepdims=True)
        values = np.take_along_axis(data, indices, axis=axis)
        if not keepdim:
            values, indices = np.squeeze(values, axis=axis), np.squeeze(indices, axis=axis)
    shape = data.shape
    node = track('MaxBackward0' if high else 'MinBackward0', [input], None, True)
    if node is not None:
        picked = indices

        def fn(g):
            full = np.zeros(shape, dtype=data.dtype)
            if data.ndim == 0:
                return (g.astype(data.dtype),)
            idx = picked if keepdim else np.expand_dims(picked, axis)
            grad = g if keepdim else np.expand_dims(g, axis)
            np.put_along_axis(full, idx, grad, axis=axis)
            return (full,)

        node.fn = fn
    result = (_MaxResult if high else _MinResult)(_wrap(_arr(values).copy(), input._dtype, node), _wrap(_arr(indices).astype(np.int64), _dtype.int64))
    return result


def max(input, dim=None, keepdim=False, *, other=None):
    if isinstance(dim, Tensor):
        return maximum(input, dim)
    return _extreme(input, dim, keepdim, other, True)


def min(input, dim=None, keepdim=False, *, other=None):
    if isinstance(dim, Tensor):
        return minimum(input, dim)
    return _extreme(input, dim, keepdim, other, False)


def amax(input, dim=(), keepdim=False):
    axes = _axes(input, dim)
    data = input._data
    out = _arr(np.max(data, axis=axes, keepdims=keepdim))
    node = track('AmaxBackward0', [input], None, True, [input])
    if node is not None:

        def fn(g):
            ties = data == _expand_reduced(out, data.shape, axes, keepdim)
            share = ties.sum(axis=axes, keepdims=True)
            return ((ties * _expand_reduced(g, data.shape, axes, keepdim) / share).astype(data.dtype),)

        node.fn = fn
    return _wrap(out, input._dtype, node)


def amin(input, dim=(), keepdim=False):
    axes = _axes(input, dim)
    data = input._data
    out = _arr(np.min(data, axis=axes, keepdims=keepdim))
    node = track('AminBackward0', [input], None, True, [input])
    if node is not None:

        def fn(g):
            ties = data == _expand_reduced(out, data.shape, axes, keepdim)
            share = ties.sum(axis=axes, keepdims=True)
            return ((ties * _expand_reduced(g, data.shape, axes, keepdim) / share).astype(data.dtype),)

        node.fn = fn
    return _wrap(out, input._dtype, node)


def argmax(input, dim=None, keepdim=False):
    if input._dtype is _dtype.bool_:
        raise RuntimeError('argmax(): does not support bool input')
    if dim is None:
        return _wrap(_arr(np.argmax(input._data)).astype(np.int64), _dtype.int64)
    axis = input._axis(dim)
    return _wrap(_arr(np.argmax(input._data, axis=axis, keepdims=keepdim)).astype(np.int64), _dtype.int64)


def argmin(input, dim=None, keepdim=False):
    if input._dtype is _dtype.bool_:
        raise RuntimeError('argmin(): does not support bool input')
    if dim is None:
        return _wrap(_arr(np.argmin(input._data)).astype(np.int64), _dtype.int64)
    axis = input._axis(dim)
    return _wrap(_arr(np.argmin(input._data, axis=axis, keepdims=keepdim)).astype(np.int64), _dtype.int64)


def all_(input, dim=None, keepdim=False):
    axes = _axes(input, dim)
    return _wrap(_arr(np.all(input._data, axis=axes, keepdims=keepdim)), _dtype.bool_)


def any_(input, dim=None, keepdim=False):
    axes = _axes(input, dim)
    return _wrap(_arr(np.any(input._data, axis=axes, keepdims=keepdim)), _dtype.bool_)


def prod(input, dim=None, keepdim=False, *, dtype=None):
    axes = _axes(input, dim)
    kind = dtype or (input._dtype if input._dtype.is_floating_point else _dtype.int64)
    out = _arr(np.prod(input._data, axis=axes, keepdims=keepdim, dtype=kind.numpy))
    data = input._data
    node = track('ProdBackward0' if dim is None else 'ProdBackward1', [input], None, True, [input])
    if node is not None:

        def fn(g):
            # The gradient for each number is the product of all the others, which also works when some are 0.
            if axes is None:
                grad = _others_product(data.reshape(-1), 0).reshape(data.shape) * g
            else:
                moved = np.moveaxis(data, axes, -1)
                spread = np.moveaxis(_expand_reduced(g, data.shape, axes, keepdim), axes, -1)
                grad = np.moveaxis(_others_product(moved, -1) * spread, -1, axes)
            return (grad.astype(data.dtype),)

        node.fn = fn
    return _wrap(out, kind, node)


def _others_product(values, axis):
    """For each number along the axis, the product of all the other numbers along it."""
    ones = np.ones_like(np.take(values, [0], axis=axis))
    before = np.concatenate([ones, np.cumprod(values, axis=axis)], axis=axis)
    before = np.take(before, np.arange(values.shape[axis]), axis=axis)
    flipped = np.flip(values, axis=axis)
    after = np.concatenate([ones, np.cumprod(flipped, axis=axis)], axis=axis)
    after = np.flip(np.take(after, np.arange(values.shape[axis]), axis=axis), axis=axis)
    return before * after


def cumsum(input, dim, *, dtype=None):
    axis = input._axis(dim)
    kind = dtype or (input._dtype if input._dtype.is_floating_point else _dtype.int64)
    out = _arr(np.cumsum(input._data, axis=axis, dtype=kind.numpy))
    node = track('CumsumBackward0', [input], None, False)
    if node is not None:
        node.fn = lambda g: (np.flip(np.cumsum(np.flip(g, axis), axis=axis), axis).astype(input._data.dtype),)
    return _wrap(out, kind, node)


def logsumexp(input, dim, keepdim=False):
    axes = _axes(input, dim)
    kind = _float_kind(input._dtype)
    data = input._data.astype(kind.numpy, copy=False)
    with np.errstate(all='ignore'):
        top = np.max(data, axis=axes, keepdims=True)
        top = np.where(np.isfinite(top), top, 0)
        out = np.log(np.sum(np.exp(data - top), axis=axes, keepdims=True)) + top
    if not keepdim:
        out = np.squeeze(out, axis=axes) if axes is not None else out.reshape(())
    out = _arr(out).astype(kind.numpy, copy=False)
    node = track('LogsumexpBackward0', [input], None, True, [input])
    if node is not None:

        def fn(g):
            shown = out if keepdim else np.expand_dims(out, axes if isinstance(axes, tuple) else (axes,))
            return ((_expand_reduced(g, data.shape, axes, keepdim) * np.exp(data - shown)).astype(data.dtype),)

        node.fn = fn
    return _wrap(out, kind, node)


def norm(input, p='fro', dim=None, keepdim=False, dtype=None):
    """The length of a tensor, or of its rows or columns: p=2 is the usual one, p=1 adds up the sizes."""
    if not input._dtype.is_floating_point:
        raise RuntimeError(f"linalg.vector_norm: Expected a floating point or complex tensor as input. Got {_KIND_TITLES[input._dtype.name]}")
    order = 2.0 if p == 'fro' else float(p)
    axes = _axes(input, dim)
    data = input._data
    with np.errstate(all='ignore'):
        magnitude = np.abs(data)
        if order == 2.0:
            out = np.sqrt(np.sum(magnitude * magnitude, axis=axes, keepdims=keepdim))
        elif order == 1.0:
            out = np.sum(magnitude, axis=axes, keepdims=keepdim)
        elif order == math.inf:
            out = np.max(magnitude, axis=axes, keepdims=keepdim)
        elif order == 0.0:
            out = np.sum(magnitude != 0, axis=axes, keepdims=keepdim).astype(data.dtype)
        else:
            out = np.sum(magnitude**order, axis=axes, keepdims=keepdim) ** (1.0 / order)
    out = _arr(out).astype(data.dtype, copy=False)
    node = track('LinalgVectorNormBackward0', [input], None, True, [input])
    if node is not None:

        def fn(g):
            with np.errstate(all='ignore'):
                full = _expand_reduced(g, data.shape, axes, keepdim)
                shown = _expand_reduced(out, data.shape, axes, keepdim)
                if order == 2.0:
                    result = np.where(shown == 0, 0, full * data / shown)
                elif order == 1.0:
                    result = full * np.sign(data)
                elif order == math.inf:
                    ties = magnitude == shown
                    result = full * np.sign(data) * ties / ties.sum(axis=axes, keepdims=True)
                elif order == 0.0:
                    result = np.zeros_like(data)
                else:
                    result = full * np.sign(data) * magnitude ** (order - 1) / np.where(shown == 0, 1, shown ** (order - 1))
            return (result.astype(data.dtype),)

        node.fn = fn
    return _wrap(out, input._dtype, node)


def _no_integers(input, dtype, axis, name):
    if dtype is None and not input._dtype.is_floating_point:
        last = axis == input._data.ndim - 1 or input._data.ndim == 0
        kernel = f'{name}_lastdim_kernel_impl' if last else 'host_softmax'
        raise NotImplementedError(f'"{kernel}" not implemented for \'{_KIND_TITLES[input._dtype.name]}\'')


def softmax(input, dim=None, dtype=None, _stacklevel=3):
    if dim is None:
        dim = 0 if input._data.ndim in (0, 1, 3) else 1
    axis = input._axis(dim)
    _no_integers(input, dtype, axis, 'softmax')
    kind = dtype or _float_kind(input._dtype)
    data = input._data.astype(kind.numpy, copy=False)
    work = data.astype(np.float32) if kind is _dtype.float16 else data
    with np.errstate(all='ignore'):
        shifted = np.exp(work - np.max(work, axis=axis, keepdims=True))
        out = _arr(shifted / np.sum(shifted, axis=axis, keepdims=True)).astype(kind.numpy, copy=False)
    result = _wrap(out, kind)
    node = track('SoftmaxBackward0', [input], None, True, [result])
    if node is not None:

        def fn(g):
            return ((out * (g - np.sum(g * out, axis=axis, keepdims=True))).astype(input._data.dtype),)

        node.fn = fn
        result._grad_fn = node
        result._requires_grad = True
        _autograd.made_by(node, result)
    return result


def log_softmax(input, dim=None, dtype=None, _stacklevel=3):
    if dim is None:
        dim = 0 if input._data.ndim in (0, 1, 3) else 1
    axis = input._axis(dim)
    _no_integers(input, dtype, axis, 'log_softmax')
    kind = dtype or _float_kind(input._dtype)
    data = input._data.astype(kind.numpy, copy=False)
    with np.errstate(all='ignore'):
        shifted = data - np.max(data, axis=axis, keepdims=True)
        out = _arr(shifted - np.log(np.sum(np.exp(shifted), axis=axis, keepdims=True))).astype(kind.numpy, copy=False)
    result = _wrap(out, kind)
    node = track('LogSoftmaxBackward0', [input], None, True, [result])
    if node is not None:

        def fn(g):
            return ((g - np.exp(out) * np.sum(g, axis=axis, keepdims=True)).astype(input._data.dtype),)

        node.fn = fn
        result._grad_fn = node
        result._requires_grad = True
        _autograd.made_by(node, result)
    return result


# ---------- Matrix products ----------

_C10_NAMES = {
    'float32': 'float', 'float64': 'double', 'float16': 'c10::Half', 'int64': 'long', 'int32': 'int', 'int16': 'short',
    'int8': 'signed char', 'uint8': 'unsigned char', 'bool': 'bool',
}


def _check_same_kind(a, b, message):
    if a._dtype is not b._dtype:
        raise RuntimeError(message(a._dtype, b._dtype))


def matmul(input, other):
    a, b = input, other
    if not isinstance(b, Tensor):
        raise TypeError(f'matmul(): argument \'other\' (position 2) must be Tensor, not {type(b).__name__}')
    if a._data.ndim == 0 or b._data.ndim == 0:
        raise RuntimeError('both arguments to matmul need to be at least 1D, but they are '
                           f'{a._data.ndim}D and {b._data.ndim}D')
    ad, bd = a._data, b._data
    if ad.ndim == 1 and bd.ndim == 1:
        _check_same_kind(a, b, lambda x, y: f'dot : expected both vectors to have same dtype, but found {_KIND_TITLES[x.name]} and {_KIND_TITLES[y.name]}')
    if a._data.ndim == 1 and b._data.ndim == 1:
        if ad.shape[0] != bd.shape[0]:
            raise RuntimeError(
                f'inconsistent tensor size, expected tensor [{ad.shape[0]}] and src [{bd.shape[0]}] to have the same '
                f'number of elements, but got {ad.shape[0]} and {bd.shape[0]} elements respectively'
            )
        name = 'DotBackward0'
    elif ad.ndim == 2 and bd.ndim == 2:
        if ad.shape[1] != bd.shape[0]:
            raise RuntimeError(f'mat1 and mat2 shapes cannot be multiplied ({_shape_text(ad.shape)} and {_shape_text(bd.shape)})')
        name = 'MmBackward0'
    elif ad.ndim == 1 and bd.ndim == 2 or ad.ndim == 2 and bd.ndim == 1:
        left = (1,) + ad.shape if ad.ndim == 1 else ad.shape
        right = bd.shape + (1,) if bd.ndim == 1 else bd.shape
        if left[1] != right[0]:
            raise RuntimeError(f'size mismatch, got input ({ad.shape[0]}), mat ({_shape_text(ad.shape)}x{bd.shape[0] if bd.ndim == 1 else _shape_text(bd.shape)}), vec ({bd.shape[0]})'
                               if ad.ndim == 2 else
                               f'size mismatch, got input ({ad.shape[0]}), mat ({_shape_text(ad.shape)}), vec ({_shape_text(bd.shape)})')
        name = 'MvBackward0' if bd.ndim == 1 else 'SqueezeBackward4'
    else:
        left = ad.shape if ad.ndim > 1 else (1,) + ad.shape
        right = bd.shape if bd.ndim > 1 else bd.shape + (1,)
        if left[-1] != right[-2]:
            folded = (int(np.prod(left[:-1])), left[-1])
            raise RuntimeError(f'mat1 and mat2 shapes cannot be multiplied ({_shape_text(folded)} and {_shape_text(right[-2:])})')
        try:
            np.broadcast_shapes(left[:-2], right[:-2])
        except ValueError:
            raise _broadcast_error(left[:-2], right[:-2]) from None
        name = 'UnsafeViewBackward0'
    # Shapes are checked before types for everything but vectors.
    _check_same_kind(a, b, lambda x, y: f'expected m1 and m2 to have the same dtype, but got: {_C10_NAMES[x.name]} != {_C10_NAMES[y.name]}')
    out = _arr(np.matmul(ad, bd))
    node = track(name, [a, b], None, True, [a, b])
    if node is not None:
        need_a, need_b = a._requires_grad, b._requires_grad

        def fn(g):
            a2 = ad if ad.ndim > 1 else ad.reshape(1, -1)
            b2 = bd if bd.ndim > 1 else bd.reshape(-1, 1)
            if ad.ndim == 1 and bd.ndim == 1:
                g2 = g.reshape(1, 1)
            elif ad.ndim == 1:
                g2 = np.expand_dims(g, -2)
            elif bd.ndim == 1:
                g2 = np.expand_dims(g, -1)
            else:
                g2 = g
            ga = gb = None
            if need_a:
                ga = np.matmul(g2, np.swapaxes(b2, -1, -2))
                ga = _unbroadcast(ga, a2.shape).reshape(ad.shape)
            if need_b:
                gb = np.matmul(np.swapaxes(a2, -1, -2), g2)
                gb = _unbroadcast(gb, b2.shape).reshape(bd.shape)
            return [ga.astype(ad.dtype) if ga is not None else None, gb.astype(bd.dtype) if gb is not None else None]

        node.fn = fn
    return _wrap(out, a._dtype, node)


def mm(input, mat2):
    if input._data.ndim != 2:
        raise RuntimeError('self must be a matrix')
    if mat2._data.ndim != 2:
        raise RuntimeError('mat2 must be a matrix')
    return matmul(input, mat2)


def bmm(input, mat2):
    if input._data.ndim != 3 or mat2._data.ndim != 3:
        raise RuntimeError('batch1 must be a 3D tensor' if input._data.ndim != 3 else 'batch2 must be a 3D tensor')
    return matmul(input, mat2)


def mv(input, vec):
    return matmul(input, vec)


def dot(input, other):
    if input._data.ndim != 1 or other._data.ndim != 1:
        raise RuntimeError(f'1D tensors expected, but got {input._data.ndim}D and {other._data.ndim}D tensors')
    return matmul(input, other)


def outer(input, vec2):
    return mul(unsqueeze(input, 1), unsqueeze(vec2, 0))


def addmm(input, mat1, mat2, *, beta=1, alpha=1):
    """input + mat1 @ mat2, as one step: what a Linear layer works out for a batch."""
    _check_same_kind(mat1, mat2, lambda x, y: f'mat1 and mat2 must have the same dtype, but got {_KIND_TITLES[x.name]} and {_KIND_TITLES[y.name]}')
    if mat1._data.ndim != 2 or mat2._data.ndim != 2:
        raise RuntimeError('mat1 and mat2 must be matrices')
    if mat1._data.shape[1] != mat2._data.shape[0]:
        raise RuntimeError(
            f'mat1 and mat2 shapes cannot be multiplied ({_shape_text(mat1._data.shape)} and {_shape_text(mat2._data.shape)})'
        )
    if input._dtype is not mat1._dtype:
        raise RuntimeError(f'self and mat2 must have the same dtype, but got {_KIND_TITLES[input._dtype.name]} and {_KIND_TITLES[mat2._dtype.name]}')
    rows, cols = mat1._data.shape[0], mat2._data.shape[1]
    try:
        np.broadcast_shapes(input._data.shape, (rows, cols))
    except ValueError:
        raise RuntimeError(f'The expanded size of the tensor ({cols}) must match the existing size ({input._data.shape[-1] if input._data.ndim else 1}) at non-singleton dimension 1.  Target sizes: [{rows}, {cols}].  Tensor sizes: [{_shape_text(input._data.shape)}]'.replace('x', ', ')) from None
    out = np.matmul(mat1._data, mat2._data)
    if alpha != 1:
        out = out * alpha
    bias = input._data if beta == 1 else input._data * beta
    out = _arr(out + bias)
    node = track('AddmmBackward0', [input, mat1, mat2], None, True, [mat1, mat2])
    if node is not None:
        n_in, n_a, n_b = input._requires_grad, mat1._requires_grad, mat2._requires_grad
        ad, bd = mat1._data, mat2._data

        def fn(g):
            return [
                _grad_for(g * beta, input) if n_in else None,
                (np.matmul(g, bd.T) * alpha).astype(ad.dtype) if n_a else None,
                (np.matmul(ad.T, g) * alpha).astype(bd.dtype) if n_b else None,
            ]

        node.fn = fn
    return _wrap(out, mat1._dtype, node)


# ---------- Shapes ----------


def _shape_args(size):
    if len(size) == 1 and isinstance(size[0], (tuple, list, Size)):
        return tuple(size[0])
    return tuple(size)


def _infer_shape(total, shape):
    shape = [int(n) for n in shape]
    if shape.count(-1) > 1:
        raise RuntimeError('only one dimension can be inferred')
    known = 1
    for n in shape:
        if n != -1:
            known *= n
    if -1 in shape:
        if known == 0 or total % known:
            raise RuntimeError(f"shape '{[int(n) for n in shape]}' is invalid for input of size {total}")
        shape[shape.index(-1)] = total // known
    elif known != total:
        raise RuntimeError(f"shape '{[int(n) for n in shape]}' is invalid for input of size {total}")
    return tuple(shape)


def _view_of(input, data, name, backward, *, same_memory=True):
    """A tensor made from a changed view of the numbers of another, which shares them and the count of in-place changes."""
    result = Tensor._wrap(data, input._dtype, vc=input._vc if same_memory else None)
    result._base = input._base if input._base is not None else input
    node = track(name, [input], None, False)
    if node is not None:
        node.fn = lambda g: (backward(g),)
        result._grad_fn = node
        result._requires_grad = True
    return result


def reshape(input, *shape):
    shape = _infer_shape(input._data.size, _shape_args(shape))
    old = input._data.shape
    view = input._data.view()
    try:
        view.shape = shape
        copied = False
    except AttributeError:
        view = input._data.reshape(shape)
        copied = True
    # PyTorch names a reshape of a tensor that isn't laid out in order, which still can be a view, differently.
    name = 'UnsafeViewBackward0' if copied else 'ViewBackward0' if input._data.flags.c_contiguous else 'ReshapeAliasBackward0'
    return _view_of(input, view, name, lambda g: g.reshape(old), same_memory=not copied)


def view(input, *shape):
    if len(shape) == 1 and isinstance(shape[0], _dtype.dtype):
        return to(input, shape[0])
    shape = _infer_shape(input._data.size, _shape_args(shape))
    old = input._data.shape
    out = input._data.view()
    try:
        out.shape = shape
    except AttributeError:
        raise RuntimeError(
            'view size is not compatible with input tensor\'s size and stride (at least one dimension spans across two '
            'contiguous subspaces). Use .reshape(...) instead.'
        ) from None
    return _view_of(input, out, 'ViewBackward0', lambda g: g.reshape(old))


def flatten(input, start_dim=0, end_dim=-1):
    if input._data.ndim == 0:
        return reshape(input, 1)
    start, end = input._axis(start_dim), input._axis(end_dim)
    if start > end:
        raise RuntimeError('flatten() has invalid args: start_dim cannot come after end_dim')
    shape = input._data.shape
    merged = shape[:start] + (int(np.prod(shape[start : end + 1])),) + shape[end + 1 :]
    if merged == shape:
        return input
    return reshape(input, merged)


def squeeze(input, dim=None):
    old = input._data.shape
    if dim is None:
        axes = tuple(i for i, n in enumerate(old) if n == 1)
        name = 'SqueezeBackward0'
    else:
        dims = dim if isinstance(dim, (tuple, list)) else (dim,)
        axes = tuple(input._axis(d) for d in dims if old and old[input._axis(d)] == 1) if old else ()
        name = 'SqueezeBackward1' if not isinstance(dim, (tuple, list)) else 'SqueezeBackward2'
    out = np.squeeze(input._data, axis=axes) if axes else input._data.view()
    return _view_of(input, out, name, lambda g: g.reshape(old))


def unsqueeze(input, dim):
    count = input._data.ndim + 1
    if not -count <= dim < count:
        raise IndexError(f'Dimension out of range (expected to be in range of [{-count}, {count - 1}], but got {dim})')
    axis = dim % count
    return _view_of(input, np.expand_dims(input._data, axis), 'UnsqueezeBackward0', lambda g: np.squeeze(g, axis=axis))


def permute(input, *dims):
    dims = _shape_args(dims)
    if len(dims) != input._data.ndim:
        raise RuntimeError(
            f'permute(sparse_coo): number of dimensions in the tensor input does not match the length of the desired '
            f'ordering of dimensions i.e. input.dim() = {input._data.ndim} is not equal to len(dims) = {len(dims)}'
        )
    order = tuple(input._axis(d) for d in dims)
    inverse = tuple(np.argsort(order))
    return _view_of(input, np.transpose(input._data, order), 'PermuteBackward0', lambda g: np.transpose(g, inverse))


def transpose(input, dim0, dim1):
    if input._data.ndim == 0:
        return input
    a, b = input._axis(dim0), input._axis(dim1)
    return _view_of(input, np.swapaxes(input._data, a, b), 'TransposeBackward0', lambda g: np.swapaxes(g, a, b))


def t(input):
    if input._data.ndim > 2:
        raise RuntimeError(f't() expects a tensor with <= 2 dimensions, but self is {input._data.ndim}D')
    if input._data.ndim < 2:
        return input
    return _view_of(input, input._data.T, 'TBackward0', lambda g: g.T)


def movedim(input, source, destination):
    out = np.moveaxis(input._data, source, destination)
    return _view_of(input, out, 'PermuteBackward0', lambda g: np.moveaxis(g, destination, source))


def expand(input, *size):
    size = _shape_args(size)
    old = input._data.shape
    if len(size) < len(old):
        raise RuntimeError(
            f'expand(torch.{_KIND_TITLES.get(input._dtype.name, "Float")}Tensor{{{list(old)}}}, size={list(size)}): the number of sizes provided ({len(size)}) must be greater or equal to the number of dimensions in the tensor ({len(old)})'
        )
    target = []
    offset = len(size) - len(old)
    for i, n in enumerate(size):
        if n == -1:
            if i < offset:
                raise RuntimeError(f'expand: -1 is not allowed in a leading, non-existing dimension {i}')
            n = old[i - offset]
        target.append(n)
    try:
        out = np.broadcast_to(input._data, tuple(target))
    except ValueError:
        for i in range(len(old)):
            have, want = old[i], target[i + offset]
            if have != want and have != 1:
                raise RuntimeError(
                    f'The expanded size of the tensor ({want}) must match the existing size ({have}) at non-singleton '
                    f'dimension {i + offset}.  Target sizes: {list(target)}.  Tensor sizes: {list(old)}'
                ) from None
        raise
    return _view_of(input, out, 'ExpandBackward0', lambda g: _unbroadcast(g, old))


def expand_as(input, other):
    return expand(input, other._data.shape)


def broadcast_to(input, size):
    return expand(input, size)


def repeat(input, *sizes):
    sizes = _shape_args(sizes)
    if len(sizes) < input._data.ndim:
        raise RuntimeError('Number of dimensions of repeat dims can not be smaller than number of dimensions of tensor')
    old = input._data.shape
    padded = (1,) * (len(sizes) - len(old)) + old
    out = np.tile(input._data, sizes)

    def back(g):
        interleaved = g.reshape(tuple(x for pair in zip(sizes, padded) for x in pair))
        return interleaved.sum(axis=tuple(range(0, 2 * len(sizes), 2))).reshape(old)

    result = _wrap(out, input._dtype)
    node = track('RepeatBackward0', [input], None, False)
    if node is not None:
        node.fn = lambda g: (back(g),)
        result._grad_fn = node
        result._requires_grad = True
    return result


def flip(input, *dims):
    dims = _shape_args(dims)
    axes = tuple(input._axis(d) for d in dims)
    result = _wrap(np.flip(input._data, axes).copy(), input._dtype)
    node = track('FlipBackward0', [input], None, False)
    if node is not None:
        node.fn = lambda g: (np.flip(g, axes),)
        result._grad_fn = node
        result._requires_grad = True
    return result


def clone(input):
    result = _wrap(input._data.copy(), input._dtype)
    node = track('CloneBackward0', [input], None, False)
    if node is not None:
        node.fn = lambda g: (g,)
        result._grad_fn = node
        result._requires_grad = True
    return result


def detach(input):
    return input.detach()


def _joined(tensors, dim, name, stacking):
    if not isinstance(tensors, (list, tuple)):
        raise TypeError(f'{name}(): argument \'tensors\' (position 1) must be tuple of Tensors, not {type(tensors).__name__}')
    tensors = list(tensors)
    if not tensors:
        raise RuntimeError(f'{name}(): expected a non-empty list of Tensors')
    for position, item in enumerate(tensors):
        if not isinstance(item, Tensor):
            raise TypeError(f'expected Tensor as element {position} in argument 0, but got {type(item).__name__}')
    kind = tensors[0]._dtype
    for item in tensors[1:]:
        kind = promote_types(kind, item._dtype)
    arrays = [t._data if t._dtype is kind else t._data.astype(kind.numpy) for t in tensors]
    if stacking:
        shape = arrays[0].shape
        for i, array in enumerate(arrays):
            if array.shape != shape:
                raise RuntimeError(f'stack expects each tensor to be equal size, but got {list(shape)} at entry 0 and {list(array.shape)} at entry {i}')
        axis = dim % (len(shape) + 1) if -(len(shape) + 1) <= dim <= len(shape) else None
        if axis is None:
            raise IndexError(f'Dimension out of range (expected to be in range of [{-(len(shape) + 1)}, {len(shape)}], but got {dim})')
        out = np.stack(arrays, axis=axis)
        sizes = [1] * len(arrays)
    else:
        # An empty 1-D tensor is skipped, as in PyTorch.
        usable = [(t, a) for t, a in zip(tensors, arrays) if not (a.ndim == 1 and a.shape[0] == 0)]
        if not usable:
            return _wrap(arrays[0].copy(), kind)
        tensors, arrays = [u[0] for u in usable], [u[1] for u in usable]
        for position, array in enumerate(arrays):
            if array.ndim == 0:
                raise RuntimeError(f'zero-dimensional tensor (at position {position}) cannot be concatenated')
        ndim = arrays[0].ndim
        if not -ndim <= dim < ndim:
            raise IndexError(f'Dimension out of range (expected to be in range of [{-ndim}, {ndim - 1}], but got {dim})')
        axis = dim % ndim
        for i, array in enumerate(arrays[1:], start=1):
            if array.ndim != ndim:
                raise RuntimeError(f'Tensors must have same number of dimensions: got {ndim} and {array.ndim}')
            for k in range(ndim):
                if k != axis and array.shape[k] != arrays[0].shape[k]:
                    raise RuntimeError(
                        f'Sizes of tensors must match except in dimension {axis}. Expected size {arrays[0].shape[k]} but got size {array.shape[k]} for tensor number {i} in the list.'
                    )
        out = np.concatenate(arrays, axis=axis)
        sizes = [a.shape[axis] for a in arrays]
    result = _wrap(out, kind)
    node = track('StackBackward0' if stacking else 'CatBackward0', tensors, None, False)
    if node is not None:
        needs = [t._requires_grad for t in tensors]
        bounds = np.cumsum(sizes)[:-1]

        def fn(g):
            parts = np.split(g, bounds, axis=axis)
            if stacking:
                parts = [np.squeeze(p, axis=axis) for p in parts]
            return [part.astype(t._dtype.numpy) if need else None for part, t, need in zip(parts, tensors, needs)]

        node.fn = fn
        result._grad_fn = node
        result._requires_grad = True
    return result


def cat(tensors, dim=0):
    return _joined(tensors, dim, 'cat', False)


concat = cat
concatenate = cat


def stack(tensors, dim=0):
    return _joined(tensors, dim, 'stack', True)


def unbind(input, dim=0):
    axis = input._axis(dim)
    return tuple(getitem(input, (slice(None),) * axis + (i,)) for i in range(input._data.shape[axis]))


def split(tensor, split_size_or_sections, dim=0):
    axis = tensor._axis(dim)
    length = tensor._data.shape[axis]
    if isinstance(split_size_or_sections, int):
        size = split_size_or_sections
        sections = [size] * (length // size) + ([length % size] if length % size else [])
    else:
        sections = list(split_size_or_sections)
        if _sum(sections) != length:
            raise RuntimeError(f'split_with_sizes expects split_sizes to sum exactly to {length} (input tensor\'s size at dimension {axis}), but got split_sizes={sections}')
    out, start = [], 0
    for size in sections:
        out.append(getitem(tensor, (slice(None),) * axis + (slice(start, start + size),)))
        start += size
    return tuple(out)


def chunk(input, chunks, dim=0):
    length = input._data.shape[input._axis(dim)]
    size = -(-length // chunks) if length else 1
    return split(input, size, dim)


def narrow(input, dim, start, length):
    axis = input._axis(dim)
    return getitem(input, (slice(None),) * axis + (slice(start, start + length),))


def select(input, dim, index):
    axis = input._axis(dim)
    return getitem(input, (slice(None),) * axis + (index,))


def index_select(input, dim, index):
    axis = input._axis(dim)
    return getitem(input, (slice(None),) * axis + (index,))


def gather(input, dim, index):
    axis = input._axis(dim)
    data = input._data
    picked = _arr(np.take_along_axis(data, index._data, axis=axis))
    result = _wrap(picked, input._dtype)
    node = track('GatherBackward0', [input], None, False)
    if node is not None:

        def fn(g):
            full = np.zeros(data.shape, dtype=data.dtype)
            np.add.at(full, _along(index._data, axis, data.ndim), g)
            return (full,)

        node.fn = fn
        result._grad_fn = node
        result._requires_grad = True
    return result


def _along(index, axis, ndim):
    """What fancy indexing needs to do what take_along_axis does."""
    grids = np.indices(index.shape, sparse=True)
    return tuple(index if i == axis else grids[i] for i in range(ndim))


def topk(input, k, dim=-1, largest=True, sorted=True):
    axis = input._axis(dim)
    data = input._data
    if data.ndim and k > data.shape[axis]:
        raise RuntimeError('selected index k out of range')
    order = np.argsort(-data if largest else data, axis=axis, kind='stable')
    idx = np.take(order, np.arange(k), axis=axis) if data.ndim else order
    values = np.take_along_axis(data, idx, axis=axis) if data.ndim else data
    result = _wrap(_arr(values).copy(), input._dtype)
    node = track('TopkBackward0', [input], None, False)
    if node is not None:

        def fn(g):
            full = np.zeros(data.shape, dtype=data.dtype)
            if data.ndim == 0:
                return (g,)
            np.put_along_axis(full, idx, g, axis=axis)
            return (full,)

        node.fn = fn
        result._grad_fn = node
        result._requires_grad = True
    return _TopkResult(result, _wrap(_arr(idx).astype(np.int64), _dtype.int64))


def sort(input, dim=-1, descending=False, stable=False):
    axis = input._axis(dim)
    data = input._data
    order = np.argsort(-data if descending else data, axis=axis, kind='stable') if data.ndim else np.zeros((), dtype=np.int64)
    values = np.take_along_axis(data, order, axis=axis) if data.ndim else data
    result = _wrap(_arr(values).copy(), input._dtype)
    node = track('SortBackward0', [input], None, False)
    if node is not None:

        def fn(g):
            full = np.zeros(data.shape, dtype=data.dtype)
            if data.ndim == 0:
                return (g,)
            np.put_along_axis(full, order, g, axis=axis)
            return (full,)

        node.fn = fn
        result._grad_fn = node
        result._requires_grad = True
    return _SortResult(result, _wrap(_arr(order).astype(np.int64), _dtype.int64))


def argsort(input, dim=-1, descending=False, stable=False):
    return sort(input, dim, descending, stable)[1]


# ---------- Indexing ----------

_FLOAT_INDEX = 'only integers, slices (`:`), ellipsis (`...`), None and long or byte Variables are valid indices (got float)'


def _index_array(part):
    """A list or tensor used as an index, as a NumPy array; only whole numbers and booleans can index."""
    if isinstance(part, Tensor):
        array = part._data
    elif isinstance(part, list):
        array = np.array([(p._data if isinstance(p, Tensor) else p) for p in part])
    else:
        array = part
    if array.dtype.kind == 'f':
        raise IndexError('tensors used as indices must be long, int, byte or bool tensors')
    return array


def _prepare_index(index, shape):
    """
    Checks an index the way PyTorch does, in the same order, and returns it ready for NumPy along
    with whether it picks numbers with lists or tensors (which copies them) rather than slicing.
    """
    if isinstance(index, list) and len(index) < 32 and any(
        isinstance(p, (list, tuple, slice, Tensor)) or p is None or p is Ellipsis for p in index
    ):
        warnings.warn(
            'Using a non-tuple sequence for multidimensional indexing is deprecated and will be changed in pytorch 2.9; '
            'use x[tuple(seq)] instead of x[seq]. In pytorch 2.9 this will be interpreted as tensor index, '
            'x[torch.tensor(seq)], which will result either in an error or a different result',
            UserWarning,
            stacklevel=4,
        )
        index = tuple(index)
    parts = list(index) if isinstance(index, tuple) else [index]
    # Only one ellipsis counts.
    seen = False
    kept = []
    for part in parts:
        if part is Ellipsis:
            if seen:
                continue
            seen = True
        kept.append(part)
    parts = kept
    # Work out what each item is and how many dimensions of the tensor it uses up, before anything else is checked.
    converted = []
    for part in parts:
        if isinstance(part, (Tensor, list, np.ndarray)):
            converted.append(('array', part))
        elif isinstance(part, bool):
            converted.append(('flag', part))
        elif isinstance(part, (int, np.integer)):
            converted.append(('int', int(part)))
        elif isinstance(part, slice):
            converted.append(('slice', part))
        elif part is None:
            converted.append(('none', None))
        elif part is Ellipsis:
            converted.append(('ellipsis', None))
        elif isinstance(part, (float, np.floating)):
            converted.append(('float', part))
        elif isinstance(part, str):
            converted.append(('str', part))
        else:
            raise IndexError(
                'only integers, slices (`:`), ellipsis (`...`), None and long or byte Variables are valid indices '
                f'(got {type(part).__name__})'
            )
    used = _sum(1 for kind, part in converted if kind in ('int', 'slice', 'float', 'str'))
    for kind, part in converted:
        if kind == 'array':
            is_mask = (part._dtype is _dtype.bool_) if isinstance(part, Tensor) else (
                part.dtype == np.bool_ if isinstance(part, np.ndarray) else bool(part) and all(isinstance(p, bool) for p in part)
            )
            used += (part._data.ndim if isinstance(part, Tensor) else np.ndim(part)) if is_mask else 1
    if used > len(shape):
        raise IndexError(f'too many indices for tensor of dimension {len(shape)}')
    for kind, _ in converted:
        if kind == 'str':
            raise TypeError("new(): invalid data type 'str'")
    arrays = {}
    for position, (kind, part) in enumerate(converted):
        if kind == 'array':
            arrays[position] = _index_array(part)
    # Lists and tensors have to broadcast together to pick numbers.
    shapes = []
    for kind, part in converted:
        if kind == 'flag':
            shapes.append((int(part),))
    for position in sorted(arrays):
        array = arrays[position]
        shapes.append((int(np.count_nonzero(array)),) if array.dtype == np.bool_ else array.shape)
    if len(shapes) > 1 and arrays:
        try:
            np.broadcast_shapes(*shapes)
        except ValueError:
            raise IndexError(
                'shape mismatch: indexing tensors could not be broadcast together with shapes '
                + ', '.join(str(list(shape_)) for shape_ in shapes)
            ) from None
    ready = []
    dim = 0
    current = []  # the shape of what the index has made so far, for the errors about masks
    ordinal = 0
    for position, (kind, part) in enumerate(converted):
        if kind == 'float':
            raise IndexError(_FLOAT_INDEX)
        if kind == 'int':
            size = shape[dim]
            if not -size <= part < size:
                # PyTorch counts the places in the index here, not the dimensions of the tensor.
                raise IndexError(f'index {part} is out of bounds for dimension {position} with size {size}')
            dim += 1
            ready.append(part)
        elif kind == 'slice':
            step = int(part.step) if isinstance(part.step, Tensor) else part.step
            if step is not None and step <= 0:
                raise ValueError('step must be greater than zero')
            start = int(part.start) if isinstance(part.start, Tensor) else part.start
            stop = int(part.stop) if isinstance(part.stop, Tensor) else part.stop
            chosen = slice(start, stop, step)
            current.append(len(range(*chosen.indices(shape[dim]))))
            dim += 1
            ready.append(chosen)
        elif kind == 'array':
            array = arrays[position]
            if array.dtype == np.bool_:
                here = list(current) + list(shape[dim:])
                for k in range(array.ndim):
                    if array.shape[k] != shape[dim + k]:
                        raise IndexError(
                            f'The shape of the mask {list(array.shape)} at index {k} does not match the shape of the '
                            f'indexed tensor {here} at index {len(current) + k}'
                        )
                dim += array.ndim
            else:
                size = shape[dim]
                if array.size and (array.max() >= size or array.min() < -size):
                    bad = array.max() if array.max() >= size else array.min()
                    raise IndexError(f'index {int(bad)} is out of bounds for dimension {ordinal} with size {size}')
                dim += 1
            ordinal += 1
            current.append(None)
            ready.append(array)
        elif kind == 'ellipsis':
            span = len(shape) - used
            current.extend(shape[dim : dim + span])
            dim += span
            ready.append(Ellipsis)
        elif kind in ('none', 'flag'):
            current.append(1)
            ready.append(None if kind == 'none' else part)
        else:
            ready.append(part)
    flags = any(kind == 'flag' for kind, _ in converted)
    return tuple(ready), (arrays_count_of(arrays) > 0 or any(isinstance(p, np.ndarray) for p in ready)), flags


def arrays_count_of(arrays):
    return len(arrays)


def _index_kind(parts):
    """Which operation PyTorch names a gradient after: the last thing the index does."""
    kind = 'AliasBackward0'
    for part in parts:
        if isinstance(part, slice):
            if not (part.start is None and part.stop is None and part.step in (None, 1)):
                kind = 'SliceBackward0'
        elif part is None or isinstance(part, bool):
            kind = 'UnsqueezeBackward0'
        elif part is Ellipsis:
            continue
        elif isinstance(part, np.ndarray):
            kind = 'IndexBackward0'
        else:
            kind = 'SelectBackward0'
    return kind


def getitem(input, index):
    if isinstance(index, Tensor) and index._dtype is _dtype.bool_ and index._data.ndim == 0:
        index = index._data
    data = input._data
    parts, advanced, _ = _prepare_index(index, data.shape)
    try:
        out = data[parts]
    except IndexError as error:
        raise IndexError(str(error).replace('axis', 'dimension')) from None
    except ValueError as error:
        text = str(error)
        if 'shape mismatch' in text:
            shapes = ', '.join(str(list(_index_array(p).shape)) for p in parts if isinstance(p, np.ndarray))
            raise IndexError(f'shape mismatch: indexing tensors could not be broadcast together with shapes {shapes}') from None
        raise
    out = _arr(out)
    shares = not advanced and out.size > 0 and np.shares_memory(out, data) or (not advanced and out.base is not None)
    result = Tensor._wrap(out if shares or advanced else out.copy(), input._dtype, vc=input._vc if shares else None)
    if shares:
        result._base = input._base if input._base is not None else input
    node = track(_index_kind(parts), [input], None, False)
    if node is not None:
        shape = data.shape

        def fn(g):
            full = np.zeros(shape, dtype=data.dtype)
            if advanced:
                np.add.at(full, parts, g)
            else:
                full[parts] = g
            return (full,)

        node.fn = fn
        result._grad_fn = node
        result._requires_grad = True
    return result


def _check_assignment(target, value, advanced):
    """PyTorch's errors for putting a value of one shape in a place of another."""
    target, value = tuple(target), tuple(value)
    if advanced:
        stripped = list(value)
        while len(stripped) > len(target) and stripped[0] == 1:
            stripped.pop(0)
        try:
            ok = len(stripped) <= len(target) and np.broadcast_shapes(tuple(stripped), target) == target
        except ValueError:
            ok = False
        if not ok:
            raise RuntimeError(
                f'shape mismatch: value tensor of shape {list(value)} cannot be broadcast to indexing result of shape {list(target)}'
            )
        return
    stripped = list(value)
    while len(stripped) > len(target) and stripped[0] == 1:
        stripped.pop(0)
    if len(stripped) > len(target):
        raise RuntimeError(
            f'expand(torch.FloatTensor{{{list(value)}}}, size={list(target)}): the number of sizes provided '
            f'({len(target)}) must be greater or equal to the number of dimensions in the tensor ({len(value)})'
        )
    for back in range(1, len(stripped) + 1):
        have, want = stripped[-back], target[-back]
        if have != want and have != 1:
            raise RuntimeError(
                f'The expanded size of the tensor ({want}) must match the existing size ({have}) at non-singleton '
                f'dimension {len(target) - back}.  Target sizes: {list(target)}.  Tensor sizes: {list(value)}'
            )


def setitem(input, index, value):
    if input._requires_grad and input._grad_fn is None and _autograd.is_grad_enabled():
        raise RuntimeError('a view of a leaf Variable that requires grad is being used in an in-place operation.')
    data = input._data
    parts, advanced, flagged = _prepare_index(index, data.shape)
    advanced = advanced or flagged
    value = _operand(value)
    given = value._data if isinstance(value, Tensor) else value
    tracking = _autograd.is_grad_enabled() and (input._requires_grad or (isinstance(value, Tensor) and value._requires_grad))
    if tracking and input._base is not None:
        raise RuntimeError('in-place changes of a view of a tensor that tracks gradients are not available in the page')
    try:
        target_shape = data[parts].shape
    except IndexError as error:
        raise IndexError(str(error).replace('axis', 'dimension')) from None
    if isinstance(value, Tensor):
        _check_assignment(target_shape, value._data.shape, advanced)
    old_edge = _autograd.edge_of(input) if tracking else None
    if isinstance(given, np.ndarray):
        given = given.astype(data.dtype, copy=False)
        stripped = given
        while stripped.ndim > len(target_shape) and stripped.shape[0] == 1:
            stripped = stripped[0]
        given = stripped
    data[parts] = given
    input._changed()
    if tracking:
        node = _autograd.node_kind('CopySlices', 'torch::autograd::CopySlices')((old_edge, _autograd.edge_of(value) if isinstance(value, Tensor) else None), None, False)

        def fn(g):
            outer = g.copy()
            outer[parts] = 0
            grads = [outer]
            if isinstance(value, Tensor):
                grads.append(_unbroadcast(g[parts], value._data.shape).astype(value._dtype.numpy) if value._requires_grad else None)
            return grads[: len(node.edges)]

        node.fn = fn
        input._grad_fn = node
        input._requires_grad = True


# ---------- Copies and types ----------


def to(input, *args, **kwargs):
    kind = kwargs.get('dtype')
    where = kwargs.get('device')
    copy = kwargs.get('copy', False)
    for arg in args:
        if isinstance(arg, _dtype.dtype):
            kind = arg
        elif isinstance(arg, Tensor):
            kind, where = arg._dtype, arg.device
        elif isinstance(arg, (str, _dtype.device)) or (isinstance(arg, int) and not isinstance(arg, bool)):
            where = arg
        elif isinstance(arg, bool):
            continue
        else:
            raise TypeError(f'to() received an invalid combination of arguments - got ({type(arg).__name__})')
    if where is not None:
        _dtype.as_device(where)
    if kind is None or kind is input._dtype:
        return clone(input) if copy else input
    out = input._data.astype(kind.numpy)
    result = _wrap(out, kind)
    if kind.is_floating_point and input._dtype.is_floating_point:
        node = track('ToCopyBackward0', [input], None, False)
        if node is not None:
            node.fn = lambda g: (g.astype(input._data.dtype),)
            result._grad_fn = node
            result._requires_grad = True
    return result


_CAST_RANK = {True: 0}


def copy_(input, source):
    """Tensor.copy_: writes the numbers of another tensor into this one, converting their type, and growing them as needed."""
    input._check_in_place()
    source = _operand(source)
    given = source._data if isinstance(source, Tensor) else source
    try:
        np.copyto(input._data, np.broadcast_to(given, input._data.shape), casting='unsafe')
    except ValueError:
        raise RuntimeError(
            f'The size of tensor a ({input._data.shape[-1] if input._data.ndim else 1}) must match the size of tensor b ({np.shape(given)[-1] if np.ndim(given) else 1}) at non-singleton dimension {_max(input._data.ndim - 1, 0)}'
        ) from None
    input._changed()
    if _autograd.is_grad_enabled() and isinstance(source, Tensor) and source._requires_grad:
        node = _autograd.node_kind('CopyBackwards', 'torch::autograd::CopyBackwards')((_autograd.edge_of(input), _autograd.edge_of(source)), None, False)
        node.fn = lambda g: (np.zeros_like(g) if input._requires_grad else None, _grad_for(g, source))
        input._grad_fn = node
        input._requires_grad = True
    return input


def fill_in_place(input, value, name):
    """Tensor.zero_() and fill_(): every number becomes the value, and whatever the tensor was worked out from stops mattering."""
    input._check_in_place()
    value_tensor = value if isinstance(value, Tensor) else None
    tracking = _autograd.is_grad_enabled() and (input._requires_grad or (value_tensor is not None and value_tensor._requires_grad))
    old_edge = _autograd.edge_of(input) if tracking else None
    input._data[...] = value_tensor._data if value_tensor is not None else value
    input._changed()
    if tracking:
        edges = (old_edge, _autograd.edge_of(value_tensor)) if value_tensor is not None else (old_edge,)
        node = _autograd.node_kind(name)(edges, None, False)
        node.fn = lambda g: [np.zeros_like(g)] + ([g.sum().astype(value_tensor._dtype.numpy)] if value_tensor is not None else [])
        input._grad_fn = node
        input._requires_grad = True
    return input


def apply_in_place(input, op, *args, **kwargs):
    """
    Runs an operation and writes its result into the tensor, which is how add_, mul_ and the like
    work. The tensor takes over the history of the result, as in PyTorch.
    """
    input._check_in_place()
    tracking = _autograd.is_grad_enabled() and (
        input._requires_grad or _any(isinstance(a, Tensor) and a._requires_grad for a in args)
    )
    if tracking:
        # Gradients need the numbers the tensor had before this change.
        source = Tensor._wrap(input._data.copy(), input._dtype, input._grad_fn)
        source._requires_grad = input._requires_grad
        source._acc = input._acc
    else:
        source = input
    result = op(source, *args, **kwargs)
    if result._dtype.rank > input._dtype.rank:
        raise RuntimeError(
            f"result type {_KIND_TITLES[result._dtype.name]} can't be cast to the desired output type {_KIND_TITLES[input._dtype.name]}"
        )
    if result._data.shape != input._data.shape:
        try:
            if np.broadcast_shapes(result._data.shape, input._data.shape) != input._data.shape:
                raise ValueError
        except ValueError:
            raise RuntimeError(
                f"output with shape {list(input._data.shape)} doesn't match the broadcast shape {list(result._data.shape)}"
            ) from None
    np.copyto(input._data, result._data, casting='unsafe')
    input._changed()
    if tracking and result._requires_grad:
        node = result._grad_fn
        node.checks = tuple(
            (input, input._vc[0], True) if t is result else (t, v, False) for t, v, *_ in node.checks
        )
        if node.outputs and id(result) in node.outputs:
            node.outputs = {id(input)}
        input._grad_fn = node
        input._requires_grad = True
    return input
