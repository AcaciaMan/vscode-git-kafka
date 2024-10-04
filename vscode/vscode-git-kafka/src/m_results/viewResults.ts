import * as vscode from "vscode";
import { M_Clicks } from "./m_clicks";
import { M_Result } from "./m_result";
import { M_Chunks } from "../m_grep/m_chunks";
import { M_CalcGrep } from "../m_grep/m_calc_grep";
import { M_Global } from "../m_util/m_global";

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
 m_global: M_Global = M_Global.getInstance();

  public async newSearch(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel, mCalcGrep: M_CalcGrep): Promise<void> {
        const mClicks: M_Clicks = M_Clicks.getInstance();

    if (this.panel) {
      this.panel.dispose();
    }


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
      const path = require("path");
      const htmlPath = this.panel.webview.asWebviewUri(
        vscode.Uri.file(
          path.join(context.extensionPath, "resources", "htmlResults.html")
        )
      );
      this.htmlContent = fs.readFileSync(htmlPath.fsPath, "utf8");
    



    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "openFile":
            this.openFileInEditor(
              message.filePath,
              message.lineStart,
              message.lineEnd
            );
            mClicks.incrementClicks(message.dirPath);
            return;
          case "clickFileName":
            mClicks.incrementClicks(message.dirPath);
            return;
        }
      },
      undefined,
      context.subscriptions
    );

        // Add event listener for when the panel becomes visible
    this.panel.onDidChangeViewState((e) => {
      if (e.webviewPanel.visible) {
        this.panel!.webview.html = this.htmlContent;
        this.showResults(outputChannel, true, mCalcGrep);
      }
    });

    // Add event listener for when the panel is disposed
    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

    // Set the webview's HTML content
    this.panel.webview.html = this.htmlContent;

    this.showResults(outputChannel, false, mCalcGrep);

  }

  public async showResults(outputChannel: vscode.OutputChannel, visible: boolean, mCalcGrep: M_CalcGrep): Promise<void> {
    try {
      const mCalcDirs = await this.m_global.getCalcDirs();
      // get length of dictionary mCalcDirs.dirs
      const iTotalSize = Object.keys(mCalcDirs.dirs).length;

      
      for (let i = 0; i < iTotalSize; i++) {
        let j = 0;
        while (
          (mCalcGrep.mChunks.aPromises[i] === undefined) && (j<600)
        ) {
          j++;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        await mCalcGrep.mChunks.aPromises[i];
        j = 0;
                while (
                  mCalcGrep.mChunks.aResult[i] === undefined &&
                  j < 600
                ) {
                  j++;
                  await new Promise((resolve) => setTimeout(resolve, 100));
                }
        if (!visible) {
          outputChannel.append(mCalcGrep.mChunks.aResult[i].sResult);
          outputChannel.show();
        }
        this.addSearchResults(mCalcGrep.mChunks.aResult[i]);
      }
    } catch (error) {
      console.error(
        `Error executing grep in parallel: ${(error as Error).message}`
      );
    }
  }

  public addSearchResults(mResult: M_Result) {

    for (let i = 0; i < mResult.aResultFile.length; i++) {
      const resultFile = mResult.aResultFile[i];
            let fileName = resultFile.toString();
            let line = resultFile.toStringItems();
            let content = resultFile.toStringItemsText();



      const box = `
      <div class="box">
        <div class="file-name" data-dir="${resultFile.file.dir.getId()}">${fileName}</div>
        <div class="file-line">${line}</div>
        <div class="line-content">${content}</div>
      </div>
    `;
      this.panel?.webview.postMessage({
        command: "addBox",
        box: box
      });
    }

  }

  // show results in new tab
  public showResultsInNewTab(
    results: {
      fileName: string;
      line: string;
      content: string;
      dirPath: string;
    }[],
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
      const path = require("path");
      const htmlPath = this.panel.webview.asWebviewUri(
        vscode.Uri.file(
          path.join(context.extensionPath, "resources", "htmlResults.html")
        )
      );
      this.htmlContent = fs.readFileSync(htmlPath.fsPath, "utf8");
    }

    const mClicks: M_Clicks = M_Clicks.getInstance();

    // show result content in colapsable divs

    const boxes = results
      .map(
        (result) => `
      <div class="box">
        <div class="file-name" data-dir="${result.dirPath}">${result.fileName}</div>
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
            this.openFileInEditor(
              message.filePath,
              message.lineStart,
              message.lineEnd
            );
            mClicks.incrementClicks(message.dirPath);
            return;
          case "clickFileName":
            mClicks.incrementClicks(message.dirPath);
            return;
        }
      },
      undefined,
      context.subscriptions
    );
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
