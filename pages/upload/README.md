### 校验文件格式
大部分判断文件上传
1.判断文件的后缀名，是否符合。这种校验方法，不准确，因为后缀名是可以任意修改的。
2.
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