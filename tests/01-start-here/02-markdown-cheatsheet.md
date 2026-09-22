# Markdown cheatsheet

## What does `$\hat{y} = wx + b$` in a lesson turn into?

- [ ] Display math, on a line of its own
- [x] Inline math, rendered with KaTeX when the site is built
- [ ] Code in a monospace font
- [ ] Plain text, dollar signs included

Single dollar signs give inline math, and double dollar signs give display math on its own line. KaTeX renders both when the site is built.

## Which of these starts a warning callout?

- [ ] `**Warning:**` at the start of a paragraph
- [ ] `:::warning` on a line of its own
- [x] `> [!WARNING]` as the first line of a quote
- [ ] `<warning>` around the text

A callout is a quote whose first line is `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]`. GitHub understands the same syntax.

## How do you get syntax highlighting in a code block?

- [x] Write the language's name right after the opening backticks, like `python`
- [ ] Indent the code by four spaces
- [ ] Add the language to the lesson's frontmatter
- [ ] Wrap the code in `<code>` tags

The name after the opening fence tells the site which language to highlight.

## In a self-check question, why leave a blank line after `<summary>` and before `</details>`?

- [ ] So the answer starts hidden
- [x] So the answer is read as Markdown
- [ ] So the question shows up in the table of contents
- [ ] So GitHub shows the question in bold

Without the blank lines, the answer is read as raw HTML, so Markdown in it, like `**bold**` or math, isn't turned into formatting. The `<details>` element hides the answer either way.

## What does `[^cauchy]` do at the end of a sentence?

- [ ] Links to a lesson called Cauchy
- [ ] Makes the word before it superscript
- [ ] Pulls a citation from a bibliography file
- [x] Adds a numbered link to a footnote, whose text is given in a line starting with `[^cauchy]:`

The footnote's text can go anywhere in the file, and it's shown at the bottom of the page.
