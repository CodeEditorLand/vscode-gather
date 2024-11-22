import * as path from "path";
import * as vscode from "vscode";

export namespace Constants {
	const folderName = path.basename(__dirname);

	export const EXTENSION_ROOT_DIR =
		folderName === "client"
			? path.join(__dirname, "..", "..")
			: path.join(__dirname, "..", "..", "..", "..");

	export const GatherExtension = "ms-python.gather";

	export const DefaultCodeCellMarker = "# %%";

	export const gatherNativeNotebookCommand =
		"gather.gatherCodeNativeNotebook";

	export const smartSelectCommand = "gather.smartSelect";

	export const gatherToScriptSetting = "gather.gatherToScript";

	export const gatherSpecPathSetting = "gather.gatherSpecPath";

	export const PYTHON_LANGUAGE = "python";

	export const defaultCellMarkerSetting = "jupyter.defaultCellMarker";

	export const hasCellsSelected = "hasCellsSelected";

	export const setContextCommand = "setContext";
}

export enum Telemetry {
	GatherIsInstalled = "DS_INTERNAL.GATHER_IS_INSTALLED",
	GatherCompleted = "DATASCIENCE.GATHER_COMPLETED",
	GatherStats = "DS_INTERNAL.GATHER_STATS",
	GatherException = "DS_INTERNAL.GATHER_EXCEPTION",
	GatheredNotebookSaved = "DATASCIENCE.GATHERED_NOTEBOOK_SAVED",
	GatherQualityReport = "DS_INTERNAL.GATHER_QUALITY_REPORT",
}

export enum OSType {
	Unknown = "Unknown",
	Windows = "Windows",
	OSX = "OSX",
	Linux = "Linux",
}

export interface SimpleCell {
	source: string[];
	type: string;
}

export interface IGatherProvider {
	logExecution(vscCell: vscode.NotebookCell): void;
	gatherCode(vscCell: vscode.NotebookCell, toScript: boolean): Promise<void>;
	smartSelect(vscCell: vscode.NotebookCell): Promise<void>;
	resetLog(): void;
	gatherWithoutKernel(
		vscCell: vscode.NotebookCell,
		toScript: boolean,
	): Promise<void>;
	smartSelectWithoutKernel(vscCell: vscode.NotebookCell): Promise<void>;
}
