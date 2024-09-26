// enum for object type in git ls-tree record (blob, tree, commit, tag)
export enum M_TreeObjectType {
    BLOB = "blob",
    TREE = "tree",
    COMMIT = "commit",
    TAG = "tag",
}


// class to store git ls-tree record with object type, path, and object size
export class M_Tree {
    // object type
    objectType: M_TreeObjectType;
    // path
    path: string;
    // object size
    objectSize: number;

    constructor(objectType: M_TreeObjectType, path: string, objectSize: number) {
        this.objectType = objectType;
        this.path = path;
        this.objectSize = objectSize;
    }

    // toString method
    toString(): string {
        return `${this.objectType} ${this.path} ${this.objectSize}`;
    }

    public static fromString(s: string): M_Tree {
        const parts = s.split(";;;");
        return new M_Tree(
            M_TreeObjectType[parts[0].toUpperCase() as keyof typeof M_TreeObjectType],
            parts[1],
            parseInt(parts[2])
        );
    }

}