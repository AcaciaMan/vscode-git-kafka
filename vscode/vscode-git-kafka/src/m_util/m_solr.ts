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

  // methods
  public refresh() {
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
    if (!solr) {
      return;
    }

    await this.solrClient.commit();
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
    if (!solr) {
      return;
    }
    await this.solrClient.add(this.mDoc);
  }

  async searchSolr(mTask: M_Task, sExeId: string) {
        const query = this.solrClient
          .query()
          .q(mTask.sSearchTerm).fq({field: "taskId", value: sExeId});

        const searchResponse = await this.solrClient.search(query);
        mTask.sStdout = searchResponse;
  }

  hasSolrClient() {
    return solr ? true : false;
  }
}
