"use strict";

import {
	commands,
	NotebookCell,
	NotebookCellExecutionState,
	NotebookCellExecutionStateChangeEvent,
	notebooks,
	Uri,
	window,
	workspace,
} from "vscode";

import * as localize from "./localize";
import { sendTelemetryEvent } from "./telemetry";
import { Constants, IGatherProvider, Telemetry } from "./types/types";

const gatherProviderMap = new WeakMap<Uri, IGatherProvider>();

export async function activate() {
	try {
		const gather = require("./gather") as typeof import("./gather");
		sendTelemetryEvent(Telemetry.GatherIsInstalled);
		// Register command to be executed by native notebooks.
		commands.registerCommand(
			Constants.gatherNativeNotebookCommand,
			async (cell: NotebookCell) => {
				let provider = gatherProviderMap.get(cell.notebook.uri);

				let toScript = cell.notebook.notebookType === "interactive";

				if (provider) {
					provider.gatherCode(cell, toScript);
				} else {
					let language: string;

					try {
						language = cell.document.languageId;
					} catch {
						// In case of error, default to python
						language = Constants.PYTHON_LANGUAGE;
					}

					provider = new gather.GatherProvider(language);
					gatherProviderMap.set(cell.notebook.uri, provider);
					provider.gatherWithoutKernel(cell, toScript);
				}
			},
		);

		// Register smart select command
		commands.registerCommand(
			Constants.smartSelectCommand,
			(cell: NotebookCell) => {
				let provider = gatherProviderMap.get(cell.notebook.uri);

				if (provider) {
					provider.smartSelect(cell);
				} else {
					let language: string;

					try {
						language = cell.document.languageId;
					} catch {
						// In case of error, default to python
						language = Constants.PYTHON_LANGUAGE;
					}

					provider = new gather.GatherProvider(language);
					gatherProviderMap.set(cell.notebook.uri, provider);
					provider.smartSelectWithoutKernel(cell);
				}
			},
		);

		// Create ContextKey for when a notebook has cells selected
		window.onDidChangeNotebookEditorSelection((e) => {
			if (e.selections.length > 0 && !e.selections[0].isEmpty) {
				commands.executeCommand(
					Constants.setContextCommand,
					Constants.hasCellsSelected,
					true,
				);
			} else {
				commands.executeCommand(
					Constants.setContextCommand,
					Constants.hasCellsSelected,
					false,
				);
			}
		});

		// Delete the gatherProvider when a notebook is closed.
		workspace.onDidCloseNotebookDocument((notebook) => {
			if (gatherProviderMap.has(notebook.uri)) {
				gatherProviderMap.delete(notebook.uri);
			}
		});

		notebooks.onDidChangeNotebookCellExecutionState(
			(e: NotebookCellExecutionStateChangeEvent) => {
				if (
					e.state === NotebookCellExecutionState.Idle &&
					e.cell.document.languageId === Constants.PYTHON_LANGUAGE
				) {
					let provider = gatherProviderMap.get(e.cell.notebook.uri);

					if (!provider) {
						provider = new gather.GatherProvider(
							Constants.PYTHON_LANGUAGE,
						);
						gatherProviderMap.set(e.cell.notebook.uri, provider);
					}
					provider.logExecution(e.cell);
				}
			},
		);
	} catch (e) {
		window.showErrorMessage(localize.Common.activateError(), e as string);
		sendTelemetryEvent(Telemetry.GatherException, undefined, {
			exceptionType: "activate",
		});
		console.error(e);
	}
}
