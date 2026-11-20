import torch


def to_tensor(picture):
    return picture.float()


def to_picture(x):
    return x.to(torch.uint8)


if __name__ == "__main__":
    picture = torch.tensor([[[255, 0, 0], [0, 128, 255]]], dtype=torch.uint8)
    x = to_tensor(picture)
    print(x.shape, x.dtype)
    print(x)
    print(to_picture(x))
