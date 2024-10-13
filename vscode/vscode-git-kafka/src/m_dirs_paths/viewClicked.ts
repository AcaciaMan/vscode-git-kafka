import * as vscode from "vscode";
import { M_Clicks } from "../m_results/m_clicks";
import { M_Global } from "../m_util/m_global";
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);

export class ViewClicked {
  private _panel: vscode.WebviewPanel | undefined;

  context: vscode.ExtensionContext;
  htmlContent: string = "";
  mClicks: M_Clicks = M_Clicks.getInstance();
  m_global: M_Global = M_Global.getInstance();

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


      // Handle messages from the webview
      this._panel.webview.onDidReceiveMessage(
        async (message) => {
          switch (message.command) {
            case "showGitLog":
              await this.showGitLog(
                message.clickedFiles
              );
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
            "htmlClicked.html"
          )
        )
      );
      this.htmlContent = fs.readFileSync(htmlPath.fsPath, "utf8");

      let sClickedFiles = this.getClickedFiles();

      if (sClickedFiles === "") {
        sClickedFiles = "<div>No clicked files, please do git grep Execute Dirs and click on the file or line number.</div>";
      };

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
            <input type="checkbox" class="childCheckbox" checked="true" data-file-path="${value.getRelativePath()}">${value.getRelativePath()}
            </div>\n`;
        };
    
        return sClickedFiles;
    }


  private async showGitLog(clickedFiles: (string | undefined)[]) {
               const fullPath = this.m_global.workspaceFolder?.uri.fsPath;
               if (!fullPath) {
                 vscode.window.showErrorMessage("Workspace folder is undefined.");
                 return;
               }
               let sPath = "";
               if (!clickedFiles || clickedFiles.length === 0) {
                 sPath = "";
               } else {
                  sPath = `-- ${clickedFiles.join(" ")}`;
               };

               const command = `git log --reverse ${sPath}`;
               const { stdout, stderr } = await exec(command, {
                 cwd: fullPath,
               });

               if (stderr) {
                 vscode.window.showErrorMessage(`Error: ${stderr}`);
                 // this promise rejected
                 return undefined;
               }

                const outputChannel = vscode.window.createOutputChannel("Git Log");

                outputChannel.clear();
                outputChannel.append(stdout);
                outputChannel.show(true);

}
}