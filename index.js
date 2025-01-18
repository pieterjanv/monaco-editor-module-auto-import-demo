import './node_modules/@monaco-editor/loader/lib/umd/monaco-loader.min.js';

const appUrl = `${location.origin}${location.pathname.replace(/\/$/, '')}`;

/** @type {import('@monaco-editor/loader')['default']} */
const loader = monaco_loader;

loader.config({ paths: {
	vs: `${appUrl}/node_modules/monaco-editor/min/vs`,
} });

// Initialize monaco
const monaco = await loader.init();

// Declare a dummy module "myModule".
// We wrap the exports in a module declaration to provide completions when
// writing the import statement, as well as allow monaco
// to provide us with the correct specifier when generating completions.
monaco.editor.createModel(
`declare module "myModule" {
	export type MyType = 'myValue';
	export const myValue = 'myValue';
}`,
	'typescript',
	monaco.Uri.file('/myModule.d.ts'),
);

// Create script to load in the editor
const content = `/**
 * This application demonstrates how to implement auto-import of modules in the Monaco editor.
 * Implemented using a custom typescript worker and a custom completion item provider.
 * Find the code at https://github.com/pieterjanv/monaco-editor-module-auto-import-demo.
 *
 * Try to use \`myValue\` or \`MyType\`.
 */

`;
const myScript =  monaco.editor.createModel(
	content,
	'typescript',
	monaco.Uri.file('/myScript.ts'),
);

// Create the editor
const myEditor = monaco.editor.create(document.getElementById("container"), {
	value: myScript.getValue(),
	language: "typescript",
	automaticLayout: true,
	theme: 'vs-dark',
});
myEditor.setPosition({ lineNumber: [...content].filter(v => v === '\n').length, column: 1 });
myEditor.focus();

// Register the custom worker
monaco.languages.typescript.typescriptDefaults.setWorkerOptions({
	customWorkerPath: `${appUrl}/myWorker.js`,
});

// Get the registered worker and register the custom completion provider
monaco.languages.typescript.getTypeScriptWorker()
	.then(tsWorker => tsWorker())
	.then(/** @param {import('./types.d.ts').MyTypeScriptWorker} worker */ worker => {

		// Register the custom completion provider
		monaco.languages.registerCompletionItemProvider('typescript', {
	
			async provideCompletionItems(model, position) {
	
				// Call our own completions method on the worker
				const completions = await worker.getMyCompletionsAtPosition(
					model.uri.toString(),
					model.getOffsetAt(position),
				);

				// Get range of the word to be replaced
				// This is important for the scoring of the completions
				const wordAtPosition = model.getWordAtPosition(position);
				const range = wordAtPosition
					? new monaco.Range(
						position.lineNumber, wordAtPosition.startColumn,
						position.lineNumber, wordAtPosition.endColumn,
					)
					: new monaco.Range(
						position.lineNumber, position.column,
						position.lineNumber, position.column,
					);

				// Create the suggestions
				const suggestions = (completions?.entries ?? []).reduce(
					/**
					 * @param {import('monaco-editor').languages.CompletionItem[]} acc 
					 * @param {import('typescript').CompletionEntry} completion 
					 */
					(acc, completion) => {
		
						/** @type {import('monaco-editor').languages.CompletionItem} */
						const suggestion = {
							label: {
								label: completion.name,
								description: completion.data?.moduleSpecifier,
							},
							// You can use the completion kind to determine the icon
							kind: monaco.languages.CompletionItemKind.Variable,
							insertText: completion.insertText ?? completion.name,
							range,
							incomplete: true,
						};
		
						// Add the import statement if the completion has a moduleSpecifier
						// The simplest possible implementation is used here;
						// simply add the import statement at the top of the file
						if (completion.data?.moduleSpecifier) {
							suggestion.additionalTextEdits = [{
								range: new monaco.Range(
									1, 1,
									1, 1,
								),
								text: `import { ${completion.insertText ?? completion.name} } from '${completion.data?.moduleSpecifier}';\n`,
							}];
						}
		
						acc.push(suggestion);
		
						return acc;
					},
					[],
				);
	
				return { suggestions, incomplete: true };
			},
		})
	});

// Set some necessary compiler options (and some optional ones)
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
	...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
	module: monaco.languages.typescript.ModuleKind.ESNext,
	moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
	target: monaco.languages.typescript.ScriptTarget.ESNext,
	strict: true,
	noLib: false,
	allowNonTsExtensions: true,
	noEmit: true,
	baseUrl: './',
});
