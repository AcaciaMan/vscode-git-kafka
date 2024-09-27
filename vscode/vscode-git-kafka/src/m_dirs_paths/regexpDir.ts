// enum for the test type, which can be include or exclude
export enum M_TestType {
    INCLUDE = "include",
    EXCLUDE = "exclude",
}

// class to store the regular expression for the directories
export class RegexpDir {
    // regular expression
    regexp: RegExp;
    // directory regular expression
    sRegExp: string;
    // constructor
    constructor(sRegExp: string) {
      this.sRegExp = sRegExp;

      // create regular expression from string
      // replace all ** with .*
      // replace all *, which are not .*, with any character except /
      const regexp = sRegExp
        .replace(/\*\*/g, ".*")
        .replace(/(?<!\.)\*/g, "[^/]*");
      // ignore case
      // match whole word

      // anchor the regular expression to match the whole string
      const anchoredRegexp = `^${regexp}$`;

      this.regexp = new RegExp(anchoredRegexp, "i");
    }

    // test if string matches regular expression
    public test(s: string, testType: M_TestType ): boolean {
        // if test type is include and sRegExp is "", return true
        if (testType === M_TestType.INCLUDE && this.sRegExp === "") {
            return true;
        }
        // if test type is exclude and sRegExp is "", return false
        if (testType === M_TestType.EXCLUDE && this.sRegExp === "") {
            return false;
        }
        // return if string matches regular expression whole word
        return this.regexp.test(s);
    }
}