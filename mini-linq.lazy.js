(function(LINQ) {
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

            that._modificatorQueue = that._modificatorQueue.splice(0, l);
            return l;
        };

        that.toArray = function () {
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
                    this._modificatorQueue.push({ fn: LINQ.methods[key], args: arguments });
                    if (linqFn.finalize) {
                        return this.toArray();
                    }
                    
                    return this;
                };
            })(key);
        }
    }
})(LINQ);