import { M_Dir } from "../m_grep/m_dir";
import { M_File } from "../m_grep/m_file";

// Singlton class to store the click data
export class M_Clicks {
    // instance of M_Clicks
    private static instance: M_Clicks;
    // string dictionary to store the number of clicks
    public dictClicks: { [key: string]: number } = {};
    public dictClicksFiles: { [key: string]: M_File } = {};

    // private constructor
    private constructor() {}

    // get instance of M_Clicks
    public static getInstance(): M_Clicks {
        if (!M_Clicks.instance) {
            M_Clicks.instance = new M_Clicks();
        }
        return M_Clicks.instance;
    }

    // increment number of clicks
    public incrementClicks(key:string, fileName: string): void {
        if (this.dictClicks[key] === undefined) {
            this.dictClicks[key] = 1;
        }
        else {
            this.dictClicks[key] += 1;
        }

        const mDir = new M_Dir(undefined, key, 0, 0);

        const mFile = new M_File(fileName, 0, mDir);

        if (this.dictClicksFiles[mFile.toString(false)] === undefined) {
            this.dictClicksFiles[mFile.toString(false)] = mFile;
        }

    }

    // get number of clicks
    public getClicks(key:string): number {
        if (this.dictClicks[key] === undefined) {
            return 0;
        }
        return this.dictClicks[key];
    }

    // clear number of clicks
    public clearClicks(): void {
        this.dictClicks = {};
        this.dictClicksFiles = {};
    }

}