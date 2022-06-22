import './App.css';
import { Box, Grid } from 'grommet';
import {  VegaLite } from 'react-vega'

import embed from 'vega-embed';
import { useEffect } from 'react';



function App() {


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
  
  

  useEffect(() => {

    (async function() {

      const opacity = ['0.7', '1.0'][1]

      const x = 's_2000_3'
      let lv = require(`/public/json/${x}_lv.json`);
      let rf = require(`/public/json/${x}_rf.json`);
      let cc = require(`/public/json/${x}_cc.json`);
      let cls = require(`/public/json/${x}_cls.json`);
      cc = cc.map(d => ({x:d.x, y:d.y, img: 'https://aeri206.github.io/mdp-tour/img/'+opacity+'/'+d.num.toString()+'.png'}));
      // cc = cc.map(d => ({x:d.x, y:d.y, img: 'visualization.png'}))
      
      rf = rf.map(x => x.split('-')[0]);
      // s['data']['values'] = lv.map((d, i) => ({x: d[0], y:d[1], method: rf[i]}))
      ss['datasets']['lv'] = lv.map((d, i) => ({x: d[0], y:d[1], method: rf[i], cls: cls[i]}));
      ss['datasets']['cc'] = cc;
      
      return embed('#vis-mdp', ss, {"mode": "vega-lite", "actions": false});
    })().then(result => {
      console.log(result)
      result.view.addEventListener('click', (event, item) => {
        
        if (item){
          if (item.image){

          }
        }
      });
    });
    
  }, []);
  



  return (
    <Box className="app">
      <Box id="vis-mdp" />
      <Box>
        
      </Box>
    </Box>  
  );
}

export default App;
