---
description: Read students' grades from a file and write a report of their averages.
---

# Grade report

*Draws on [Reading and writing files](../../../../../notes/02-python/01-basics/04-files.md), [Loops and dictionaries](../../../../../notes/02-python/01-basics/02-loops-and-dictionaries.md) and [Ranges and lists](../../../../../notes/02-python/01-basics/03-ranges-and-lists.md).*

Each line of the file `grades.txt` has a student's name and one of their grades, separated by a space. Here are its first three lines:

```text
Max 5
Eva 3
Ada 5
```

Write three functions:

- `read_grades(path)` reads the file at `path` and returns a dictionary with each student's name and the list of their grades, as numbers, in their order in the file: `{'Max': [5, 4], 'Eva': [3, 4, 5], ...}`.
- `average_grades(grades)` takes a dictionary like that and returns one with each student's average grade: the sum of their grades divided by how many grades they have. `average_grades({'Ada': [5, 4]})` returns `{'Ada': 4.5}`.
- `write_report(averages, path)` writes the averages to the file at `path`, a line for each student, like `Ada: 4.5`, in the alphabetical order of their names.

The program under the functions reads `grades.txt`, writes the report to `report.txt` and prints it. Once your functions work, it prints:

```text
Ada: 4.5
Eva: 4.0
Max: 4.5
Zoe: 2.5
```
