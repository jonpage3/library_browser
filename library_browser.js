class BrowserVis {
    constructor(svg_id) {
        this.url = "book_data.csv";
        this.svg_id = svg_id;

        this.height = 500;
        this.width = 1300;
        // Load the data and process it as needed.
        this.loadAndPrepare();

    }

    loadAndPrepare() {
        let thisvis = this;

        d3.csv(this.url, function(d) {
            //console.log(d)
            return {
                // Convert text values to other types as needed.
                callnum: d.callnum,
                title: d.title,
                clean_height: d.clean_height,
                clean_length: d.clean_length,
                clean_date: d.clean_date
            }
        }).then(function(items) {
            //console.log(items);
            thisvis.render(items,thisvis.width,thisvis.height);
        })
    }

    render(data,width,height) {

        let x, y, gX, gY, xAxis, yAxis;
        var idList = 1;
        var color = d3.scaleOrdinal(d3.schemeCategory10);
        var thisData = null;
        var line;
        var settings = {
            targets: [],
            detail: {
                type: null
            }
        };

        thisData = data;
        thisData.forEach(function(d){
            if (data.indexOf(d) == 0) {
                d['accum_length'] = parseInt(d['clean_length']);
            }
            else {
                let n = data.indexOf(d) - 1;
                d['accum_length'] = parseInt(d['clean_length']);
                d['accum_length'] += data[n]['accum_length'];
            }
        })
        console.log(thisData);
        let svg = d3.select("#"+this.svg_id);

        var limits = {maxY:null,minY:null,maxX:null,minX:null};
        var padding = {top:20,bottom:20,left:100,right:20};

        var canvasHeight = height -padding.top - padding.bottom;
        var canvasWidth = width -padding.left -padding.right;
        console.log(data);

        var eMaxY = d3.max(data,function(d){return +d.clean_height;});
        var eMinY = d3.min(data,function(d){return +d.clean_height;});
        var eMaxX = d3.max(thisData,function(d) {return +d.accum_length;});
        var eMinX = 0;
        console.log(eMaxY);
        console.log(eMinY);
        console.log(eMaxX);
        console.log(eMinX);

        //var dMaxX = data.map(function(d) { return d.callnum; });
        //console.log(dMaxX);

        if(limits.maxX == null){ limits.maxX = eMaxX;}
        else { if(eMaxX > limits.maxX){ limits.maxX = eMaxX;}}

        if(limits.minX == null){ limits.minX = eMinX;}
        else { if(eMinX < limits.minX){ limits.minX = eMinX;}}

        if(limits.maxY == null){limits.maxY = eMaxY;}
        else { if(eMaxY > limits.maxY){limits.maxY = eMaxY;}}

        if(limits.minY == null){limits.minY = eMinY;}
        else { if(eMinY < limits.minY){limits.minY = eMinY;}}

        settings.targets.forEach(function(d){
            if(limits.maxY < d.value){
                limits.maxY = d.value;
            }
            if(limits.minY > d.value){
                limits.minY = d.value;
            }
        });

        console.log(limits);

        var canvas = svg.append("g")
            .attr("id","canvas")
            .attr("width",canvasWidth)
            .attr("height",canvasHeight)
            .attr("transform","translate("+padding.left+","+padding.top+")")
        ;

        x = d3.scaleLinear()
            .domain([limits.minX,limits.maxX])
            .range([0,+canvas.attr("width")]);

        y = d3.scaleLinear()
            .domain([limits.maxY*1.1,limits.minY-(limits.minY*0.1)])
            .range([0,+canvas.attr("height")]);

        /*
        line = d3.line()
            .x(function(d) { return x(d.callnum); })
            .y(function(d) { return  y(d.clean_height); });
        */
        let zoom = d3.zoom().on("zoom",zoomed);

        xAxis = d3.axisBottom(x);
        yAxis = d3.axisLeft(y);
        /*
        canvas.selectAll(".targets")
            .data(settings.targets)
            .enter()
            .append("line")
            .classed("targets",true)
            .style("stroke",function(d){return d.color;})
            .style("stroke-width",1)
            .attr("x1",x(limits.minX))
            .attr("x2",x(limits.maxX))
            .attr("y1",function(d){return y(+d.value);})
            .attr("y2",function(d){return y(+d.value);});
        */
        var clip = canvas.append("clipPath")
            .attr("id","clip")
            .append("rect")
            .attr("width",canvasWidth)
            .attr("height",canvasHeight);

        gX = canvas.append("g")
            .attr("transform","translate(0,"+(+canvas.attr("height"))+")")
            .attr("class","axis axis--x")
            .call(xAxis);

        gY = canvas.append("g").attr("class","axis axis--y").call(yAxis);

        d3.selectAll(".axis--y > g.tick > line").attr("x2",canvasWidth).style("stroke","lightgrey");

        var barLines = canvas.selectAll("rect.bar")
            .data(thisData)
            .enter()
            .append("rect")
            .attr("class","bar")
            .attr("clip-path","url(#clip)")
            .attr("x", function(d) {
                if (data.indexOf(d) == 0) {

                    return 0;
                }
                else{
                    return x(d.accum_length - d.clean_length);
                }
            })
            .attr("y",function(d){return y(d.clean_height);})
            .attr("width",function(d) {return x(d.clean_length);})
            .attr("height",function(d){return canvasHeight-y(d.clean_height);})
            .style("fill","steelblue");

        svg.call(zoom);

        function zoomed (){
            gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
            var new_x = d3.event.transform.rescaleX(x);

            d3.select("#canvas").selectAll("rect.bar")
                .data(data)
                .attr("x", function(d) {
                    if (data.indexOf(d) == 0) {

                        //return new_x(d.clean_length/2);
                        return 0;
                    }
                    else{
                        return new_x(d.accum_length - (d.clean_length/2));
                    }
                })
                .attr("width",function(d) {return new_x(d.clean_length);});

        }
    }
}