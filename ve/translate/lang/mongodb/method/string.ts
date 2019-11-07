
namespace Ve.Lang.Transtate.mongodb {
    export var methodAccepter: MethodAccepter = [
        {
            name: 'Ve.String',
            props: {
                length(node: Statement, $this: string, ...args: string[]) {
                    return `$strLenBytes:[${$this}]`;
                },
                count(node: Statement, $this: string, ...args: string[]) {
                    return `$strLenBytes:[${$this}]`;
                }
            }
        },
        {
            name: 'Ve.Date',
            props: {
                new(node: Statement, value) {
                    return `__$Ve.Date.newDate("${value}")`;
                },
                now(node: Statement, $this: string) {
                    return `new Date()`
                },
                year(node: Statement, $this: string) {
                    return `$year:[${$this}]`;
                },
                month(node: Statement, $this: string) {
                    return `$month:[${$this}]`;
                },
                week(node: Statement, $this: string) {
                    return `$week:[${$this}]`;
                },
                weekday(node: Statement, $this: string) {
                    return `$dayOfWeek:[${$this}]`;
                },
                day(node: Statement, $this: string) {
                    return `$dayOfMonth:[${$this}]`;
                },
                hour(node: Statement, $this: string) {
                    return `hour:[${$this}]`;
                },
                minute(node: Statement, $this: string) {
                    return `$minute:[${$this}]`;
                },
                second(node: Statement, $this: string) {
                    return `$second:[${$this}]`;
                },
                millis(node: Statement, $this: string) {
                    return `$millisecond:[${$this}]`;
                }
            }
        },
        {
            name: "Ve.Math", props: {
                abs(node: Statement, value) {
                    return `$abs:[${value}]`
                },
                pow(node: Statement, value, value2) {
                    return `$pow:[${value},${value2}]`
                },
                add(node: Statement, value, value2) {
                    return `$add:[${value},${value2}]`
                },
                div(node: Statement, value, value2) {
                    return `$divide:[${value},${value2}]`
                },
                mul(node: Statement, value, value2) {
                    return `$multiply:[${value},${value2}]`
                },
                sub(node: Statement, value, value2) {
                    return `$subtract:[${value},${value2}]`
                },
                max(node: Statement, ...a: string[]) {
                    return `$max:[${a.join(",")}]`
                },
                min(node: Statement, ...a: string[]) {
                    return `$min:[${a.join(",")}]`
                },
                sum(node: Statement, ...a: string[]) {
                    return `$sum:[${a.join(",")}]`
                },
                avg(node: Statement, ...a: string[]) {
                    return `$avg:[${a.join(",")}]`
                }
            }
        }
    ]
}