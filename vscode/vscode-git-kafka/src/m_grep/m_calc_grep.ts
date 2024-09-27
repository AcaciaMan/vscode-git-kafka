import * as vscode from "vscode";
import { M_Global } from "../m_util/m_global";
import { M_Dir } from "./m_dir";
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
import * as path from "path";

export class M_CalcGrep {
  // execute git grep command

  m_global: M_Global = M_Global.getInstance();

  searchTerm: string = "";

  m_command: string = "";

  sOut: string = "";

  constructor(searchTerm: string) {
    this.searchTerm = searchTerm;
  }

  public makeGrepCommand(): void {
    this.m_command = this.searchTerm;

    // in m_command after 'git grep' insert additional options '--max-depth=0 -n'
    this.m_command = this.m_command.replace(
      "git grep",
      "git grep --max-depth=0 -n"
    );

    if (this.m_global.pathSpec) {
      this.m_command += ` -- ${this.m_global.pathSpec}`;
    }
  }

  public async execGrepCommand(dir: M_Dir): Promise<void> {
    if (!this.m_global.workspaceFolder) {
      throw new Error("Workspace folder is undefined");
    }
    const fullPath = path.join(
      this.m_global.workspaceFolder.uri.fsPath,
      dir.getId()
    );

    const { stdout, stderr } = await exec(this.m_command, {
      cwd: fullPath,
    });

    if (stderr) {
      vscode.window.showErrorMessage(`Error: ${stderr}`);
      // this promise rejected
      return undefined;
    }

    this.sOut += stdout;
  }

  public async execGrepCommandAllDirs(): Promise<void> {

    this.makeGrepCommand();
    let mCalcDirs = await this.m_global.getCalcDirs();

    const aDirs = Object.values(mCalcDirs.dirs);


    let i=0;
    for (const dir of aDirs) {
        try {
            await this.execGrepCommand(dir);
        } catch (error) {
            // check if error is due to grep command not returning any results
            if (error instanceof Error && error.message.includes("Command failed: git grep")) {
                // log message for first 3 dirs
                if (i < 3) {
                    console.log(`No results found for dir: ${dir.getId()}`);
                    console.error(error);
                }
                i++;
            } else {



            console.log(`Executing grep command failed for dir: ${dir.getId()}`);
            console.error(error);
            }
        }
    }
  }
}
