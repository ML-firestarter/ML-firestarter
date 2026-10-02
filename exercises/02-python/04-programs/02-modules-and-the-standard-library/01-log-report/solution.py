import json
import re
from collections import Counter
from datetime import datetime

LINE = re.compile(r"(\S+ \S+) (GET|POST) (\S+) (\d{3}) (\d+)ms")


def parse_line(line):
    match = LINE.fullmatch(line.strip())
    if match is None:
        return None
    moment, method, path, status, ms = match.groups()
    try:
        time = datetime.strptime(moment, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return None
    return {"time": time, "method": method, "path": path, "status": int(status), "ms": int(ms)}


def read_entries(path):
    entries = []
    with open(path) as file:
        for line in file:
            entry = parse_line(line)
            if entry is not None:
                entries.append(entry)
    return entries


def busiest_hour(path):
    hours = Counter(entry["time"].hour for entry in read_entries(path))
    best = max(hours.values())
    return min(hour for hour, count in hours.items() if count == best)


def report(path):
    entries = read_entries(path)
    paths = Counter(entry["path"] for entry in entries)
    top = sorted(paths.items(), key=lambda item: (-item[1], item[0]))[:2]
    slowest = max(entries, key=lambda entry: entry["ms"])
    summary = {
        "requests": len(entries),
        "errors": sum(1 for entry in entries if entry["status"] >= 500),
        "slowest": slowest["path"],
        "top_paths": [list(item) for item in top],
    }
    return json.dumps(summary, sort_keys=True)


if __name__ == "__main__":
    print(report("access.log"))
    print(busiest_hour("access.log"))
