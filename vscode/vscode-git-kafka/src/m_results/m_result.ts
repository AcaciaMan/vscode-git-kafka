// class to parse the result of git grep command

import { M_Dir } from "../m_grep/m_dir";
import { M_File } from "../m_grep/m_file";
import { M_ResultFile } from "./m_result_file";

export class M_Result {
    sResult: string;
    aResultParsed: { file: string, line: number, text: string }[];
    m_dir: M_Dir;
    aResultFile: M_ResultFile[] = [];

    constructor(sResult: string, m_dir: M_Dir) {
        this.m_dir = m_dir;
        this.sResult = sResult;
        this.aResultParsed = this.parse();
    }


    // parse the result of git grep command
    parse() {
        let aResult = this.sResult.split('\n');
        let aResultParsed = [];
        for (let i = 0; i < aResult.length; i++) {
            let sLine = aResult[i];
            if (sLine.length > 0) {
                let aLine: string[] = sLine.split(':');
                let sFile = aLine[0];
                // sLineNumber is an integer
                let iLineNumber = parseInt(aLine[1]);
                let sText = aLine[2];
                aResultParsed.push({ file: sFile, line: iLineNumber, text: sText });
            }
        }
        return aResultParsed;
    }

    // fill aResultFile
    fillResultFile() {
        for (let i = 0; i < this.aResultParsed.length; i++) {
            let sFile = this.aResultParsed[i].file;
            // if i == 0 or sFile is different from the previous sFile
            if (i === 0 || sFile !== this.aResultParsed[i - 1].file) {
                const mFile = new M_File(sFile,0,this.m_dir);
                let m_file = new M_ResultFile(mFile,this);
                m_file.aParsedLine.push(i);
                this.aResultFile.push(m_file);
            } else {
                this.aResultFile[this.aResultFile.length - 1].aParsedLine.push(i);
            }
            

        }
        for (let i = 0; i < this.aResultFile.length; i++) {
            this.aResultFile[i].findResultItemFromParsedLine();
        }
    } 
    
}