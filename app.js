

// Method to get the x-scale
function getScaleX() {
      // Display space for x-axis
    return d3.scaleLinear()
        .domain([2021, 2023])  // Data space for x-axis
        .range([50, 600]);
}

// Method to get the y-scale
function getScaleY() {
    // Display space for y-axis (inverted for y-axis)
    return d3.scaleLinear()
        .domain([5, 1])  // Data space for y-axis
        .range([460, 10]);
}

// Method to create and append axes using D3
function axesWithD3(svgSelector, titleText, xAxisName, yAxisName) {
    // Retrieve scales
    var scaleX = getScaleX();
    var scaleY = getScaleY();

    // Create x-axis and y-axis components
    var xAxis = d3.axisBottom(scaleX)
        .tickValues([2021, 2022, 2023])
        .tickFormat(d3.format("d"));
    var yAxis = d3.axisLeft(scaleY);

    // Select the SVG container
    var svg = d3.select(svgSelector);

    // Append the x-axis at the bottom of the SVG
    var gX = svg.append("g")
        .attr("transform", 'translate(0,460)')  // Move to the bottom
        .call(xAxis)
        .call(g => g.append("text")  // Append a text label to the y-axis
            .attr("x", 324)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("font-family", "Times New Roman")
            .attr("font-size", "14px")
            .attr("fill", "black")
            .text(xAxisName));

    // Append the y-axis on the left side of the SVG
    var gY = svg.append("g")
        .attr("transform", 'translate(50,0)')  // Left side
        .call(yAxis)
        .call(g => g.append("text")  // Append a text label to the y-axis
            .attr("x", -235)
            .attr("y", -30)
            .attr("text-anchor", "middle")
            .attr("font-family", "Times New Roman")
            .attr("font-size", "14px")
            .attr("transform", "rotate(-90)")
            .attr("fill", "black")
            .text(yAxisName));

    // Append a title at the top of each SVG
    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", 350) // Centered in the middle of the SVG (adjust as needed)
        .attr("y", 30)  // Positioned at the top of the SVG (adjust as needed)
        .attr("text-anchor", "middle")
        .style("font-family", "Times New Roman")  // Set the font to Times New Roman
        .style("font-size", "20px")  // Optional: Adjust the font size as needed
        .text(titleText);  // Use the titleText parameter for the title

}

function main() {
    axesWithD3('#svg1', 'Template 1', 'Jahr', 'Durchschnittsnote');
    loadData().then(function(averagesByYear) {
        console.log(averagesByYear)
        plotAverages('#svg1', averagesByYear);
    });
}

function loadData() {
    var csvFilePath = 'DesignuebungGradingData.csv';

    // Return the promise to the caller
    return d3.csv(csvFilePath, function(d) {
        return {
            Year: +d.Year,
            Grade: +d.Grade
        };
    }).then(function(data) {
        // Organize data by year
        var gradesByYear = {};
        data.forEach(function(d) {
            if (!gradesByYear[d.Year]) {
                gradesByYear[d.Year] = { totalGrade: 0, count: 0 };
            }
            gradesByYear[d.Year].totalGrade += d.Grade;
            gradesByYear[d.Year].count += 1;
        });

        // Calculate average grade for each year
        var averagesByYear = {};
        for (var year in gradesByYear) {
            if (gradesByYear.hasOwnProperty(year)) {
                var totalGrade = gradesByYear[year].totalGrade;
                var count = gradesByYear[year].count;
                averagesByYear[year] = totalGrade / count;
            }
        }
        // Resolve the promise with the averagesByYear
        return averagesByYear;
    });
}

function plotAverages(svgSelector, averagesByYear) {
    // Retrieve scales
    var scaleX = getScaleX();
    var scaleY = getScaleY();

    // Convert averagesByYear to an array of {year, avgGrade} objects and sort by year
    var averagesArray = Object.entries(averagesByYear).map(([Year, Grade]) => ({Year: +Year, Grade}));
    averagesArray.sort((a, b) => a.Year - b.Year);

    // Select the SVG container
    var svg = d3.select(svgSelector);

    // Create a line generator
    var line = d3.line()
        .x(d => scaleX(d.Year))  // Set the x-coordinate for the line as the year
        .y(d => scaleY(d.Grade)); // Set the y-coordinate for the line as the average grade

    // Append the path to the SVG
    svg.append("path")
        .datum(averagesArray)  // Bind the data to the path
        .attr("fill", "none")
        .attr("stroke", "blue")  // Line color
        .attr("stroke-width", 2)  // Line width
        .attr("d", line);  // Use the line generator to create the "d" attribute

    // Plot each average grade for each year as a circle
    svg.selectAll("circle")
        .data(averagesArray)
        .enter()
        .append("circle")  // Add a circle for each point
        .attr("cx", d => scaleX(d.Year))      // Position based on the year
        .attr("cy", d => scaleY(d.Grade))   // Position based on the average grade
        .attr("r", 5)                   // Radius of the circle
        .attr("fill", "blue");           // Color of the circle (now blue)
}

main();
