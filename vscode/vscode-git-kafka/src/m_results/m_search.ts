import { M_CalcGrep } from "../m_grep/m_calc_grep";
import { M_Clicks } from "./m_clicks";
import { M_ResultFile } from "./m_result_file";

// class to handle search results
export class M_Search {
  // singleton instance
  private static instance: M_Search;

  // private constructor
  private constructor() {
    // do nothing
  }

  // get singleton instance
  public static getInstance(): M_Search {
    if (!M_Search.instance) {
      M_Search.instance = new M_Search();
    }
    return M_Search.instance;
  }

  // add enum for sort types
    public enumSortType = {
        ClicksHighLow: "Clicks (High-Low)",
        ClicksLowHigh: "Clicks (Low-High)",
        AlphabeticalAZ: "Alphabetical (A-Z)",
        AlphabeticalZA: "Alphabetical (Z-A)",
        NumberOfLinesLowHigh: "Number of Lines (Low-High)",
        NumberOfLinesHighLow: "Number of Lines (High-Low)",
    };


  // search results
  aSearchResults: { fileName: string; line: string; content: string }[] = [];
  aResultFile: M_ResultFile[] = [];
  // array of sort types
  aSorts: string[] = [
    this.enumSortType.ClicksHighLow,
    this.enumSortType.ClicksLowHigh,
    this.enumSortType.AlphabeticalAZ,
    this.enumSortType.AlphabeticalZA,
    this.enumSortType.NumberOfLinesLowHigh,
    this.enumSortType.NumberOfLinesHighLow,
  ];

  // dictionary of directories and their number of lines
    dictNumberOfLines: { [key: string]: number } = {};

  // add search result
  public addSearchResult(
    fileName: string,
    line: string,
    content: string
  ): void {
    this.aSearchResults.push({
      fileName: fileName,
      line: line,
      content: content,
    });
  }

  // clear search results
  public clearSearchResults(): void {
    this.aSearchResults = [];
  }

    // add result file
    public addResultFile(resultFile: M_ResultFile): void {
        this.aResultFile.push(resultFile);
    }

    // clear result files
    public clearResultFiles(): void {
        this.aResultFile = [];
    }

    // sort result files
    public sortResultFiles(sortType: string): void {
        if (sortType === this.enumSortType.AlphabeticalAZ) {
            this.aResultFile.sort((a, b) => {
                      if (a.file.dir.getId() < b.file.dir.getId()) {
                        return -1;
                      }
                      if (a.file.dir.getId() > b.file.dir.getId()) {
                        return 1;
                      }
                if (a.file.name < b.file.name) {
                    return -1;
                }
                if (a.file.name > b.file.name) {
                    return 1;
                }
                return 0;
            });
        } else if (sortType === this.enumSortType.AlphabeticalZA) {
            this.aResultFile.sort((a, b) => {
                        if (a.file.dir.getId() > b.file.dir.getId()) {
                            return -1;
                        }
                        if (a.file.dir.getId() < b.file.dir.getId()) {
                            return 1;
                        }
                if (a.file.name > b.file.name) {
                    return -1;
                }
                if (a.file.name < b.file.name) {
                    return 1;
                }
                return 0;
            });
        } else if (sortType === this.enumSortType.NumberOfLinesLowHigh) {
            this.assignNumberOfLines();
            this.aResultFile.sort((a, b) => {
                if (
                  this.getNumberOfLines(a.file.dir.getId()) <
                  this.getNumberOfLines(b.file.dir.getId())
                ) {
                  return -1;
                }
                if (
                  this.getNumberOfLines(a.file.dir.getId()) >
                  this.getNumberOfLines(b.file.dir.getId())
                ) {
                  return 1;
                }
                      if (a.file.dir.getId() < b.file.dir.getId()) {
                        return -1;
                      }
                      if (a.file.dir.getId() > b.file.dir.getId()) {
                        return 1;
                      }


                if (a.aResultItem.length < b.aResultItem.length) {
                    return -1;
                }
                if (a.aResultItem.length > b.aResultItem.length) {
                    return 1;
                }
                                if (a.file.name < b.file.name) {
                                  return -1;
                                }
                                if (a.file.name > b.file.name) {
                                  return 1;
                                }
                return 0;
            });
        } else if (sortType === this.enumSortType.NumberOfLinesHighLow) {
            this.assignNumberOfLines();
            this.aResultFile.sort((a, b) => {
                 if (
                   this.getNumberOfLines(a.file.dir.getId()) >
                   this.getNumberOfLines(b.file.dir.getId())
                 ) {
                   return -1;
                 }
                 if (
                   this.getNumberOfLines(a.file.dir.getId()) <
                   this.getNumberOfLines(b.file.dir.getId())
                 ) {
                   return 1;
                 }               
                      if (a.file.dir.getId() < b.file.dir.getId()) {
                        return -1;
                      }
                      if (a.file.dir.getId() > b.file.dir.getId()) {
                        return 1;
                      }
                
                if (a.aResultItem.length > b.aResultItem.length) {
                    return -1;
                }
                if (a.aResultItem.length < b.aResultItem.length) {
                    return 1;
                }
                                if (a.file.name < b.file.name) {
                                  return -1;
                                }
                                if (a.file.name > b.file.name) {
                                  return 1;
                                }
                return 0;
            });
        } else if (sortType === this.enumSortType.ClicksHighLow) {
            const mClicks: M_Clicks = M_Clicks.getInstance();
            this.aResultFile.sort((a, b) => {
                if (
                  mClicks.getClicks(a.file.dir.getId()) <
                  mClicks.getClicks(b.file.dir.getId())
                ) {
                  return 1;
                }
                if (
                    mClicks.getClicks(a.file.dir.getId()) >
                    mClicks.getClicks(b.file.dir.getId())
                ) {
                    return -1;
                }
                                if (a.file.dir.getId() < b.file.dir.getId()) {
                                  return -1;
                                }
                                if (a.file.dir.getId() > b.file.dir.getId()) {
                                  return 1;
                                }



                                if (a.file.name < b.file.name) {
                                  return -1;
                                }
                                if (a.file.name > b.file.name) {
                                  return 1;
                                }
                return 0;
            });
        } else if (sortType === this.enumSortType.ClicksLowHigh) {
            const mClicks: M_Clicks = M_Clicks.getInstance();
            this.aResultFile.sort((a, b) => {
                if (
                  mClicks.getClicks(a.file.dir.getId()) >
                  mClicks.getClicks(b.file.dir.getId())
                ) {
                  return 1;
                }
                if (
                  mClicks.getClicks(a.file.dir.getId()) <
                  mClicks.getClicks(b.file.dir.getId())
                ) {
                  return -1;
                }
                if (a.file.dir.getId() < b.file.dir.getId()) {
                  return -1;
                }
                if (a.file.dir.getId() > b.file.dir.getId()) {
                  return 1;
                }
                                if (a.file.name < b.file.name) {
                                  return -1;
                                }
                                if (a.file.name > b.file.name) {
                                  return 1;
                                }
                return 0;
            });
        }
    }

    // get number of lines for a directory
    public getNumberOfLines(dirId: string): number {
        if (dirId in this.dictNumberOfLines) {
            return this.dictNumberOfLines[dirId];
        }
        return 0;
    }

    // set number of lines for a directory
    public setNumberOfLines(dirId: string, numberOfLines: number): void {
        this.dictNumberOfLines[dirId] = numberOfLines;
    }

    // clear number of lines
    public clearNumberOfLines(): void {
        this.dictNumberOfLines = {};
    }

    // loop through all results and assign number of lines to directories
    public assignNumberOfLines(): void {
        this.clearNumberOfLines();
        for (let i = 0; i < this.aResultFile.length; i++) {
            let resultFile = this.aResultFile[i];
            let dirId = resultFile.file.dir.getId();
            let numberOfLines = this.getNumberOfLines(dirId);
            numberOfLines += resultFile.aResultItem.length;
            this.setNumberOfLines(dirId, numberOfLines);
        }
    }

    // populate search results from result files
    public populateSearchResults(): void {
        this.clearSearchResults();
        for (let i = 0; i < this.aResultFile.length; i++) {
            let resultFile = this.aResultFile[i];
            let fileName = resultFile.toString();
            let line = resultFile.toStringItems();
            let content = resultFile.toStringItemsText();
            this.addSearchResult(fileName, line, content);
        }
    }

    // populate result files from calc grep
    public populateResultFiles(mCalcGrep: M_CalcGrep): void {
        this.clearResultFiles();
        for (let i = 0; i < mCalcGrep.aResult.length; i++) {
            let mResult = mCalcGrep.aResult[i];
            for (let j = 0; j < mResult.aResultFile.length; j++) {
                let mResultFile = mResult.aResultFile[j];
                this.addResultFile(mResultFile);
            }
        }
    }

    // process search results
    public processSearchResults(mCalcGrep: M_CalcGrep, sortType: string): void {
        this.populateResultFiles(mCalcGrep);
        this.sortResultFiles(sortType);
        this.populateSearchResults();
    }



}