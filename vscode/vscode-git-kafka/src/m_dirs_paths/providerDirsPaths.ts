// webView provider class to enter Include Dirs, Exclude Dirs, Include Paths, Exclude Paths

import * as vscode from "vscode";
import { M_Global } from "../m_util/m_global";

export class ProviderDirsPaths implements vscode.WebviewViewProvider {
    public static readonly viewType = 'myExtension.DirsPaths';
    
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
                    case 'setDirsPaths':
                        await this._setDirsPath(data.sDirsPaths);
                        break;
                }
            });
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
        "m_dirs_paths",
        "htmlDirsPaths.html"
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
            ProviderDirsPaths.viewType,
            'Dirs Paths',
            column || vscode.ViewColumn.One,
            {
                enableFindWidget: true,
                enableCommandUris: true,
                retainContextWhenHidden: true,
            }
        );

        const provider = new ProviderDirsPaths(context);
        view.webview.options = {
            enableScripts: true,
        };
        view.webview.html = provider._getHtmlForWebview(view.webview);

        view.onDidDispose(() => {
            provider.dispose();
        });

        return view;
    }
    

    private async _setDirsPath(sDirsPaths: { includeDirs: string, excludeDirs: string, includePaths: string, excludePaths: string }) {
        console.log(`sDirsPaths: ${JSON.stringify(sDirsPaths)}`);
        console.log(`includeDirs: ${sDirsPaths.includeDirs}`);
        const m_global = M_Global.getInstance();
        m_global.setDirs(sDirsPaths.includeDirs, sDirsPaths.excludeDirs);
        m_global.setFiles(sDirsPaths.includePaths, sDirsPaths.excludePaths);
    }

    public static revive(context: vscode.ExtensionContext) {
        return new ProviderDirsPaths(context);
    }

}