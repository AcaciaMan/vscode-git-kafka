import { M_File } from "../m_grep/m_file";
import { M_Util } from "../m_util/m_util";
import { M_Result } from "./m_result";

// class to store the results of a single file
export class M_ResultFile {
    file: M_File;
    m_result: M_Result;
    aResultItem: {iStartLine:number, iEndLine:number, mId: string}[] = [];
    aParsedLine: number[] = [];
    mUtil: M_Util = M_Util.getInstance();

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
                this.aResultItem.push({iStartLine:iStartLine, iEndLine:iEndLine, mId: this.mUtil.getUUID()});
                iStartLine = this.aParsedLine[i];
                iEndLine = this.aParsedLine[i];
            }
        }
        this.aResultItem.push({iStartLine:iStartLine, iEndLine:iEndLine, mId: this.mUtil.getUUID()});
    }

    toString(): string {
        return `${this.file.toString(false)}`;
    }

    // toStringItems method
    toStringItems(): string {
        let s = "Line: ";
        for (let i = 0; i < this.aResultItem.length; i++) {
            const lineStart = this.m_result.aResultParsed[this.aResultItem[i].iStartLine].line;
            const lineEnd = this.m_result.aResultParsed[this.aResultItem[i].iEndLine].line;
            s += `<span class="line-number" data-file-path="${this.file.getPath()}" data-line-start="${lineStart}" data-line-end="${lineEnd}" data-dir="${this.file.dir.getId()}">~${lineStart}</span> `;
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
    toStringOneItemText(resultItem: {iStartLine: number, iEndLine:number, mId: string}): string {
        let s = "";

        const lineStart = this.m_result.aResultParsed[resultItem.iStartLine].line;
        const lineEnd = this.m_result.aResultParsed[resultItem.iEndLine].line;
        // add the line number from the first line
        s += `<span class="line-number" data-file-path="${this.file.getPath()}" data-line-start="${lineStart}" data-line-end="${lineEnd}" data-dir="${this.file.dir.getId()}">~~~${lineStart}</span>\n`;
        for (let j = resultItem.iStartLine; j <= resultItem.iEndLine; j++) {
            s += `${this.m_result.aResultParsed[j].text}\n`;
        }
        // add the line number from the last line
        s += `<span class="line-number" data-file-path="${this.file.getPath()}" data-line-start="${lineEnd}" data-line-end="${lineEnd}" data-dir="${this.file.dir.getId()}">~~~${lineEnd}</span>`;
        return s;
    }

    toStringItemText(resultItem: {iStartLine: number, iEndLine:number, mId: string}): string {
        let s = "";
        for (let j = resultItem.iStartLine; j <= resultItem.iEndLine; j++) {
            s += `${this.m_result.aResultParsed[j].text}\n`;
        }
        s = s.slice(0, -1);
        return s;
    }

    getLineStart(resultItem: {iStartLine: number, iEndLine:number, mId: string}): number {
        return this.m_result.aResultParsed[resultItem.iStartLine].line;
    }

    getLineEnd(resultItem: {iStartLine: number, iEndLine:number, mId: string}): number {
        return this.m_result.aResultParsed[resultItem.iEndLine].line;
    }

    

}

