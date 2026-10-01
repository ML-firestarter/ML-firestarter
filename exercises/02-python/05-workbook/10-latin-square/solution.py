def column(grid, index):
    numbers = []
    for row in grid:
        numbers.append(row[index])
    return numbers


def is_latin_square(grid):
    size = len(grid)
    wanted = list(range(1, size + 1))
    for row in grid:
        if sorted(row) != wanted:
            return False
    for index in range(size):
        if sorted(column(grid, index)) != wanted:
            return False
    return True


def shifted_square(n):
    if n < 1:
        raise ValueError("a square needs a size of at least 1")
    square = []
    for start in range(n):
        row = []
        for place in range(n):
            row.append((start + place) % n + 1)
        square.append(row)
    return square


if __name__ == "__main__":
    size = int(input())
    grid = []
    for _ in range(size):
        row = [int(number) for number in input().split()]
        grid.append(row)
    if is_latin_square(grid):
        print("Latin square")
    else:
        print("Not a Latin square")
