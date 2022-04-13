import * as fs from 'fs';
import * as vscode from 'vscode';
import { ExternalBrowser } from './externalBrowser';

export function activate(context: vscode.ExtensionContext) {
	let externalBrowser: ExternalBrowser = new ExternalBrowser(context);

	console.log('Quickhelp is now active!');

	if (!fs.existsSync(context.globalStorageUri.fsPath)) {
		fs.mkdirSync(context.globalStorageUri.fsPath, { recursive: true });
	}
	
	context.subscriptions.push(vscode.commands.registerCommand('quickhelp.search', () => {
		vscode.window.showInputBox({ placeHolder: 'Search text', value: 'Search Term' })
			.then((value) => {
				if (value !== undefined)
				 externalBrowser.open(value);
			});
	}));
	context.subscriptions.push(vscode.commands.registerCommand('quickhelp.quickSearch', () => {
		let allDiagnostics = vscode.languages.getDiagnostics();
		let errorMessages: string[] = [];
		let allErrorMessages: string[] = [];

		// append every error to allErrorMessages
		allDiagnostics.forEach((value) => {
			value[1].forEach((value) => {
				let error: string = value.message;
				if (value.source !== undefined) {
					error += ' ' + value.source;
				}

				allErrorMessages.push(error);
			});
		});
		// Check if there are any errors
		if (allErrorMessages.length === 0) {
			return vscode.window.showInformationMessage('There are currently no errors!');
		}

		const uri = vscode.window.activeTextEditor?.document.uri;
		// Check if no editor is opened
		if (uri !== undefined) {
			let diagnostics = vscode.languages.getDiagnostics(uri!);
			// append every error in the current document to errorMessages
			diagnostics.forEach((value) => {
				let error: string = value.message;
				if (value.source !== undefined) {
					error += ' ' + value.source;
				}
				errorMessages.push(error);
			});
		}
		errorMessages.push('All...');

		vscode.window.showQuickPick(errorMessages)
			.then((selection) => {
				if (selection === 'All...') {
					vscode.window.showQuickPick(allErrorMessages)
						.then((selection) => {
							if (selection !== undefined)
								externalBrowser.open(selection);
						});
				}
				else if (selection !== undefined)
					externalBrowser.open(selection);
			});
	})
	);
}

export function deactivate() { }

function copyFile(context: vscode.ExtensionContext, path: string, targetName: string){
	if(!fs.existsSync(context.globalStorageUri.path + targetName)){
		fs.copyFileSync(path,  context.globalStorageUri.path + targetName);
	}
}