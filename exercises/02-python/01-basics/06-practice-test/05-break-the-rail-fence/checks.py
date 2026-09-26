CHECKS = [
    ("rail_fence_decrypt('acebdf', 2)", "abcdef"),
    ("rail_fence_decrypt('Ptpoosayyhndwta', 3)", "Podstawypythona"),
    ("rail_fence_decrypt('WECRLTEERDSOEEFEAOCAIVDEN', 3)", "WEAREDISCOVEREDFLEEATONCE"),
    ("rail_fence_decrypt('agbfhced', 4)", "abcdefgh"),
    ("rail_fence_decrypt('abc', 1)", "abc"),
    ("rail_fence_decrypt('hi', 5)", "hi"),
    ("rail_fence_decrypt('', 3)", ""),
    ("rail_fence_decrypt('abc', 0)", raises(ValueError)),
    ("rail_fence_decrypt(rail_fence('helloworld', 4), 4)", "helloworld"),
]
