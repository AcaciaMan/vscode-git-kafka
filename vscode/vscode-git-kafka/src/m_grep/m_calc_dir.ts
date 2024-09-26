// class for M_Dir objects calculations
import * as vscode from "vscode";
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
const fs = require("fs");
import * as path from "path";
import { M_Dir } from "./m_dir";
import { M_Tree } from "./m_tree";

export class M_Calc_Dir {
  // make a dictionary of M_Dir objects
  dirs: { [key: string]: M_Dir } = {};
  workspaceFolder: vscode.WorkspaceFolder;

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

  public calcDirsFromTree(trees: M_Tree[], calcDir: M_Dir): void {
    trees.forEach((tree) => {

      let m_dir: M_Dir;
      if (tree.objectType === "tree") {
        m_dir = new M_Dir(calcDir, tree.path, 0, 0);
        this.dirs[m_dir.getId()] = m_dir;

      } else if (tree.objectType === "blob") {
        calcDir.size += tree.objectSize;
        calcDir.fileCount += 1;
      }
    }
    );
    }

  public toString(): string {
    let sDirs = "";
    // convert dictionary to array of M_Dir objects
    const dirArray = Object.values(this.dirs);

    // sort array by size
    dirArray.sort((a, b) => b.size - a.size);

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
    console.log(`fullPath: ${fullPath}`);
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

    public async getTreeInDir(dir: M_Dir): Promise<M_Tree[] | undefined> {
        const fullPath = path.join(this.workspaceFolder.uri.fsPath, dir.getId());
        console.log(`fullPath: ${fullPath}`);
        const command = `git ls-tree --format="%(objecttype);;;%(path);;;%(objectsize)" HEAD`;
        const { stdout, stderr } = await exec(command, {
            cwd: fullPath,
        });

        if (stderr) {
            vscode.window.showErrorMessage(`Error: ${stderr}`);
            // this promise rejected
            return undefined;
        }

        console.log(`stdout: ${stdout}`);

        const sTrees = stdout.split("\n");
        sTrees.pop(); // remove last empty line

        let trees: M_Tree[] = [];
        sTrees.forEach((sTree: string) => {
            trees.push(M_Tree.fromString(sTree));
            console.log(M_Tree.fromString(sTree).toString());
        });

        return trees;
    }

    public async calcUnCountedDirs(): Promise<void> {
        let unCountedDirs = this.getUnCountedDirs();
        while (unCountedDirs.length > 0) {
            let unCountedDir = unCountedDirs.pop();
            if (unCountedDir) {
                let trees = await this.getTreeInDir(unCountedDir);
                if (trees) {
                    this.calcDirsFromTree (trees, unCountedDir);
                }
                unCountedDir.hasCountedFiles = true;
            }
            unCountedDirs = this.getUnCountedDirs();
        }
    }
    

}