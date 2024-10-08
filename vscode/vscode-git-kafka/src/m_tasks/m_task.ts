import * as vscode from 'vscode';

export enum M_Task_State {
  InSearch = 0,
  Cancelled = 1,
  NewSearch = 2,
}

export class M_Task {
  created_at: Date;
  workspaceFolder: vscode.WorkspaceFolder =
    vscode.workspace.workspaceFolders?.[0] ??
    (() => {
      throw new Error("WorkspaceFolder is undefined");
    })();
  mState: M_Task_State = M_Task_State.InSearch;
  sSearchTerm: string;
  sSort: string = "";
  outputChannel: vscode.OutputChannel;
  pInitialized: Promise<void> | undefined;
  pExecuted: Promise<void> | undefined;
  sStdout: string = "";

  constructor(sSearchTerm: string, outputChannelName: string) {
    // Validate sSearchTerm
    if (
      !sSearchTerm ||
      typeof sSearchTerm !== "string" ||
      sSearchTerm.trim() === ""
    ) {
      throw new Error("Invalid search term");
    }

    // Validate outputChannelName
    if (
      !outputChannelName ||
      typeof outputChannelName !== "string" ||
      outputChannelName.trim() === ""
    ) {
      throw new Error("Invalid output channel name");
    }

    this.created_at = new Date();
    this.sSearchTerm = sSearchTerm;
    this.outputChannel = vscode.window.createOutputChannel(outputChannelName);
  }

  getId(): string {
    return this.created_at.getTime().toString();
  }

}

