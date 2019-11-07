function fa() {
    var razorTemplate = arguments[0];
    var context = arguments[1];
    var ViewBag = context.ViewBag;
    var layout = context.layout;
    var renderBody = function () { return context.renderBody.apply(context, arguments); };
    var renderSection = function () { return context.renderSection.apply(context, arguments); };
    var sectionRegister = function () { return context.sectionRegister.apply(context, arguments); };
    var clear = function () { return context.clear.apply(context, arguments); };

    var innerFunction = function (text) {

        var __$$rt1 = [];
        if (text)
            __$$rt1.push("    ");

        __$$rt1.push("{");

        __$$rt1.push(" ");

        __$$rt1.push("        fjiss");

        __$$rt1.push(text);

        __$$rt1.push("        ");

        __$$rt1.push("     ");

        __$$rt1.push("}");

        __$$rt1.push("else");

        __$$rt1.push("{");

        __$$rt1.push("         ");

        __$$rt1.push("\"");

        __$$rt1.push("sjis");

        __$$rt1.push("\"");

        __$$rt1.push("    ");

        __$$rt1.push("}");

        return __$$rt1.join("");

    };
    var args = Array.from(arguments);
    args.splice(0, 2);
    var result = innerFunction.apply(this, args);
    if (razorTemplate.type == 0 && layout) {
        context.layoutBody = result;
        result = layoutRegister(layout);
    }
    return result;
}