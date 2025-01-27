import React, { useEffect, useRef } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const ViolinPlot = ({ plotData, datamap, div_id}) => {

  useEffect(() => {
    if (!plotData) return;

    //let data_to_get;
    let vio_data;
    const root = am5.Root.new(div_id);
    if(datamap === 'pct_counts_mt'){
      // Extract pct_counts_mt values
      vio_data = Object.values(plotData).map(d => d.pct_counts_mt).sort((a, b) => a - b);
    } else if(datamap === 'total_counts'){
      vio_data = Object.values(plotData).map(d => d.total_counts).sort((a, b) => a - b);
    } else if(datamap === 'n_genes'){
      vio_data = Object.values(plotData).map(d => d.n_genes).sort((a, b) => a - b);
    }
    console.log('Data to get:', vio_data);
    // Calculate step size
    const minValue = Math.min(...vio_data);
    const maxValue = Math.max(...vio_data);
    const numberOfBins = Math.sqrt(vio_data.length);
    const stepSize = (maxValue - minValue) / numberOfBins;
    const steps=Math.floor(stepSize);
    console.log('Step Size:', stepSize, datamap)

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root)
    ]);
    
    // Source data
    let sourceData = {
      data_to_get: vio_data,
      
    };
    
    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelY: "panY",
        wheelX: "zoomX"
      })
    );
    
    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0,
      categoryField: "range",
      renderer: am5xy.AxisRendererY.new(root, {
        minGridDistance: 20
      }),
      tooltip: am5.Tooltip.new(root, {})
    }));
    
    let yRenderer = yAxis.get("renderer");

    yRenderer.labels.template.setAll({
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
    let combinedValues = [];
    Object.keys(sourceData).map(function(category) {
      console.log(category)
      combinedValues = combinedValues.concat(sourceData[category]);
    });
    yAxis.data.setAll(calculateData(combinedValues, steps));
    
    
    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    function createSeries(category) {
      let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        maxDeviation: 0,
        strictMinMax: true,
        extraMin: 0.05,
        extraMax: 0.05,
        renderer: am5xy.AxisRendererX.new(root, {})
      }));
      
      
      let xRenderer = xAxis.get("renderer");
      
      xRenderer.labels.template.setAll({
        forceHidden: true
      });
      
      let series = chart.series.push(am5xy.SmoothedYLineSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: "high",
        openValueXField: "low",
        categoryYField: "range",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "[bold]{count}[/]"
        })
      }));
      
      series.fills.template.setAll({
        fillOpacity: 1,
        visible: true
      });
      
      series.data.setAll(calculateData(sourceData[category], steps));
    
      xAxis.children.unshift(am5.Label.new(root, {
        text: datamap,
        textAlign: 'center',
        x: am5.percent(47),
        fill: am5.color(0xffffff),
        fontWeight: "500",
        background: am5.RoundedRectangle.new(root, {
          fill: series.get("fill")
        })
      }));
    }
    
    
    function calculateData(values, incrementSize) {
      values.sort(function(a, b) {
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
      });
      
      let increments = {};
    
      values.forEach(function(value) {
        // Determine the increment range
        let range = Math.floor(value / incrementSize) * incrementSize;
        let rangeLabel = `${range}`;
    
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
    
    createSeries("data_to_get");
    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      yAxis: yAxis
    }));
    cursor.lineX.set("visible", false);
    
    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(100, 1000);


  return () => {
    root.dispose();
  };
  }, [plotData, div_id]);

  return (
    <div className="flex bg-slate-100 justify-center w-full h-full">
      <div className="h-full w-full justify-center items-center border-4 rounded-sm p-4 mx-2 bg-white overflow-auto">
        <div id={div_id} style={{ width: "100%", height: "500px" }}></div>
      </div>
    </div>
  );
};

export default ViolinPlot;
