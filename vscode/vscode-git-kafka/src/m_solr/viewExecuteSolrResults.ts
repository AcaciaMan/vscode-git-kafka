import { M_SearchSolr } from "../m_tasks/m_search_executor";
import { M_Status } from "../m_tasks/m_status";
import { M_Global } from "../m_util/m_global";
import * as vscode from "vscode";

export class ViewExecuteSolrResults {
  // singleton instance
  private static instance: ViewExecuteSolrResults;

  // private constructor
  private constructor() {
    // do nothing
  }

  // get singleton instance
  public static getInstance(): ViewExecuteSolrResults {
    if (!ViewExecuteSolrResults.instance) {
      ViewExecuteSolrResults.instance = new ViewExecuteSolrResults();
    }
    return ViewExecuteSolrResults.instance;
  }

  panel: vscode.WebviewPanel | undefined;
  htmlContent: string = "";
  m_global: M_Global = M_Global.getInstance();
  mStatus: M_Status = M_Status.getInstance();
  mSolrExecutor: M_SearchSolr= this.mStatus.getSolrExecutor();

  public async newSearch(context: vscode.ExtensionContext): Promise<void> {
    this.mSolrExecutor = this.mStatus.getSolrExecutor();


    if (this.panel) {
      this.panel.dispose();
    }

    // create new webview panel
    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel(
        "searchResults", // Identifies the type of the webview. Used internally
        "Solr Results", // Title of the panel displayed to the user
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
          path.join(context.extensionPath, "resources", "htmlExecuteSolrResults.html")
        )
      );
      this.htmlContent = fs.readFileSync(htmlPath.fsPath, "utf8");
    }

    // add dispose listener to panel
    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });

    const sHighlightedText = this.showResults(this.mSolrExecutor.mSolrSearch.solrResponse);

    // set html content
    this.panel.webview.html = this.htmlContent.replace(
        "<!-- highlightedText -->",
        sHighlightedText
        );
}


// from executor recieve solr response and make highlighted text as html paragraphs
public showResults(solrResponse: any): string {
  // get highlighted text
  /*
  {"responseHeader":{"status":0,"QTime":3,"params":{"hl.snippets":"1000000","q":"brackets","hl":"true","hl.simple.post":"</em>","fl":"taskId","hl.fragsize":"150","fq":"taskId:1728216182176","hl.fl":"resultText","wt":"json","hl.simple.pre":"<em>"}},
  "response":{"numFound":1,"start":0,"numFoundExact":true,"docs":[{"taskId":"1728216182176"}]
  },
  "highlighting":{"8h2vr5pc-f1ed-g88h-tlzy-xc0000000000":{"resultText":[" distributed\r\nLICENSE:          or as an addendum to the NOTICE text from the Work, provided\r\nLICENSE:      the <em>brackets</em>!)  The text should be enclosed in the"]}}}
    */
  const highlightedText = solrResponse.highlighting;
  const keys = Object.keys(highlightedText);
  const htmlParagraphs = keys.map((key) => {
    const highlights = highlightedText[key].resultText;
    if (!highlights) {
      return "";
    }
    const htmlHighlights = highlights.map((highlight: string) => {
      return `<p>${highlight}</p>`;
    });
    return htmlHighlights.join("");
  });

  return htmlParagraphs.join("");


}

}