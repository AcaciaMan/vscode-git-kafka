// class to store the directory information
export class M_Dir {

    // directory name
    dir: string;
    // size of directory
    size: number;
    // parent directory
    parent: string;
    // file count
    fileCount: number;
    // directory name
    id: string;

    // has counted files
    hasCountedFiles: boolean = false;

    constructor(parent:string,  dir: string, size: number, fileCount: number) {
        this.dir = dir;
        this.size = size;
        this.parent = parent;
        this.fileCount = fileCount;
        this.id = `${parent}/${dir}`;

    }

    // toString method
    toString(): string {
        return `${this.id} ${this.size} ${this.fileCount}`;
    }
}