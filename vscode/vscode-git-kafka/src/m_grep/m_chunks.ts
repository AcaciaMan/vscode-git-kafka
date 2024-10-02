import { M_Result } from "../m_results/m_result";
import { M_CalcGrep } from "./m_calc_grep";
import { M_Dir } from "./m_dir";

// class to process aDirs array in chunks by 5 elements
export class M_Chunks {
    chunkSize: number = 5;
    iCurrentChunk: number = 0;
    iStart: number = 0;
    iEnd: number = 0;
    aResult: M_Result[] = [];
    aPromises: Promise<string>[] = [];

    constructor (chunkSize: number) {
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
        this.getNextChunk(aDirs);
        for (let i = this.iStart; i < this.iEnd; i++) {
            const mPromise = mCalcGrep.execGrepCommand(aDirs[i]);
            this.aPromises.push(mPromise);
        }
        return this.aPromises.slice( this.iStart, this.iEnd);
    }

    addChunkResults(aResults: string[], aDirs: M_Dir[]): void {
        for (let i = 0; i < aResults.length; i++) {
            const mResult = new M_Result(aResults[i], aDirs[i+this.iStart]);
            mResult.fillResultFile();
            this.aResult.push(mResult);
        }
    } 
}