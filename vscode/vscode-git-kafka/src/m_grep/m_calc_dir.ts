// class for M_Dir objects calculations
import * as vscode from "vscode";
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
const fs = require("fs");
import * as path from "path";
import { M_Dir } from "./m_dir";
import { M_File } from "./m_file";
import { M_Global } from "../m_util/m_global";

export class M_Calc_Dir {
  // make a dictionary of M_Dir objects
  dirs: { [key: string]: M_Dir } = {};

  workspaceFolder: vscode.WorkspaceFolder;

  m_files: M_File[] = [];

  m_global: M_Global = M_Global.getInstance();

    constructor(workspaceFolder: vscode.WorkspaceFolder) {
        this.workspaceFolder = workspaceFolder;
        const rootDir = new M_Dir(undefined, ".", 0, 0);
        this.dirs[rootDir.getId()] = rootDir;
    }

  public calcDirs(
    files: string[],
    calcDir: M_Dir
  ): void {

    files.forEach((file) => {
      // dir name of file
      const dir = path.dirname(file);
      const fullPath = path.join(this.workspaceFolder.uri.fsPath, calcDir.getId(), file);
      console.log(`fullPath: ${fullPath}`);
      const m_dir = new M_Dir(calcDir, dir, 0, 0);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        m_dir.size = 0;
        m_dir.fileCount = 0;
      } else {
        m_dir.size = stats.size;
        m_dir.fileCount = 1;
      }
      // if m_dir.id not in dirs, add it, else update size and file count
      if (m_dir.getId() in this.dirs) {
        this.dirs[m_dir.getId()].size += m_dir.size;
        this.dirs[m_dir.getId()].fileCount += m_dir.fileCount;
      } else {
        this.dirs[m_dir.getId()] = m_dir;
      }
    });

  }

  public calcDirsFromTree(trees: string[], calcDir: M_Dir): void {
    trees.forEach((tree) => {

      let m_dir: M_Dir;
      m_dir = new M_Dir(calcDir, tree, 0, 0);
        this.dirs[m_dir.getId()] = m_dir;
    }
    );
    calcDir.hasCountedFiles = true;
    }

  public checkShouldProcessDirs(): void {
    Object.values(this.dirs).forEach((dir) => {
      if (dir.shouldProcessCheck) {
        dir.shouldProcess = this.m_global.testDir(dir.getId());
        dir.shouldProcessCheck = false;
      }
    });

    // remove dirs that should not be processed
    Object.values(this.dirs).forEach((dir) => {
      if (!dir.shouldProcess) {
        delete this.dirs[dir.getId()];
      }
    });

    // remove files that are not in processed dirs
    this.m_files = this.m_files.filter((file) => {
      return file.dir.getId() in this.dirs;
    });
  }  

  public toString(): string {
    let sDirs = "";
    // convert dictionary to array of M_Dir objects
    const dirArray = Object.values(this.dirs);

    // dirArray concatenate 10 dirs
    dirArray.slice(0, 50);

    // convert array to string
    dirArray.forEach((dir) => {
      sDirs += `${dir.toString()}\n`;
    });

    return sDirs;
  }


  public getUnCountedDirs(): M_Dir[] {
    let unCountedDirs: M_Dir[] = [];
    Object.values(this.dirs).forEach((dir) => {
      if (!dir.hasCountedFiles) {
            unCountedDirs.push(dir);
      }
    });
    return unCountedDirs;
  }

  public async getFilesInDir(dir: M_Dir): Promise<string[] | undefined> {
    const fullPath = path.join(this.workspaceFolder.uri.fsPath, dir.getId());
    //console.log(`fullPath: ${fullPath}`);
            const command = `git grep -l --max-depth=1 ""`;
        const { stdout, stderr } = await exec(command, {
            cwd: fullPath,
        });

        if (stderr) {
            vscode.window.showErrorMessage(`Error: ${stderr}`);
            // this promise rejected
            return undefined;
        }


        let files: string[] = stdout.split("\n");

        files.pop(); // remove last empty line

        return files;
    }

    public async getTreeInDir(dir: M_Dir): Promise<string[] | undefined> {
        const fullPath = path.join(this.workspaceFolder.uri.fsPath, dir.getId());
        const command = `git ls-tree -d --name-only HEAD`;
        const { stdout, stderr } = await exec(command, {
            cwd: fullPath,
        });

        if (stderr) {
            vscode.window.showErrorMessage(`Error: ${stderr}`);
            // this promise rejected
            return undefined;
        }

        const sTrees: string[] = stdout.split("\n");
        sTrees.pop(); // remove last empty line

        return sTrees;
    }

    public async calcUnCountedDirs(): Promise<void> {
        let unCountedDirs = this.getUnCountedDirs();
        while (unCountedDirs.length > 0) {
            // process unCountedDirs in parallel with Promise.all
            let trees = await Promise.all(
                unCountedDirs.map((dir) => this.getTreeInDir(dir))
              );
              trees.forEach((tree, index) => {
                              let dir = unCountedDirs[index];
              
                              if (tree) {
                                this.calcDirsFromTree(tree, dir);
                              }
              
                            });


                unCountedDirs = this.getUnCountedDirs();


              };


        this.checkShouldProcessDirs();
    }

    public toStringFiles(): string {
        let sFiles = "";
        // sort array by size and return 50 biggest files
        this.m_files.sort((a, b) => b.size - a.size);
        const m_files50 = this.m_files.slice(0, 50);
        m_files50.forEach((file) => {
            sFiles += `${file.toString()}\n`;
        });
        return sFiles;
    }

}