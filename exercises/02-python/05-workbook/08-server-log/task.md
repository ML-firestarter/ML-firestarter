---
description: Sort the lines of a server log by level, find the most severe level, and write a report.
---

# Server log

*Draws on [Reading and writing files](../../../../notes/02-python/01-basics/04-files.md), [Ranges and lists](../../../../notes/02-python/01-basics/03-ranges-and-lists.md), for returning from a loop, and [Lists of lists](../../../../notes/02-python/01-basics/05-lists-of-lists.md), for slices and `join()`.*

A server writes what happens to the file `server.log`, a line for each event: its level, which is `ERROR`, `WARN`, `INFO` or `DEBUG`, and then a message of one or more words. Here are its first three lines:

```text
INFO server started
INFO listening on port 8080
WARN disk almost full
```

Write three functions:

- `read_log(path)` reads the file at `path` and returns a dictionary with each level found in it and the list of its messages, in the order they have in the file: `{'INFO': ['server started', 'listening on port 8080', ...], 'WARN': ['disk almost full', ...]}`.
- `worst_level(log)` takes a dictionary like that and returns the most severe level that has messages in it. The editor has the list `LEVELS`, from the most severe level to the least severe. For an empty log there's no level to return, so it returns `None`.
- `write_report(log, path)` writes a report to the file at `path`. For each level that has messages, from the most severe one, it writes a line with the level and the number of its messages, like `WARN (2)`, and then a line for each message, which starts with `- `. Levels without messages aren't in the report.

| Call                                          | Returns   |
| --------------------------------------------- | --------- |
| `worst_level({'INFO': ['a'], 'WARN': ['b']})` | `'WARN'`  |
| `worst_level({'DEBUG': ['a']})`               | `'DEBUG'` |
| `worst_level({})`                             | `None`    |

The program under the functions reads `server.log`, writes the report to `report.txt` and prints it. Once your functions work, the report starts like this:

```text
ERROR (2)
- cannot open database
- disk write failed
WARN (2)
```

The checks use two more files: `quiet.log`, which has no errors or warnings, and `empty.log`, which has no lines at all.
