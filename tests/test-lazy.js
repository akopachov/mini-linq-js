if (typeof(require) !== 'undefined') {
    require('./../mini-linq.js');
    require('./../mini-linq.lazy.js');
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
   
   it('Optimizator is working', function() {
       var result1 = testArray1.where('w => w > 1').where('w => w > 2').where('w => w > 3');
       var result2 = testArray1.toLazy().where('w => w > 1').where('w => w > 2').where('w => w > 3').toArray();
       test.array(result1).is(result2);
       
       var result3 = testArray1.where('w => w > 1').where('w => w < 1').where('w => w > 3');
       var result4 = testArray1.toLazy().where('w => w > 1').where('w => w < 1').where('w => w > 3').toArray();
       test.array(result3).is(result4);
       
       var result5 = testArray1.where(w => w > 1).where('w => w > 2').where(w => w > 3).select(s => s + 1).select('s => s + 5').select(s => s + 1);
       var result6 = testArray1.toLazy().where('w => w > 1').where(w => w > 2).where(w => w > 3).select(s => s + 1).select('s => s + 5').select(s => s + 1).toArray();
       test.array(result5).is(result6);
   });
});