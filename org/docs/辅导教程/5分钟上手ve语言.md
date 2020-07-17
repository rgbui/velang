# 5分钟上手ve语言

## 安装ve语言
有两种主要的方式来获取TypeScript工具：
- 通过npm（Node.js包管理器）
- 安装Visual Studio的TypeScript插件

Visual Studio 2017和Visual Studio 2015 Update 3默认包含了TypeScript。 如果你的Visual Studio还没有安装TypeScript，你可以下载它。

针对使用npm的用户：
```
npm install -g typescript
```

## 构建你的第一个ve文件
在编辑器，将下面的代码输入到greeter.ts文件里：
```
function greeter(person) {
    return "Hello, " + person;
}

let user = "Jane User";

document.body.innerHTML = greeter(user);
```