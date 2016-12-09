define( ["qlik", "css!./UselessBarchart.css","./js/d3.min", "./js/senseD3utils", "./js/senseUtils"],
	function ( qlik, template ) {
		"use strict";
		var initialized=false;
		return {
			template: template,
			initialProperties: {
				qHyperCubeDef: {
					qDimensions: [],
					qMeasures: [],
					qInitialDataFetch: [{
						qWidth: 2,
						qHeight: 50
					}]
				}
			},
			definition: {
				type: "items",
				component: "accordion",
				items: {
					dimensions: {
						uses: "dimensions",
						min: 1,
						max: 1
					},
					measures: {
						uses: "measures",
						min: 1,
						max: 1
					},
					sorting: {
						uses: "sorting"
					}
				}
			},
			support: {
				snapshot: false,
				export: false,
				exportData: false
			},
			paint: function ($element,layout) {
	            var self = this;
	            $('audio').trigger('pause');
	            $element.empty();
	            senseUtils.extendLayout(layout, self);
	            var html = "<div class='svgDiv' style='height:100%; width:100%;'></div>"
	            html+="<audio src='/extensions/UselessBarchart/resource/nyan.mp3' autoplay loop></audio>"
	            // html+="<img id='happyManHand' src='/extensions/UselessBarchart/resource/happyManHand.png'></img>"
	            html+="<div id='happyManHand'></div>"
	            html+="<img id='happyMan' src='/extensions/UselessBarchart/resource/happyMan.png'></img>"
	            $element.html(html);
	            viz($('.svgDiv'), layout, self);
	            $('.svgDiv').css('background-image', 'url(/extensions/UselessBarchart/resource/starrysky.gif)');
	            $element.mousedown(function(e) {
	            	var parentOffset = $element.offset(); 
					var x = e.pageX - parentOffset.left;
					var y = e.pageY - parentOffset.top;
	            	moveHand(x,y);
	            	$('#happyManHand').show();
	            	$('#happyMan').css('height','45%');
				});
	            $element.mouseup(function(event) {
	            	$('#happyManHand').hide();
	            	$('#happyMan').css('height','40%');
				});
			},
	        resize:function($el,layout){
		        this.paint($el,layout);
		    }
		};
	} );


function moveHand(x,y)
{
	// $('#happyMan')
	var hmLocation=$('#happyMan').position();
	var hmHeight=$('#happyMan').height();
	var hmWidth=$('#happyMan').width();
	var shoulderPosTop=hmLocation.top+hmHeight/1.4;
	var shoulderPosLeft=hmLocation.left+hmWidth/2.2;

	var a=shoulderPosTop-y;
	var b=shoulderPosLeft-x;
	var handLength=Math.sqrt(a*a+b*b);
	var handAngle=90+Math.acos(b/handLength)*57.3;

	// console.log(handLength);
	$('#happyManHand').css({
		'top':shoulderPosTop,
		'left':shoulderPosLeft-hmWidth/12,
		'height':handLength*1.01,
		'width':hmWidth/6,
		'-webkit-transform' : 'rotate(' + handAngle + 'deg)',
		'-moz-transform'    : 'rotate(' + handAngle + 'deg)',
		'-ms-transform'     : 'rotate(' + handAngle + 'deg)',
		'-o-transform'      : 'rotate(' + handAngle + 'deg)',
		'transform'         : 'rotate(' + handAngle + 'deg)'
	});
	// console.log(x+","+y);
}


var viz = function($element, layout, _this) {
	var id = senseUtils.setupContainer($element,layout,"d3vl_bar"),
		ext_width = $element.width(),
		ext_height = $element.height(),
		classDim = layout.qHyperCube.qDimensionInfo[0].qFallbackTitle.replace(/\s+/g, '-');

	var data = layout.qHyperCube.qDataPages[0].qMatrix;

	// D3 code
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	    width = ext_width - margin.left - margin.right,
	    height = ext_height - margin.top - margin.bottom;

	var x = d3.scale.ordinal();

	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .ticks(10);

	var svg = d3.select("#" + id).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom);

	width = ext_width - margin.left - margin.right;
	x.rangeRoundBands([0, width], .1);

	var plot = svg.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	x.domain(data.map(function(d) { return d.dim(1).qText; }));
	y.domain([0, d3.max(data, function(d) { return d.measure(1).qNum; })]);

	plot.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	plot.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text(senseUtils.getMeasureLabel(1,layout));

	plot.selectAll(".bar")
	      .data(data)
	    .enter().append("svg:image")
	      .attr("xlink:href", "/extensions/UselessBarchart/resource/neon3.gif")
	      .attr("preserveAspectRatio","none")
	      .attr("class", "bar "+ classDim)
	      .attr("id", function(d) { return d.dim(1).qText; })
	      .attr("x", function(d) { return x(d.dim(1).qText); })
	      .attr("width", x.rangeBand())
	      .attr("y", function(d) { return y(d.measure(1).qNum); })
	      .attr("height", function(d) { return height - y(d.measure(1).qNum); })
	      .on("click",function(d) {
	      	return d.dim(1).qSelect();
	      })
	      .on("mouseover", function(d){
			var id = d.dim(1).qText;
	      	d3.selectAll($("."+classDim+"[id='"+d.dim(1).qText+"']")).classed("highlight",true);
	      	d3.selectAll($("."+classDim+"[id!='"+d.dim(1).qText+"']")).classed("dim",true);
	      })
	      .on("mouseout", function(d){
	      	d3.selectAll($("."+classDim+"[id='"+d.dim(1).qText+"']")).classed("highlight",false);
	      	d3.selectAll($("."+classDim+"[id!='"+d.dim(1).qText+"']")).classed("dim",false);
	      });
	
};
