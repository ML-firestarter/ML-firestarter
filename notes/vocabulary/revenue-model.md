---
description: How a business makes money, meaning who pays, for what, and how the price is set.
---

# Revenue model

A revenue model answers three questions: who pays, what they pay for, and how the price is set. The same product can be sold in different ways.

Common revenue models for AI products:

- **Subscription**: a flat monthly or yearly fee, like a consumer chat plan.
- **Usage-based pricing**: pay for what you use. AI APIs usually charge per million [tokens](token.md), with output tokens costing more than input tokens.
- **Per-seat pricing**: a fee for each user, common in business plans.
- **Enterprise contracts**: negotiated deals with volume discounts, support and guarantees such as data privacy.
- **Freemium**: a free tier that brings users in, with limits that nudge heavy users to pay.
- **Advertising**: the product is free to use and advertisers pay to reach its users.

AI products have an unusual cost structure. Serving one more user of traditional software costs almost nothing, but every AI response takes GPU time to generate (see [inference](inference.md)). That's why AI pricing often follows usage, why flat subscriptions come with usage limits, and why gross margin, the share of revenue left after paying for what was sold, gets so much attention.

**Example:** a chat app charges \$20 a month, and each message costs it about \$0.004 of GPU time to answer. A user who sends 30 messages a day costs about \$3.60 a month to serve (30 × 30 × \$0.004), a gross margin of 82%. A user who sends 1,000 messages a day costs \$120 a month, six times what they pay.

**Related:** [Inference](inference.md) · [Token](token.md)
