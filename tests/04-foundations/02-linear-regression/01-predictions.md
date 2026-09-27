# Making predictions

## By the sticker's rule, €8 to start and €3 per kilometer, what does a 6 km ride cost?

- [x] 26
- [ ] 18
- [ ] 51
- [ ] 66

6 × 3 = 18 for the distance, plus 8 to start: 26. 18 leaves out the starting fee, 51 swaps the two prices, 6 × 8 + 3, and 66 charges both prices for every kilometer, 6 × (3 + 8).

## Which symbol in $\hat{y} = wx + b$ is the taxi's starting fee?

- [x] $b$, the bias
- [ ] $w$, the weight
- [ ] $x$, the feature
- [ ] $\hat{y}$, the prediction

The starting fee is the fare for 0 km, and $b$ is the prediction when $x = 0$. $w$ is the price per km, $x$ the distance, and $\hat{y}$ the predicted fare.

## The starting fee goes up from 8 to 10, and the price per km stays 3. What happens to the line?

- [x] It moves up by 2 and stays as steep as before
- [ ] It gets steeper
- [ ] It moves up by 2 and gets steeper
- [ ] It moves right by 2

The bias adds the same amount to every fare, so every point of the line goes up by 2. How steep the line is depends only on $w$.

## Two receipts from rides without any waiting: 2 km for 13, and 6 km for 25. What's the price per km?

- [x] 3
- [ ] 6.5
- [ ] About 4.17
- [ ] 12

The second ride was 4 km longer and cost 12 more, so each kilometer costs 12 ÷ 4 = 3. Dividing a fare by its distance, like 13 ÷ 2 = 6.5 or 25 ÷ 6 ≈ 4.17, counts the starting fee as if it were paid for the distance, and 12 is the difference in fares before it's divided by the difference in distances.

## With the waiting as a second feature, the fare is $\hat{y} = 3x_1 + 0.5x_2 + 8$, where $x_1$ is the distance in km and $x_2$ the minutes of waiting. What does a 10 km ride with 4 minutes of waiting cost?

- [x] 40
- [ ] 38
- [ ] 50
- [ ] 32

10 × 3 = 30 for the distance, 4 × 0.5 = 2 for the waiting, and 8 to start: 40. 38 leaves out the waiting, 32 the starting fee, and 50 charges the minutes at the price per km.
