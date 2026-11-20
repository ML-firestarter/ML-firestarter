import re
from collections import Counter
from datetime import datetime

MESSAGE = re.compile(r"\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\] (\w+): (.*)")


def parse_message(line):
    return None


def read_messages(path):
    with open(path) as file:
        entries = [parse_message(line) for line in file]
    return [entry for entry in entries if entry is not None]


def ranked(counter, limit=None):
    items = sorted(counter.items(), key=lambda item: (-item[1], item[0]))
    return [[name, count] for name, count in items[:limit]]


def messages_per_author(path):
    return []


def busiest_day(path):
    return ""


def mentions(path):
    return []


def top_words(path, n):
    return []


if __name__ == "__main__":
    print(messages_per_author("chat.log"))
    print(busiest_day("chat.log"))
    print(mentions("chat.log"))
    print(top_words("chat.log", 3))
