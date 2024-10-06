import * as vscode from "vscode";
import { M_Global } from "../m_util/m_global";
import { M_Solr } from "../m_util/m_solr";
import { M_Task } from "../m_tasks/m_task";
import { M_SolrSearch } from "./m_solr_search";
import { M_Status } from "../m_tasks/m_status";
import { M_SearchExecutor, M_SearchSolr } from "../m_tasks/m_search_executor";

export class ProviderSolr implements vscode.WebviewViewProvider {
  public static readonly viewType = "myExtension.solr";

  private _view?: vscode.WebviewView;

  m_global: M_Global = M_Global.getInstance();

  mSolr: M_Solr = M_Solr.getInstance();
  mStatus = M_Status.getInstance();

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
        case "refresh":
          this._refresh();
          break;
        case "search":
            this._searchSolr(data.searchTerm);
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