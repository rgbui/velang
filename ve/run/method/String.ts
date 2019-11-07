namespace Ve.Lang.Run {

    export var runMethod: RunMethod[] = [{
        name: 'Ve.String',
        props: {
            length($this: string) {
                return $this.length;
            },
            count(value)
            {
                var len = 0;
                for (var i = 0; i < value.length; i++) {
                    if (value.charCodeAt(i) > 127 || value.charCodeAt(i) == 94) {
                        len += 2;
                    } else {
                        len++;
                    }
                }
                return len;
            }
        }
    }]
}