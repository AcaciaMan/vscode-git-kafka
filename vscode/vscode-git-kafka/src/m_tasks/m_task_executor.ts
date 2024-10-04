import { M_Execute } from "../m_grep/m_execute";
import { M_Dir } from "../m_grep/m_dir";
import { M_CalcGrep } from "../m_grep/m_calc_grep";
import { M_Global } from "../m_util/m_global";
import { M_Task } from "./m_task";

export class TaskExecutor {
  task: M_Task;
  mExecute: M_Execute;
  mCalcGrep: M_CalcGrep;
  m_global: M_Global = M_Global.getInstance();

  constructor(task: M_Task) {
    this.task = task;
    this.mExecute = new M_Execute(task);
    this.mCalcGrep = new M_CalcGrep(task);
  }

  async init() {
    // Initialization logic
  }

  async execute() {
    // Execution logic
  }
}

export class TaskExecute extends TaskExecutor {
    constructor(task: M_Task) {
        super(task);
    }
    
    async execute() {
        await super.execute();
        // Additional execution logic
        await this.mExecute.execute();
    }
    }

export class TaskExecuteDirs extends TaskExecutor {
  aDirs: M_Dir[] = [];

  constructor(task: M_Task) {
    super(task);
  }

  async init() {
    await super.init();
    const mCalcDirs = await this.m_global.getCalcDirs();
    const dDirs = mCalcDirs.dirs;
    this.aDirs = Object.values(dDirs).map((dir) => new M_Dir(dir.parent, dir.dir, 0, 0));
  }

  async execute() {
    await this.task.pInitialized;
    await super.execute();
    this.mCalcGrep.execGrepCommandAllDirs();
  }
}
