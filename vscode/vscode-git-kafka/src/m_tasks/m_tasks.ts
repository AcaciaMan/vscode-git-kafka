import { M_Global } from "../m_util/m_global";
import { M_Task } from "./m_task";

export class M_Tasks {
    m_global: M_Global = M_Global.getInstance();
    tasks: M_Task[] = [];
    pAddingTask: Promise<void> | undefined;
    
    // make class a singleton
    private static instance: M_Tasks;
    private constructor() { }
    static getInstance(): M_Tasks {
        if (!M_Tasks.instance) {
            M_Tasks.instance = new M_Tasks();
        }
        return M_Tasks.instance;
    }
    
    addTask(): M_Task {
        // set previos tasks mState from InSearch to NewSearch
        for (let i = this.tasks.length - 1; i >= 0; i--) {
            if (this.tasks[i].mState.mState === this.tasks[i].mState.enumStates.InSearch) {
                this.tasks[i].mState.mState = this.tasks[i].mState.enumStates.NewSearch;
            }

            if (this.tasks[i].mState.mState === this.tasks[i].mState.enumStates.NewSearch) {
                break;
            }
        }

        const task = new M_Task();
        this.pAddingTask = task.init();

        this.tasks.push(task);
        return task;
    }

    async getCurrentTask(): Promise<M_Task> {
        if (this.tasks.length === 0) {
            this.addTask();
        }
        if (this.pAddingTask) {
            await this.pAddingTask;
            this.pAddingTask = undefined;
        }
        return this.tasks[this.tasks.length - 1];
    }
    
    }