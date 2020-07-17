
namespace Ve.Lang.Util {

    export function Inherit(Mix, ...mixins) {
        function copyProperties(target, source) {
            for (let key of Reflect.ownKeys(source)) {
                if (key !== "constructor"
                    && key !== "prototype"
                    && key !== "name"
                ) {
                    let desc = Object.getOwnPropertyDescriptor(source, key);
                    Object.defineProperty(target, key, desc);
                }
            }
        }
        for (let mixin of mixins) {
            copyProperties(Mix, mixin);
            copyProperties(Mix.prototype, mixin.prototype);
        }
        return Mix;
    }
    export function Mixin(cla, baseCla, keys: string[]) {
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            var desc = Object.getOwnPropertyDescriptor(baseCla, key);
            if (!desc) desc = Object.getOwnPropertyDescriptor(baseCla.prototype, key);
            if (desc) Object.defineProperty(cla, key, desc);
            else console.log(desc, baseCla, key);
        }
    }
    export function Extend(mix, ...mixins) {
        mixins.forEach(mi => {
            for (var n in mi) {
                mix[n] = mi[n];
            }
        });
        return mix;
    }
    export function getAvailableName<T>(name, list: List<T>, predict: (item: T) => string) {
        var i = 0;
        while (true) {
            var text = name + (i == 0 ? "" : i);
            if (list.exists(z => predict(z) == text)) {
                i++;
            }
            else {
                break;
            }
        }
        return name + (i == 0 ? "" : i);
    }
    export function nullSafe<T>(value: T, def: T): T {
        return value === null || value === undefined ? def : value;
    }
    let counter = 0;
    export function getId() {
        return (counter += 1).toString();
    }
}