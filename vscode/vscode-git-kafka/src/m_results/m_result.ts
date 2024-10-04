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

                // loop through the line and get the first 2 parts separated by ':' or '-'
                let i1 = -1;
                let i2 = -1;
                for (let j = 0; j < sLine.length; j++) {
                    if (sLine[j] === ':' || sLine[j] === '-') {
                        if (i1 === -1) {
                            i1 = j;
                        } else {
                            i2 = j;
                        break;
                        }
                    }
                }
                if (i1 === -1 || i2 === -1) {
                    continue;
                }
                // sLine split into 3 parts: sFile, sLineNumber, sText
                let sFile = sLine.substring(0, i1);
                // sLineNumber is an integer
                let iLineNumber = parseInt(sLine.substring(i1 + 1, i2));
                // sText is the rest of the line
                let sText = sLine.substring(i2 + 1);

                if(!isNaN(iLineNumber)) {

                aResultParsed.push({ file: sFile, line: iLineNumber, text: sText });
                }
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