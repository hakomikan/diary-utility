'use strict';
import * as vscode from 'vscode';
import { join } from 'path';
import * as ut from "./util";

export function activate(context: vscode.ExtensionContext) {

    function registerCommand(name: string, callback: (...args: any[]) => Promise<any>): void {
        context.subscriptions.push(
            vscode.commands.registerCommand(name, (...args: any[]) =>
                callback(...args).catch(err => vscode.window.showErrorMessage(err))
            )
        );
    }

    registerCommand('extension.CreateTodayDiary', async () => {
        if (vscode.workspace.workspaceFolders === undefined) { return; }

        var workspace = vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder;
        var formatedToday = ut.formatDate(new Date(Date.now()));
        var targetPath = join(workspace.uri.fsPath, `${formatedToday}.md`);

        await ut.openDocumentForcibly(targetPath, `# ${formatedToday}\n- `);
    });

    registerCommand('extension.CreateSubDirDiary', async () => {
        if (vscode.workspace.workspaceFolders === undefined) { return; }

        var workspace = vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder;
        var formatedToday = ut.formatDate(new Date(Date.now()));

        var subDirs = await ut.enumerateSubDirectories(workspace.uri.fsPath);
        var targetSubDir = await vscode.window.showQuickPick(subDirs);
        if(!targetSubDir) { return; }

        var targetPath = join(targetSubDir, `${formatedToday}.md`);

        await ut.openDocumentForcibly(targetPath, `# ${formatedToday}\n- `);
    });

    registerCommand('extension.CreateNamedDiary', async () => {
        if (vscode.workspace.workspaceFolders === undefined) { return; }

        var workspace = vscode.workspace.workspaceFolders[0] as vscode.WorkspaceFolder;
        var formatedToday = ut.formatDate(new Date(Date.now()));
        var name = await vscode.window.showInputBox();

        var targetPath = join(workspace.uri.fsPath, `${formatedToday}-${name}.md`);

        var editor = vscode.window.activeTextEditor;
        if (editor && editor.selection) {
            var selectedText = editor.document.getText(editor.selection.with());

            editor.edit(editBuilder => {
                if(editor){
                    editBuilder.delete(editor.selection);
                }
            });

            var newEditor = await ut.openDocumentForcibly(targetPath, `# ${formatedToday}\n- `);

            newEditor.edit(editBuilder => {
                var endPosition = newEditor.document.positionAt(newEditor.document.getText().length);
                editBuilder.insert(endPosition, `\n${selectedText}`);
            });
        }
        else {
            await ut.openDocumentForcibly(targetPath, `# ${formatedToday}\n- `);
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
                editBuilder.insert(selection.active, ut.formatDateTime(now));
            });
        });
    });
}

export function deactivate() {
}
