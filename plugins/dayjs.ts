import dayjs from 'dayjs'
import Calendar from 'dayjs/plugin/calendar'

// import plugin
import relativeTime from 'dayjs/plugin/relativeTime'

// import plugin
import updateLocale from 'dayjs/plugin/updateLocale' // import plugin
import 'dayjs/locale/ru'

declare module '#app' {
  interface NuxtApp {
    $dayjs: typeof dayjs
  }
}
export default defineNuxtPlugin(() => {
  dayjs.extend(Calendar)
  dayjs.extend(relativeTime)
  dayjs.extend(updateLocale)

  dayjs.updateLocale('ru', {
    calendar: {
      lastDay: '[Вчера,] HH:mm',
      sameDay: '[Сегодня,] HH:mm',
      nextDay: '[Завтра в] HH:mm',
      lastWeek: 'DD MMMM HH:mm',
      nextWeek: 'dddd [в] HH:mm',
      sameElse: 'YYYY.MM.DD',
    },
  })
  dayjs.locale('ru')
  return {
    provide: {
      dayjs,
    },
  }
})
