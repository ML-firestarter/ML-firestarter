"""torch.cuda: the page has no GPU, so it says so."""


def is_available():
    return False


def device_count():
    return 0


def current_device():
    raise AssertionError('Torch not compiled with CUDA enabled')


def manual_seed(seed):
    pass


def manual_seed_all(seed):
    pass


def empty_cache():
    pass


def synchronize(device=None):
    pass
