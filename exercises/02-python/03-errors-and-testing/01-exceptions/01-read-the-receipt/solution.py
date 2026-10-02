def parse_item(line):
    parts = line.split()
    if len(parts) == 0:
        raise ValueError("empty line")
    if len(parts) != 2:
        raise ValueError("expected a name and a price")
    name, text = parts
    try:
        price = float(text.replace(",", "."))
    except ValueError:
        raise ValueError(f"bad price: {text}")
    if price < 0:
        raise ValueError("negative price")
    return [name, round(price * 100)]


def read_receipt(lines):
    total = 0
    items = 0
    problems = []
    for number, line in enumerate(lines, start=1):
        try:
            name, cents = parse_item(line)
        except ValueError as error:
            problems.append([number, str(error)])
        else:
            total += cents
            items += 1
    return {"total": total, "items": items, "problems": problems}


if __name__ == "__main__":
    lines = ["tea 3.50", "cake x", "", "jam 2,40", "bread 1.20 extra", "milk -1"]
    print(read_receipt(lines))
