namespace Ve.Lang.Transtate.nodejs {
    export var method$File: MethodAccepter = [
        {
            name: 'Ve.File',
            props: {
                new(node: Statement, $this: string, ...args: string[]) {
                    return `{__$ve:true,$type:'file',value:'${$this}'}`;
                },
                content(node: Statement, $this: string, ...args: string[]) {
                    var declareName: string = node.langeRender.delclare('__ReadFileContent');
                    var err = node.langeRender.delclare('err');
                    node.currentStatement.langeRender.appendWrapper(`fs.readFile(${$this}.value,function(${err},${declareName})
                    {    
                        if(${err})
                        {

                        }
                        else{
                            @wrapper()
                        }  
                    })`)
                    return declareName;
                }
            }
        }
    ]
}