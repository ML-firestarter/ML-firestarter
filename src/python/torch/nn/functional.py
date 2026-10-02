"""torch.nn.functional: layers and loss functions as plain functions."""

import math
import warnings

import numpy as np

from .. import _dtype, _ops, _random
from .._autograd import track
from .._ops import _grad_for, _KIND_TITLES
from .._tensor import Tensor


def _wrap(data, kind, node=None):
    return Tensor._wrap(data, kind, node)


# ---------- Activations ----------


def relu(input, inplace=False):
    if inplace:
        return input.relu_()
    return _ops.relu(input)


def sigmoid(input):
    return _ops.sigmoid(input)


def tanh(input):
    return _ops.tanh(input)


def softmax(input, dim=None, _stacklevel=3, dtype=None):
    if dim is None:
        warnings.warn(
            'Implicit dimension choice for softmax has been deprecated. Change the call to include dim=X as an argument.',
            stacklevel=2,
        )
    return _ops.softmax(input, dim, dtype)


def log_softmax(input, dim=None, _stacklevel=3, dtype=None):
    if dim is None:
        warnings.warn(
            'Implicit dimension choice for log_softmax has been deprecated. Change the call to include dim=X as an argument.',
            stacklevel=2,
        )
    return _ops.log_softmax(input, dim, dtype)


def leaky_relu(input, negative_slope=0.01, inplace=False):
    out = _ops.where(input > 0, input, _ops.mul(input, negative_slope))
    return out


def elu(input, alpha=1.0, inplace=False):
    return _ops.where(input > 0, input, _ops.mul(_ops.expm1(input), alpha))


def softplus(input, beta=1.0, threshold=20.0):
    scaled = _ops.mul(input, beta)
    return _ops.where(scaled > threshold, input, _ops.div(_ops.log1p(_ops.exp(scaled)), beta))


def silu(input, inplace=False):
    return _ops.mul(input, _ops.sigmoid(input))


def gelu(input, approximate='none'):
    if approximate == 'tanh':
        inner = _ops.mul(_ops.add(input, _ops.mul(_ops.pow(input, 3), 0.044715)), math.sqrt(2.0 / math.pi))
        return _ops.mul(_ops.mul(input, 0.5), _ops.add(_ops.tanh(inner), 1.0))
    erf = np.vectorize(math.erf, otypes=[np.float64])
    data = input._data.astype(np.float64)
    out = (0.5 * data * (1.0 + erf(data / math.sqrt(2.0)))).astype(input._data.dtype)
    result = _wrap(out, input._dtype)
    node = track('GeluBackward0', [input], None, True, [input])
    if node is not None:

        def fn(g):
            cdf = 0.5 * (1.0 + erf(data / math.sqrt(2.0)))
            pdf = np.exp(-0.5 * data * data) / math.sqrt(2 * math.pi)
            return ((g * (cdf + data * pdf)).astype(input._data.dtype),)

        node.fn = fn
        result._grad_fn = node
        result._requires_grad = True
    return result


def dropout(input, p=0.5, training=True, inplace=False):
    if p < 0.0 or p > 1.0:
        raise ValueError(f'dropout probability has to be between 0 and 1, but got {p}')
    if not training or p == 0.0:
        return input
    if p == 1.0:
        return _ops.mul(input, 0.0)
    keep = _random.uniform(input._data.size, 0.0, 1.0, _dtype.float32, _random.default_generator).reshape(input._data.shape) >= p
    mask = Tensor._wrap((keep / (1.0 - p)).astype(input._data.dtype), input._dtype)
    return _ops.mul(input, mask)


def linear(input, weight, bias=None):
    """input @ weight.T + bias."""
    if input._data.ndim == 2 and bias is not None and bias._data.ndim == 1:
        return _ops.addmm(bias, input, _ops.t(weight))
    if input._data.ndim == 1:
        rows = _ops.reshape(input, 1, -1)
        out = _ops.addmm(bias, rows, _ops.t(weight)) if bias is not None else _ops.matmul(rows, _ops.t(weight))
        return _ops.reshape(out, -1)
    if input._data.ndim > 2 and bias is not None:
        lead = tuple(input._data.shape[:-1])
        rows = _ops.reshape(input, -1, input._data.shape[-1])
        out = _ops.addmm(bias, rows, _ops.t(weight))
        return _ops.reshape(out, lead + (weight._data.shape[0],))
    out = _ops.matmul(input, _ops.t(weight))
    if bias is not None:
        out = _ops.add(out, bias)
    return out


def flatten(input, start_dim=0, end_dim=-1):
    return _ops.flatten(input, start_dim, end_dim)


def one_hot(tensor, num_classes=-1):
    if tensor._dtype is not _dtype.int64:
        raise RuntimeError('one_hot is only applicable to index tensor of type LongTensor.')
    data = tensor._data
    if num_classes == -1:
        num_classes = int(data.max()) + 1 if data.size else 0
    if data.size and (data.min() < 0 or data.max() >= num_classes):
        raise RuntimeError('Class values must be smaller than num_classes.' if data.max() >= num_classes else 'Class values must be non-negative.')
    out = np.zeros(data.shape + (num_classes,), dtype=np.int64)
    np.put_along_axis(out, data[..., None], 1, axis=-1)
    return _wrap(out, _dtype.int64)


def normalize(input, p=2.0, dim=1, eps=1e-12):
    denominator = _ops.clamp(_ops.norm(input, p, dim, True), min=eps)
    return _ops.div(input, denominator)


# ---------- Losses ----------


def _reduce(value, reduction):
    if reduction == 'mean':
        return _ops.mean(value)
    if reduction == 'sum':
        return _ops.sum(value)
    if reduction == 'none':
        return value
    raise ValueError(f'{reduction} is not a valid value for reduction')


def _warn_if_sizes_differ(input, target, name='target'):
    if input._data.shape != target._data.shape:
        warnings.warn(
            f'Using a target size ({target.shape}) that is different to the input size ({input.shape}). '
            'This will likely lead to incorrect results due to broadcasting. '
            'Please ensure they have the same size.',
            stacklevel=3,
        )


def _expect_float(*tensors):
    for t in tensors:
        if not t._dtype.is_floating_point:
            expected = 'Float'
            raise RuntimeError(f'Found dtype {_KIND_TITLES[t._dtype.name]} but expected {expected}')


def mse_loss(input, target, size_average=None, reduce=None, reduction='mean', weight=None):
    if not isinstance(target, Tensor):
        raise TypeError(f"mse_loss(): argument 'target' (position 2) must be Tensor, not {type(target).__name__}")
    _warn_if_sizes_differ(input, target)
    if reduction not in ('mean', 'sum', 'none'):
        raise ValueError(f'{reduction} is not a valid value for reduction')
    kind = _dtype.promote_types(input._dtype, target._dtype)
    if not kind.is_floating_point:
        raise NotImplementedError(f'"mse_cpu" not implemented for \'{_KIND_TITLES[kind.name]}\'')
    x = input._data.astype(kind.numpy, copy=False)
    y = target._data.astype(kind.numpy, copy=False)
    try:
        difference = x - y
    except ValueError:
        raise _ops._broadcast_error(x.shape, y.shape) from None
    squared = difference * difference
    if reduction == 'mean':
        out = _ops._arr(np.mean(squared))
    elif reduction == 'sum':
        out = _ops._arr(np.sum(squared))
    else:
        out = squared
    out = out.astype(kind.numpy, copy=False)
    node = track('MseLossBackward0', [input, target], None, True, [input, target])
    if node is not None:
        count = squared.size

        def fn(g):
            scale = g if reduction == 'none' else (g / count if reduction == 'mean' else g)
            gradient = 2.0 * difference * scale
            return [
                _grad_for(gradient, input) if input._requires_grad else None,
                _grad_for(-gradient, target) if target._requires_grad else None,
            ]

        node.fn = fn
    return _wrap(out, kind, node)


def l1_loss(input, target, size_average=None, reduce=None, reduction='mean'):
    _warn_if_sizes_differ(input, target)
    return _reduce(_ops.abs(_ops.sub(input, target)), reduction)


def smooth_l1_loss(input, target, size_average=None, reduce=None, reduction='mean', beta=1.0):
    _warn_if_sizes_differ(input, target)
    difference = _ops.abs(_ops.sub(input, target))
    if beta == 0:
        return _reduce(difference, reduction)
    loss = _ops.where(difference < beta, _ops.div(_ops.mul(_ops.mul(difference, difference), 0.5), beta), _ops.sub(difference, 0.5 * beta))
    return _reduce(loss, reduction)


def huber_loss(input, target, reduction='mean', delta=1.0, weight=None):
    _warn_if_sizes_differ(input, target)
    difference = _ops.abs(_ops.sub(input, target))
    loss = _ops.where(difference < delta, _ops.mul(_ops.mul(difference, difference), 0.5), _ops.mul(_ops.sub(difference, 0.5 * delta), delta))
    return _reduce(loss, reduction)


def nll_loss(input, target, weight=None, size_average=None, ignore_index=-100, reduce=None, reduction='mean'):
    if input._data.ndim not in (1, 2) and input._data.ndim < 2:
        raise ValueError(f'Expected 2 or more dimensions (got {input._data.ndim})')
    if target._data.ndim > 1 and input._data.ndim == 2:
        raise RuntimeError('0D or 1D target tensor expected, multi-target not supported')
    if target._dtype is not _dtype.int64 and target._dtype is not _dtype.uint8:
        raise RuntimeError(f'expected target dtype to be Long or Byte, but got {_KIND_TITLES[target._dtype.name]}')
    if input._data.ndim == 1:
        data = input._data.reshape(1, -1)
        index = target._data.reshape(1)
    else:
        data = input._data
        index = target._data
    # Class dimension is 1, any further dimensions are folded together.
    if data.ndim > 2:
        classes = data.shape[1]
        data = np.moveaxis(data, 1, -1).reshape(-1, classes)
        index = index.reshape(-1)
    if index.shape[0] != data.shape[0]:
        raise ValueError(f'Expected input batch_size ({data.shape[0]}) to match target batch_size ({index.shape[0]}).')
    valid = index != ignore_index
    safe = np.where(valid, index, 0)
    classes = data.shape[1]
    if np.any(safe >= classes) or np.any(safe < 0):
        bad = safe[(safe >= classes) | (safe < 0)][0]
        raise IndexError(f'Target {int(bad)} is out of bounds.')
    rows = np.arange(data.shape[0])
    weights = np.ones(classes, dtype=data.dtype) if weight is None else weight._data.astype(data.dtype)
    per_row = -data[rows, safe] * weights[safe] * valid
    total_weight = float((weights[safe] * valid).sum())
    if reduction == 'mean':
        out = per_row.sum() / total_weight if total_weight else np.float64('nan')
    elif reduction == 'sum':
        out = per_row.sum()
    else:
        out = per_row
    out = _ops._arr(np.asarray(out)).astype(data.dtype, copy=False)
    if reduction == 'none' and input._data.ndim == 1:
        out = out.reshape(())
    node = track('NllLossBackward0', [input], None, True)
    if node is not None:
        shape = input._data.shape

        def fn(g):
            grad_rows = -weights[safe] * valid
            if reduction == 'mean':
                grad_rows = grad_rows / total_weight * g
            elif reduction == 'sum':
                grad_rows = grad_rows * g
            else:
                grad_rows = grad_rows * np.asarray(g).reshape(-1)
            full = np.zeros((data.shape[0], classes), dtype=data.dtype)
            full[rows, safe] = grad_rows
            if len(shape) > 2:
                moved = (shape[0],) + shape[2:] + (shape[1],)
                full = np.moveaxis(full.reshape(moved), -1, 1)
            return (full.reshape(shape).astype(input._data.dtype),)

        node.fn = fn
    return _wrap(out, input._dtype, node)


def cross_entropy(input, target, weight=None, size_average=None, ignore_index=-100, reduce=None, reduction='mean', label_smoothing=0.0):
    class_dim = 0 if input._data.ndim == 1 else 1
    if input._data.shape == target._data.shape:
        # The target holds a probability for each class.
        if not target._dtype.is_floating_point:
            raise RuntimeError(f'Expected floating point type for target with class probabilities, got {_KIND_TITLES[target._dtype.name]}')
        log_probabilities = _ops.log_softmax(input, class_dim)
        if label_smoothing:
            classes = input._data.shape[class_dim]
            target = _ops.add(_ops.mul(target, 1 - label_smoothing), label_smoothing / classes)
        weighted = _ops.mul(log_probabilities, target)
        if weight is not None:
            shape = [1] * input._data.ndim
            shape[class_dim] = -1
            weighted = _ops.mul(weighted, _ops.reshape(weight, shape))
        per_sample = _ops.neg(_ops.sum(weighted, class_dim))
        if reduction == 'mean':
            return _ops.div(_ops.sum(per_sample), input._data.size // input._data.shape[class_dim])
        return _reduce(per_sample, reduction) if reduction == 'sum' else per_sample
    log_probabilities = _ops.log_softmax(input, class_dim)
    loss = nll_loss(log_probabilities, target, weight, None, ignore_index, None, reduction)
    if label_smoothing:
        classes = input._data.shape[class_dim]
        smooth = _ops.neg(_ops.mean(log_probabilities, class_dim))
        smooth = _reduce(smooth, reduction)
        loss = _ops.add(_ops.mul(loss, 1 - label_smoothing), _ops.mul(smooth, label_smoothing))
    return loss


def binary_cross_entropy(input, target, weight=None, size_average=None, reduce=None, reduction='mean'):
    if input._data.shape != target._data.shape:
        raise ValueError(f'Using a target size ({target.shape}) that is different to the input size ({input.shape}) is deprecated. Please ensure they have the same size.')
    _expect_float(input, target)
    if np.any(input._data < 0) or np.any(input._data > 1):
        raise RuntimeError('all elements of input should be between 0 and 1')
    x = input._data
    t = target._data.astype(x.dtype, copy=False)
    with np.errstate(all='ignore'):
        log_x = np.maximum(np.log(x), -100)
        log_1mx = np.maximum(np.log1p(-x), -100)
    per = -(t * log_x + (1 - t) * log_1mx)
    if weight is not None:
        per = per * weight._data
    out = _reduce_array(per, reduction)
    node = track('BinaryCrossEntropyBackward0', [input, target], None, True, [input, target])
    if node is not None:
        count = per.size

        def fn(g):
            scale = g / count if reduction == 'mean' else g
            with np.errstate(all='ignore'):
                gx = scale * (x - t) / np.maximum((1 - x) * x, 1e-12)
            if weight is not None:
                gx = gx * weight._data
            return [
                _grad_for(gx, input) if input._requires_grad else None,
                None,
            ]

        node.fn = fn
    return _wrap(out.astype(x.dtype, copy=False), input._dtype, node)


def _reduce_array(per, reduction):
    if reduction == 'mean':
        return _ops._arr(np.mean(per))
    if reduction == 'sum':
        return _ops._arr(np.sum(per))
    if reduction == 'none':
        return per
    raise ValueError(f'{reduction} is not a valid value for reduction')


def binary_cross_entropy_with_logits(input, target, weight=None, size_average=None, reduce=None, reduction='mean', pos_weight=None):
    if input._data.shape != target._data.shape:
        raise ValueError(f'Target size ({target.shape}) must be the same as input size ({input.shape})')
    if not target._dtype.is_floating_point:
        raise RuntimeError(f"result type {_KIND_TITLES[input._dtype.name]} can't be cast to the desired output type {_KIND_TITLES[target._dtype.name]}")
    x = input._data
    t = target._data.astype(x.dtype, copy=False)
    with np.errstate(all='ignore'):
        if pos_weight is None:
            per = np.maximum(x, 0) - x * t + np.log1p(np.exp(-np.abs(x)))
        else:
            log_weight = 1 + (pos_weight._data - 1) * t
            per = (1 - t) * x + log_weight * (np.log1p(np.exp(-np.abs(x))) + np.maximum(-x, 0))
    if weight is not None:
        per = per * weight._data
    out = _reduce_array(per, reduction)
    node = track('BinaryCrossEntropyWithLogitsBackward0', [input, target], None, True, [input, target])
    if node is not None:
        count = per.size

        def fn(g):
            scale = g / count if reduction == 'mean' else g
            sig = 1 / (1 + np.exp(-x))
            if pos_weight is None:
                gx = scale * (sig - t)
            else:
                gx = scale * (log_weight * sig - t * pos_weight._data)
            if weight is not None:
                gx = gx * weight._data
            return [_grad_for(gx, input) if input._requires_grad else None, None]

        node.fn = fn
    return _wrap(out.astype(x.dtype, copy=False), input._dtype, node)
