def new_board():
    return [[".", ".", "."], [".", ".", "."], [".", ".", "."]]


def place(board, row, col, mark):
    return board


def winner(board):
    return None


def result(board):
    return ""


def play(path):
    return new_board()


if __name__ == "__main__":
    board = play("game.txt")
    for row in board:
        print(" ".join(row))
    print(result(board))
