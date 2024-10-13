import * as vscode from "vscode";
import { M_Status } from "../m_tasks/m_status";
import { M_SearchSolrDirs } from "../m_tasks/m_search_executor";
import { M_Chunks } from "../m_grep/m_chunks";
import { M_Clicks } from "../m_results/m_clicks";

export class ViewSolrDirsResults {
  private _panel: vscode.WebviewPanel | undefined;

  context: vscode.ExtensionContext;
  htmlContent: string = "";
  mStatus: M_Status = M_Status.getInstance();
  mSolrExecutor: M_SearchSolrDirs = this.mStatus.getSolrDirsExecutor();
  mClicks: M_Clicks = M_Clicks.getInstance();

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public showSolrDirsResults(mChunks: M_Chunks) {
    const columnToShowIn = vscode.ViewColumn.One;
    this.mSolrExecutor = this.mStatus.getSolrDirsExecutor();

    if (this._panel) {
      this._panel.dispose();
    }

    if (!this._panel) {
      this._panel = vscode.window.createWebviewPanel(
        "solrDirsResults",
        "Solr Dirs Results",
        columnToShowIn,
        {
          enableScripts: true,
          retainContextWhenHidden: true, // Retain context when hidden
        }
      );

      this._panel.onDidDispose(() => {
        this._panel = undefined;
      });

      // Handle messages from the webview
      this._panel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.command) {
            case "openFile":
              this.openFileInEditor(
                message.filePath,
                message.lineStart,
                message.lineEnd
              );
              this.mClicks.incrementClicks(message.dirPath, message.fileName);
              break;
          }
        },
        undefined,
        this.context.subscriptions
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
        this.mSolrExecutor.mSolrDirsSearch.solrResponse,
        mChunks
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

        sHighlightedText += `<h1 class="line-number" data-file-path="${mItem.mFile.file.getPath()}" data-line-start="${mItem.mFile.getLineStart(
          mItem.mItem
        )}" data-line-end="${mItem.mFile.getLineEnd(
          mItem.mItem
        )}" data-dir="${mItem.mFile.file.dir.getId()}" data-file-name="${
          mItem.mFile.file.name
        }">${mItem.mFile.file.toString(false)}</h1>
                <pre>${resultText}</pre>`;
      }
    }

    return sHighlightedText;
  }

  // open file in editor and go to specific line
  private openFileInEditor(
    filePath: string,
    lineStart: number,
    lineEnd: number
  ): void {
    const openPath = vscode.Uri.file(filePath);
    vscode.workspace.openTextDocument(openPath).then((doc) => {
      vscode.window.showTextDocument(doc).then((editor) => {
        const range = new vscode.Range(lineStart - 1, 0, lineStart - 1, 0);
        editor.selection = new vscode.Selection(range.start, range.end);
        editor.revealRange(range);
      });
    });
  }
}
