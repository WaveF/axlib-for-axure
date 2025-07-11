/**
 * 
 * AxLib
 * 
 * Author: WaveF
 * QQ: 298010937
 * 
 **/

(function(){

  main();

  function main() {
    if (!window.$axure || !window.jQuery) {
      console.error('请先加载 $axure 和 jquery!');
      return;
    }

    if (window.AXLIB && window.axlib) return;

    initYepNope();
    utils();
    InitAxlib();

    window.jsonbin = getJsonBinClass();
    window.getEl = getEl;
    window.AXLIB = window.axlib = {
      name: 'axlib',
      version: '3.4.12',

      use, // 加载其他模块
      layout, // 预设的界面元素显隐及缩放
      trace, // 显示一段预设样式的文本
      jsonbin: getJsonBinClass(), // 调用jsonbin v3的方法在线读写数据
      hosting, // 参数定义同步到哪里，默认是axhub
      loading, // 插入一个加载动画
      find, // 便捷提取指定元件名的对象，示例：let els = axlib.find('sym1', 'sym2'...); let { sym1, sym2 } = els;
      saveTextFile, // 传入字符串与文件名保存文件
      testExp, // 等待测试表达式的方法
      loadJsModule, // 以 es module 方式加载 js
      insertJsModule, // 字符串形式 以 es module 方式插入 js
      insertJS, // 字符串形式 插入JS到body
      insertCSS, // 字符串形式 插入CSS到head
      insertHTML, // 字符串形式 插入HTML到指定节点
      getEl, // 通过元件名获取元素
      loadOnce, // 对指定资源只加载一次，并通过lock参数阻止其他脚本重复加载资源，然后通过check参数让其他脚本在资源准备好时访问
      traverse, // 遍历模糊匹配名称的所有元素
      
      plugins: getLibraries(), // 兼容旧版
      libs: getLibraries(), // 新版改名
      formatRepeaterData: $axure.ex.formatRepeaterData,
      setGlobalVar: $axure.setGlobalVariable,
      getGlobalVar: $axure.getGlobalVariable,
      getOverlapData: $axure.getOverlapData,
      getDiffData: $axure.getDiffData,
    };

    Object.defineProperty(window, "__axComps__", {
      value: {},
      writable: true,
      enumerable: false,
      configurable: true
    });
  }

  function InitAxlib() {
    $axure.ex = { fn: {} };

    // _showMsg = new Function( 'return ' + top.$axure.messageCenter.dispatchMessageRecursively.toString() );

    $axure.getEl = (...args) => {
      let arr = [];
      args.forEach(name => {
        arr.push($axure(`@${name}`));
      });
      const result = arr.length === 1 ? arr[0] : arr;
      return result;
    };

    // 改写并拓展Axure的私有对象
    $axure.internal(function ($ax) {

      /**
       * 增强中继器相关方法
       * 注：仅支持单个操作，要确保每个元素都有不同ID，就可以用循环逐个修改
       */

      // 刷新数据（要定义在最前面，因为后面会引用到）
      $axure.ex.refreshRepeater = $ax.repeater.refreshRepeater;
      $ax.public.fn.refreshRepeater = function () {
        let elementId = this.getElementIds()[0];
        $axure.ex.refreshRepeater(elementId);
        return this;
      };
      $ax.repeater.refreshRepeater = function(elementId, etc) {
        $axure.ex.refreshRepeater(...arguments);
        $(`#${elementId}`).trigger('REPEATER_REFRESH');
      };

      // 好像是获取行号，从1开始索引，因为后面要用到所以保留
      $axure.ex.getRepeaterRows = $ax.repeater.getAllItemIds;
      $ax.public.fn.getRepeaterRows = function () {
        return $axure.ex.getRepeaterRows(this.getElementIds()[0]);
      };

      // 通过ID获取实例
      $axure.ex.getRepeater = function (elementId) {
        let repeater;
        $axure(function (obj) {
          return obj.type == 'repeater';
        }).each(function (obj, id) {
          if (id == elementId) {
            repeater = obj;
          }
        });
        return repeater;
      };

      // 格式化数据
      $axure.ex.formatRepeaterData = function(data, options) {
        // 根据 options 参数对数据进行格式化
        options = options || { format:'auto', key:undefined, trim:undefined };

        let trim = options.trim;
        let format = options['format'].toLowerCase();
        let newData;

        // 自动模式，以"键:值"配对形式返回数据
        if (format === 'default') {
          newData = data;
        } else if (format === 'auto') {
          let arr = [];
          for (let i = 0; i < data.length; i++) {
            let item = data[i];
            let obj = {};
            for (let k in item) {
              obj[k] = item[k].text;
            }
            arr.push(obj);
          }
          newData = arr;
        }
        
        // 行模式，横向获取数据，支持trim获取第1位数据
        else if (format === 'row') {
          let result = {};
          for (let i = 0; i < data.length; i++) {
            let item = data[i];
            let obj = {};
            let key = Object.values(item)[0].text;
            let val = [];
            for (let k in item) {
              let sub = item[k];
              if (sub.text != key) {
                val.push(sub.text);
              }
            }

            if (trim === undefined) { trim = false; }
            if (trim) { val = val[0]; }
            obj[key] = val;
            $.extend(result, obj);
          }
          newData = result;
        }
        
        // 列模式，纵向获取数据
        else if (format === 'column' || format === 'col') {
          let obj = {};
          for (let i = 0; i < data.length; i++) {
            let item = data[i];
            for (let k in item) {
              if (!obj[k]) {
                obj[k] = [item[k].text];
              } else {
                obj[k].push(item[k].text);
              }
            }
          }
          newData = obj;
        }
        
        // 键模式，以某个键值来获取数据
        else if (format === 'key') {
          if (!options.key) {
            console.log('未提供Key名，将不会进行格式化...');
            newData = data;
          } else {
            let result = {};
            let pKey = options.key;
            for (let i = 0; i < data.length; i++) {
              let item = data[i];
              let key = item[pKey].text;
              let val = [];
              let obj = {};
              for (let k in item) {
                if (k != pKey) {
                  val.push(item[k].text);
                }
              }
              if (options.first) { val = val[0]; }
              obj[key] = val;
              $.extend(result, obj);
            }
            newData = result;
          }
        }

        // 树模式，适合用来做树形菜单，支持trim清理空数据
        else if (format === 'tree') {
          let arr = [];
          for (let i = 0; i < data.length; i++) {
            let item = data[i];
            let obj = {};
            for (let k in item) { obj[k] = item[k].text; }
            arr.push(obj);
          }
          newData = tree(arr);
          if (trim === undefined) { trim = true; }
          options.trim && trimTreeData(newData);
        } else {
          trace(`未注册的格式化参数: ${format}，请使用此定义 { format: 'auto' || 'row' || 'column' || 'tree' || 'key' } ，其中 key 模式需额外提供索引键列名称.`);
          newData = data;
        }
        return newData;
      }
      $axure.formatRepeaterData = $axure.ex.formatRepeaterData;

      // 获取数据
      $axure.ex.getRepeaterData = function (elementId) {
        let ids = $ax.repeater.getAllItemIds(elementId);
        let columns = $axure.ex.getRepeater(elementId).dataProps;
        let rows = [];
        for (let i = 0, il = ids.length; i < il; i++) {
          let row = {};
          for (let j = 0, jl = columns.length; j < jl; j++) {
            let name = columns[j].toLowerCase();
            let id = ids[i];
            if ((typeof (id) == 'string') && (id.indexOf('-') != -1))
              id = $ax.repeater.getItemIdFromElementId(id);
            let value = $ax.repeater.getData({}, elementId, ids[i], name, 'data');
            if (typeof (value) == 'object') {
              value = $ax.deepCopy(value);
              if (value.type === undefined) {
                value.type = 'text';
              }
              row[name] = value;
            } else {
              row[name] = {
                type: 'text',
                text: value
              };
            }
          }
          rows.push(row);
        }
        return rows;
      };
      $ax.public.fn.getRepeaterData = function (options) {
        let elementId = this.getElementIds()[0];
        let data = $axure.ex.getRepeaterData(elementId);
        data = $axure.ex.formatRepeaterData(data, options);
        return data;
      };

      // 获取初始化数据
      $axure.ex.getRepeaterDataOnce = function (elementId) {
        try {
          var result;
          // $axure(`#${id}`).refreshRepeater();
          return window.$axure((function (elementId) {
              return "repeater" === elementId.type
          })).each((function (obj, id) {
            elementId === id && (result = obj)
          })), result.data;
        } catch (err) {
            return console.error("Error：Can not get repeater data by id " + err);
        }
      };
      $ax.public.fn.getRepeaterDataOnce = function (options) {
        let elementId = this.getElementIds()[0];
        let data = $axure.ex.getRepeaterDataOnce(elementId);
        data = $axure.ex.formatRepeaterData(data, options);
        return data;
      };
      $axure.ex.getRepeaterInitedData = $axure.ex.getRepeaterDataOnce;
      $ax.public.fn.getRepeaterInitedData = $ax.public.fn.getRepeaterDataOnce;

      // 获取初始化与交互追加后的差异数据
      $axure.ex.getRepeaterDataDiff = function (elementId) {
        let data = $axure.ex.getRepeaterData(elementId);
        let dataOnce = $axure.ex.getRepeaterDataOnce(elementId);
        data.splice(0, dataOnce.length);
        return data;
      };
      $ax.public.fn.getRepeaterDataDiff = function (options) {
        let elementId = this.getElementIds()[0];
        let diff = $axure.ex.getRepeaterDataDiff(elementId);
        return $axure.ex.formatRepeaterData(diff, options);
      };

      // 获取初始化与交互追加后的差异数据
      $axure.ex.getRepeaterDataSame = function (elementId) {
        let data = $axure.ex.getRepeaterData(elementId);
        let dataOnce = $axure.ex.getRepeaterDataOnce(elementId);
        data.splice(dataOnce.length, data.length);
        return data;
      };
      $ax.public.fn.getRepeaterDataSame = function (options) {
        let elementId = this.getElementIds()[0];
        let diff = $axure.ex.getRepeaterDataSame(elementId);
        return $axure.ex.formatRepeaterData(diff, options);
      };

      // 追加数据
      $axure.ex.repeaterAddItem = $ax.repeater.addItem;
      $axure.ex.addRepeaterData = function (elementId, rows) {
        let event = { targetElement: undefined, srcElement: undefined };
        let repeater = $axure.ex.getRepeater(elementId);
        let columns = repeater.dataProps;
        let itemDefaultValue = { type: 'text', text: '' };

        for (let i = 0, ilen = rows.length; i < ilen; i++) {
          let source = rows[i];
          let target = {};
          for (let j = 0, jlen = columns.length; j < jlen; j++) {
            let column = columns[j];
            let item = source[column];

            if (item === undefined) {
              item = itemDefaultValue;
            } else if (!item.hasOwnProperty('type') && !item.hasOwnProperty('text')) {
              item = { type: 'text', text: item };
            } else {
              item = $ax.deepCopy(item);
            }
            target[column] = item;
          }
          $ax.repeater.addItem(elementId, target, event);
        }
      };
      $ax.public.fn.addRepeaterData = function (rows) {
        let elementId = this.getElementIds()[0];
        $axure.ex.addRepeaterData(elementId, rows);
        $axure.ex.refreshRepeater(elementId);
        return this;
      };
      // 这里会触发原生交互的添加数据
      $ax.repeater.addItem = function() {
        let elementId = arguments[0];
        $axure.ex.repeaterAddItem(...arguments);
        $(`#${elementId}`).trigger('REPEATER_DATA_ADDED', {...arguments});
      };


      // 移除N行数据
      $axure.ex.deleteItems = $ax.repeater.deleteItems;
      $ax.public.fn.deleteRepeaterData = function (rowsCount) {
        rowsCount = rowsCount || 1;
        let data = this.getRepeaterData();
        let newData = data.slice(0, data.length - rowsCount);
        let elementId = this.getElementIds()[0];
        $axure.ex.clearRepeaterData(elementId);
        $axure.ex.addRepeaterData(elementId, newData);
        $axure.ex.refreshRepeater(elementId);
        return this;
      };
      // 这里会触发原生交互的删除数据
      $ax.repeater.deleteItems = function() {
        let elementId = arguments[0];
        $axure.ex.deleteItems(...arguments);
        $(`#${elementId}`).trigger('REPEATER_DATA_DELETED', {...arguments});
      }


      // PUSH数据（意义不明）
      $axure.ex.pushItems = $ax.repeater.pushItems;
      $ax.repeater.pushItems = function() {
        let elementId = arguments[0];
        $axure.ex.pushItems(...arguments);
        $(`#${elementId}`).trigger('REPEATER_DATA_PUSH', {...arguments});
      }
      
      
      // 更新数据
      $axure.ex.updateEditItems = $ax.repeater.updateEditItems;
      $ax.repeater.updateEditItems = function() {
        let elementId = arguments[0];
        $axure.ex.updateEditItems(...arguments);
        $(`#${elementId}`).trigger('REPEATER_DATA_UPDATED', {...arguments});
      }


      // 获取重叠部分数据
      $ax.public.fn.getOverlapData = function (extraRawData, format) {
        let elementId = this.getElementIds()[0];
        let rep = $axure(`#${elementId}`);
        let latestRawData = rep.getRepeaterData({format:'default'});
        let overlapData = getOverlapData(extraRawData, latestRawData);
        return $axure.ex.formatRepeaterData(overlapData, format);;
      };

      

      // 设置数据
      $ax.public.fn.setRepeaterData = function (rows) {
        let elementId = this.getElementIds()[0];
        $axure.ex.clearRepeaterData(elementId);
        $axure.ex.addRepeaterData(elementId, rows);
        $axure.ex.refreshRepeater(elementId);
        $(`#${elementId}`).trigger('REPEATER_DATA_SET', {...arguments});
        return this;
      };
      
      // 清空数据
      $axure.ex.clearRepeaterData = function (elementId) {
        let ids = $axure.ex.getRepeaterRows(elementId);
        $ax.repeater.addEditItems(elementId, ids);
        $ax.repeater.deleteItems(elementId, {}, 'marked', undefined);
      };
      $ax.public.fn.clearRepeaterData = function () {
        let elementId = this.getElementIds()[0];
        $axure.ex.clearRepeaterData(elementId);
        $axure.ex.refreshRepeater(elementId);
        return this;
      };


      /**
       * 增强动态面板相关方法
       * 注：仅支持单个操作，要确保每个元素都有不同ID，就可以用循环逐个修改
       */

      // 增强动态面板相关方法
      $axure.ex.getPanelStates = function (elementId) {
        let result = [];
        for (let index = 1;; index++) {
          let element = $('#' + elementId + '_state' + (index - 1));
          if (!element.length) break;
          let name = element.attr('data-label');
          result[index] = name;
          result[name] = index;
        }
        return result;
      };
      $ax.public.fn.getPanelStates = function () {
        let states = $axure.ex.getPanelStates(this.getElementIds()[0]);
        return states;
      };


      $axure.ex.getCurrentPanelState = function (elementId) {
        let current;
        let states = $(`#${elementId}`).children(`.panel_state`);
        $.each(states, (idx, item) => {
          if ($(item).css('visibility')!='hidden' && $(item).css('display')!='none') {
            current = item;
          }
        });
        return current;
      };
      $ax.public.fn.getCurrentPanelState = function () {
        let current = $axure.ex.getCurrentPanelState(this.getElementIds()[0]);
        return current;
      };


      $axure.ex.setPanelStateByName = function (elementId, stateName, options, showWhenSet) {
        let states = $axure.ex.getPanelStates(elementId);
        for (let k = 0; k < states.length; k++) {
          if (states[k] == stateName) {
            let stateNum = k;
            $axure('#' + elementId).SetPanelState(stateNum, options || {}, showWhenSet || false);
          }
        }
      };
      $ax.public.fn.setPanelStateByName = function (stateName, options, showWhenSet) {
        let elementId = this.getElementIds()[0];
        $axure.ex.setPanelStateByName(elementId, stateName, options, showWhenSet);
        return this;
      };
      $ax.public.fn.setPanelStateByIndex = function (index, options, showWhenSet) {
        let elementId = this.getElementIds()[0];
        $axure('#' + elementId).SetPanelState(index, options || {}, showWhenSet || false);
        return this;
      };


      /**
       * 简化获取ID与节点的方法名
       */
      $ax.public.fn.getId = function () {
        return this.getElementIds()[0];
      };
      $ax.public.fn.getEl = function () {
        return this.getElements()[0];
      };
      $axure.find = find;


      /**
       * 修正axure无法获取全局变量的bug
       */
      $ax.public.getGlobalVariable = $ax.getGlobalVariable = function (name) {
        return $ax.globalVariableProvider.getVariableValue(name);
      };


      /**
       * 添加一些常用样式控制
       */
      $ax.public.fn.buttonMode = function (flag) {
        this.$().css('cursor', flag ? 'pointer' : 'default');
      };
      $ax.public.fn.ghostMode = function (flag) {
        this.$().css('pointer-events', flag ? 'none' : 'auto');
      };

      
      /**
       * 跳转页面或链接
       */
      
      // 设置页面跳转前的Hook
      // 注：页面载入时没有hook，如果要做载入前的转场动画需要自行处理，因为axlib开始执行的时间始终慢于页面渲染时
      $axure.ex.redirect = true;
      $axure.ex.beforeNavFn = function () {};
      $axure.beforeNav = function (callback) {
        $axure.ex.beforeNavFn = callback;
      };

      // 先缓存原本的跳转方法
      $axure.ex.navigate = $ax.public.navigate;

      // 改写内置的跳转函数
      $ax.public.navigate = $ax.navigate = function(options) {
        let stop = flag => { if (flag===undefined) { flag = true; } $axure.ex.redirect = !flag; };
        $axure.ex.beforeNavFn(options,stop);
        
        if (!$axure.ex.redirect) return;
        $axure.ex.navigate(options);
      };

      $axure.getOverlapData = getOverlapData;
      $axure.getDiffData = getDiffData;

    });
  }

  function traverse({ name = '', init, process = () => {}, strict = true } = {}) {
    if (!name || window.__axComps__[name]) return;
    window.__axComps__[name] = true;
    const operator = strict ? '=' : '*=';
    init && init();
    $(`[data-label${operator}"${name}"]`).each((i, n) => process(n, i));
  }

  function getNestedValue(obj, key) {
    return key.split(".").reduce(function(result, key) {
      return result[key] 
    }, obj);
  }

  function getOverlapData(data1, data2) {
    /*let arr = [JSON.stringify(data1), JSON.stringify(data2)];
    arr.sort((a, b) => { return a.length < b.length; });
    let str1 = arr[0], str2 = arr[1];
    str1 = str1.substr(1,str1.length-2);
    str2 = str2.substr(1,str2.length-2);
    let str = str1.replace(str2, '');
    str = str.replace(/\},,\{/g, '},{');
    str = `[${str}]`;
    return JSON.parse(str);*/

    let bigData = data1.length > data2.length ? data1 : data2;
    let smallData = data1.length < data2.length ? data1 : data2;
    smallData.forEach((a, i) => {
      let _a = JSON.stringify(a);
      bigData.forEach((b, j) => {
        let _b = JSON.stringify(b);
        if (_a == _b) { bigData[j] = null; }
      });
      bigData = bigData.filter(Boolean);
    });
    return bigData;
  }

  function getDiffData(data1, data2) {
    // 弃用，会误删相同的数据
    let diff = data1.concat(data2).map(item => JSON.stringify(item)).filter((value, idx, arr)=>{
      return arr.indexOf(value) == arr.lastIndexOf(value);
    });
    return JSON.parse(`[${diff}]`);
  }

  function tree(_data) {
    let scanArr = [];
    let scanObj = [];
    let maxLevel = _data.length > 0 ? Object.keys(_data[0]).length : 0;

    const unique = function(arr, obj) {
      let _arr = [], _obj = [];
      for(let i=0; i<arr.length; i++) {
        if ( !_arr.includes( arr[i]) ) {
          _arr.push( arr[i] );
          _obj.push( obj[i] );
        }
      }
      return [_arr, _obj];
    };

    for (let i=0; i<maxLevel; i++) {
      let cid = `c${i+1}`;
      let arr = [], obj = [];
      for (let k in _data) {
        let item = _data[k];
        arr.push(item[cid]);
        obj.push({value:item[cid], label:item[cid], parent:item[`c${i}`], children:[]});
      }
      scanArr[i] = unique(arr, obj)[0];
      scanObj[i] = unique(arr, obj)[1];
    }

    let len = scanObj.length;
    for (let i=0; i<len; i++) {
      let curIdx = len-i-1;
      let nextIdx = len-i-2;
      let curItem = scanObj[curIdx];
      let nextItem = scanObj[nextIdx];

      for (let k in curItem) {
        let _current = curItem[k];
        for (let n in nextItem) {
          let _next = nextItem[n];
          if (_current.parent == _next.value) {
            _next.children.push(_current);
          }
        }
      }
    }

    for (let t=0; t<scanObj[0].length; t++) {
      delete scanObj[0][t].parent;
    }
    
    return scanObj[0];
  }

  function trimTreeData(arr) {
    for (let i=0; i<arr.length; i++) {
      let item = arr[i];
      if (item.children.length > 0) {
        if (item.children.length == 1 && !item.children[0].value) {
          delete item.children;
        } else {
          trimTreeData(item.children);
        }
      } else if (item.children && item.children.length == 0) {
        delete item.children;
      }
    }
  }

  function loadJsModule(url, callback) {
    const script = document.createElement('script');
    script.onload = callback || function(){};
    script.type = 'module';
    script.src = url;
    document.body.appendChild(script);
  }

  function insertJsModule(code) {
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = code;
    document.body.appendChild(script);
  }

  function insertJS(code, type='text/javascript') {
    const s = document.createElement('script');
    s.type = type;
    s.textContent = code;
    document.body.appendChild(s);
  }

  function insertCSS(rule){
    const s = document.createElement('style');
    s.rel = 'stylesheet';
    s.innerHTML = rule;
    document.head.appendChild(s);
  }

  function insertHTML(node, position='beforeend', code) {
    node.insertAdjacentHTML(position, code);
  }

  function sortVersions(versions) {
    return versions.sort((a, b) => {
      const partsA = a.split('.').map(Number);
      const partsB = b.split('.').map(Number);
      
      for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const numA = partsA[i] || 0; // 补 0 处理
        const numB = partsB[i] || 0;
  
        if (numA > numB) return 1;
        if (numA < numB) return -1;
      }
  
      return 0; // 版本号相同
    });
  }

  function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
  
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const num1 = parts1[i] || 0; // 补 0 处理
      const num2 = parts2[i] || 0;
  
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
  
    return 0; // 版本号相同
  }

  function loadOnce(options) {
    if (compareVersions(window.AXLIB.version, '3.4.9') > 0) {
      return loadOnce2(options);
    } else {
      return loadOnce1(options);
    }
  }

  function loadOnce2(options) {
    const { lock, interval=200, complete, ...others } = options;
    const lockKey = `__${lock}_Lock__`;
    const checkKey = `__${lock}_Ready__`;
  
    if (!window[lockKey]) {
      window[lockKey] = true;
      yepnope({
        ...others,
        complete: () => {
          window[checkKey] = true;
          complete({lockKey, checkKey, skip:false});
        }
      });
    } else {
      const checkDependency = setInterval(() => {
        if (window[checkKey]) {
          complete({lockKey, checkKey, skip:true});
          clearInterval(checkDependency);
        }
      }, interval);
    }
  }

  function loadOnce1(options) {
    const { lock, urls, callback } = options;
    const lockKey = `__${lock}_Lock__`;
    const checkKey = `__${lock}_Ready__`;
  
    if (!window[lockKey]) {
      window[lockKey] = true;
      yepnope({
        load: urls,
        complete: () => {
          window[checkKey] = true;
          callback();
        }
      });
    } else {
      const checkDependency = setInterval(() => {
        if (window[checkKey]) {
          callback();
          clearInterval(checkDependency);
        }
      }, 200);
    }
  }

  function testExp() {
    console.error('axlib.testExp() 已弃用');
  }

  function saveTextFile(str, fileName) {
    str = str || 'axlib';
    fileName = fileName || 'text.txt';
    const blob = new Blob([str], { type: 'application/json;charset=utf-8' });
    const objectURL = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = objectURL;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(objectURL);
  }

  function find () {
    let args = [...arguments];
    let obj = {};
    for (let i = 0; i < args.length; i++) {
      let name = args[i];
      let el = $axure('@' + name);
      if (el.$().length > 0) {
        obj[name] = el;
      }
    }
    return obj;
  }

  function loading(container, show, options) {
    options = options || { color:'#fff', opacity:0.2, scale:1.2, delay:0, dur:1, blending:'difference' };
    if (show === undefined) { show = true; }
    let display = show ? 'block' : 'none';

    let svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38" stroke="${options.color}" style="transform:scale(${options.scale});">
        <g fill="none" fill-rule="evenodd">
          <g transform="translate(1 1)" stroke-width="2">
            <circle stroke-opacity="${options.opacity}" cx="18" cy="18" r="18"/>
            <path d="M36 18c0-9.94-8.06-18-18-18">
              <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="${options.dur}s" repeatCount="indefinite"/>
            </path>
          </g>
        </g>
      </svg>
    `;
    svg = svg.minify();

    if (!window.$axure.loadingCSSRulesInited) {
      $('head').append(`
        <style>
          html, body { height: 100%; }
          .ax-loading { display:${display}; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: transparent; z-index: 99999; mix-blend-mode:${options.blending}; pointer-events:none; transform: scale(.5); }
          .ax-loading-svg { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        </style>
      `);
      window.$axure.loadingCSSRulesInited = true;
    }

    if ($(container).children('.ax-loading').length === 0) {
      $(container).append(`<div class="ax-loading"><div class="ax-loading-svg">${svg}</div></div>`);
    }
    return $(container).children('.ax-loading').get(0);
  }

  function hosting(cloud) {
    cloud = cloud || 'axhub';
    if (cloud == 'axhub') {
      let btnUpload = $('#axhub-rp9-root a i', top.document);
      if (btnUpload.length === 0) {
        trace('无法同步, 你需要先为浏览器安装axhub插件!');
      } else {
        btnUpload.click();
      }
    }
  }

  function trace() {
    console.group('%cAXLIB', 'color:#fff; font-weight:bold; background:#08f; padding:4px 8px; border-radius:3px;');
    console.log(...arguments);
    console.groupEnd();
  }

  function layout(mode) {
    if (self == top) return;
    mode = mode !== undefined ? mode : 0;

    let _mode = {
      hotspots: false,
      notes: false,
      scale: [0, 1, 2][1],
      console: false,
      sitemap: false,
      minimal: false,
      website: true
    };

    setTimeout(() => {
      let shell = window.parent.document;
      let hash = shell.location.hash;

      if (mode > 0) {
        if (hash.indexOf('&fn=0') < 0) {
          $(shell).find('#showNotesOption').click();
        }
        if (hash.indexOf('&hi=1') > -1) {
          $(shell).find('#showHotspotsOption').click();
        }
      }

      if (mode === 0) {
        $(shell).find('#maximizePanelContainer').show();
        $(shell).find(`.vpScaleOption[val="0"]`).click();
      } else if (mode === 1) {
        $(shell).find(`.vpScaleOption[val="0"]`).click();
        $(shell).find('#interfaceControlFrameMinimizeContainer').click();
        $(shell).find('#maximizePanelContainer').hide();
      } else if (mode === 2) {
        $(shell).find(`.vpScaleOption[val="1"]`).click();
        $(shell).find('#interfaceControlFrameMinimizeContainer').click();
        $(shell).find('#maximizePanelContainer').hide();
      } else if (mode === 3) {
        $(shell).find(`.vpScaleOption[val="2"]`).click();
        $(shell).find('#interfaceControlFrameMinimizeContainer').click();
        $(shell).find('#maximizePanelContainer').hide();
      }
    }, 0);
  }

  function use() {
    console.error('axlib.use() 已弃用');
  }

  function getJsonBinClass() {
    class jsonbin {
      _id = '';
      _apiKey = '';
      _accessKey = '';

      constructor(id) {
          this._id = id;
      }

      get id() {
          return this._id;
      }

      set id(id) {
          this._id = id;
      }

      get apiKey() {
          return this._apiKey;
      }

      set apiKey(key) {
          this._apiKey = key;
      }

      get accessKey() {
          return this._accessKey;
      }

      set accessKey(key) {
          this._accessKey = key;
      }

      read() {
          const binId = this._id;
          const binVersion = 'latest';

          return fetch(`https://api.jsonbin.io/v3/b/${binId}/${binVersion}`, {
              headers: {
                  'Content-Type': 'application/json',
                  'X-Access-Key': this._accessKey,
              }
          })
          .then(response => response.json())
          .catch(error => { console.error(error); });
      }

      update(data) {
          const binId = this._id;

          return fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  // 'X-Access-Key': this._accessKey,
              },
              body: JSON.stringify(data)
          })
          .then(response => response.json())
          .catch(error => { console.error(error); });
      }

      create(_name, _private=false) {
          // if (this._id) {
          //     return new Promise((resolve, reject) => {
          //         resolve({id:this._id});
          //     });
          // }

          const headers = {
              'Content-Type': 'application/json',
              'X-Bin-Private': _private,
          };

          if (this._apiKey != '') {
              headers['X-Master-Key'] = this._apiKey;
          }  

          if (this._accessKey != '' && this._apiKey == '') {
              headers['X-Access-Key'] = this._accessKey;
          }        

          if (_name) {
              headers['X-Bin-Name'] = _name;
          }

          return fetch(`https://api.jsonbin.io/v3/b`, {
              method: 'POST',
              headers,
              body: JSON.stringify({foo:'bar'})
          })
          .then(response => response.json())
          .catch(error => { console.error(error); });
      }

      delete(binId=this._id) {
          const headers = {};

          if (this._apiKey != '') {
              headers['X-Master-Key'] = this._apiKey;
          }  

          if (this._accessKey != '' && this._apiKey == '') {
              headers['X-Access-Key'] = this._accessKey;
          }

          return fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
              method: 'DELETE',
              headers,
          })
          .then(response => response.json())
          .catch(error => { console.error(error); });
      }
    }

    return jsonbin
  }

  function utils() {
    // 增加一个将字符串去除换行符的方法
    Object.defineProperty(String.prototype, 'minify', {
      enumerable: false,
      configurable: true,
      value: function () {
        return this.replace(/ *[\r|\n] */gm, '')
      }
    });


    /**
     * 拓展 JQuery
     */

    // 增加一个判断变量是否符合 JSON 格式的方法
    $.isJSON = function (str) {
      try {
        if (typeof JSON.parse(str) == "object") {
          return true;
        }
      } catch (e) {}
      return false;
    };

    // 增加一个判断 DOM 元素是否存在 Attribute 属性的方法
    $.fn.extend({
      'hasAttr': name => {
        let _attr = $(this).attr(name);
        if (typeof _attr !== typeof undefined && _attr !== false) {
          return true;
        } else {
          return false;
        }
      }
    });

    $.getEl = getJqEl;
  }

  function getJqEl(...args) {
    let arr = [];
    args.forEach(name => {
      arr.push($(`[data-label="${name}"]`));
    });
    const result = arr.length === 1 ? arr[0] : arr;
    return result;
  }

  function getEl(...args) {
    let arr = [];
    args.forEach(name => {
      arr.push(document.querySelector(`[data-label="${name}"]`));
    });
    const result = arr.length === 1 ? arr[0] : arr;
    return result;
  }

  function getLibraries() {
    return {
      elementUI: {
        vars: 'Vue',
        files: [
          'https://ax.minicg.com/element/vue.min.js',
          'https://ax.minicg.com/element/index.js',
          'https://ax.minicg.com/element/index.css',
        ]
      },
      petiteVue: {
        vars: 'PetiteVue',
        files: [
          'https://ax.minicg.com/petite-vue.iife.min.js',
          'https://ax.minicg.com/petite-vue.es.js',
          'https://ax.minicg.com/petite-vue.umd.min.js',
        ]
      },
      toast: {
        vars: '$.toast',
        files: [
          'https://ax.minicg.com/plugins/toast/jquery.toast.min.css',
          'https://ax.minicg.com/plugins/toast/jquery.toast.min.js'
        ]
      },
      toastify: {
        vars: 'Toastify',
        files: [
          'https://ax.minicg.com/plugins/toastify/toastify-all.min.js'
        ]
      },
      swal2: {
        vars: 'Swal',
        files: [
          'https://ax.minicg.com/plugins/swal2/bootstrap-4.min.css',
          'https://ax.minicg.com/plugins/swal2/sweetalert2.min.js'
        ]
      },
      keepfit: {
        vars: 'keepfit',
        files: [
          'https://ax.minicg.com/plugins/keepfit/keepfit.min.js'
        ]
      },
      aframe: {
        vars: 'aframe',
        files: [
          'https://ax.minicg.com/aframe-130.min.js',
        ]
      },
      preload: {
        vars: 'preload',
        files: [
          'https://ax.minicg.com/preloadjs.min.js',
        ]
      },
      pico: {
        vars: 'pico',
        files: [
          'https://ax.minicg.com/pico.min.css',
        ]
      },
      crypto: {
        vars: 'crypto',
        files: [
          'https://ax.minicg.com/crypto-js.min.js',
        ]
      },
      faker: {
        vars: 'faker',
        files: [
          'https://ax.minicg.com/faker.min.js',
        ]
      },
      tailwindcss: {
        vars: 'tailwindcss',
        files: [
          'https://ax.minicg.com/tailwindcss-jit-cdn.ex.min.js',
          'https://ax.minicg.com/tailwindcss-jit-cdn.umd.min.js',
          'https://ax.minicg.com/tailwindcss.min.css',
        ]
      },
      echarts: {
        vars: 'echarts',
        files: [
          'https://ax.minicg.com/echarts.min.js',
          'https://ax.minicg.com/echarts-gl.min.js',
        ]
      },
      tweakpane: {
        vars: 'Tweakpane',
        files: [
          'https://ax.minicg.com/plugins/tweakpane/tweakpane.min.js',
          'https://ax.minicg.com/plugins/tweakpane/tweakpane-plugin-essentials.min.js',
          'https://ax.minicg.com/plugins/tweakpane/tweakpane-plugin-rotation.min.js',
          'https://ax.minicg.com/plugins/tweakpane/tweakpane-textarea-plugin.min.js',
          'https://ax.minicg.com/plugins/tweakpane/tweakpane-plugin-camerakit.min.js',
          'https://ax.minicg.com/plugins/tweakpane/tweakpane-plugin-image.min.js',
          'https://ax.minicg.com/plugins/tweakpane/tweakpane-plugin-infodump.min.js',
          'https://ax.minicg.com/plugins/tweakpane/tweakpane-plugin-profiler.min.js',
        ]
      },
    }
  }

  function initYepNope () {
    var doc = document,
      undef,
      docElement            = doc.documentElement,
      sTimeout              = window.setTimeout,
      firstScript           = doc.getElementsByTagName( "script" )[ 0 ],
      toString              = {}.toString,
      execStack             = [],
      started               = 0,
      noop                  = function () {},
      // Before you get mad about browser sniffs, please read:
      // https://github.com/Modernizr/Modernizr/wiki/Undetectables
      // If you have a better solution, we are actively looking to solve the problem
      isGecko               = ( "MozAppearance" in docElement.style ),
      isGeckoLTE18          = isGecko && !! doc.createRange().compareNode,
      insBeforeObj          = isGeckoLTE18 ? docElement : firstScript.parentNode,
      // Thanks to @jdalton for showing us this opera detection (by way of @kangax) (and probably @miketaylr too, or whatever...)
      isOpera               = window.opera && toString.call( window.opera ) == "[object Opera]",
      isIE                  = !! doc.attachEvent && !isOpera,
      strJsElem             = isGecko ? "object" : isIE  ? "script" : "img",
      strCssElem            = isIE ? "script" : strJsElem,
      isArray               = Array.isArray || function ( obj ) {
        return toString.call( obj ) == "[object Array]";
      },
      isObject              = function ( obj ) {
        return Object(obj) === obj;
      },
      isString              = function ( s ) {
        return typeof s == "string";
      },
      isFunction            = function ( fn ) {
        return toString.call( fn ) == "[object Function]";
      },
      globalFilters         = [],
      scriptCache           = {},
      prefixes              = {
        // key value pair timeout options
        timeout : function( resourceObj, prefix_parts ) {
          if ( prefix_parts.length ) {
            resourceObj['timeout'] = prefix_parts[ 0 ];
          }
          return resourceObj;
        }
      },
      handler,
      yepnope;

    /* Loader helper functions */
    function isFileReady ( readyState ) {
      // Check to see if any of the ways a file can be ready are available as properties on the file's element
      return ( ! readyState || readyState == "loaded" || readyState == "complete" || readyState == "uninitialized" );
    }


    // Takes a preloaded js obj (changes in different browsers) and injects it into the head
    // in the appropriate order
    function injectJs ( src, cb, attrs, timeout, /* internal use */ err, internal ) {
      var script = doc.createElement( "script" ),
          done, i;

      timeout = timeout || yepnope['errorTimeout'];

      script.src = src;

      // Add our extra attributes to the script element
      for ( i in attrs ) {
          script.setAttribute( i, attrs[ i ] );
      }

      cb = internal ? executeStack : ( cb || noop );

      // Bind to load events
      script.onreadystatechange = script.onload = function () {

        if ( ! done && isFileReady( script.readyState ) ) {

          // Set done to prevent this function from being called twice.
          done = 1;
          cb();

          // Handle memory leak in IE
          script.onload = script.onreadystatechange = null;
        }
      };

      // 404 Fallback
      sTimeout(function () {
        if ( ! done ) {
          done = 1;
          // Might as well pass in an error-state if we fire the 404 fallback
          cb(1);
        }
      }, timeout );

      // Inject script into to document
      // or immediately callback if we know there
      // was previously a timeout error
      err ? script.onload() : firstScript.parentNode.insertBefore( script, firstScript );
    }

    // Takes a preloaded css obj (changes in different browsers) and injects it into the head
    function injectCss ( href, cb, attrs, timeout, /* Internal use */ err, internal ) {

      // Create stylesheet link
      var link = doc.createElement( "link" ),
          done, i;

      timeout = timeout || yepnope['errorTimeout'];

      cb = internal ? executeStack : ( cb || noop );

      // Add attributes
      link.href = href;
      link.rel  = "stylesheet";
      link.type = "text/css";

      // Add our extra attributes to the link element
      for ( i in attrs ) {
        link.setAttribute( i, attrs[ i ] );
      }

      if ( ! err ) {
        firstScript.parentNode.insertBefore( link, firstScript );
        sTimeout(cb, 0);
      }
    }

    function executeStack ( ) {
      // shift an element off of the stack
      var i   = execStack.shift();
      started = 1;

      // if a is truthy and the first item in the stack has an src
      if ( i ) {
        // if it's a script, inject it into the head with no type attribute
        if ( i['t'] ) {
          // Inject after a timeout so FF has time to be a jerk about it and
          // not double load (ignore the cache)
          sTimeout( function () {
            (i['t'] == "c" ?  yepnope['injectCss'] : yepnope['injectJs'])( i['s'], 0, i['a'], i['x'], i['e'], 1 );
          }, 0 );
        }
        // Otherwise, just call the function and potentially run the stack
        else {
          i();
          executeStack();
        }
      }
      else {
        // just reset out of recursive mode
        started = 0;
      }
    }

    function preloadFile ( elem, url, type, splicePoint, dontExec, attrObj, timeout ) {

      timeout = timeout || yepnope['errorTimeout'];

      // Create appropriate element for browser and type
      var preloadElem = doc.createElement( elem ),
          done        = 0,
          firstFlag   = 0,
          stackObject = {
            "t": type,     // type
            "s": url,      // src
          //r: 0,        // ready
            "e": dontExec,// set to true if we don't want to reinject
            "a": attrObj,
            "x": timeout
          };

      // The first time (common-case)
      if ( scriptCache[ url ] === 1 ) {
        firstFlag = 1;
        scriptCache[ url ] = [];
      }

      function onload ( first ) {
        // If the script/css file is loaded
        if ( ! done && isFileReady( preloadElem.readyState ) ) {

          // Set done to prevent this function from being called twice.
          stackObject['r'] = done = 1;

          ! started && executeStack();

          // Handle memory leak in IE
          preloadElem.onload = preloadElem.onreadystatechange = null;
          if ( first ) {
            if ( elem != "img" ) {
              sTimeout(function(){ insBeforeObj.removeChild( preloadElem ) }, 50);
            }

            for ( var i in scriptCache[ url ] ) {
              if ( scriptCache[ url ].hasOwnProperty( i ) ) {
                scriptCache[ url ][ i ].onload();
              }
            }
          }
        }
      }


      // Setting url to data for objects or src for img/scripts
      if ( elem == "object" ) {
        preloadElem.data = url;
      } else {
        preloadElem.src = url;

        // Setting bogus script type to allow the script to be cached
        preloadElem.type = elem;
      }

      // Don't let it show up visually
      preloadElem.width = preloadElem.height = "0";

      // Attach handlers for all browsers
      preloadElem.onerror = preloadElem.onload = preloadElem.onreadystatechange = function(){
        onload.call(this, firstFlag);
      };
      // inject the element into the stack depending on if it's
      // in the middle of other scripts or not
      execStack.splice( splicePoint, 0, stackObject );

      // The only place these can't go is in the <head> element, since objects won't load in there
      // so we have two options - insert before the head element (which is hard to assume) - or
      // insertBefore technically takes null/undefined as a second param and it will insert the element into
      // the parent last. We try the head, and it automatically falls back to undefined.
      if ( elem != "img" ) {
        // If it's the first time, or we've already loaded it all the way through
        if ( firstFlag || scriptCache[ url ] === 2 ) {
          insBeforeObj.insertBefore( preloadElem, isGeckoLTE18 ? null : firstScript );

          // If something fails, and onerror doesn't fire,
          // continue after a timeout.
          sTimeout( onload, timeout );
        }
        else {
          // instead of injecting, just hold on to it
          scriptCache[ url ].push( preloadElem );
        }
      }
    }

    function load ( resource, type, dontExec, attrObj, timeout ) {
      // If this method gets hit multiple times, we should flag
      // that the execution of other threads should halt.
      started = 0;

      // We'll do 'j' for js and 'c' for css, yay for unreadable minification tactics
      type = type || "j";
      if ( isString( resource ) ) {
        // if the resource passed in here is a string, preload the file
        preloadFile( type == "c" ? strCssElem : strJsElem, resource, type, this['i']++, dontExec, attrObj, timeout );
      } else {
        // Otherwise it's a callback function and we can splice it into the stack to run
        execStack.splice( this['i']++, 0, resource );
        execStack.length == 1 && executeStack();
      }

      // OMG is this jQueries? For chaining...
      return this;
    }

    // return the yepnope object with a fresh loader attached
    function getYepnope () {
      var y = yepnope;
      y['loader'] = {
        "load": load,
        "i" : 0
      };
      return y;
    }

    /* End loader helper functions */
    // Yepnope Function
    yepnope = function ( needs ) {

      var i,
          need,
          // start the chain as a plain instance
          chain = window['yepnope']['loader'];

      function satisfyPrefixes ( url ) {
        // split all prefixes out
        var parts   = url.split( "!" ),
        gLen    = globalFilters.length,
        origUrl = parts.pop(),
        pLen    = parts.length,
        res     = {
          "url"      : origUrl,
          // keep this one static for callback variable consistency
          "origUrl"  : origUrl,
          "prefixes" : parts
        },
        mFunc,
        j,
        prefix_parts;

        // loop through prefixes
        // if there are none, this automatically gets skipped
        for ( j = 0; j < pLen; j++ ) {
          prefix_parts = parts[ j ].split( '=' );
          mFunc = prefixes[ prefix_parts.shift() ];
          if ( mFunc ) {
            res = mFunc( res, prefix_parts );
          }
        }

        // Go through our global filters
        for ( j = 0; j < gLen; j++ ) {
          res = globalFilters[ j ]( res );
        }

        // return the final url
        return res;
      }

      function getExtension ( url ) {
          return url.split(".").pop().split("?").shift();
      }

      function loadScriptOrStyle ( input, callback, chain, index, testResult ) {
        // run through our set of prefixes
        var resource     = satisfyPrefixes( input ),
            autoCallback = resource['autoCallback'],
            extension    = getExtension( resource['url'] );

        // if no object is returned or the url is empty/0 just exit the load
        if ( resource['bypass'] ) {
          return;
        }

        // Determine callback, if any
        if ( callback ) {
          callback = isFunction( callback ) ?
            callback :
            callback[ input ] ||
            callback[ index ] ||
            callback[ ( input.split( "/" ).pop().split( "?" )[ 0 ] ) ];
        }

        // if someone is overriding all normal functionality
        if ( resource['instead'] ) {
          return resource['instead']( input, callback, chain, index, testResult );
        }
        else {
          // Handle if we've already had this url and it's completed loaded already
          if ( scriptCache[ resource['url'] ] ) {
            // don't let this execute again
            resource['noexec'] = true;
          }
          else {
            scriptCache[ resource['url'] ] = 1;
          }

          // Throw this into the queue
          chain.load( resource['url'], ( ( resource['forceCSS'] || ( ! resource['forceJS'] && "css" == getExtension( resource['url'] ) ) ) ) ? "c" : undef, resource['noexec'], resource['attrs'], resource['timeout'] );

          // If we have a callback, we'll start the chain over
          if ( isFunction( callback ) || isFunction( autoCallback ) ) {
            // Call getJS with our current stack of things
            chain['load']( function () {
              // Hijack yepnope and restart index counter
              getYepnope();
              // Call our callbacks with this set of data
              callback && callback( resource['origUrl'], testResult, index );
              autoCallback && autoCallback( resource['origUrl'], testResult, index );

              // Override this to just a boolean positive
              scriptCache[ resource['url'] ] = 2;
            } );
          }
        }
      }

      function loadFromTestObject ( testObject, chain ) {
          var testResult = !! testObject['test'],
              group      = testResult ? testObject['yep'] : testObject['nope'],
              always     = testObject['load'] || testObject['both'],
              callback   = testObject['callback'] || noop,
              cbRef      = callback,
              complete   = testObject['complete'] || noop,
              needGroupSize,
              callbackKey;

          // Reusable function for dealing with the different input types
          // NOTE:: relies on closures to keep 'chain' up to date, a bit confusing, but
          // much smaller than the functional equivalent in this case.
          function handleGroup ( needGroup, moreToCome ) {
            if ( ! needGroup ) {
              // Call the complete callback when there's nothing to load.
              ! moreToCome && complete();
            }
            // If it's a string
            else if ( isString( needGroup ) ) {
              // if it's a string, it's the last
              if ( !moreToCome ) {
                // Add in the complete callback to go at the end
                callback = function () {
                  var args = [].slice.call( arguments );
                  cbRef.apply( this, args );
                  complete();
                };
              }
              // Just load the script of style
              loadScriptOrStyle( needGroup, callback, chain, 0, testResult );
            }
            // See if we have an object. Doesn't matter if it's an array or a key/val hash
            // Note:: order cannot be guaranteed on an key value object with multiple elements
            // since the for-in does not preserve order. Arrays _should_ go in order though.
            else if ( isObject( needGroup ) ) {
              // I hate this, but idk another way for objects.
              needGroupSize = (function(){
                var count = 0, i
                for (i in needGroup ) {
                  if ( needGroup.hasOwnProperty( i ) ) {
                    count++;
                  }
                }
                return count;
              })();

              for ( callbackKey in needGroup ) {
                // Safari 2 does not have hasOwnProperty, but not worth the bytes for a shim
                // patch if needed. Kangax has a nice shim for it. Or just remove the check
                // and promise not to extend the object prototype.
                if ( needGroup.hasOwnProperty( callbackKey ) ) {
                  // Find the last added resource, and append to it's callback.
                  if ( ! moreToCome && ! ( --needGroupSize ) ) {
                    // If this is an object full of callbacks
                    if ( ! isFunction( callback ) ) {
                      // Add in the complete callback to go at the end
                      callback[ callbackKey ] = (function( innerCb ) {
                        return function () {
                          var args = [].slice.call( arguments );
                          innerCb && innerCb.apply( this, args );
                          complete();
                        };
                      })( cbRef[ callbackKey ] );
                    }
                    // If this is just a single callback
                    else {
                      callback = function () {
                        var args = [].slice.call( arguments );
                        cbRef.apply( this, args );
                        complete();
                      };
                    }
                  }
                  loadScriptOrStyle( needGroup[ callbackKey ], callback, chain, callbackKey, testResult );
                }
              }
            }
          }

          // figure out what this group should do
          handleGroup( group, !!always );

          // Run our loader on the load/both group too
          // the always stuff always loads second.
          always && handleGroup( always );
      }

      // Someone just decides to load a single script or css file as a string
      if ( isString( needs ) ) {
        loadScriptOrStyle( needs, 0, chain, 0 );
      }
      // Normal case is likely an array of different types of loading options
      else if ( isArray( needs ) ) {
        // go through the list of needs
        for( i = 0; i < needs.length; i++ ) {
          need = needs[ i ];

          // if it's a string, just load it
          if ( isString( need ) ) {
            loadScriptOrStyle( need, 0, chain, 0 );
          }
          // if it's an array, call our function recursively
          else if ( isArray( need ) ) {
            yepnope( need );
          }
          // if it's an object, use our modernizr logic to win
          else if ( isObject( need ) ) {
            loadFromTestObject( need, chain );
          }
        }
      }
      // Allow a single object to be passed in
      else if ( isObject( needs ) ) {
        loadFromTestObject( needs, chain );
      }
    };

    // This publicly exposed function is for allowing
    // you to add functionality based on prefixes on the
    // string files you add. 'css!' is a builtin prefix
    //
    // The arguments are the prefix (not including the !) as a string
    // and
    // A callback function. This function is passed a resource object
    // that can be manipulated and then returned. (like middleware. har.)
    //
    // Examples of this can be seen in the officially supported ie prefix
    yepnope['addPrefix'] = function ( prefix, callback ) {
      prefixes[ prefix ] = callback;
    };

    // A filter is a global function that every resource
    // object that passes through yepnope will see. You can
    // of course conditionally choose to modify the resource objects
    // or just pass them along. The filter function takes the resource
    // object and is expected to return one.
    //
    // The best example of a filter is the 'autoprotocol' officially
    // supported filter
    yepnope['addFilter'] = function ( filter ) {
      globalFilters.push( filter );
    };

    // Default error timeout to 10sec - modify to alter
    yepnope['errorTimeout'] = 1e4;

    // Webreflection readystate hack
    // safe for jQuery 1.4+ ( i.e. don't use yepnope with jQuery 1.3.2 )
    // if the readyState is null and we have a listener
    if ( doc.readyState == null && doc.addEventListener ) {
      // set the ready state to loading
      doc.readyState = "loading";
      // call the listener
      doc.addEventListener( "DOMContentLoaded", handler = function () {
        // Remove the listener
        doc.removeEventListener( "DOMContentLoaded", handler, 0 );
        // Set it to ready
        doc.readyState = "complete";
      }, 0 );
    }

    // Attach loader &
    // Leak it
    window['yepnope'] = getYepnope();

    // Exposing executeStack to better facilitate plugins
    window['yepnope']['executeStack'] = executeStack;
    window['yepnope']['injectJs'] = injectJs;
    window['yepnope']['injectCss'] = injectCss;
  }

}());