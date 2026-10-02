"""torch.backends: what other kinds of hardware this PyTorch can use, which is none in the page."""

import types


class _Backend(types.SimpleNamespace):
    @staticmethod
    def is_available():
        return False

    @staticmethod
    def is_built():
        return False


mps = _Backend()
cudnn = types.SimpleNamespace(enabled=False, deterministic=False, benchmark=False, is_available=lambda: False)
cuda = types.SimpleNamespace(is_built=lambda: False)
