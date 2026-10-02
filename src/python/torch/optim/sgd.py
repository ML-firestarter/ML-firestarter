"""Stochastic gradient descent, the simplest way to update parameters: take a step downhill."""

from .. import _autograd
from .optimizer import Optimizer


class SGD(Optimizer):
    def __init__(self, params, lr=1e-3, momentum=0, dampening=0, weight_decay=0, nesterov=False, *, maximize=False,
                 foreach=None, differentiable=False, fused=None):
        if lr < 0.0:
            raise ValueError(f'Invalid learning rate: {lr}')
        if momentum < 0.0:
            raise ValueError(f'Invalid momentum value: {momentum}')
        if weight_decay < 0.0:
            raise ValueError(f'Invalid weight_decay value: {weight_decay}')
        defaults = dict(lr=lr, momentum=momentum, dampening=dampening, weight_decay=weight_decay, nesterov=nesterov,
                        maximize=maximize, foreach=foreach, differentiable=differentiable, fused=fused)
        if nesterov and (momentum <= 0 or dampening != 0):
            raise ValueError('Nesterov momentum requires a momentum and zero dampening')
        super().__init__(params, defaults)

    def step(self, closure=None):
        loss = None
        if closure is not None:
            with _autograd.enable_grad():
                loss = closure()
        for group in self.param_groups:
            lr, momentum = group['lr'], group['momentum']
            for p in group['params']:
                if p._grad is None:
                    continue
                grad = p._grad._data
                if group['maximize']:
                    grad = -grad
                if group['weight_decay'] != 0:
                    grad = grad + group['weight_decay'] * p._data
                if momentum != 0:
                    state = self.state[p]
                    buffer = state.get('momentum_buffer')
                    if buffer is None:
                        buffer = state['momentum_buffer'] = grad.copy()
                    else:
                        buffer *= momentum
                        buffer += (1 - group['dampening']) * grad
                    grad = grad + momentum * buffer if group['nesterov'] else buffer
                p._data -= (lr * grad).astype(p._data.dtype, copy=False)
                p._vc[0] += 1
        return loss
