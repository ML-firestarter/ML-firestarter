import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

X_wide = torch.tensor([[0.5], [-1.0], [1.0], [0.0]])
X_deep = torch.tensor([[1.0, -1.0], [0.5, 0.5], [-0.5, 1.0], [0.0, -0.5]])
y = torch.tensor([[1.0], [-0.5], [0.8], [0.2]])


class WithHelper(nn.Module):
    def __init__(self, n_wide, n_deep, hidden=4):
        super().__init__()
        self.deep_stack = nn.Sequential(nn.Linear(n_deep, hidden), nn.ReLU())
        self.output_layer = nn.Linear(n_wide + hidden, 1)
        self.aux_layer = nn.Linear(hidden, 1)

    def forward(self, X_wide, X_deep):
        deep_output = self.deep_stack(X_deep)
        main_output = self.output_layer(torch.cat([X_wide, deep_output], dim=1))
        return main_output, self.aux_layer(deep_output)


def train_one_epoch(model, loader, optimizer, criterion, aux_weight):
    model.train()
    total_loss = 0.0
    for X_wide_batch, X_deep_batch, y_batch in loader:
        main_output, aux_output = model(X_wide_batch, X_deep_batch)
        loss = criterion(main_output, y_batch) + aux_weight * criterion(aux_output, y_batch)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    return total_loss / len(loader)


if __name__ == "__main__":
    torch.manual_seed(0)
    model = WithHelper(1, 2)
    loader = DataLoader(TensorDataset(X_wide, X_deep, y), batch_size=2)
    optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
    print(train_one_epoch(model, loader, optimizer, nn.MSELoss(), 0.5))
