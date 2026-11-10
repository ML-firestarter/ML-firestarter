import torch


def get_device():
    return "cuda" if torch.cuda.is_available() else "cpu"


def to_device(batch, device):
    if isinstance(batch, dict):
        return {name: to_device(item, device) for name, item in batch.items()}
    if isinstance(batch, (list, tuple)):
        return type(batch)(to_device(item, device) for item in batch)
    return batch.to(device)


if __name__ == "__main__":
    batch = ({"X": torch.ones(2, 3)}, torch.zeros(2, 1))
    moved = to_device(batch, get_device())
    print(moved[0]["X"].device, moved[1].device)
