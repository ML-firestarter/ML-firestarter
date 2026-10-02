"""torch.autograd: gradients, as functions."""

from .._autograd import (  # noqa: F401
    grad, backward, no_grad, enable_grad, set_grad_enabled, inference_mode, is_grad_enabled,
)
from .._tensor import Tensor as Variable  # noqa: F401


class set_detect_anomaly:
    """Anomaly detection isn't available in the page, so this does nothing."""

    def __init__(self, mode=True, check_nan=True):
        pass

    def __enter__(self):
        pass

    def __exit__(self, *exc):
        pass


def detect_anomaly(check_nan=True):
    return set_detect_anomaly(True)
