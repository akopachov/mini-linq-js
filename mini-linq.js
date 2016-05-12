﻿(function () {
    var expressionCache = {};
    LINQ = {
        utils: {
            parseExpression: function (expression) {
                if (typeof (expression) === "function") {
                    return expression;
                }

                if (expression == null || typeof (expression) !== 'string' || expression.indexOf('=>') < 0) {
                    throw Exception('Expression "' + expression + '" is invalid');
                }

                if (typeof(expressionCache[expression]) === "function") {
                    return expressionCache[expression];
                }

                var parts = expression.split('=>');
                var args = parts[0].trim().replace(/[\(\)\s]/gi, '');
                var body = parts[1].trim();
                if (!body.startsWith('{') && body.indexOf('return') < 0) {
                    body = 'return (' + body + ')';
                }

                var expressionFn = new Function(args, body);
                expressionCache[expression] = expressionFn;
                return expressionFn;
            }
        },
        methods: {
            any: function (predicate) {
                if (typeof (predicate) === "string") {
                    predicate = LINQ.utils.parseExpression(predicate);
                } else if (typeof (predicate) !== "function") {
                    return this.length > 0;
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
                    throw Exception('Predicate is required');
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
                    return this.slice(0);
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
                    return this.slice(0);
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
                    return this.slice(0).sort();
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
                    throw Exception("Key selector is required");
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

            distinct: function (selector) {
                if (typeof (selector) === "string") {
                    selector = LINQ.utils.parseExpression(selector);
                } else if (typeof (selector) !== "function") {
                    selector = function (a) { return a; }
                }

                var uniqueMap = {};
                var unique = [];
                for (var i = 0, l = this.length; i < l; i++) {
                    var key = selector(this[i], i, this);
                    if (!uniqueMap[key]) {
                        uniqueMap[key] = true;
                        unique.push(this[i]);
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

                for (var i = this.length; i >= 0; i--) {
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
                    throw Exception("Inner key selector is required");
                }

                if (typeof (outerKeySelector) === "string") {
                    outerKeySelector = LINQ.utils.parseExpression(outerKeySelector);
                } else if (typeof (outerKeySelector) !== "function") {
                    throw Exception("Outer key selector is required");
                }

                if (typeof (resultSelector) === "string") {
                    resultSelector = LINQ.utils.parseExpression(resultSelector);
                } else if (typeof (resultSelector) !== "function") {
                    throw Exception("Results selector is required");
                }

                if (typeof (keyComparator) === "string") {
                    keyComparator = LINQ.utils.parseExpression(keyComparator);
                } else if (typeof (keyComparator) !== "function") {
                    keyComparator = function(a, b) { return a === b; }
                }

                var result = [];
                for (var i = 0, outerLength = this.length; i < outerLength; i++) {
                    for (var j = 0, innerLength = innerArray.length; j < innerLength; j++) {
                        var outerKey = outerKeySelector(this[i], i, this);
                        var innerKey = innerKeySelector(innerArray[j], j, innerArray);
                        if (keyComparator(innerKey, outerKey)) {
                            result.push(resultSelector(innerArray[j], this[i]));
                        }
                    }
                }

                return result;
            },

            contains: function (value, comparator) {
                if (typeof (comparator) === "string") {
                    var comparatorFn = LINQ.utils.parseExpression(comparator);
                    comparator = function (v) { return comparatorFn(v, value); };
                } else if (typeof (comparator) !== "function") {
                    comparator = function (v) { return v === value; }
                }
                
                return LINQ.methods.any.apply(this, [comparator]);
            }
        }
    };
    LINQ.methods.firstOrDefault.finalize = true;
    LINQ.methods.lastOrDefault.finalize = true;
    LINQ.methods.count.finalize = true;
    LINQ.methods.any.finalize = true;
    LINQ.methods.contains.finalize = true;
    LINQ.methods.all.finalize = true;

    for (var key in LINQ.methods) {
        if (LINQ.methods.hasOwnProperty(key)) {
            Array.prototype[key] = LINQ.methods[key];
        }
    }
})();