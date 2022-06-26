/* Hyeon Hwaiting */
import * as d3 from "d3";
import { useEffect } from "react";



function embScale(embedding) {
	const xMax = d3.max(embedding.map(d => d[0]));
	const xMin = d3.min(embedding.map(d => d[0]));
	const yMax = d3.max(embedding.map(d => d[1]));
	const yMin = d3.min(embedding.map(d => d[1]));
	const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0.05, 0.95]);
	const yScale = d3.scaleLinear().domain([yMax, yMin]).range([0.05, 0.95]);
	return embedding.map((d) => {
		return [xScale(d[0]), yScale(d[1])];
	});
}


function LatentView(props) {

	// gather dataset
	const lv = require(`/public/json/${props.dataset}_lv.json`);
	let metric = null;
	const lv_emb = embScale(lv);

	const width = 270;
	const height = 270;


	useEffect(() => {
		if (metric === null) return;

		let canvas = document.getElementById('trust');
		let ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const trustColor = d3.scaleLinear()
			.domain([d3.min(metric.map(d => d["Trustworthiness"])), d3.max(metric.map(d => d["Trustworthiness"]))])
			.range(["white", "blue"])
		lv_emb.forEach((lve, i) => {
			ctx.beginPath();
			ctx.arc(lve[0] * width, lve[1] * height, 2, 0, 2 * Math.PI);
			const color = trustColor(metric[i]["Trustworthiness"]);
			ctx.fillStyle = color;
			ctx.fill();
		});

		canvas = document.getElementById('conti');
		ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const contiColor = d3.scaleLinear()
			.domain([d3.min(metric.map(d => d["Continuity"])), d3.max(metric.map(d => d["Continuity"]))])
			.range(["white", "red"])
		lv_emb.forEach((lve, i) => {
			ctx.beginPath();
			ctx.arc(lve[0] * width, lve[1] * height, 2, 0, 2 * Math.PI);
			const color = contiColor(metric[i]["Continuity"]);
			ctx.fillStyle = color;
			ctx.fill();
		});


	});

	try {
		metric = require(`/public/json/${props.dataset}_metric.json`);
	}
	catch {
		console.log("No dataset nameed" + props.dataset + "_metric.json");
		return (<div>No dataset</div>)
	}





	return (
		<div style={{ display: "flex" }}>
			<div>
				<div style={{ marginLeft: 10 }}>Trustworthiness</div>
				<canvas id="trust" width={width} height={height}></canvas>
			</div>
			<div>
				<div style={{ marginLeft: 10 }}>Continuity</div>
				<canvas id="conti" width={width} height={height}></canvas>
			</div>
			<div>
				{/* 여기 이제 method를 보여주는 vega를 넣으면 됨 */}
			</div>
		</div>
	);
}

export default LatentView;
