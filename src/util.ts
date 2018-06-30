'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { join } from 'path';

export function PadLeft(text: string, padChar: string, size: number): string {
  return (String(padChar).repeat(size) + text).substr((size * -1), size);
}

export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${PadLeft(`${date.getMonth() + 1}`, "0", 2)}-${PadLeft(`${date.getDate()}`, "0", 2)}`;
}

export function formatDateTime(date: Date): string {
  return `${date.getFullYear()}-${PadLeft(`${date.getMonth() + 1}`, "0", 2)}-${PadLeft(`${date.getDate()}`, "0", 2)} ${PadLeft(`${date.getHours()}`, "0", 2)}:${PadLeft(`${date.getMinutes()}`, "0", 2)}:${PadLeft(`${date.getSeconds()}`, "0", 2)}`;
}

export async function openDocument(targetPath: string): Promise<vscode.TextEditor> {
  var doc = await vscode.workspace.openTextDocument(targetPath);
  var editor = await vscode.window.showTextDocument(doc);
  var docEnd = doc.positionAt(doc.getText().length);
  editor.selection = new vscode.Selection(docEnd, docEnd);
  editor.revealRange(new vscode.Range(docEnd, docEnd), vscode.TextEditorRevealType.InCenter);
  return editor;
}

export interface PathAndStats
{
  path: string;
  stats: fs.Stats;
}

export function lstatAsync(path: string) : Promise<PathAndStats>
{
  return new Promise<PathAndStats>((resolve, reject) => {
    fs.lstat(path, (err, stats) => {
      if(err) {
        reject(err);
      }
      else {
        resolve({ path, stats });
      }
    });
  });
}

export function enumerateSubDirectories(rootDirectoryPaths: string) : Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(rootDirectoryPaths, (err, files) => {
      if(err){
        reject(err);
      }
      else {
        Promise.all(files.filter(file => !file.startsWith(".")).map(file => lstatAsync(join(rootDirectoryPaths, file)))).then( (values) => {
          var directories = values.filter(file => file.stats.isDirectory() && !file.path.startsWith(".")).map(file => file.path);
          resolve(directories);
        }).catch(reason => {
          reject(reason);
        })
      }
    });  
  });
}

export async function openDocumentForcibly(targetPath: string, firstContent: string): Promise<vscode.TextEditor> {
  if (!await exists(targetPath)) {
    await writeFile(targetPath, firstContent);
    vscode.window.setStatusBarMessage(`Create ${targetPath}.`, 5000);
  }
  else {
    vscode.window.setStatusBarMessage(`Open ${targetPath}.`, 5000);
  }

  return await openDocument(targetPath);
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
