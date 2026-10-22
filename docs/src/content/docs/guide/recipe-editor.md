---
title: "Edit recipes visually"
description: "Build, check and run a YAML recipe from a local web editor."
---

`outpost recipe editor` opens a local web application that edits your recipe and execution configuration as a task graph, checks them as you type and runs them. It writes the same YAML files you would edit by hand, so the editor and your text editor can take turns on one project.

## Start the editor

Run the command from the directory that holds your recipe, or point `--directory` at it. The editor serves only that directory and opens your browser on a loopback address.

```sh
npx outpost recipe editor --file recipe.yaml --config outpost.yaml
```

The terminal prints the address, for example `http://127.0.0.1:41873/#token=…`, and keeps the editor running until you press Ctrl+C. If the files do not exist yet, the open dialog offers starters, such as local commands in a temporary workspace; nothing is written until you save. The [recipe CLI reference](../recipe-cli/#outpost-recipe-editor) lists the flags.

## Edit the graph and the YAML

The toolbar switches between five views of the same drafts. Every view validates the drafts after each change and lists problems in the status bar.

| View          | What you do there                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Canvas        | Add tasks from the palette, connect dependencies, rename tasks and edit their options in the panel. |
| Recipe YAML   | Edit the recipe text directly; problems are underlined at their line.                               |
| Configuration | Edit workspace, sandbox, agents, environment and extensions with forms, or the whole YAML.          |
| Plan          | Read the static plan `outpost recipe plan` would print for the unsaved drafts.                      |
| Runs          | Start, follow, stop and resume runs, and answer what they wait for.                                 |

Canvas and form changes rewrite only the YAML values they touch: comments, key order and formatting elsewhere stay as they were. New tasks are placed automatically; once you move a node, its position is saved in `recipe.editor.json` next to the recipe, which you can commit or ignore. Ctrl+Z undoes a change, Ctrl+Shift+Z redoes it and Ctrl+S saves both files. When a file changes on disk while you edit, the editor offers to reload it and replaces it only after you confirm.

The canvas and forms edit recipe format 3 and configuration version 3. Other formats open read-only on the canvas and stay editable in the YAML views. A plain string written over several lines is put back on one line when a structured edit rewrites the file; quote it or use a block scalar (`|` or `>`) to keep its line breaks.

## Add and verify extensions

The Extensions page of the configuration lists declared [extensions](../recipe-extensions/) and their modules. New extension declares `extensions.<name>` for the kind and contract you choose, optionally adds a `functions.<name>` alias for call and loop tasks, and creates the module with a starting export when the file does not exist. Select an extension to edit its module, then save it with Ctrl+S.

Validation never imports extensions. Verify saves the drafts, then runs this command in a separate process and reports the extensions it loaded or the first export it could not accept:

```sh
npx outpost recipe validate --file recipe.yaml --config outpost.yaml --extensions
```

Verifying executes the code of every declared module, as a run would. Use it on modules you trust.

## Run and follow a recipe

Run saves the drafts, asks for the recipe inputs and starts `outpost recipe run` on the saved files in a separate process. The run uses the sandbox and agents of your configuration, so it can change files and spend model usage exactly like the same command in a terminal.

While it runs, each task on the canvas shows its status and the Runs view shows the event log. Stop asks the run to cancel: the CLI releases its sandbox and exits with status 143; stopping a second time ends the process. On Windows, Stop ends the process immediately. Only one run is active at a time.

Each run is kept under `.outpost/editor/runs/` with its events, final report and error output. The editor writes a `.gitignore` in `.outpost/editor/` so this history stays out of Git.

## Answer questions and gates

A [durable recipe](../recipe-durability/) that pauses keeps its state in the checkpoint. When a run stops on a dialogue question or an unsigned gate, the Runs view shows it under Waiting for you. Answering, approving or rejecting starts `outpost recipe answer` or `outpost recipe decide` with the same run ID; Resume continues a run, optionally replaying interrupted tasks.

A signed gate needs a decision with its proof. The editor shows the `outpost recipe decide` command to submit it and never creates or bypasses that proof. A recipe without `workflow.checkpoint` cannot be resumed: its questions stay visible, but the run must start again.

## What the editor can reach

The editor is meant for the person running it, on the same machine. It listens only on `127.0.0.1`, on a random port unless you choose one. Each start creates a random token carried in the address fragment; the page sends it with every request, and requests from another host or origin are refused. Treat the address like a password while the editor runs.

Reads and writes stay inside the editor directory: paths with `..`, symbolic links that lead outside and `.git` are refused. Editing never executes your code. Code runs only when you verify extensions or start a run, and run events reach the page after the run has redacted the secret values it resolved.
