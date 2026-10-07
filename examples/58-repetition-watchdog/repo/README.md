# Repetition watchdog demo

The offline model repeatedly asks for `git status --short`. The watchdog detects
three occurrences, then stops, warns or supplies a new instruction.
