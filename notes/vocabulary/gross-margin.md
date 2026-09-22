---
description: The share of revenue left after paying the direct cost of delivering what was sold.
---

# Gross margin

Gross margin is the share of revenue left after paying for what was sold:

$$
\text{gross margin} = \frac{\text{revenue} - \text{cost of goods sold}}{\text{revenue}}
$$

Cost of goods sold (COGS) is what it costs to deliver the product itself. For software that's mostly hosting, and for AI products mostly GPU time for [inference](inference.md), plus things like customer support. Salaries for research, sales and marketing don't count here; they're paid out of the gross profit that's left.

Traditional software companies often have gross margins of 70–90%, because serving one more customer costs almost nothing. AI products usually have lower margins, because every response takes computation, and a heavy user can cost more to serve than they pay. That makes the [revenue model](revenue-model.md) and pricing (usage limits, per-token prices) as important as the product.

Gross margin also shapes [unit economics](unit-economics.md): what counts is the gross profit a customer brings in, not their revenue.

**Example:** an AI writing app earns \$1 million in a quarter. It pays \$350,000 for model API calls and \$50,000 for hosting and support. Its gross profit is \$600,000, a gross margin of 60%.

**Related:** [Revenue model](revenue-model.md) · [Unit economics](unit-economics.md) · [Inference](inference.md) · [ARR](arr.md)
