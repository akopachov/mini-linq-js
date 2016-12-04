/* ! https://github.com/akopachov/mini-linq-js */
/* !
The MIT License (MIT)

Copyright (c) 2016 Alexander Kopachov <alex.kopachov@gmail.com> (https://www.linkedin.com/in/akopachov)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function () {
    var stringTrim = function(str) {
        if (typeof(str) !== 'string' || str === null) {
            return str;
        }

        if (!String.prototype.trim) {
            return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        }

        return str.trim();
    };
    var expressionCache = {};
    LINQ = {
        utils: {
            parseExpression: function (expression) {
                if (typeof (expression) === "function") {
                    return expression;
                }

                if (expression == null || typeof (expression) !== 'string' || expression.indexOf('=>') < 0) {
                    throw new SyntaxError('Expression "' + expression + '" is invalid');
                }

                if (typeof(expressionCache[expression]) === "function") {
                    return expressionCache[expression];
                }

                var parts = expression.split('=>');
                var args = stringTrim(parts[0]).replace(/[\(\)\s]/gi, '');
                var body = stringTrim(parts[1]);
                var expressionFn;

                try {
                    if (body.indexOf('return') < 0) {
                        body = 'return (' + body + ')';
                    }
                    
                    expressionFn = new Function(args, body);
                } catch(error) {
                    expressionFn = new Function(args, body);
                }
                
                if (typeof(expressionFn) !== 'function') {
                    throw new SyntaxError('Expression "' + expression + '" is invalid');
                }

                expressionCache[expression] = expressionFn;
                return expressionFn;
            },
            
            getType: function(obj) {
                var type = typeof obj;

                if (type !== 'object') return type; // primitive or function
                if (obj === null) return 'null';    // null

                // Everything else, check for a constructor
                var ctor = obj.constructor;
                var name = typeof ctor === 'function' && ctor.name;

                return typeof name === 'string' && name.length > 0 ? name : 'object';
            },
            
            getDefaultValue: function(type) {
                if (typeof type !== 'string') throw new TypeError('Type must be a string.');

                // Handle simple types (primitives and plain function/object)
                switch (type) {
                    case 'boolean'   : return false;
                    case 'function'  : return function () {};
                    case 'null'      : return null;
                    case 'number'    : return 0;
                    case 'object'    : return {};
                    case 'string'    : return "";
                    case 'symbol'    : return Symbol();
                    case 'undefined' : return void 0;
                }

                try {
                    // Look for constructor in this or current scope
                    var ctor = typeof this[type] === 'function'
                            ? this[type]
                            : eval(type);

                    return new ctor;

                // Constructor not found, return new object
                } catch (e) { return {}; }
            },

            isArray: function(arg) {
                if (Array.isArray) {
                    return Array.isArray(arg);
                }

                return Object.prototype.toString.call(arg) === '[object Array]';
            }
        },
        methods: {
            any: function (predicate) {
                if (typeof (predicate) === "string") {
                    predicate = LINQ.utils.parseExpression(predicate);
                } else if (typeof (predicate) !== "function") {
                    return this.length > 0;
                }
                
                if (typeof(Array.prototype.some) === 'function') {
                    return this.some(predicate);
                }

                for (var i = 0, l = this.length; i < l; i++) {
                    if (predicate(this[i], i, this)) {
                        return true;
                    }
                }

                return false;
            },

            all: function (predicate) {
                if (typeof (predicate) === "string") {
                    predicate = LINQ.utils.parseExpression(predicate);
                } else if (typeof (predicate) !== "function") {
                    throw new Error('Predicate is required');
                }
                
                if (typeof(Array.prototype.every) === 'function') {
                    return this.every(predicate);
                }

                var oppositePredicate = function () {
                    return !predicate.apply(this, arguments);
                }

                return !LINQ.methods.any.apply(this, [oppositePredicate]);
            },

            where: function (predicate) {
                if (typeof (predicate) === "string") {
                    predicate = LINQ.utils.parseExpression(predicate);
                } else if (typeof (predicate) !== "function") {
                   throw new Error('Predicate is required');
                }

                if (typeof (Array.prototype.filter) === "function") {
                    return this.filter(predicate);
                }

                var result = [];
                for (var i = 0, l = this.length; i < l; i++) {
                    if (predicate(this[i], i, this)) {
                        result.push(this[i]);
                    }
                }

                return result;
            },

            select: function (selector) {
                if (typeof (selector) === "string") {
                    selector = LINQ.utils.parseExpression(selector);
                } else if (typeof (selector) !== "function") {
                    throw new Error('Selector is required');
                }

                if (typeof (Array.prototype.map) === "function") {
                    return this.map(selector);
                }

                var result = [];
                for (var i = 0, l = this.length; i < l; i++) {
                    result.push(selector(this[i], i, this));
                }
                
                return result;
            },

            selectMany: function(selector) {
                if (typeof (selector) === "string") {
                    selector = LINQ.utils.parseExpression(selector);
                } else if (typeof (selector) !== "function") {
                    throw new Error('Selector is required');
                }

                var results = [];
                for (var i = 0, l = this.length; i < l; i++) {
                    var subArray = selector(this[i], i, this);
                    if (!LINQ.utils.isArray(subArray)) {
                        continue;
                    }
                    
                    results.push(subArray);
                }

                return Array.prototype.concat.apply([], results);
            },

            count: function (predicate) {
                if (typeof (predicate) === "string") {
                    predicate = LINQ.utils.parseExpression(predicate);
                } else if (typeof (predicate) !== "function") {
                    return this.length;
                }

                if (typeof (Array.prototype.filter) === "function") {
                    return this.filter(predicate).length;
                }

                var count = 0;
                for (var i = 0, l = this.length; i < l; i++) {
                    if (predicate(this[i], i, this)) {
                        count++;
                    }
                }

                return count;
            },

            orderBy: function (selector, comparator) {
                if (typeof (selector) === "string") {
                    selector = LINQ.utils.parseExpression(selector);
                } else if (typeof (selector) !== "function") {
                    selector = function(s) { return s; };
                }

                if (typeof (comparator) === "string") {
                    comparator = LINQ.utils.parseExpression(comparator);
                } else if (typeof (comparator) !== "function") {
                    comparator = function (a, b) {
                        if (a < b) return -1;
                        if (a > b) return 1;
                        return 0;
                    };
                }

                return this.slice(0)
                    .sort(function (a, b) {
                        var valA = selector(a);
                        var valB = selector(b);
                        return comparator(valA, valB);
                    });
            },

            orderByDescending: function (selector, comparator) {
                if (typeof (comparator) === "string") {
                    comparator = LINQ.utils.parseExpression(comparator);
                } else if (typeof (comparator) !== "function") {
                    comparator = function (a, b) {
                        if (a < b) return -1;
                        if (a > b) return 1;
                        return 0;
                    };
                }

                var oppositeComparator = function () {
                    return comparator.apply(this, arguments) * -1;
                };

                return LINQ.methods.orderBy.apply(this, [selector, oppositeComparator]);
            },

            groupBy: function (keySelector, resultSelector) {
                if (typeof (keySelector) === "string") {
                    keySelector = LINQ.utils.parseExpression(keySelector);
                } else if (typeof (keySelector) !== "function") {
                    throw new Error("Key selector is required");
                }

                if (typeof (resultSelector) === "string") {
                    resultSelector = LINQ.utils.parseExpression(resultSelector);
                } else if (typeof (resultSelector) !== "function") {
                    resultSelector = function (group, values) {
                        return { group: group, values: values };
                    };
                }

                var resultMap = {};
                for (var i = 0, l = this.length; i < l; i++) {
                    var key = keySelector(this[i], i, this);
                    if (!resultMap[key]) {
                        resultMap[key] = [];
                    }

                    resultMap[key].push(this[i]);
                }

                var result = [];
                for (var k in resultMap) {
                    if (resultMap.hasOwnProperty(k)) {
                        result.push(resultSelector(k, resultMap[k]));
                    }
                }

                return result;
            },

            distinct: function (selector, comparator) {
                if (typeof (selector) === "string") {
                    selector = LINQ.utils.parseExpression(selector);
                } else if (typeof (selector) !== "function") {
                    selector = function (a) { return a; }
                }

                if (typeof (comparator) === "string") {
                    comparator = LINQ.utils.parseExpression(comparator);
                } else if (typeof(comparator) !== 'function') {
                    comparator = function(a, b) { return a === b; }
                }

                var unique = [];
                var uniqueMap = {};
                for (var i = 0, l = this.length; i < l; i++) {
                    var key = selector(this[i], i, this);
                    if (!uniqueMap[key]) {
                        uniqueMap[key] = [key];
                        unique.push(this[i]);
                    } else {
                        var isUnique = true;
                        for (var j = 0, jl = uniqueMap[key].length; j < jl; j++) {
                            if (comparator(uniqueMap[key][j], key)) {
                                isUnique = false;
                                break;
                            }
                        }

                        if (isUnique) {
                            unique.push(this[i]);
                            uniqueMap[key].push(key);
                        }
                    }
                }

                return unique;
            },

            firstOrDefault: function (predicate) {
                if (typeof (predicate) === "string") {
                    predicate = LINQ.utils.parseExpression(predicate);
                } else if (typeof (predicate) !== "function") {
                    predicate = function () { return true; }
                }
                
                if (typeof(Array.prototype.find) === 'function') {
                    return this.find(predicate) || null;
                }

                for (var i = 0, l = this.length; i < l; i++) {
                    if (predicate(this[i], i, this)) {
                        return this[i];
                    }
                }

                return null;
            },

            lastOrDefault: function (predicate) {
                if (typeof (predicate) === "string") {
                    predicate = LINQ.utils.parseExpression(predicate);
                } else if (typeof (predicate) !== "function") {
                    predicate = function () { return true; }
                }

                for (var i = this.length - 1; i >= 0; i--) {
                    if (predicate(this[i], i, this)) {
                        return this[i];
                    }
                }

                return null;
            },

            joinWith: function(innerArray, innerKeySelector, outerKeySelector, resultSelector, keyComparator) {
                if (typeof (innerKeySelector) === "string") {
                    innerKeySelector = LINQ.utils.parseExpression(innerKeySelector);
                } else if (typeof (innerKeySelector) !== "function") {
                    throw new Error("Inner key selector is required");
                }

                if (typeof (outerKeySelector) === "string") {
                    outerKeySelector = LINQ.utils.parseExpression(outerKeySelector);
                } else if (typeof (outerKeySelector) !== "function") {
                    throw new Error("Outer key selector is required");
                }

                if (typeof (resultSelector) === "string") {
                    resultSelector = LINQ.utils.parseExpression(resultSelector);
                } else if (typeof (resultSelector) !== "function") {
                    throw new Error("Results selector is required");
                }

                if (typeof (keyComparator) === "string") {
                    keyComparator = LINQ.utils.parseExpression(keyComparator);
                } else if (typeof (keyComparator) !== "function") {
                    keyComparator = function(a, b) { return a === b; }
                }

                var result = [];
                for (var i = 0, outerLength = this.length; i < outerLength; i++) {
                    var outerKey = outerKeySelector(this[i], i, this);
                    for (var j = 0, innerLength = innerArray.length; j < innerLength; j++) {
                        var innerKey = innerKeySelector(innerArray[j], j, innerArray);
                        if (keyComparator(innerKey, outerKey)) {
                            result.push(resultSelector(innerArray[j], this[i]));
                        }
                    }
                }

                return result;
            },

            groupJoinWith: function(innerArray, innerKeySelector, outerKeySelector, resultSelector, keyComparator) {
                if (typeof (innerKeySelector) === "string") {
                    innerKeySelector = LINQ.utils.parseExpression(innerKeySelector);
                } else if (typeof (innerKeySelector) !== "function") {
                    throw new Error("Inner key selector is required");
                }

                if (typeof (outerKeySelector) === "string") {
                    outerKeySelector = LINQ.utils.parseExpression(outerKeySelector);
                } else if (typeof (outerKeySelector) !== "function") {
                    throw new Error("Outer key selector is required");
                }

                if (typeof (resultSelector) === "string") {
                    resultSelector = LINQ.utils.parseExpression(resultSelector);
                } else if (typeof (resultSelector) !== "function") {
                    throw new Error("Results selector is required");
                }

                if (typeof (keyComparator) === "string") {
                    keyComparator = LINQ.utils.parseExpression(keyComparator);
                } else if (typeof (keyComparator) !== "function") {
                    keyComparator = function(a, b) { return a === b; }
                }

                var result = [];
                for (var i = 0, outerLength = this.length; i < outerLength; i++) {
                    var outerKey = outerKeySelector(this[i], i, this);
                    var joinGroup = LINQ.methods.where.apply(innerArray, [function(innerElement, j) {
                        innerKey = innerKeySelector(innerArray[j], j, innerArray);
                        return keyComparator(innerKey, outerKey);
                    }]);
                    result.push(resultSelector(joinGroup, this[i]));
                }

                return result;
            },

            contains: function (value, comparator) {
                var anyComparator;
                if (typeof (comparator) === "string") {
                    var comparatorFn = LINQ.utils.parseExpression(comparator);
                    anyComparator = function (v) { return comparatorFn(v, value); };
                } else if (typeof (comparator) !== "function") {
                    anyComparator = function (v) { return v === value; }
                } else {
                    anyComparator = function (v) { return comparator(v, value); };
                }
                
                return LINQ.methods.any.apply(this, [anyComparator]);
            },
            
            aggregate: function(aggregator, seed) {
                if (typeof (aggregator) === "string") {
                    aggregator = LINQ.utils.parseExpression(aggregator);
                } else if (typeof (aggregator) !== "function") {
                    throw new Error("Aggregator function is required");
                }
                
                if (this.length <= 0) return seed;
                
                var result = typeof(seed) === 'undefined' ? LINQ.utils.getDefaultValue(LINQ.utils.getType(this[0])) : seed;
                if (typeof(Array.prototype.reduce) === 'function') {
                    return this.reduce(aggregator, result);
                }
                
                for (var i = 0, l = this.length; i < l; i++) {
                    result = aggregator(result, this[i], i, this);
                }
                
                return result;
            },
            
            sum: function(selector, defaultValue) {
                if (typeof (selector) === "string") {
                    selector = LINQ.utils.parseExpression(selector);
                } else if (typeof (selector) !== "function") {
                    selector = function(s) { return s; }
                }
                
                defaultValue = typeof(defaultValue) === 'undefined' ? LINQ.utils.getDefaultValue(LINQ.utils.getType(selector(this[0], 0, this))) : defaultValue;
                return LINQ.methods.aggregate.apply(this, [function(sum, next, index, array) { return sum + selector(next, index, array); }, defaultValue]);
            },
            
            min: function(selector) {
                if (typeof (selector) === "string") {
                    selector = LINQ.utils.parseExpression(selector);
                } else if (typeof (selector) !== "function") {
                    selector = function(s) { return s; }
                }
                
                if (this.length <= 0) return void(0);
                
                return LINQ.methods.aggregate.apply(this, [
                    function(min, next, index, array) { var nextVal = selector(next, index, array); return min > nextVal ? nextVal : min; }, 
                    selector(this[0], 0, this)]);
            },
            
            max: function(selector) {
                if (typeof (selector) === "string") {
                    selector = LINQ.utils.parseExpression(selector);
                } else if (typeof (selector) !== "function") {
                    selector = function(s) { return s; }
                }
                
                if (this.length <= 0) return void(0);
                
                return LINQ.methods.aggregate.apply(this, [
                    function(max, next, index, array) { var nextVal = selector(next, index, array); return max < nextVal ? nextVal : max; }, 
                    selector(this[0], 0, this)]);
            },
            
            skip: function(count) {
                if (typeof(count) !== 'number' || count < 0) {
                    throw new TypeError("Count is required and should be a positive number");
                }
                
                return this.slice(count, this.length);
            },
            
            take: function(count) {
                if (typeof(count) !== 'number' || count < 0) {
                    throw new TypeError("Count is required and should be a positive number");
                }
                
                return this.slice(0, count);
            },
            
            ofType: function(type) {
                if (typeof(type) !== 'string') {
                    throw new TypeError("Type is required.");
                }
                
                return LINQ.methods.where.apply(this, [function(item) {
                    return typeof(item) === type;
                }]);
            },

            union: function(anotherCollection, comparator) {
                if (typeof (comparator) === "string") {
                    comparator = LINQ.utils.parseExpression(comparator);
                } else if (typeof (comparator) !== "function") {
                    comparator = function (a, b) { return a === b; }
                }

                var result = [];
                var allValues = [].concat(this, anotherCollection);
                for (var i = 0, l = allValues.length; i < l; i++) {
                    var addToResult = true;
                    for (var j = 0, rl = result.length; j < rl; j++) {
                        if (comparator(allValues[i], result[j])) {
                            addToResult = false;
                            break;
                        }
                    }

                    if (addToResult) {
                        result.push(allValues[i]);
                    }
                }

                return result;
            },

            except: function(anotherCollection, comparator) {
                if (typeof (comparator) === "string") {
                    comparator = LINQ.utils.parseExpression(comparator);
                } else if (typeof (comparator) !== "function") {
                    comparator = function (a, b) { return a === b; }
                }

                var result = [];
                for (var i = 0, l = this.length; i < l; i++) {
                    var addToResult = true;
                    for (var j = 0, rl = anotherCollection.length; j < rl; j++) {
                        if (comparator(this[i], anotherCollection[j])) {
                            addToResult = false;
                            break;
                        }
                    }

                    if (addToResult) {
                        result.push(this[i]);
                    }
                }

                return result;
            }
        }
    };
    LINQ.methods.firstOrDefault.finalize = true;
    LINQ.methods.lastOrDefault.finalize = true;
    LINQ.methods.count.finalize = true;
    LINQ.methods.any.finalize = true;
    LINQ.methods.contains.finalize = true;
    LINQ.methods.all.finalize = true;
    LINQ.methods.aggregate.finalize = true;
    LINQ.methods.sum.finalize = true;
    LINQ.methods.min.finalize = true;
    LINQ.methods.max.finalize = true;

    for (var key in LINQ.methods) {
        if (LINQ.methods.hasOwnProperty(key)) {
            Array.prototype[key] = LINQ.methods[key];
        }
    }
})();