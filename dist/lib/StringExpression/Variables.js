export default class Variables {
    constructor(...types) {
        this.vars = new Map();
        this.types = types;
    }
    set(name, value) {
        this.vars.set(name, value);
    }
    get(name) {
        return this.vars.get(name);
    }
    remove(name) {
        this.vars.delete(name);
    }
    entries() {
        return this.vars.entries();
    }
    clone() {
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
