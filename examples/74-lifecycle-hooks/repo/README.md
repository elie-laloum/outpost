# Lifecycle example notes

Outpost hooks can add instructions, transform model requests and responses,
inspect tools and report how a run ended. Model usage remains the original
provider usage, and transformed tool calls still require permission.

Native CLI hooks have separate typed events and decisions for each CLI.
