import * as vscode from "vscode";

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
    results: { fileName: string; line: string, content: string }[],
    context: vscode.ExtensionContext
  ): void {
    // create new webview panel
    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel(
        "searchResults", // Identifies the type of the webview. Used internally
        "Search Results", // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in
        {
          enableScripts: true
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

   // show result content in colapsable divs 

    const boxes = results
      .map(
        (result) => `
      <div class="box">
        <div class="file-name">${result.fileName}</div>
        <div class="line-number">${result.line}</div>
        <div class="line-content">${result.content}</div>
      </div>
    `
      )
      .join("");

    // Set the webview's HTML content
    this.panel.webview.html = this.htmlContent.replace(/{{boxes}}/g, boxes);
  }
}
