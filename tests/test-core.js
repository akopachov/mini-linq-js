var test = require('unit.js');
require('./../mini-linq.js');

var testArray1 = [1, 2, 8, 2, 6, 3, 9, 2, 4];

describe('Core', function() {
    it('Structure', function () {
        test.object(LINQ)
            .hasProperty('utils')
            .hasProperty('methods');
        test.object(LINQ.methods)
            .isNotEmpty()
            .matchEach(function(it, key) {
                return typeof(it) === 'function';
            });
    });
    
    it('Expression parser', function() {
       var expression = function(x) { return x * x; }
       var expressionParsed = LINQ.utils.parseExpression('x => x * x');
       var testValue = Math.random() * 99;
       test.value(expressionParsed).isFunction();
       test.function(expressionParsed).match(function (it) {
           return it(testValue) === expression(testValue);
       })
    });
    
    it('Attachment to Array', function() {
        var emptyArray = [];
        test.object(LINQ.methods)
            .isNotEmpty()
            .matchEach(function(it, key) {
                return emptyArray[key] === it;
            });
    });
});

describe('Methods', function() {
    it('.any', function() {
        test.value(testArray1.any('a => a == 2'))
            .isNotType('undefined')
            .isBool()
            .isTrue();
        test.value(testArray1.any('a => a == 999'))
            .isNotType('undefined')
            .isBool()
            .isFalse();    
    });
    
    it('.all', function() {
        test.value(testArray1.all('a => a == 2'))
            .isNotType('undefined')
            .isBool()
            .isFalse();
        test.value(testArray1.all('a => a <= 9'))
            .isNotType('undefined')
            .isBool()
            .isTrue();
    });
    
    it('.where', function() {
        test.array(testArray1.where('a => a > 2 && a < 5'))
            .isNotEmpty()
            .match(function(arr) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] <= 2 || arr[i] >= 5) {
                        return false;
                    }
                }
                
                return true;
            });
    });
    
    it('.select', function() {
        test.array(testArray1.select('a => return { x: a, xx: a * a }'))
            .isNotEmpty()
            //.hasLength(testArray1.length)
            .match(function(arr) {
                for (var i = 0; i < arr.length; i++) {
                    if (typeof(arr[i]) !== 'object' || arr[i].x !== testArray1[i]) {
                        return false;
                    }
                }
                
                return true;
            });
    });
    
    it('.count', function() {
        test.value(testArray1.count('a => a == 2'))
            .isNotType('undefined')
            .isNumber()
            .is(3);
            
        test.value(testArray1.count())
            .isNotType('undefined')
            .isNumber()
            .is(testArray1.length);
    });
});