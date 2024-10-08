import * as vscode from "vscode";

export class ViewSolrDirsResults {
  private _panel: vscode.WebviewPanel | undefined;
  private _extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this._extensionUri = extensionUri;
  }

  public showSolrDirsResults(solrDirsResults: string) {
    const columnToShowIn = vscode.ViewColumn.One;

    if (this._panel) {
      this._panel.reveal(columnToShowIn);
    } else {
      this._panel = vscode.window.createWebviewPanel(
        "solrDirsResults",
        "Solr Dirs Results",
        columnToShowIn,
        {
          enableScripts: true,
          localResourceRoots: [this._extensionUri],
        }
      );

      this._panel.webview.html = this._getHtmlForWebview(solrDirsResults);
    }
  }

  private _getHtmlForWebview(solrDirsResults: string) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${this._panel?.webview.cspSource};">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Solr Dirs Results</title>
    </head>
    <body>
      <h1>Solr Dirs Results</h1>
      <pre>${solrDirsResults}</pre>
    </body>
    </html>`;
    }
}