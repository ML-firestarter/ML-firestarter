"""
How a tensor prints, written the way PyTorch does it (torch/_tensor_str.py): the same number of
decimals, the same columns and brackets, the same `dtype=`, `requires_grad=True` and `grad_fn=<…>`
endings. A reader who prints a tensor in the page should see what they'd see on their computer.
"""

import math

import numpy as np

from . import _dtype


class _PrintOptions:
    precision = 4
    threshold = 1000
    edgeitems = 3
    linewidth = 80
    sci_mode = None


PRINT_OPTS = _PrintOptions()


def set_printoptions(precision=None, threshold=None, edgeitems=None, linewidth=None, profile=None, sci_mode=None):
    """torch.set_printoptions: how many decimals, how many numbers and how wide a printed tensor is."""
    if profile is not None:
        if profile == 'default':
            PRINT_OPTS.precision, PRINT_OPTS.threshold, PRINT_OPTS.edgeitems, PRINT_OPTS.linewidth = 4, 1000, 3, 80
        elif profile == 'short':
            PRINT_OPTS.precision, PRINT_OPTS.threshold, PRINT_OPTS.edgeitems, PRINT_OPTS.linewidth = 2, 1000, 2, 80
        elif profile == 'full':
            PRINT_OPTS.precision, PRINT_OPTS.threshold, PRINT_OPTS.edgeitems, PRINT_OPTS.linewidth = 4, math.inf, 3, 80
    if precision is not None:
        PRINT_OPTS.precision = precision
    if threshold is not None:
        PRINT_OPTS.threshold = threshold
    if edgeitems is not None:
        PRINT_OPTS.edgeitems = edgeitems
    if linewidth is not None:
        PRINT_OPTS.linewidth = linewidth
    PRINT_OPTS.sci_mode = sci_mode


class _Formatter:
    """Works out how wide the numbers of a tensor are and whether they print as 1., 0.5 or 1.0000e+10."""

    def __init__(self, values, floating):
        self.floating_dtype = floating
        self.int_mode = True
        self.sci_mode = False
        self.max_width = 1
        if not floating:
            for value in values.tolist():
                self.max_width = max(self.max_width, len(f'{value}'))
            return
        values = values.astype(np.float64)
        nonzero_finite = values[np.isfinite(values) & (values != 0)]
        if nonzero_finite.size == 0:
            return
        absolute = np.abs(nonzero_finite)
        smallest, largest = absolute.min(), absolute.max()
        if np.any(nonzero_finite != np.ceil(nonzero_finite)):
            self.int_mode = False
        listed = nonzero_finite.tolist()
        if self.int_mode:
            # Whole numbers print as 3. : one more character, for the point.
            if largest / smallest > 1000.0 or largest > 1.0e8:
                self.sci_mode = True
                for value in listed:
                    self.max_width = max(self.max_width, len(f'{value:.{PRINT_OPTS.precision}e}'))
            else:
                for value in listed:
                    self.max_width = max(self.max_width, len(f'{value:.0f}') + 1)
        else:
            if largest / smallest > 1000.0 or largest > 1.0e8 or smallest < 1.0e-4:
                self.sci_mode = True
                for value in listed:
                    self.max_width = max(self.max_width, len(f'{value:.{PRINT_OPTS.precision}e}'))
            else:
                for value in listed:
                    self.max_width = max(self.max_width, len(f'{value:.{PRINT_OPTS.precision}f}'))
        if PRINT_OPTS.sci_mode is not None:
            self.sci_mode = PRINT_OPTS.sci_mode

    def width(self):
        return self.max_width

    def format(self, value):
        if self.floating_dtype:
            if self.sci_mode:
                text = f'{value:{self.max_width}.{PRINT_OPTS.precision}e}'
            elif self.int_mode:
                text = f'{value:.0f}'
                if not (math.isinf(value) or math.isnan(value)):
                    text += '.'
            else:
                text = f'{value:.{PRINT_OPTS.precision}f}'
        else:
            text = f'{value}'
        return (self.max_width - len(text)) * ' ' + text


def _vector_str(data, indent, summarize, formatter):
    # The length of an element with its comma and space.
    element_length = formatter.width() + 2
    per_line = max(1, int(math.floor((PRINT_OPTS.linewidth - indent) / element_length)))
    if summarize and not PRINT_OPTS.edgeitems:
        shown = ['...']
    elif summarize and data.shape[0] > 2 * PRINT_OPTS.edgeitems:
        edge = PRINT_OPTS.edgeitems
        shown = (
            [formatter.format(value) for value in data[:edge].tolist()]
            + [' ...']
            + [formatter.format(value) for value in data[-edge:].tolist()]
        )
    else:
        shown = [formatter.format(value) for value in data.tolist()]
    lines = [', '.join(shown[i : i + per_line]) for i in range(0, len(shown), per_line)]
    return '[' + (',' + '\n' + ' ' * (indent + 1)).join(lines) + ']'


def _with_formatter(data, indent, summarize, formatter):
    dim = data.ndim
    if dim == 0:
        return formatter.format(data.item())
    if dim == 1:
        return _vector_str(data, indent, summarize, formatter)
    edge = PRINT_OPTS.edgeitems
    if summarize and data.shape[0] > 2 * edge:
        rows = (
            [_with_formatter(data[i], indent + 1, summarize, formatter) for i in range(edge)]
            + ['...']
            + [_with_formatter(data[i], indent + 1, summarize, formatter) for i in range(len(data) - edge, len(data))]
        )
    else:
        rows = [_with_formatter(data[i], indent + 1, summarize, formatter) for i in range(data.shape[0])]
    return '[' + (',' + '\n' * (dim - 1) + ' ' * (indent + 1)).join(rows) + ']'


def _summarized(data):
    """The numbers a long tensor shows: the first and last few along every dimension."""
    dim = data.ndim
    edge = PRINT_OPTS.edgeitems
    if dim == 0:
        return data
    if dim == 1:
        return np.concatenate((data[:edge], data[-edge:])) if data.shape[0] > 2 * edge else data
    if not edge:
        return data[:0]
    if data.shape[0] > 2 * edge:
        kept = [data[i] for i in range(edge)] + [data[i] for i in range(len(data) - edge, len(data))]
    else:
        kept = list(data)
    return np.stack([_summarized(x) for x in kept])


def _contents(data, kind, indent):
    if data.size == 0:
        return '[]'
    summarize = data.size > PRINT_OPTS.threshold
    shown = _summarized(data) if summarize else data
    floating = kind.is_floating_point
    formatter = _Formatter(shown.reshape(-1), floating)
    return _with_formatter(data, indent, summarize, formatter)


def _add_suffixes(text, suffixes, indent):
    pieces = [text]
    last_line = len(text) - text.rfind('\n') + 1
    for suffix in suffixes:
        if last_line + len(suffix) + 2 > PRINT_OPTS.linewidth:
            pieces.append(',\n' + ' ' * indent + suffix)
            last_line = indent + len(suffix)
        else:
            pieces.append(', ' + suffix)
            last_line += len(suffix) + 2
    pieces.append(')')
    return ''.join(pieces)


def tensor_repr(tensor):
    """What print(tensor) shows."""
    prefix = 'tensor('
    indent = len(prefix)
    suffixes = []
    data, kind = tensor._data, tensor._dtype
    if data.size == 0:
        # An empty tensor shows its shape unless it's a plain (0,), and its dtype unless it's float32.
        if data.ndim != 1:
            suffixes.append('size=' + str(tuple(data.shape)))
        if kind is not _dtype.get_default_dtype():
            suffixes.append('dtype=' + str(kind))
        text = '[]'
    else:
        if kind is not _dtype.get_default_dtype() and kind is not _dtype.int64 and kind is not _dtype.bool_:
            suffixes.append('dtype=' + str(kind))
        text = _contents(data, kind, indent)
    if tensor._grad_fn is not None:
        suffixes.append(f'grad_fn=<{tensor._grad_fn.name().rsplit("::", 1)[-1]}>')
    elif tensor._requires_grad:
        suffixes.append('requires_grad=True')
    return _add_suffixes(prefix + text, suffixes, indent)
