# Demo of automatic import of modules in the Monaco editor

By a combination of a custom typescript worker and a completion provider,
we can provide completions for modules that are not imported in the current file,
and automatically import them when selected.


## Demo

See the demo at [https://pieterjanv.github.io/monaco-editor-module-auto-import-demo](https://pieterjanv.github.io/monaco-editor-module-auto-import-demo).


## How it works

`index.js` sets up the editor and completion provider, `myWorker.js` registers a custom typescript worker that
overrides the default completions by calling the language service method with additional options.

See the comments in the code for more details.
