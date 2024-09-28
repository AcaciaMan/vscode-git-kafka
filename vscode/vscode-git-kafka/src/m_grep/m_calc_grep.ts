import * as vscode from "vscode";
import { M_Global } from "../m_util/m_global";
import { M_Dir } from "./m_dir";
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
import * as path from "path";
import { M_Result } from "../m_results/m_result";

export class M_CalcGrep {
  // execute git grep command

  m_global: M_Global = M_Global.getInstance();

  searchTerm: string = "";

  m_command: string = "";

  sOut: string = "";

  aResult: M_Result[] = [];
  i = 0;

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

  public async execGrepCommand(
    dir: M_Dir,
    searchString: string
  ): Promise<String> {
    const m_gl = M_Global.getInstance();
    if (!m_gl.workspaceFolder) {
      throw new Error("Workspace folder is undefined");
    }
    const fullPath = path.join(m_gl.workspaceFolder.uri.fsPath, dir.getId());
    try {
      const { stdout, stderr } = await exec(this.m_command, {
        cwd: fullPath,
      });

      if (stderr) {
        vscode.window.showErrorMessage(`Error: ${stderr}`);
        // this promise rejected
        return "";
      }

      return stdout;
    } catch (error) {
      // check if error is due to grep command not returning any results
      if (
        error instanceof Error &&
        error.message.includes("Command failed: git grep")
      ) {
        // log message for first 3 dirs
        if (this.i < 3) {
          console.log(`No results found for dir: ${dir.getId()}`);
          console.error(error);
        }
        this.i++;
      } else {
        console.log(`Executing grep command failed for dir: ${dir.getId()}`);
        console.error(error);
      }
    }
    return "";
  }

  public async execGrepCommandAllDirs(): Promise<void> {
    this.i = 0;
    this.makeGrepCommand();
    let mCalcDirs = await this.m_global.getCalcDirs();

    const aDirs = Object.values(mCalcDirs.dirs);

    // execute grep command for each dir with Promise.all to run in parallel
    try {
      const results = await Promise.all(
        aDirs.map((dir) => this.execGrepCommand(dir, this.m_command))
      );
      results.forEach((result, index) => {
        //console.log(`Results for ${aDirs[index]}:\n${result}`);
        this.sOut += result;
        const mResult = new M_Result(result.toString(), aDirs[index]);
        mResult.fillResultFile();
        this.aResult.push(mResult);
      });
    } catch (error) {
      console.error(
        `Error executing grep in parallel: ${(error as Error).message}`
      );
    }
  }
}


