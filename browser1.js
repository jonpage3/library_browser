class BrowserVis {
    constructor(svg_id) {
        this.url = "practice.csv";
        this.svg_id = svg_id;

        // Load the data and process it as needed.
        this.loadAndPrepare();
    }

    render(items) {
        let width = 1000
        let height = 400

        let svg = d3.select("#"+this.svg_id);


        // X axis
        let x = d3.scaleBand()
            .range([ 100, width +100])
            .domain(items.map(function(d) { return d.callno; }))
            .padding(0.05);
        svg.append("g")
            .attr("transform", "translate(0," + 300 + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        //Add Y axis
        let y = d3.scaleLinear()
            //this domain is where we put book height attr
            .domain([0, 400])
            .range([ 0, height]);
        //svg.append("g")
            //.call(d3.axisLeft(y));

        // Bars
        svg.selectAll("mybar")
            .data(items)
            .enter()
            .append("a")
            .attr("xlink:href","javascript:void(0);")
            .attr("onclick","get_hello();return false;")
            .append("rect")
            .attr("x", function(d) { return x(d.callno); })
            .attr("y", 0)
            .attr("width", x.bandwidth())
            .attr("height", height-100)
            .attr("fill", "#69b3a2");

        svg.selectAll("mybar")
            .data(items)
            .enter()
            .append("text")
            .text(function(d) { return d.title; })
            .attr("x", function(d) { return x(d.callno); })
            .attr("y",50)
            .attr("font-size" , "8px")
            .attr("fill" , "white")
            .attr("font-family" , "sans-serif")
            .attr("text-anchor", "middle")
            .attr("transform",function(d) {
                return "rotate(90,"+x(d.callno)+" ,75)"
            });


    }


    loadAndPrepare(){
        let thisvis = this;

        d3.csv(this.url, function(d) {
            return {
                // Convert text values to other types as needed.
                callno: d.callno,
                title: d.TITLE,
            }
        }).then(function(items) {
            thisvis.render(items);
        })
    }
}