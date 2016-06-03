if (typeof(require) !== 'undefined') {
    require('../src/mini-linq.js');
    require('../src/mini-linq.lazy.js');
    var test = require('unit.js');
} else {
    var test = unitjs;
}

var testArray1 = [1, 2, 8, 2, 6, 3, 9, 2, 4];

describe('Lazy array', function() {
   it('Results are the same as for standart array', function() {
       var result1 = testArray1.select('s => s').where('w => w > 3');
       var result2 = testArray1.toLazy().select('s => s').where('w => w > 3').toArray();
       test.array(result1).is(result2);
       var val1 = testArray1.select('s => s').where('w => w > 3').sum();
       var val2 = testArray1.toLazy().select('s => s').where('w => w > 3').sum();
       test.value(val1).is(val2);
   });
   
   it('Optimizer is working', function() {
       var result1 = testArray1.where('w => w > 1').where('w => w > 2').where('w => w > 3');
       var result2 = testArray1.toLazy().where('w => w > 1').where('w => w > 2').where('w => w > 3').optimize().toArray();
       test.array(result1).is(result2);
       
       var result3 = testArray1.where('w => w > 1').where('w => w < 1').where('w => w > 3');
       var result4 = testArray1.toLazy().where('w => w > 1').where('w => w < 1').where('w => w > 3').optimize().toArray();
       test.array(result3).is(result4);
       
       var result5 = testArray1.where(function(w) {return w > 1;}).where('w => w > 2').where(function(w) {return w > 3;}).select(function(s) {return s + 1;}).select('s => s + 5').select(function(s) {return s + 1;});
       var result6 = testArray1.toLazy().where('w => w > 1').where(function(w) {return w > 2;}).where(function(w) {return w > 3;}).select(function(s) {return s + 1;}).select('s => s + 5').select(function(s) {return s + 1;}).optimize().toArray();
       test.array(result5).is(result6);
       
       test.array(testArray1.toLazy().orderBy('o => o').orderBy().orderByDescending().optimize().toArray()).is(testArray1.orderByDescending());

       test.array(testArray1.toLazy().skip(2).take(3).optimize().toArray()).is(testArray1.skip(2).take(3));
       test.array(testArray1.toLazy().skip(0).take(99).optimize().toArray()).is(testArray1.skip(0).take(99));
       test.array(testArray1.toLazy().skip(99).take(99).optimize().toArray()).is(testArray1.skip(99).take(99));
   });
});