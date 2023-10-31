﻿import {
    Chart,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    LineElement,
  } from 'chart.js'
  import { defineNuxtPlugin } from 'nuxt/app'
  
  export default defineNuxtPlugin(() => {
    Chart.register(
      CategoryScale,
      LinearScale,
      BarElement,
      LineElement,
      Title,
      Tooltip,
      Legend
    )
  })
  