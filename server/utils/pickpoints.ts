import fs from 'node:fs'
import { PVZ } from '~/server/lib/models/ozon/PVZ'


export async function removeExtraPickpoints() {
  const cached = fs.readFileSync('pvz/wildberriesPoints.json', 'utf8')
  const parsed = JSON.parse(cached)

  //Обновление даты, чтобы не было зацикливаний
  const cache = {
    updated: new Date(),
    points: parsed.points,
  }
  fs.writeFileSync('pvz/wildberriesPoints.json', JSON.stringify(cache))

  //@ts-ignore
  const data: any = await $fetch(
    'https://static-basket-01.wb.ru/vol0/data/all-poo-fr-v9.json',
    {
      method: 'GET',
      headers: {
        'x-requested-with': 'XMLHttpRequest',
      },
    }
  )

  // Удаление объектов с deleteMark >= 10
  parsed.points.forEach((obj: any) => {
    if (obj.deleteMark && obj.deleteMark >= 5) {
      const index = parsed.points.findIndex((el: any) => el.id === obj.id)
      if (index !== -1) {
        parsed.points.splice(index, 1)
      } else {
        parsed.points[index].deleteMark = 0
      }
    }
  })

  //Добавление новых пвз, только прилетевших из вб
  data[0].items.forEach((obj: any) => {
    if (obj.id) {
      const index = parsed.points.findIndex(
        (el: any) => el.id === obj.id || el.a === obj.address
      )
      if (index === -1 && obj.id) {
        parsed.points.push({
          id: obj.id,
          lt: obj.coordinates[0],
          lg: obj.coordinates[1],
          w: obj.workTime,
          a: obj.address,
          deleteMark: 0,
        })
      }
    }
  })

  //Обновление deleteMark
  parsed.points.forEach((obj: any) => {
    if (!obj.deleteMark) {
      obj.deleteMark = 0
    }
    //Увеличиваем deleteMark, для points(ПВЗ), которые не прилетели из вб
    if (!data[0].items.some((el: any) => el.id === obj.id)) {
      obj.deleteMark++
    } else {
      obj.deleteMark = 0
    }
  })

  const newCache = {
    updated: new Date(),
    points: parsed.points,
  }
  fs.writeFileSync('pvz/wildberriesPoints.json', JSON.stringify(newCache))
}

export async function createPickpointsFile() {
  const data: any = await $fetch(
    'https://static-basket-01.wb.ru/vol0/data/all-poo-fr-v9.json',
    {
      method: 'GET',
      headers: {
        'x-requested-with': 'XMLHttpRequest',
      },
    }
  )

  const points = data[0].items
  const collection = points.map((point: any) => {
    return {
      id: point.id,
      lt: point.coordinates[0],
      lg: point.coordinates[1],
      w: point.workTime,
      a: point.address,
    }
  })

  const cache = {
    updated: new Date(),
    points: collection,
  }

  fs.writeFileSync('pvz/wildberriesPoints.json', JSON.stringify(cache))
  return
}

export async function createOzonPickpointsFile() {
  const points: any = await PVZ.find()

  const collection = points.map((point: any) => {
    return {
      id: point.pointId,
      lt: point.coordinates.lat,
      lg: point.coordinates.lon,
      address: point.address
    }
  })

  const cache = {
    updated: new Date(),
    points: collection,
  }

  console.log('creating ozonPoints.json')
  fs.writeFileSync('pvz/ozonPoints.json', JSON.stringify(cache))
}

export async function createAllPickpoints() {
  createPickpointsFile()
  createOzonPickpointsFile()
}
