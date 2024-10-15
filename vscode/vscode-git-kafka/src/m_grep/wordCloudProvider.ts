import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { M_Status } from "../m_tasks/m_status";

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
    const mStatus = M_Status.getInstance();
    const tExecutor = mStatus.getExecutor();
    if (tExecutor) {
      const mChunks = tExecutor.mCalcGrep.mChunks;
      const dWords = mChunks.getWordsCount();

      // Find the minimum and maximum word frequencies
      const frequencies = Object.values(dWords);
      const minFreq = Math.min(...frequencies);
      const maxFreq = Math.max(...frequencies);

      // Define the desired size range
      const minSize = 30;
      const maxSize = 60;

      let diff = maxFreq - minFreq;
        if (diff === 0) {
            diff = 1;
        }

      // Normalize the sizes
      return Object.keys(dWords).map((key) => {
        const frequency = dWords[key];
        const size =
          minSize +
          ((frequency - minFreq) / diff) * (maxSize - minSize);
        return { text: key, size: size };
      });
    }
    return [];
  }
}