# PGD

## What does PGD do that FGSM doesn't?

- [ ] It steps along the slope itself, where FGSM uses its sign
- [x] It takes many small steps, with new slopes for each, and projects the picture back into the ball after every step
- [ ] It changes the network's weights as well as the picture
- [ ] It lets the pixels move further than ε

FGSM measures the slopes once, at the picture, and follows them to the edge of the ball. A network bends, so the slopes are different along the way. PGD measures them again before each small step, and the projection keeps the picture within ε of where it started, the same ball as FGSM's.

## A pixel started at 0.4. After a step of PGD with ε = 0.1, it's at 0.27. Where does the projection put it?

- [ ] At 0.27
- [x] At 0.3
- [ ] At 0.4
- [ ] At 0.17

The pixel is 0.13 below where it started, which is more than ε, so it comes back to exactly ε below: 0.4 − 0.1 = 0.3. A pixel that's within ε of its start is left where it is.

## Which line brings `X_adv` back into the ε-ball around `X`, with pixels that are valid?

- [ ] `X_adv.clamp(-epsilon, epsilon).clamp(0, 1)`
- [ ] `(X_adv - X).clamp(-epsilon, epsilon)`
- [x] `(X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)`
- [ ] `X_adv.clamp(0, epsilon)`

The ball is around `X`, so it's the differences `X_adv - X` that are clamped to between −ε and ε, and then added back to `X`. The last `clamp(0, 1)` keeps every pixel a pixel. Clamping `X_adv` itself to between −ε and ε would be a ball around a white picture.

## PGD with ε = 0.1 and α = 0.025 takes 3 steps, starting from the picture itself. What's the furthest that a pixel can end up from where it started?

- [ ] 0.1
- [x] 0.075
- [ ] 0.025
- [ ] 0.3

Each step moves a pixel by α, so three steps move it by 0.075 at most. That's short of the edge of the ball, so part of the ball is never tried, and the network looks more robust than it is. The steps times α should come to well over ε.

## Why does PGD usually start from a random picture inside the ball?

- [ ] Because the picture itself isn't inside the ball
- [ ] To make the attack faster
- [x] Because the slopes right at the picture can be poor guides, and different starts can end at different pictures
- [ ] So that the attack doesn't need the labels

Right at the picture, the slopes can be misleading, or even 0. And as each start can lead somewhere else, the attack can be run several times, with a picture counted as fooled when any of the runs fools it. The picture itself is always inside its own ball.

## A network keeps an accuracy of 80% under FGSM with ε = 8/255. What does that say about its accuracy under attack for that ε?

- [ ] It's exactly 80%
- [ ] It's 80% or more
- [x] It's 80% at most: a stronger attack, like PGD, may fool more of the pictures
- [ ] Nothing, because FGSM doesn't stay inside the ball

An accuracy under attack only says what one attack couldn't do. FGSM is a weak attack, and whatever it fools, a stronger attack in the same ball can fool too, and usually more. So the number to trust is the one from the strongest attack that was tried.

## In adversarial training, what happens to each batch before the network learns from it?

- [ ] Random changes of size ε are added to it
- [x] It's attacked, against the network as it is at that moment
- [ ] It's attacked, against the network as it was before the training began
- [ ] Nothing: the attack comes after the training, to measure it

Every batch is attacked with a few steps of PGD against the current weights, and the network then learns from the attacked pictures with their right labels. The weights change with every step of the optimizer, so the attack has to be made anew for every batch.

## What does adversarial training cost?

- [ ] Nothing: the network gets better on every kind of picture
- [ ] All of its accuracy on untouched pictures
- [x] Some accuracy on untouched pictures, and several times the training time
- [ ] A bigger network, since the attack needs weights of its own

On the digits, the network trained on attacked pictures read 68% under PGD, against 51% for the plain one, and 90% of the untouched pictures, against 94%. And each step of the optimizer came after 5 steps of the attack, so the training took several times as long.
