"""Adam and AdamW: updates that adapt the size of the step for every parameter."""

import math

import numpy as np

from .. import _autograd
from .optimizer import Optimizer


class Adam(Optimizer):
    def __init__(self, params, lr=1e-3, betas=(0.9, 0.999), eps=1e-8, weight_decay=0, amsgrad=False, *, foreach=None,
                 maximize=False, capturable=False, differentiable=False, fused=None, decoupled_weight_decay=False):
        if not 0.0 <= lr:
            raise ValueError(f'Invalid learning rate: {lr}')
        if not 0.0 <= eps:
            raise ValueError(f'Invalid epsilon value: {eps}')
        if not 0.0 <= betas[0] < 1.0:
            raise ValueError(f'Invalid beta parameter at index 0: {betas[0]}')
        if not 0.0 <= betas[1] < 1.0:
            raise ValueError(f'Invalid beta parameter at index 1: {betas[1]}')
        if not 0.0 <= weight_decay:
            raise ValueError(f'Invalid weight_decay value: {weight_decay}')
        defaults = dict(lr=lr, betas=betas, eps=eps, weight_decay=weight_decay, amsgrad=amsgrad, maximize=maximize,
                        foreach=foreach, capturable=capturable, differentiable=differentiable, fused=fused,
                        decoupled_weight_decay=decoupled_weight_decay)
        super().__init__(params, defaults)

    def step(self, closure=None):
        loss = None
        if closure is not None:
            with _autograd.enable_grad():
                loss = closure()
        for group in self.param_groups:
            beta1, beta2 = group['betas']
            lr, eps, decay = group['lr'], group['eps'], group['weight_decay']
            for p in group['params']:
                if p._grad is None:
                    continue
                grad = p._grad._data
                if group['maximize']:
                    grad = -grad
                state = self.state[p]
                if not state:
                    state['step'] = 0.0
                    state['exp_avg'] = np.zeros_like(p._data)
                    state['exp_avg_sq'] = np.zeros_like(p._data)
                    if group['amsgrad']:
                        state['max_exp_avg_sq'] = np.zeros_like(p._data)
                state['step'] += 1
                step = state['step']
                if decay != 0:
                    if group['decoupled_weight_decay']:
                        p._data *= 1 - lr * decay
                    else:
                        grad = grad + decay * p._data
                exp_avg, exp_avg_sq = state['exp_avg'], state['exp_avg_sq']
                # exp_avg moves a share (1 - beta1) of the way to the gradient, as lerp_ does in PyTorch.
                weight = 1 - beta1
                if weight < 0.5:
                    exp_avg += weight * (grad - exp_avg)
                else:
                    exp_avg[...] = grad - (grad - exp_avg) * (1 - weight)
                exp_avg_sq *= beta2
                exp_avg_sq += (1 - beta2) * grad * grad
                bias_correction1 = 1 - beta1**step
                bias_correction2 = 1 - beta2**step
                step_size = lr / bias_correction1
                bias_correction2_sqrt = math.sqrt(bias_correction2)
                if group['amsgrad']:
                    np.maximum(state['max_exp_avg_sq'], exp_avg_sq, out=state['max_exp_avg_sq'])
                    denominator = np.sqrt(state['max_exp_avg_sq']) / bias_correction2_sqrt + eps
                else:
                    denominator = np.sqrt(exp_avg_sq) / bias_correction2_sqrt + eps
                p._data += (-step_size * (exp_avg / denominator)).astype(p._data.dtype, copy=False)
                p._vc[0] += 1
        return loss


class AdamW(Adam):
    def __init__(self, params, lr=1e-3, betas=(0.9, 0.999), eps=1e-8, weight_decay=1e-2, amsgrad=False, *, maximize=False,
                 foreach=None, capturable=False, differentiable=False, fused=None):
        super().__init__(params, lr, betas, eps, weight_decay, amsgrad, foreach=foreach, maximize=maximize,
                         capturable=capturable, differentiable=differentiable, fused=fused, decoupled_weight_decay=True)
