# Measuring the error

## A line predicts a fare of 20, and the receipt says 23. What's the error $\hat{y} - y$?

- [x] −3
- [ ] 3
- [ ] 9
- [ ] 43

The error is the prediction minus the real fare: 20 − 23 = −3. It's negative because the prediction was too low. 3 subtracts the other way round, and 9 is the error squared, which comes a step later.

## A line's errors on three rides are 1, −2 and 1. What's its MSE?

- [x] 2
- [ ] 0
- [ ] 6
- [ ] 1.33

Squared, the errors are 1, 4 and 1, which add up to 6, and 6 ÷ 3 rides = 2. The errors themselves add up to 0, as the −2 cancels out the two 1s, 6 is the sum of the squares before it's divided by the number of rides, and 1.33 averages the errors without their signs instead of their squares.

## Why are the errors squared before they're averaged?

- [x] So that errors that are too high and too low can't cancel out
- [x] So that big misses count for more than small ones
- [ ] So that the MSE is in euros, like the fares
- [ ] So that the MSE is always a whole number

A square is never negative, so nothing cancels out, and an error of 10 adds 100 while an error of 2 only adds 4. The MSE is in squared euros, not euros, and it's often not a whole number.

## What does the usual baseline predict for every ride?

- [x] The average fare on the receipts
- [ ] The fare of the shortest ride
- [ ] 0
- [ ] The fare that the sticker's rule predicts

The baseline ignores its input, so it predicts the same fare for every ride, and of all such flat lines, the one at the average fare has the lowest MSE. A model has to score better than the baseline to show that it learned something from its input.

## On the day receipts, the best line has a starting fee of 10, not the sticker's 8. Why?

- [x] The receipts don't show the waiting, so the line adds its average cost, 2, to every fare
- [ ] The sticker's prices are wrong
- [ ] The MSE always makes the bias a little bigger
- [ ] Longer rides cost less per kilometer

The four day rides waited 4 minutes on average, and 4 minutes at €0.50 a minute is 2. The line can't see the waiting, so the best it can do is add its average cost to every fare. With the minutes as a second feature, the model would find the sticker's prices.
