(function(LINQ) {
    if (!ko || !ko.observableArray || !ko.observableArray.fn) {
        return;
    }
    
    Array.prototype.toObservableArray = function() {
        return ko.observableArray(this);
    };
    ko.observableArray.fn.toArray = function() {
        return this();
    };
    
    for (var key in LINQ.methods) {
        if (LINQ.methods.hasOwnProperty(key)) {
            ko.observableArray.fn[key] = (function(key) {
                return function() {
                    return LINQ.methods[key].apply(this(), arguments);
                }
            })(key);
        }
    }
})(LINQ);