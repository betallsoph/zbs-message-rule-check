# 05 - AI Usage Note

I used AI as a coding and structuring assistant for Challenge 2.

AI helped me:

- Read and summarize the ZBS moderation rules into a rule map.
- Compare official rules with the sample rejection reasons in `Json Template.xlsx`.
- Decide which rules are safe and useful to automate from JSON.
- Convert prioritized rules into TypeScript checks, mostly regex and JSON tree traversal.
- Draft documentation explaining why some rules are left for human review.

I did not use AI to claim full moderation coverage. The final tool intentionally validates only a prioritized subset, because the assignment asks for prioritization and several ZBS rules require business context, ownership documents, transaction history, image review, or human judgment.

