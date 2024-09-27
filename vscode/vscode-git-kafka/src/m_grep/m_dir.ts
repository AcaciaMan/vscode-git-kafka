// class to store the directory information
export class M_Dir {

    // directory name
    dir: string;
    // size of directory
    size: number;
    // parent directory
    parent: M_Dir | undefined;
    // file count
    fileCount: number;

    // has counted files
    hasCountedFiles: boolean = false;

    // should process
    shouldProcess: boolean = false;

    // should process check
    shouldProcessCheck: boolean = true;

    constructor(parent:M_Dir | undefined,  dir: string, size: number, fileCount: number) {
        // if dir is ".", set parent to undefined and dir to ""
        if (dir === ".") {
            this.dir = "";
        } else {
            this.dir = dir;
        }
        this.size = size;
        this.parent = parent;
        this.fileCount = fileCount;
    }

    // id of directory
    public getId(): string {
        if (this.parent === undefined) {
            return this.dir;
        } else if (this.dir === "") {
            return this.parent.getId();
        }
        return `${this.parent?.getId()}/${this.dir}`;
    }


    // toString method
    toString(): string {
        return `${this.getId()} ${this.size} ${this.fileCount}`;
    }
}