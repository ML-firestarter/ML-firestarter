"""
A small torchmetrics for the page: metrics that read a model's predictions batch by batch and
give one number at the end, like `Accuracy` and `MeanSquaredError`.

A metric keeps running totals. `update(preds, target)` adds a batch to them, `compute()` works the
final number out and `reset()` starts again; calling the metric, `metric(preds, target)`, also
adds the batch, but gives the number for that batch alone.
"""

import torch
from torch import nn


class Metric(nn.Module):
    """Base class: a subclass adds its totals with add_state and defines update() and compute()."""

    def __init__(self, **kwargs):
        super().__init__()
        self._defaults = {}

    def add_state(self, name, default, dist_reduce_fx='sum', persistent=False):
        self._defaults[name] = default
        setattr(self, name, default.clone())

    def reset(self):
        for name, default in self._defaults.items():
            setattr(self, name, default.clone())

    def update(self, *args, **kwargs):
        raise NotImplementedError

    def compute(self):
        raise NotImplementedError

    def forward(self, *args, **kwargs):
        """Adds the batch to the totals and gives the metric for that batch alone."""
        saved = {name: getattr(self, name).clone() for name in self._defaults}
        self.reset()
        self.update(*args, **kwargs)
        batch_value = self.compute()
        for name in self._defaults:
            setattr(self, name, saved[name] + getattr(self, name))
        return batch_value

    def to(self, *args, **kwargs):
        return self

    def __repr__(self):
        return f'{type(self).__name__}()'


def _flat(tensor):
    return tensor.reshape(-1)


class MeanSquaredError(Metric):
    """The mean of the squared differences, or with `squared=False` its square root, the RMSE."""

    def __init__(self, squared=True, num_outputs=1, **kwargs):
        super().__init__()
        self.squared = squared
        self.add_state('sum_squared_error', torch.tensor(0.0))
        self.add_state('total', torch.tensor(0))

    def update(self, preds, target):
        difference = preds - target
        self.sum_squared_error = self.sum_squared_error + (difference * difference).sum()
        self.total = self.total + target.numel()

    def compute(self):
        mse = self.sum_squared_error / self.total
        return mse if self.squared else torch.sqrt(mse)


class MeanAbsoluteError(Metric):
    def __init__(self, **kwargs):
        super().__init__()
        self.add_state('sum_abs_error', torch.tensor(0.0))
        self.add_state('total', torch.tensor(0))

    def update(self, preds, target):
        self.sum_abs_error = self.sum_abs_error + (preds - target).abs().sum()
        self.total = self.total + target.numel()

    def compute(self):
        return self.sum_abs_error / self.total


class R2Score(Metric):
    """1 minus the squared error over what always guessing the mean would give."""

    def __init__(self, **kwargs):
        super().__init__()
        self.add_state('sum_squared_error', torch.tensor(0.0))
        self.add_state('sum_target', torch.tensor(0.0))
        self.add_state('sum_squared_target', torch.tensor(0.0))
        self.add_state('total', torch.tensor(0))

    def update(self, preds, target):
        self.sum_squared_error = self.sum_squared_error + ((preds - target) ** 2).sum()
        self.sum_target = self.sum_target + target.sum()
        self.sum_squared_target = self.sum_squared_target + (target * target).sum()
        self.total = self.total + target.numel()

    def compute(self):
        mean = self.sum_target / self.total
        total_variation = self.sum_squared_target - self.total * mean * mean
        return 1 - self.sum_squared_error / total_variation


class _Classification(Metric):
    """What accuracy, precision, recall and F1 share: counting, for each class, the hits and misses."""

    def __init__(self, task, num_classes=None, average='micro', threshold=0.5, top_k=1, **kwargs):
        super().__init__()
        if task not in ('binary', 'multiclass'):
            raise ValueError(f"Expected argument `task` to either be 'binary', 'multiclass' or 'multilabel' but got {task}")
        if task == 'multiclass' and num_classes is None:
            raise ValueError('Optional arg `num_classes` must be type `int` when task is multiclass')
        self.task = task
        self.num_classes = 2 if task == 'binary' else num_classes
        self.average = average
        self.threshold = threshold
        self.top_k = top_k
        self.add_state('tp', torch.zeros(self.num_classes, dtype=torch.long))
        self.add_state('fp', torch.zeros(self.num_classes, dtype=torch.long))
        self.add_state('fn', torch.zeros(self.num_classes, dtype=torch.long))
        self.add_state('tn', torch.zeros(self.num_classes, dtype=torch.long))

    def update(self, preds, target):
        if self.task == 'binary':
            if preds.is_floating_point():
                preds = (torch.sigmoid(preds) if bool(((preds < 0) | (preds > 1)).any()) else preds) > self.threshold
            preds, target = _flat(preds).long(), _flat(target).long()
        else:
            if preds.dim() == target.dim() + 1:
                preds = preds.argmax(dim=1)
            preds, target = _flat(preds).long(), _flat(target).long()
        for c in range(self.num_classes):
            is_pred, is_true = preds == c, target == c
            self.tp[c] += (is_pred & is_true).sum()
            self.fp[c] += (is_pred & ~is_true).sum()
            self.fn[c] += (~is_pred & is_true).sum()
            self.tn[c] += (~is_pred & ~is_true).sum()

    def _ratio(self, numerator, denominator):
        if self.task == 'binary':
            n, d = numerator[1].float(), denominator[1].float()
            return torch.where(d == 0, torch.zeros_like(n), n / d)
        if self.average == 'micro':
            n, d = numerator.sum().float(), denominator.sum().float()
            return torch.where(d == 0, torch.zeros_like(n), n / d)
        n, d = numerator.float(), denominator.float()
        per_class = torch.where(d == 0, torch.zeros_like(n), n / d)
        if self.average == 'macro':
            return per_class.mean()
        if self.average == 'weighted':
            support = (self.tp + self.fn).float()
            return (per_class * support).sum() / support.sum()
        return per_class


class Accuracy(_Classification):
    def compute(self):
        if self.task == 'multiclass' and self.average == 'micro':
            return self.tp.sum().float() / (self.tp + self.fn).sum().float()
        if self.task == 'binary':
            return (self.tp[1] + self.tn[1]).float() / (self.tp[1] + self.tn[1] + self.fp[1] + self.fn[1]).float()
        return self._ratio(self.tp, self.tp + self.fn)


class Precision(_Classification):
    def compute(self):
        return self._ratio(self.tp, self.tp + self.fp)


class Recall(_Classification):
    def compute(self):
        return self._ratio(self.tp, self.tp + self.fn)


class F1Score(_Classification):
    def compute(self):
        if self.task == 'binary' or self.average == 'micro':
            tp = self.tp[1] if self.task == 'binary' else self.tp.sum()
            fp = self.fp[1] if self.task == 'binary' else self.fp.sum()
            fn = self.fn[1] if self.task == 'binary' else self.fn.sum()
            denominator = (2 * tp + fp + fn).float()
            return torch.where(denominator == 0, torch.zeros_like(denominator), 2 * tp.float() / denominator)
        numerator = 2 * self.tp
        denominator = 2 * self.tp + self.fp + self.fn
        return self._ratio(numerator, denominator)


MSE = MeanSquaredError
MAE = MeanAbsoluteError
__version__ = '1.9.0+browser'
