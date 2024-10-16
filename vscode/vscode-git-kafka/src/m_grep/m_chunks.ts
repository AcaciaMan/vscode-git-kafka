import path from "path";
import { M_Result } from "../m_results/m_result";
import { M_Task } from "../m_tasks/m_task";
import { M_Global } from "../m_util/m_global";
import { M_Solr } from "../m_util/m_solr";
import { M_Util } from "../m_util/m_util";
import { M_CalcGrep } from "./m_calc_grep";
import { M_Dir } from "./m_dir";
import { M_Clicks } from "../m_results/m_clicks";
import { M_ResultFile } from "../m_results/m_result_file";

// class to process aDirs array in chunks by 5 elements
export class M_Chunks {
  chunkSize: number = 5;
  iCurrentChunk: number = 0;
  iStart: number = 0;
  iEnd: number = 0;
  aResult: M_Result[] = [];
  aPromises: Promise<string>[] = [];
  iTotalSize: number = 0;
  m_global: M_Global = M_Global.getInstance();
  mUtil: M_Util = M_Util.getInstance();
  mSolr: M_Solr = M_Solr.getInstance();
  mClicks: M_Clicks = M_Clicks.getInstance();
  dItems: {
    [key: string]: {
      mFile: M_ResultFile;
      mItem: { iStartLine: number; iEndLine: number; mId: string };
    };
  } = {};

  constructor(chunkSize: number) {
    this.chunkSize = chunkSize;
  }

  // get the next chunk
  getNextChunk(aDirs: any[]): void {
    this.iStart = this.iCurrentChunk * this.chunkSize;
    this.iEnd = this.iStart + this.chunkSize;
    if (this.iEnd > aDirs.length) {
      this.iEnd = aDirs.length;
    }
    this.iCurrentChunk++;
  }

  // process the chunk
  processChunk(aDirs: M_Dir[], mCalcGrep: M_CalcGrep): Promise<string>[] {
    this.iTotalSize = aDirs.length;
    this.getNextChunk(aDirs);
    for (let i = this.iStart; i < this.iEnd; i++) {
      const mPromise = mCalcGrep.execGrepCommand(aDirs[i]);
      this.aPromises.push(mPromise);
    }
    return this.aPromises.slice(this.iStart, this.iEnd);
  }

  async addChunkResults(aResults: string[], aDirs: M_Dir[], mTask: M_Task) {
    for (let i = 0; i < aResults.length; i++) {
      const mResult = new M_Result(aResults[i], aDirs[i + this.iStart]);
      mResult.fillResultFile();
      this.aResult.push(mResult);
      try {
        if (await this.mSolr.hasSolrClient()) {
          await this.addSolrDoc(mResult, mTask);
        }
      } catch (error) {
        console.error(error);
      }
      await this.mSolr.commit();
    }
  }

  async addSolrDoc(mResult: M_Result, mTask: M_Task) {
    for (let i = 0; i < mResult.aResultFile.length; i++) {
      const mFile = mResult.aResultFile[i];
      for (let j = 0; j < mFile.aResultItem.length; j++) {
        const mItem = mFile.aResultItem[j];
        this.dItems[mItem.mId] = { mFile: mFile, mItem: mItem };

        this.mSolr.mDoc = {
          id: mItem.mId,
          workspaceUUID: this.m_global.workspaceUUID,
          workspaceFolder: mTask.workspaceFolder.uri.fsPath,
          includeDirs: this.m_global.includeDirs.split(","),
          excludeDirs: this.m_global.excludeDirs.split(","),
          pathSpec: this.m_global.pathSpec,
          created: mTask.created_at,
          taskId: mTask.getId(),
          searchTerm: mTask.sSearchTerm,
          resultText: mFile.toStringItemText(mItem),
          resultDir: mFile.file.dir.getId(),
          resultFile: mFile.file.name,
          resultLine: mFile.getLineStart(mItem),
          resultLineEnd: mFile.getLineEnd(mItem),
          linesCount: mFile.aResultItem.length,
          queryTime: new Date().getTime() - mTask.created_at.getTime(),
          clicks: this.mClicks.getClicks(mFile.file.dir.getId()),
        };
        await this.mSolr.addDoc();
      }
    }
  }

  getWordsCount(): { [key: string]: number } {
    const dWordsCount: { [key: string]: number } = {};
    for (const mResult of this.aResult) {
      for (const mFile of mResult.aResultFile) {
        for (const mItem of mFile.aResultItem) {
          const sText = mFile.toStringItemText(mItem);
          // tokenize text into words
          const aWords: string[] = [];
          for (let j = 0; j < sText.length; j++) {
            // if sText[j] is a letter or a number or _, it is part of a word
            let sWord = "";
            while (
              (j < sText.length) &&
              ((sText[j] >= "a" && sText[j] <= "z") ||
                (sText[j] >= "A" && sText[j] <= "Z") ||
                (sText[j] >= "0" && sText[j] <= "9") ||
                sText[j] === "_")
            ) {
              sWord += sText[j];
              j++;
            }
            if (sWord.length === 0) {
              continue;
            }
            aWords.push(sWord);
          }
          for (const sWord of aWords) {
            if (dWordsCount[sWord] === undefined) {
              dWordsCount[sWord] = 1;
            } else {
              dWordsCount[sWord]++;
            }
          }
        }
      }
    }
    return dWordsCount;
  }


}