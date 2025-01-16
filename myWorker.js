// Register a custom typescript worker factory
self.customTSWorkerFactory = (TypeScriptWorker) => {
    /**
     * The class we're extending is found at:
     * @see{@link https://github.com/microsoft/monaco-editor/blob/a4b088e410209a27d5729713294800eba0d6b5b3/src/language/typescript/monaco.contribution.ts#L389}
     */
    return class MonacoTSWorker extends TypeScriptWorker {

        // Make the default method return nothing to avoid double completions
        getCompletionsAtPosition() {
            return {
                entries: [],
                isGlobalCompletion: false,
                isMemberCompletion: false,
                isNewIdentifierLocation: false,
            };
        }

        // Add our own method to get completions
        getMyCompletionsAtPosition(file, position) {

            /**
             * Call the language service, which is available in the parent class.
             * The method signature supports additional arguments. The type is found at:
             * @see{@link https://github.com/microsoft/TypeScript/blob/700ee076e515db2ef49d8cf7e4dc4bf70679575c/src/services/types.ts#L553}
             */
            const completions = this._languageService.getCompletionsAtPosition(file, position, {
                /**
                 * This makes the worker return completions for our modules; the type is found at:
                 * @see{@link https://github.com/microsoft/TypeScript/blob/700ee076e515db2ef49d8cf7e4dc4bf70679575c/src/services/types.ts#L763}
                 */
                includeExternalModuleExports: true,
            });

            return completions;
        }
    }
}
