import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class WordCloudProvider {
  private static readonly viewType = "wordCloud";
  private _context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const htmlPath = vscode.Uri.file(
      path.join(this._context.extensionPath, "resources", "htmlWordCloud.html")
    );

    const html = fs.readFileSync(htmlPath.fsPath, "utf8");
    return html;
  }

  public dispose() {
    // Dispose resources if needed
  }

  public static createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    const view = vscode.window.createWebviewPanel(
      WordCloudProvider.viewType,
      "Word Cloud",
      column || vscode.ViewColumn.One,
      {
        enableFindWidget: true,
        enableCommandUris: true,
        retainContextWhenHidden: true,
      }
    );

    const provider = new WordCloudProvider(context);
    view.webview.options = {
      enableScripts: true,
    };
    view.webview.html = provider._getHtmlForWebview(view.webview);

    view.onDidDispose(() => {
      provider.dispose();
    });

    // Handle messages from the webview
    view.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "generateWordCloud":
          const data = provider.getDataForWordCloud(); // Replace with actual data retrieval method
          view.webview.postMessage({
            command: "generateWordCloud",
            data: data,
          });
          break;
      }
    });
  }

  private getDataForWordCloud(): any {
    // Replace with actual data retrieval logic
    return [
      { text: "Visual", size: 40 },
      { text: "Studio", size: 30 },
      { text: "Code", size: 20 },
      { text: "extension", size: 50 },
      { text: "git", size: 60 },
      { text: "commands", size: 25 },
      { text: "store", size: 35 },
      { text: "results", size: 45 },
      { text: "Solr", size: 55 },
    ];
  }
}
