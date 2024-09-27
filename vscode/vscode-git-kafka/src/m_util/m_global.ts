import { M_TestType, RegexpDir } from "../m_dirs_paths/regexpDir";

// singleton class to store global variables
export class M_Global {
    // singleton instance
    private static instance: M_Global;

    // private constructor
    private constructor() {
        // do nothing
    }

    // get singleton instance
    public static getInstance(): M_Global {
        if (!M_Global.instance) {
            M_Global.instance = new M_Global();
        }
        return M_Global.instance;
    }

    // global variables
    includeDirs: string = "";
    excludeDirs: string = "";
    pathSpec: string = "";

    aIncludeDirs: RegexpDir[] = [];
    aExcludeDirs: RegexpDir[] = [];

    // set directories
    public setDirs(includeDirs: string, excludeDirs:string): void {
        this.includeDirs = includeDirs;
        this.aIncludeDirs = includeDirs.split(",").map((s) => new RegexpDir(s));
        this.excludeDirs = excludeDirs;
        this.aExcludeDirs = excludeDirs.split(",").map((s) => new RegexpDir(s));
    }

    // set files
    public setPathSpec(pathSpec: string): void {
        this.pathSpec = pathSpec;
    }

    // test if dir is included and not excluded
    public testDir(dir: string): boolean {
        return this.aIncludeDirs.some((rd) => rd.test(dir, M_TestType.INCLUDE)) && !this.aExcludeDirs.some((rd) => rd.test(dir, M_TestType.EXCLUDE));
    }

}