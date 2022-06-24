import './App.css';
import * as d3 from "d3";

import { Box, Grid } from 'grommet';
import {  VegaLite } from 'react-vega'

import embed from 'vega-embed';
import { useEffect, useRef } from 'react';
import { Scatterplot } from "./components/scatterplot";


function embScale(embedding) {
	const xMax = d3.max(embedding.map(d => d[0]));
	const xMin = d3.min(embedding.map(d => d[0]));
	const yMax = d3.max(embedding.map(d => d[1]));
	const yMin = d3.min(embedding.map(d => d[1]));
	const xScale = d3.scaleLinear().domain([xMin, xMax]).range([-0.9, 0.9]);
	const yScale = d3.scaleLinear().domain([yMin, yMax]).range([-0.9, 0.9]);
	return embedding.map((d) => {
		return [xScale(d[0]), yScale(d[1])];
	});
}


function App() {

  
  const dataset = 'spheres'
  const ss = {
    layer: [
      {
        data: { name: "lv"},
        width: '800',
        height: '800',
        mark: {type: 'circle', opacity: 0.3},
        encoding: {
          x: {"field": "x", type: "quantitative", "axis": {"grid": false, "labels": false, "tickSize": 0}, title: null },
          y: {"field": "y", type: "quantitative", "axis": {"grid": false, "labels": false, "tickSize": 0}, title: null },
          color: {"field": "cls", type: "nominal", legend: null}
      },
      },{
        params: [
          {
            name: "highlight",
            select: {type: "point", on:"mouseover", fields: ["img"]}, value: false
          },
          
        ],
        data: { name: 'cc'},
        width: 800,
        height: 800,
        mark: {type: "image", width: 80, height: 80},
        encoding: {
          x: {field: "x", type: "quantitative"},
          y: {field: "y", type: "quantitative"},
          url: {field: "img", type: "nominal"},
          opacity: {condition: {param: "highlight", empty: false, value: 0}, value: 1}
    
        }
    }, {
      transform: [{filter: {param: "highlight"}}],
      data: { name: 'cc'},
      width: 800,
      height: 800,
      mark: {type: "image", width: 200, height: 200},
        encoding: {
          x: {field: "x", type: "quantitative"},
          y: {field: "y", type: "quantitative"},
          url: {field: "img", type: "nominal"},
          opacity: {condition: {param: "highlight", empty: false, value: 1}, value: 0}
    
        }


    }
    ],
    datasets: {
      lv: [],
      cc: []
    }

  }


  const mainViewRef = useRef(null);

  const labelData = require(`/public/json/${dataset}/label.json`);
  
  let mainViewSplot;
  

  useEffect(() => {

    (async function() {

      const opacity = ['0.7', '1.0'][0]

      const x = 's_2000_3'
      let lv = require(`/public/json/${x}_lv.json`);
      let rf = require(`/public/json/${x}_rf.json`);
      let cc = require(`/public/json/${x}_cc.json`);
      
      let cls = require(`/public/json/${x}_cls.json`);
      cc = cc.map(d => ({x:d.x, y:d.y, img: 'https://aeri206.github.io/mdp-tour/img/'+opacity+'/'+d.num.toString()+'.png', name: d.name}));
      // cc = cc.map(d => ({x:d.x, y:d.y, img: 'visualization.png'}))
      
      rf = rf.map(x => x.split('-')[0]);
      // s['data']['values'] = lv.map((d, i) => ({x: d[0], y:d[1], method: rf[i]}))
      ss['datasets']['lv'] = lv.map((d, i) => ({x: d[0], y:d[1], method: rf[i], cls: cls[i]}));
      ss['datasets']['cc'] = cc;

      const ld = require(`/public/json/${dataset}/${cc[0].name}`);
      let labelColors = d3.scaleOrdinal(d3.schemeCategory10);
      const emb = embScale(ld.emb)
      const radius = 8;
      const colorData = labelData.map(idx => {
        const color = d3.rgb(labelColors(idx));
        return [color.r, color.g, color.b];
      });
      
      const data = {
        position: emb,
        opacity: new Array(emb.length).fill(1),
        color: colorData,
        border: new Array(emb.length).fill(0),
        borderColor: colorData,
        radius: new Array(emb.length).fill(radius),
      }
      mainViewSplot = new Scatterplot(data, mainViewRef.current);
      
      return embed('#vis-mdp', ss, {"mode": "vega-lite", "actions": false});
    })().then(result => {

      result.view.addEventListener('mouseover', (event, item) => {
        if (item.image && item.datum){
          let newLD = require(`/public/json/${dataset}/${item.datum.name}`);
            let newEmb = embScale(newLD.emb);
            mainViewSplot.update({position: newEmb}, 500, 0);

        }

      })
      result.view.addEventListener('click', (event, item) => {
        
        if (item){
          if (item.image && item.datum){
            // let newLD = require(`/public/json/${dataset}/${item.datum.name}`);
            // let newEmb = embScale(newLD.emb);
            // mainViewSplot.update({position: newEmb}, 1000, 0);

          }
        }
      });
    });

    

    
    
  }, []);
  



  return (
    <Box className="app" style={{display: 'inline'}}>
      <Box id="vis-mdp" style={{display: 'inline-block'}} />
      <Box style={{width: '800px', height: '800px', display: 'inline-block', outline: '1px solid black'}}>
        <canvas
          ref={mainViewRef}
          width={800}
          height={800}
        ></canvas>
      </Box>
    </Box>  
  );
}

export default App;
