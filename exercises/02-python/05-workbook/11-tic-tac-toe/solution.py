def new_board():
    return [[".", ".", "."], [".", ".", "."], [".", ".", "."]]


def place(board, row, col, mark):
    if mark != "X" and mark != "O":
        raise ValueError(f"{mark} isn't X or O")
    if row < 0 or row > 2 or col < 0 or col > 2:
        raise ValueError("that cell isn't on the board")
    if board[row][col] != ".":
        raise ValueError("that cell is taken")
    copy = [line[:] for line in board]
    copy[row][col] = mark
    return copy


def winner(board):
    lines = []
    for index in range(3):
        lines.append(board[index])
        lines.append([board[0][index], board[1][index], board[2][index]])
    lines.append([board[0][0], board[1][1], board[2][2]])
    lines.append([board[0][2], board[1][1], board[2][0]])
    for line in lines:
        if line[0] != "." and line[0] == line[1] and line[1] == line[2]:
            return line[0]
    return None


def result(board):
    mark = winner(board)
    if mark == "X" or mark == "O":
        return f"{mark} wins"
    for row in board:
        for cell in row:
            if cell == ".":
                return "Game not finished"
    return "Draw"


def play(path):
    board = new_board()
    with open(path) as file:
        for line in file:
            mark, row, col = line.split()
            board = place(board, int(row), int(col), mark)
            champion = winner(board)
            if champion == "X" or champion == "O":
                return board
    return board


if __name__ == "__main__":
    board = play("game.txt")
    for row in board:
        print(" ".join(row))
    print(result(board))
