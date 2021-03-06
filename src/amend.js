/**
 * Amend left list object with keys from right list objects
 * joining by key
 *
 * @func
 * @memberOf Q
 * @category List
 * @param {Array} left - The original list
 * @param {Array} right - The extension list
 * @param {String} lKey - The original list key
 * @param {String} rKey - The extension list key, if a omitted assumed equal with lKey
 * @return {Function} The predicate function.
 * @example
 *
 *         var left = [{ id:1, b:2},{ id:2, b:2}];
 *         var right =[{ id:1, d:4},{ id:2, d:5}];
 *         Q.amend(left,right,'id') => [{"id":1,"b":2,"d":4},{"id":2,"b":2,"d":5}]
 */
var amend = function (left, right, lKey, rKey) {
    rKey = rKey || lKey;
    return map(function (l) {
        var found = find(function (r) {
            return l[lKey] == r[rKey];
        }, right);
        return mixin(l, found ? found : {});
    }, left);
};