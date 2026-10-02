import torch


def choose_device(cuda_available, mps_available):
    if cuda_available:
        return "cuda"
    if mps_available:
        return "mps"
    return "cpu"


def get_device():
    return choose_device(torch.cuda.is_available(), torch.backends.mps.is_available())


if __name__ == "__main__":
    print(choose_device(True, False))
    print(get_device())
