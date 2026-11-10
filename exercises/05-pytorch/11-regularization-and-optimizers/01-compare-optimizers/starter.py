import torch
import torch.nn as nn

torch.manual_seed(7)
km = torch.rand(64, 1) * 12 + 1
fares = 4 * km.clamp(max=6) + 2 * (km - 6).clamp(min=0) + 8 + torch.randn(64, 1)
X = (km - km.mean()) / km.std(correction=0)
y = (fares - fares.mean()) / fares.std(correction=0)


def make_model():
    return nn.Sequential(nn.Linear(1, 16), nn.ReLU(), nn.Linear(16, 1))


def train(model, optimizer, steps):
    criterion = nn.MSELoss()
    for step in range(steps):
        optimizer.zero_grad()
        loss = criterion(model(X), y)
        loss.backward()
        optimizer.step()
    with torch.no_grad():
        return round(criterion(model(X), y).item(), 4)


def make_optimizer(name, parameters, learning_rate):
    return torch.optim.SGD(parameters, lr=learning_rate)


def compare(names, learning_rate, steps):
    model = make_model()
    results = {}
    for name in names:
        optimizer = make_optimizer(name, model.parameters(), learning_rate)
        results[name] = train(model, optimizer, steps)
    return results


if __name__ == "__main__":
    print(compare(["sgd", "momentum", "adam"], 0.01, 20))
    print(compare(["adam", "sgd"], 0.01, 50))
