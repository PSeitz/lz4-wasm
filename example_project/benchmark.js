import * as wasm from 'lz4-wasm'
// import * as JSZip from "jszip";
var lz4js = require('lz4/lib/binding')
import * as fflate from 'fflate/esm/browser.js'

import test_input_66k_JSON from './benches/compression_66k_JSON.txt'
import test_input_65k from './benches/compression_65k.txt'
import test_input_34k from './benches/compression_34k.txt'
import test_input_1k from './benches/compression_1k.txt'

function addText(text) {
    // let body = document.querySelectorAll('body');
    var div = document.createElement('div')
    div.innerHTML = text

    div.style['font-size'] = '40px'

    document.getElementById('body').appendChild(div)
}
// function addRow(col1, col2, col3) {
//     //
//     var tr = document.createElement("tr");
//     tr.style["font-size"] = "40px";

//     var td = document.createElement("td");
//     td.innerHTML = col1;
//     tr.appendChild(td);

//     var td = document.createElement("td");
//     td.innerHTML = col2;
//     tr.appendChild(td);

//     var td = document.createElement("td");
//     td.innerHTML = col3;
//     tr.appendChild(td);

//     document.querySelectorAll('tbody')[0].appendChild(tr);
// }

// async function benchmark_jszip_compression(argument) {

//     let total_bytes = 0;
//     var time0 = performance.now();
//     for (let i = 0; i < 1000; i++) {
//         var zip = new JSZip();
//         zip.file("a", test_input);

//         await zip.generateAsync({type: "uint8array"}).then(function (u8) {
//             // ...
//         });

//         total_bytes += test_input.length;
//     }

//     var time_in_ms = performance.now() - time0;

//     let total_mb = total_bytes / 1000000;
//     let time_in_s = time_in_ms / 1000;

// }

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

const compressor = [
    {
        name: 'lz4 wasm',
        prepareInput: function (input) {
            return new TextEncoder().encode(input)
        },
        compress: function (input) {
            return wasm.compress(input)
        },
        decompress: function (compressed, originalSize) {
            const original = wasm.decompress(compressed)
            return original
        },
    },
    {
        name: 'lz4 js',
        prepareInput: function (input) {
            return Buffer.from(input)
        },
        compress: function (input) {
            var output = Buffer.alloc(lz4js.compressBound(input.length))
            var compressedSize = lz4js.compress(input, output)
            output = output.slice(0, compressedSize)
            return output
        },
        decompress: function (compressed, originalSize) {
            var uncompressed = Buffer.alloc(originalSize)
            var uncompressedSize = lz4js.uncompress(compressed, uncompressed)
            uncompressed = uncompressed.slice(0, uncompressedSize)
            return uncompressed
        },
    },
    {
        name: 'fflate',
        prepareInput: function (input) {
            return Buffer.from(input)
        },
        compress: function (input) {
            return fflate.zlibSync(input, { level: 1 })
        },
        decompress: function (compressed, originalSize) {
            return fflate.unzlibSync(compressed)
        },
    },
]

let inputs = [
    {
        name: '66k_JSON',
        data: test_input_66k_JSON,
    },
    {
        name: '65k Text',
        data: test_input_65k,
    },
    {
        name: '34k Text',
        data: test_input_34k,
    },
    {
        name: '1k Text',
        data: test_input_1k,
    },
]

async function bench_maker() {
    addText('Starting Benchmark..')
    await sleep(10)
    for (const input of inputs) {
        addText('Input: ' + input.name)
        for (const el of compressor) {
            bench_compression(el, input.data, input.name)
            await sleep(10)
            bench_decompression(el, input.data, input.name)

            //updateGraph(bench_names, data_decomp)
            await sleep(10)
        }
    }
    addText('Finished')
}

async function bench_compression(compressor, input) {
    const test_input_bytes = compressor.prepareInput(input)
    const compressed = compressor.compress(test_input_bytes)
    let total_bytes = 0
    var time0 = performance.now()
    for (let i = 0; i < 1000; i++) {
        const compressed = compressor.compress(test_input_bytes)
        total_bytes += test_input_bytes.length
        if (performance.now() - time0 > 3000) {
            break
        }
    }

    var time_in_ms = performance.now() - time0

    let total_mb = total_bytes / 1000000
    let time_in_s = time_in_ms / 1000

    addText(
        compressor.name +
            ' compression: ' +
            (total_mb / time_in_s).toFixed(2) +
            'MB/s' +
            ' Ratio: ' +
            (compressed.length / test_input_bytes.length).toFixed(2)
    )
}
let data_decomp = inputs.map((el) => ({ bench_name: el.name, stats: [] }))
async function bench_decompression(compressor, input, input_name) {
    const test_input_bytes = compressor.prepareInput(input)
    const compressed = compressor.compress(test_input_bytes)
    let total_bytes = 0
    var time0 = performance.now()
    for (let i = 0; i < 1000; i++) {
        compressor.decompress(compressed, input.length)
        total_bytes += test_input_bytes.length
        if (performance.now() - time0 > 3000) {
            break
        }
    }

    var time_in_ms = performance.now() - time0

    let total_mb = total_bytes / 1000000
    let time_in_s = time_in_ms / 1000

    let throughput = (total_mb / time_in_s).toFixed(2)

    let existing_idx = data_decomp.findIndex(
        (el) => el.bench_name == input_name
    )
    if (existing_idx == -1) {
        data_decomp.push({ bench_name: input_name, stats: [throughput] })
    } else {
        data_decomp[existing_idx].stats.push(throughput)
    }

    addText(
        compressor.name +
            ' decompression: ' +
            throughput +
            'MB/s' +
            ' Ratio: ' +
            (compressed.length / test_input_bytes.length).toFixed(2)
    )
}

// run()
bench_maker()
    var data = [
        {
            input_name: '2017',
            income: 23.5,
            expenses: 18.1,
        },
        {
            input_name: '2018',
            income: 26.2,
            expenses: 22.8,
        },
        {
            input_name: '2019',
            income: 30.1,
            expenses: 23.9,
        },
        {
            input_name: '2020',
            income: 29.5,
            expenses: 25.1,
        },
        {
            input_name: '2021',
            income: 24.6,
            expenses: 25,
        },
    ]

//makechart(data)

function makechart(data) {
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    var root = am5.Root.new('chartdiv')

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)])

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(
        am5xy.XYChart.new(root, {
            panX: false,
            panY: false,
            wheelX: 'panX',
            wheelY: 'zoomX',
            layout: root.verticalLayout,
        })
    )

    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    var legend = chart.children.push(
        am5.Legend.new(root, {
            centerX: am5.p50,
            x: am5.p50,
        })
    )

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var yAxis = chart.yAxes.push(
        am5xy.CategoryAxis.new(root, {
            categoryField: 'input_name',
            renderer: am5xy.AxisRendererY.new(root, {
                inversed: true,
                cellStartLocation: 0.1,
                cellEndLocation: 0.9,
            }),
        })
    )

    yAxis.data.setAll(data)

    var xAxis = chart.xAxes.push(
        am5xy.ValueAxis.new(root, {
            renderer: am5xy.AxisRendererX.new(root, {
                strokeOpacity: 0.1,
            }),
            min: 0,
        })
    )

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    function createSeries(field, name) {
        var series = chart.series.push(
            am5xy.ColumnSeries.new(root, {
                name: name,
                xAxis: xAxis,
                yAxis: yAxis,
                valueXField: field,
                categoryYField: 'input_name',
                sequencedInterpolation: true,
                tooltip: am5.Tooltip.new(root, {
                    pointerOrientation: 'horizontal',
                    labelText: '[bold]{name}[/]\n{categoryY}: {valueX}',
                }),
            })
        )

        series.columns.template.setAll({
            height: am5.p100,
            strokeOpacity: 0,
        })

        series.bullets.push(function () {
            return am5.Bullet.new(root, {
                locationX: 1,
                locationY: 0.5,
                sprite: am5.Label.new(root, {
                    centerY: am5.p50,
                    text: '{valueX}',
                    populateText: true,
                }),
            })
        })

        series.bullets.push(function () {
            return am5.Bullet.new(root, {
                locationX: 1,
                locationY: 0.5,
                sprite: am5.Label.new(root, {
                    centerX: am5.p100,
                    centerY: am5.p50,
                    text: '{name}',
                    fill: am5.color(0xffffff),
                    populateText: true,
                }),
            })
        })

        series.data.setAll(data)
        series.appear()

        return series
    }

    createSeries('income', 'Income')
    createSeries('expenses', 'Expenses')

    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    var legend = chart.children.push(
        am5.Legend.new(root, {
            centerX: am5.p50,
            x: am5.p50,
        })
    )

    legend.data.setAll(chart.series.values)

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set(
        'cursor',
        am5xy.XYCursor.new(root, {
            behavior: 'zoomY',
        })
    )
    cursor.lineY.set('forceHidden', true)
    cursor.lineX.set('forceHidden', true)

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(1000, 100)
}

function asd() {
    // create chart
    //
    var data = [
        {
            bench_name: 'CA',
            stats: [
                2704659, 4499890, 2159981, 3853788, 10604510, 8819342, 4114496,
            ],
        },
        {
            bench_name: 'TX',
            stats: [
                2027307, 3277946, 1420518, 2454721, 7017731, 5656528, 2472223,
            ],
        },
        {
            bench_name: 'NY',
            stats: [
                1208495, 2141490, 1058031, 1999120, 5355235, 5120254, 2607672,
            ],
        },
        {
            bench_name: 'FL',
            stats: [
                1140516, 1938695, 925060, 1607297, 4782119, 4746856, 3187797,
            ],
        },
    ]

    var ids = ['preeschol', 'gradeschooler', 'teen']
    var bench_names = compressor.map((el) => el.name)

    // Let's populate the categoeries checkboxes
    d3.select('.categories')
        .selectAll('.checkbox')
        .data(bench_names)
        .enter()
        .append('div')
        .attr('class', 'checkbox')
        .append('label')
        .html((id, index) => {
            var checkbox =
                '<input id="' + id + '" type="checkbox" class="category">'
            return checkbox + bench_names[index]
        })

    // some variables declarations
    var margin = { top: 20, right: 20, bottom: 30, left: 90 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom

    // the scale for the state age value
    var x = d3.scale.linear().range([0, width])

    // the scale for each state
    var y0 = d3.scale.ordinal().rangeBands([0, height], 0.1)
    // the scale for each state age
    var y1 = d3.scale.ordinal()

    // just a simple scale of colors
    var color = d3.scale
        .ordinal()
        .range([
            '#98abc5',
            '#8a89a6',
            '#7b6888',
            '#6b486b',
            '#a05d56',
            '#d0743c',
            '#ff8c00',
        ])

    //
    var xAxis = d3.svg
        .axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(d3.format('.2s'))

    var yAxis = d3.svg.axis().scale(y0).orient('left')

    var svg = d3
        .select('.graph')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    d3.select('.categories')
        .selectAll('.category')
        .on('change', () => {
            var x = d3.select('.categories').selectAll('.category:checked')
            var bench_names = x[0].map((category) => {
                return category.id
            })
            updateGraph(bench_names, data_decomp)
        })
    renderGraph(inputs)

    function renderGraph(inputs) {
        x.domain([0, 0])
        // y0 domain is all the bench_name names
        y0.domain(inputs.map((el) => el.name))
        // y1 domain is all the age names, we limit the range to from 0 to a y0 band
        y1.domain(bench_names).rangeRoundBands([0, y0.rangeBand()])

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)

        svg.append('g').attr('class', 'y axis').call(yAxis)
    }

    function updateGraph(selectedIds, data) {
        let statesData = data.map((stateData) => {
            return {
                bench_name: stateData.bench_name,
                ages: selectedIds.map((selectedId) => {
                    var index = bench_names.findIndex((id) => selectedId === id)
                    return {
                        name: bench_names[index],
                        value: stateData.stats[index],
                    }
                }),
            }
        })
        console.log(statesData)

        // x domain is between 0 and the maximun value in any ages.value
        console.log(d3.max(statesData, (d) => d3.max(d.ages, (d) => d.value)))
        x.domain([0, d3.max(statesData, (d) => d3.max(d.ages, (d) => d.value))])
        // y0 domain is all the bench_name names
        y0.domain(statesData.map((d) => d.bench_name))
        // y1 domain is all the age names, we limit the range to from 0 to a y0 band
        y1.domain(bench_names).rangeRoundBands([0, y0.rangeBand()])

        svg.selectAll('.axis.x').call(xAxis)
        svg.selectAll('.axis.y').call(yAxis)

        var bench_name = svg.selectAll('.bench_name').data(statesData)

        bench_name
            .enter()
            .append('g')
            .attr('class', 'bench_name')
            .attr('transform', (d) => {
                return 'translate(0, ' + y0(d.bench_name) + ')'
            })

        let age = bench_name.selectAll('rect').data((d) => d.ages)

        // we append a new rect every time we have an extra data vs dom element
        age.enter().append('rect').attr('width', 0)

        // this updates will happend neither inserting new elements or updating them
        age.attr('x', 0)
            .attr('y', (d, index) => y1(bench_names[index]))
            .attr('id', (d) => d.name)
            .style('fill', (d) => color(d.name))
            .text((d) => d.name)
            .transition()
            .attr('width', (d) => x(d.value))
            .attr('height', y1.rangeBand())

        age.exit().transition().attr('width', 0).remove()

        // Add legend
        let legend = svg
            .selectAll('.legend')
            .data(statesData[0].ages.map((age) => age.name))

        legend.enter().append('g')
        legend.attr('class', 'legend').attr('transform', (d, i) => {
            return 'translate(0,' + (200 + i * 20) + ')'
        })

        var legendColor = legend.selectAll('.legend-color').data((d) => [d])
        legendColor.enter().append('rect')
        legendColor
            .attr('class', 'legend-color')
            .attr('x', width - 18)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', color)

        var legendText = legend.selectAll('.legend-text').data((d) => [d])

        legendText.enter().append('text')
        legendText
            .attr('class', 'legend-text')
            .attr('x', width - 24)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .text((d) => d)

        legend.exit().remove()
    }
}
