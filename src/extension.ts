import * as vscode from 'vscode';
import translateFun from './translate';

export function activate(context: vscode.ExtensionContext) {
    // 加入翻译功能
    translateFun();
}

// this method is called when your extension is deactivated
export function deactivate() {
}