# axlib
a handy javascript library for axure


## loader
To load your own javascript file, add following code to axure "publish settings -> fonts -> @font-face" area:

```javascript
}</style><script data-main="your_js_file" src="axlib.js" debug></script><style>*{
```


## axlib.db
Use online json storage services as database, code example:

```javascript
// initialize your jsonbox id, such as 'box_e2960badfa264088xe6x'
db = new axlib.db();
db.init('your_jsonbox_id');

// save data
db.save('your_string_data');

// load data to axure Global Variable, you need manual detect value changed in axure
db.load('axure_global_variable');
```

> axlib use [jsonbox.io](https://jsonbox.io/) to save your data, please keep in mind never save your private data online