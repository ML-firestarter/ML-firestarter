CHECKS = [
    ("rail_fence('abcdef', 2)", "acebdf"),
    ("rail_fence('Podstawy pythona', 3)", "Ptpoosayyhndwta"),
    ("rail_fence('WE ARE DISCOVERED FLEE AT ONCE', 3)", "WECRLTEERDSOEEFEAOCAIVDEN"),
    ("rail_fence('abcdefgh', 4)", "agbfhced"),
    ("rail_fence('abc', 1)", "abc"),
    ("rail_fence('hi', 5)", "hi"),
    ("rail_fence('', 3)", ""),
    ("rail_fence('abc', 0)", raises(ValueError)),
]
