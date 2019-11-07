///<reference path='../statement/Statement.ts'/>



namespace Ve.Lang {
    /**
    * ve.com.s.ab(包的引用命名空间)
    * ve.com.class.test
    * 'eee'.length;
    * 'eeee'.toString();
    * ab().toString();
    * ab[0].toString();
    * (a+b).toString();
    * s.length;
    * b.length;
    * ab.g.c(def ab={c:'eeee',g:{c:'eeee'}})
    * g.a[0];
    * 
    */
    export class PropertyExpression extends Expression {
        public type = StatementType.objectReferenceProperty;
        private _propertys: VeArray<string | Expression> = new VeArray();
        public get propertys(): VeArray<string | Expression> {
            return this._propertys;
        }
        public set propertys(value: VeArray<string | Expression>) {
            this._propertys = value;
            value.each(v => {
                if (v instanceof Statement) this.append(v);
            })
        }
    }
}