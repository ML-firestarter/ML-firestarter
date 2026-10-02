import torch


def draw_settings(generator):
    learning_rate = 10 ** (torch.rand(1, generator=generator).item() * 1.5 - 2)
    n_hidden = int(torch.randint(20, 101, (1,), generator=generator).item())
    return learning_rate, n_hidden


def best_trial(trials):
    best = trials[0]
    for trial in trials[1:]:
        if trial[0] > best[0]:
            best = trial
    return best


if __name__ == "__main__":
    generator = torch.Generator().manual_seed(7)
    print(draw_settings(generator))
    print(draw_settings(generator))
    print(best_trial([(0.8, 0.1, 30), (0.9, 0.05, 60), (0.9, 0.2, 40)]))
