'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { join } from 'path';

function PadLeft(text: string, padChar: string, size: number): string {
    return (String(padChar).repeat(size) + text).substr((size * -1), size);
}

export function activate(context: vscode.ExtensionContext) {

    function registerCommand(name: string, callback: (...args: any[]) => Promise<any>): void {
        context.subscriptions.push(
            vscode.commands.registerCommand(name, (...args: any[]) => 
                callback(...args).catch(err => console.error(err))
            )
        );
    }

    function formatDate(date: Date): string {
        return `${date.getFullYear()}-${PadLeft(`${date.getMonth() + 1}`, "0", 2)}-${PadLeft(`${date.getDate()}`, "0", 2)}`;
    }

    function formatDateTime(date: Date): string {
        return `${date.getFullYear()}-${PadLeft(`${date.getMonth() + 1}`, "0", 2)}-${PadLeft(`${date.getDate()}`, "0", 2)} ${PadLeft(`${date.getHours()}`, "0", 2)}:${PadLeft(`${date.getMinutes()}`, "0", 2)}:${PadLeft(`${date.getSeconds()}`, "0", 2)}`;
    }

    async function openDocument(targetPath: string): Promise<void> {
        var doc = await vscode.workspace.openTextDocument(targetPath);
        var editor = await vscode.window.showTextDocument(doc);
        var docEnd = doc.positionAt(doc.getText().length);
        editor.selection = new vscode.Selection(docEnd, docEnd);
        editor.revealRange(new vscode.Range(docEnd, docEnd), vscode.TextEditorRevealType.InCenter);
    }

    function writeFile(path: string, data: string, enc: string = "utf-8"): Promise<void> {
        return new Promise<void>( (resolve, reject) => {
            fs.writeFile(path, data, enc, err => {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    resolve();
                }
            })
        });
    }

    function exists(path: string) : Promise<boolean> {
        return new Promise<boolean>(
            (resolve, reject) =>
                fs.exists(path, exists => resolve(exists))
        );
    }

    registerCommand('extension.CreateTodayDiary', async () => {
        if (vscode.workspace.workspaceFolders !== undefined) {
            var workspace = vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder;
            var formatedToday = formatDate(new Date(Date.now()));
            var targetPath = join(workspace.uri.fsPath, `${formatedToday}.md`);

            if(!await exists(targetPath))
            {
                await writeFile(targetPath, `# ${formatedToday}\n- `);
                await openDocument(targetPath);
                vscode.window.setStatusBarMessage(`Create ${targetPath}.`, 5000);
            }
            else
            {
                await openDocument(targetPath);
                vscode.window.setStatusBarMessage(`Open ${targetPath}.`, 5000);
            }
        }
    });

    registerCommand('extension.InsertDateTime', async () => {
        var editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        var selections = editor.selections;
        var now = new Date(Date.now());

        editor.edit(editBuilder => {
            selections.forEach(selection => {
                editBuilder.replace(selection, "");
                editBuilder.insert(selection.active, formatDateTime(now));
            });
        });
    });
}

export function deactivate() {
}
