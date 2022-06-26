import './App.css';
import * as d3 from "d3";

import { Box, Select } from 'grommet';
import {  VegaLite } from 'react-vega'

import embed from 'vega-embed';
import { useEffect, useRef, useState } from 'react';
import { Scatterplot } from "./components/scatterplot";
import LatentView from './components/latentView';



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

  const path = useRef([]);
  const rf = useRef([]);
  const lv = useRef([]);
  const cc = useRef([]);

  
  const [xxx, setDataset] = useState('spheres_2000_3');
  const selectedCluster = useRef(-1);
  let dataset = xxx.split('_')[0];
  const ss = {
    layer: [
      {
        data: { name: "lv"},
        width: '800',
        height: '800',
        mark: {type: 'circle', opacity: 0.5},
        encoding: {
          x: {"field": "x", type: "quantitative", "axis": {"grid": false, "labels": false, "tickSize": 0}, title: null },
          y: {"field": "y", type: "quantitative", "axis": {"grid": false, "labels": false, "tickSize": 0}, title: null },
          color: {"field": "cls", type: "nominal", legend: null},
      },
      },
      {
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
    }, 
    {
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
    },
    {
      data: { name: 'focus'},
      width: 800,
      height: 800,
      mark: {type: 'circle', opacity: .6, size: 300, color: 'white', stroke: 'black', strokeWidth:3},
        encoding: {
          x: {"field": "x", type: "quantitative", "axis": {"grid": false, "labels": false, "tickSize": 0}, title: null },
          y: {"field": "y", type: "quantitative", "axis": {"grid": false, "labels": false, "tickSize": 0}, title: null },
      },
    }
    ],
    datasets: {
      lv: [],
      cc: [],
      focus: []
    }

  }


  const mainViewRef = useRef(null);

  const labelData = require(`/public/json/${dataset}/label.json`);

  let mainViewSplot;
  
  
  useEffect(() => {

    (async function() {

      lv.current = require(`/public/json/${xxx}_lv.json`);
      rf.current = require(`/public/json/${xxx}_rf.json`);
      cc.current = require(`/public/json/${xxx}_cc.json`);
      path.current = require(`/public/json/${xxx}_path.json`);
      selectedCluster.current = cc.current[0].num;
      
      let cls = require(`/public/json/${xxx}_cls.json`);
      const ld = require(`/public/json/${dataset}/${cc.current[0].name}`);
      cc.current = cc.current.map(d => ({x:d.x, y:d.y, img: 'https://aeri206.github.io/mdp-tour/img/0.7/'+d.num.toString()+'.png', name: d.name, num: d.num}));
      
      ss['datasets']['lv'] = lv.current.map((d, i) => ({x: d[0], y:d[1], method: rf.current[i].split('-')[0], cls: cls[i]}));
      ss['datasets']['cc'] = cc.current;
      console.log(ss['datasets']['lv']);
      ss['datasets']['focus'] = [{x: cc.current[0].x, y: cc.current[0].y}];

      
      let labelColors = d3.scaleOrdinal(d3.schemeCategory10);
      const emb = embScale(ld.emb)
      const radius = 8;
      const colorData = labelData.map(idx => {
        const color = d3.rgb(labelColors(idx));
        // const color = d3.rgb(labelColors(3));
        
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
      console.log(result.view)
      


      result.view.addEventListener('click', (event, item) => {
        if (item) {
          if (item.image && item.datum){
            if (item.datum.num !== selectedCluster.current) {
              
              let newPath = path.current.filter(x => x.source === selectedCluster.current && x.target === item.datum.num)[0].path;
              let newLDs = [];
              console.log(newPath)
              newPath.slice(1).forEach(point => {
                let newLD = require(`/public/json/${dataset}/${rf.current[point]}`);
                let newEmb = embScale(newLD.emb);
                newLDs.push(newEmb);
              });

              
                (async function () {
                  for (let i = 0 ; i < newLDs.length ; ++i){
                    let focusData = result.view.data('focus')
                    result.view.change('focus', result.view.changeset().remove(focusData[0]).insert([{x: lv.current[newPath[i+1]][0], y: lv.current[newPath[i+1]][1]}])).run();

                      mainViewSplot.update({position: newLDs[i]}, 1000, 0);
                      await new Promise(resolve => {
                      setTimeout(() => { resolve()}, 1020);
                  });
                  }
              })();

              selectedCluster.current = item.datum.num;
                
                
            }
            

          }

        }

      })
      
    });

    

    
    
  }, [xxx]);
  



  return (
  <Box>
      <Select
      options={['spheres_2000_3', 'mnist_1000_1', 'mnist_1000_7',  'grid6_7776_5']}
      value={xxx}
      onChange={({ option }) => {setDataset(option); dataset = option.split('_')[0]}}
    />
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
    <Box className="latentView" style={{width: '800px', height: '800px',outline: '1px solid black'}}>
      <LatentView />
    </Box>
    </Box> 
  );
}

export default App;
