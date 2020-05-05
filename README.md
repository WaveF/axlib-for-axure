# AXLIB
a handy javascript library for axure


## Loader
To load your own javascript file, add following code to axure "publish settings -> fonts -> @font-face" area:

```html
}</style><script data-main="your_js_file" src="axlib.js" debug></script><style>*{
```


## Database
Use online json storage services as database

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
