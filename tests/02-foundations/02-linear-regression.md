# Linear regression

## In $\hat{y} = w x + b$, what is $b$?

- [ ] The slope of the line
- [x] The bias: where the line crosses the $y$ axis
- [ ] The learning rate
- [ ] The average error on the training data

$w$ is the weight, which sets the slope, and $b$ is the bias, which shifts the line up or down. It's the prediction when $x = 0$.

## How does mean squared error score a line?

- [ ] It adds up the gaps between predictions and labels, keeping their signs
- [ ] It counts the examples the line doesn't pass through
- [x] It averages the squared gaps between predictions and labels
- [ ] It measures how steep the line is

$L = \frac{1}{n} \sum_{i=1}^{n} (\hat{y}_i - y_i)^2$. Squaring keeps errors above and below the line from cancelling out, and it punishes big misses more than small ones. The best line has the smallest $L$.

## Why does gradient descent step *against* the gradient?

- [x] The gradient points uphill, toward a larger loss
- [ ] Stepping against it keeps the learning rate small
- [ ] The gradient points straight at the minimum, so stepping against it avoids overshooting
- [ ] Either direction lowers the loss; against it is just the convention

The gradient points where the loss grows fastest. A small step the other way lowers the loss.

## Your loss grows and jumps around from step to step. What should you try?

- [ ] Raise the learning rate
- [ ] Train for more steps
- [x] Lower the learning rate
- [ ] Remove the bias

Each step overshoots the minimum, so the learning rate is too big. A loss that barely moves means the opposite: the learning rate is too small.

## The lesson's NumPy example trains at a learning rate of 0.01. What happens at 0.05?

- [ ] It converges about five times faster
- [ ] It lands exactly on $y = 3x + 2$
- [x] It diverges: the loss grows until it overflows
- [ ] Nothing changes, because the learning rate only affects the bias

At 0.02 training converges about twice as fast. At 0.05 every step overshoots the minimum by more than the last.

## Why use gradient descent when linear regression has an exact solution?

- [x] Solving the normal equation gets expensive with many features
- [x] Most models, from logistic regression to neural networks, have no exact solution
- [ ] Gradient descent finds a better line than the normal equation
- [ ] The normal equation can't include a bias

For linear regression both find the same line, and a column of ones in $X$ handles the bias. But solving the equation gets expensive as features pile up, and most models have no exact solution at all. Gradient descent works for all of them.
