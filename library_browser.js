class BrowserVis {
    constructor(svg_id) {
        this.url = "book_data.csv";
        this.svg_id = svg_id;

        this.height = 500;
        this.width = 1200;
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
        thisData.forEach(function(d){
            d['id'] = data.indexOf(d)
        })
        //console.log(thisData);
        let zoomData = thisData;
        //console.log(thisData);
        let svg = d3.select("#"+this.svg_id);

        var limits = {maxY:null,minY:null,maxX:null,minX:null};
        var padding = {top:20,bottom:20,left:200,right:20};

        var canvasHeight = height -padding.top - padding.bottom;
        var canvasWidth = width -padding.left -padding.right;

        var eMaxY = d3.max(data,function(d){return +d.clean_height;});
        var eMinY = d3.min(data,function(d){return +d.clean_height;});
        var eMaxX = d3.max(thisData,function(d) {return +d.accum_length;});
        var eMinX = 0;
        //console.log(eMaxY);
        //console.log(eMinY);
        //console.log(eMaxX);
        //console.log(eMinX);

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

        //console.log(limits);

        var canvas = svg.append("g")
            .attr("id","canvas")
            .attr("width",canvasWidth)
            .attr("height",canvasHeight)
            .attr("transform","translate("+padding.left+","+padding.top+")")
        ;

        x = d3.scaleLinear()
            .domain([limits.minX,40])
            .range([0,+canvas.attr("width")]);
        //console.log(x);
        y = d3.scaleLinear()
            .domain([limits.maxY*1.1,0])
            .range([0,+canvas.attr("height")]);

        /*
        line = d3.line()
            .x(function(d) { return x(d.callnum); })
            .y(function(d) { return  y(d.clean_height); });
        */
        //let zoom = d3.zoom().on("zoom",zoomed);

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
            .attr("class","axis axis--x");
            //.call(xAxis);

        gY = canvas.append("g").attr("class","axis axis--y");//.call(yAxis);

        d3.selectAll(".axis--y > g.tick > line").attr("x2",canvasWidth).style("stroke","lightgrey");

        // Adapted from http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
        // http://bl.ocks.org/jdarling/06019d16cb5fd6795edf
        var randomColor = (function(){
        var golden_ratio_conjugate = 0.618033988749895;
        var h = Math.random();
  
        var hslToRgb = function (h, s, l){
        var r, g, b;
  
        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
  
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
  
        return '#'+Math.round(r * 255).toString(16)+Math.round(g * 255).toString(16)+Math.round(b * 255).toString(16);
    };
    
    return function(){
      h += golden_ratio_conjugate;
      h %= 1;
      return hslToRgb(h, 0.5, 0.60);
    };
  })();

    thisData.forEach(function(d){var color = randomColor; d["color"] = color();});
    //console.log(thisData);
    
    let moveData = thisData;

    //Let's add some spines
        var barLines = canvas.selectAll("rect.bar")
            .data(thisData)
            .enter()
            .append("a")
            .attr("xlink:href","javascript:void(0);")
            .attr("onclick","get_hello();return false;")
            .attr("data-id",function(d){return zoomData.indexOf(d);})
            .append("rect")
            .attr("class","bar")
            .attr("clip-path","url(#clip)")
            .attr("x", function(d) {
                if (zoomData.indexOf(d) == 0) {

                    return 0;
                }
                else{
                    return x((d.accum_length - d.clean_length)*.0075);
                }
            })
            .attr("y",function(d){return y(d.clean_height)-100;})
            .attr("width",function(d) {return x(d.clean_length*(.0075));})
            .attr("height",function(d){return (canvasHeight-y(d.clean_height))+100;})
            .attr("id",function(d){return zoomData.indexOf(d);})
            .attr("callnum",function(d){return d.callnum;})
            .attr("booktitle",function(d){return d.title;})
            .style("fill", function(d){return d.color});
        

        //now time to add the title to the spines
         
        var titles = canvas.selectAll("mybar")
            .data(thisData)
            .enter()
            .append("a")
            .attr("xlink:href","javascript:void(0);")
            .attr("onclick","get_hello();return false;")
            .attr("id",function(d){return zoomData.indexOf(d);})
            .append("text")
            .text(function(d) { return d.title; })
            .attr("x", function(d) {
                if (zoomData.indexOf(d) == 0) {

                    return x(d.clean_length/2*.0075);
                }
                else{
                    return x((d.accum_length - d.clean_length/2)*.0075);
                }
            })
            .attr("y",function(d){return y(d.clean_height)-40;})
            .attr("font-size" , "12px")
            .attr("fill" , "white")
            .attr("font-family" , "sans-serif")
            //.attr("text-anchor", "middle")
            .attr("transform",function(d) {
                if (zoomData.indexOf(d) == 0) {

                    return "rotate(90,"+x(d.clean_length/2*.0075)+","+(y(d.clean_height)-40)+")";
                }
                else{
                    return "rotate(90,"+x((d.accum_length - d.clean_length/2)*.0075)+" ,"+(y(d.clean_height)-40)+")";
                }
                
            });

        let acc = 0;
        
        var button = svg.append("circle")
            .attr("cx",100)
            .attr("cy",500)
            .attr("r",9)
            .style("fill","green")
            .on("click",moveBooksForward);

        var button_reverse = svg.append('circle')
            .attr("cx",100)
            .attr("cy",600)
            .attr("r",9)
            .style("fill","red")
            .on("click",moveBooksBack);
            
            


        let zoom = d3.zoom().on("zoom",zoomed);

        //null here disables mouse wheel zooming
        svg.call(zoom).on("wheel.zoom",null);
        



        function zoomed (event){
            //console.log("hello world!");
            //console.log(x);
            //console.log(xAxis);
            //gX.call(xAxis.scale(event.transform.rescaleX(x)));
            var new_x = event.transform.rescaleX(x);

            d3.select("#canvas").selectAll("rect.bar")
                .data(thisData)
                .attr("x", function(d) {
                    if (data.indexOf(d) == 0) {

                        //return new_x(d.clean_length/2);
                        return new_x(0);
                    }
                    else{
                        return new_x((d.accum_length - (d.clean_length))*.0075);
                    }
                })
                .attr("width",function(d) {return x(d.clean_length*(.0075));})
                .attr("id",function(d){return zoomData.indexOf(d);})
                .attr("callnum",function(d){return d.callnum;})
                .attr("booktitle",function(d){return d.title;})
                .style("fill", function(d){return d.color});
            
            d3.select('#canvas').selectAll("text")
                .data(thisData)
                .attr("x", function(d) {
                    if (data.indexOf(d) == 0) {
    
                        return new_x(d.clean_length/2*.0075);
                    }
                    else{
                        return new_x((d.accum_length - d.clean_length/2)*.0075);
                    }
                })
                .attr("font-size" , "12px")
                .attr("fill" , "white")
                .attr("font-family" , "sans-serif")
                .attr("transform",function(d) {
                    if (data.indexOf(d) == 0) {
    
                        return "rotate(90,"+new_x(d.clean_length/2*.0075)+","+(y(d.clean_height)-40)+")";
                    }
                    else{
                        return "rotate(90,"+new_x((d.accum_length - d.clean_length/2)*.0075)+" ,"+(y(d.clean_height)-40)+")";
                    }
                    
                });

        }


        function moveBooks() {
            console.log(acc);
            /**
             * need some functionaliy to figure out if the user has used the Zoom feature
             * 
             */
            /*
            //the following kind of works but needs to be made to do 
            //different things depending on if move forward or move back are called 
            let x_values = [];
            d3.selectAll("rect.bar").data(moveData).each(function(d,i) {
                //console.log("The x position of the rect #" + d.id + " is " + d3.select(this).attr("x"))
                x_values.push(d3.select(this).attr("x"))
                }) 
            
            for (let i=0;i<x_values.length;i++){
                if (x_values[i] == 0) {
                    acc = i;
                    break;
                }
                else if (x_values[i] > 0) {
                    acc = i-1;
                }
            }
            */
            //acc+=1;

            /**
             * for the future if there's a data selection of only 20 books or so,
             * we hit the last book on the right
             *if acc == len(moveData)-1: then you've only got one book to display
             */
            
            d3.select("#canvas").selectAll("rect.bar")
                .data(moveData)
                .attr("x", function(d) {
                    let i = thisData.indexOf(d);
                    // to access the total accum length of that have been pushed left
                    let n = thisData[acc-1];
                    // to access the total accum length length of the book before current
                    let j = thisData[i-1];
                    if ( i < acc) {
                        if (i == 0){
                            
                            return -(x((n.accum_length)*.0075));
                        }
                        else{
                            return -(x((n.accum_length - j.accum_length))*.0075);
                        }
                    }
                    else{
                        if (i ==acc){
                            return 0;
                        }
                        else{
                            return x((j.accum_length - n.accum_length)*.0075);
                        }
                    }
                })
                .attr("width",function(d) {return x(d.clean_length*(.0075));})
                .attr("id",function(d){return zoomData.indexOf(d);})
                .attr("callnum",function(d){return d.callnum;})
                .attr("booktitle",function(d){return d.title;})
                .style("fill", function(d){return d.color});

            //now move the text 
            d3.select('#canvas').selectAll("text")
            .data(moveData)
            .attr("x", function(d) {
                let i = thisData.indexOf(d);
                // to access the total accum length of that have been pushed left
                let n = thisData[acc-1];
                // to access the total accum length length of the book before current
                let j = thisData[i-1];
                if ( i < acc) {
                    if (i == 0){
                        
                        return -(x((n.accum_length - d.clean_length/2)*.0075));
                    }
                    else{
                        return -(x((n.accum_length - j.accum_length)- d.clean_length/2)*.0075);
                    }
                }
                else{
                    if (i ==acc){
                        return x(d.clean_length/2*.0075);
                    }
                    else{
                        return x((j.accum_length - n.accum_length + d.clean_length/2)*.0075);
                    }
                }
            })
            .attr("font-size" , "12px")
            .attr("fill" , "white")
            .attr("font-family" , "sans-serif")
            .attr("transform",function(d) {
                let i = thisData.indexOf(d);
                // to access the total accum length of that have been pushed left
                let n = thisData[acc-1];
                // to access the total accum length length of the book before current
                let j = thisData[i-1];
                if ( i < acc) {
                    if (i == 0){
                        return "rotate(90,"+(-(x((n.accum_length - d.clean_length/2)*.0075)))+","+(y(d.clean_height)-40)+")";
                    }
                    else{
                        return "rotate(90,"+(-(x((n.accum_length - j.accum_length)- d.clean_length/2)*.0075))+","+(y(d.clean_height)-40)+")";
                    }
                }
                else{
                    if (i ==acc){
                        return "rotate(90,"+x(d.clean_length/2*.0075)+","+(y(d.clean_height)-40)+")";
                    }
                    else{
                        return "rotate(90,"+x(((j.accum_length - n.accum_length) + d.clean_length/2)*.0075)+","+(y(d.clean_height)-40)+")";
                    }
                }
                
            });
        }
        
        function moveBooksForward() {
            let x_values = [];
            d3.selectAll("rect.bar").data(moveData).each(function(d,i) {
                //console.log("The x position of the rect #" + d.id + " is " + d3.select(this).attr("x"))
                x_values.push(d3.select(this).attr("x"))
                }) 
            
            for (let i=0;i<x_values.length;i++){
                if (x_values[i] == 0) {
                    acc = i;
                    break;
                }
                else if (x_values[i] > 0) {
                    acc = i-1;
                    break
                }
            }
            console.log(x_values);
            console.log(acc);
            acc +=1;
            console.log(acc);
            moveBooks();
            
        }


        function moveBooksBack() {
            let x_values = [];
            d3.selectAll("rect.bar").data(moveData).each(function(d,i) {
                //console.log("The x position of the rect #" + d.id + " is " + d3.select(this).attr("x"))
                x_values.push(d3.select(this).attr("x"))
                }) 
            
            for (let i=0;i<x_values.length;i++){
                if (x_values[i] == 0) {
                    acc = i;
                    break;
                }
                else if (x_values[i] > 0) {
                    acc = i-1;
                    break
                }
            }
            acc -= 1;
            console.log(x_values);
            console.log(acc);
            if (acc < 0){
                acc = 0;
                throw "You're at the beginning of this section of the stacks!";
                
            }
            else if(acc ==0) {

                d3.select("#canvas").selectAll("rect.bar")
                .data(moveData)
                .attr("x", function(d) {
                    if (zoomData.indexOf(d) == 0) {
    
                        return 0;
                    }
                    else{
                        return x((d.accum_length - d.clean_length)*.0075);
                    }
                });

                d3.select('#canvas').selectAll("text")
                .data(moveData)
                .attr("x", function(d) {
                    if (zoomData.indexOf(d) == 0) {
    
                        return x(d.clean_length/2*.0075);
                    }
                    else{
                        return x((d.accum_length - d.clean_length/2)*.0075);
                    }
                })
                .attr("transform",function(d) {
                    if (zoomData.indexOf(d) == 0) {
    
                        return "rotate(90,"+x(d.clean_length/2*.0075)+","+(y(d.clean_height)-40)+")";
                    }
                    else{
                        return "rotate(90,"+x((d.accum_length - d.clean_length/2)*.0075)+" ,"+(y(d.clean_height)-40)+")";
                    }
                    
                });
                
            }
            else {
                moveBooks();
            }
                
            }         
        }
    
    
   
}