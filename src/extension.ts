'use strict';
import * as vscode from 'vscode';
import { writeFile, exists } from 'fs';
import { join } from 'path';

function PadLeft(text: string, padChar: string, size: number): string {
    return (String(padChar).repeat(size) + text).substr((size * -1), size);
}

export function activate(context: vscode.ExtensionContext) {

    function registerCommand(name: string, callback: (...args: any[]) => any) : void {
        context.subscriptions.push(
            vscode.commands.registerCommand(name, callback));
    }

    registerCommand('extension.CreateTodayDiary', () => {
        if (vscode.workspace.workspaceFolders !== undefined) {
            var workspace = vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder;
            var now = new Date(Date.now());
            var targetPath = join(workspace.uri.fsPath, `${now.getFullYear()}-${PadLeft(`${now.getMonth()+1}`, "0", 2)}-${PadLeft(`${now.getDate()}`, "0", 2)}.md`);

            exists(targetPath, existsFile => {
                if(!existsFile) {
                    writeFile(targetPath, `${targetPath}`, err => { });
                    vscode.window.showInformationMessage(`Create ${targetPath}!`);                        
                }
            });

            vscode.workspace.openTextDocument(targetPath).then(doc => {
                vscode.window.showTextDocument(doc);
            });
        }
    });
}

export function deactivate() {
}
