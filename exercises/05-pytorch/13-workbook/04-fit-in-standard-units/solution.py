import torch


def fit_in_standard_units(km, fares, learning_rate, steps):
    km_mean, km_std = km.mean(), km.std(correction=0)
    fares_mean, fares_std = fares.mean(), fares.std(correction=0)
    x = (km - km_mean) / km_std
    y = (fares - fares_mean) / fares_std

    w = torch.tensor(0.0, requires_grad=True)
    b = torch.tensor(0.0, requires_grad=True)
    for step in range(steps):
        loss = ((w * x + b - y) ** 2).mean()
        loss.backward()
        with torch.no_grad():
            w -= learning_rate * w.grad
            b -= learning_rate * b.grad
        w.grad.zero_()
        b.grad.zero_()

    per_km = w.item() * fares_std.item() / km_std.item()
    fee = fares_mean.item() + b.item() * fares_std.item() - per_km * km_mean.item()
    return [round(per_km, 2), round(fee, 2)]


if __name__ == "__main__":
    km = torch.tensor([2.0, 4.0, 6.0, 8.0])
    fares = torch.tensor([15.0, 23.0, 29.0, 33.0])
    print(fit_in_standard_units(km, fares, 0.1, 300))
