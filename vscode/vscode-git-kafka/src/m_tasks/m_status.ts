import { M_Solr } from "../m_util/m_solr";
import { M_SearchSolr } from "./m_search_executor";
import { M_Task_State } from "./m_task";
import { TaskExecutor } from "./m_task_executor";

export class M_Status {
    static instance: M_Status;
    static getInstance(): M_Status {
        if (!M_Status.instance) {
            M_Status.instance = new M_Status();
        }
        return M_Status.instance;
    }

    mExecutors: TaskExecutor[] = [];
    mSolrExecutors: M_SearchSolr[] = [];

    constructor() {
    }

    mSolr = M_Solr.getInstance();


    addExecutor(executor: TaskExecutor) {
        // set previous executors with tasks insearch to status newsearch
        for (let i = this.mExecutors.length - 1; i >= 0; i--) {
            if (this.mExecutors[i].task.mState === M_Task_State.InSearch) {
                this.mExecutors[i].task.mState = M_Task_State.NewSearch;
            } else if (this.mExecutors[i].task.mState === M_Task_State.NewSearch) {
                break;
            }
        }

        this.mSolr.commit();


        this.mExecutors.push(executor);
    }

    getExecutor() {
        if (this.mExecutors.length === 0) {
            return undefined;
        }
        return this.mExecutors[this.mExecutors.length - 1];
    }   

    addSolrExecutor(executor: M_SearchSolr) {
        this.mSolrExecutors.push(executor);
    }

    getSolrExecutor() {
        return this.mSolrExecutors[this.mSolrExecutors.length - 1];
    }

}