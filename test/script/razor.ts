namespace Ve.Lang.testRazor {
    function testRazor(code: string, obj: Record<string, any>, viewBag?: Record<string, any>, isRun?: boolean) {
        if (isRun == false) return;
        var result = Ve.Lang.Razor.RazorTemplate.compile(code, obj, viewBag);
        console.log(code, obj, result);
    }
    testRazor(`ssssssss`, { a: 0 }, undefined, false);
    testRazor(`ssss@a ddd`, { a: 'eeeexxf{}' }, undefined, false);
    testRazor(`@a+@b`, { a: 'eeee', b: 'eeee' }, undefined, false);
    testRazor(`@a()+@b()+@d`, { a() { return 'rr' }, b() { return 'exff' }, d: 'eeee' }, undefined, false);
    testRazor(`@if(a>b){ 
       @d
    }else{ 
      @g
    }`, { a: 1, b: 2, d: 'eex', g: 'eeex' }, undefined, false);
    testRazor(`@for(var i=0;i<10;i++){
        @i+@i;
    }`, {}, undefined, false);

    testRazor(`@{
var a=20;
var b=30;

    }
    @if(a>b)
    {
        "sjssss"+ejfiss@@  
    }
    `, {}, undefined, false);

    testRazor(`
    @if(a>b){
          "ssss"
    }
    else if(a>1){
dddddd
    }
    else if(a=="eeee"){
ssssssss
    }
    else{
ffffffffff
    }
    
    `, { a: 0, b: 1 }, undefined, false);
    testRazor(`@(a)`, {a:"sssefss"},undefined,false);
    testRazor(`
    
    @if(a>b){
        sfff
        @if(a>b){
            ssffe
        }
    }
    else if(a==b)
    {
           fjssss
           @for(var i=0;i<10;i++)
           {
               @{
                   var ggg=10;
               }
               @ggg+@i----  @(ggg+i)
           }
    }
    
    `, { a: 1, b: 1 }, undefined,false);

    testRazor(`
    var bk='@(@()';   
    var ggg='@{@{}'; 
    `,{ },undefined,false);


    testRazor(`sjsss
    
    @{
        var g=20;
        var c="@@";
        
    }
    dsss
    @@
    @***sssssssssfffff*@
    
    `,{a:1,b:23},undefined,false);


    testRazor(`sjss
    sss

    ffffffffffffffff""""""@(a.c)@g""""
    
    `,{a:{c:'efffff'},g:'sss'});

}