import { M_Execute } from "../m_grep/m_execute";
import { M_Dir } from "../m_grep/m_dir";
import { M_CalcGrep } from "../m_grep/m_calc_grep";
import { M_Global } from "../m_util/m_global";
import { M_Task } from "./m_task";
import { M_Util } from "../m_util/m_util";
import { M_Solr } from "../m_util/m_solr";

export class TaskExecutor {
  task: M_Task;
  mExecute: M_Execute;
  mCalcGrep: M_CalcGrep;
  m_global: M_Global = M_Global.getInstance();
  endTime: Date = new Date();
  executionTime: number = 0;
  mSolr = M_Solr.getInstance();

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

    mUtil = M_Util.getInstance();
    
    mId = this.mUtil.getUUID();

    async execute() {
        await super.execute();
        // Additional execution logic
        await this.mExecute.execute();
        this.endTime = new Date();
        this.executionTime = this.endTime.getTime() - this.task.created_at.getTime();
        if (await this.mSolr.hasSolrClient()) {
           this.mSolr.makeExecuteDoc(this);
           await this.mSolr.addDoc();
           await this.mSolr.commit();
        }
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
    this.task.mChunks = this.mCalcGrep.mChunks;
  }

  async execute() {
    await this.task.pInitialized;
    await super.execute();
    this.mCalcGrep.execGrepCommandAllDirs();
  }
}
