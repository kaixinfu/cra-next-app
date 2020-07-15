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
- [√] 将大的文件切片上传,再将切片合并
- [-] 断点续传

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
### 文件上传问题
限制文件格式的两种方式：
1. 判断file文件的后缀名，假如修改文件后缀名，是可以通过前端校验的，所以不准确
2. 通过判断文件的头信息，头信息是操作系统对文件的定义，每个格式文件的头信息是固定的，修改文件后缀名也改变不了头信息。
* 假如gif格式：file.slice(0, 6): 先取出blob对象的前六个数据字符
* 将字符转为16进制，跟文件类型头信息作比对
```
async blobToString(blob) {
    return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = function() {
            // 1.将结果转为unicode编码，返回值是 0 - 65535 之间的整数
            // 2.转成16进制，再转大写
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
}
```
### 后端项目地址：[egg-server](https://github.com/timer2/egg-server)
### 友情推荐：[蜗牛老湿](https://github.com/shengxinjing)
