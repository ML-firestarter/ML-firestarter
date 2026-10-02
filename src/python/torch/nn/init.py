"""torch.nn.init: ways of choosing the starting values of a layer's weights."""

import math

from .. import _autograd


def calculate_gain(nonlinearity, param=None):
    linear = ['linear', 'conv1d', 'conv2d', 'conv3d', 'conv_transpose1d', 'conv_transpose2d', 'conv_transpose3d']
    if nonlinearity in linear or nonlinearity == 'sigmoid':
        return 1
    if nonlinearity == 'tanh':
        return 5.0 / 3
    if nonlinearity == 'relu':
        return math.sqrt(2.0)
    if nonlinearity == 'leaky_relu':
        slope = 0.01 if param is None else param
        return math.sqrt(2.0 / (1 + slope**2))
    if nonlinearity == 'selu':
        return 3.0 / 4
    raise ValueError(f'Unsupported nonlinearity {nonlinearity}')


def _calculate_fan_in_and_fan_out(tensor):
    dimensions = tensor.dim()
    if dimensions < 2:
        raise ValueError('Fan in and fan out can not be computed for tensor with fewer than 2 dimensions')
    receptive = 1
    for size in tensor.shape[2:]:
        receptive *= size
    return tensor.size(1) * receptive, tensor.size(0) * receptive


def _fan(tensor, mode):
    fan_in, fan_out = _calculate_fan_in_and_fan_out(tensor)
    return fan_in if mode == 'fan_in' else fan_out


def uniform_(tensor, a=0.0, b=1.0, generator=None):
    with _autograd.no_grad():
        return tensor.uniform_(a, b, generator=generator)


def normal_(tensor, mean=0.0, std=1.0, generator=None):
    with _autograd.no_grad():
        return tensor.normal_(mean, std, generator=generator)


def constant_(tensor, val):
    with _autograd.no_grad():
        return tensor.fill_(val)


def ones_(tensor):
    return constant_(tensor, 1.0)


def zeros_(tensor):
    return constant_(tensor, 0.0)


def xavier_uniform_(tensor, gain=1.0, generator=None):
    fan_in, fan_out = _calculate_fan_in_and_fan_out(tensor)
    std = gain * math.sqrt(2.0 / float(fan_in + fan_out))
    bound = math.sqrt(3.0) * std
    return uniform_(tensor, -bound, bound, generator)


def xavier_normal_(tensor, gain=1.0, generator=None):
    fan_in, fan_out = _calculate_fan_in_and_fan_out(tensor)
    std = gain * math.sqrt(2.0 / float(fan_in + fan_out))
    return normal_(tensor, 0.0, std, generator)


def kaiming_uniform_(tensor, a=0, mode='fan_in', nonlinearity='leaky_relu', generator=None):
    if 0 in tensor.shape:
        return tensor
    fan = _fan(tensor, mode)
    gain = calculate_gain(nonlinearity, a)
    std = gain / math.sqrt(fan)
    bound = math.sqrt(3.0) * std
    return uniform_(tensor, -bound, bound, generator)


def kaiming_normal_(tensor, a=0, mode='fan_in', nonlinearity='leaky_relu', generator=None):
    if 0 in tensor.shape:
        return tensor
    fan = _fan(tensor, mode)
    gain = calculate_gain(nonlinearity, a)
    return normal_(tensor, 0.0, gain / math.sqrt(fan), generator)
