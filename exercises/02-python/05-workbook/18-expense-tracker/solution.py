import json


def money(cents):
    return f"{cents // 100}.{cents % 100:02d}"


class Tracker:
    def __init__(self):
        self.entries = []

    def add(self, amount_text, category, note=""):
        try:
            cents = round(float(amount_text.replace(",", ".")) * 100)
        except ValueError:
            raise ValueError(f"bad amount: {amount_text}")
        if cents <= 0:
            raise ValueError("amount must be positive")
        self.entries.append((cents, category, note))
        return cents

    def undo(self):
        if not self.entries:
            raise ValueError("nothing to undo")
        return self.entries.pop()

    def totals(self):
        sums = {}
        for cents, category, note in self.entries:
            sums[category] = sums.get(category, 0) + cents
        return sorted(([category, cents] for category, cents in sums.items()), key=lambda pair: (-pair[1], pair[0]))

    def total(self):
        return sum(cents for cents, category, note in self.entries)


def run_command(tracker, line):
    words = line.split()
    if len(words) == 0:
        return None
    command = words[0].lower()
    if command == "add":
        if len(words) < 3:
            raise ValueError("usage: add AMOUNT CATEGORY [NOTE]")
        cents = tracker.add(words[1], words[2].lower(), " ".join(words[3:]))
        return f"added {money(cents)} to {words[2].lower()}"
    if command == "undo":
        cents, category, note = tracker.undo()
        return f"removed {money(cents)} from {category}"
    if command == "report":
        if not tracker.entries:
            return "no expenses"
        lines = [f"{category} {money(cents)}" for category, cents in tracker.totals()]
        lines.append(f"total {money(tracker.total())}")
        return "\n".join(lines)
    if command == "export":
        return json.dumps(dict(tracker.totals()), sort_keys=True)
    raise ValueError(f"unknown command: {words[0]}")


def desk(tracker):
    while True:
        try:
            line = input("> ")
        except EOFError:
            break
        if line.strip().lower() == "quit":
            print("Goodbye")
            break
        try:
            answer = run_command(tracker, line)
        except ValueError as error:
            print(f"Error: {error}")
        else:
            if answer is not None:
                print(answer)


if __name__ == "__main__":
    desk(Tracker())
