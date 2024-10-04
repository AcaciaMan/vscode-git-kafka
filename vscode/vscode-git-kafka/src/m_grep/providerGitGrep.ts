// webView provider class to enter git grep command and display results in output channel
//

import * as vscode from "vscode";
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
const fs = require("fs");
import { M_Global } from "../m_util/m_global";
import { M_CalcGrep } from "./m_calc_grep";
import { ViewResults } from "../m_results/viewResults";
import { M_Search } from "../m_results/m_search";
import { M_Clicks } from "../m_results/m_clicks";
import { M_Util } from "../m_util/m_util";
import { M_Task } from "../m_tasks/m_task";
import { TaskExecute, TaskExecuteDirs } from "../m_tasks/m_task_executor";

export class ProviderGitGrep implements vscode.WebviewViewProvider {
  public static readonly viewType = "myExtension.myWebview";

  private _view?: vscode.WebviewView;

  m_global: M_Global = M_Global.getInstance();
  mUtil = M_Util.getInstance();
  viewResults: ViewResults = ViewResults.getInstance();
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
          vscode.window.showInformationMessage("Execute ...");
          this._search(data.searchTerm);
          break;
        case "searchDirs":
          vscode.window.showInformationMessage("Execute Dirs ...");
          this._searchDirs(data.searchTerm);
          break;
        case "biggestDirs":
          vscode.window.showInformationMessage("Biggest Dirs ...");
          await this._biggestDirs();
          vscode.window.showInformationMessage("Biggest Dirs Done");
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
    const mTask = new M_Task(searchTerm, "Execute results");
    const mTaskExecute = new TaskExecute(mTask);
    mTask.pInitialized = mTaskExecute.init();
    mTask.pExecuted = mTaskExecute.execute();
  }

  private _getHtmlForWebview(webview: vscode.Webview) {

    //load html from file htmlShopConfig.html
    const fs = require("fs");
    const path = require("path");
    const htmlPath = webview.asWebviewUri(
      vscode.Uri.file(
        path.join(this.context.extensionPath, "resources", "htmlGitGrep.html")
      )
    );

    const html = fs.readFileSync(htmlPath.fsPath, "utf8");

    return html;
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

            const aDirs = Object.values(mCalcDir.dirs);

            // order aDirs by sortType
            this.mUtil.sortDirs(aDirs);

            let sOut = "";
            let i = 0;
            for (const dir of aDirs) {
              if (i > 50) {
                break;
              }
              sOut += `${dir.getId()}\n`;
              i++;
            }

    const outputChannel = vscode.window.createOutputChannel("50 Dirs");
    outputChannel.append(sOut);
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

        const aDirs = Object.values(mCalcDir.dirs);

        // order aDirs by sortType
        this.mUtil.sortDirs(aDirs);

        let sOut = "";
        let i = 0;
        for (const dir of aDirs) {
          if (i > 50) {
            break;
          }
          sOut += `${dir.getId()}\n`;
          i++;
        }

    const outputChannel = vscode.window.createOutputChannel("Largest 50 Files");
    outputChannel.append(sOut);
    outputChannel.show();
  }

  private async _searchDirs(searchTerm: string) {
    const mTask = new M_Task(searchTerm, "ExecuteDirs results");
    const mTaskExecuteDirs = new TaskExecuteDirs(mTask);
    mTask.pInitialized = mTaskExecuteDirs.init();
    mTask.pExecuted = mTaskExecuteDirs.execute(); 
    this.viewResults.newSearch(this.context, mTask.outputChannel, mTaskExecuteDirs.mCalcGrep);
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



