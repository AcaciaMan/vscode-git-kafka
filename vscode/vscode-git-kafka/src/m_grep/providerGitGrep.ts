// webView provider class to enter git grep command and display results in output channel
//

import * as vscode from "vscode";
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
const fs = require("fs");
import { M_Calc_Dir } from "./m_calc_dir";
import { M_Global } from "../m_util/m_global";
import { M_CalcGrep } from "./m_calc_grep";
import { ViewResults } from "../m_results/viewResults";
import { get } from "http";
import { M_ResultFile } from "../m_results/m_result_file";
import { M_Search } from "../m_results/m_search";
import { M_Clicks } from "../m_results/m_clicks";

export class ProviderGitGrep implements vscode.WebviewViewProvider {
  public static readonly viewType = "myExtension.myWebview";

  private _view?: vscode.WebviewView;

  m_global: M_Global = M_Global.getInstance();
  mCalcGrep: M_CalcGrep | undefined;

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
        case "search":
          await this._search(data.searchTerm);
          break;
        case "searchDirs":
          await this._searchDirs(data.searchTerm);
          break;
        case "biggestDirs":
          vscode.window.showInformationMessage("Biggest Dirs Receive Msg...");
          await this._biggestDirs();
          vscode.window.showInformationMessage("Biggest Dirs Receive Msg Done");
          break;
        case "biggestFiles":
          vscode.window.showInformationMessage("Biggest Files Receive Msg...");
          await this._biggestFiles();
          vscode.window.showInformationMessage(
            "Biggest Files Receive Msg Done"
          );
          break;
        case "webviewLoaded":
          console.log("Webview Loaded");
          // Send data to the webview
          //make array
          const mSearch: M_Search = M_Search.getInstance();
          var arrSorts = mSearch.aSorts;
          // Send data to the webview
          webviewView.webview.postMessage({ command: "setSortsOptions", arrSorts: arrSorts });
          webviewView.webview.postMessage({
            command: "setSortOption",
            currSort: this.m_global.sortType,
          });
          break;
        case "selectSort":
          // Set the current try
          this.m_global.setSortType(data.text);
          this._showResultsInNewTab();
          break;
        case "clearClicks":
          const mClicks = M_Clicks.getInstance();
          mClicks.clearClicks();
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

    // benchmark start
    const start = new Date().getTime();
    const { stdout, stderr } = await exec(command, {
      cwd: workspaceFolder.uri.fsPath,
    });
    // benchmark end
    const end = new Date().getTime();
    const time = end - start;
    console.log(`Search Time: ${time} ms`);

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
    const path = require("path");
    const htmlPath = vscode.Uri.file(
      path.join(this.context.extensionPath, "src", "m_grep", "htmlGitGrep.html")
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
      "Git Grep",
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

    const mCalcDir = await this.m_global.getCalcDirs();

    const outputChannel = vscode.window.createOutputChannel("50 Dirs");
    outputChannel.append(mCalcDir.toString());
    outputChannel.show();
  }

  private async _biggestFiles() {
    console.log("Biggest Files...");

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }

    const mCalcDir = await this.m_global.getCalcDirs();

    const outputChannel = vscode.window.createOutputChannel("Largest 50 Files");
    outputChannel.append(mCalcDir.toStringFiles());
    outputChannel.show();
  }

  private async _searchDirs(searchTerm: string) {
    console.log(`Search Dirs: ${searchTerm}`);

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }

    this.mCalcGrep = new M_CalcGrep(searchTerm);
    // benchmark start
    const start = new Date().getTime();
    await this.mCalcGrep.execGrepCommandAllDirs();
    // benchmark end
    const end = new Date().getTime();
    const time = end - start;
    console.log(`Search Dirs Time: ${time} ms`);

    const outputChannel = vscode.window.createOutputChannel("Search Dirs");
    outputChannel.append(this.mCalcGrep.sOut);
    outputChannel.show();


    this._showResultsInNewTab();    
  }

  // show results in new tab
  private _showResultsInNewTab() 
    {
      if (!this.mCalcGrep) {
        vscode.window.showInformationMessage("No search results found");
        return;
      }
    const m_search: M_Search = M_Search.getInstance();
    m_search.processSearchResults(this.mCalcGrep, this.m_global.sortType);
    const m_results = ViewResults.getInstance();
    m_results.showResultsInNewTab(m_search.aSearchResults, this.context);
  }

}



