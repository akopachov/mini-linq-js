# mini-linq-js
## Description
LINQ for JavaScript library, which allows to work with arrays in a more easy way and focus on business logic.

## Usage:
Just link mini-linq.js or mini-linq.min.js in your html.
```html
<script type="text/javascript" src="mini-linq.min.js"></script>
```
You also may use it in your Node.JS project by using
```javascript
require('mini-linq.min.js');
```

## Available methods:
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
* joinWith
* contains
* aggregate
* sum

## Terms:
* <a name="predicate">**Predicate**</a> - function which accepts arguments (value, index, array) and returns: `true` if arguments matches specified business-logic coditions; `false` otherwise;
* <a name="selector">**Selector**</a> - function which accepts arguments (value, index, array) and returns some value which should be used instead of original value.
* <a name="comparator">**Comparator**</a> - function which accepts two arguments and returns: `1` if first argument is greater then second; `-1` if second argument is greater then first; `0` if they are equal.

[Predicates](#predicate), [selectors](#selector), [comparators](#comparator) can be written in 3 ways:

1. usual way: `function(arg) { return arg * 2; }`;
2. modern way ([by using arrow functions](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/Arrow_functions)): `arg => arg * 2`;
3. modern way with obsolete browsers support: `'arg => arg * 2'`. It's almost the same as in p.2, just wrapped as a string. _mini-linq_ core will parse this string and generated appropriate function.


## Methods description:

### <a name="any">.any</a>
###### Description:
`.any` check if there is at least one element in array which matches [predicate](#predicate). If called without [predicate](#predicate) then it check for any element in the array.
###### Arguments:
`.any` accepts [predicate](#predicate) or nothing.
###### Returns:
`true` if there is at least one element which matches specified [predicate](#predicate); `false` otherwise.
###### Example of usage:
```javascript
[1, 2, 3].any(); // will return true, because predicate is not passed and array is not empty
[1, 2, 3].any(a => a > 2); // will return true because there is at least one element which match predicate a > 2
[1, 2, 3].any(a => a < 0); // will return false. There is no elements which match predicate a < 0
[].any(); // will return false. Array is empty.
```
---

### <a name="all">.all</a>
###### Description:
`.all` check if all elements in array matches [predicate](#predicate).
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
`.where` selects all elements which matches [predicate](#predicate).
###### Arguments:
`.where` accepts [predicate](#predicate).
###### Returns:
Array of elements which matches [predicate](#predicate). Or empty array if there are no such elements.
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
`.count` calculate count of elements which matches [predicate](#predicate). If called without [predicate](#predicate) then it will return total count of elements.
###### Arguments:
`.count` accepts [predicate](#predicate) or nothing.
###### Returns:
Count of element which matches specified [predicate](#predicate). Or total count of elements if [predicate](#predicate) is not specified.
###### Example of usage:
```javascript
[1, 2, 3, 4].count(s => c > 2); // will return 2
[1, 2, 3, 4].count(); // will return 4
```
---

### <a name="orderBy">.orderBy</a>
###### Description:
`.orderBy` orders elements in ascending order by using [selector](#selector) and [comparator](#comparator) (if specified).
###### Arguments:
`.orderBy` accepts [selector](#selector) as first argument and may accept [comparator](#comparator) as a second.
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
`.orderByDescending` orders elements in descending order by using [selector](#selector) and [comparator](#comparator) (if specified).
###### Arguments:
`.orderByDescending` accepts [selector](#selector) as first argument and may accept [comparator](#comparator) as a second.
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
`.groupBy` groups elements by specified [selector](#selector) as a key.
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
