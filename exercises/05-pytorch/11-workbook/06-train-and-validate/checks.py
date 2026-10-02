SETUP = "(lambda m, loaders: (m, loaders[0], loaders[1]))((torch.manual_seed(1), torch.nn.Linear(2, 1))[1], make_loaders(X, y, 80, 20, {bs}))"
CALL = "(lambda s: train_and_validate(s[0], s[1], s[2], {lr}, {epochs}))({setup})"
CHECKS = [
    (CALL.format(lr=0.05, epochs=6, setup=SETUP.format(bs=16)), [19.565, 11.344, 6.565, 3.777, 2.18, 1.297]),
    (CALL.format(lr=0.0, epochs=2, setup=SETUP.format(bs=16)), [33.475, 33.475]),
    (CALL.format(lr=0.05, epochs=3, setup=SETUP.format(bs=80)), [30.076, 27.02, 24.272]),
    (CALL.format(lr=0.02, epochs=4, setup=SETUP.format(bs=8)), [22.07, 14.517, 9.528, 6.235]),
    (CALL.format(lr=0.05, epochs=0, setup=SETUP.format(bs=16)), []),
]
