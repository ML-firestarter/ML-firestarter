"""The loss functions as layers: MSELoss, CrossEntropyLoss and the others."""

from . import functional as F
from .module import Module


class _Loss(Module):
    def __init__(self, size_average=None, reduce=None, reduction='mean'):
        super().__init__()
        self.reduction = reduction


class MSELoss(_Loss):
    """The mean of the squared differences between the predictions and the targets."""

    def forward(self, input, target):
        return F.mse_loss(input, target, reduction=self.reduction)


class L1Loss(_Loss):
    def forward(self, input, target):
        return F.l1_loss(input, target, reduction=self.reduction)


class SmoothL1Loss(_Loss):
    def __init__(self, size_average=None, reduce=None, reduction='mean', beta=1.0):
        super().__init__(size_average, reduce, reduction)
        self.beta = beta

    def forward(self, input, target):
        return F.smooth_l1_loss(input, target, reduction=self.reduction, beta=self.beta)


class HuberLoss(_Loss):
    def __init__(self, reduction='mean', delta=1.0):
        super().__init__(reduction=reduction)
        self.delta = delta

    def forward(self, input, target):
        return F.huber_loss(input, target, reduction=self.reduction, delta=self.delta)


class NLLLoss(_Loss):
    def __init__(self, weight=None, size_average=None, ignore_index=-100, reduce=None, reduction='mean'):
        super().__init__(size_average, reduce, reduction)
        self.register_buffer('weight', weight)
        self.ignore_index = ignore_index

    def forward(self, input, target):
        return F.nll_loss(input, target, weight=self.weight, ignore_index=self.ignore_index, reduction=self.reduction)


class CrossEntropyLoss(_Loss):
    """Turns the scores of a classifier into probabilities and scores how much probability the right class got."""

    def __init__(self, weight=None, size_average=None, ignore_index=-100, reduce=None, reduction='mean', label_smoothing=0.0):
        super().__init__(size_average, reduce, reduction)
        self.register_buffer('weight', weight)
        self.ignore_index = ignore_index
        self.label_smoothing = label_smoothing

    def forward(self, input, target):
        return F.cross_entropy(
            input, target, weight=self.weight, ignore_index=self.ignore_index, reduction=self.reduction,
            label_smoothing=self.label_smoothing,
        )


class BCELoss(_Loss):
    def __init__(self, weight=None, size_average=None, reduce=None, reduction='mean'):
        super().__init__(size_average, reduce, reduction)
        self.register_buffer('weight', weight)

    def forward(self, input, target):
        return F.binary_cross_entropy(input, target, weight=self.weight, reduction=self.reduction)


class BCEWithLogitsLoss(_Loss):
    def __init__(self, weight=None, size_average=None, reduce=None, reduction='mean', pos_weight=None):
        super().__init__(size_average, reduce, reduction)
        self.register_buffer('weight', weight)
        self.register_buffer('pos_weight', pos_weight)

    def forward(self, input, target):
        return F.binary_cross_entropy_with_logits(input, target, weight=self.weight, pos_weight=self.pos_weight, reduction=self.reduction)
