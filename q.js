(function (factory) {
    if (typeof exports === 'object') {
        module.exports = factory(this);
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if(typeof Package !== 'undefined') {
        Q = factory();
    } else {
        this.Q = factory(this);
    }
}(function () {

    'use strict';
    /**
     * A practical functional library for Javascript programmers.
     *
     * @namespace Q
     */
    var Q = {version: '1.0.0'};

    /**
     * Creates an exception about calling a function with no arguments.
     *
     * @private
     * @category Internal
     * @return {TypeError} A no arguments exception.
     */
    function _noArgsException() {
        return new TypeError('Function called with no arguments');
    }

    /**
     * Optimized internal two-arity curry function.
     *
     * @private
     * @category Function
     * @param {Function} fn The function to curry.
     * @return {Function} curried function
     * @example
     *
     *      var addTwo = function(a, b) {
     *        return a + b;
     *      };
     *
     *      var curriedAddTwo = _curry2(addTwo);
     */
    function _curry2(fn) {
        return function(a, b) {
            switch (arguments.length) {
                case 0:
                    throw _noArgsException();
                case 1:
                    return function(b) {
                        return fn(a, b);
                    };
                default:
                    return fn(a, b);
            }
        };
    }


    /**
     * Optimized internal three-arity curry function.
     *
     * @private
     * @category Function
     * @param {Function} fn The function to curry.
     * @return {Function} curried function
     * @example
     *
     *      var addThree = function(a, b, c) {
     *        return a + b + c;
     *      };
     *
     *      var curriedAddThree = _curry3(addThree);
     */
    function _curry3(fn) {
        return function(a, b, c) {
            switch (arguments.length) {
                case 0:
                    throw _noArgsException();
                case 1:
                    return _curry2(function(b, c) {
                        return fn(a, b, c);
                    });
                case 2:
                    return function(c) {
                        return fn(a, b, c);
                    };
                default:
                    return fn(a, b, c);
            }
        };
    }

    /**
     * Returns a list of numbers from `start` (inclusive) to `end`
     * (exclusive) using tep.
     *
     * @func
     * @memberOf Q
     * @category List
     * @param {Number} end - step more than the last number in the list.
     * @param {Number=} start -  first number in the list. Assumed 0 if null
     * @param {Number=} step -  difference between two numbers. Assumed 1 if null
     * @return {Array} The list of numbers.
     * @example
     *
     *      Q.lay(5);    //=> [1, 2, 3, 4]
     *      Q.lay(53, 50);  //=> [50, 51, 52]
     *      Q.lay(4, 8, -1);  //=> [8, 7, 6, 5]
     */
    Q.lay = function (end, start, step) {
        start = start || 0;
        step = step == null ? 1 : step;
        var res = [],
            i = start;
        if (step > 0) {
            for (; i < end; i += step)
                res.push(i);
        } else if (step < 0) {
            for (; i > end; i += step)
                res.push(i);
        }
        return res;
    };
    /**
     * Returns the first element of the list which matches the predicate, or `undefined` if no
     * element matches.
     *
     * @func
     * @memberOf Q
     * @category List
     * @param {Function|Object} f The predicate function used to determine if the element is the
     *        desired one. Or specification object
     * @param {Array} list The array to consider.
     * @return {Object} The element found, or `undefined`.
     * @example
     *
     *      var xs = [{a: 1}, {a: 2}, {a: 3}];
     *      Q.find(function(d){ return d.a == 2;}, xs); //=> {a: 2}
     *      Q.find({ a : 2}, xs); //=> {a: 2}
     *      Q.find({a: 4},(xs); //=> undefined
     */
    var find = Q.find = _curry2(function(f, list) {
        var len = list.length,
            fn = typeof f == 'function' ? f : Q.mold(f);
        for (var i = 0; i < len; ++i) {
            if (fn(list[i]))
                return list[i];
        }
        return undefined;
    });

    /**
     * Returns predicate function that compares object with specification template
     *
     * @func
     * @memberOf Q
     * @category Function
     * @param {Object} spec - The specification object
     * @return {Function} The predicate function.
     * @example
     *
     *      Q.mold({a:1})({a:1,b:1}; //=> true
     *      Q.mold({a:4})({a:1,b:1}; //=> false
     */
    Q.mold = function (spec) {
        return function (obj) {
            for (var key in spec) {
                if (spec[key] != obj[key])
                    return false;
            }
            return true;
        }
    };
    /**
     * Amend left list object with keys from right list objects
     * joining by key
     *
     * @func
     * @memberOf Q
     * @category List
     * @param {List} left - The original list
     * @param {List} right - The extension list
     * @param {String} lKey - The original list key
     * @param {String} rKey - The extension list key, if a omitted assumed equal with lKey
     * @return {Function} The predicate function.
     * @example
     *
     *         var left = [{ id:1, b:2},{ id:2, b:2}];
     *         var right =[{ id:1, d:4},{ id:2, d:5}];
     *         Q.amend(left,right,'id') => [{"id":1,"b":2,"d":4},{"id":2,"b":2,"d":5}]
     */
    Q.amend = function (left, right, lKey, rKey) {
        rKey = rKey || lKey;
        return Q.map(function (l) {
            var found = find(function (r) {
                return l[lKey] == r[rKey];
            }, right);
            return Q.mixin(l, found ? found : {});
        }, left);
    };
    /**
     * Returns a new list containing only those items that match a given predicate function.
     * The predicate function is passed one argument: *(value)*.
     *
     * @func
     * @memberOf Q
     * @category core
     * @category List
     * @param {Function|Object} f The function called per iteration, or functor description.
     * @param {Array} list The collection to iterate over.
     * @return {Array} The new filtered array.
     * @example
     *
     *      var isEven = function(n) {
     *        return n % 2 === 0;
     *      };
     *      Q.filter(isEven, [1, 2, 3, 4]); //=> [2, 4]
     */
    Q.filter = _curry2(function (f, list) {
        var res = [],
            len = list.length,
            fn = typeof f == 'function' ? f : Q.mold(f);
        for (var i = 0; i < len; ++i) {
            if (fn(list[i]))
                res.push(list[i]);
        }
        return res;
    });


    /**
     * Determines the smallest of a list of items as determined by pairwise comparisons from the supplied comparator
     *
     * @func
     * @memberOf Q
     * @category math
     * @param {Function|String} f A comparator function or field specifier for elements in the list
     * @param {Array} list A list of comparable elements
     * @see Q.min
     * @return {*} The smallest element in the list. `undefined` if the list is empty.
     * @example
     *
     *      function cmp(obj) { return obj.x; }
     *      var a = {x: 1}, b = {x: 2}, c = {x: 3};
     *      Q.min(cmp, [a, b, c]); //=> {x: 1}
     */
    Q.min = _curry2(function (f, list) {
        var len = list.length,
            fn = typeof f == 'function' ? f : Q.field(f),
            item = list[0],
            res = fn(list[0]),
            current = NaN;
        for (var i = 0; i < len; ++i) {
            current = fn(list[i]);
            if (current < res) {
                item = list[i];
                res = current
            }
        }
        return item;
    });
    /**
     * Determines the largest of a list of items as determined by pairwise comparisons from the supplied comparator
     *
     * @func
     * @memberOf Q
     * @category math
     * @param {Function|String} f A comparator function or field specifier for elements in the list
     * @param {Array} list A list of comparable elements
     * @see Q.min
     * @return {*} The largest element in the list. `undefined` if the list is empty.
     * @example
     *
     *      function cmp(obj) { return obj.x; }
     *      var a = {x: 1}, b = {x: 2}, c = {x: 3};
     *      Q.max(cmp, [a, b, c]); //=> {x: 3}
     */
    Q.max = _curry2(function (f, list) {
        var len = list.length,
            fn = typeof f == 'function' ? f : Q.field(f),
            item = list[0],
            res = fn(list[0]),
            current = NaN;
        for (var i = 0; i < len; ++i) {
            current = fn(list[i]);
            if (current > res) {
                item = list[i];
                res = current
            }
        }
        return item;
    });
    /**
     * Returns a function that when supplied an object returns the indicated property of that object, if it exists.
     *
     * @func
     * @memberOf Q
     * @category Object
     * @sig s -> {s: a} -> a
     * @param {String} property The property name
     * @param {Object} obj The object to query
     * @return {*} The value at obj.p
     * @example
     *
     *      Q.prop('x', {x: 100}); //=> 100
     *      Q.prop('x', {}); //=> undefined
     *
     *      var fifth = Q.prop(4); // indexed from 0, remember
     *      fifth(['Bashful', 'Doc', 'Dopey', 'Grumpy', 'Happy', 'Sleepy', 'Sneezy']);
     *      //=> 'Happy'
     */
    Q.field = _curry2(function (property, obj) {
        if (arguments.length == 1) {
            return function (obj) {
                return obj[property];
            }
        }
        return obj[property];
    });

    /**
     * A function that does nothing but return the parameter supplied to it. Good as a default
     * or placeholder function.
     *
     * @func
     * @memberOf Q
     * @category Core
     * @sig a -> a
     * @param {*} x The value to return.
     * @return {*} The input value, `x`.
     * @example
     *
     *      Q.identity(1); //=> 1
     *
     *      var obj = {};
     *      Q.identity(obj) === obj; //=> true
     */
    Q.identity = function (x) {
        return x;
    };


    /**
     * Splits a list into sub-lists stored in an object, based on the result of calling a String-returning function
     * on each element, and grouping the results according to values returned.
     *
     * @func
     * @memberOf Q
     * @category List
     * @param {Function|String} f - function or string
     * @param {Array} list The array to group
     * @return {Object} An object with the output of `f` for keys, mapped to arrays of elements
     *         that produced that key when passed to `f`.
     * @example
     *
     * Q.group(function(num) { return Math.floor(num); },[4.2, 6.1, 6.4]) =>( { '4': [4.2], '6': [6.1, 6.4] })
     */
    Q.group = _curry2(function (f, list) {
        var fn = typeof f == 'function' ? f : Q.field(f);
        return Q.fold(function (acc, elt) {
            var key = fn(elt);
            acc[key] = acc[key] ? acc[key].concat(elt) : [elt];
            return acc;
        }, {}, list);
    });

    function _keyValue(fn, list) {
        return Q.map(function(item) {return {key: fn(item), val: item};}, list);
    }

    function _compareKeys(a, b) {
        return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    }
    /**
     * Sorts the list according to a key generated by the supplied function.
     *
     * @func
     * @memberOf Q
     * @category relation
     * @sig (a -> String) -> [a] -> [a]
     * @param {Function|String} f The function mapping `list` items to keys, or property string.
     * @param {Array} list The list to sort.
     * @return {Array} A new list sorted by the keys generated by `f`.
     * @example
     *
     * var entries = [{ name: 'ALICE', age: 101 }, {name: 'Bob',age: -400},{name: 'clara',age: 314.159}];
     * Q.sort(function(d){ return Math.abs(d.age);},entries)
     * => [{"name":"ALICE","age":101},{"name":"clara","age":314.159},{"name":"Bob","age":-400}]
     *  Q.sort("age", [{ name: 'ALICE', age: 101 }, {name: 'Bob',age: -400},{name: 'clara',age: 314.159}])
     * => [{"name":"Bob","age":-400},{"name":"ALICE","age":101},{"name":"clara","age":314.159}]
     *  Q.sort("-age", [{ name: 'ALICE', age: 101 }, {name: 'Bob',age: -400},{name: 'clara',age: 314.159}])
     * =>[{"name":"clara","age":314.159},{"name":"ALICE","age":101},{"name":"Bob","age":-400}]
     */
    Q.sort = _curry2(function (f, list) {
        var fn = typeof f == 'function' ? f
            : f[0] == '-' ? function (d) {
            return -1 * d[f.substring(1)]
        } : Q.field(f);
        return Q.pluck('val', _keyValue(fn, list).sort(_compareKeys));
    });

    /**
     * Returns a new list by plucking the same named property off all objects in the list supplied.
     *
     * @func
     * @memberOf Q
     * @category List
     * @sig String -> {*} -> [*]
     * @param {Number|String} key The key name to pluck off of each object.
     * @param {Array} list The array to consider.
     * @return {Array} The list of values for the given key.
     * @example
     *
     *     Q.pluck('a',[{a: 1}, {a: 2}]); //=> [1, 2]
     *     Q.pluck(0,[[1, 2], [3, 4]]);   //=> [1, 3]
     */
    Q.pluck = _curry2(function(key, list) {
        return Q.map(Q.field(key), list);
    });

    /**
     * Returns a new list by collecting into list results of applying the function to all object key value pairs
     *
     * @func
     * @memberOf Q
     * @category Obj
     * @param {Function|String} f The function executed for each key value pair
     * @param {Object} obj The obj to consider.
     * @return {Array} The list of results of applying the function to all key value pairs
     * @example
     *
     *     Q.collect(Math.sqrt,{ a:4,b:9,c:16}); //=> [2, 3, 4]
     */
    Q.collect = _curry2(function (f, obj) {
        var res = [];
        for (var key in obj)
            res.push(f(obj[key], key));
        return res;
    });
    /**
     * Returns a new list, constructed by applying the supplied function to every element of the
     * supplied list.
     *
     * @func
     * @memberOf Q
     * @category core
     * @category List
     * @sig (a -> b) -> [a] -> [b]
     * @param {Function} f The function to be called on every element of the input `list`.
     * @param {Array} list The list to be iterated over.
     * @return {Array} The new list.
     * @example
     *
     *      Q.map(function(x) { return x * 2; }, [1, 2, 3]); //=> [2, 4, 6]
     */
    Q.map = _curry2(function (f, list) {
        var len = list.length,
            res = new Array(len);
        for (var i = 0; i < len; ++i)
            res[i] =f(list[i], i);
        return res;
    });

    /**
     * Returns a single item by iterating through the obj, successively calling the iterator
     * function and passing it an accumulator value, the object value for the current key, and the current key
     * then passing the result to the next call.
     *
     * The iterator function receives two values: *(acc, value)*
     *
     * @func
     * @memberOf Q
     * @category core
     * @category List
     * @sig (a,b -> a) -> a -> [b] -> a
     * @param {Function} f The iterator function. Receives three values, the accumulator,
     *  the object value for the current key, and the current key
     * @param {*} acc The accumulator value.
     * @param {Object} obj The object to iterate over.
     * @return {*} The final, accumulated value.
     * @example
     *
     *  Q.taper(function(acc, val) { return acc+ val; }, 10,  {a: 2, b : 4}); //=> 16
     *  Q.taper(function(acc, val,key){return acc.concat( val,key);},[1,"e"], {a: 2, b : 4});//=>[[1,"e", 2,"a",4,"b"]
     */
    Q.taper = _curry3(function (f, acc, obj) {
        for (var key in obj)
            acc = f(acc, obj[key],key);
        return acc;
    });



    /**
     * Returns an object containing the same keys as passed object and values that are result of function called
     * for each object key value pair
     *
     * The iterator function receives two values: *(value,key)*
     *
     * @func
     * @memberOf Q
     * @category core
     * @category Object
     * @sig (a,b -> a) -> a -> [b] -> a
     * @param {Function} f The iterator function. Receives three values, the accumulator,
     *  the object value for the current key, and the current key
     * @param {Object} obj The object to iterate over.
     * @return {*} The final, accumulated value.
     * @example
     *
     *   Q.mapValues(function(num) { return num * 3; },{ 'a': 1, 'b': 2, 'c': 3}) => { 'a': 3, 'b': 6, 'c': 9 }
     *   Q.mapValues('age',characters) => { 'fred': 40, 'pebbles': 1 }
     */
    Q.mapValues = _curry2(function (f, obj) {
        var fn = typeof f == 'function' ? f : Q.field(f),
            res = {};
        for (var key in obj)
            res[key] = fn(obj[key]);
        return res;
    });

    /**
     * Create a new object with the own properties of a
     * merged with the own properties of object b.
     * This function will *not* mutate passed-in objects.
     *
     * @func
     * @memberOf Q
     * @category Object
     * @sig {k: v} -> {k: v} -> {k: v}
     * @param {Object} left source object
     * @param {Object} right object with higher precedence in output
     * @returns {Object} Returns the destination object.
     * @example
     *
     *      Q.mixin({ 'name': 'fred', 'age': 10 }, { 'age': 40 });
     *      //=> { 'name': 'fred', 'age': 40 }
     */
    Q.mixin = _curry2(function mixin(left, right) {
        var res = {}, key;
        for (key in left)
            res[key] = left[key];
        for (key in right)
            res[key] = right[key];
        return res;
    });


    /**
     * Returns a single item by iterating through the list, successively calling the iterator
     * function and passing it an accumulator value and the current value from the array, and
     * then passing the result to the next call.
     *
     * The iterator function receives two values: *(acc, value)*
     *
     * @func
     * @memberOf Q
     * @category core
     * @category List
     * @sig (a,b -> a) -> a -> [b] -> a
     * @param {Function} fn The iterator function. Receives two values, the accumulator and the
     *        current element from the array.
     * @param {*} acc The accumulator value.
     * @param {Array} list The list to iterate over.
     * @return {*} The final, accumulated value.
     * @example
     *
     *      Q.fold(function(a, b) { return a + b; }, 10, [1, 2, 3]); //=> 16
     */
    Q.fold = _curry3(function (fn, acc, list) {
        var len = list.length;
        for (var i = 0; i < len; ++i) {
            acc = fn(acc, list[i]);
        }
        return acc;
    });
    /**
     * Returns a new list by concatenating into list results of applying the function to all object key value pairs
     *
     * @func
     * @memberOf Q
     * @category Obj
     * @param {Function} f The function executed for each key value pair
     * @param {Object} obj The obj to consider.
     * @return {Array} The list of results of applying the function to all key value pairs
     * @example
     *
     *     Q.abate(function(d){ return [-d,d];},{ a:4,b:9,c:16}); //=> [-4,4,-9,9,-16,16]
     */
    Q.abate = _curry2(function (f, obj) {
        var res = [];
        for (var key in obj)
            res = res.concat(f(obj[key], key));
        return res;
    });

    /**
     * Returns a new list by concatenating into list results of applying the function to all elements and their index
     *
     * @func
     * @memberOf Q
     * @category List
     * @param {Function} fn The function executed for each key value pair
     * @param {Array} list The array
     * @return {Array} The list of results of applying the function to all key value pairs
     * @example
     *
     *     Q.curtail(function(d){ return [-d,d];},[4,9,16]); //=> [-4,4,-9,9,-16,16]
     */
    Q.curtail = _curry2(function (fn,list) {
        var acc = [],len= list.length;
        for (var i = 0; i < len; ++i) {
            acc= acc.concat(fn(list[i],i));
        }
        return acc;
    });

    Q.expand = function (fn, arr) {
        return Q.map(function (d) {
            return Q.mixin(d, fn(d));
        }, arr);
    };

    /**
     * Returns a list of numbers from `from` (inclusive) to `to`
     * (exclusive).
     *
     * @func
     * @memberOf Q
     * @category List
     * @sig Number -> Number -> [Number]
     * @param {Number} from The first number in the list.
     * @param {Number} to One more than the last number in the list.
     * @return {Array} The list of numbers in tthe set `[a, b)`.
     * @example
     *
     *      Q.range(1, 5);    //=> [1, 2, 3, 4]
     *      Q.range(50, 53);  //=> [50, 51, 52]
     */
    Q.range = _curry2(function range(from, to) {
        if (from >= to) {
            return [];
        }
        var idx = 0, result = new Array(Math.floor(to) - Math.ceil(from));
        while (from < to) {
            result[idx++] = from++;
        }
        return result;
    });
    /**
     * Returns a new list containing only one copy of each element in the original list.
     * Equality is strict here, meaning reference equality for objects and non-coercing equality
     * for primitives.
     *
     * @func
     * @memberOf Q
     * @category List
     * @sig [a] -> [a]
     * @param {Array} list The array to consider.
     * @return {Array} The list of unique items.
     * @example
     *
     *      Q.unique([1, 1, 2, 1]); //=> [1, 2]
     *      Q.unique([{}, {}]);     //=> [{}, {}]
     *      Q.unique([1, '1']);     //=> [1, '1']
     */
    Q.unique = function unique(list) {
        var idx = -1, len = list.length;
        var result = [], item;
        while (++idx < len) {
            item = list[idx];
            if (result.indexOf(item) == -1) {
                result[result.length] = item;
            }
        }
        return result;
    };

    /**
     * Returns a partial copy of an object containing only the keys specified.  If the key does not exist, the
     * property is ignored.
     *
     * @func
     * @memberOf Q
     * @category Object
     * @sig [k] -> {k: v} -> {k: v}
     * @param {Array} keys an array of String property keys to copy onto a new object
     * @param {Object} obj The object to copy from
     * @return {Object} A new object with only properties from `keys` on it.
     * @example
     *
     *      Q.pick(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
     *      Q.pick(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1}
     */
    Q.pick = _curry2(function(keys, obj) {
        var res ={},len = keys.length, key;
        for(var i= 0; i < len; ++i) {
            key = keys[i];
            if(obj.hasOwnProperty(key)){
                res[key] = obj[key];
            }
        }
        return res;
    });
    /**
     * Returns a partial copy of an object omitting the keys specified.
     *
     * @func
     * @memberOf Q
     * @category Object
     * @sig [k] -> {k: v} -> {k: v}
     * @param {Array} keys an array of String property names to omit from the new object
     * @param {Object} obj The object to copy from
     * @return {Object} A new object with properties from `names` not on it.
     * @example
     *
     *      Q.omit(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, c: 3}
     */
    Q.omit = _curry2(function(keys, obj) {
        var res ={},len = keys.length;
        for(var key in obj) {
            if(keys.indexOf(key) == -1){
                res[key] = obj[key];
            }
        }
        return res;
    });

    /**
     * Returns a list containing the names of all the enumerable own
     * properties of the supplied object.
     *
     * @func
     * @memberOf Q
     * @category Object
     * @sig {k: v} -> [k]
     * @param {Object} obj The object to extract properties from
     * @return {Array} An array of the object's own properties
     * @example
     *
     *      Q.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
     */
    Q.keys = function (obj) {
        return Object.keys(obj);
    };



    return Q;
}));
