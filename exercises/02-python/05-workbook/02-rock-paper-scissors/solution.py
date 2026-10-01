# What each move beats.
BEATS = {"rock": "scissors", "scissors": "paper", "paper": "rock"}


def round_winner(first, second):
    first = first.lower()
    second = second.lower()
    if first not in BEATS or second not in BEATS:
        raise ValueError("a move is rock, paper or scissors")
    if first == second:
        return "draw"
    if BEATS[first] == second:
        return "first"
    return "second"


def score(first_moves, second_moves):
    if len(first_moves) != len(second_moves):
        raise ValueError("the players must play the same number of rounds")
    counts = {"first": 0, "second": 0, "draw": 0}
    for i in range(len(first_moves)):
        counts[round_winner(first_moves[i], second_moves[i])] += 1
    return counts


if __name__ == "__main__":
    first = input()
    second = input()
    winner = round_winner(first, second)
    if winner == "draw":
        print("Draw")
    elif winner == "first":
        print("Player 1 wins")
    else:
        print("Player 2 wins")
