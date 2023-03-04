import * as d3 from "d3";

export default class Squiggle {

  constructor(opts) {
    // load in arguments from config object
    this.data = opts.data;
    this.element = opts.element;
    // get parent element and SVG
    const svg = this.element;
    this.plot = svg.append('g');
    this.thickness = opts.thickness;
    this.addLines();
  }

  addLines() {
    let lines =  this.plot.selectAll("path")
      .data(this.data);

    let drawLine = d3.line()
      .x(function(d) {
        //console.log(d);
        return d[0];
      })
      .y(function(d) {
        return d[1];
      });
    //.curve(d3.curveNatural);

    lines.enter().append("path")
      .attr("stroke", "black")
      .attr("stroke-width", this.thickness + "px")
      .attr("fill", "none")
      .merge(lines)
      .attr("d", function(d) {
        return drawLine(d)});
    lines.exit().remove();
  }

  setThickness(thickness) {
    this.thickness = thickness;
    this.plot.selectAll("path")
      .attr("stroke-width", this.thickness + "px");
  }

  setData(newData) {
    this.data = newData;
    this.addLines();
  }
}