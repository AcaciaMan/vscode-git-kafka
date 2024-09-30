import * as vscode from "vscode";
import { M_Clicks } from "./m_clicks";

// class to show results in new tab
export class ViewResults {
  // singleton instance
  private static instance: ViewResults;

  // private constructor
  private constructor() {
    // do nothing
  }

  // get singleton instance
  public static getInstance(): ViewResults {
    if (!ViewResults.instance) {
      ViewResults.instance = new ViewResults();
    }
    return ViewResults.instance;
  }

  panel: vscode.WebviewPanel | undefined;
  htmlContent: string = "";

  // show results in new tab
  public showResultsInNewTab(
    results: { fileName: string; line: string; content: string }[],
    context: vscode.ExtensionContext
  ): void {
    // create new webview panel
    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel(
        "searchResults", // Identifies the type of the webview. Used internally
        "Search Results", // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in
        {
          enableScripts: true,
        } // Webview options. More on these later.
      );

      // load HTML content from htmlResults.html
      const fs = require("fs");
      const htmlPath = vscode.Uri.joinPath(
        context.extensionUri,
        "src",
        "m_results",
        "htmlResults.html"
      );
      this.htmlContent = fs.readFileSync(htmlPath.fsPath, "utf8");
    }

    const mClicks: M_Clicks = M_Clicks.getInstance();

    // show result content in colapsable divs

    const boxes = results
      .map(
        (result) => `
      <div class="box">
        <div class="file-name">${result.fileName}</div>
        <div class="file-line">${result.line}</div>
        <div class="line-content">${result.content}</div>
      </div>
    `
      )
      .join("");

    // Set the webview's HTML content
    this.panel.webview.html = this.htmlContent.replace(/{{boxes}}/g, boxes);

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "openFile":
            this.openFileInEditor(message.filePath, message.lineStart, message.lineEnd);
            mClicks.incrementClicks(message.dirPath);
            return;
        }
      },
      undefined,
      context.subscriptions
    );
  }

  // open file in editor and go to specific line
  private openFileInEditor(filePath: string, lineStart: number, lineEnd: number): void {
    const openPath = vscode.Uri.file(filePath);
    vscode.workspace.openTextDocument(openPath).then((doc) => {
      vscode.window.showTextDocument(doc).then((editor) => {
        const range = new vscode.Range(lineStart-1, 0, lineStart-1, 0);
        editor.selection = new vscode.Selection(range.start, range.end);
        editor.revealRange(range);
      });
    });
  }
}
