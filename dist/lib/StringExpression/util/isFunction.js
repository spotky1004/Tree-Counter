// https://stackoverflow.com/a/18546154
// This should be a function, because in certain JavaScript engines (V8, for
// example, try block kills many optimizations).
export default function isFunction(func) {
    // For some reason, function constructor doesn't accept anonymous functions.
    // Also, this check finds callable objects that aren't function (such as,
    // regular expressions in old WebKit versions), as according to EcmaScript
    // specification, any callable object should have typeof set to function.
    if (typeof func === 'function')
        return true;
    // If the function isn't a string, it's probably good idea to return false,
    // as eval cannot process values that aren't strings.
    if (typeof func !== 'string')
        return false;
    // So, the value is a string. Try creating a function, in order to detect
    // syntax error.
    try {
        // Create a function with string func, in order to detect whatever it's
        // an actual function. Unlike examples with eval, it should be actually
        // safe to use with any string (provided you don't call returned value).
        Function(func);
        return true;
    }
    catch (e) {
        // While usually only SyntaxError could be thrown (unless somebody
        // modified definition of something used in this function, like
        // SyntaxError or Function, it's better to prepare for unexpected.
        if (!(e instanceof SyntaxError)) {
            throw e;
        }
        return false;
    }
}
