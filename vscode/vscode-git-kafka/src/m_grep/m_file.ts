import path from "path";
import { M_Global } from "../m_util/m_global";
import { M_Dir } from "./m_dir";

// class to store file information (name, size, and M_Dir object)
export class M_File {
    // file name
    name: string;
    // size of file
    size: number;
    // directory object
    dir: M_Dir;

    m_global: M_Global = M_Global.getInstance();

    constructor(name: string, size: number, dir: M_Dir) {
        this.name = name;
        this.size = size;
        this.dir = dir;
    }

    // toString method
    toString(bPrintSize:boolean = true): string {
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
        // if bPrintSize is false, return only name and path
        const size = bPrintSize ? leftPad(this.size.toString(), 8) : "";




        if (path === "") {
            return `${rightPad(this.name, 30)} ${size} ${this.name}`;
        }
        return `${rightPad(this.name, 30)} ${size} ${path}/${this.name}`;
    }

    public getPath(): string {


        // concatenate m_global workspace folder path, dir id, and file name
        if (this.m_global.workspaceFolder && this.m_global.workspaceFolder.uri) {
            return path.join(this.m_global.workspaceFolder.uri.fsPath, this.dir.getId(), this.name);
        }
        return "";
    }

    public getRelativePath(): string {
        // concatenate dir id and file name
        return path.join(this.dir.getId(), this.name);
    }

}