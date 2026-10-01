"""torch.optim.Optimizer: what updates the parameters of a model after the gradients are worked out."""

import collections
import copy

from .._tensor import Tensor

required = object()


class Optimizer:
    """Keeps the parameters it updates in groups, each with its own learning rate and the like."""

    def __init__(self, params, defaults):
        self.defaults = defaults
        self.state = collections.defaultdict(dict)
        self.param_groups = []
        if isinstance(params, Tensor):
            raise TypeError(
                'params argument given to the optimizer should be an iterable of Tensors or dicts, but got '
                f'torch.{_tensor_class_name(params)}'
            )
        params = list(params)
        if len(params) == 0:
            raise ValueError('optimizer got an empty parameter list')
        if not isinstance(params[0], dict):
            params = [{'params': params}]
        for group in params:
            self.add_param_group(group)

    def add_param_group(self, param_group):
        if not isinstance(param_group, dict):
            raise TypeError(f'param_group must be a dict, but got {type(param_group)}')
        params = param_group['params']
        if isinstance(params, Tensor):
            param_group['params'] = [params]
        elif isinstance(params, set):
            raise TypeError('optimizer parameters need to be organized in ordered collections, but the ordering of tensors in sets will change between runs. Please use a list instead.')
        else:
            param_group['params'] = list(params)
        for param in param_group['params']:
            if not isinstance(param, Tensor):
                raise TypeError(f'optimizer can only optimize Tensors, but one of the params is {type(param).__name__}')
            if not param._grad_fn is None:
                raise ValueError("can't optimize a non-leaf Tensor")
        for name, default in self.defaults.items():
            if default is required and name not in param_group:
                raise ValueError(f'parameter group didn\'t specify a value of required optimization parameter {name}')
            param_group.setdefault(name, default)
        known = set()
        for group in self.param_groups:
            known.update(id(p) for p in group['params'])
        if any(id(p) in known for p in param_group['params']):
            raise ValueError('some parameters appear in more than one parameter group')
        self.param_groups.append(param_group)

    def zero_grad(self, set_to_none=True):
        for group in self.param_groups:
            for p in group['params']:
                if p._grad is not None:
                    if set_to_none:
                        p._grad = None
                    else:
                        p._grad._data[...] = 0

    def step(self, closure=None):
        raise NotImplementedError

    def state_dict(self):
        index = {}
        groups = []
        for group in self.param_groups:
            packed = {k: v for k, v in group.items() if k != 'params'}
            for p in group['params']:
                index.setdefault(id(p), len(index))
            packed['params'] = [index[id(p)] for p in group['params']]
            groups.append(packed)
        state = {index[id(p)]: copy.deepcopy(v) for p, v in self._state_items() if id(p) in index}
        return {'state': state, 'param_groups': groups}

    def _state_items(self):
        return list(self.state.items())

    def load_state_dict(self, state_dict):
        groups = copy.deepcopy(state_dict['param_groups'])
        if len(groups) != len(self.param_groups):
            raise ValueError('loaded state dict has a different number of parameter groups')
        mapping = {}
        for saved, current in zip(groups, self.param_groups):
            if len(saved['params']) != len(current['params']):
                raise ValueError("loaded state dict contains a parameter group that doesn't match the size of optimizer's group")
            for index, p in zip(saved['params'], current['params']):
                mapping[index] = p
        self.state = collections.defaultdict(dict)
        for key, value in state_dict['state'].items():
            self.state[mapping[key]] = copy.deepcopy(value)
        for saved, current in zip(groups, self.param_groups):
            params = current['params']
            current.update({k: v for k, v in saved.items() if k != 'params'})
            current['params'] = params

    def __repr__(self):
        text = self.__class__.__name__ + ' ('
        for i, group in enumerate(self.param_groups):
            text += '\n'
            text += f'Parameter Group {i}\n'
            for key in sorted(group.keys()):
                if key != 'params':
                    text += f'    {key}: {group[key]}\n'
        return text + ')'


def _tensor_class_name(tensor):
    return {'float32': 'FloatTensor', 'float64': 'DoubleTensor', 'int64': 'LongTensor', 'int32': 'IntTensor', 'bool': 'BoolTensor'}.get(
        tensor._dtype.name, 'Tensor'
    )


Optimizer.__module__ = 'torch.optim.optimizer'
