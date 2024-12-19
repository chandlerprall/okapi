import { oauthServer, Request, Response } from '../auth/_utils.js';

// const startTime = 1730469607133 // Fri Nov 01 2024 10:00:07 GMT-0400 (Eastern Daylight Time)
const startTime = 1730887207133 // Wed Nov 06 2024 05:00:07 GMT-0500 (Eastern Standard Time)
const now = Date.now()
const elapsed = now - startTime
const elapsedHours = elapsed / 1000 / 60 / 60
const totalRecordCount = Math.floor(elapsedHours * 5)

const records = []
for (let i = 0; i < totalRecordCount; i++) {
  records.push({
    id: i,
    createdAt: startTime + i * 1000 * 60 * 60,
    createdAtHumanReadable: new Date(startTime + i * 1000 * 60 * 60),
    name: `Record ${i}`
  })
}

export default async ({ ctx, emitRecord, params: { page, perPage, after }, signal }) => {
  await oauthServer.authenticate(new Request(ctx.request), new Response(ctx.response))

  let isActive = true;
  signal.addEventListener('abort', () => {
    isActive = false
  });

  const filteredRecords = after != null ? records.filter(record => record.createdAt > after) : records;
  const pagedRecords = filteredRecords.slice((page - 1) * perPage, page * perPage)

  // emit each record with a 100ms delay between them
  for (const record of pagedRecords) {
    if (!isActive) break
    await new Promise(resolve => setTimeout(resolve, 100))
    emitRecord(record)
  }
}