
namespace Ve.Lang {

    export function applyMixins(Mix, ...mixins) {
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
    export function applyExtend(mix, ...mixins) {
        mixins.forEach(mi => {
            for (var n in mi) {
                mix[n] = mi[n];
            }
        })
    }
    export function getAvailableName<T>(name, list: VeArray<T>, predict: (item: T) => string) {
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
}