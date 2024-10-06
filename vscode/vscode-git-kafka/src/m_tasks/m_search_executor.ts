import { M_SolrSearch } from "../m_solr/m_solr_search";
import { M_Solr } from "../m_util/m_solr";
import { M_Task } from "./m_task";
import { TaskExecutor } from "./m_task_executor";

export class M_SearchExecutor {
  mTask: M_Task;
  mExecutor: TaskExecutor;
  mSolrSearch: M_SolrSearch;
  mSolr = M_Solr.getInstance();
  constructor(mTask: M_Task, mExecutor: TaskExecutor) {
    this.mTask = mTask;
    this.mExecutor = mExecutor;
    this.mSolrSearch = new M_SolrSearch(mTask, mExecutor.task.getId());
  }

  async executeSearch() {
  }
}

export class M_SearchSolr extends M_SearchExecutor {
  async executeSearch() {
    await this.mSolrSearch.search();
  }
}