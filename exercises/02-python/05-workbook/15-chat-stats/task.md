---
description: Read a chat log with re, datetime and Counter, and find who talks most, which day was busiest, who gets mentioned and the common words.
---

# Chat stats

*Draws on [Modules and the standard library](../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.md) for `re`, `datetime` and `Counter`, and on [Reading and writing files](../../../../notes/02-python/01-basics/04-files.md) for the file.*

The file `chat.log` has a line for each message of a study group's chat, like this:

```text
[2024-03-04 09:12] ann: Good morning @bob, did you read the python lesson? #python
```

Some lines are damaged: one isn't a message at all, and one has a time that can't exist. `read_messages(path)` is written for you. It reads the file and keeps the messages that `parse_message` could make, in order, and `ranked(counter, limit=None)` turns a `Counter` into `[name, count]` pairs, the biggest count first, and alphabetically when counts are equal. Finish five functions:

- `parse_message(line)` returns a dictionary with `"day"` (like `"2024-03-04"`), `"hour"` (a whole number, 0 to 23), `"author"` and `"text"`, or `None` for a line that isn't a message: it has to be `[date time] author: text`, with an author name of letters, digits and underscores, and a time that exists. A newline at the end is fine, and the text can have colons in it.
- `messages_per_author(path)` returns `[author, count]` pairs, ranked.
- `busiest_day(path)` returns the day with the most messages, and the earlier one when two days tie.
- `mentions(path)` returns `[name, count]` pairs, ranked, for the names that follow an `@` in the messages' texts.
- `top_words(path, n)` returns the `n` most common words, ranked, as `[word, count]` pairs. Words are runs of letters, in lowercase, and only words of 4 letters or more count. `@mentions` and `#tags` are left out before the words are found.

| Call                                | Returns                                                         |
| ----------------------------------- | --------------------------------------------------------------- |
| `busiest_day("chat.log")`           | `"2024-03-04"`, which ties with the next day, and comes first   |
| `mentions("chat.log")[0]`           | `["bob", 3]`                                                    |
| `top_words("chat.log", 2)`          | `[["great", 6], ["lesson", 4]]`                                 |

The program under the functions prints all four results for `chat.log`.

> [!TIP]
> `re.sub(r"[@#]\w+", " ", text)` takes mentions and tags out of a text, and `re.findall(r"[a-z]+", text.lower())` gives its words. `Counter.update()` adds the items of a list to a counter's counts, so one counter can go through every message.
