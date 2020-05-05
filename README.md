# AXLIB
a handy javascript library for axure


## Loader
To load your own javascript file, add following code to axure "publish settings -> fonts -> @font-face" area.

```html
}</style><script data-main="your_js_file" src="axlib.js" debug></script><style>*{
```


## Database
Use online json storage services as database.

> axlib use [jsonbox.io](https://jsonbox.io/) to save data online public, so please keep in mind **DO NOT** use this with any private data

### initial

```javascript
// initialize your jsonbox id, such as 'box_e8540badfa264088xe6x'
// one record will be inserted when inited
db = new axlib.db('your_jsonbox_id');
```

### save
```javascript
db.save('your_string_data');
```

### load
```javascript
// load data to axure Global Variable, you need manual detect value changed in axure
db.load('axure_global_variable');
```


## Random
Generate random content.

### Integer
generate a integer number between 50 ~ 100.

```javascript
axlib.random('int', 50, 100);
```
> return 68

### Float
generate a float number between 50 ~ 100.

```javascript
axlib.random('flost', 50, 100);
```
> return 88.62699868550988

### Sign
generate 1 or -1 randomly.

```javascript
axlib.random('sign');
```
> return -1

### Lorem
generate chinese lorem text with or without punctuations.

```javascript
axlib.random('lorem', 10, true);
```
> return '极早一作画现顾身点钱！'

### Name
generate chinese personal name.

```javascript
axlib.random('name');
```
> return '常国栋'