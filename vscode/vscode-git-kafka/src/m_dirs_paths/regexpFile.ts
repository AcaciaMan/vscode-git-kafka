export class RegexpFile {
  // regular expression
  regexp: RegExp;
  // directory regular expression
  sRegExp: string;
  // constructor
  constructor(sRegExp: string) {
    this.sRegExp = sRegExp;
    this.regexp = new RegExp(sRegExp);
  }
}
