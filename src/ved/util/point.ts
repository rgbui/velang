namespace Ve.Lang.Ved {
    import List = Ve.Lang.Util.List;
    export class Point {
        x: number;
        y: number;
        constructor(x: number | { x: number, y: number }, y?: number) {
            if (typeof x == 'number') {
                this.x = x;
                this.y = y;
            }
            else {
                this.x = x.x;
                this.y = x.y;
            }
        }
        add(point: Point) {
            return new Point({
                x: this.x + point.x,
                y: this.y + point.y
            })
        }
        sub(point: Point) {
            return new Point({
                x: this.x - point.x,
                y: this.y - point.y
            })
        }
        isInRect(rect: Rect) {
            return rect.isInside(this);
        }
    }
    export class Rect {
        x: number;
        y: number;
        width: number;
        height: number;
        constructor(x: number | { x: number, y: number, width: number, height: number }, y?: number, width?: number, height?: number) {
            if (typeof x == 'number') {
                this.x = x; this.y = y; this.width = width; this.height = height
            }
            else if (typeof x == 'object') {
                for (var n in x) { this[n] = x[n] };
            }
        }
        get right() {
            return this.x + this.width;
        }
        get bottom() {
            return this.y + this.height;
        }
        /**
         * rect top-left point
         */
        get point() {
            return new Point(this.x, this.y);
        }
        isInside(point: Point) {
            if (point.x >= this.x && point.x < this.right) {
                if (point.y >= this.y && point.y < this.bottom) return true;
            }
            return false;
        }
    }
}