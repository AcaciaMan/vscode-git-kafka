import { M_Dir } from "./m_dir";

// class to store file information (name, size, and M_Dir object)
export class M_File {
    // file name
    name: string;
    // size of file
    size: number;
    // directory object
    dir: M_Dir;

    constructor(name: string, size: number, dir: M_Dir) {
        this.name = name;
        this.size = size;
        this.dir = dir;
    }

    // toString method
    toString(): string {
        // return nicelly formatted, padded string
        // assuming that name is not longer than 30 characters
        // and size is not longer than 8 characters

        const rightPad = (s: string, n: number): string => {
            if (s.length >= n) {
                return s;
            }
            return s + " ".repeat(n - s.length);
        };

        const leftPad = (s: string, n: number): string => {
            if (s.length >= n) {
                return s;
            }
            return " ".repeat(n - s.length) + s;
        };

        const path = this.dir.getId();
        if (path === "") {
            return `${rightPad(this.name, 30)} ${leftPad(
              this.size.toString(),
              8
            )} ${this.name}`;
        }
        return `${rightPad(this.name, 30)} ${leftPad(
          this.size.toString(),
          8
        )} ${path}/${this.name}`;
    }

}