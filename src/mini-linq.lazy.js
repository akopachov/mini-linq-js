/* !
The MIT License (MIT)

Copyright (c) 2016 Alexander Kopachov (https://www.linkedin.com/in/akopachov)

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
(function(LINQ) {
    var MERGE_FUNCTIONS = [
        function(current, next) {
            if (current.name === next.name && next.name === 'where') {
                var currentPredicate = LINQ.utils.parseExpression(current.args[0]);
                var nextPredicate = LINQ.utils.parseExpression(next.args[0]);
                return (function(currentPredicate, nextPredicate) {
                    return {
                        name: current.name,
                        args: [function() { 
                            return currentPredicate.apply(this, arguments) && nextPredicate.apply(this, arguments); 
                        }],
                        fn: LINQ.methods[current.name]
                    }
                })(currentPredicate, nextPredicate);
            }
            
            return false;
        },
        
        function(current, next) {
            if (current.name === next.name && next.name === 'select') {
                var currentPredicate = LINQ.utils.parseExpression(current.args[0]);
                var nextPredicate = LINQ.utils.parseExpression(next.args[0]);
                return (function(currentPredicate, nextPredicate) {
                    return {
                        name: current.name,
                        args: [function() { 
                            return nextPredicate.apply(this, [currentPredicate.apply(this, arguments)]); 
                        }],
                        fn: LINQ.methods[current.name]
                    }
                })(currentPredicate, nextPredicate);
            }
            
            return false;
        },
        
        function(current, next) {
            var orderMethods = ['orderBy', 'orderByDescending'];
            if (orderMethods.contains(current.name) && orderMethods.contains(next.name)) {
                return next;
            }
            
            return false;
        },
        
        function(current, next) {
            if (current.name == 'skip' && next.name == 'take') {
                return (function(skipCnt, takeCnt) { 
                    return {
                        name: 'skiptake',
                        args: [skipCnt, takeCnt],
                        fn: function(skip, take) {
                            return this.slice(skip, skip + take);
                        }
                    }
                })(current.args[0], next.args[0]);
            }
            
            return false;
        }
    ];
    
    var LazyArray = function (array) {
        var that = this;
        var _array = array;
        that._modificatorQueue = [];

        var applyModificators = function () {
            var l = that._modificatorQueue.length;
            for (var i = 0; i < l; i++) {
                var modificator = that._modificatorQueue[i];
                _array = modificator.fn.apply(_array, modificator.args);
            }

            that._modificatorQueue.splice(0, l);
            return l;
        };
        
        var mergeModificators = function() {           
            var i = 0;
            while (i < that._modificatorQueue.length - 1) {
                var current = that._modificatorQueue[i];
                var next = that._modificatorQueue[i + 1];
                var merged = false;
                for (var j = 0, l = MERGE_FUNCTIONS.length; j < l; j++) {
                    var mergeFn = MERGE_FUNCTIONS[j];
                    var mergedModificator = mergeFn(current, next);
                    if (mergedModificator) {
                        merged = true;
                        that._modificatorQueue.splice(i + 1, 1);
                        that._modificatorQueue[i] = mergedModificator;
                    }
                }
                
                if (!merged) {
                    i++;
                }
            }
        };
        
        that.optimize = function() {
            mergeModificators();
            return that;
        };

        that.toArray = function () {
            if (_array.length > 100 && that._modificatorQueue.length > 2) {
                that.optimize();
            }
            
            applyModificators();
            return Array.isArray(_array) ? _array.slice(0) : _array;
        };
    };
    
    Array.prototype.toLazy = function() {
        return new LazyArray(this);
    };
    
    for (var key in LINQ.methods) {
        if (LINQ.methods.hasOwnProperty(key)) {
            LazyArray.prototype[key] = (function(key) {
                return function() {
                    var linqFn = LINQ.methods[key];
                    this._modificatorQueue.push({ fn: LINQ.methods[key], args: arguments, name: key });
                    if (linqFn.finalize) {
                        return this.toArray();
                    }
                    
                    return this;
                };
            })(key);
        }
    }
})(LINQ);