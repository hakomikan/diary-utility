'use strict';
import * as vscode from 'vscode';
import { join } from 'path';
import * as ut from "./util";

export function activate(context: vscode.ExtensionContext) {

    function registerCommand(name: string, callback: (...args: any[]) => Promise<any>): void {
        context.subscriptions.push(
            vscode.commands.registerCommand(name, (...args: any[]) =>
                callback(...args).catch(err => console.error(err))
            )
        );
    }

    registerCommand('extension.CreateTodayDiary', async () => {
        if (vscode.workspace.workspaceFolders === undefined) { return; }

        var workspace = vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder;
        var formatedToday = ut.formatDate(new Date(Date.now()));
        var targetPath = join(workspace.uri.fsPath, `${formatedToday}.md`);

        if (!await ut.exists(targetPath)) {
            await ut.writeFile(targetPath, `# ${formatedToday}\n- `);
            vscode.window.setStatusBarMessage(`Create ${targetPath}.`, 5000);
        }
        else {
            vscode.window.setStatusBarMessage(`Open ${targetPath}.`, 5000);
        }

        await ut.openDocument(targetPath);
    });

    registerCommand('extension.InsertDateTime', async () => {
        var editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        var selections = editor.selections;
        var now = new Date(Date.now());

        editor.edit(editBuilder => {
            selections.forEach(selection => {
                editBuilder.replace(selection, "");
                editBuilder.insert(selection.active, ut.formatDateTime(now));
            });
        });
    });
}

export function deactivate() {
}
