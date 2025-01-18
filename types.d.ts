type TypeScriptWorker = import('monaco-editor').languages.typescript.TypeScriptWorker;

export interface MyTypeScriptWorker extends TypeScriptWorker {
	getMyCompletionsAtPosition(fileName: string, position: number): Promise<import('typescript').CompletionInfo | undefined>;
}
