class BrowserVis {
    constructor(svg_id, filter, options) {
        this.url = "book_data.csv";
        this.svg_id = svg_id;

        this.height = 500;
        this.width = 1200;
        
        if (filter == null) {
            this.loadAndPrepare();
        }
        else {
            this.loadFiltered(options);
        }

    }

    loadAndPrepare() {
        let thisvis = this;

        d3.csv(this.url, function(d) {
            
            return {
                // Convert text values to other types as needed.
                callnum: d.callnum,
                title: d.title,
                clean_height: d.clean_height,
                clean_length: d.clean_length,
                clean_date: d.clean_date,
                color: d.color,
                id: d.id,
                clean_author: d.clean_author,
                callnum_string: d.callnum_string,
                font_family: d.font_family,
                clean_title: d.clean_title
            }
        }).then(function(items) {
            
            thisvis.render(items,thisvis.width,thisvis.height,items,null,null);
        })
    }

    loadFiltered(options) {
        let thisvis = this;

        
        d3.csv(this.url, function(d) {
            
            return {
                // Convert text values to other types as needed.
                callnum: d.callnum,
                title: d.title,
                title2: d.title2,
                clean_height: d.clean_height,
                clean_length: d.clean_length,
                clean_date: d.clean_date,
                color: d.color,
                id: d.id,
                clean_author: d.clean_author,
                keyword_string: d.keyword_string,
                callnum_string: d.callnum_string,
                font_family: d.font_family,
                clean_title: d.clean_title
            }
        }).then(function(items) {
            
            let title = options.title;
            title = title.toLowerCase();
            let author = options.author;
            author = author.toLowerCase();

            let keyword = options.keyword;

            let filtered_items = [];

            if (keyword.length > 0) {
                keyword = keyword.replace(/\s+/g, '');
                keyword = keyword.toLowerCase();
                
                items.forEach(function(i){
                    var keyword_string = i.keyword_string;
                    if (keyword_string.includes(keyword)) {
                        filtered_items.push(i);
                    }
                })
            }
            
            else {
            if (title.length > 0 || author.length > 0) {
                items.forEach(function(i){
                    var item_title = i.title + i.title2;
                    var item_author = i.clean_author;
                    
                    item_title = item_title.toLowerCase();
                    if (item_title.includes(title) && item_author.includes(author)){
                        filtered_items.push(i);
                    }
                })
            }
            }

            //show all books if nothing search for
            let total_searched = options.author + options.title + options.keyword;
            if (total_searched.length == 0) {
                items.forEach(function(i){
                    filtered_items.push(i);
                })
            }

            let author_start = options.author_start;
            if (author_start.length > 0) {
                thisvis.render(filtered_items,thisvis.width,thisvis.height,items,author_start,null)
            }
            else {
                //only do call number start at if author field is empty <--could change this later
                let callnum_start = options.callnum_start;
                if (callnum_start.length > 0) {
                    let clean_callnum = callnum_start.replace(/[^\p{L}|^\p{N}]/gu,"");
                    clean_callnum = clean_callnum.toLowerCase();
                    thisvis.render(filtered_items,thisvis.width,thisvis.height,items,null,clean_callnum)
                }
                else {
                thisvis.render(filtered_items,thisvis.width,thisvis.height,items,null,null);
                }
            }

        })
    }

    render(data, width, height, total_data, author_start, clean_callnum) {
        console.log(data);
        d3.selectAll("#canvas").remove();
        
        //our book length per page constant in cm
        const pc = 0.0075
        
        let x, y;

        let x_start = 0;

        var thisData = null;

        thisData = data;

        //this adds an accumulated length for each item
        //this is the length of all books before and including the item's length
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

        //find the start position if start at function used
        if (author_start != null) {
            thisData.every(function(d) {
                //console.log(d['clean_author']);
                let author = d['clean_author'];
                if (author.includes(author_start)){
                    x_start = d['accum_length'] - d['clean_length'];
                    //console.log(x_start);
                    return false;
                }
                return true;
            })
        }
        else if (clean_callnum != null) {

            thisData.every(function(d) {
                let callnum_string = d['callnum_string'];
                if (callnum_string.includes(clean_callnum)){
                    x_start = d['accum_length'] - d['clean_length'];
                    return false;
                }
                return true;
            })

        }

        //copy the data to be used for Zoom
        //unsure if this is necessary
        let zoomData = thisData;
        //another copy of the data
        //unsure if this is necessary
        let moveData = thisData;

        //d3 select the div 
        let svg = d3.select("#"+this.svg_id);

        //padding for canvas
        var padding = {top:20,bottom:20,left:200,right:20};

        var canvasHeight = height -padding.top - padding.bottom;
        var canvasWidth = width -padding.left -padding.right;

        //add the canvas element to the svg
        var canvas = svg.append("g")
            .attr("id","canvas")
            .attr("width",canvasWidth)
            .attr("height",canvasHeight)
            .attr("transform","translate("+padding.left+","+padding.top+")")
        ;

        //maximum Y value for scale linear functions
        var maxY = d3.max(total_data,function(d){return +d.clean_height;});

        //this maps our x and y domains in cm to pixels
        x = d3.scaleLinear()
            .domain([0,45])
            .range([0,+canvas.attr("width")]);
        
        y = d3.scaleLinear()
            .domain([maxY*1.1,0])
            .range([0,+canvas.attr("height")]);


        //create a clip within the main svg where we dump our bookspines
        canvas.append("clipPath")
        .attr("id","clip")
        .append("rect")
        .attr("width",canvasWidth)
        .attr("height",canvasHeight);

        //Let's add some spines
        //our spines are rect svgs with class bar
        var barLines = canvas.selectAll("rect.bar")
            .data(thisData);
        //append link to the barLines for individual book view
        barLines.enter().append("a")
            .attr("href",function(d) {return "library_browser/bookview.html" + "?book_id=" +d.id;})
            .attr("id",function(d){return d.id;})
            .attr("onclick","get_hello(this.id);return false;")
            //now append the "spines"
            .append("rect")
            .attr("class","bar")
            .attr("clip-path","url(#clip)")
            .attr("x", function(d) {
                if (x_start == 0) {
                    if (zoomData.indexOf(d) == 0) {

                        return 0;
                    }
                    else{
                        return x((d.accum_length - d.clean_length)*pc);
                    }
                }
                else {
                    if (((d.accum_length - d.clean_length) - x_start) == 0 ){
                        return 0;
                    }
                    else {
                        return x(((d.accum_length - d.clean_length)- x_start)*pc);
                    }
                }
            })
            .attr("y",function(d){return y(d.clean_height)-100;})
            .attr("width",function(d) {return x(d.clean_length*(pc));})
            .attr("height",function(d){return (canvasHeight-y(d.clean_height))+100;})
            .attr("rx","5")
            .attr("callnum",function(d){return d.callnum;})
            .attr("booktitle",function(d){return d.title;})
            .style("fill", function(d){return d.color});
        
        //now time to add the title to the spines
        canvas.selectAll()
            .data(thisData)
            .enter()
            .append("a")
            .attr("clip-path","url(#clip)")
            .attr("href",function(d) {return "library_browser/bookview.html" + "?book_id=" +d.id;})
            .attr("id",function(d){return d.id;})
            .attr("onclick","get_hello(this.id);return false;")
            .append("text")
            .text(function(d) { 
                let title = d.clean_title;
                if ((y(d.clean_height) - y(title.length)) > ((canvasHeight-y(d.clean_height)) +100)){
                    title = title.slice(0,title.length/2) + "...";
                    return title
                } else {
                return d.clean_title; 
                }
            })
            .attr("x", function(d) {
                if (x_start == 0) {
                    if (zoomData.indexOf(d) == 0) {

                        return x(d.clean_length/2*pc);
                    }
                    else{
                        return x((d.accum_length - d.clean_length/2)*pc);
                    }
                }
                else {

                    if (((d.accum_length - d.clean_length) - x_start) == 0) {
                        return x(d.clean_length/2*pc);
                    }
                    else {
                        return x(((d.accum_length - d.clean_length/2) - x_start)*pc);
                    }
                }
            })
            .attr("y",function(d){return y(d.clean_height)-40;})
            .attr("font-size" , function(d) {
                if (d.clean_length > 100){
                    return "12px";
                }
                else {
                    return "6px";
                }
            })
            .attr("fill" , "white")
            .attr("font-family" ,function(d){return d.font_family},"sans-serif")
            .attr("transform",function(d) {
                if (x_start == 0) {
                    if (zoomData.indexOf(d) == 0) {

                        return "rotate(90,"+x(d.clean_length/2*pc)+","+(y(d.clean_height)-40)+")";
                    }
                    else{
                        return "rotate(90,"+x((d.accum_length - d.clean_length/2)*pc)+" ,"+(y(d.clean_height)-40)+")";
                    }
                }
                else{
                    if (((d.accum_length - d.clean_length) - x_start) == 0) {
                        return "rotate(90,"+x(d.clean_length/2*pc)+","+(y(d.clean_height)-40)+")";
                    }
                    else {
                        return "rotate(90,"+x((d.accum_length - d.clean_length/2 - x_start)*pc)+" ,"+(y(d.clean_height)-40)+")";
                    }
                }   
                
            });
        
        var acc = 0;

        //add the "buttons" to move items one at a time
        d3.selectAll("circle").remove();
        svg.append("rect")
            .attr("x",625)
            .attr("y",475)
            .attr("height",75)
            .attr("width",152)
            .attr("fill","#F8F0E3");
        
        //add arrows
        d3.selectAll("image.arrow").remove();
        d3.selectAll("rect.arrow-foward").remove();
        d3.selectAll("rect.arrow-backward").remove();
       
        svg.append("svg:image")
            .attr("class","arrow")
            .attr("x",719)
            .attr("y",500)
            .attr("width",40)
            .attr("height",25)
            .attr("xlink:href","assets/forward_arrow.png");
        
        svg.append("rect")
            .attr("class","arrow-forward")
            .attr("x",725)
            .attr("y",500)
            .attr("width",28)
            .attr("height",25)
            .style("fill", "transparent")
            .style("stroke", "black")
            .style("stroke-width", "4px")
            .on("click",function(){
                moveBooksForward(acc);
                d3.select("rect.arrow-backward").style("stroke","black")
                d3.select(this).style("stroke","yellow");
            });
            

        svg.append("svg:image")
            .attr("class","arrow")
            .attr("x",643)
            .attr("y",500)
            .attr("width",40)
            .attr("height",25)
            .attr("xlink:href","assets/back_arrow.png");
        
        svg.append("rect")
            .attr("class","arrow-backward")
            .attr("x",649)
            .attr("y",500)
            .attr("width",28)
            .attr("height",25)
            .style("fill", "transparent")
            .style("stroke", "black")
            .style("stroke-width", "4px")
            .on("click",function(){
                moveBooksBack(acc);
                d3.selectAll("rect.arrow-forward").style("stroke","black")
                d3.select(this).style("stroke","yellow");
            });

        
        //call number tracker boxes
        svg.append('rect')
            .attr('class','lccn_label')
            .attr('x',padding.left)
            .attr('y',475)
            .attr("height",75)
            .attr("width",170)
            .attr("rx",5)
            .attr("fill","#e3ebf8");
        
        svg.append('rect')
            .attr('class','lccn_label')
            .attr('x',padding.left + canvasWidth -150)
            .attr('y',475)
            .attr("height",75)
            .attr("width",170)
            .attr("rx",5)
            .attr("fill","#e3ebf8");
        
        svg.append('text')
            .attr('class','call_text')
            .attr('x',padding.left + 10)
            .attr('y',510)
            .text(call_text(thisData).begin)
            .attr('font','bold')
            .attr('font-size','14px');
        
        svg.append('text')
            .attr('class','call_text')
            .attr('x',padding.left + canvasWidth -140)
            .attr('y',510)
            .text(call_text(thisData).end)
            .attr('font','bold')
            .attr('font-size','14px');

        

        //function for addng text to callnumber trackers
        function call_text(data,acc) {
            
            let call_array = [];
            d3.selectAll("rect.bar").data(data).each(function(d,i) {
                if (d3.select(this).attr("x") >= 0 && d3.select(this).attr("x") <= 980) {
                    call_array.push(d3.select(this).attr("callnum"));
                }
                }) 

            let call_texts = {"begin":"","end":""};
            call_texts.begin = call_array[0];
            call_texts.end = call_array.pop();


            return call_texts;
        }

        
        //d3 zoom allows panning of items
        let zoom = d3.zoom().on("zoom",zoomMove);

        //null here disables mouse wheel zooming
        svg.call(zoom).on("wheel.zoom",null);
        d3.select("svg").on("dblclick.zoom",null);
        
        //pipe to decide which function to call
        function zoomMove (event) {
            //console.log(event.sourceEvent.movementX);
            if (event.sourceEvent.movementX > 0) {
                moveBooksBack(acc);
            }
            else if (event.sourceEvent.movementX < 0) {
                moveBooksForward(acc);
            }
        }


        //this function handles the bulk of moving the items one at a time
        function moveBooks(acc) {
            

            /**
             * for the future if there's a data selection of only 20 books or so,
             * we hit the last book on the right
             *if acc == len(moveData)-1: then you've only got one book to display
             */
            
            d3.select("#canvas").selectAll("rect.bar")
                .data(moveData)
                .attr("x", function(d) {
                    let i = thisData.indexOf(d);
                    // to access the total accum length of that have been pushed left of the canvas
                    let n = thisData[acc-1];
                    // to access the total accum length length of the book before current
                    let j = thisData[i-1];
                    if ( i < acc) {
                        if (i == 0){
                            
                            return -(x((n.accum_length)*pc));
                        }
                        else{
                            return -(x((n.accum_length - j.accum_length)*pc));
                        }
                    }
                    else{
                        if (i ==acc){
                            return 0;
                        }
                        else{
                            return x((j.accum_length - n.accum_length)*pc);
                        }
                    }
                })
                .attr("width",function(d) {return x(d.clean_length*(pc));})
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
                        
                        return -(x((n.accum_length - d.clean_length/2)*pc));
                    }
                    else{
                        return -(x((n.accum_length - j.accum_length)- d.clean_length/2)*pc);
                    }
                }
                else{
                    if (i ==acc){
                        return x(d.clean_length/2*pc);
                    }
                    else{
                        return x((j.accum_length - n.accum_length + d.clean_length/2)*pc);
                    }
                }
            })
            .attr("font-size" , function(d) {
                if (d.clean_length > 100){
                    return "12px";
                }
                else {
                    return "6px";
                }
            })
            .attr("fill" , "white")
            .attr("font-family" , function(d){return d.font_family},"sans-serif")
            .attr("transform",function(d) {
                let i = thisData.indexOf(d);
                // to access the total accum length of that have been pushed left
                let n = thisData[acc-1];
                // to access the total accum length length of the book before current
                let j = thisData[i-1];
                if ( i < acc) {
                    if (i == 0){
                        return "rotate(90,"+(-(x((n.accum_length - d.clean_length/2)*pc)))+","+(y(d.clean_height)-40)+")";
                    }
                    else{
                        return "rotate(90,"+(-(x((n.accum_length - j.accum_length)- d.clean_length/2)*pc))+","+(y(d.clean_height)-40)+")";
                    }
                }
                else{
                    if (i ==acc){
                        return "rotate(90,"+x(d.clean_length/2*pc)+","+(y(d.clean_height)-40)+")";
                    }
                    else{
                        return "rotate(90,"+x(((j.accum_length - n.accum_length) + d.clean_length/2)*pc)+","+(y(d.clean_height)-40)+")";
                    }
                }
                
            });

            d3.selectAll("text.call_text").remove();
            svg.append('text')
                .attr('class','call_text')
                .attr('x',padding.left + 10)
                .attr('y',510)
                .text(call_text(thisData).begin)
                .attr('font','bold')
                .attr('font-size','14px');
        
            svg.append('text')
                .attr('class','call_text')
                .attr('x',padding.left + canvasWidth -140)
                .attr('y',510)
                .text(call_text(thisData).end)
                .attr('font','bold')
                .attr('font-size','14px');

        }

        //handles the position of the items and sets the accumulator
        //for the move books function when moving books to the left (i.e. forward up the call number range)
        function moveBooksForward(acc) {

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
            
            acc +=1;

            moveBooks(acc);
            
        }

        //handles the position of the items and sets the accumulator
        //for the move books function when moving books to the right (i.e. walking left down a call number range)
        function moveBooksBack(acc) {

            let x_values = [];
            d3.selectAll("rect.bar").data(moveData).each(function(d,i) {

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
                        return x((d.accum_length - d.clean_length)*pc);
                    }
                });

                d3.select('#canvas').selectAll("text")
                .data(moveData)
                .attr("x", function(d) {
                    if (zoomData.indexOf(d) == 0) {
    
                        return x(d.clean_length/2*pc);
                    }
                    else{
                        return x((d.accum_length - d.clean_length/2)*pc);
                    }
                })
                .attr("transform",function(d) {
                    if (zoomData.indexOf(d) == 0) {
    
                        return "rotate(90,"+x(d.clean_length/2*pc)+","+(y(d.clean_height)-40)+")";
                    }
                    else{
                        return "rotate(90,"+x((d.accum_length - d.clean_length/2)*pc)+" ,"+(y(d.clean_height)-40)+")";
                    }
                    
                });
                
            }
            else {
                moveBooks(acc);
            }
                
        }


    }
}