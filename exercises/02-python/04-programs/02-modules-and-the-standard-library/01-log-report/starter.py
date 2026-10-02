import json
import re
from collections import Counter
from datetime import datetime


def parse_line(line):
    return None


def read_entries(path):
    entries = []
    with open(path) as file:
        for line in file:
            entry = parse_line(line)
            if entry is not None:
                entries.append(entry)
    return entries


def busiest_hour(path):
    return 0


def report(path):
    return "{}"


if __name__ == "__main__":
    print(report("access.log"))
    print(busiest_hour("access.log"))
