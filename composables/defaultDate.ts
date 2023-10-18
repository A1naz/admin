function addLeadingZero(num: number) {
  return num < 10 ? '0' + num : num
}

// Функция для форматирования даты и времени
export function defaultDate(newDate: Date) {

  const date = new Date(newDate)
  const day = addLeadingZero(date.getUTCDate())
  const month = addLeadingZero(date.getUTCMonth() + 1)
  const year = date.getUTCFullYear()
  const hours = addLeadingZero(date.getUTCHours())
  const minutes = addLeadingZero(date.getUTCMinutes())

  return `${day}.${month}.${year} ${hours}:${minutes}`
}
