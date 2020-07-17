
## 代码分析
```
def a={account:'kankan',pwd:'123456'};
    declaration assign vobject{key:value,key:value }

def b={pwd:a.account}
declaration assign vobject{key:property }
```

```
public class School{
    public Name:string;
}
public class Student{
    public Account:string;
    public Pwd:string;
    public Sex:bool;
    public school:School;
}
def a=new Student()
{ 
    Account:'kenekf',
    Pwd:'effeee',
    school:new School{ Name:"ffff"}
};

```

```
def a=int[]{1,2,4};
def b=a[0];


def a=<a:string,b:int>[
    {a:'effff',b:0},
    {a:'eeeffff',b:12345}
];

def b=a[0].a;


def a=(a:int,b:int)=>a+b;

def c=a(1,2);

def g='eeee'.length;


```


```
class Student{
    private def name:string;
    public Name:string{
        get{
            return this.name+"eeee";
        }
        set{
            this.name=value.replace("eeefeee","eeee");
        }
    }
    private def obj:{a:int,b:color};
    public Json({a:int,b:color})
    {
        get{
            return {a:this.obj.a,b:this.obj.b};
        } 
        set {
            this.obj.a=value.a;
            this.obj.b=value.b;
        }
    }
}
var st=new Student();
st.Name='eeeee';
console.log(st.Name);
st.Json={ a:'eeee', b:'#ffff'color};
```
## 运行分析

1. 数据
```
def a={
    name:'eeee',
    account:'#ffff',
    fn:(a:int,b:color)(int)=>{
        
    },
    obj:{a:1},
    array:int[]{1,2,3},
    list:<a:int,b:string>[{a:1,b:'eeeeee'}]
}

a{type:'object',
   props:[
      name{key:name,value:{type:'string',value:'eeee'}},
      account{key:account,value:{type:'string',value:'eeee'}},
      fn{key:fn,call,value:{type:'fn'}},
      obj{key:obj,value:{ type:'object',props:[
             a{key:a,value:{type:'int',value:1}}
          ]
        }
      },
      array{key:array,value:{type:'array',props:[
          1{key:1,value:{type:'int',value:1}},
          2{key:2,value:{type:'int',value:1}},
          3{key:3,value:{type:'int',value:1}}
      ]}},
      list{key:'list',value:{type:'list',props:[
          1{key:1,value:{type:'object',props:[{key:a,value:{type:int,value:1}},{key:b,value:{type:string,value:eeeee}}]}}
      ]}}
   ],
   prototype:object@prototype=>any@prototype
}

a.name
(reference a[prototype]).(reference a.name[prop])

a.fn(1,/#ffff/color)
(reference a[prototype]).(reference a.fn[prop])(constant[prototype],constant[prototype])

a.obj.a
(reference a[prototype]).(reference a.obj[prop]).(reference a.obj.a[prop])

a.array[1]
(reference a[prototype]).(reference a.array[prop])(reference a.array.1[prop])

a.list[1].a
(reference a[prototype]).(reference a.list[prop])(reference a.list.1[prop])(reference a.list.1.a[prop])

```
2. 类
```
package Ve.Test;
public class People {
    public name:string;
    public birthday:date;
    public age:int{
        get{
            return date.now.year-this.birthday.year;
        }
    }
    public bir:date{
        set{
           this.birthday=value;
        }
    }
    public log(...args:string[]):void
    {
        console.log(args[0],args[1]);
        console.log(this.name);
    }
}
public class Company{
    public name:string;
    public address:string;
    public business:string='';
}
public class Employee extends People{
    public no:string;
    public profession:string;
    public company:Company;
    public getUserInfo()({name:string,age:int})
    {
       super.log('eeee','eeefseee');
       return {name:this.name,age:this.age};
    }
    public userinfo({name:string,age:int})
    {
        get{
            return {name:this.name,age:this.age};
        }
    }
}
//
def employee:Employee=Employee
{
    no:'eeee',
    name:'kankan',
    birthday:'1989-09-25'date,
    profession:'软件工程师',
    company:Company{
        name:'上海月亮科技有限公司',
        address:'xx号',
        business:'软件'
    }
}
employee{
    type:'Employee',
    props:[
        {key:'no',value:{type:'string',value:'eeee'}},
        {key:'company',value:
            {
                type:'Company',
                props:[
                    {key:name,value:{type:'string',value:'上海月亮科技有限公司'}},
                    {key:address,value:{type:'string',value:'xx号'}}
                ]
            }
        },
        { key:'age',readable:true,writable:false,call:'',value:(调用时运行计算)},
        { key:'userinfo',readable:true,writable:false,call:'',value:(调用时运行计算)},
        { key:'bir',writeable:false,readable:false,call:'',value:(给值时运行计算)}
    ]
}

employee.no
(reference employee(prototype)).{reference employee.no[prop]}

employee.company.name
(reference employee(prototype)).(reference employee.company[prop] ).{reference employee.company.name[prop]}

```
3. 泛型
```
package Ve.Test;
public class Collect<T:String|Date|Int>{
    private list:T[];
    public Collect(t:T)
    {
          this.list=new Array<T>();
          if(ts.length>0)
          {
             this.list.insert(t);
          }
    }
    public append(t:T):void
    {
        this.list.append(t);
    }
    public add(ts:T[])
    {
        ts.each(t=>this.append(t));
    }
    public remove(t:T):void{
        var index=this.list.findIndex(t);
        this.list.removeAt(index);
    }
    public remove(predict:(T,int)(bool)):void{
        var index=this.list.findIndex(t);
        this.list.removeAt(index);
    }
    public find(predict:(T,int)(bool)):T{
        return this.list.find(predict);
    }
    public test<U>(u:U,ab:string):U
    {
        return u;
    }
    public test2<U>(a:{c:T,u:U}):U{
        return a.u;
    }
}
//
def c=new Collect<String>('gggg');
c.append('eeeeee');

c.test<Date>();
//数组
def arr=new Array<String>();
arr=(prototype{
    type:'Array',
    prototype:any,
    generics:[
        {name:'T',prototype:string}
    ]
    props:[
        {
          key:'length'
        }
    ]
})
arr.append('eeeee');

arr.remove("eeeee');

```

4. 函数及函数类型
```
public fun Add(name:string,pwd:string):void
{
   
}

def a:(int,bool)(bool)=(a:int,b:bool):bool=>{
    return b;
}
def a=(a:int,b:bool):bool=>{

}

public class classA{
    public a:(int,bool)(bool);
    public test(a:(int,bool)(bool))((int,bool)(bool))
    {
       return a;
    }
}

//
a(1,false);

def A=new classA();
A.test(a)(1,false);

```