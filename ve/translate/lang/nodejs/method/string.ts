///<reference path='File.ts'/>
namespace Ve.Lang.Transtate.nodejs {
    export var methodAccepter: MethodAccepter = [
        {
            name: 'Ve.String',
            props: {
                length(node: Statement, $this: string, ...args: string[]) {
                    return `${$this}.length`;
                },
                count(node: Statement, $this: string, ...args: string[]) {
                    this.appendResource({
                        name: '__$Ve.String.count',
                        items: [
                            {
                                type: 'code',
                                code: `
                            (function()
                            {   
                                if(typeof __$Ve==typeof undefined)__$ve={ };
                                if(typeof __$Ve.String==typeof undefined)__$Ve.String={ };
                                __$Ve.String.count=function (value)
                                {
                                    var length = 0;
                                    for (var i = 0; i < value.length; i++) {
                                        var iCode = value.charCodeAt(i);
                                        if ((iCode >= 0 && iCode <= 255) || (iCode >= 0xff61 && iCode <= 0xff9f)) {
                                            length += 1;
                                        } else {
                                            length += 2;
                                        }
                                    }
                                    return length;
                                };
                            })()                            
                            `}
                        ]
                    })
                    return `__$Ve.String.count(${$this})`;
                },
                indexOf(node: Statement, $this, ...args: string[]) {
                    return `${$this}.indexOf(${args[0]})`;
                },
                lastIndexOf(node: Statement, $this, ...args: string[]) {
                    return `${$this}.lastIndexOf(${args[0]})`;
                }
            }
        },
        {
            name: 'Ve.Date',
            props: {
                new(node: Statement, value) {
                    this.appendResource({
                        name: '__$ve.Date.new',
                        items: [
                            {
                                type: 'code',
                                code: `                           
                            (function()
                            {   
                                if(typeof __$Ve==typeof undefined)__$ve={ };
                                if(typeof __$Ve.Date==typeof undefined)__$Ve.Date={ };
                                __$Ve.Date.new=function (dateString){ };
                            })()                            
                            `}
                        ]
                    })
                    return `__$Ve.Date.newDate("${value}")`;
                },
                now(node: Statement, $this: string) {
                    return `new Date()`
                },
                year(node: Statement, $this: string) {
                    return `${$this}.getFullYear()`;
                },
                month(node: Statement, $this: string) {
                    return `(${$this}.getMonth()+1)`;
                },
                week(node: Statement, $this: string) {
                    return `(${$this}.getDay()+1)`;
                }
            }
        },
        {
            name: 'Ve.Math',
            props: {
                PI(node: Statement, $this: string) {
                    return `Math.PI`;
                },
                E(node: Statement, $this: string) {
                    return `Math.E`
                },
                abs(node: Statement, $this: string, ...args: string[]) {
                    return `Math.abs(${args.join(",")})`
                },
                pow(node: Statement, $this: string, ...args: string[]) {
                    return `Math.pow(${args.join(",")})`;
                },
                ceil(node: Statement, $this: string, ...args: string[]) {
                    return `Math.ceil(${args.join(",")})`;
                },
                floor(node: Statement, $this: string, ...args: string[]) {
                    return `Math.floor(${args.join(",")})`;
                },
                round(node: Statement, $this: string, ...args: string[]) {
                    return `Math.round(${args.join(",")})`;
                },
                sin(node: Statement, $this: string, ...args: string[]) {
                    return `Math.sin((Math.PI/180)*${args[0]})`;
                },
                cos(node: Statement, $this: string, ...args: string[]) {
                    return `Math.cos((Math.PI/180)${args[0]})`;
                },
                tan(node: Statement, $this: string, ...args: string[]) {
                    return `Math.tan((Math.PI/180)${args[0]})`;
                },
                asin(node: Statement, $this: string, ...args: string[]) {
                    return `Math.asin(${args[0]})*180/Math.PI `;
                },
                acos(node: Statement, $this: string, ...args: string[]) {
                    return `Math.acos(${args[0]})*180/Math.PI `;
                },
                atan(node: Statement, $this: string, ...args: string[]) {
                    return `Math.atan(${args[0]})*180/Math.PI `;
                },
                min(node: Statement, $this: string, ...args: string[]) {
                    return `Math.min(${args.join(",")})`
                },
                max(node: Statement, $this: string, ...args: string[]) {
                    return `Math.max(${args.join(",")})`
                },
                sum(node: Statement, $this: string, ...args: string[]) {
                    return `(${args.join("+")})`
                },
                avg(node: Statement, $this: string, ...args: string[]) {
                    return `(${args.join("+")})/${args.length}`
                }
            }
        }
    ]
    _.addRange(methodAccepter, method$File);
}