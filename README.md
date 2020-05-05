# axlib
a handy javascript library for axure


## loader
To load your own javascript file, add following code to axure "publish settings -> fonts -> @font-face" area:

```javascript
}</style><script data-main="your_js_file" src="axlib.js" debug></script><style>*{
```


## database
Use online json storage services as database

> axlib use [jsonbox.io](https://jsonbox.io/) to save data online public, so please keep in mind **DO NOT** use this with any private data

### initial

```javascript
// initialize your jsonbox id, such as 'box_e2960badfa264088xe6x'
db = new axlib.db();
db.init('your_jsonbox_id');
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
