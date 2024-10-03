import * as vscode from 'vscode';
import { M_Global } from "../m_util/m_global";
import { M_Dir } from '../m_grep/m_dir';
import { M_State } from './m_state';

export class M_Task {
  created_at: Date;
  m_global: M_Global = M_Global.getInstance();
  workspaceFolder: vscode.WorkspaceFolder = this.m_global.workspaceFolder ?? (() => { throw new Error("WorkspaceFolder is undefined"); })();
  aDirs: M_Dir[] = [];
  mState: M_State = new M_State();

    constructor() {
        this.created_at = new Date();
    }


    getId(): string {
        return this.created_at.getTime().toString();
    }

    async init() {
        const mCalcDirs = await this.m_global.getCalcDirs();
        const dDirs = mCalcDirs.dirs;
        this.aDirs = Object.values(dDirs).map((dir) => new M_Dir(dir.parent, dir.dir, 0, 0));
    }
}