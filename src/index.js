import Koa from 'koa'
import bodyparser from 'koa-bodyparser';
import { URLSearchParams } from 'url'
import { Readable } from 'stream'
import path from 'path';
import { existsSync } from 'fs';

const __dirname = import.meta.dirname
const app = new Koa()
app.use(bodyparser());

let version = 0;
app.use(async ctx => {
  // if (ctx.method !== 'GET') {
  //   ctx.status = 405
  //   ctx.response.body = 'Method Not Allowed'
  //   return
  // }

  console.log('-----')
  console.log(`:: handling request for ${ctx.method} ${ctx.path}, ${ctx.querystring}`)
  console.log(ctx.request.headers);
  console.log(ctx.request.body);
  console.log('-----')

  const parts = ctx.path.split('/').filter((part, idx, arr) => idx === arr.length - 1 || !!part).map(x => x || 'index')
  const controllerPath = path.resolve(__dirname, '..', 'routes', ...parts) + '.js'

  if (existsSync(controllerPath)) {
    ctx.status = 200
    ctx.response.type = 'application/json'

    const searchParams = new URLSearchParams(ctx.search)

    const isStream = searchParams.has('stream')
    const params = {
      ...Object.fromEntries(searchParams.entries()),
      page: searchParams.has('page') ? parseInt(searchParams.get('page'), 10) : 1,
      perPage: searchParams.has('perPage') ? parseInt(searchParams.get('perPage'), 10) : 10,
      after: searchParams.has('after') ? parseInt(searchParams.get('after'), 10) : undefined,
    };

    if (isStream) {
      ctx.response.body = new Readable({
        read() { }
      })
    } else {
      ctx.response.body = ''
    }

    function send(record) {
      if (isStream) {
        ctx.response.body.push(record)
      } else {
        ctx.response.body += record
      }
    }

    let onEnd;
    let isEnded = false;
    let hasEmittedRecord = false;
    function end() {
      isEnded = true

      if (hasEmittedRecord) {
        send(']')
      }
      if (isStream) {
        ctx.response.body.push(null)
      } else {
        if (onEnd) {
          onEnd?.()
        }
      }
    }

    const abortController = new AbortController()
    ctx.req.on('close', () => {
      if (!isEnded) {
        abortController.abort()
        end()
      }
    })

    function emitRecord(record) {
      if (hasEmittedRecord) {
        send(',')
      } else {
        send('[')
      }
      send(JSON.stringify(record))
      hasEmittedRecord = true
    }

    const controller = (await import(`${controllerPath}?version=${version++}`)).default

    const controllerResult = controller({ ctx, send, emitRecord, params, signal: abortController.signal })
    if (controllerResult instanceof Promise) {
      controllerResult.catch(e => {
        console.error(e)
        send(e.stack)
      }).then(end)
    } else {
      end()
    }

    return isStream ? undefined : new Promise(resolve => onEnd = resolve)
  }

  ctx.status = 404
  ctx.body = 'Not Found'
})

app.listen(4000)