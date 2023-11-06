<script lang="ts" setup>
const props = defineProps({
  info: {
    type: Object,
  },
})
const colorMode = useColorMode()
const info = props.info ? props.info : {}
const chartPieSeries = info.data ? info.data : [1, 1]
const chartPieOptions = {
  labels: info.labels ? info.labels : ['Активные', 'Неактивные'],
  chart: {
    type: 'donut',
    fontFamily: 'Calibri',
  },
  plotOptions: {
    pie: {
      startAngle: 0,
      endAngle: 360,
      expandOnClick: true,
      offsetX: 0,
      offsetY: 0,
      customScale: 1,
      dataLabels: {
        offset: 0,
        minAngleToShowLabel: 1,
      },
      donut: {
        size: '65%',
        background: 'transparent',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '22px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            color: undefined,
            offsetY: 0,
            formatter: function (val: any) {
              return val
            },
          },
          value: {
            show: true,
            fontSize: '21px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 400,
            color: colorMode.value == 'light' ? '#570df8' : '#a469f7',
            offsetY: 16,
            formatter: function (val: any) {
              return val
            },
          },
          total: {
            show: true,
            showAlways: true,
            label: 'Зарегестрировалось',
            fontSize: '14px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            color: colorMode.value == 'light' ? '#272935' : '#f8f8f2',
            formatter: function (w: any) {
              return info.signedUp
            },
          },
        },
      },
    },
  },
  colors: ['#eb4886', '#875fc0', '#ffb82c'],
  dataLabels: {
    style: {
      fontSize: '15px',
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 'bold',
    },
  },
  tooltip: {
    style: {
      fontSize: '16px',
      fontFamily: 'Poppins, sans-serif',
    },
  },
  legend: {
    show: true,
    position: 'bottom',

    fontSize: '16px',
    fontFamily: 'Poppins, sans-serif',
    labels: {
      colors: colorMode.value == 'light' ? '#272935' : '#f8f8f2',
      useSeriesColors: false,
    },
    formatter: function (seriesName: any, opts: any) {
      return [seriesName, " ", opts.w.globals.series[opts.seriesIndex]]
    }
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 'auto',
          height: 'auto',
          dropShadow: {
            enabled: false,
            enabledOnSeries: false,
            top: 0,
            left: 0,
            blur: 0,
            color: '#a469f7',
            opacity: 1,
          },
        },
      },
    },
  ],
}
</script>
<template>
  <apexchart
    class="font-mono"
    type="donut"
    :options="chartPieOptions"
    :series="chartPieSeries"
  ></apexchart>
</template>
<style scoped></style>
