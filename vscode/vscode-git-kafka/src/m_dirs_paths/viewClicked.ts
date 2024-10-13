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
        let sClickedFiles = "";

        // sort clicked files by most clicked directories and then by file name ascending
        const dictSorted = Object.entries(this.mClicks.dictClicksFiles).sort((a, b) => {
            const aDir = a[1].dir.getId();
            const bDir = b[1].dir.getId();
            const aDirClicks = this.mClicks.getClicks(aDir);
            const bDirClicks = this.mClicks.getClicks(bDir);

            if (aDir === bDir) {
                return a[0].localeCompare(b[0]);
            } else {
              if (aDirClicks === bDirClicks) {
                return aDir.localeCompare(bDir);
               } else {  
                return bDirClicks - aDirClicks;
              }  
            }

        });

        // iterate over all clicked files from dictSorted
        for (const [key, value] of dictSorted) {
            sClickedFiles += `<div class="checkbox-container">
            <input type="checkbox" class="childCheckbox" checked="true">${value.getRelativePath()}
            </div>\n`;
        };
    
        return sClickedFiles;
    }
}
