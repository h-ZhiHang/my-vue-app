<template>
  <div :id="`chartdiv${props.id}`"></div>
</template>
<script setup lang="ts">
// 导入依赖
import * as am5 from '@amcharts/amcharts5'
import * as am5index from '@amcharts/amcharts5/index'
import * as am5xy from '@amcharts/amcharts5/xy'
import * as am5radar from '@amcharts/amcharts5/radar'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import * as am5percent from '@amcharts/amcharts5/percent'
import * as am5map from '@amcharts/amcharts5/map'
import * as am5hierarchy from '@amcharts/amcharts5/hierarchy'
import * as am5flow from '@amcharts/amcharts5/flow'
import { ref, onMounted } from 'vue'
// props
const props = defineProps({
  id: {
    type: String,
    default: () => {},
  },
  options: {
    type: Object,
    default: () => {},
  },
})
// 状态声明
// const styleData = ref({
//   width: '100%',
//   height: '100%',
// })
function setChart() {
  /* Chart code */
  // Create root element
  // https://www.amcharts.com/docs/v5/getting-started/#Root_element
  let root = am5.Root.new(`chartdiv${props.id}`)

  // Set themes
  // https://www.amcharts.com/docs/v5/concepts/themes/
  root.setThemes([am5themes_Animated.new(root)])
  let chart

  // Create chart
  // https://www.amcharts.com/docs/v5/charts/xy-chart/
  // let chart = root.container.children.push(
  //   am5xy.XYChart.new(root, {
  //     panX: false,
  //     panY: false,
  //     paddingLeft: 0,
  //     wheelX: 'panX',
  //     wheelY: 'zoomX',
  //     layout: root.verticalLayout,
  //   }),
  // )
  switch (props.options.type) {
    case 'xy':
      chart = root.container.children.push(am5xy.XYChart.new(root, props.options.pz))
      break

    default:
      break
  }

  // Add legend
  // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
  let legend = chart.children.push(
    am5.Legend.new(root, {
      centerX: am5.p50,
      x: am5.p50,
    }),
  )

  // Create axes
  // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
  let xRenderer = am5xy.AxisRendererX.new(root, {
    cellStartLocation: 0.1,
    cellEndLocation: 0.9,
    minorGridEnabled: true,
  })

  let xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: 'year',
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {}),
    }),
  )

  xRenderer.grid.template.setAll({
    location: 1,
  })

  xAxis.data.setAll(props.options.data)

  let yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0.1,
      }),
    }),
  )

  // Add series
  // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
  function makeSeries(name, type, fieldName) {
    let series = chart.series.push(
      am5xy[type].new(root, {
        name: name,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: fieldName,
        categoryXField: 'year',
      }),
    )

    series.columns.template.setAll({
      tooltipText: '{name}, {categoryX}:{valueY}',
      width: am5.percent(90),
      tooltipY: 0,
      strokeOpacity: 0,
    })

    series.data.setAll(props.options.data)

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear()

    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 0,
        sprite: am5.Label.new(root, {
          text: '{valueY}',
          fill: root.interfaceColors.get('alternativeText'),
          centerY: 0,
          centerX: am5.p50,
          populateText: true,
        }),
      })
    })

    // legend.data.push(series)
  }
  let series
  switch (props.options.type) {
    case 'xy':
      makeSeries('Europe', 'ColumnSeries', 'europe')
      break
    case 'line':
      series = chart.series.push(am5xy.LineSeries.new(root, props.options.series))
      break
    case 'column':
      series = chart.series.push(am5xy.ColumnSeries.new(root, props.options.series))
      break
    // 添加其他系列类型...
  }
  // makeSeries('Europe', 'europe')
  // makeSeries('North America', 'namerica')
  // makeSeries('Asia', 'asia')
  // makeSeries('Latin America', 'lamerica')
  // makeSeries('Middle East', 'meast')
  // makeSeries('Africa', 'africa')

  // Make stuff animate on load
  // https://www.amcharts.com/docs/v5/concepts/animations/
  chart.appear(10, 100)
}
defineExpose({
  setChart,
})
// watch
onMounted(() => {})
// 接口请求

// 函数逻辑
</script>

<style></style>
