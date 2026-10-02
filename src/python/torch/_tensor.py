"""
torch.Tensor: an array of numbers, with the methods PyTorch's tensors have.

A tensor keeps its numbers in a NumPy array, `_data`, and, when gradients are tracked, the node that
made it (`_grad_fn`). The operations themselves are in _ops.py; the methods here pass on to them.
"""

import numpy as np

from . import _autograd, _dtype, _printing
from ._dtype import Size

_WARNED = set()


def _warn_once(key, message):
    import warnings

    if key not in _WARNED:
        _WARNED.add(key)
        warnings.warn(message, UserWarning, stacklevel=3)


class Tensor:
    __slots__ = ('_data', '_dtype', '_requires_grad', '_grad', '_grad_fn', '_acc', '_vc', '_base', '_retains', '__dict__', '__weakref__')

    # NumPy lets a tensor decide what `array + tensor` does.
    __array_priority__ = 1000

    def __new__(cls, *args, **kwargs):
        """torch.Tensor([1, 2]) and torch.Tensor(2, 3): the old way of making a float tensor."""
        from . import _creation

        return _creation.legacy(_dtype.get_default_dtype(), args, kwargs, cls)

    @staticmethod
    def _wrap(data, kind, grad_fn=None, vc=None, cls=None):
        """A tensor around a NumPy array that's already the right dtype; what operations make their results with."""
        tensor = object.__new__(cls or Tensor)
        tensor._data = data
        tensor._dtype = kind
        tensor._grad_fn = grad_fn
        tensor._requires_grad = grad_fn is not None
        tensor._grad = None
        tensor._acc = None
        tensor._vc = [0] if vc is None else vc
        tensor._base = None
        tensor._retains = False
        return tensor

    @staticmethod
    def _size_of(array):
        return Size(array.shape)

    # ---------- What a tensor is ----------

    @property
    def shape(self):
        return Size(self._data.shape)

    def size(self, dim=None):
        if dim is None:
            return Size(self._data.shape)
        return self._data.shape[self._axis(dim)]

    @property
    def dtype(self):
        return self._dtype

    @property
    def device(self):
        return _dtype.CPU

    @property
    def is_cuda(self):
        return False

    @property
    def ndim(self):
        return self._data.ndim

    def dim(self):
        return self._data.ndim

    ndimension = dim

    def numel(self):
        return self._data.size

    nelement = numel

    def element_size(self):
        return self._dtype.itemsize

    def is_floating_point(self):
        return self._dtype.is_floating_point

    def is_contiguous(self, memory_format=None):
        return bool(self._data.flags.c_contiguous)

    def stride(self, dim=None):
        strides = tuple(s // self._data.itemsize for s in self._data.strides)
        return strides if dim is None else strides[self._axis(dim)]

    def _axis(self, dim):
        """A dimension as a position, counting from the end when it's negative, or an IndexError like PyTorch's."""
        count = max(self._data.ndim, 1)
        if not -count <= dim < count:
            raise IndexError(f'Dimension out of range (expected to be in range of [{-count}, {count - 1}], but got {dim})')
        return dim % count

    @property
    def is_leaf(self):
        return self._grad_fn is None

    @property
    def T(self):
        if self._data.ndim != 2:
            _warn_once(
                'T',
                'The use of `x.T` on tensors of dimension other than 2 to reverse their shape is deprecated and it will '
                'throw an error in a future release. Consider `x.mT` to transpose batches of matrices or '
                '`x.permute(*torch.arange(x.ndim - 1, -1, -1))` to reverse the dimensions of a tensor.',
            )
        return _ops.permute(self, tuple(range(self._data.ndim - 1, -1, -1)))

    @property
    def mT(self):
        return _ops.transpose(self, -2, -1)

    @property
    def H(self):
        return self.T

    @property
    def data(self):
        """The same numbers, as a tensor that doesn't track gradients."""
        out = Tensor._wrap(self._data, self._dtype)
        return out

    @data.setter
    def data(self, other):
        self._data = other._data
        self._dtype = other._dtype

    @property
    def requires_grad(self):
        return self._requires_grad

    @requires_grad.setter
    def requires_grad(self, value):
        self.requires_grad_(value)

    def requires_grad_(self, requires_grad=True):
        if self._grad_fn is not None and not requires_grad:
            raise RuntimeError(
                'you can only change requires_grad flags of leaf variables. If you want to use a computed variable in a '
                'subgraph that doesn\'t require differentiation use var_no_grad = var.detach().'
            )
        if requires_grad and not self._dtype.is_floating_point:
            raise RuntimeError('Only Tensors of floating point and complex dtype can require gradients')
        self._requires_grad = bool(requires_grad)
        return self

    @property
    def grad(self):
        if self._requires_grad and self._grad_fn is not None and not self._retains:
            _warn_once(
                'grad',
                'The .grad attribute of a Tensor that is not a leaf Tensor is being accessed. Its .grad attribute '
                'won\'t be populated during autograd.backward(). If you indeed want the .grad field to be populated '
                'for a non-leaf Tensor, use .retain_grad() on the non-leaf Tensor. If you access the non-leaf Tensor '
                'by mistake, make sure you access the leaf Tensor instead. See github.com/pytorch/pytorch/pull/30531 '
                'for more informations.',
            )
        return self._grad

    @grad.setter
    def grad(self, value):
        if value is not None and not isinstance(value, Tensor):
            raise TypeError(f'assigned grad expected to be a Tensor or None but got grad of type {type(value).__name__}')
        if value is not None and value._data.shape != self._data.shape:
            raise RuntimeError(
                f'assigned grad has data of a different size: expected {self.shape}, got {value.shape}'
            )
        self._grad = value

    @grad.deleter
    def grad(self):
        self._grad = None

    @property
    def grad_fn(self):
        return self._grad_fn

    @property
    def _version(self):
        return self._vc[0]

    def retain_grad(self):
        if not self._requires_grad:
            raise RuntimeError('can\'t retain_grad on Tensor that has requires_grad=False')
        if self._grad_fn is None:
            return
        if not self._retains:
            self._retains = True
            node = self._grad_fn
            node.retain = (node.retain or []) + [self]

    @property
    def retains_grad(self):
        return self._retains

    def backward(self, gradient=None, retain_graph=None, create_graph=False, inputs=None):
        _autograd.backward_from(self, gradient, retain_graph, create_graph, inputs)

    def detach(self):
        out = Tensor._wrap(self._data, self._dtype, vc=self._vc)
        return out

    def detach_(self):
        self._grad_fn = None
        self._requires_grad = False
        return self

    # ---------- Getting numbers out ----------

    def item(self):
        if self._data.size != 1:
            raise RuntimeError(f'a Tensor with {self._data.size} elements cannot be converted to Scalar')
        return self._data.item()

    def tolist(self):
        return self._data.tolist()

    def numpy(self, force=False):
        if self._requires_grad and not force:
            raise RuntimeError('Can\'t call numpy() on Tensor that requires grad. Use tensor.detach().numpy() instead.')
        return self._data

    def __array__(self, dtype=None, copy=None):
        if self._requires_grad:
            raise RuntimeError('Can\'t call numpy() on Tensor that requires grad. Use tensor.detach().numpy() instead.')
        if dtype is not None and np.dtype(dtype) != self._data.dtype:
            return self._data.astype(dtype)
        return self._data.copy() if copy else self._data

    def __float__(self):
        if self._data.size != 1:
            raise ValueError('only one element tensors can be converted to Python scalars')
        return float(self._data.item())

    def __int__(self):
        if self._data.size != 1:
            raise ValueError('only one element tensors can be converted to Python scalars')
        return int(self._data.item())

    def __index__(self):
        if self._dtype.is_floating_point or self._data.size != 1:
            raise TypeError('only integer tensors of a single element can be converted to an index')
        return int(self._data.item())

    def __bool__(self):
        if self._data.size == 0:
            return False
        if self._data.size > 1:
            raise RuntimeError('Boolean value of Tensor with more than one value is ambiguous')
        return bool(self._data.item())

    def __len__(self):
        if self._data.ndim == 0:
            raise TypeError('len() of a 0-d tensor')
        return self._data.shape[0]

    def __iter__(self):
        if self._data.ndim == 0:
            raise TypeError('iteration over a 0-d tensor')
        return iter(_ops.unbind(self, 0))

    def __contains__(self, element):
        if isinstance(element, (Tensor, int, float, bool)):
            return bool(_ops.any_(_ops.eq(self, element)))
        raise RuntimeError(f'Tensor.__contains__ only supports Tensor or scalar, but you passed in a {type(element)}.')

    def __format__(self, spec):
        if self._data.ndim == 0 and type(self) is Tensor:
            return self.item().__format__(spec)
        return object.__format__(self, spec)

    def __repr__(self):
        return _printing.tensor_repr(self)

    def __hash__(self):
        return id(self)

    # ---------- Copies, types and devices ----------

    def clone(self, memory_format=None):
        return _ops.clone(self)

    def contiguous(self, memory_format=None):
        if self._data.flags.c_contiguous:
            return self
        return _ops.clone(self)

    def to(self, *args, **kwargs):
        return _ops.to(self, *args, **kwargs)

    def type(self, dtype=None, non_blocking=False):
        names = {
            'torch.FloatTensor': _dtype.float32,
            'torch.DoubleTensor': _dtype.float64,
            'torch.HalfTensor': _dtype.float16,
            'torch.LongTensor': _dtype.int64,
            'torch.IntTensor': _dtype.int32,
            'torch.ShortTensor': _dtype.int16,
            'torch.CharTensor': _dtype.int8,
            'torch.ByteTensor': _dtype.uint8,
            'torch.BoolTensor': _dtype.bool_,
        }
        if dtype is None:
            return next(name for name, kind in names.items() if kind is self._dtype)
        if isinstance(dtype, str):
            dtype = names[dtype]
        return _ops.to(self, dtype)

    def type_as(self, other):
        return _ops.to(self, other._dtype)

    def float(self):
        return _ops.to(self, _dtype.float32)

    def double(self):
        return _ops.to(self, _dtype.float64)

    def half(self):
        return _ops.to(self, _dtype.float16)

    def long(self):
        return _ops.to(self, _dtype.int64)

    def int(self):
        return _ops.to(self, _dtype.int32)

    def short(self):
        return _ops.to(self, _dtype.int16)

    def char(self):
        return _ops.to(self, _dtype.int8)

    def byte(self):
        return _ops.to(self, _dtype.uint8)

    def bool(self):
        return _ops.to(self, _dtype.bool_)

    def cpu(self, memory_format=None):
        return self

    def cuda(self, device=None, non_blocking=False, memory_format=None):
        raise AssertionError('Torch not compiled with CUDA enabled')

    def new_tensor(self, data, dtype=None, device=None, requires_grad=False):
        from . import _creation

        return _creation.tensor(data, dtype=dtype or self._dtype, requires_grad=requires_grad)

    def new_zeros(self, *size, dtype=None, device=None, requires_grad=False):
        from . import _creation

        return _creation.zeros(*size, dtype=dtype or self._dtype, requires_grad=requires_grad)

    def new_ones(self, *size, dtype=None, device=None, requires_grad=False):
        from . import _creation

        return _creation.ones(*size, dtype=dtype or self._dtype, requires_grad=requires_grad)

    def new_full(self, size, fill_value, dtype=None, device=None, requires_grad=False):
        from . import _creation

        return _creation.full(size, fill_value, dtype=dtype or self._dtype, requires_grad=requires_grad)

    def new_empty(self, *size, dtype=None, device=None, requires_grad=False):
        return self.new_zeros(*size, dtype=dtype, requires_grad=requires_grad)

    # ---------- In-place changes ----------

    def _check_in_place(self):
        """Raises PyTorch's error when an in-place operation would change a leaf that needs gradients."""
        if _autograd.is_grad_enabled() and self._requires_grad and self._grad_fn is None:
            raise RuntimeError('a leaf Variable that requires grad is being used in an in-place operation.')

    def _changed(self):
        self._vc[0] += 1

    def zero_(self):
        return _ops.fill_in_place(self, 0, 'ZeroBackward0')

    def fill_(self, value):
        return _ops.fill_in_place(self, value, 'FillBackward1' if isinstance(value, Tensor) else 'FillBackward2')

    def copy_(self, source, non_blocking=False):
        return _ops.copy_(self, source)

    def uniform_(self, a=0.0, b=1.0, generator=None):
        from . import _random

        self._check_in_place()
        generator = generator or _random.default_generator
        self._data[...] = _random.uniform(self._data.size, a, b, self._dtype, generator).reshape(self._data.shape)
        self._changed()
        return self

    def normal_(self, mean=0.0, std=1.0, generator=None):
        from . import _random

        self._check_in_place()
        generator = generator or _random.default_generator
        self._data[...] = _random.normal(self._data.size, mean, std, self._dtype, generator).reshape(self._data.shape)
        self._changed()
        return self

    def random_(self, from_=None, to=None, generator=None):
        from . import _random

        self._check_in_place()
        generator = generator or _random.default_generator
        if from_ is None:
            values = [_random.full_range_int64(generator) for _ in range(self._data.size)]
            self._data[...] = np.array(values).reshape(self._data.shape)
        else:
            low, high = (0, from_) if to is None else (from_, to)
            self._data[...] = _random.integers(self._data.size, low, high, generator).reshape(self._data.shape)
        self._changed()
        return self

    def bernoulli_(self, p=0.5, generator=None):
        from . import _random

        self._check_in_place()
        generator = generator or _random.default_generator
        draws = _random.uniform(self._data.size, 0.0, 1.0, _dtype.float32, generator).reshape(self._data.shape)
        self._data[...] = draws < p
        self._changed()
        return self

    # ---------- Indexing ----------

    def __getitem__(self, index):
        return _ops.getitem(self, index)

    def __setitem__(self, index, value):
        _ops.setitem(self, index, value)

    # ---------- Pickling ----------

    def __reduce_ex__(self, protocol):
        return (_rebuild, (self._data.tobytes(), self._data.shape, self._dtype.name, self._requires_grad))

    def __deepcopy__(self, memo):
        if self._grad_fn is not None:
            raise RuntimeError(
                'Only Tensors created explicitly by the user (graph leaves) support the deepcopy protocol at the moment.'
            )
        out = Tensor._wrap(self._data.copy(), self._dtype)
        out._requires_grad = self._requires_grad
        if self._grad is not None:
            out._grad = Tensor._wrap(self._grad._data.copy(), self._grad._dtype)
        out.__dict__.update({k: v for k, v in self.__dict__.items()})
        memo[id(self)] = out
        return out


def _rebuild(raw, shape, kind_name, requires_grad):
    kind = _dtype._BY_NAME[kind_name]
    tensor = Tensor._wrap(np.frombuffer(raw, dtype=kind.numpy).reshape(shape).copy(), kind)
    tensor._requires_grad = requires_grad
    return tensor


_autograd.Tensor = Tensor

from . import _ops  # noqa: E402  (the operations need the class above)
from . import _methods  # noqa: E402,F401  (so does attaching the rest of the methods)
