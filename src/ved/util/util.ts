namespace Ve.Lang.Ved {
    export class Util {
        /**
         * 可以计算文本的高度和宽度
         * @param text 
         * @param fontStyle 
         */
        static computeFontSize(text, fontStyle: { fontSize: number, fontFamily: string }) {
            let sd = document.createElement("span");
            sd.style.fontSize = fontStyle.fontSize + "px";
            sd.style.opacity = "0";
            sd.style.fontFamily = fontStyle.fontFamily;
            sd.innerHTML = text;
            document.body.append(sd);
            let bound: Record<string, any> = {};
            bound.width = sd.offsetWidth;
            bound.height = sd.offsetHeight;
            sd.remove();
            return bound;
        }
        private static __g: CanvasRenderingContext2D;
        /**
         * 只能计算文本的宽度，但是大量计算时，性能会好很多
         * @param text 
         * @param fontStyle 
         */
        static getTextbound(text: string, fontStyle: { fontSize: number, fontFamily: string }) {
            if (!text) { return { width: 0 } };
            if (!this.__g) {
                var c = document.createElement("canvas");
                document.body.appendChild(c);
                c.width = 100;
                c.height = 100;
                c.style.display = "none";
                this.__g = c.getContext("2d");
            }
            var _default = Object.assign({
                fontSize: 14,
                fontFamily: `Consolas,"Courier New",monospace`
            }, fontStyle);
            this.__g.font = `${_default.fontSize}px ${_default.fontFamily}`;
            var bound = this.__g.measureText(text);
            return bound;
        }
        static htmlEscape(sHtml) {
            return sHtml.replace(/[<>&" \t]/g, function (c) { return { ' ': "&nbsp;", '\t': '&nbsp;&nbsp;&nbsp;&nbsp;', '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]; });
        }
    }
}