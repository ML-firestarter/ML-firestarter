---
description: Read a school's score sheet with csv, keep the good rows and report the bad ones by line, then work out the averages.
---

# Messy scores

*Draws on [Modules and the standard library](../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.md) for `csv`, [Exceptions](../../../../notes/02-python/03-errors-and-testing/01-exceptions.md) for catching errors, and [Reading and writing files](../../../../notes/02-python/01-basics/04-files.md) for the file.*

The file `students.csv` has a row for each student: a name, and a score from 0 to 100 in each of three subjects, under a header row. It was typed by hand, and some rows are wrong. Finish three functions.

`read_scores(path)` reads the file with `csv.reader` and returns a pair: a dictionary of the good rows, from each student's name to the list of their scores as whole numbers, and a list of the problems, one `[line_number, message]` for each bad row, in the order of the file. Line numbers are the file's, with the header as line 1: the csv reader's `line_num` has the number of the line it has just read. The program goes on after a bad row. The checks, for each row, go in this order, and the first one that fails is the one reported:

| What's wrong                                              | The message                          |
| --------------------------------------------------------- | ------------------------------------ |
| the row doesn't have as many cells as the header          | `wrong number of columns`            |
| the name is empty, or only spaces                         | `missing name`                       |
| a score isn't a whole number, an empty cell included      | `bad score: x`, with the cell's text |
| a score is below 0 or above 100                           | `score out of range: 120`            |

Blank lines in the file are skipped without a word, and spaces around a score don't matter: `" 70 "` is 70. A name is kept without spaces around it.

`averages(scores)` takes such a dictionary and returns a dictionary from each name to the average of their scores, rounded to one decimal. `best_student(scores)` returns the name with the highest average, and the first in alphabetical order when there's a tie.

| Call                                  | Returns                                             |
| ------------------------------------- | --------------------------------------------------- |
| `read_scores("students.csv")[1][0]`   | `[3, "bad score: "]`                                |
| `averages({"cy": [100, 95, 98]})`     | `{"cy": 97.7}`                                      |

The program under the functions prints the averages, the problems and the best student of `students.csv`.

> [!TIP]
> A function that checks one row and raises a `ValueError` with the message makes the loop short: the loop catches the error, adds `[reader.line_num, str(error)]` to the problems, and carries on. `int(" 70 ")` is 70, and `int("")` and `int("x")` raise `ValueError`.
