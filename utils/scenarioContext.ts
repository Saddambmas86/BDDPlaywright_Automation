export class ScenarioContext {
  private static context = new Map();

  static set(key: string, value: any) {
    this.context.set(key, value);
  }

  static get(key: string) {
    return this.context.get(key);
  }

  static has(key: string): boolean {
    return this.context.has(key);
  }

  static clear(): void {
    this.context.clear();
  }

  static getAll(): Record<string, any> {
    return Object.fromEntries(this.context);
  }
}
