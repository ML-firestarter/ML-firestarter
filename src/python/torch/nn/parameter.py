"""torch.nn.Parameter: a tensor that a Module knows is one of its weights."""

from .. import _dtype
from .._tensor import Tensor


class Parameter(Tensor):
    """A tensor that tracks gradients by default and is listed in `module.parameters()`."""

    __slots__ = ()

    def __new__(cls, data=None, requires_grad=True):
        if data is None:
            data = Tensor._wrap(__import__('numpy').zeros((0,), dtype='float32'), _dtype.float32)
        if not isinstance(data, Tensor):
            raise TypeError(f"Parameter data must be a Tensor, not {type(data).__name__}")
        out = Tensor._wrap(data._data, data._dtype, vc=data._vc, cls=cls)
        out.requires_grad_(requires_grad)
        return out

    def __repr__(self):
        return 'Parameter containing:\n' + super().__repr__()

    def __reduce_ex__(self, protocol):
        return (_rebuild_parameter, (self._data.tobytes(), self._data.shape, self._dtype.name, self._requires_grad))

    def __deepcopy__(self, memo):
        out = Parameter(Tensor._wrap(self._data.copy(), self._dtype), self._requires_grad)
        memo[id(self)] = out
        return out


def _rebuild_parameter(raw, shape, kind_name, requires_grad):
    from .._tensor import _rebuild

    return Parameter(_rebuild(raw, shape, kind_name, False), requires_grad)


class UninitializedParameter(Parameter):
    pass


Parameter.__module__ = 'torch.nn.parameter'
