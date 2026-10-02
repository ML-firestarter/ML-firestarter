---
description: Read a web server's log with re, datetime, Counter and json, and report how busy it was.
---

# Log report

*Draws on [Modules and the standard library](../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.md) for `re`, `datetime`, `Counter` and `json`, and on [Reading and writing files](../../../../notes/02-python/01-basics/04-files.md) for reading a file.*

A web server writes one line to its log for every request it gets. The file `access.log` has lines like these, with a time, a method, a path, a status code and how long the answer took:

```text
2024-03-05 09:12:44 GET /home 200 35ms
2024-03-05 10:02:33 GET /exercises 500 410ms
```

A few lines in the file are damaged: some aren't log lines at all, and one has a time that doesn't exist. The code already imports what it needs, and `read_entries(path)` is written: it reads a file and keeps the entries that `parse_line` could make. Finish three functions:

- `parse_line(line)` returns a dictionary for a log line, with the keys `"time"` (a `datetime`), `"method"` (`"GET"` or `"POST"`), `"path"`, `"status"` (a whole number) and `"ms"` (a whole number, without the `ms`). It returns `None` for a line that isn't in this form: another method, a status that isn't 3 digits, text that isn't a log line at all, or a time that can't exist, like 25:99:99. A newline at the end of the line is fine.
- `busiest_hour(path)` returns the hour of the day, 0 to 23, with the most requests. When two hours are tied, it returns the earlier one.
- `report(path)` returns a JSON text, made by `json.dumps(..., sort_keys=True)`, of a dictionary with `"requests"` (how many entries), `"errors"` (how many have a status of 500 or more), `"slowest"` (the path of the slowest request) and `"top_paths"` (the two most requested paths, as lists of the path and its count, the most requested first, and paths with the same count in alphabetical order).

| Call                                              | Returns                                  |
| ------------------------------------------------- | ---------------------------------------- |
| `parse_line("2024-03-05 09:12:44 GET /home 200 35ms")["ms"]` | `35`                          |
| `parse_line("this line is not a log entry")`      | `None`                                   |
| `busiest_hour("access.log")`                      | `10`                                     |

The program under the functions prints the report and the busiest hour, so **Run** shows what your functions make of the file.

> [!TIP]
> A regular expression can describe a whole line: `re.fullmatch(r"(\S+ \S+) (GET|POST) (\S+) (\d{3}) (\d+)ms", line)` gives `None` when the line doesn't fit, and `.groups()` the five pieces when it does. `datetime.strptime(text, "%Y-%m-%d %H:%M:%S")` raises a `ValueError` for a time that can't exist.
