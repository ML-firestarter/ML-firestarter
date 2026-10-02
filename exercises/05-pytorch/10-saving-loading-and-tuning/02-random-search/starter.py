import torch


def draw_settings(generator):
    return 0.1, 50


def best_trial(trials):
    return trials[0]


if __name__ == "__main__":
    generator = torch.Generator().manual_seed(7)
    print(draw_settings(generator))
    print(draw_settings(generator))
    print(best_trial([(0.8, 0.1, 30), (0.9, 0.05, 60), (0.9, 0.2, 40)]))
