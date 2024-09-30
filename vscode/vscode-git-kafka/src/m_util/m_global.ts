import { M_TestType, RegexpDir } from "../m_dirs_paths/regexpDir";
import { M_Calc_Dir } from "../m_grep/m_calc_dir";
import * as vscode from "vscode";


// singleton class to store global variables
export class M_Global {
  // singleton instance
  private static instance: M_Global;

  // private constructor
  private constructor() {
    // do nothing
  }

  // get singleton instance
  public static getInstance(): M_Global {
    if (!M_Global.instance) {
      M_Global.instance = new M_Global();
    }
    return M_Global.instance;
  }

  // global variables
  includeDirs: string = "";
  excludeDirs: string = "";
  pathSpec: string = "";

  aIncludeDirs: RegexpDir[] = [];
  aExcludeDirs: RegexpDir[] = [];
  workspaceFolder: vscode.WorkspaceFolder | undefined;
  promiseCalcDirs: Promise<void> | undefined;
  m_calc_dir: M_Calc_Dir | undefined;
  workspaceUUID: string = "";
  sortType: string = "";

  public setWorkspaceUUID(workspaceUUID: string): void {
    this.workspaceUUID = workspaceUUID;
  }

  public setSortType(sortType: string): void {
    this.sortType = sortType;
        vscode.workspace
          .getConfiguration("vscode-git-kafka")
          .update("sort", sortType, vscode.ConfigurationTarget.Workspace);
  }

  // set directories
  public setDirs(
    includeDirs: string,
    excludeDirs: string,
    workspaceFolder: vscode.WorkspaceFolder | undefined
  ): void {
    this.includeDirs = includeDirs;
    this.aIncludeDirs = includeDirs.split(",").map((s) => new RegexpDir(s));
    this.excludeDirs = excludeDirs;
    this.aExcludeDirs = excludeDirs.split(",").map((s) => new RegexpDir(s));

    this.workspaceFolder = workspaceFolder;
    // run in background to load the directories
    this.loadDirs();
  }

  // load directories
  public loadDirs(): void {
            if (!this.workspaceFolder) {
              vscode.window.showErrorMessage("No workspace folder found");
              return;
            }
    this.m_calc_dir = new M_Calc_Dir(this.workspaceFolder);
    this.promiseCalcDirs = this.m_calc_dir.calcUnCountedDirs();
  }

  public async getCalcDirs(): Promise<M_Calc_Dir> {
    await this.promiseCalcDirs;
    return this.m_calc_dir as M_Calc_Dir;
  }



  // set files
  public setPathSpec(pathSpec: string): void {
    this.pathSpec = pathSpec;
  }

  // test if dir is included and not excluded
  public testDir(dir: string): boolean {
    return (
      this.aIncludeDirs.some((rd) => rd.test(dir, M_TestType.INCLUDE)) &&
      !this.aExcludeDirs.some((rd) => rd.test(dir, M_TestType.EXCLUDE))
    );
  }
}