"""Learning rate schedulers: change the learning rate as training goes on."""

import math


class LRScheduler:
    def __init__(self, optimizer, last_epoch=-1):
        self.optimizer = optimizer
        for group in optimizer.param_groups:
            group.setdefault('initial_lr', group['lr'])
        self.base_lrs = [group['initial_lr'] for group in optimizer.param_groups]
        self.last_epoch = last_epoch
        self._initial_step()

    def _initial_step(self):
        self.step()

    def get_last_lr(self):
        return self._last_lr

    def get_lr(self):
        raise NotImplementedError

    def step(self, epoch=None):
        self.last_epoch += 1
        values = self.get_lr()
        for group, lr in zip(self.optimizer.param_groups, values):
            group['lr'] = lr
        self._last_lr = [group['lr'] for group in self.optimizer.param_groups]


class StepLR(LRScheduler):
    def __init__(self, optimizer, step_size, gamma=0.1, last_epoch=-1):
        self.step_size = step_size
        self.gamma = gamma
        super().__init__(optimizer, last_epoch)

    def get_lr(self):
        if self.last_epoch == 0 or self.last_epoch % self.step_size != 0:
            return [group['lr'] for group in self.optimizer.param_groups]
        return [group['lr'] * self.gamma for group in self.optimizer.param_groups]


class MultiStepLR(LRScheduler):
    def __init__(self, optimizer, milestones, gamma=0.1, last_epoch=-1):
        self.milestones = sorted(milestones)
        self.gamma = gamma
        super().__init__(optimizer, last_epoch)

    def get_lr(self):
        if self.last_epoch not in self.milestones:
            return [group['lr'] for group in self.optimizer.param_groups]
        return [group['lr'] * self.gamma ** self.milestones.count(self.last_epoch) for group in self.optimizer.param_groups]


class ExponentialLR(LRScheduler):
    def __init__(self, optimizer, gamma, last_epoch=-1):
        self.gamma = gamma
        super().__init__(optimizer, last_epoch)

    def get_lr(self):
        if self.last_epoch == 0:
            return [group['lr'] for group in self.optimizer.param_groups]
        return [group['lr'] * self.gamma for group in self.optimizer.param_groups]


class CosineAnnealingLR(LRScheduler):
    def __init__(self, optimizer, T_max, eta_min=0.0, last_epoch=-1):
        self.T_max = T_max
        self.eta_min = eta_min
        super().__init__(optimizer, last_epoch)

    def get_lr(self):
        return [
            self.eta_min + (base - self.eta_min) * (1 + math.cos(math.pi * self.last_epoch / self.T_max)) / 2
            for base in self.base_lrs
        ]
