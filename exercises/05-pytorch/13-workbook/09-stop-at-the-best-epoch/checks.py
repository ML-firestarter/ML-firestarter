RUN = "(lambda calls, m: (m.weight.data.zero_(), m.bias.data.zero_(), [fit_with_patience(m, lambda x: (calls.append(1), x.weight.data.add_(1.0)), lambda x: abs(x.weight.item() - {target}), {epochs}, {patience}), len(calls), m.weight.item()])[2])([], torch.nn.Linear(1, 1))"
CHECKS = [
    (RUN.format(target=3, epochs=10, patience=2), [[3, 0.0], 5, 3.0]),
    (RUN.format(target=3, epochs=10, patience=1), [[3, 0.0], 4, 3.0]),
    (RUN.format(target=3, epochs=10, patience=5), [[3, 0.0], 8, 3.0]),
    (RUN.format(target=3, epochs=4, patience=3), [[3, 0.0], 4, 3.0]),
    (RUN.format(target=3, epochs=10, patience=20), [[3, 0.0], 10, 3.0]),
    (RUN.format(target=0.5, epochs=10, patience=3), [[1, 0.5], 4, 1.0]),
]
