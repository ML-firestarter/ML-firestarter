# PyTorch chapter, with a PyTorch that runs in the page

> DRAFT for approval. Not posted. Title for GitHub: **PyTorch chapter and a PyTorch for the page**

A PyTorch chapter, `notes/05-pytorch/`, that teaches the topics of the `fundamentals` folder (tensors, autograd, linear regression, MLPs, wide and deep models, an image classifier, saving and tuning models) with exercises readers solve in the page. PyTorch can't run in Pyodide, and no library that imitates it covers these topics, so the site carries a small PyTorch of its own, `src/python/torch/`, written with NumPy and checked against the real one. The code runs in the reader's browser, so there's nothing to install and nothing runs on our servers.

## Decisions

- The chapter is a top-level chapter, so like Foundations and Python it gets one exam and one certificate.
- Every lesson comes in English and Polish, with a test and 2 exercises, as in #15. Code examples in lessons can be edited and run in the page.
- **The code runs on the site's own PyTorch**, not on a local install. Pyodide 314 has NumPy, SciPy, scikit-learn and pandas, but no `torch`, `jax` or `tensorflow`. Of the 13 PyPI packages that imitate PyTorch (dezero, microtorch, minitorch, mtorch, mytorch, nanotorch, notorch, nptorch, numpytorch, puretorch, simpleTorch, tinytorch and torchlite), the three that can be plugged in as `torch` pass 0, 2 and 0 of 37 probes taken from the fundamentals scripts, so none can run the lessons.
- **It behaves like PyTorch, down to what it prints.** Tensors print the way PyTorch's do, errors say what PyTorch's say, `grad_fn` names match, and after `torch.manual_seed(42)` the random numbers are the ones PyTorch makes (the same Mersenne Twister, and PyTorch's own ways of turning it into `rand`, `randn`, `randperm` and the `DataLoader` shuffle). So the numbers in a lesson are the ones a reader gets on their computer, and "what does this code print?" exam questions are fair.
- **A local install is still the way to go further**: GPUs, convolutions, big datasets. The lessons say when, and "Python on your computer" from #15 installs Python with `uv`.
- **The data comes from the lessons.** The taxi company's receipts, made with seeded `torch.rand` and `torch.randn`, so a run gives the numbers PyTorch gives, and nothing is downloaded. The fundamentals' California housing and Fashion-MNIST need downloads the page can't make, so the image lesson uses scikit-learn's `load_digits` (8×8 images, bundled with Pyodide) and says how to swap Fashion-MNIST in on a computer.
- Exercises that return tensors are checked through `.tolist()` and rounded numbers, because a `float32` number is exact only to about 7 digits.

## The chapter

| # | Lesson | From the fundamentals | The reader |
|---|---|---|---|
| 1 | Tensors | `tensors.py` | works out a day's fares at once, standardizes a table |
| 2 | Autograd | `autograd.py` | finds the slope of any function, trains the fare line with `backward()` |
| 3 | Devices | `hardware_acceleration.py` | writes `get_device()`, moves a batch to it |
| 4 | Linear regression by hand | `linear_regression/low_level_api` | predicts with `X @ w + b`, trains for a number of epochs |
| 5 | Linear regression with `nn.Linear` | `linear_regression/high_level_api` | trains the same line with `nn.Linear`, `MSELoss` and `SGD`, and reads its parameters |
| 6 | Batches and evaluation | `models/data.py`, `training_and_evaluation/`, `torchmetrics` | makes shuffled batches with `DataLoader`, evaluates a model's RMSE over a loader |
| 7 | A network with `nn.Sequential` | `regression_mlp/regression_mlp.py` | builds an MLP from a list of sizes, counts its parameters, trains it |
| 8 | Your own modules, several inputs and outputs | `nonsequential_nn/wide_and_deep*.py` (v1 to v4) | writes a wide and deep `nn.Module`, feeds it two inputs, adds an auxiliary output |
| 9 | Classifying images | `fashion_mnist/fashion_mnist.py`, `image_classifier.py` | gets accuracy and top-k from logits, trains a classifier on digits |
| 10 | Saving, loading and tuning | `loading_model.py`, `tuning/tuning.py` | saves and loads a checkpoint, searches for a learning rate |

- Lessons 1 and 2 are written; they're the first slice, to see the pipeline work from end to end.
- Lesson 8 needs classes, so it waits for the Classes lesson of #15. Lessons 3 to 7, 9 and 10 only use functions, so they don't.
- `loguru`, `python-dotenv`, `torchvision` and Optuna aren't in Pyodide. The lessons use `print` where the fundamentals use `logger.info`, a plain random search where they use Optuna (which the lesson shows running on a computer), and no `.env` files.
- After the lessons, a workbook with about 10 exercises that mix them, as in the Python track.

That's 10 lessons, about 20 exercises, and a workbook.

## How it works

- **The page's PyTorch.** `src/python/torch/` and `src/python/torchmetrics/`: tensors, autograd, `torch.nn`, `torch.optim`, `torch.utils.data`, serialization and a few metrics. It's about 6,800 lines of Python on top of NumPy, and 61 KB gzipped. The first code that imports `torch` makes the worker load NumPy and write the files into Pyodide's file system, and every run starts with a fresh `import torch`, as in a new terminal, so the random numbers and settings of the last run don't carry over. Examples, exercises and their checks, and exam tasks all work the same way. A folder put in `src/python/` becomes a library of the same kind.
- **Checked against the real PyTorch.** `scripts/torch/cases/` has 481 small programs that use `torch` and print, `scripts/torch/golden/` holds what PyTorch 2.14.1 printed for each, and `npm run check:torch` runs them with the site's `torch` in Pyodide and fails on any difference but the last digit of a number. A GitHub Action runs it, with the exercises' checks, when the library, the harness or an exercise changes. To add a case, add it to a file in `cases/` and run `python scripts/torch/harness.py generate` on a computer with PyTorch.
- **Lessons and exercises are checked against it too.** Each lesson's examples, and each exercise's solution, were run with both libraries and print the same. Exercises are checked by `npm run check:exercises`, like all of them.
- **What it doesn't have.** No GPU (`torch.cuda.is_available()` is `False`, and `device="cuda"` fails as it does on a computer without one), no `create_graph=True`, no convolutions yet, and `torch.save` writes a file of its own, not a `.pt` that PyTorch can read. Something it doesn't have fails with an `AttributeError`, like a mistyped name.
- **In the lessons.** "How this works" gets a section on all of this, so the first lesson can link to it, and each lesson that needs the real thing says so.

## Steps

Each pull request covers both languages, updates the README and "How this works" for what it adds, and links back here.

**1. The page's PyTorch** (done, on `main-h5d3yn`)

- [x] Tensors, autograd, `nn`, `optim`, `utils.data`, serialization, `torchmetrics`
- [x] The harness (`provide`), the worker and the Node scripts that give the libraries to the code
- [x] `npm run check:torch`, its 481 cases and its GitHub Action, with PyTorch 2.14.1's answers
- [x] README: "PyTorch in the page"

**2. The chapter and its first two lessons** (done, on `main-h5d3yn`)

- [x] The chapter's introduction, and "PyTorch in the page" in How this works
- [x] Tensors and Autograd, each with a test and 2 exercises
- [x] `/pytorch/` open for comments

**3. Lessons 3 to 5** (one pull request)

- [ ] Devices, Linear regression by hand, Linear regression with `nn.Linear`

**4. Lessons 6 and 7**

- [ ] Batches and evaluation, A network with `nn.Sequential`

**5. Lesson 8, after the Classes lesson of #15**

- [ ] Your own modules, several inputs and outputs

**6. Lessons 9 and 10**

- [ ] Classifying images, Saving, loading and tuning

**7. Workbook**

- [ ] About 10 exercises that mix the lessons

**8. Exam questions** (in the exams repo)

- [ ] `05-pytorch/`, in English and Polish, including "what does this code print?" questions

## To decide

- **The data of the regression lessons.** Proposed: the taxi receipts, generated in the lessons. The alternative is California housing as in the fundamentals, which the page can't download: the data would have to be a file in the repo, and lessons can't open files, only exercises can.
- **Who maintains the page's PyTorch.** It needs a look when PyTorch changes how something prints or fails. The cases make a difference visible: regenerate `golden/` with the new version, see what fails in `npm run check:torch`, and fix `src/python/`.

## Later

- Convolutions (`Conv2d`, `MaxPool2d`) and a lesson on a CNN for the images, then attention and a small transformer.
- A check that runs every lesson's examples under Pyodide, so a change to the library can't break one without CI saying so.
- A clearer message for a PyTorch name that the page's PyTorch doesn't have yet, so a reader can tell it from a typo.
- `torch.save` that writes a real `.pt`.
