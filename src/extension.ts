import * as vscode from 'vscode';
import translateFun from './translate';

export function activate(context: vscode.ExtensionContext) {
    // add transtale method
    translateFun();
}

// this method is called when your extension is deactivated
export function deactivate() {
}