import json


def money(cents):
    return f"{cents // 100}.{cents % 100:02d}"


class Tracker:
    def __init__(self):
        self.entries = []

    def add(self, amount_text, category, note=""):
        return 0

    def undo(self):
        return None

    def totals(self):
        return []

    def total(self):
        return 0


def desk(tracker):
    while True:
        line = input("> ")
        if line.strip().lower() == "quit":
            print("Goodbye")
            break


if __name__ == "__main__":
    desk(Tracker())
