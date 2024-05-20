import fs from 'node:fs'
import { createPickpointsFile } from '~/server/utils/pickpoints'

export default async function () {
  if (!fs.existsSync('pvz/wildberriesPoints.json')) {
    await createPickpointsFile();
  }

  const cached = fs.readFileSync('pvz/wildberriesPoints.json', 'utf8')
  const parsed = JSON.parse(cached)
  return {
    points: parsed.points,
  }
}
