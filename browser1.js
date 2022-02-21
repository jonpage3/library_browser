class BrowserVis {
    constructor(svg_id) {
        this.url = "practice.csv";
        this.svg_id = svg_id;

        // Load the data and process it as needed.
        this.loadAndPrepare();
    }

    render(items) {
        console.log(items);

        let svg = d3.select("#"+this.svg_id);

        // X axis
        let x = d3.scaleBand()
            .range([ 0, 1000 ])
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
            .domain([0, 400])
            .range([ 400, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Bars
        svg.selectAll("mybar")
            .data(items)
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.callno); })
            .attr("y", 0)
            .attr("width", x.bandwidth())
            .attr("height", 300)
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
                return "rotate(90,"+x(d.callno)+100+" ,75)"
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