// webView provider class to enter git grep command and display results in output channel
//

import * as vscode from "vscode";
import { exec } from "child_process";
const fs = require("fs");
import * as path from "path";

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
                    await this._biggestDirs();
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
        exec(
            command,
            { cwd: workspaceFolder.uri.fsPath },
            (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Error: ${error.message}`);
                    vscode.window.showErrorMessage(`Error: ${stderr}`);
                    return;
                }

                const outputChannel = vscode.window.createOutputChannel("Git Grep Results");
                outputChannel.append(stdout);
                outputChannel.show();
            }
        );
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
                vscode.window.showInformationMessage("Biggest Dirs...");
                vscode.window.showInformationMessage("message1");
                vscode.window.showInformationMessage("message2");
                vscode.window.showInformationMessage("message3");
                vscode.window.showInformationMessage("message4");
                vscode.window.showInformationMessage("message5");

    }

    private async _biggestDirs1() {


        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage("No workspace folder found");
            return;
        }





                             /* vscode.window.showInformationMessage(
                          `Dir:` +
                            fs
                              .statSync(workspaceFolder.uri.fsPath)
                              .isDirectory()
                        );
                        vscode.window.showInformationMessage(
                          `Dir:` +
                            fs.statSync(workspaceFolder.uri.fsPath).isFile()
                        );
                        */

        // do in steps
        // get first level files list with git grep -l --max-depth=1 ""
        // for files in list, get file size with fs.stat
        // for dirs in list, repeat with git grep -l --max_depth=1 "" in cwd/dir

        const command = `git grep -l --max-depth=1 ""`;

        let sDirs = "";
        let files: string[] = [];
        exec(
            command,
            { cwd: workspaceFolder.uri.fsPath, timeout: 10000 },
            (error, stdout, stderr) => {
              if (error) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
                vscode.window.showErrorMessage(`Error: ${stderr}`);
                return;
              }

              files = stdout.split("\n");
               vscode.window.showInformationMessage(stdout);

              const list = Array.from(
                { length: files.length },
                (_, index) => index
              );
              vscode.window.showInformationMessage(`List: ${list.length}`);
              vscode.window.showInformationMessage(`List: ${list}`);

             

              //await Promise.all(
              //  list.map((_, index) => {
              //    return fs.promises.stat(filePath + `_${index}.md`);
              //  })
              // );

              files.pop(); // remove last empty line

              files.forEach((file) => {
                const filePath = path.join(workspaceFolder.uri.fsPath, file);
                vscode.window.showInformationMessage(`File:` + filePath);
              });
            }
        );

                files.forEach((file) => {
                  const filePath = path.join(workspaceFolder.uri.fsPath, file);
                  vscode.window.showInformationMessage(`File:` + filePath);

                  try {
                    const stats = fs.statSync(filePath);
                    vscode.window.showInformationMessage("Stats: " + stats);
                    if (stats.isDirectory()) {
                      sDirs += `${filePath} is a directory\n`;
                    } else {
                      sDirs += `${filePath} is a file\n`;
                    }
                  } catch (err) {
                    vscode.window.showErrorMessage(
                      `Error: ${(err as Error).message}`
                    );
                  }
                });



        const outputChannel =
            vscode.window.createOutputChannel("Biggest Dirs");
        outputChannel.append(sDirs);
        outputChannel.show();



    }
}



