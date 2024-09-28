import { M_File } from "../m_grep/m_file";

// class to store the results of a single file
export class M_ResultFile {
    file: M_File;
    aResultItem: number[] = [];
    aLineNumber: number[] = [];

    constructor(file: M_File) {
        this.file = file;
    }

    // find aResultItem from aLineNumber
    // consequitive line numbers are grouped together in aResultItem
    public findResultItemFromLineNumber(): void {
        if (this.aLineNumber.length === 0) {
            return;
        }
        let iStartLine = this.aLineNumber[0];
        let iEndLine = this.aLineNumber[0];
        for (let i = 1; i < this.aLineNumber.length; i++) {
            if (this.aLineNumber[i] === iEndLine + 1) {
                iEndLine = this.aLineNumber[i];
            } else {
                this.aResultItem.push(iStartLine);
                iStartLine = this.aLineNumber[i];
                iEndLine = this.aLineNumber[i];
            }
        }
        this.aResultItem.push(iStartLine);
    }

    toString(): string {
        return `${this.file.toString(false)}`;
    }

    // toStringItems method
    toStringItems(): string {
        let s = "Line: ";
        for (let i = 0; i < this.aResultItem.length; i++) {
            s += `~${this.aResultItem[i]} `;
        }
        return s;
    }

}

