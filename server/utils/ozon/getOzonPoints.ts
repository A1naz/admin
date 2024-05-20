import fs from 'node:fs'
import { createOzonPickpointsFile } from '~/server/utils/pickpoints'

export default async function () {
  if (!fs.existsSync('pvz/ozonPoints.json')) {
    await createOzonPickpointsFile();
  }
  const cached = fs.readFileSync('pvz/ozonPoints.json', 'utf8')
  const parsed = JSON.parse(cached)
  return {
    points: parsed.points,
  }
}
