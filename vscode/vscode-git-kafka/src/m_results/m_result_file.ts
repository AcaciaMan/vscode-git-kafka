import { M_File } from "../m_grep/m_file";
import { M_Result } from "./m_result";

// class to store the results of a single file
export class M_ResultFile {
    file: M_File;
    m_result: M_Result;
    aResultItem: {iStartLine:number, iEndLine:number}[] = [];
    aParsedLine: number[] = [];

    constructor(file: M_File, m_result: M_Result) {
        this.file = file;
        this.m_result = m_result;
    }

    // find aResultItem from aParsedLine
    // consequitive parsed lines are grouped together in aResultItem
    public findResultItemFromParsedLine(): void {
        if (this.aParsedLine.length === 0) {
            return;
        }
        let iStartLine = this.aParsedLine[0];
        let iEndLine = this.aParsedLine[0];
        for (let i = 1; i < this.aParsedLine.length; i++) {
            if (this.m_result.aResultParsed[this.aParsedLine[i]].line === this.m_result.aResultParsed[iEndLine].line + 1) {
                iEndLine = this.aParsedLine[i];
            } else {
                this.aResultItem.push({iStartLine:iStartLine, iEndLine:iEndLine});
                iStartLine = this.aParsedLine[i];
                iEndLine = this.aParsedLine[i];
            }
        }
        this.aResultItem.push({iStartLine:iStartLine, iEndLine:iEndLine});
    }

    toString(): string {
        return `${this.file.toString(false)}`;
    }

    // toStringItems method
    toStringItems(): string {
        let s = "Line: ";
        for (let i = 0; i < this.aResultItem.length; i++) {
            s += `~${this.m_result.aResultParsed[this.aResultItem[i].iStartLine].line} `;
        }
        return s;
    }

    // toStringItemsText method
    toStringItemsText(): string {
      let s = "";
      for (let i = 0; i < this.aResultItem.length; i++) {
        // for each item concatenate the text of the parsed lines
        s += this.toStringOneItemText(this.aResultItem[i]) + "\n";
        // add a newline character between items
        s += "\n";
      }
      // remove the last newline character
      s = s.slice(0, -1);
      return s;
    }

    // toStringOneItemText
    toStringOneItemText(resultItem: {iStartLine: number, iEndLine:number}): string {
        let s = "";
        for (let j = resultItem.iStartLine; j <= resultItem.iEndLine; j++) {
            s += `${this.m_result.aResultParsed[j].text}\n`;
        }
        // remove the last newline character
        s = s.slice(0,-1);
        return s;
    }

}

