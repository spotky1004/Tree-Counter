import type StringExpression from "./StringExpression.js";

interface VariableTypes {
  "number": number;
  "string": string;
  "StringExpression": StringExpression;

  "number_arr": number[];
  "string_arr": string[];
}

export default class Variables<T extends (keyof VariableTypes)[]> {
  private readonly vars: Map<string, VariableTypes[T[number]]>;
  // @ts-ignore
  private readonly types: T;

  constructor(...types: T) {
    this.vars = new Map();
    this.types = types;
  }

  set(name: string, value: VariableTypes[T[number]]) {
    this.vars.set(name, value);
  }

  get(name: string) {
    return this.vars.get(name);
  }

  remove(name: string) {
    this.vars.delete(name);
  }

  entries() {
    return this.vars.entries();
  }

  clone(): Variables<T> {
    let clone = new Variables(...this.types);
    for (const [name, value] of this.entries()) {
      clone.set(name, value);
    }
    return clone;
  }

  get size() {
    return this.vars.size;
  }
}
