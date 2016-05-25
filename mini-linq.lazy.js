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