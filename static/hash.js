/**
 * Network http会加载这两个js
 * worker局限性：
 * 1.没办法存在npm包里，很难和npm系统产生联系
 * 2.不适合小文件
 */
// 引入md5
self.importScripts("./spark-md5.min.js")

self.onmessage = e => {
    // 接收主线程传递的数据
    const {chunks} = e.data
    const spark = new self.SparkMD5.ArrayBuffer()

    let progress = 0
    let count = 0

    /**
     * chunks[index].file 对应每一个文件的切片
     * @param {*} index 
     */
    const loadNext = index => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(chunks[index].file)
        reader.onload = e => {
            count ++
            spark.append(e.target.result)
            if (count === chunks.length) {
                self.postMessage({
                    progress: 100,
                    hash: spark.end()
                })
            } else {
                // 每次完成一个，加一个切片的进度，比如一共10个切片，那进度就每次加10
                progress = progress + 100 / chunks.length
                self.postMessage({
                    progress
                })
                // 没完成之前，递归计算每个切片的md5值
                loadNext(count)
            }
        }
    }
    loadNext(0)
}