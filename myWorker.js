/**
 * Create a custom typescript worker factory
 * @param {import('./types').TypeScriptWorker} TypeScriptWorker 
 * @returns {typeof import('./types').MyTypeScriptWorker}
 */
const customTSWorkerFactory = (TypeScriptWorker) => {
    return class MyTypeScriptWorker extends TypeScriptWorker {

        // Make the default method return nothing to avoid double completions
        getCompletionsAtPosition() {
            return undefined;
        }

        /**
         * Add our own method to get completions
         * @type {import('./types').MyTypeScriptWorker['getMyCompletionsAtPosition']}
         */
        getMyCompletionsAtPosition(file, position) {

            /**  @type {import('typescript').LanguageService} */
            const languageService = this.getLanguageService();

            // Call the language service, which is available in the parent class
            return languageService.getCompletionsAtPosition(file, position, {
                // This makes the worker return completions for our modules
                includeExternalModuleExports: true,
            });
        }
    }
}

// Register the custom worker factory
self.customTSWorkerFactory = customTSWorkerFactory;
