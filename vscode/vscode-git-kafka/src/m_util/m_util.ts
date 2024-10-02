import { M_Dir } from "../m_grep/m_dir";
import { M_Clicks } from "../m_results/m_clicks";
import { M_Search } from "../m_results/m_search";
import { M_Global } from "./m_global";

// singleton class to do some useful things
export class M_Util {
    // instance of M_Util
    private static instance: M_Util;
    // private constructor
    private constructor() {}
    // get instance of M_Util
    public static getInstance(): M_Util {
        if (!M_Util.instance) {
            M_Util.instance = new M_Util();
        }
        return M_Util.instance;
    }

    m_global: M_Global = M_Global.getInstance();
    
    // sort M_Dir[] by sort type
    public sortDirs(aDirs: M_Dir[]): void {
        const mSearch: M_Search = M_Search.getInstance();
        
        if (this.m_global.sortType === mSearch.enumSortType.AlphabeticalAZ) {
          aDirs.sort((a, b) => a.getId().localeCompare(b.getId()));
        } else if (
          this.m_global.sortType === mSearch.enumSortType.AlphabeticalZA
        ) {
          aDirs.sort((a, b) => b.getId().localeCompare(a.getId()));
        } else if (
            (this.m_global.sortType === mSearch.enumSortType.ClicksHighLow) ||
            (this.m_global.sortType === mSearch.enumSortType.NumberOfLinesHighLow) ||
            (this.m_global.sortType === mSearch.enumSortType.NumberOfLinesLowHigh)
        ) {
            const mClicks: M_Clicks = M_Clicks.getInstance();
            aDirs.sort((a, b) => {
                if (
                  mClicks.getClicks(a.getId()) <
                  mClicks.getClicks(b.getId())
                ) {
                  return 1;
                }
                if (
                    mClicks.getClicks(a.getId()) >
                    mClicks.getClicks(b.getId())
                ) {
                    return -1;
                }
                return a.getId().localeCompare(b.getId());

        });} else if (
            this.m_global.sortType === mSearch.enumSortType.ClicksLowHigh
        ) {
            const mClicks: M_Clicks = M_Clicks.getInstance();
            aDirs.sort((a, b) => {
                if (
                  mClicks.getClicks(a.getId()) >
                  mClicks.getClicks(b.getId())
                ) {
                  return 1;
                }
                if (
                    mClicks.getClicks(a.getId()) <
                    mClicks.getClicks(b.getId())
                ) {
                    return -1;
                }
                return a.getId().localeCompare(b.getId());
            });
        }

    
    
    
    
    

    


    

}
}
