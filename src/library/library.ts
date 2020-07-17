///<reference path='../ast/compiler.ts'/>
namespace Ve.Lang {
    export function importCoreLibrary() {
        VeLibraryCodes.each(bc => {
            coreCompile.importPackage(bc.code, LibType.core);
        })
    }
    /***
     * 导入核心库接口，构建基本的运行环境
     * 
     **/
    importCoreLibrary();
}