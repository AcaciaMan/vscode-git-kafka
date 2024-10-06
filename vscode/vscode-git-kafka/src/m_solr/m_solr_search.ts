import { M_Task } from "../m_tasks/m_task";
import { M_Solr } from "../m_util/m_solr";
import * as vscode from "vscode";

export class M_SolrSearch {
    mSolr = M_Solr.getInstance();
    mTask: M_Task;
    sExeId: string;
    solrResponse: any;
    constructor(mTask: M_Task, sExeId: string) {
        this.mTask = mTask;
        this.sExeId = sExeId;
    }

    async search() {
        this.solrResponse =  await this.mSolr.searchSolr(this.mTask, this.sExeId);
        this.mTask.outputChannel.append(this.mTask.sStdout);
                this.mTask.outputChannel.show();
                vscode.window.showInformationMessage("Solr Search Done");

    }
}