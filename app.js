//Skizze 1
const two1 = new Two({width: 1100, height: 1200}).appendTo(document.getElementById('svg1'));


function loadData(variables) {
    const csvFilePath = 'DesignuebungGradingData.csv';
    return d3.csv(csvFilePath, function (d) {
        let selectedData = {};
        variables.forEach(varName => {
            if (d.hasOwnProperty(varName)) {
                switch (varName) {

                    case 'Grade':
                        selectedData['Status'] = d[varName] === '5' ? 'Fail' : 'Pass';
                        break;
                    case 'Year':
                    case 'Attemptnumber':
                        selectedData[varName] = +d[varName];
                        break;

                    case 'Time to complete exam':
                        selectedData['min2com'] = +d[varName];
                        break;

                    case 'Nachklausur':
                        selectedData[varName] = d[varName] === 'yes';
                        break;

                    case 'Course':
                        selectedData['isVis'] = d[varName] === 'Vis';
                        break;

                    case 'Study':
                        selectedData['isInformatiker'] = d[varName] === 'WirtschaftsInformatik';
                        break;

                    default:
                        selectedData['Bachelor student'] = d[varName] === 'Bachelor';
                        break;
                }
            }
        });

        return selectedData;
    });
}

function getFilteredData() {
    const variables = [ 'Grade', 'Time to complete exam', 'Year', 'Attemptnumber', 'Bachelor/Master'];
    return loadData(variables);
}

function mapMin2Com(data) {
    data.forEach(d => {
        if (d.min2com >= 0 && d.min2com <= 30) {
            d.min2com = "Short time";
        } else if (d.min2com >= 31 && d.min2com <= 60) {
            d.min2com = "Medium time";
        } else if (d.min2com >= 61 && d.min2com <= 90) {
            d.min2com = "Long time";
        }
    });
}

function calcFreq(data) {
    const links = new Map();

    data.forEach((d) => {
        const attributes = Object.keys(d);
        const numAttributes = attributes.length;

        for (let i = 0; i < numAttributes - 1; i++) {
            for (let j = i + 1; j < numAttributes; j++) {
                if (i === j) continue;
                const source = `${d[attributes[i]]}`;
                const target = `${d[attributes[j]]}`;

                // Form a key for the Map to represent the combination
                const key = `${source} | ${target}`;

                // Update the value (count) for the combination
                if (links.has(key)) {
                    links.set(key, links.get(key) + 1);
                } else {
                    links.set(key, 1);
                }
            }
        }
    });

    // Convert Map to array of objects
    const resultLinks = Array.from(links).map(([combination, count]) => {
        const [source, target] = combination.split(" | ");
        return { source, target, value: count };
    });
    return resultLinks;
}

function main() {
    getFilteredData().then(dataa => {
        mapMin2Com(dataa);
        let frequencies = calcFreq(dataa);
        const data = {
            nodes: [
                {name: "Fail", category: "Status"},
                {name: "Pass", category: "Status"},
                {name: "false", category: "Bachelor student"},
                {name: "true", category: "Bachelor student"},
                {name: "2021", category: "Year"},
                {name: "2022", category: "Year"},
                {name: "2023", category: "Year"},
                {name: "1", category: "Attemptnumber"},
                {name: "2", category: "Attemptnumber"},
                {name: "3", category: "Attemptnumber"},
                {name: "Short time", category: "min2com"},
                {name: "Medium time", category: "min2com"},
                {name: "Long time", category: "min2com"},
            ],
            links: frequencies
        };

        console.log(data);

        const width = 800;
        const height = 400;

// Create a Sankey diagram
        const sankey = d3.sankey()
            .nodeWidth(15)
            .nodePadding(10)
            .size([width, height]);

        const { nodes, links } = sankey(data);

// Append the SVG to the body
        const svg = d3.select("#svg1")
            .attr("width", width)
            .attr("height", height)
            .append("g");

// Draw the links
        svg.append("g")
            .selectAll(".link")
            .data(links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", d3.sankeyLinkHorizontal())
            .style("stroke-width", d => Math.max(1, d.width))
            .style("stroke", d => d.source.color)
            .style("fill", "none");

// Draw the nodes
        svg.append("g")
            .selectAll(".node")
            .data(nodes)
            .enter()
            .append("rect")
            .attr("class", "node")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .style("fill", d => d.color)
            .style("stroke", "#000");

// Add labels to the nodes
        svg.append("g")
            .selectAll(".node-label")
            .data(nodes)
            .enter()
            .append("text")
            .attr("class", "node-label")
            .attr("x", d => (d.x0 + d.x1) / 2)
            .attr("y", d => (d.y0 + d.y1) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(d => d.name);

// Add labels to the links
        svg.append("g")
            .selectAll(".link-label")
            .data(links)
            .enter()
            .append("text")
            .attr("class", "link-label")
            .attr("x", d => (d.source.x1 + d.target.x0) / 2)
            .attr("y", d => (d.y0 + d.y1) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(d => d.value);
    });
}

// Skizze 4
/*
const two1 = new Two({width: 1100, height: 1250}).appendTo(document.getElementById('svg1'));
// Method to get the x-scale
function getScaleX() {
    // Display space for x-axis
    return d3.scaleLinear()
        .domain([-1, 1])  // Data space for x-axis
        .range([100, 1000]);
}

// Method to get the y-scale
function getScaleY() {
    // Display space for y-axis (inverted for y-axis)
    return d3.scaleLinear()
        .domain([10, 0])  // Data space for y-axis
        .range([1232, 20]);
}

// Method to create and append axes using D3
function axesWithD3(svgSelector, titleText, xAxisName, yAxisName) {
    // Retrieve scales
    var scaleX = getScaleX();
    var scaleY = getScaleY();

    // Create x-axis and y-axis components
    var xAxis = d3.axisBottom(scaleX)
        .tickSizeOuter(0)
        .tickValues([-1, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1])
        .tickFormat(function (d) {
            return d3.format(".0%")(Math.abs(d));
        });


    var categories = ['Short time', 'Medium time', 'Long time', 'Attempt 1', 'Attempt 2', 'Attempt 3', '2021', '2022', '2023', 'Bachelor', 'Master'];
    var categoryScale = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var yAxis = d3.axisLeft(scaleY)
        .tickValues(categoryScale)
        .tickSizeOuter(0)
        .tickFormat(function (d, i) {
            return categories[i];
        });

    // Select the SVG container
    var svg = d3.select(svgSelector);

    // Append the x-axis at the bottom of the SVG
    var gX = svg.append("g")
        .attr("transform", 'translate(0,626)')  // Move to the bottom
        .call(xAxis)
        .call(g => g.append("text")  // Append a text label to the y-axis
            .attr("x", 1010)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-family", "Times New Roman")
            .attr("font-size", "14px")
            .attr("fill", "black")
            .text(xAxisName));


    // Append the y-axis on the left side of the SVG
    var gY = svg.append("g")
        .attr("transform", 'translate(550,0)')  // middle
        .call(yAxis)
        .call(g => g.append("text")  // Append a text label to the y-axis
            .attr("x", 0)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .attr("font-family", "Times New Roman")
            .attr("font-size", "14px")
            .attr("fill", "black")
            .text(yAxisName));



    gY.selectAll(".tick text")
        .attr("transform", "translate(-500,0)")
        .attr("text-anchor", "middle");

    gX.selectAll(".tick text")
        .attr("transform", "translate(0,606)")
        .attr("text-anchor", "middle");

    // Append a title at the top of each SVG
    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", 1000) // Centered in the middle of the SVG (adjust as needed)
        .attr("y", 30)  // Positioned at the top of the SVG (adjust as needed)
        .attr("text-anchor", "middle")
        .style("font-family", "Times New Roman")  // Set the font to Times New Roman
        .style("font-size", "20px")  // Optional: Adjust the font size as needed
        .text(titleText);  // Use the titleText parameter for the title

    gY.selectAll(".tick line").attr("stroke-width", 0);
    gX.selectAll(".tick line").attr("stroke-width", 0);

    for (let i = 1; i < 10; i++) {
        drawLine(svgSelector, 100, scaleY(i), 1000, scaleY(i), 'grey', 1);
    }

    for (let i = -0.8; i < 1; i += 0.2) {
        drawLine(svgSelector, scaleX(i), 20, scaleX(i), 1232, 'grey', 1);
    }

    drawLine(svgSelector, 555, scaleY(0), 545, scaleY(0), 'black', 1);
    drawLine(svgSelector, 555, scaleY(10), 545, scaleY(10), 'black', 1);
    drawLine(svgSelector, scaleX(-1), 621, scaleX(-1), 631, 'black', 1);
    drawLine(svgSelector, scaleX(1), 621, scaleX(1), 631, 'black', 1);

}

function drawLine(svgSelector, x1, y1, x2, y2, strokeColor, strokeWidth) {
    // Select the SVG container using the selector
    var svg = d3.select(svgSelector);

    // Append a line to the SVG
    svg.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth);
}

function loadData(variables) {
    const csvFilePath = 'DesignuebungGradingData.csv';
    return d3.csv(csvFilePath, function (d) {
        let selectedData = {};
        variables.forEach(varName => {
            if (d.hasOwnProperty(varName)) {
                switch (varName) {
                    case 'Year':
                    case 'Grade':
                    case 'Attemptnumber':
                        selectedData[varName] = +d[varName];
                        break;

                    case 'Time to complete exam':
                        selectedData['min2com'] = +d[varName];
                        break;

                    case 'Nachklausur':
                        selectedData[varName] = d[varName] === 'yes';
                        break;

                    case 'Course':
                        selectedData['isVis'] = d[varName] === 'Vis';
                        break;

                    case 'Study':
                        selectedData['isInformatiker'] = d[varName] === 'WirtschaftsInformatik';
                        break;

                    default:
                        selectedData['isBachelor'] = d[varName] === 'Bachelor';
                        break;
                }
            }
        });

        return selectedData;
    });
}

function getAllData() {
    const variables = ['Time to complete exam', 'Year', 'Nachklausur', 'Grade', 'Course', 'Attemptnumber', 'Study', 'Bachelor/Master'];
    return loadData(variables);
}


function getFilteredData() {
    const variables = ['Time to complete exam', 'Year', 'Grade', 'Attemptnumber', 'Bachelor/Master'];
    return loadData(variables);
}


function mapMin2Com(data) {
    data.forEach(d => {
        if (d.min2com >= 0 && d.min2com <= 30) {
            d.min2com = 1;
        } else if (d.min2com >= 31 && d.min2com <= 60) {
            d.min2com = 2;
        } else if (d.min2com >= 61 && d.min2com <= 90) {
            d.min2com = 3;
        }
    });
}

function splitData(data) {
    let passedData = [];
    let failedData = [];

    data.forEach(d => {
        if (d.Grade === 5) {
            failedData.push(d);
        } else {
            passedData.push(d);
        }
    });

    return { passedData, failedData };
}


function calculate1(data) {
    let result = new Array(11).fill(0);

    data.forEach(d => {
        // Counting min2com occurrences
        if (d.min2com === 1) result[0]++;
        if (d.min2com === 2) result[1]++;
        if (d.min2com === 3) result[2]++;

        // Counting Attemptnumber occurrences
        if (d.Attemptnumber === 1) result[3]++;
        if (d.Attemptnumber === 2) result[4]++;
        if (d.Attemptnumber === 3) result[5]++;

        // Counting Year occurrences
        if (d.Year === 2021) result[6]++;
        if (d.Year === 2022) result[7]++;
        if (d.Year === 2023) result[8]++;

        // Counting isBachelor occurrences
        if (d.isBachelor) {
            result[9]++;
        } else {
            result[10]++;
        }
    });

    let totalEntries = data.length;
    for (let key in result) {
        result[key] = result[key] / totalEntries;
    }

    return result;
}

function sketch1(svgSelector) {
    const data = getFilteredData().then(function (data) {
        const { passedData, failedData } = splitData(data);
        mapMin2Com(passedData);
        mapMin2Com(failedData);
        const passedDataResult = calculate1(passedData);
        const failedDataResult = calculate1(failedData);

        console.log(passedDataResult);
        console.log(failedDataResult);

        var scaleX = getScaleX();
        var scaleY = getScaleY();

        var svg = d3.select(svgSelector);

        let passedDataArray = passedDataResult.map((value, index) => {
            return { y: index, x: value };
        });
        let failedDataArray = failedDataResult.map((value, index) => {
            return { y: index, x: (- value) };
        });


        let lineGenerator = d3.line()
            .x(d => scaleX(d.x))  // x value is now directly from the data
            .y(d => scaleY(d.y))  // y value is the index
            .curve(d3.curveMonotoneX);

        let areaGenerator = d3.area() // This should be the start of your y range, ensuring the bottom of the area
            .x0(scaleX(0)) // This should correspond to the y-axis position
            .x1(d => scaleX(d.x)) // x value is now directly from the data
            .y(d => scaleY(d.y))
            .curve(d3.curveMonotoneX);

        // Append the filled area path
        svg.append("path")
            .datum(passedDataArray)
            .attr("class", "area")
            .attr("d", areaGenerator)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", "green")
            .attr("opacity", 0.5); // Set the fill to the desired color

        // Append the line path on top of the filled area
        svg.append("path")
            .datum(passedDataArray)
            .attr("class", "line")
            .attr("d", lineGenerator) // Set the stroke color to the desired color
            .attr("fill", "none");

        // Append the filled area path
        svg.append("path")
            .datum(failedDataArray)
            .attr("class", "area")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("d", areaGenerator)
            .attr("fill", "red")
            .attr("opacity", 0.5); // Set the fill to the desired color

        // Append the line path on top of the filled area
        svg.append("path")
            .datum(failedDataArray)
            .attr("class", "line")
            .attr("d", lineGenerator) // Set the stroke color to the desired color
            .attr("fill", "none");
    });
}

function main() {
    axesWithD3('#svg1', 'Template 1', 'Relative Häufigkeit', 'Kategorie');
    sketch1('#svg1');
}
*/

// Skizze 6
/*
const two1 = new Two({width: 1100, height: 1200}).appendTo(document.getElementById('svg1'));

function getScaleX() {
    // Display space for x-axis
    return d3.scaleLinear()
        .domain([0, 90])  // Data space for x-axis
        .range([30, 930]);
}

function getScaleY() {
    // Display space for y-axis (inverted for y-axis)
    return d3.scaleLinear()
        .domain([40, -40])  // Data space for y-axis
        .range([100, 700]);
}


function axesWithD3(svgSelector, titleText, xAxisName, yAxisName) {
    // Retrieve scales
    var scaleX = getScaleX();
    var scaleY = getScaleY();

    // Create x-axis and y-axis components
    var xAxis = d3.axisBottom(scaleX)
        .tickValues([10, 20, 30, 40, 50, 60, 70, 80, 90]);

    var yAxis = d3.axisLeft(scaleY)
        .tickFormat(function (d) {
            return d3.format(d)(Math.abs(d));
        });

    var svg = d3.select(svgSelector);

    // Append the x-axis at the bottom of the SVG
    var gX = svg.append("g")
        .attr("transform", 'translate(0,400)')  // Move to the bottom
        .call(xAxis)
        .call(g => g.append("text")  // Append a text label to the y-axis
            .attr("x", 985)
            .attr("y", 5)
            .attr("text-anchor", "middle")
            .attr("font-family", "Times New Roman")
            .attr("font-size", "14px")
            .attr("fill", "black")
            .text(xAxisName));

    var gY = svg.append("g")
        .attr("transform", 'translate(30,0)')
        .call(yAxis)
        .call(g => g.append("text")  // Append a text label to the y-axis
            .attr("x", 0)
            .attr("y", 85)
            .attr("text-anchor", "middle")
            .attr("font-family", "Times New Roman")
            .attr("font-size", "14px")
            .attr("fill", "black")
            .text(yAxisName));

    gY.selectAll(".tick line")
        .attr("stroke-width", 0);

    gX.selectAll(".tick line")
        .attr("stroke-width", 0);

    for (let i = -3; i < 4; i++) {
        drawLine(svgSelector, 30, scaleY(i * 10), 930, scaleY(i * 10), 'grey', 1);
    }
    for (let i = 1; i < 9; i++) {
        drawLine(svgSelector, scaleX(i * 10), 100, scaleX(i * 10), 700, 'grey', 1);
    }

}


function drawLine(svgSelector, x1, y1, x2, y2, strokeColor, strokeWidth) {
    // Select the SVG container using the selector
    var svg = d3.select(svgSelector);

    // Append a line to the SVG
    svg.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", strokeColor)
        .attr("stroke-width", strokeWidth);
}

function loadData(variables) {
    const csvFilePath = 'DesignuebungGradingData.csv';
    return d3.csv(csvFilePath, function (d) {
        let selectedData = {};
        variables.forEach(varName => {
            if (d.hasOwnProperty(varName)) {
                switch (varName) {
                    case 'Year':
                    case 'Grade':
                    case 'Attemptnumber':
                        selectedData[varName] = +d[varName];
                        break;

                    case 'Time to complete exam':
                        selectedData['min2com'] = +d[varName];
                        break;

                    case 'Nachklausur':
                        selectedData[varName] = d[varName] === 'yes';
                        break;

                    case 'Course':
                        selectedData['isVis'] = d[varName] === 'Vis';
                        break;

                    case 'Study':
                        selectedData['isInformatiker'] = d[varName] === 'WirtschaftsInformatik';
                        break;

                    default:
                        selectedData['isBachelor'] = d[varName] === 'Bachelor';
                        break;
                }
            }
        });

        return selectedData;
    });
}

function getFilteredData() {
    const variables = ['Time to complete exam', 'Year', 'Grade', 'Attemptnumber', 'Bachelor/Master'];
    return loadData(variables);
}

function mapMin2Com(data) {
    data.forEach(d => {
        if (d.min2com >= 0 && d.min2com <= 30) {
            d.min2com = 1;
        } else if (d.min2com >= 31 && d.min2com <= 60) {
            d.min2com = 2;
        } else if (d.min2com >= 61 && d.min2com <= 90) {
            d.min2com = 3;
        }
    });
}

function mapOneTime(minutes) {
    if (minutes >= 0 && minutes <= 30) {
        return 1;
    } else if (minutes >= 31 && minutes <= 60) {
        return 2;
    } else if (minutes >= 61 && minutes <= 90) {
        return 3;
    }
}


function calculateFrequencies(data) {
    let frequencyCounter = {};
    data.forEach(entry => {
        let gradeStatus = entry.Grade === 5 ? 'Fail' : 'Pass';
        let minutes = mapOneTime(entry.min2com);

        let combination = `Status: ${gradeStatus}, Bachelor student: ${entry.isBachelor}, Exam year: ${entry.Year}, Attempt number: ${entry.Attemptnumber}, Time category: ${minutes}`;

        if (!frequencyCounter.hasOwnProperty(combination)) {
            frequencyCounter[combination] = {
                count: 0,
                sumTime: 0,
                minTime: entry.min2com,
                maxTime: entry.min2com,
                gradeStatus: gradeStatus,
                isBachelor: entry.isBachelor,
                Year: entry.Year,
                Attemptnumber: entry.Attemptnumber,
                timeCategory: minutes
            };
        }

        frequencyCounter[combination].count++;
        frequencyCounter[combination].sumTime += entry.min2com;
        frequencyCounter[combination].minTime = Math.min(frequencyCounter[combination].minTime, entry.min2com);
        frequencyCounter[combination].maxTime = Math.max(frequencyCounter[combination].maxTime, entry.min2com);
    });

    // Calculate average time for each combination
    for (let combination in frequencyCounter) {
        if (frequencyCounter.hasOwnProperty(combination)) {
            frequencyCounter[combination].averageTime = frequencyCounter[combination].sumTime / frequencyCounter[combination].count;
        }
    }

    for (let combination in frequencyCounter) {
        //log name of combination and its count
        console.log(combination + ' --> ' + frequencyCounter[combination].count);
    }

    return frequencyCounter;
}

function plotData(data) {
    const scaleX = getScaleX();
    const scaleY = getScaleY();

    data.forEach(combination => {
        const Attemptnumber = combination.Attemptnumber;
        const Year = combination.Year;
        const averageTime = combination.averageTime;
        const count = combination.count;
        const gradeStatus = combination.gradeStatus;
        const isBachelor = combination.isBachelor;
        const maxTime = combination.maxTime;
        const minTime = combination.minTime;
        const timeCategory = combination.timeCategory;
        const diff = maxTime - minTime;

        isBachelor === true ? drawTriangle('#svg1', scaleX(averageTime - diff / 2), scaleY(0), scaleX(averageTime), scaleY(gradeStatus === 'Pass' ? count : -count), scaleX(averageTime + diff / 2), scaleY(0), Attemptnumber === 1 ? 'red' : (Attemptnumber === 2 ? 'green' : 'blue'), Year) :
            drawRectangle('#svg1', scaleX(averageTime - diff / 2), scaleY(gradeStatus === 'Fail' ? 0 : count), scaleX(diff) - scaleX(0), scaleY(count) - scaleY(count * 2), Attemptnumber === 1 ? 'red' : (Attemptnumber === 2 ? 'green' : 'blue'), Year);
    });
}

function drawRectangle(svgSelector, x, y, width, height, color, year) {
    var svg = d3.select(svgSelector);

    svg.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", width)
        .attr("height", height)
        .attr("opacity", 0.6)
        .attr("fill", 'transparent')
        .attr("stroke", year === 2021 ? "#FF00FF" : (year === 2022 ? "#00FFFF" : "#ff7300"))
        .attr("stroke-width", "3")
        .attr("stroke-dasharray", "10,0");
}

function drawTriangle(svgSelector, x1, y1, x2, y2, x3, y3, color, year) {
    var svg = d3.select(svgSelector);

    svg.append("polygon")
        .attr("points", `${x1},${y1} ${x2},${y2} ${x3},${y3}`)
        .attr("opacity", 0.6)
        .attr("fill", 'transparent')
        .attr("stroke", year === 2021 ? "#FF00FF" : (year === 2022 ? "#00FFFF" : "#ff7300"))
        .attr("stroke-width", "3")
        .attr("stroke-dasharray", "10,0");
}

function main() {
    const scaleX = getScaleX();
    const scaleY = getScaleY();

    axesWithD3('#svg1', 'Template 1', 'Avg. Time(Min)', 'Frequency');
    getFilteredData().then(data => {
        let frequencies = calculateFrequencies(data);
        plotData(Object.values(frequencies));
    });

}

*/

main();











