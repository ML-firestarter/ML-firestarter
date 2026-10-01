"""torch.nn.utils: clipping gradients and flattening parameters."""

import math

import numpy as np

from .. import _autograd, _dtype
from .._tensor import Tensor


def clip_grad_norm_(parameters, max_norm, norm_type=2.0, error_if_nonfinite=False, foreach=None):
    """Scales all the gradients down together when their combined length is more than max_norm."""
    if isinstance(parameters, Tensor):
        parameters = [parameters]
    grads = [p._grad for p in parameters if p._grad is not None]
    if not grads:
        return Tensor._wrap(np.zeros((), dtype=np.float32), _dtype.float32)
    norm_type = float(norm_type)
    if norm_type == math.inf:
        total = max(float(np.abs(g._data).max()) for g in grads)
    else:
        total = float(sum(float((np.abs(g._data.astype(np.float64)) ** norm_type).sum()) for g in grads) ** (1.0 / norm_type))
    if error_if_nonfinite and not math.isfinite(total):
        raise RuntimeError(f'The total norm of order {norm_type} for gradients from `parameters` is non-finite, so it cannot be clipped.')
    coefficient = min(max_norm / (total + 1e-6), 1.0)
    for g in grads:
        g._data *= np.float32(coefficient) if g._data.dtype == np.float32 else coefficient
    return Tensor._wrap(np.asarray(total, dtype=grads[0]._data.dtype), grads[0]._dtype)


def clip_grad_value_(parameters, clip_value, foreach=None):
    if isinstance(parameters, Tensor):
        parameters = [parameters]
    for p in parameters:
        if p._grad is not None:
            np.clip(p._grad._data, -clip_value, clip_value, out=p._grad._data)


def parameters_to_vector(parameters):
    return Tensor._wrap(np.concatenate([p._data.reshape(-1) for p in parameters]), _dtype.float32)


def vector_to_parameters(vec, parameters):
    offset = 0
    for p in parameters:
        count = p._data.size
        p._data[...] = vec._data[offset : offset + count].reshape(p._data.shape)
        offset += count
