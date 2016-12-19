if (typeof(require) !== 'undefined') {
    require('../dist/mini-linq.min.js');
    var test = require('unit.js');
} else {
    var test = unitjs;
}

var testArray1 = [1, 2, 8, 2, 6, 3, 9, 2, 4];

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
        test.array(testArray1.select('a => { x: a, xx: a * a }'))
            .isNotEmpty()
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
    
    it('.orderBy', function() {
        test.array(testArray1.orderBy('o => o'))
            .isNotEmpty()
            .match(function(arr) {
                return arr.length === testArray1.length;
            })
            .match(function(arr) {
                for (var i = 0; i < arr.length - 1; i++) {
                    if (arr[i] > arr[i + 1]) {
                        return false;
                    }
                    
                    return true;
                }
            });
    });
    
    it('.orderByDescending', function() {
        test.array(testArray1.orderByDescending('o => o'))
            .isNotEmpty()
            .match(function(arr) {
                return arr.length === testArray1.length;
            })
            .match(function(arr) {
                for (var i = 0; i < arr.length - 1; i++) {
                    if (arr[i] < arr[i + 1]) {
                        return false;
                    }
                    
                    return true;
                }
            });
    });
    
    it('.distinct', function() {
        var distinctElements = {};
        test.array(testArray1.distinct())
            .match(function(arr) {
                return arr.length <= testArray1.length;
            })
            .matchEach(function(it, key) {
                if (testArray1.hasOwnProperty(key) && typeof(distinctElements[it]) !== 'undefined') {
                    return false;
                }

                return distinctElements[it] = true;
            });
        test.array([1, 2, '2', '3', 3, 4, 5, 8, 5].distinct()).is([1, 2, '2', '3', 3, 4, 5, 8]);
        test.array([1, 2, '2', '3', 3, 4, 5, 8, 5].distinct('x => x', '(a, b) => a == b')).is([1, 2, '3', 4, 5, 8]);
    });
    
    it('.firstOrDefault', function() {
        test.value(testArray1.firstOrDefault()).is(testArray1[0]);
        test.value(testArray1.firstOrDefault('f => f % 2 === 0')).is(2);
        test.value(testArray1.firstOrDefault('f => f === 999')).isNull();
    });
    
    it('.lastOrDefault', function() {
        test.value(testArray1.lastOrDefault()).is(testArray1[testArray1.length - 1]);
        test.value(testArray1.lastOrDefault('f => f % 2 === 0')).is(4);
        test.value(testArray1.lastOrDefault('f => f === 999')).isNull();
    });
    
    it('.contains', function() {
        test.value(testArray1.contains(2)).isTrue();
        test.value(testArray1.contains(999)).isFalse();
        test.value(testArray1.contains('2')).isFalse(); // === by default is in use.
        test.value(testArray1.contains('2', '(a, b) => a == b')).isTrue(); // force == to use
        test.value([1, 2, 3, 4].contains('2', function(a, b) { return a == b;})).isTrue();
    });
    
    it('.groupBy', function() {
        var distinctElements = {};
        test.array(testArray1.groupBy('o => o'))
            .isNotEmpty()
            .matchEach(function(it, key) {
                if (testArray1.hasOwnProperty(key) && typeof(distinctElements[it.group]) !== 'undefined') {
                    return false;
                }

                return distinctElements[it.group] = true;
            })
            .matchEach(function(it, key) {
                if (testArray1.hasOwnProperty(key)) {
                    test.array(it.values).isNotEmpty()
                }
                
                return true;
            });
    });
    
    it('.joinWith', function() {
        test.array(testArray1.joinWith(testArray1, 'ik => true', 'ok => true', '(i, o) => i'))
            .isNotEmpty()
            .match(function(arr) {
                return arr.length === testArray1.length * testArray1.length;
            });
        test.array(testArray1.joinWith([1, 2, 3, 4], 'ik => ik', 'ok => ok', '(i, o) => i'))
            .isNotEmpty()
            .match(function(arr) {
                return arr.length === 6;
            });
    });
    
    it('.aggregate', function() {
        var testArray = "the quick brown fox jumps over the lazy dog".split(' ');
        test.value(testArray.aggregate('(workingSentence, next) => next + " " + workingSentence'))
            .is('dog lazy the over jumps fox brown quick the ');
            
        var testArraySumm = 0;
        for (var i = 0; i < testArray1.length; i++) {
            testArraySumm += testArray1[i];
        }
        test.value(testArray1.aggregate('(c, n) => c + n')).is(testArraySumm);
    });
    
    it('.sum', function() {
        var testArray = "the quick brown fox jumps over the lazy dog".split(' ');
        test.value(testArray.sum('s => s + "-"')).is('the-quick-brown-fox-jumps-over-the-lazy-dog-');
            
        var testArraySumm = 0;
        for (var i = 0; i < testArray1.length; i++) {
            testArraySumm += testArray1[i];
        }
        test.value(testArray1.sum('s => s')).is(testArraySumm);
    });
    
    it('.min', function() {
        var testArray = "the quick brown fox jumps over the lazy dog".split(' ');
        test.value(testArray.min('s => s.length')).is(3);
        test.value([].min()).isUndefined();
        test.value([9, 5, 1, 9, 3, 5, 6].min()).is(1);
    });
    
    it('.max', function() {
        var testArray = "the quick brown fox jumps over the lazy dog".split(' ');
        test.value(testArray.max('s => s.length')).is(5);
        test.value([].max()).isUndefined();
        test.value([9, 5, 1, 9, 3, 5, 6].max()).is(9);
    });
    
    it('.skip', function() {
        test.array([1, 2, 3, 4].skip(2)).is([3, 4]);
        test.array([1, 2, 3, 4].skip(0)).is([1, 2, 3, 4]);
        test.array([1, 2, 3, 4].skip(9)).is([]);
    });
    
    it('.take', function() {
        test.array([1, 2, 3, 4].take(2)).is([1, 2]);
        test.array([1, 2, 3, 4].take(0)).is([]);
        test.array([1, 2, 3, 4].take(9)).is([1, 2, 3, 4]);
    });
    
    it('.ofType', function() {
        test.array([1, '2', '3', 4].ofType('string')).is(['2', '3']);
        test.array([1, '2', '3', 4].ofType('number')).is([1, 4]);
        test.array([1, '2', '3', 4].ofType('object')).is([]);
        test.array([].ofType('object')).is([]);
    });

    it('.union', function() {
        test.array([1, 2, 3, 4].union([2, 3, 4, 5])).is([1, 2, 3, 4, 5]);
        test.array([1, 2, 3, 4].union([5, 6, 7, 8])).is([1, 2, 3, 4, 5, 6, 7, 8]);
        test.array([1, 2, 3, 4].union([])).is([1, 2, 3, 4]);
        test.array([].union([])).is([]);
        test.array([1, 2, 3, 4].union([2, '3', '4', 5], '(a, b) => a == b')).is([1, 2, 3, 4, 5]);
    });

    it('.except', function() {
        test.array([1, 2, 3, 4].except([3, 4, 5])).is([1, 2]);
        test.array([1, 2, 3, 4].except([5, 6, 7])).is([1, 2, 3, 4]);
        test.array([1, 2, 3, 4].except([1, 2, 3, 4])).is([]);
        test.array([1, 2, 3, 4].except(['3', 4, '5'], '(a, b) => a == b')).is([1, 2]);
    });

    it('.selectMany', function() {
        var testArray2 = [
            { x: [1, 2], y: 0 }, 
            { x: [3, 4], y: 1 }, 
            { x: [5, 6], y: 2 }];
        test.array(testArray2.selectMany('sm => sm.x')).is([1, 2, 3, 4, 5, 6]);
        test.array(testArray2.selectMany('sm => sm.y')).is([]);
    });
    it('.groupJoinWith', function() {
        test.array([1, 2, 3, 4].groupJoinWith([1, 2, 3, 1, 2, 3], 'ik => ik', 'ok => ok', '(g, o) => g'))
            .isNotEmpty()
            .is([[1, 1], [2, 2], [3, 3], []]);

        test.array([].groupJoinWith([1, 2, 3, 1, 2, 3], 'ik => ik', 'ok => ok', '(g, o) => g'))
            .isEmpty();

        test.array([1, 2, 3, 4].groupJoinWith([], 'ik => ik', 'ok => ok', '(g, o) => g'))
            .isNotEmpty()
            .is([[], [], [], []]);

        test.array([1, 2, 3, 4].groupJoinWith([], 'ik => ik', 'ok => ok', '(g, o) => o'))
            .isNotEmpty()
            .is([1, 2, 3, 4]);
    });
});