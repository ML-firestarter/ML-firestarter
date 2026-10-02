import torch

DAY = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])


def standardize_like(table, new_table):
    return new_table


def standardize(table):
    return table


if __name__ == "__main__":
    print(standardize(DAY))
    print(standardize_like(DAY, torch.tensor([[7.0, 8.0], [3.0, 0.0]])))
