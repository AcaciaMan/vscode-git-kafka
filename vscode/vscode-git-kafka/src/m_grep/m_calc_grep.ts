import * as vscode from "vscode";
import { M_Global } from "../m_util/m_global";
import { M_Dir } from "./m_dir";
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
import * as path from "path";
import { M_Result } from "../m_results/m_result";
import { M_Util } from "../m_util/m_util";
import { M_Chunks } from "./m_chunks";

export class M_CalcGrep {
  // execute git grep command

  m_global: M_Global = M_Global.getInstance();
  mUtil: M_Util = M_Util.getInstance();

  searchTerm: string = "";

  m_command: string = "";

  mChunks: M_Chunks = new M_Chunks(5);
  i = 0;
  iTotalSize = 0;

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
    dir: M_Dir
  ): Promise<string> {
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
    this.iTotalSize = aDirs.length;

    // order aDirs by sortType
    this.mUtil.sortDirs(aDirs);

    this.mChunks = new M_Chunks(5);

    // execute grep command for each dir with Promise.all to run in parallel
    try {


      let aPromises = this.mChunks.processChunk(aDirs, this);
      while (aPromises.length > 0) {
        const results = await Promise.all(aPromises);
        this.mChunks.addChunkResults(results, aDirs);
        aPromises = this.mChunks.processChunk(aDirs, this);
      }

    } catch (error) {
      console.error(
        `Error executing grep in parallel: ${(error as Error).message}`
      );
    }
  }
}


