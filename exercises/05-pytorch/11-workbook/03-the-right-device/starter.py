import torch


def get_device():
    return "cpu"


def to_device(batch, device):
    return batch.to(device)


if __name__ == "__main__":
    batch = ({"X": torch.ones(2, 3)}, torch.zeros(2, 1))
    moved = to_device(batch, get_device())
    print(moved[0]["X"].device, moved[1].device)
