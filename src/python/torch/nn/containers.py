"""Modules that hold other modules: Sequential, ModuleList and ModuleDict."""

import collections
import operator

from .module import Module, _add_indent


class Sequential(Module):
    """Runs its layers one after another, giving each one the output of the one before."""

    def __init__(self, *args):
        super().__init__()
        if len(args) == 1 and isinstance(args[0], collections.OrderedDict):
            for key, module in args[0].items():
                self.add_module(key, module)
        else:
            for idx, module in enumerate(args):
                self.add_module(str(idx), module)

    def _get_item_by_idx(self, iterator, idx):
        size = len(self)
        idx = operator.index(idx)
        if not -size <= idx < size:
            raise IndexError(f'index {idx} is out of range')
        idx %= size
        return next(iter(list(iterator)[idx : idx + 1]))

    def __getitem__(self, idx):
        if isinstance(idx, slice):
            return self.__class__(collections.OrderedDict(list(self._modules.items())[idx]))
        return self._get_item_by_idx(self._modules.values(), idx)

    def __setitem__(self, idx, module):
        key = self._get_item_by_idx(self._modules.keys(), idx)
        return setattr(self, key, module)

    def __delitem__(self, idx):
        if isinstance(idx, slice):
            for key in list(self._modules.keys())[idx]:
                delattr(self, key)
        else:
            delattr(self, self._get_item_by_idx(self._modules.keys(), idx))
        # Names stay 0, 1, 2…
        kept = list(self._modules.values())
        self._modules.clear()
        for i, module in enumerate(kept):
            self._modules[str(i)] = module

    def __len__(self):
        return len(self._modules)

    def __iter__(self):
        return iter(self._modules.values())

    def append(self, module):
        self.add_module(str(len(self)), module)
        return self

    def extend(self, sequential):
        for layer in sequential:
            self.append(layer)
        return self

    def insert(self, index, module):
        modules = list(self._modules.values())
        modules.insert(index, module)
        self._modules.clear()
        for i, item in enumerate(modules):
            self._modules[str(i)] = item
        return self

    def forward(self, input):
        for module in self:
            input = module(input)
        return input


class ModuleList(Module):
    def __init__(self, modules=None):
        super().__init__()
        if modules is not None:
            self.extend(modules)

    def __getitem__(self, idx):
        if isinstance(idx, slice):
            return self.__class__(list(self._modules.values())[idx])
        size = len(self)
        idx = operator.index(idx)
        if not -size <= idx < size:
            raise IndexError(f'index {idx} is out of range')
        return self._modules[str(idx % size)]

    def __setitem__(self, idx, module):
        idx = operator.index(idx)
        return setattr(self, str(idx % len(self)), module)

    def __len__(self):
        return len(self._modules)

    def __iter__(self):
        return iter(self._modules.values())

    def append(self, module):
        self.add_module(str(len(self)), module)
        return self

    def extend(self, modules):
        offset = len(self)
        for i, module in enumerate(modules):
            self.add_module(str(offset + i), module)
        return self

    def insert(self, index, module):
        modules = list(self._modules.values())
        modules.insert(index, module)
        self._modules.clear()
        for i, item in enumerate(modules):
            self._modules[str(i)] = item

    def __repr__(self):
        reprs = [repr(item) for item in self]
        if not reprs:
            return self._get_name() + '()'
        spans = [[0, 0]]
        blocks = [reprs[0]]
        for i, text in enumerate(reprs[1:], 1):
            if text == blocks[-1]:
                spans[-1][1] += 1
                continue
            spans.append([i, i])
            blocks.append(text)
        lines = []
        for (start, end), block in zip(spans, blocks):
            line = f'({start}): {block}' if start == end else f'({start}-{end}): {end - start + 1} x {block}'
            lines.append(_add_indent(line, 2))
        return self._get_name() + '(\n  ' + '\n  '.join(lines) + '\n)'


class ModuleDict(Module):
    def __init__(self, modules=None):
        super().__init__()
        if modules is not None:
            self.update(modules)

    def __getitem__(self, key):
        return self._modules[key]

    def __setitem__(self, key, module):
        self.add_module(key, module)

    def __delitem__(self, key):
        del self._modules[key]

    def __len__(self):
        return len(self._modules)

    def __iter__(self):
        return iter(self._modules)

    def __contains__(self, key):
        return key in self._modules

    def keys(self):
        return self._modules.keys()

    def items(self):
        return self._modules.items()

    def values(self):
        return self._modules.values()

    def update(self, modules):
        items = modules.items() if hasattr(modules, 'items') else modules
        for key, module in items:
            self[key] = module
