CHECKS = [
    ("program('quit')", prints('> quit\nGoodbye')),
    ("program('list', 'quit')", prints('> list\nDune (1/2)\nEmma (1/1)\nNeuromancer (1/1)\nPersuasion (1/3)\nPride and Prejudice (2/2)\nUlysses (0/1)\n> quit\nGoodbye')),
    ("program('borrow dune bob', 'borrow dune cy', 'quit')", prints('> borrow dune bob\nbob borrowed Dune (0 left)\n> borrow dune cy\nError: no copies left: Dune\n> quit\nGoodbye')),
    ("program('borrow pride and prejudice cy', 'who cy', 'who nobody', 'quit')", prints('> borrow pride and prejudice cy\ncy borrowed Pride and Prejudice (1 left)\n> who cy\nPersuasion, Pride and Prejudice\n> who nobody\nnothing\n> quit\nGoodbye')),
    ("program('return dune ann', 'return dune ann', 'quit')", prints("> return dune ann\nann returned Dune\n> return dune ann\nError: ann doesn't have Dune\n> quit\nGoodbye")),
    ("program('borrow zzz ann', 'fly away', 'borrow dune', 'who', 'quit')", prints('> borrow zzz ann\nError: no such book: zzz\n> fly away\nError: unknown command: fly\n> borrow dune\nError: usage: borrow TITLE MEMBER\n> who\nError: usage: who MEMBER\n> quit\nGoodbye')),
    ("program('BORROW EMMA ann', '', '   ', 'List', 'QUIT')", prints('> BORROW EMMA ann\nann borrowed Emma (0 left)\n>\n>\n> List\nDune (1/2)\nEmma (0/1)\nNeuromancer (1/1)\nPersuasion (1/3)\nPride and Prejudice (2/2)\nUlysses (0/1)\n> QUIT\nGoodbye')),
]
