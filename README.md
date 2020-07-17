# cra-next-app

## 包含

- [x] [vue](https://cn.vuejs.org/v2/guide/)
- [x] [nuxt](https://zh.nuxtjs.org/guide/installation)
- [x] [axios](https://github.com/axios/axios)

## 功能预览
- [√] 注册、登录
- [√] 普通文件上传
- [√] 拖拽、进度条
- [√] 限制文件格式的两种格式
- [√] 使用worker计算md5值
- [√] 使用requestIdleCallback计算md5值
- [√] 使用抽样hash方法，计算md5值
- [√] 切片上传：将大的文件切片上传,再将切片合并
- [√] 断点续传：某些切片由于网路等其他原因丢失，续传补传切片
- [√] 控制上传并发数量
- [√] 报错重试、超过一定次数终止
- [-] markdown、富文本编辑器

## 下载项目

```sh
$ git clone https://github.com/timer2/cra-next-app.git
```
```sh
$ npm install
```
```sh
$ npm run dev
```
## 校验文件格式
> 大部分判断文件上传的方法主要是还是第一种，然而，扩展名完全是可以随便修改的。

1.判断文件的后缀名，是否符合。这种校验方法，不准确。

2.不管是图片、视频等文件都是而二进制形式存储的，每类文件的头信息是不同的，所有我们可以通过头信息来判断是哪种类型文件

> 通过input的事件，传递进来的文件，构造函数是[File](https://developer.mozilla.org/zh-CN/docs/Web/API/File)，File也继承了Blob的属性方法。

不如我们要判断gif格式，只需要判断头6位就行了

* 首先调用file.slice(0,6)。返回指定范围内的数据，是个blob对象

```
async blobToString(blob) {
    return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = function() {
            // 1.将结果转为unicode编码，2.转成16进制，再转大写
            let res = reader.result.split('')
                        .map(i => i.charCodeAt())
                        .map(j => j.toString(16).toUpperCase())
                        .join(' ')
            // 返回转换后的结果
            resolve(res)
        }
        // 调用读取文件方法
        reader.readAsBinaryString(blob)
    })
},
```
* 创建一个FileReader实例去读取这个blob对象的内容，此时的内容是 "GIF89a "。

* 先将字符分割开，[charCodeAt](https://www.w3school.com.cn/jsref/jsref_charCodeAt.asp)：返回字符的Unicode 编码，返回值是 0 - 65535 之间的整数

* 转成16进制，再转大写，最后以空格转成字符串。最终比较结果是否是 "47 49 46 38 37 61" 或者 res === "47 49 46 38 39 61"

## 上传文件

普通的上传文件，就是将file添加到formDate中，传给后端就ok了。
但文件要考虑的问题：
1. 要上传的文件过大
2. 文件上传过程中，网络错误导致上传失败怎么办
3. 秒传等问题

文件过大就要用到切片上传，就是将文件分割成许多小块，每个小块单独上传，这样就需要知道上传了哪些切片。

> 如何知道服务器上有没有上传过该文件？
> 该文件的切片上传了多少？

这就需要一个唯一标识，就是计算文件的md5值，只要文件内容不变，md5值就不会变

### 计算文件md5
首先先将文件切片，就是定义一个size，用file.slice(0, size)将文件切成大小相同的切片，最后一个可能不同。

然后计算md5值，是非常耗时的。
####  [new Worker](https://github.com/timer2/cra-next-app/blob/master/static/hash.js)
创建一个worker实例，注册传递、接收的两个监听函数。

传进去切片数组，worker每计算完一个切片或者计算完所有切片。就发给主线程发信号，这个信号有md5计算的进度。

#### requestIdleCallback

为什么要计算md5值？
当文件
### 切片上传图片
### 断点续传
### 控制并发上传
### 报错重试上传
### 后端项目地址：[egg-server](https://github.com/timer2/egg-server)
### 友情推荐：[蜗牛老湿](https://github.com/shengxinjing)
