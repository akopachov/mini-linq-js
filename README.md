# mini-linq.js
## Description
LINQ for JavaScript library, which allows to work with arrays in a more easy way and focus on business logic.

## Usage
Just link `mini-linq.js` or `mini-linq.min.js` in your html.
```html
<script type="text/javascript" src="mini-linq.min.js"></script>
```
You also may use it in your Node.JS project by using
```javascript
require('mini-linq.min.js');
```
You can also attach and use mini-linq with [knockout observableArray](http://knockoutjs.com/documentation/observableArrays.html). Just link `mini-linq.knockout.js`.
Also you may use postponed [lazy-execution for arrays](#lazyArrays) by linking `mini-linq.lazy.js`.

## Available methods
* [any](#any)
* [all](#all)
* [where](#where)
* [select](#select)
* [count](#count)
* [orderBy](#orderBy)
* [orderByDescending](#orderByDescending)
* [groupBy](#groupBy)
* [distinct](#distinct)
* [firstOrDefault](#firstOrDefault)
* [lastOrDefault](#lastOrDefault)
* [joinWith](#joinWith)
* [contains](#contains)
* [aggregate](#aggregate)
* [sum](#sum)
* [min](#min)
* [max](#max)
* [skip](#skip)
* [take](#take)

## Terms
* <a name="predicate">**Predicate**</a> - function which accepts arguments (value, index, array) and returns: `true` if arguments matches specified business-logic conditions; `false` otherwise;
* <a name="selector">**Selector**</a> - function which accepts arguments (value, index, array) and returns some value which should be used instead of original value.
* <a name="comparator">**Comparator**</a> - function which accepts two arguments and returns `true` if two arguments are equal and `false` otherwise.
* <a name="orderComparator">**Order comparator**</a> - function which accepts two arguments and returns: `1` if first argument is greater then second; `-1` if second argument is greater then first; `0` if they are equal.

[Predicates](#predicate), [selectors](#selector), [comparators](#comparator) can be written in 3 ways:

1. usual way: `function(arg) { return arg * 2; }`;
2. modern way ([by using arrow functions](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/Arrow_functions)): `arg => arg * 2`;
3. modern way with obsolete browsers support: `'arg => arg * 2'`. It's almost the same as in p.2, just wrapped as a string. _mini-linq_ core will parse this string and generated appropriate function. _**Important!** It's not possible to use closure variables using this way._


## Methods description

### <a name="any">.any</a>
###### Description:
`.any` checks if there is at least one element in array which matches [predicate](#predicate). If called without [predicate](#predicate) then it checks for any element in the array.
###### Arguments:
`.any` accepts [predicate](#predicate) or nothing.
###### Returns:
`true` if there is at least one element which matches specified [predicate](#predicate); `false` otherwise.
###### Example of usage:
```javascript
[1, 2, 3].any(); // will return true, because predicate is not passed and array is not empty
[1, 2, 3].any(a => a > 2); // will return true because there is at least one element which match predicate a > 2
[1, 2, 3].any(a => a < 0); // will return false. There are no elements which match predicate a < 0
[].any(); // will return false. Array is empty.
```
---

### <a name="all">.all</a>
###### Description:
`.all` checks if all elements in array match [predicate](#predicate).
###### Arguments:
`.all` accepts [predicate](#predicate).
###### Returns:
`true` if all elements match specified [predicate](#predicate); `false` otherwise.
###### Example of usage:
```javascript
[1, 2, 3].all(a => a > 0); // will return true because all elements matches predicate a > 0
[1, 2, 3].all(a => a > 2); // will return false, because not all elements matches predicate a > 2
```
---

### <a name="where">.where</a>
###### Description:
`.where` selects all elements which match [predicate](#predicate).
###### Arguments:
`.where` accepts [predicate](#predicate).
###### Returns:
Array of elements which match [predicate](#predicate). Or empty array if there are no such elements.
###### Example of usage:
```javascript
[1, 2, 3, 4].where(a => a > 2); // will return [3, 4]
[1, 2, 3, 4].where(a => a > 5); // will return [] (empty array)
```
---

### <a name="select">.select</a>
###### Description:
`.select` produces new array by applying [selector](#selector) for each element.
###### Arguments:
`.select` accepts [selector](#selector).
###### Returns:
Array of elements produced by applying [selector](#selector). Or empty array if there are no elements.
###### Example of usage:
```javascript
[1, 2, 3, 4].select(s => s * 10); // will return [10, 20, 30, 40]
[].select(a => a * 10); // will return [] (empty array)
```
---

### <a name="count">.count</a>
###### Description:
`.count` calculates count of elements which match [predicate](#predicate). If called without [predicate](#predicate) then it will return total count of elements.
###### Arguments:
`.count` accepts [predicate](#predicate) or nothing.
###### Returns:
Count of elements which match specified [predicate](#predicate). Or total count of elements if [predicate](#predicate) is not specified.
###### Example of usage:
```javascript
[1, 2, 3, 4].count(s => c > 2); // will return 2
[1, 2, 3, 4].count(); // will return 4
```
---

### <a name="orderBy">.orderBy</a>
###### Description:
`.orderBy` order elements in ascending order by using [selector](#selector) and [order comparator](#orderComparator) (if specified).
###### Arguments:
`.orderBy` accepts [selector](#selector) as first argument and may accept [order comparator](#orderComparator) as a second argument.
###### Returns:
Array of ordered elements.
###### Example of usage:
```javascript
[2, 1, 4, 3].orderBy(s => s); // will return [1, 2, 3, 4]
[2, 1, 4, 3].orderBy(s => s, (first, second) => first - second); // will return [1, 2, 3, 4]
```
---

### <a name="orderByDescending">.orderByDescending</a>
###### Description:
`.orderByDescending` order elements in descending order by using [selector](#selector) and [order comparator](#orderComparator) (if specified).
###### Arguments:
`.orderByDescending` accepts [selector](#selector) as first argument and may accept [order comparator](#orderComparator) as a second argument.
###### Returns:
Array of ordered elements.
###### Example of usage:
```javascript
[2, 1, 4, 3].orderByDescending(s => s); // will return [4, 3, 2, 1]
[2, 1, 4, 3].orderByDescending(s => s, (first, second) => first - second); // will return [4, 3, 2, 1]
```
---

### <a name="groupBy">.groupBy</a>
###### Description:
`.groupBy` group elements by specified [selector](#selector) as a key.
###### Arguments:
`.groupBy` accepts [selector](#selector) as first argument and may accept result [selector](#selector) as a second argument. If result [selector](#selector) is not specified then `(group, values) => { group: group, values: values }` selector will be used.
###### Returns:
Array of grouped elements.
###### Example of usage:
```javascript
[2, 1, 4, 3, 5, 6].groupBy(s => s % 2); // will return [{group: '0', values: [2, 4, 6]}, {group: '1', values: [1, 3, 5]}]
[2, 1, 4, 3, 5, 6].groupBy(s => s % 2, (group, values) => (group == 0 ? 'even: ' : 'odd: ') + values); // Will return ["even: 2,4,6", "odd: 1,3,5"]
```
---

### <a name="distinct">.distinct</a>
###### Description:
`.distinct` selects distinct elements by using [selector](#selector) as a key or element if [selector](#selector) is not specified.
###### Arguments:
`.distinct` may accept [selector](#selector).
###### Returns:
Array of distinct elements.
###### Example of usage:
```javascript
[2, 1, 2, 3, 1, 6, 7, 3, 2].distinct(); // will return [2, 1, 3, 6, 7]
[2, 1, 2, 3, 1, 6, 7, 3, 2].distinct(d => d % 3) // will return [2, 1, 3]
```
---

### <a name="firstOrDefault">.firstOrDefault</a>
###### Description:
`.firstOrDefault` selects first element which matches [predicate](#predicate) if there is not such element, then `null` will be returned. If predicate is not specified then first element will be returned or `null` if array is empty.
###### Arguments:
`.firstOrDefault` may accept [predicate](#predicate).
###### Returns:
First element which matches [predicate](#predicate) or `null` if there is no such element. If predicate is not specified then first element will be returned or `null` if array is empty.
###### Example of usage:
```javascript
[2, 1, 2, 3, 1, 6, 7, 3, 2].firstOrDefault(f => f % 2 == 1); // will return 1
[2, 1, 2, 3, 1, 6, 7, 3, 2].firstOrDefault() // will return 2
[2, 1, 2, 3, 1, 6, 7, 3, 2].firstOrDefault(f => f < 0) // will return null
[].firstOrDefault() // will return null
```
---

### <a name="lastOrDefault">.lastOrDefault</a>
###### Description:
`.lastOrDefault` selects last element which matches [predicate](#predicate) if there is not such element, then `null` will be returned. If predicate is not specified then last element will be returned or `null` if array is empty.
###### Arguments:
`.lastOrDefault` may accept [predicate](#predicate).
###### Returns:
Last element which matches [predicate](#predicate) or `null` if there is no such element. If predicate is not specified then last element will be returned or `null` if array is empty.
###### Example of usage:
```javascript
[2, 1, 2, 3, 1, 6, 7, 3, 2].lastOrDefault(f => f % 2 == 1); // will return 3
[2, 1, 2, 3, 1, 6, 7, 3, 9].lastOrDefault() // will return 9
[2, 1, 2, 3, 1, 6, 7, 3, 2].lastOrDefault(f => f < 0) // will return null
[].lastOrDefault() // will return null
```
---

### <a name="joinWith">.joinWith</a>
###### Description:
`.joinWith` combines two arrays based upon the [inner key selector](#selector) and [outer key selector](#selector).
###### Arguments:
`.joinWith` accepts following arguments (1-4 are mandatory, 5-th is optional):

1. inner array to join with;
2. inner key [selector](#selector) which will be applied to inner array elements;
3. outer key [selector](#selector) which will be applied to outer array elements;
4. result [selector](#selector) which should accept two arguments (inner element and outer element) and return result element;
5. key [comparator](#comparator) which implements comparation logic between inner key and outer key. (optional)

###### Returns:
Array of combined elements.
###### Example of usage:
```javascript
[1, 2, 8, 2, 6, 3, 9, 2, 4].joinWith([1, 2, 3, 4], 'ik => ik', 'ok => ok', '(i, o) => i'); // will return [1, 2, 2, 3, 2, 4]
[1, 2, 3].joinWith([4, 5, 6], ik => true, ok => true, (i, o) => '' + i + o); // will return ["41", "51", "61", "42", "52", "62", "43", "53", "63"]
[1, 2, 3].joinWith([1, 2, 3], ik => ik + 1, ok => ok, (i, o) => i); // will return [1, 2]
[1, 2, 3].joinWith([4, 5, 6], ik => ik, ok => ok, (i, o) => i) // will return []
```
---

### <a name="contains">.contains</a>
###### Description:
`.contains` checks if passed value presents in array.
###### Arguments:
`.contains` accepts value and may accept [comparator](#comparator) as a second argument. If [comparator](#comparator) is not passed then `(a, b) => a === b` [comparator](#comparator) will be used by default.
###### Returns:
`true` if value presents in array; `false` otherwise.
###### Example of usage:
```javascript
[1, 2, 3, 4].contains(3); // will return true
[1, 2, 3, 4].contains(5); // will return false
[1, 2, 3, 4].contains('2'); // will return false, comparator is not passed, so === equality has been used.
[1, 2, 3, 4].contains('2', (a, b) => a == b); // will return true
```
---

### <a name="aggregate">.aggregate</a>
###### Description:
`.aggregate` applies an accumulator function over a sequence. It acts the same as [`Array.prototype.reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce).
###### Arguments:
`.aggregate` accepts accumulator function, which should accept two arguments: previous result and current element. Also may accept initial value as a second argument.
###### Returns:
Aggregated result.
###### Example of usage:
```javascript
[1, 2, 3, 4].aggregate((c, n) => c + n); // will return 10
[1, 2, 3, 4].aggregate((c, n) => c + n, 10); // will return 20 (because initial value is passed)
[].aggregate((c, n) => c + n); // will return undefined
[].aggregate((c, n) => c + n, 0); // will return 0
```
---

### <a name="sum">.sum</a>
###### Description:
`.sum` calculates total sum of elements using [selector](#selector) if specified.
###### Arguments:
`.sum` may accept [selector](#selector).
###### Returns:
Total sum.
###### Example of usage:
```javascript
[1, 2, 3, 4].sum(); // will return 10
[1, 2, 3, 4].sum(s => s); // will return 10
[1, 2, 3, 4].sum(s => s * 10); // will return 100
```
---

### <a name="min">.min</a>
###### Description:
`.min` finds minimum value using [selector](#selector) if specified.
###### Arguments:
`.min` may accept [selector](#selector).
###### Returns:
Minimum value. Or `undefined` if array is empty.
###### Example of usage:
```javascript
"the quick brown fox jumps over the lazy dog".split(' ').min('s => s.length'); // will return 3
[].min(); // will return undefined
[9, 5, 1, 9, 3, 5, 6].min(); // will return 1
```
---

### <a name="max">.max</a>
###### Description:
`.max` finds maximum value using [selector](#selector) if specified.
###### Arguments:
`.max` may accept [selector](#selector).
###### Returns:
Maximum value. Or `undefined` if array is empty.
###### Example of usage:
```javascript
"the quick brown fox jumps over the lazy dog".split(' ').max('s => s.length'); // will return 5
[].max(); // will return undefined
[9, 5, 1, 9, 3, 5, 6].max(); // will return 9
```
---

### <a name="skip">.skip</a>
###### Description:
`.skip` skips specified amount of elements.
###### Arguments:
`.skip` accepts number of elements to skip.
###### Returns:
Array of elements after skipped elements.
###### Example of usage:
```javascript
[1, 2, 3, 4].skip(2); // will return [3, 4]
[1, 2, 3, 4].skip(0); // will return [1, 2, 3, 4]
[1, 2, 3, 4].skip(9); // will return []
```
---

### <a name="take">.take</a>
###### Description:
`.take` takes specified amount of elements.
###### Arguments:
`.take` accepts number of elements to take.
###### Returns:
Array of taken elements.
###### Example of usage:
```javascript
[1, 2, 3, 4].take(2); // will return [1, 2]
[1, 2, 3, 4].take(0); // will return []
[1, 2, 3, 4].take(9); // will return [1, 2, 3, 4]
```
---

## <a name="lazyArrays">Lazy array</a>
By default all mini-linq methods will execute their logic instantly and return result. But in some cases it may be useful to postpone execution, until some conditions take place.
To do this with mini-linq it's necesasry to load `mini-linq.lazy.js` module. After that it will be possible to use `.toLazy()` to cast array to lazy array. `.toLazy()` doesn't accept any argument and returns `LazyArray` instance. `LazyArray` has the same mini-linq methods as normal array with the exception that some of them are not executing instantly. To get final result array you have to use `.toArray()` method. For example:
```javascript
[1, 2, 3, 4].toLazy(); // will return LazyArray instance
[1, 2, 3, 4].toLazy().where(w => w > 2); // will return LazyArray instance, .where is postponed, nothing executed.
[1, 2, 3, 4].toLazy().where(w => w > 2).toArray(); // will return [3, 4]
```
LazyArray has some optimization logic, to reduce amount of array traversals, for example:
```javascript
[1, 2, 3, 4].toLazy().where(w => w > 1).where(w => w < 4).toArray(); // will merge two .where methods into one, then execute and return [2, 3] (with just one traversal)
```

## Author
[Alexander Kopachov](https://www.linkedin.com/in/akopachov) (alex.kopachov@gmail.com)

## License
[MIT](https://raw.githubusercontent.com/akopachov/mini-linq-js/master/LICENSE)
