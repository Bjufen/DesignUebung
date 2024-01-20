// Skizze 7: Ratio of passed & failed students for the categories
// noinspection JSUnresolvedReference

function getScaleX() {
    // Display space for x-axis
    return d3.scaleLinear()
        .domain([0, 100])  // Data space for x-axis
        .range([0, 1250]);
}

function getScaleY() {
    // Display space for x-axis
    return d3.scaleLinear()
        .domain([0, 100])  // Data space for y-axis
        .range([0, 1250]);
}

function addSource(svgSelector, sourceText) {
    // Select the SVG container using the selector
    const svg = d3.select(svgSelector);

    // Append a text to the SVG
    svg.append("text")
        .attr("x", getScaleX()(85))
        .attr("y", getScaleY()(99))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "black")
        .style("font-family", "Times New Roman")
        .style("font-size", "18px")
        .text(sourceText);
}

function addTitle(svgSelector, titleText) {
    // Select the SVG container using the selector
    const svg = d3.select(svgSelector);

    // Append a text to the SVG
    svg.append("text")
        .attr("x", getScaleX()(50))
        .attr("y", getScaleY()(5))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "black")
        .style("font-family", "Times New Roman")
        .style("font-size", "48px")
        .text(titleText);
}

function addLegend(){
    const svg = d3.select('#svg1');

    drawRectangle(svg, getScaleX()(96), getScaleY()(3.2), getScaleX()(3), getScaleY()(1.5), 'green', null);
    drawRectangle(svg, getScaleX()(96), getScaleY()(5.2), getScaleX()(3), getScaleY()(1.5), 'red', null);
    svg.append("text")
        .attr("x", getScaleX()(94))
        .attr("y", getScaleY()(4))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "black")
        .style("font-family", "Times New Roman")
        .style("font-size", "16x")
        .text('Passed');

    svg.append("text")
        .attr("x", getScaleX()(94))
        .attr("y", getScaleY()(6))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "black")
        .style("font-family", "Times New Roman")
        .style("font-size", "16x")
        .text('Failed');
}

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
                        selectedData[varName] = d[varName] !== 'No';
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
    const variables = ['Time to complete exam', 'Year', 'Grade', 'Attemptnumber', 'Nachklausur', 'Bachelor/Master'];
    return loadData(variables).then(data => {
        mapMin2Com(data);
        return data;
    });
}

function mapMin2Com(data) {
    data.forEach(d => {
        if (d.min2com >= 0 && d.min2com <= 30) {
            d.min2com = "0 - 30";
        } else if (d.min2com >= 31 && d.min2com <= 60) {
            d.min2com = "31 - 60";
        } else if (d.min2com >= 61 && d.min2com <= 90) {
            d.min2com = "61 - 90";
        }
    });
}

function calculatePassFailRatio(data, attributeName) {
    let passFailCounts = {};

    if (attributeName === 'min2com') {
        passFailCounts["0 - 30"] = {pass: 0, fail: 0};
        passFailCounts["31 - 60"] = {pass: 0, fail: 0};
        passFailCounts["61 - 90"] = {pass: 0, fail: 0};
    }


    data.forEach(d => {
        const attributeValue = d[attributeName];
        if (!passFailCounts[attributeValue]) {
            passFailCounts[attributeValue] = {pass: 0, fail: 0};
        }

        if (d.Status === 'Pass') {
            passFailCounts[attributeValue].pass++;
        } else {
            passFailCounts[attributeValue].fail++;
        }
    });
    const ratioData = {};
    for (const attributeValue in passFailCounts) {
        const passCount = passFailCounts[attributeValue].pass || 0;
        const failCount = passFailCounts[attributeValue].fail || 0;
        const total = passCount + failCount;

        ratioData[attributeValue] = {
            pass: passCount,
            fail: failCount,
            ratio: total > 0 ? passCount / total : 0,
        };
    }

    return ratioData;
}

function getPassFailRatio(data) {
    let passCount = 0;
    data.forEach(d => {
        if (d.Status === 'Pass') {
            passCount++;
        }
    });
    return {
        pass: passCount,
        fail: data.length - passCount,
        ratio: passCount / data.length
    };
}

function createBarChart(x1, y1, x2, y2, data, title) {

    let labels;

    const svg = d3.select('#svg1');

    if (title === 'Pass or Fail?') {
        labels = ['Status'];
        const scaleX = d3
            .scaleLinear()
            .domain([0, 1])
            .range([getScaleX()(x1), getScaleX()(x2)]);

        const scaleY = d3
            .scaleBand()
            .domain(labels)
            .range([getScaleY()(y1), getScaleY()(y2)]);

        createAxes(svg, x1, y1, x2, y2, labels, {scaleX, scaleY}, title);

        // make the bars
        labels.forEach(label => {
            const tempVariable = data.ratio;
            const barHeight = scaleY.bandwidth() * 0.6;

            // Adjust the y position to center the bar on the tick
            const yPosition = scaleY(label) + (scaleY.bandwidth() - barHeight) / 2;

            drawRectangle(svg, scaleX(0), yPosition, scaleX(tempVariable) - scaleX(0), barHeight, 'green', data);
            drawRectangle(svg, scaleX(tempVariable), yPosition, scaleX(1) - scaleX(tempVariable), barHeight, 'red', data);
        });

    } else {
        labels = Object.keys(data);
        const scaleX = d3
            .scaleLinear()
            .domain([0, 1])
            .range([getScaleX()(x1), getScaleX()(x2)]);

        const scaleY = d3
            .scaleBand()
            .domain(labels)
            .range([getScaleY()(y1), getScaleY()(y2)]);

        createAxes(svg, x1, y1, x2, y2, labels, {scaleX, scaleY}, title);

        // make the bars
        labels.forEach(label => {
            const tempVariable = data[label].ratio;
            const barHeight = scaleY.bandwidth() * 0.6;

            // Adjust the y position to center the bar on the tick
            const yPosition = scaleY(label) + (scaleY.bandwidth() - barHeight) / 2;

            drawRectangle(svg, scaleX(0), yPosition, scaleX(tempVariable) - scaleX(0), barHeight, 'green', data[label]);
            drawRectangle(svg, scaleX(tempVariable), yPosition, scaleX(1) - scaleX(tempVariable), barHeight, 'red', data[label]);
        });
    }
}

function createAxes(svgSelector, x1, y1, x2, y2, yValues, scales, title) {
    const labels = yValues;
    const svg = svgSelector;

    const {scaleX, scaleY} = scales;

    const yAxis = d3.axisLeft(scaleY)
        .tickSizeOuter(0)
        .tickValues(labels);

    const xAxis = d3.axisBottom(scaleX)
        .tickFormat(function (d) {
            return d3.format(".0%")(d);
        })
        .tickSizeOuter(0)
        .tickValues(d3.range(0, 1.01, 0.2));

    // Append the Y axis
    svg.append("g")
        .attr("transform", `translate(${getScaleX()(x1)}, ${0})`)
        .call(yAxis);

    // Append the X axis
    svg.append("g")
        .attr("transform", `translate(${0}, ${getScaleY()(y2)})`)
        .call(xAxis)
        .selectAll("path")
        .attr("stroke-width", 1);


    const xValue = getScaleX()((x1 + x2) / 2);
    const yValue = getScaleY()(y1);

    // Append the title
    svg.append("text")
        .attr("x", xValue)
        .attr("y", yValue)
        .attr("text-anchor", "middle")
        .style("font-family", "Times New Roman")
        .style("font-size", "18px")
        .text(title);
}

function drawRectangle(svgSelector, x, y, width, height, color, data) {
    const svg = svgSelector;

    const rectangle = svg.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", width)
        .attr("height", height)
        .attr("opacity", 0.9)
        .attr("fill", color);

    const tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("display", "none");

    tooltip.append("rect")
        .attr("width", 150)
        .attr("height", 60)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("rx", 5)
        .attr("ry", 5);

    const textElement = tooltip.append("text")
        .attr("x", 75)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black");

    let isTooltipVisible = false;
    let hideTimeout;

    function showTooltip() {
        tooltip.raise(); // Move the tooltip to the front

        let labelText;
        if (color === 'green') {
            labelText = `Passed:\nTotal: ${data.pass}\nRatio: ${(data.ratio * 100).toFixed(2)}%`;
        } else {
            labelText = `Failed:\nTotal: ${data.fail}\nRatio: ${(100 - data.ratio * 100).toFixed(2)}%`;
        }

        textElement.selectAll("tspan").remove();

        labelText.split('\n').forEach((line, index) => {
            textElement.append("tspan")
                .text(line)
                .attr("x", 75)
                .attr("dy", index === 0 ? "-1em" : "1.2em")
                .attr("text-anchor", "middle");
        });

        tooltip.style("display", null);
        isTooltipVisible = true;
    }

    function hideTooltip() {
        tooltip.style("display", "none");
        isTooltipVisible = false;
    }

    rectangle.on("mouseover", function () {
        if (!isTooltipVisible) {
            showTooltip();
        } else {
            // Cancel the hide timeout if the mouse enters the rectangle before the timeout triggers
            clearTimeout(hideTimeout);
        }
    })
        .on("mouseout", function () {
            // Set a timeout to hide the tooltip after a short delay
            hideTimeout = setTimeout(hideTooltip, 100);
        })
        .on("mousemove", function (event) {
            const [mouseX, mouseY] = d3.pointer(event);
            tooltip.attr("transform", `translate(${mouseX + 10},${mouseY - 30})`);
        });

    // Additional event handler for the tooltip
    tooltip.on("mouseout", function () {
        // Set the isTooltipVisible flag to false when the mouse leaves the tooltip
        isTooltipVisible = false;
        hideTooltip();
    });
}

function main() {
    addTitle('#svg1', 'Ratio of Passed & Failed Students for the Categories');
    addSource('#svg1', 'Source: DesignuebungGradingData.csv');
    addLegend();
    getFilteredData().then(data => {
        const attributes = ['min2com', 'Year', 'Nachklausur', 'Attemptnumber', 'Bachelor student'];
        let ratioData = {};
        attributes.forEach(attribute => {
            ratioData[attribute] = calculatePassFailRatio(data, attribute);
        });
        ratioData['Status'] = getPassFailRatio(data);

        const catNames = ['Time to Complete Exam(in Minutes)', 'Year', 'is Nachklausur?', 'Attempt Number', 'is Bachelor Student?'];
        const y1 = [10, 40, 70];
        const y2 = [35, 65, 95];
        let counter = 0;
        createBarChart(5, 10, 45, 35, ratioData['Status'], 'Pass or Fail?');
        for (let i = 0; i < 3; i++) {
            if (i === 0) {
                createBarChart(55, y1[i], 95, y2[i], ratioData[attributes[counter]], catNames[counter]);
                counter++;
                continue;
            }
            createBarChart(5, y1[i], 45, y2[i], ratioData[attributes[counter]], catNames[counter]);
            counter++;
            createBarChart(55, y1[i], 95, y2[i], ratioData[attributes[counter]], catNames[counter]);
            counter++;
        }

        for (const attribute in ratioData) {
            if (ratioData.hasOwnProperty(attribute)) {
            }
        }
    });
}

main();