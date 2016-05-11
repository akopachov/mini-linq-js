# mini-linq-js

Usage:
```javascript
var arr = [1, 4, 8, 2, 3, 8, 9, 4, 6];
arr.where(w => w > 2).orderBy(o => o); // <-- using modern arrow functions
arr.where('w => w > 2').orderBy('o => o'); // <-- passing arrow functions as strings, to support obsolete browsers.
```

Available functions:
* any
* all
* where
* select
* count
* orderBy
* orderByDescending
* groupBy
* distinct
* firstOrDefault
* lastOrDefault
* joinWith
* contains

Description will be updated more
