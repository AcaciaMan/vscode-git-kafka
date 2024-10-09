import * as vscode from "vscode";
import { M_Status } from "../m_tasks/m_status";
import { M_SearchSolrDirs } from "../m_tasks/m_search_executor";
import { M_Chunks } from "../m_grep/m_chunks";

export class ViewSolrDirsResults {
  private _panel: vscode.WebviewPanel | undefined;

  context: vscode.ExtensionContext;
  htmlContent: string = "";
  mStatus: M_Status = M_Status.getInstance();
  mSolrExecutor: M_SearchSolrDirs = this.mStatus.getSolrDirsExecutor();

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public showSolrDirsResults(mChunks: M_Chunks) {
    const columnToShowIn = vscode.ViewColumn.One;
    this.mSolrExecutor = this.mStatus.getSolrDirsExecutor();

    if (this._panel) {
      this._panel.reveal(columnToShowIn);
    } else {
      this._panel = vscode.window.createWebviewPanel(
        "solrDirsResults",
        "Solr Dirs Results",
        columnToShowIn,
        {
          enableScripts: true,
        }
      );

      // load HTML content from htmlResults.html
      const fs = require("fs");
      const path = require("path");
      const htmlPath = this._panel.webview.asWebviewUri(
        vscode.Uri.file(
          path.join(
            this.context.extensionPath,
            "resources",
            "htmlSolrDirsResults.html"
          )
        )
      );
      this.htmlContent = fs.readFileSync(htmlPath.fsPath, "utf8");

      const sHighlightedText = this.showResults(
        this.mSolrExecutor.mSolrDirsSearch.solrResponse, mChunks
      );

      this._panel.webview.html = this.htmlContent.replace(
        "<!-- highlightedText -->",
        sHighlightedText
      );
    }
  }

    private showResults(solrResponse: any, mChunks: M_Chunks) {
        let sHighlightedText = "";
        const highlightedText = solrResponse.highlighting;
        for (const key in highlightedText) {
            if (highlightedText.hasOwnProperty(key)) {

                const mItem = mChunks.dItems[key];
                let resultText = highlightedText[key].resultText;
                if (!resultText) {
                    resultText = mItem.mFile.toStringItemText(mItem.mItem);
                }

                sHighlightedText += `<h1>${mItem.mFile.file.toString(false)}</h1>
                <pre>${resultText}</pre>`;


            }
        }
 
        return sHighlightedText;


    }
}
