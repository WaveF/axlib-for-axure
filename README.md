# Axure扩展库
Axure的前端组件库,在RP9.x版本通过测试

## 提示
  建议配合 **JsBox** 使用，**JsBox** 是调用了axlib的一个Axure代码编辑器组件版，除了能方便的在Axure中直接编程之外，还可以外联到VSCode中进行开发建议直接跳转到JsBox仓库进行了解：
  - https://gitee.com/wavef/jsbox （码云）
  - https://github.com/wavef/jsbox （Github）

## 组件

- ## axlib-v3
  核心库，包含多项实用的axure操作等函数

  #### 加载方式
  
    - 在Axure中添加 *“加载时-打开外部链接”* 的交互，然后输入以下代码：

      ```js
      $axure.utils.loadJS('https://ax.minicg.com/axlib-v3.min.js', ()=>{
        console.log(axlib);
      });
      ```

    - 也可以通过添加网络字体的方式加载，代码如下：

      ```html
      "><script src="https://ax.minicg.com/axlib-v3.min.js"></script><link href="
      ```

  #### 功能扩展

    - ##### 中继器 - Repeater
     
      ```js
      /*
       * 获取中继器数据（实时）
       * format:
       * default - 返回最原始的 axure 中继器数据格式
       * auto - 按照每行获取数据，类型为数组，数组内每个元素都是对象，并标记每列的值
       * row - 按照每行获取数据，类型为对象，键值为首列每行的值, trim可只获取第1位的值
       * col - 按照每列获取数据，类型为对象，键值为列名（小写）
       * tree - 返回树状数据结构，另外配合参数：trim 可移除空值，表头必须命名为C1,C2,C3...
       */

      // 获取中继器数据（仅获取初始化时的数据，用axure交互、或用代码操作过的数据都不会被获取到）
      $axure('@中继器名称').getRepeaterDataOnce({ format: 'row', trim: true });

      // 插入中继器数据（仅接受axure原始数据格式）
      $axure('@中继器名称').addRepeaterData(
        [
          {
            'col1': { type: 'text', text: 'r1c1' },
            'col2': { type: 'text', text: 'r1c2' },
          },
          {
            'col1': { type: 'text', text: 'r2c1' },
            'col2': { type: 'text', text: 'r2c2' },
          }
        ]
      );

      // 删除n行中继器数据
      let rows = 3;
      $axure('@中继器名称').deleteRepeaterData(rows);

      // 刷新中继器（插入、更新、删除、清空数据后需要刷新才能获取实时数据）
      // 会发射一个 REPEATER_UPDATED 的事件，可通过 repeater.$().on('REPEATER_UPDATED', callback) 侦听
      $axure('@中继器名称').refreshRepeater();

      // 覆盖设置中继器数据（仅接受axure原始数据格式）
      $axure('@中继器名称').setRepeaterData(data);

      // 清空中继器数据
      $axure('@中继器名称').clearRepeaterData();

      // 侦听中继器更新（也支持add、delete等）
      $axure('@中继器名称').on('REPEATER_DATA_UPDATED', (e, res) => {
        console.log(res);
      });
      ```

    - ##### 动态面板 - Dynamic Panel
      ```js
      // 获取动态面板所有状态
      $axure('@动态面板名称').getPanelStates();

      // 获取动态面板当前状态
      $axure('@动态面板名称').getCurrentPanelState();

      // 动态面板跳转到指定名称的状态
      let name = 'State 1';
      $axure('@动态面板名称').setPanelStateByName(name);

      // 动态面板跳转到指定索引
      $axure('@动态面板名称').setPanelStateByIndex(1);
      ```
    

    - ##### 页面跳转
      ```js
      // 注入方法到页面跳转方法（原生交互也可触发）
      $axure.beforeNav((options,stop)=>{
        console.log(options); /* 这里其实可以加入转场效果（实测） */
        stop(true); /* 执行这句会阻断原生跳转 */
      });

      // 手动跳转
      $axure.navigate({
        url: 'page_1.html',
        target: 'frame',
        includeVariables: true,
        frame: $iframe.get(0)
      });
      ```


    - ##### 简化获取ID与节点的方法
      ```js
      // 返回第一个同名元素的 id
      $axure('@元素名称').getId();

      // 返回第一个同名元素的DOM节点
      $axure('@元素名称').getEl();
      ```

    - ##### 设置和获取全局变量
      ```js
      // 设置全局变量（需要先在 Axure 里添加该全局变量名称才能生效）
      axlib.setGlobalVar('varName', 'value');

      // 获取全局变量的值
      axlib.getGlobalVar('varName');
      ```

    - ##### 设置鼠标指针样式
      ```js
      // 设置元素的指针样式为手形
      $axure('@元素名称').buttonMode(true);

      // 设置元素不感应任何鼠标事件
      $axure('@元素名称').ghostMode(true);
      ```
     
  #### 附加功能

    - ##### 加载插件
      
      ```js
      const { toast, swal2 } = axlib.plugins;
      yepnope({
        load: [...toast.files, ...swal2.files],
        complete: ()=>{ console.log($.toast, Swal) }
      });
      ```

    - ##### 改变界面布局

      ```js
      /*
       * 参数：
       * 0 ~ 默认布局（保留折叠）
       * 1 ~ 隐藏顶栏，默认缩放
       * 2 ~ 隐藏顶栏，按宽度缩放
       * 3 ~ 隐藏顶栏，按高度缩放
       */
      axlib.layout(2);
      ```

    - ##### 在线读取与保存数据（新）
      ```js
      // 初始化 
      // 参数：仓库id，可在 https://json.minicg.com 获得
      // window.jsonbin === axlib.jsonbin
      let bin = new jsonbin('64a6db339d312622a37b3ebc');

      // 读取数据
      bin.read().then(res=>console.log(res));

      // 更新数据（数据覆盖）
      bin.update({foo:'bar'});

      // 创建新仓库（需要先设置 API-KEY）
      bin.create();

      // 删除仓库（需要先设置 API-KEY）
      bin.delete();

      // 设置 API-KEY
      bin.apiKey = 'YOUR_API_KEY';

      // 设置 ACCESS-KEY（可单独设置create/delete/read/update权限）
      bin.accessKey = 'YOUR_ACCESS_KEY';
      ```

    - ##### 插入加载动画
      ```js
      let container = $axure('@target').$().get(0);
      let show = true;
      let options = {
        color:'#fff',
        opacity:0.2,
        scale:1.2,
        delay:0,
        dur:1,
        blending:'difference'
      };
      axlib.loading(container, show, options);
      ```

    - ##### 只加载一次资源，避免重复加载
      ```js
      axlib.loadOnce({
        urls: [
          'https://ax.minicg.com/element/vue.min.js',
          'https://ax.minicg.com/element/index.css',
          'https://ax.minicg.com/element/index.js',
        ],
        lock: 'Element', // 变量锁id,受变量名命名规则约束(不能数字开头,特殊字符只接受$和_)
        callback: ()=> { console.log(window.Vue) }
      })
      ```


    - ##### 获取一个或多个元件
      ```js
      // 原生节点（window.getEl === axlib.getEl）
      const [ sym1, sym2, sym3 ] = getEl('sym1', 'sym2', 'sym3');
      const sym1 = axlib.getEl('sym1');

      // axure 对象
      const [ sym1, sym2, sym3 ] = $axure.getEl('sym1', 'sym2', 'sym3');

      // jquery 对象
      const [ sym1, sym2, sym3 ] = $.getEl('sym1', 'sym2', 'sym3');
      ```

    - ##### 获取单个元件
      ```js
      let sym1 = $axure('@sym1').getEl();
      ```

    - ##### 获取多个元件
      ```js
      /*
       * 范例代码等同于：
       * let sym1 = $axure('@sym1');
       * let sym2 = $axure('@sym2');
       * let sym3 = $axure('@sym3');
       */
      let { sym1, sym2, sym3 } = axlib.find('sym1', 'sym2', 'sym3');
      ```

    - ##### 获取单个元件id
      ```js
      let id = $axure('@sym1').getId();
      ```

    - ##### 保存文本文件
      ```js
      // 浏览器会提示下载文件
      let text = 'Hello Axlib!';
      let fileName = 'hello.txt';
      axlib.saveTextFile(text, fileName);
      ```

    - ##### 动态插入ES Module代码
      ```js
      axlib.insertJsModule(`
        import { createApp } from 'https://unpkg.com/petite-vue?module';
        console.log(createApp);
      `);
      ```
