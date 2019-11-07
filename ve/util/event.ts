

namespace Ve.Lang {
    export class BaseEvent {
        private __$events: VeArray<{ name: string, once?: boolean, cb: (this: BaseEvent, ...args: any[]) => any }> = new VeArray();
        on(name: string | Record<string, (this: BaseEvent, ...args: any[]) => any>, cb?: (this: BaseEvent, ...args: any[]) => any, isReplace?: boolean) {
            if (typeof name == 'object') {
                for (var n in name) this.on(n, name[n]);
                return;
            }
            else {
                var ev = this.__$events.find(x => x.name == name);
                if (isReplace == true) {
                    applyExtend(ev, { name, cb });
                }
                else {
                    this.__$events.push({ name, cb });
                }
            }
            return this;
        }
        once(name: string | Record<string, (this: BaseEvent, ...args: any[]) => any>, cb?: (this: BaseEvent, ...args: any[]) => any, isReplace?: boolean) {
            if (typeof name == 'object') {
                for (var n in name) this.once(n, name[n]);
                return;
            }
            else {
                var ev = this.__$events.find(x => x.name == name);
                if (isReplace == true) {
                    applyExtend(ev, { name, cb, once: true });
                }
                else {
                    this.__$events.push({ name, cb, once: true });
                }
            }
            return this;
        }
        off(name: string | ((this: BaseEvent, ...args: any[]) => any)) {
            if (typeof name == 'string') {
                this.__$events.removeAll(x => x.name == name);
            }
            else {
                this.__$events.removeAll(x => x.cb == name);
            }
            return this;
        }
        emit(name: string, ...args: any[]) {
            var ev = this.__$events.find(x => x.name == name);
            if (ev) {
                var result = ev.cb.apply(this, args);
                if (ev.once == true) this.__$events.remove(ev);
                return result;
            }
        }
    }
}