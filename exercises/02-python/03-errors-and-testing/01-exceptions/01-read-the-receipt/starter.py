def parse_item(line):
    name, text = line.split()
    return name, round(float(text) * 100)


def read_receipt(lines):
    return {"total": 0, "items": 0, "problems": []}


if __name__ == "__main__":
    lines = ["tea 3.50", "cake x", "", "jam 2,40", "bread 1.20 extra", "milk -1"]
    print(read_receipt(lines))
