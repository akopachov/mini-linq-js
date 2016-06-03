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