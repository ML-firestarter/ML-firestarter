"""torch.nn.Module: the base of every layer and model: it keeps track of the parameters and layers inside it."""

import collections

from .. import _autograd, _dtype
from .._tensor import Tensor
from .parameter import Parameter


class _IncompatibleKeys(collections.namedtuple('IncompatibleKeys', ['missing_keys', 'unexpected_keys'])):
    def __repr__(self):
        if not self.missing_keys and not self.unexpected_keys:
            return '<All keys matched successfully>'
        return super().__repr__()

    __str__ = __repr__


def _add_indent(text, spaces):
    lines = text.split('\n')
    if len(lines) == 1:
        return text
    first = lines.pop(0)
    return first + '\n' + '\n'.join(' ' * spaces + line for line in lines)


class Module:
    """Base class for neural network layers and models; a subclass defines `forward`."""

    training = True
    _version = 1

    def __init__(self, *args, **kwargs):
        object.__setattr__(self, 'training', True)
        object.__setattr__(self, '_parameters', collections.OrderedDict())
        object.__setattr__(self, '_buffers', collections.OrderedDict())
        object.__setattr__(self, '_non_persistent_buffers_set', set())
        object.__setattr__(self, '_modules', collections.OrderedDict())

    def forward(self, *args, **kwargs):
        raise NotImplementedError(f'Module [{type(self).__name__}] is missing the required "forward" function')

    def __call__(self, *args, **kwargs):
        return self.forward(*args, **kwargs)

    # ----- Registering what's inside -----

    def register_parameter(self, name, param):
        if '_parameters' not in self.__dict__:
            raise AttributeError('cannot assign parameter before Module.__init__() call')
        if not isinstance(name, str):
            raise TypeError(f'parameter name should be a string. Got {type(name).__name__}')
        if '.' in name:
            raise KeyError('parameter name can\'t contain "."')
        if name == '':
            raise KeyError('parameter name can\'t be empty string ""')
        if hasattr(self, name) and name not in self._parameters:
            raise KeyError(f"attribute '{name}' already exists")
        if param is not None and not isinstance(param, Parameter):
            raise TypeError(f"cannot assign '{type(param).__name__}' object to parameter '{name}' (torch.nn.Parameter or None required)")
        self._parameters[name] = param

    def register_buffer(self, name, tensor, persistent=True):
        if '_buffers' not in self.__dict__:
            raise AttributeError('cannot assign buffer before Module.__init__() call')
        if '.' in name:
            raise KeyError('buffer name can\'t contain "."')
        if hasattr(self, name) and name not in self._buffers:
            raise KeyError(f"attribute '{name}' already exists")
        if tensor is not None and not isinstance(tensor, Tensor):
            raise TypeError(f"cannot assign '{type(tensor).__name__}' object to buffer '{name}' (torch Tensor or None required)")
        self._buffers[name] = tensor
        if persistent:
            self._non_persistent_buffers_set.discard(name)
        else:
            self._non_persistent_buffers_set.add(name)

    def add_module(self, name, module):
        if module is not None and not isinstance(module, Module):
            raise TypeError(f'{type(module).__name__} is not a Module subclass')
        if not isinstance(name, str):
            raise TypeError(f'module name should be a string. Got {type(name).__name__}')
        if hasattr(self, name) and name not in self._modules:
            raise KeyError(f"attribute '{name}' already exists")
        if '.' in name:
            raise KeyError(f'module name can\'t contain ".", got: {name}')
        if name == '':
            raise KeyError('module name can\'t be empty string ""')
        self._modules[name] = module

    register_module = add_module

    def __getattr__(self, name):
        state = self.__dict__
        if '_parameters' in state and name in state['_parameters']:
            return state['_parameters'][name]
        if '_buffers' in state and name in state['_buffers']:
            return state['_buffers'][name]
        if '_modules' in state and name in state['_modules']:
            return state['_modules'][name]
        raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")

    def __setattr__(self, name, value):
        def remove_from(*dicts):
            for d in dicts:
                if name in d:
                    del d[name]

        params = self.__dict__.get('_parameters')
        if isinstance(value, Parameter):
            if params is None:
                raise AttributeError('cannot assign parameters before Module.__init__() call')
            remove_from(self.__dict__, self._buffers, self._modules, self._non_persistent_buffers_set)
            self.register_parameter(name, value)
        elif params is not None and name in params:
            if value is not None:
                raise TypeError(f"cannot assign '{_typename(value)}' as parameter '{name}' (torch.nn.Parameter or None expected)")
            self.register_parameter(name, value)
        else:
            modules = self.__dict__.get('_modules')
            if isinstance(value, Module):
                if modules is None:
                    raise AttributeError('cannot assign module before Module.__init__() call')
                remove_from(self.__dict__, self._parameters, self._buffers, self._non_persistent_buffers_set)
                modules[name] = value
            elif modules is not None and name in modules:
                if value is not None:
                    raise TypeError(f"cannot assign '{_typename(value)}' as child module '{name}' (torch.nn.Module or None expected)")
                modules[name] = value
            else:
                buffers = self.__dict__.get('_buffers')
                if buffers is not None and name in buffers:
                    if value is not None and not isinstance(value, Tensor):
                        raise TypeError(f"cannot assign '{_typename(value)}' as buffer '{name}' (torch.Tensor or None expected)")
                    buffers[name] = value
                else:
                    object.__setattr__(self, name, value)

    def __delattr__(self, name):
        if name in self._parameters:
            del self._parameters[name]
        elif name in self._buffers:
            del self._buffers[name]
            self._non_persistent_buffers_set.discard(name)
        elif name in self._modules:
            del self._modules[name]
        else:
            object.__delattr__(self, name)

    def __dir__(self):
        keys = list(object.__dir__(self))
        keys += list(self._parameters) + list(self._modules) + list(self._buffers)
        return sorted(set(k for k in keys if not k[0].isdigit()))

    # ----- Walking through it -----

    def named_modules(self, memo=None, prefix='', remove_duplicate=True):
        if memo is None:
            memo = set()
        if self not in memo:
            if remove_duplicate:
                memo.add(self)
            yield prefix, self
            for name, module in self._modules.items():
                if module is None:
                    continue
                sub = prefix + ('.' if prefix else '') + name
                yield from module.named_modules(memo, sub, remove_duplicate)

    def modules(self):
        for _, module in self.named_modules():
            yield module

    def named_children(self):
        memo = set()
        for name, module in self._modules.items():
            if module is not None and module not in memo:
                memo.add(module)
                yield name, module

    def children(self):
        for _, module in self.named_children():
            yield module

    def _named_members(self, get, prefix='', recurse=True, remove_duplicate=True):
        memo = set()
        modules = self.named_modules(prefix=prefix, remove_duplicate=remove_duplicate) if recurse else [(prefix, self)]
        for module_prefix, module in modules:
            for k, v in get(module).items():
                if v is None or v in memo:
                    continue
                if remove_duplicate:
                    memo.add(v)
                yield module_prefix + ('.' if module_prefix else '') + k, v

    def named_parameters(self, prefix='', recurse=True, remove_duplicate=True):
        yield from self._named_members(lambda m: m._parameters, prefix, recurse, remove_duplicate)

    def parameters(self, recurse=True):
        for _, param in self.named_parameters(recurse=recurse):
            yield param

    def named_buffers(self, prefix='', recurse=True, remove_duplicate=True):
        yield from self._named_members(lambda m: m._buffers, prefix, recurse, remove_duplicate)

    def buffers(self, recurse=True):
        for _, buf in self.named_buffers(recurse=recurse):
            yield buf

    # ----- Modes and conversions -----

    def train(self, mode=True):
        if not isinstance(mode, bool):
            raise ValueError('training mode is expected to be boolean')
        self.training = mode
        for module in self.children():
            module.train(mode)
        return self

    def eval(self):
        return self.train(False)

    def requires_grad_(self, requires_grad=True):
        for p in self.parameters():
            p.requires_grad_(requires_grad)
        return self

    def zero_grad(self, set_to_none=True):
        for p in self.parameters():
            if p._grad is not None:
                if set_to_none:
                    p._grad = None
                else:
                    p._grad._data[...] = 0

    def apply(self, fn):
        for module in self.children():
            module.apply(fn)
        fn(self)
        return self

    def _apply(self, fn):
        for module in self.children():
            module._apply(fn)
        for param in self._parameters.values():
            if param is not None:
                converted = fn(param)
                if converted is not param:
                    param._data = converted._data
                    param._dtype = converted._dtype
                if param._grad is not None:
                    gradient = fn(param._grad)
                    param._grad._data = gradient._data
                    param._grad._dtype = gradient._dtype
        for key, buf in self._buffers.items():
            if buf is not None:
                self._buffers[key] = fn(buf)
        return self

    def to(self, *args, **kwargs):
        kind = kwargs.get('dtype')
        where = kwargs.get('device')
        for arg in args:
            if isinstance(arg, _dtype.dtype):
                kind = arg
            elif isinstance(arg, Tensor):
                kind, where = arg._dtype, arg.device
            elif isinstance(arg, (str, _dtype.device, int)) and not isinstance(arg, bool):
                where = arg
        if where is not None:
            _dtype.as_device(where)
        if kind is not None and not kind.is_floating_point:
            raise TypeError(f'nn.Module.to only accepts floating point or complex dtypes, but got desired dtype={kind}')

        def convert(t):
            if kind is not None and t._dtype.is_floating_point and t._dtype is not kind:
                return t.to(kind)
            return t

        return self._apply(convert)

    def cpu(self):
        return self

    def cuda(self, device=None):
        raise AssertionError('Torch not compiled with CUDA enabled')

    def float(self):
        return self._apply(lambda t: t.float() if t._dtype.is_floating_point else t)

    def double(self):
        return self._apply(lambda t: t.double() if t._dtype.is_floating_point else t)

    def half(self):
        return self._apply(lambda t: t.half() if t._dtype.is_floating_point else t)

    def type(self, dst_type):
        return self._apply(lambda t: t.to(dst_type))

    # ----- Saving and loading weights -----

    def state_dict(self, *args, destination=None, prefix='', keep_vars=False):
        if args:
            destination, prefix, keep_vars = (list(args) + [None, '', False][len(args) :])[:3]
            destination = destination
        if destination is None:
            destination = collections.OrderedDict()
        for name, param in self._parameters.items():
            if param is not None:
                destination[prefix + name] = param if keep_vars else param.detach()
        for name, buf in self._buffers.items():
            if buf is not None and name not in self._non_persistent_buffers_set:
                destination[prefix + name] = buf if keep_vars else buf.detach()
        for name, module in self._modules.items():
            if module is not None:
                module.state_dict(destination=destination, prefix=prefix + name + '.', keep_vars=keep_vars)
        return destination

    def load_state_dict(self, state_dict, strict=True, assign=False):
        if not isinstance(state_dict, collections.abc.Mapping):
            raise TypeError(f'Expected state_dict to be dict-like, got {type(state_dict)}.')
        own = self.state_dict(keep_vars=True)
        missing = [k for k in own if k not in state_dict]
        unexpected = [k for k in state_dict if k not in own]
        errors = []
        for key, target in own.items():
            if key not in state_dict:
                continue
            value = state_dict[key]
            if not isinstance(value, Tensor):
                errors.append(f'While copying the parameter named "{key}", expected torch.Tensor or Tensor-like object from checkpoint but received {type(value)}')
                continue
            if value.shape != target.shape:
                errors.append(
                    f'size mismatch for {key}: copying a param with shape {value.shape} from checkpoint, the shape in current model is {target.shape}.'
                )
                continue
            with _autograd.no_grad():
                if assign:
                    target._data = value._data
                else:
                    target.copy_(value)
        if strict:
            if unexpected:
                errors.insert(0, 'Unexpected key(s) in state_dict: {}. '.format(', '.join(f'"{k}"' for k in unexpected)))
            if missing:
                errors.insert(0, 'Missing key(s) in state_dict: {}. '.format(', '.join(f'"{k}"' for k in missing)))
        if errors:
            raise RuntimeError(
                'Error(s) in loading state_dict for {}:\n\t{}'.format(type(self).__name__, '\n\t'.join(errors))
            )
        return _IncompatibleKeys(missing, unexpected)

    # ----- Printing -----

    def _get_name(self):
        return type(self).__name__

    def extra_repr(self):
        return ''

    def __repr__(self):
        extra_lines = []
        extra = self.extra_repr()
        if extra:
            extra_lines = extra.split('\n')
        child_lines = []
        for key, module in self._modules.items():
            child_lines.append('(' + key + '): ' + _add_indent(repr(module), 2))
        lines = extra_lines + child_lines
        text = self._get_name() + '('
        if lines:
            if len(extra_lines) == 1 and not child_lines:
                text += extra_lines[0]
            else:
                text += '\n  ' + '\n  '.join(lines) + '\n'
        return text + ')'


def _typename(obj):
    if isinstance(obj, Tensor):
        return obj.type()
    return type(obj).__name__


import collections.abc  # noqa: E402,F401
Module.__module__ = 'torch.nn.modules.module'
