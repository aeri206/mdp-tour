/* Hyeon Hwaiting */
import * as d3 from "d3";
import { useEffect, useRef } from "react";



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

	const width = 300;
	const height = 300;

	// useEffect for rendering trustworthiness / continuity scatterplot
	useEffect(() => {
		if (metric === null) return;

		let canvas = document.getElementById('trust');
		let ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const trustColor = d3.scaleSequential()
			.domain([d3.min(metric.map(d => d["Trustworthiness"])), d3.max(metric.map(d => d["Trustworthiness"]))])
			.interpolator(d3.interpolatePRGn);
		lv_emb.forEach((lve, i) => {
			ctx.beginPath();
			ctx.arc(lve[0] * width, lve[1] * height, 1.5, 0, 2 * Math.PI);
			const color = trustColor(metric[i]["Trustworthiness"]);
			ctx.fillStyle = color;
			ctx.fill();
		});

		canvas = document.getElementById('conti');
		ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const contiColor = d3.scaleSequential()
			.domain([d3.min(metric.map(d => d["Continuity"])), d3.max(metric.map(d => d["Continuity"]))])
			.interpolator(d3.interpolateRdBu);
		lv_emb.forEach((lve, i) => {
			ctx.beginPath();
			ctx.arc(lve[0] * width, lve[1] * height, 1.5, 0, 2 * Math.PI);
			const color = contiColor(metric[i]["Continuity"]);
			ctx.fillStyle = color;
			ctx.fill();
		});
	});

	// useEffect for rendering trustworthiness / continuity scatterplot legend
	useEffect(() => {
		if (metric === null) return;


		const legendWidth = 20;
		const legendCellHeight = 5;
		const legendHeight = 300;
		const legendMargin = 20;

		function drawLegend(id, color) {
			let canvas = document.getElementById(id);
			let ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.beginPath();
			for (let i = 0; i < 54; i++) {
				ctx.fillStyle = color(i / 54);
				ctx.fillRect(legendMargin, legendCellHeight * i + legendMargin, legendWidth, legendCellHeight);
			}
			ctx.fillStyle = 'black';
			ctx.font = '14px Arial';
			ctx.fillText("Bad", legendMargin + legendWidth + 5, legendMargin + legendCellHeight * 1.5);
			ctx.fillText("Good", legendMargin + legendWidth + 5, legendMargin + legendCellHeight * 54);
		}

		const trustColor = d3.scaleSequential()
			.domain([0, 1])
			.interpolator(d3.interpolatePRGn);

		drawLegend('trustLegend', trustColor);

		const contiColor = d3.scaleSequential()
			.domain([0, 1])
			.interpolator(d3.interpolateRdBu);

		drawLegend('contiLegend', contiColor);


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
			<div style={{ display: "flex" }}>
				<div>
					<div style={{ marginLeft: 10 }}>Trustworthiness</div>
					<canvas id="trust" width={width} height={height}></canvas>
				</div>
				<canvas width={100} height={height} id="trustLegend"></canvas>
			</div>
			<div style={{ display: "flex" }}>
				<div>
					<div style={{ marginLeft: 10 }}>Continuity</div>
					<canvas id="conti" width={width} height={height}></canvas>
				</div>
				<canvas width={100} height={height} id="contiLegend"></canvas>
			</div>
			<div>
			</div>
		</div>
	);
}

export default LatentView;
