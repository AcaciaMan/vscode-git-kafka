// Singlton class to store the click data
export class M_Clicks {
    // instance of M_Clicks
    private static instance: M_Clicks;
    // string dictionary to store the number of clicks
    public dictClicks: { [key: string]: number } = {};

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
    public incrementClicks(key:string): void {
        if (this.dictClicks[key] === undefined) {
            this.dictClicks[key] = 1;
        }
        else {
            this.dictClicks[key] += 1;
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
    }

}