import { get } from 'http'

get('http://127.0.0.1:4000/api/data?stream', res => {
  res.on('data', chunk => {
    console.log(chunk.toString())
  })

  res.on('end', () => {
    console.log('closed')
  })
})

// import { Readable } from 'stream'

// const stream = new Readable({
//   read() { }
//   // read() {
//   //   console.log('read called')
//   //   this.push('Hello, world!')
//   //   this.push(null)
//   // }
// })

// stream.push('Hello, world! (1)');

// stream.on('data', chunk => {
//   console.log(chunk.toString())
// });

// stream.on('end', () => {
//   console.log('stream done')
// })


// stream.push('Hello, world! (2)');

// setTimeout(() => {
//   stream.push('Hello, world! (3)');
//   stream.push(null);
// }, 1000)
