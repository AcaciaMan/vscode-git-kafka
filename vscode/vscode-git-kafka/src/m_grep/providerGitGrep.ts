// webView provider class to enter git grep command and display results in output channel
//

import * as vscode from "vscode";
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
const fs = require("fs");
import * as path from "path";
import { M_Dir } from "./m_dir";
import { M_Calc_Dir } from "./m_calc_dir";

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

        const mCalcDir = new M_Calc_Dir(workspaceFolder);

        await mCalcDir.calcUnCountedDirs();


        const outputChannel =
            vscode.window.createOutputChannel("Biggest Dirs");
        outputChannel.append(mCalcDir.toString());
        outputChannel.show();

    }

        



}



