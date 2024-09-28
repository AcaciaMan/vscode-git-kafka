import * as vscode from "vscode";

// class to show results in new tab
export class ViewResults {
  // show results in new tab
  public showResultsInNewTab(
    results: { fileName: string; line: string }[],
    context: vscode.ExtensionContext
  ): void {
    const panel = vscode.window.createWebviewPanel(
      "searchResults", // Identifies the type of the webview. Used internally
      "Search Results", // Title of the panel displayed to the user
      vscode.ViewColumn.One, // Editor column to show the new webview panel in
      {} // Webview options. More on these later.
    );

    // load HTML content from htmlResults.html
    const fs = require("fs");
    const htmlPath = vscode.Uri.joinPath(
      context.extensionUri,
      "src",
      "m_results",
      "htmlResults.html"
    );
    const htmlContent = fs.readFileSync(htmlPath.fsPath, "utf8");

    const boxes = results
      .map(
        (result) => `
      <div class="box">
        <div class="file-name">${result.fileName}</div>
        <div class="line-number">${result.line}</div>
      </div>
    `
      )
      .join("");

    // Set the webview's HTML content
    panel.webview.html = htmlContent.replace(/{{boxes}}/g, boxes);
  }
}
