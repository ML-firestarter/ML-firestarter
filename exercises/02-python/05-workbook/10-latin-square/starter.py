def column(grid, index):
    return []


def is_latin_square(grid):
    return False


def shifted_square(n):
    return []


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
