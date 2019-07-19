export class SwitchThemeButtonError implements Error {
  public name = "SwitchThemeButtonError";

  constructor(public message: string) {}

  toString() {
    return this.name + ": " + this.message;
  }
}
