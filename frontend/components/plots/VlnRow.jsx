import React, { useEffect, useRef } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const VlnRow = ({ row_data, datamap, div_id}) => {

useEffect(() => {
    if (!row_data) return;


    const root = am5.Root.new(div_id);

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root)
    ]);
    
    // Source data
    let sourceData = row_data;
    console.log(sourceData)
    
    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(
        am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelY: "panY",
        wheelX: "zoomX"
        })
    );
    // make x axes stack
    chart.bottomAxesContainer.set("layout", root.horizontalLayout);
    
    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
        maxDeviation: 0,
        categoryField: "range",
        renderer: am5xy.AxisRendererY.new(root, {
        minGridDistance: 20
        }),
        tooltip: am5.Tooltip.new(root, {})
    }));
    
    yAxis.children.unshift(am5.Label.new(root, {
        text: div_id,
        textAlign: 'center',
        y: am5.p50,
        rotation: -90,
        fontWeight: 'bold'
      }));
    var yRenderer = yAxis.get("renderer");

    yRenderer.labels.template.setAll({
        rotation: -45,
        location: 0.5,
        multiLocation: 0.5,
        centerX: am5.p100,
        centerY: am5.p50,
      });
    
      yRenderer.grid.template.setAll({
        location: 0.5,
        multiLocation: 0.5
      });
    
    // Set categories
    var combinedValues = [];
    Object.keys(sourceData).map(function(category) {
    combinedValues = combinedValues.concat(sourceData[category]);
    });
    console.log(combinedValues, 'COMB')

    // Calculate step size
    const minValue = Math.min(...combinedValues);
    const maxValue = Math.max(...combinedValues);
    const numberOfBins = Math.sqrt(combinedValues.length);
    const stepSize = (maxValue - minValue) / numberOfBins;
    console.log('Step Size:', stepSize, datamap)

    yAxis.data.setAll(calculateData(combinedValues, stepSize));
    
    
    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    function createSeries(category) {
        var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        maxDeviation: 0,
        strictMinMax: true,
        extraMin: 0.05,
        extraMax: 0.05,
        renderer: am5xy.AxisRendererX.new(root, {})
        }));
      
      
        var xRenderer = xAxis.get("renderer");
      
        xRenderer.labels.template.setAll({
            forceHidden: true
        });
      
        var series = chart.series.push(am5xy.SmoothedYLineSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: "high",
        openValueXField: "low",
        categoryYField: "range",
        tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: "{categoryX}: [bold]{count}[/]"
        })
        }));
      
        series.fills.template.setAll({
            fillOpacity: 1,
            visible: true
        });
        
        console.log('CAT', category, sourceData[category])

        // Calculate step size
        const minValue = Math.min(...sourceData[category]);
        const maxValue = Math.max(...sourceData[category]);
        const numberOfBins = Math.sqrt(sourceData[category].length);
        const stepSize = (maxValue - minValue) / numberOfBins;
        console.log('Step Size:', stepSize, datamap)

        series.data.setAll(calculateData(sourceData[category], stepSize));
    
        xAxis.children.unshift(am5.Label.new(root, {
            text: category,
            x: am5.p50,
            fill: am5.color(0xffffff),
            fontWeight: "500",
            background: am5.RoundedRectangle.new(root, {
              fill: series.get("fill")
            })
        }));
    }
    
    
    function calculateData(values, incrementSize) {
        console.log('VLAUES', values)
        if (Array.isArray(values)) {
          values.sort(function(a, b) {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
          });
        } else {
          console.error('Values is not an array:', values);
        }
      
        var increments = {};
    
        values.forEach(function(value) {
            // Determine the increment range
            var range = Math.floor(value / incrementSize) * incrementSize;
            var rangeLabel = `${(Math.round(range * 10) / 10).toFixed(1)}`;
        
            // Increment the count for this range
            if (increments[rangeLabel]) {
              increments[rangeLabel]++;
            } else {
              increments[rangeLabel] = 1;
            }
        });
    
        // Convert the increments object into an array of objects
        return Object.keys(increments).map(range => ({
            range: range,
            low: increments[range] / -2,
            high: increments[range] / 2,
            count: increments[range]
        }));
    }
    
    Object.keys(sourceData).forEach(category => {
        createSeries(category);
    });
    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
        yAxis: yAxis
    }));
    cursor.lineX.set("visible", false);
    
    
    
    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(100, 1000);


  return () => {
    root.dispose();
  };
  }, [row_data, div_id]);

  return (
    <div className="flex bg-slate-100 justify-center w-full h-full">
      <div className="h-full w-2/3 justify-center items-center border-4 rounded-sm p-4 mx-2 bg-white overflow-auto">
        <div id={div_id} style={{ width: "100%", height: "500px" }}></div>
      </div>
    </div>
  );
};

export default VlnRow;
