"""torch.save and torch.load: keeping tensors and models' weights in a file, or in memory."""

import builtins
import collections
import io
import pickle

from . import _tensor  # noqa: F401  (the pickled tensors rebuild through it)

_SAFE = {
    ('collections', 'OrderedDict'),
    ('builtins', 'set'),
    ('builtins', 'frozenset'),
    ('builtins', 'complex'),
    ('torch._tensor', '_rebuild'),
    ('torch.nn.parameter', '_rebuild_parameter'),
    ('torch._dtype', '_dtype_named'),
    ('torch._dtype', 'dtype'),
    ('_codecs', 'encode'),
}


class _WeightsOnly(pickle.Unpickler):
    def find_class(self, module, name):
        if (module, name) in _SAFE:
            return super().find_class(module, name)
        raise pickle.UnpicklingError(
            'Weights only load failed. This file can still be loaded, to do so you have two options, do those steps '
            'only if you trust the source of the checkpoint. \n'
            f'\tWeightsUnpickler error: Unsupported global: GLOBAL {module}.{name} was not an allowed global by default.'
        )


def save(obj, f, pickle_module=pickle, pickle_protocol=4, _use_new_zipfile_serialization=True, _disable_byteorder_record=False):
    """Writes an object, like a model's state_dict, to a file path or file-like object."""
    if isinstance(f, (str, bytes)) or hasattr(f, '__fspath__'):
        with builtins.open(f, 'wb') as file:
            pickle.dump(obj, file, protocol=pickle_protocol)
    else:
        pickle.dump(obj, f, protocol=pickle_protocol)


def load(f, map_location=None, pickle_module=None, *, weights_only=True, mmap=None, **pickle_load_args):
    """Reads back what torch.save wrote. With weights_only (the default), it only unpickles tensors and plain data."""
    if isinstance(f, (str, bytes)) or hasattr(f, '__fspath__'):
        with builtins.open(f, 'rb') as file:
            data = file.read()
    else:
        data = f.read()
    unpickler = _WeightsOnly(io.BytesIO(data)) if weights_only else pickle.Unpickler(io.BytesIO(data))
    return unpickler.load()
