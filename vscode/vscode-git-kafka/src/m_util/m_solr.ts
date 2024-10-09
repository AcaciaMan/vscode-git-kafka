const solr = require("solr-client");
//import solr from "solr-client";
import * as vscode from "vscode";
import { M_Global } from "./m_global";
import { TaskExecute, TaskExecutor } from "../m_tasks/m_task_executor";
import { M_Task } from "../m_tasks/m_task";

export class M_Solr {
  // singleton
  private static instance: M_Solr;
  static getInstance() {
    if (!M_Solr.instance) {
      M_Solr.instance = new M_Solr();
    }
    return M_Solr.instance;
  }
  // constructor
  constructor() {}

  m_global = M_Global.getInstance();
  solrClient: any;
  mDoc: object = {};
  bCheckFirstTime: boolean = true;
  bSolrReachable: boolean = true;

  // methods
  public refresh() {
    this.bCheckFirstTime = true;
    this.bSolrReachable = true;
    // get solrClient from settings
    const solrClient = vscode.workspace
      .getConfiguration("vscode-git-kafka")
      .get("solrClient") as object;
    this.m_global.solrClient = solrClient;
    this.createClient();
  }

  createClient() {
    if (!solr) {
      return;
    }
    this.solrClient = solr.createClient(this.m_global.solrClient);
  }

  async commit() {
    if (!this.hasSolrClient()) {
      return;
    }
    try {
      await this.solrClient.commit();
    } catch (error) {
      console.error(error);
    }
  }

  makeExecuteDoc(mExecuteTask: TaskExecute) {
    this.mDoc = {
      id: mExecuteTask.mId,
      workspaceUUID: this.m_global.workspaceUUID,
      workspaceFolder: mExecuteTask.task.workspaceFolder.uri.fsPath,
      searchTerm: mExecuteTask.task.sSearchTerm,
      created: mExecuteTask.task.created_at,
      taskId: mExecuteTask.task.getId(),
      resultText: mExecuteTask.task.sStdout,
      queryTime: mExecuteTask.executionTime,
    };
  }

  async addDoc() {
    if (!this.hasSolrClient()) {
      return;
    }
    try {
      await this.solrClient.add(this.mDoc);
    } catch (error) {
      console.error(error);
    }
  }

  async searchSolr(mTask: M_Task, sExeId: string) {
    const query = this.solrClient
      .query()
      .q(mTask.sSearchTerm)
      .fq({ field: "taskId", value: sExeId })
      .hl({ on: true, fl: "resultText", fragsize: 150, snippets: 1000000 })
      .fl("taskId");

    /*
        const client: solr.Client;
        client.query().hl({on: true, fl: "resultText", fragsize: 150, snippets: 1000000}).sort({}).rows(1000000);
        client.ping(); 
        client.
         */

    const searchResponse = await this.solrClient.search(query);
    mTask.sStdout = searchResponse;
    return searchResponse;
  }

  async searchSolrDirs(mTask: M_Task, sExeId: string) {

    const query = this.solrClient
      .query()
      .q(mTask.sSearchTerm)
      .sort(mTask.sSort)
      .fq({ field: "taskId", value: sExeId })
      .hl({ on: true, fl: "resultText", fragsize: 150, snippets: 1000000 })
      .fl("id").rows(1000000);

    /*
        const client: solr.Client;
        client.query().hl({on: true, fl: "resultText", fragsize: 150, snippets: 1000000}).;
        client.ping(); 
        client.
         */
  console.log(mTask);
        console.log("query: " +  JSON.stringify(  query));
    const searchResponse = await this.solrClient.search(query);
    mTask.sStdout = searchResponse;
    return searchResponse;
  }

  async hasSolrClient() {
    if (!this.bSolrReachable) {
      return false;
    }

    if (!solr && this.bCheckFirstTime) {
      this.bCheckFirstTime = false;
      vscode.window.showErrorMessage(
        "Not installed: solr-client. Run npm install solr-client"
      );
      this.bSolrReachable = false;
    }

    // try to ping solr
    if (this.bCheckFirstTime) {
      this.bCheckFirstTime = false;
      try {
        const pingResponse = await this.solrClient.ping();
        console.log(pingResponse);
        const query = this.solrClient.query().q("*:*").rows(1);
        const searchResponse = await this.solrClient.search(query);
        console.log(searchResponse);
        if (searchResponse.response.numFound > 1000000) {
          vscode.window.showErrorMessage(
            "Solr has more than 1,000,000 documents. Please delete some documents."
          );
        }
      } catch (error) {
        if ((error as { code: string }).code === "ECONNREFUSED") {
          vscode.window.showErrorMessage(
            "Solr is not reachable. Check solrClient settings " +
              JSON.stringify(this.m_global.solrClient)
          );
          this.bSolrReachable = false;
        } else {
          vscode.window.showErrorMessage("Solr error: " + error);
          this.bSolrReachable = false;
        }
      }
    }

    return this.bSolrReachable;
  }
}
