'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';


export function PadLeft(text: string, padChar: string, size: number): string {
  return (String(padChar).repeat(size) + text).substr((size * -1), size);
}

export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${PadLeft(`${date.getMonth() + 1}`, "0", 2)}-${PadLeft(`${date.getDate()}`, "0", 2)}`;
}

export function formatDateTime(date: Date): string {
  return `${date.getFullYear()}-${PadLeft(`${date.getMonth() + 1}`, "0", 2)}-${PadLeft(`${date.getDate()}`, "0", 2)} ${PadLeft(`${date.getHours()}`, "0", 2)}:${PadLeft(`${date.getMinutes()}`, "0", 2)}:${PadLeft(`${date.getSeconds()}`, "0", 2)}`;
}

export async function openDocument(targetPath: string): Promise<void> {
  var doc = await vscode.workspace.openTextDocument(targetPath);
  var editor = await vscode.window.showTextDocument(doc);
  var docEnd = doc.positionAt(doc.getText().length);
  editor.selection = new vscode.Selection(docEnd, docEnd);
  editor.revealRange(new vscode.Range(docEnd, docEnd), vscode.TextEditorRevealType.InCenter);
}

export function writeFile(path: string, data: string, enc: string = "utf-8"): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(path, data, enc, err => {
      if (err) {
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
}

export function exists(path: string): Promise<boolean> {
  return new Promise<boolean>(
    (resolve, reject) =>
      fs.exists(path, exists => resolve(exists))
  );
}
