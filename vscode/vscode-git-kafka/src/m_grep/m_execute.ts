import { M_Task } from "../m_tasks/m_task";
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
import * as vscode from "vscode";

export class M_Execute {

    mTask: M_Task;

    constructor(mTask: M_Task) {
        this.mTask = mTask;
    }

    async execute() {

      await this.mTask.pInitialized;  
      // Execution logic
      // benchmark start
      const start = new Date().getTime();
      const { stdout, stderr } = await exec(this.mTask.sSearchTerm, {
        cwd: this.mTask.workspaceFolder.uri.fsPath,
      });
      // benchmark end
      const end = new Date().getTime();
      const time = end - start;
      console.log(`Search Time: ${time} ms`);

      if (stderr) {
        vscode.window.showErrorMessage(`Error: ${stderr}`);
        return;
      }

      this.mTask.sStdout = stdout;
      this.mTask.outputChannel.append(stdout);
        this.mTask.outputChannel.show();
                  vscode.window.showInformationMessage("Execute Done");
    }
}