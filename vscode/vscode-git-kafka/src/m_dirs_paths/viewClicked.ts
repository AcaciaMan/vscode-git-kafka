import * as vscode from "vscode";
import { M_Clicks } from "../m_results/m_clicks";

export class ViewClicked {
  private _panel: vscode.WebviewPanel | undefined;

  context: vscode.ExtensionContext;
  htmlContent: string = "";
  mClicks: M_Clicks = M_Clicks.getInstance();

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public showClickedFiles() {
    const columnToShowIn = vscode.ViewColumn.One;

    if (this._panel) {
      this._panel.dispose();
    }

    if (!this._panel) {
      this._panel = vscode.window.createWebviewPanel(
        "clickedFiles",
        "Clicked Files",
        columnToShowIn,
        {
          enableScripts: true,
          retainContextWhenHidden: true, // Retain context when hidden
        }
      );

      this._panel.onDidDispose(() => {
        this._panel = undefined;
      });

      // load HTML content from htmlResults.html
      const fs = require("fs");
      const path = require("path");
      const htmlPath = this._panel.webview.asWebviewUri(
        vscode.Uri.file(
          path.join(
            this.context.extensionPath,
            "resources",
            "htmlClicked.html"
          )
        )
      );
      this.htmlContent = fs.readFileSync(htmlPath.fsPath, "utf8");

      const sClickedFiles = this.getClickedFiles();

      this._panel.webview.html = this.htmlContent.replace(
        "<!-- clickedFiles -->",
        sClickedFiles
      );
    }
  }


    private getClickedFiles(): string {
        let sClickedFiles = "<ul>";

        // iterate over all clicked files from mClicks dictClicks
        for (const [key, value] of Object.entries(this.mClicks.dictClicks)) {
            sClickedFiles += `<li>${key}: ${value}</li>`;
        };

    

    
        sClickedFiles += "</ul>";
    
        return sClickedFiles;
    }
}
