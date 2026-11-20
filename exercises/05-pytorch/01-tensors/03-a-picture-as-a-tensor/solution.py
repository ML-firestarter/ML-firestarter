import torch


def to_tensor(picture):
    return picture.permute(2, 0, 1).float() / 255


def to_picture(x):
    return (x.clamp(0, 1) * 255).round().to(torch.uint8).permute(1, 2, 0)


if __name__ == "__main__":
    picture = torch.tensor([[[255, 0, 0], [0, 128, 255]]], dtype=torch.uint8)
    x = to_tensor(picture)
    print(x.shape, x.dtype)
    print(x)
    print(to_picture(x))
