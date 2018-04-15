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

    function formatDate(date: Date) : string
    {
        return `${date.getFullYear()}-${PadLeft(`${date.getMonth()+1}`, "0", 2)}-${PadLeft(`${date.getDate()}`, "0", 2)}`;
    }

    registerCommand('extension.CreateTodayDiary', () => {
        if (vscode.workspace.workspaceFolders !== undefined) {
            var workspace = vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder;
            var formatedToday = formatDate(new Date(Date.now()));
            var targetPath = join(workspace.uri.fsPath, `${formatedToday}.md`);

            exists(targetPath, existsFile => {
                if(!existsFile) {
                    writeFile(targetPath, `# ${formatedToday}\n- `, err => { });
                    vscode.window.showInformationMessage(`Create ${targetPath}!`);                        
                }
            });

            vscode.workspace.openTextDocument(targetPath).then(doc => {
                vscode.window.showTextDocument(doc).then(editor => {
                    var docEnd = doc.positionAt(doc.getText().length);
                    editor.selection = new vscode.Selection(docEnd, docEnd);
                    editor.revealRange(new vscode.Range(docEnd, docEnd), vscode.TextEditorRevealType.InCenter);
                });
            });
        }
    });
}

export function deactivate() {
}
