import * as wasm from "lz4-wasm";
// import * as JSZip from "jszip";
var lz4js = require("lz4/lib/binding");
import * as fflate from "fflate/esm/browser.js";

import test_input_66k_JSON from "./benches/compression_66k_JSON.txt";
import test_input_65k from "./benches/compression_65k.txt";
import test_input_34k from "./benches/compression_34k.txt";
import test_input_1k from "./benches/compression_1k.txt";

function addText(text) {
  // let body = document.querySelectorAll('body');
  var div = document.createElement("div");
  div.innerHTML = text;

  div.style["font-size"] = "40px";

  document.getElementById("body").appendChild(div);
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
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const compressor = [
  {
    name: "lz4 wasm",
    prepareInput: function (input) {
      return new TextEncoder().encode(input);
    },
    compress: function (input) {
      return wasm.compress(input);
    },
    decompress: function (compressed, originalSize) {
      const original = wasm.decompress(compressed);
      return original;
    },
  },
  {
    name: "lz4 js",
    prepareInput: function (input) {
      return Buffer.from(input);
    },
    compress: function (input) {
      var output = Buffer.alloc(lz4js.compressBound(input.length));
      var compressedSize = lz4js.compress(input, output);
      output = output.slice(0, compressedSize);
      return output;
    },
    decompress: function (compressed, originalSize) {
      var uncompressed = Buffer.alloc(originalSize);
      var uncompressedSize = lz4js.uncompress(compressed, uncompressed);
      uncompressed = uncompressed.slice(0, uncompressedSize);
      return uncompressed;
    },
  },
  {
    name: "fflate",
    prepareInput: function (input) {
      return Buffer.from(input);
    },
    compress: function (input) {
      return fflate.zlibSync(input, { level: 1 });
    },
    decompress: function (compressed, originalSize) {
      return fflate.unzlibSync(compressed);
    },
  },
];

let inputs = [
  {
    name: "66k_JSON",
    data: test_input_66k_JSON,
  },
  {
    name: "65k Text",
    data: test_input_65k,
  },
  {
    name: "34k Text",
    data: test_input_34k,
  },
  {
    name: "1k Text",
    data: test_input_1k,
  },
];

async function bench_maker() {
  addText("Starting Benchmark..");
  await sleep(10);
  for (const input of inputs) {
    addText("Input: " + input.name);
    for (const el of compressor) {
      bench_compression(el, input.data);
      await sleep(10);
      bench_decompression(el, input.data);
      await sleep(10);
    }
  }
  addText("Finished");
}

async function bench_compression(compressor, input) {
  const test_input_bytes = compressor.prepareInput(input);
  const compressed = compressor.compress(test_input_bytes);
  let total_bytes = 0;
  var time0 = performance.now();
  for (let i = 0; i < 1000; i++) {
    const compressed = compressor.compress(test_input_bytes);
    total_bytes += test_input_bytes.length;
    if (performance.now() - time0 > 3000) {
      break;
    }
  }

  var time_in_ms = performance.now() - time0;

  let total_mb = total_bytes / 1000000;
  let time_in_s = time_in_ms / 1000;

  addText(
    compressor.name +
      " compression: " +
      (total_mb / time_in_s).toFixed(2) +
      "MB/s" +
      " Ratio: " +
      (compressed.length / test_input_bytes.length).toFixed(2)
  );
}
async function bench_decompression(compressor, input) {
  const test_input_bytes = compressor.prepareInput(input);
  const compressed = compressor.compress(test_input_bytes);
  let total_bytes = 0;
  var time0 = performance.now();
  for (let i = 0; i < 1000; i++) {
    compressor.decompress(compressed, input.length);
    total_bytes += test_input_bytes.length;
    if (performance.now() - time0 > 3000) {
      break;
    }
  }

  var time_in_ms = performance.now() - time0;

  let total_mb = total_bytes / 1000000;
  let time_in_s = time_in_ms / 1000;

  addText(
    compressor.name +
      " decompression: " +
      (total_mb / time_in_s).toFixed(2) +
      "MB/s" +
      " Ratio: " +
      (compressed.length / test_input_bytes.length).toFixed(2)
  );
}

// run()
bench_maker();

// create chart
//
var data = [
  {
    bench_name: "CA",
    stats: [2704659, 4499890, 2159981, 3853788, 10604510, 8819342, 4114496],
  },
  {
    bench_name: "TX",
    stats: [2027307, 3277946, 1420518, 2454721, 7017731, 5656528, 2472223],
  },
  {
    bench_name: "NY",
    stats: [1208495, 2141490, 1058031, 1999120, 5355235, 5120254, 2607672],
  },
  {
    bench_name: "FL",
    stats: [1140516, 1938695, 925060, 1607297, 4782119, 4746856, 3187797],
  },
];

var ids = ["preeschol", "gradeschooler", "teen"];
var ageNames = compressor.map((el) => el.name);

// Let's populate the categoeries checkboxes
d3.select(".categories")
  .selectAll(".checkbox")
  .data(ids)
  .enter()
  .append("div")
  .attr("class", "checkbox")
  .append("label")
  .html(function (id, index) {
    var checkbox = '<input id="' + id + '" type="checkbox" class="category">';
    return checkbox + ageNames[index];
  });

// some variables declarations
var margin = { top: 20, right: 20, bottom: 30, left: 90 },
  width = 800 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// the scale for the state age value
var x = d3.scale.linear().range([0, width]);

// the scale for each state
var y0 = d3.scale.ordinal().rangeBands([0, height], 0.1);
// the scale for each state age
var y1 = d3.scale.ordinal();

// just a simple scale of colors
var color = d3.scale
  .ordinal()
  .range([
    "#98abc5",
    "#8a89a6",
    "#7b6888",
    "#6b486b",
    "#a05d56",
    "#d0743c",
    "#ff8c00",
  ]);

//
var xAxis = d3.svg
  .axis()
  .scale(x)
  .orient("bottom")
  .tickFormat(d3.format(".2s"));

var yAxis = d3.svg.axis().scale(y0).orient("left");

var svg = d3
  .select(".graph")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.select(".categories")
  .selectAll(".category")
  .on("change", function () {
    var x = d3.select(".categories").selectAll(".category:checked");
    var ids = x[0].map(function (category) {
      return category.id;
    });
    updateGraph(ids);
  });
renderGraph(inputs);

function renderGraph(inputs) {
  x.domain([0, 0]);
  // y0 domain is all the bench_name names
  y0.domain(inputs.map((el) => el.name));
  // y1 domain is all the age names, we limit the range to from 0 to a y0 band
  y1.domain(ageNames).rangeRoundBands([0, y0.rangeBand()]);

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g").attr("class", "y axis").call(yAxis);
}

function updateGraph(selectedIds) {
  let statesData = data.map((stateData) => {
    return {
      bench_name: stateData.bench_name,
      ages: selectedIds.map(function (selectedId) {
        var index = ids.findIndex(function (id) {
          return selectedId === id;
        });
        return {
          id: ids[index],
          name: ageNames[index],
          value: stateData.stats[index],
        };
      }),
    };
  });

  // x domain is between 0 and the maximun value in any ages.value
  x.domain([
    0,
    d3.max(statesData, function (d) {
      return d3.max(d.ages, function (d) {
        return d.value;
      });
    }),
  ]);
  // y0 domain is all the bench_name names
  y0.domain(
    statesData.map(function (d) {
      return d.bench_name;
    })
  );
  // y1 domain is all the age names, we limit the range to from 0 to a y0 band
  y1.domain(ids).rangeRoundBands([0, y0.rangeBand()]);

  svg.selectAll(".axis.x").call(xAxis);
  svg.selectAll(".axis.y").call(yAxis);

  var bench_name = svg.selectAll(".bench_name").data(statesData);

  bench_name
    .enter()
    .append("g")
    .attr("class", "bench_name")
    .attr("transform", function (d) {
      return "translate(0, " + y0(d.bench_name) + ")";
    });

  var age = bench_name.selectAll("rect").data(function (d) {
    return d.ages;
  });

  // we append a new rect every time we have an extra data vs dom element
  age.enter().append("rect").attr("width", 0);

  // this updates will happend neither inserting new elements or updating them
  age
    .attr("x", 0)
    .attr("y", function (d, index) {
      return y1(ids[index]);
    })
    .attr("id", function (d) {
      return d.id;
    })
    .style("fill", function (d) {
      return color(d.name);
    })
    .text(function (d) {
      return d.name;
    })
    .transition()
    .attr("width", function (d) {
      return x(d.value);
    })
    .attr("height", y1.rangeBand());

  age.exit().transition().attr("width", 0).remove();

  var legend = svg.selectAll(".legend").data(
    statesData[0].ages.map(function (age) {
      return age.name;
    })
  );

  legend.enter().append("g");
  legend.attr("class", "legend").attr("transform", function (d, i) {
    return "translate(0," + (200 + i * 20) + ")";
  });

  var legendColor = legend.selectAll(".legend-color").data(function (d) {
    return [d];
  });
  legendColor.enter().append("rect");
  legendColor
    .attr("class", "legend-color")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  var legendText = legend.selectAll(".legend-text").data(function (d) {
    return [d];
  });

  legendText.enter().append("text");
  legendText
    .attr("class", "legend-text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function (d) {
      return d;
    });

  legend.exit().remove();
}
