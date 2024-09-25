// webView provider class to enter git grep command and display results in output channel
//

import * as vscode from "vscode";
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
const fs = require("fs");
import * as path from "path";
import { M_Dir } from "./m_dir";

export class ProviderGitGrep implements vscode.WebviewViewProvider {
  public static readonly viewType = 'myExtension.myWebview';

    private _view?: vscode.WebviewView;

    constructor(private readonly context: vscode.ExtensionContext) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'search':
                    await this._search(data.searchTerm);
                    break;
                case 'biggestDirs':
                    vscode.window.showInformationMessage("Biggest Dirs Receive Msg...");
                    await this._biggestDirs();
                    vscode.window.showInformationMessage("Biggest Dirs Receive Msg Done");
                    break;
            }
        });
    }

    private async _search(searchTerm: string) {
        if (!searchTerm) {
            vscode.window.showErrorMessage("Search term is required");
            return;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage("No workspace folder found");
            return;
        }

        const command = `${searchTerm}`;
        const { stdout, stderr } = await exec(command, {
            cwd: workspaceFolder.uri.fsPath,
        });

        if (stderr) {
            vscode.window.showErrorMessage(`Error: ${stderr}`);
            return;
        }

        const outputChannel = vscode.window.createOutputChannel("Git Grep Results");
        outputChannel.append(stdout);
        outputChannel.show();
    }
        

    private _getHtmlForWebview(webview: vscode.Webview) {
      const styleUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this.context.extensionUri, "media", "style.css")
      );
      const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this.context.extensionUri, "media", "main.js")
      );


      //load html from file htmlShopConfig.html
      const fs = require("fs");
      const htmlPath = vscode.Uri.joinPath(
        this.context.extensionUri,
        "src",
        "m_grep",
        "htmlGitGrep.html"
      );

      const html = fs.readFileSync(htmlPath.fsPath, "utf8");

      return html
        .replace(/{{styleUri}}/g, styleUri.toString())
        .replace(/{{scriptUri}}/g, scriptUri.toString());
    }

    public dispose() {
        //this._view?.dispose();
    }

    public static createOrShow(context: vscode.ExtensionContext) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        const view = vscode.window.createWebviewPanel(
            ProviderGitGrep.viewType,
            'Git Grep',
            column || vscode.ViewColumn.One,
            {
                enableFindWidget: true,
                enableCommandUris: true,
                retainContextWhenHidden: true,
            }
        );

        const provider = new ProviderGitGrep(context);
        view.webview.options = {
            enableScripts: true,
        };
        view.webview.html = provider._getHtmlForWebview(view.webview);

        view.onDidDispose(() => {
            provider.dispose();
        });

        return view;
    }

    public static revive(context: vscode.ExtensionContext) {
        return new ProviderGitGrep(context);
    }


    private async _biggestDirs() {
        console.log("Biggest Dirs...");

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage("No workspace folder found");
            return;
        }

        // do in steps
        // get first level files list with git grep -l --max-depth=1 ""
        // for files in list, get file size with fs.stat
        // for dirs in list, repeat with git grep -l --max_depth=1 "" in cwd/dir

        const parentDir = "";
        const command = `git grep -l --max-depth=1 ""`;
        const { stdout, stderr } = await exec(command, {
            cwd: workspaceFolder.uri.fsPath,
        });

        if (stderr) {
            vscode.window.showErrorMessage(`Error: ${stderr}`);
            return;
        }

        let sDirs = "";
        let files: string[] = stdout.split("\n");;

        files.pop(); // remove last empty line

        // make a dictionary of M_Dir objects

        const dirs: { [key: string]: M_Dir } = {};

        files.forEach((file) => {
            // dir name of file
            const dir = path.dirname(file);
            const fullPath = path.join(workspaceFolder.uri.fsPath, file);
            const m_dir = new M_Dir(parentDir, dir, 0, 0);
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                m_dir.size = 0;
                m_dir.fileCount = 0;
            } else {
                m_dir.size = stats.size;
                m_dir.fileCount = 1;
            }
            // if m_dir.id not in dirs, add it, else update size and file count
            if (m_dir.id in dirs) {
                dirs[m_dir.id].size += m_dir.size;
                dirs[m_dir.id].fileCount += m_dir.fileCount;
            } else {
                dirs[m_dir.id] = m_dir;
            };

            

        });
        

        // convert dictionary to array of M_Dir objects
        const dirArray = Object.values(dirs);

        // sort array by size
        dirArray.sort((a, b) => b.size - a.size);

        // convert array to string
        dirArray.forEach((dir) => {
            sDirs += `${dir.toString()}\n`;
        });


        const outputChannel =
            vscode.window.createOutputChannel("Biggest Dirs");
        outputChannel.append(sDirs);
        outputChannel.show();



    }

    private async _countFiles(parentDir:string, dirs: { [key: string]: M_Dir }, workspaceFolder: vscode.WorkspaceFolder) {
        console.log(`Count Files... ${parentDir}`);
        // if parentDir is not in dirs, add it
        if (!(parentDir+"/." in dirs)) {
            dirs[parentDir+"/."] = new M_Dir("", parentDir+"/.", 0, 0);
        }



        const m_cwd = path.join(workspaceFolder.uri.fsPath, parentDir);

        // do in steps
        // get first level files list with git grep -l --max-depth=1 ""
        // for files in list, get file size with fs.stat
        // for dirs in list, repeat with git grep -l --max_depth=1 "" in cwd/dir

        const command = `git grep -l --max-depth=1 ""`;
        const { stdout, stderr } = await exec(command, {
            cwd: m_cwd,
        });

        if (stderr) {
            vscode.window.showErrorMessage(`Error: ${stderr}`);
            return;
        }


        let files: string[] = stdout.split("\n");;

        files.pop(); // remove last empty line

        // make a dictionary of M_Dir objects

        files.forEach((file) => {
            // dir name of file
            const dir = path.dirname(file);
            const fullPath = path.join(workspaceFolder.uri.fsPath, file);
            const m_dir = new M_Dir(parentDir, dir, 0, 0);
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                m_dir.size = 0;
                m_dir.fileCount = 0;
            } else {
                m_dir.size = stats.size;
                m_dir.fileCount = 1;
            }
            // if m_dir.id not in dirs, add it, else update size and file count
            if (m_dir.id in dirs) {
                dirs[m_dir.id].size += m_dir.size;
                dirs[m_dir.id].fileCount += m_dir.fileCount;
            } else {
                dirs[m_dir.id] = m_dir;
            };

            

        });

        // set hasCountedFiles to true for parentDir
        dirs[parentDir+"/."].hasCountedFiles = true;
    }
        



}



