# Demo of automatic import of modules in the Monaco editor

By a combination of a custom typescript worker and a completion provider
we can provide completions for modules that are not imported in the current file and automatically import them when selected.


## Demo

See the demo at [https://pieterjanv.github.io/monaco-editor-module-auto-import-demo](https://pieterjanv.github.io/monaco-editor-module-auto-import-demo).


## How it works

`index.js` sets up the editor, and registers a custom typescript worker and a 
completion provider.

To register a custom worker, we provide Monaco with a url
to a script, `myWorker.js`, providing a global factory function that 
returns a worker that overrides the default completions by calling the 
language service method with additional options. Monaco will call this
factory function when it needs a worker.

See the comments and follow the type hints in the code for more details.
