import re
from collections import Counter
from datetime import datetime

MESSAGE = re.compile(r"\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\] (\w+): (.*)")


def parse_message(line):
    match = MESSAGE.fullmatch(line.strip())
    if match is None:
        return None
    moment, author, text = match.groups()
    try:
        time = datetime.strptime(moment, "%Y-%m-%d %H:%M")
    except ValueError:
        return None
    return {"day": time.strftime("%Y-%m-%d"), "hour": time.hour, "author": author, "text": text}


def read_messages(path):
    with open(path) as file:
        entries = [parse_message(line) for line in file]
    return [entry for entry in entries if entry is not None]


def ranked(counter, limit=None):
    items = sorted(counter.items(), key=lambda item: (-item[1], item[0]))
    return [[name, count] for name, count in items[:limit]]


def messages_per_author(path):
    return ranked(Counter(message["author"] for message in read_messages(path)))


def busiest_day(path):
    days = Counter(message["day"] for message in read_messages(path))
    best = max(days.values())
    return min(day for day, count in days.items() if count == best)


def mentions(path):
    names = Counter()
    for message in read_messages(path):
        names.update(re.findall(r"@(\w+)", message["text"]))
    return ranked(names)


def top_words(path, n):
    words = Counter()
    for message in read_messages(path):
        text = re.sub(r"[@#]\w+", " ", message["text"]).lower()
        words.update(word for word in re.findall(r"[a-z]+", text) if len(word) >= 4)
    return ranked(words, n)


if __name__ == "__main__":
    print(messages_per_author("chat.log"))
    print(busiest_day("chat.log"))
    print(mentions("chat.log"))
    print(top_words("chat.log", 3))
