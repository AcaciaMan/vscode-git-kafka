import * as vscode from "vscode";
import { M_Global } from "../m_util/m_global";
import { M_Solr } from "../m_util/m_solr";
import { M_Task } from "../m_tasks/m_task";
import { M_SolrSearch } from "./m_solr_search";
import { M_Status } from "../m_tasks/m_status";
import { M_SearchExecutor, M_SearchSolr, M_SearchSolrDirs } from "../m_tasks/m_search_executor";
import { ViewExecuteSolrResults } from "./viewExecuteSolrResults";
import { ViewSolrDirsResults } from "./viewSolrDirsResults";

export class ProviderSolr implements vscode.WebviewViewProvider {
  public static readonly viewType = "myExtension.solr";

  private _view?: vscode.WebviewView;

  m_global: M_Global = M_Global.getInstance();

  mSolr: M_Solr = M_Solr.getInstance();
  mStatus = M_Status.getInstance();
  mViewSolrResults: ViewExecuteSolrResults = ViewExecuteSolrResults.getInstance();
  viewSolrDirsResults: ViewSolrDirsResults;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.viewSolrDirsResults = new ViewSolrDirsResults(context);
  }

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
        case "refresh":
          this._refresh();
          break;
        case "search":
            this._searchSolr(data.searchTerm);
            break;
        case "searchDirs":
            this._searchSolrDirs(data.searchTerm, data.sort);
            break;


        }
    });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
      //load html from file htmlShopConfig.html
      const fs = require("fs");
      const path = require("path");
      const htmlPath = webview.asWebviewUri(
        vscode.Uri.file(
          path.join(
            this.context.extensionPath,
            "resources",
            "htmlSolr.html"
          )
        )
      );
      let html = fs.readFileSync(htmlPath.fsPath, "utf8");
      return html;
    }

    private _refresh() {
      this.mSolr.refresh();
    }

    private async _searchSolr(searchTerm: string) {
      const mTask = new M_Task(searchTerm, "Solr results");
      const mExecutor = this.mStatus.getExecutor();
      if (!mExecutor) {
        vscode.window.showInformationMessage("No executor found");
        return;
      }
      const mSearchExecutor = new M_SearchSolr(mTask, mExecutor);
      await mSearchExecutor.executeSearch();
      this.mStatus.addSolrExecutor(mSearchExecutor);
      this.mViewSolrResults.newSearch(this.context);

    }

    private async _searchSolrDirs(searchTerm: string, sort: string) {
      const mTask = new M_Task(searchTerm, "Solr Dirs results");
      mTask.sSort = sort;
      console.log("sort: " + sort);
      const mExecutor = this.mStatus.getExecutor();
      if (!mExecutor) {
        vscode.window.showInformationMessage("No executor found");
        return;
      }
      const mSearchExecutor = new M_SearchSolrDirs(mTask, mExecutor);
      await mSearchExecutor.executeSearch();
      this.mStatus.addSolrDirsExecutor(mSearchExecutor);
      mTask.outputChannel.append(mTask.sStdout);
      mTask.outputChannel.show();
      this.viewSolrDirsResults.showSolrDirsResults(mExecutor.task.mChunks);
    }
}


export class ProviderSolrEmpty implements vscode.WebviewViewProvider {
  public static readonly viewType = "myExtension.solr";

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
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return "";
  }
}