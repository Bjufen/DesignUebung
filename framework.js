import * as d3 from './d3.v7.min';


function initialiseWebpage(params) {
    // setup webpage with all needed elements, e.g. creating the title and the canvas to draw on etc.
    const main = document.getElementById("main");

    const title = document.createElement("h1");
    title.style.fontFamily = "inherit";
    title.style.textAlign = "center";
    title.textContent = "Design Übung Yusuf Shehadeh";
    main.appendChild(title);

    const subTitle = document.createElement("h2");
    subTitle.style.fontFamily = "inherit";
    subTitle.style.textAlign = "center";
    subTitle.textContent = "Übung" ;
    main.appendChild(subTitle);
    document.title = "Design Übung Yusuf Shehadeh";

    const canvas = document.createElement("div");
    canvas.id = "canvas";
    canvas.style.width = params.width + "px";
    canvas.style.height = params.height + "px";
    canvas.style.margin = "4rem auto";
    canvas.fill = "None"
    main.appendChild(canvas);

    return canvas;
}

function main() {
    if (document.getElementById("canvas")) return; // already initialised

    const params = {
        width: 600,
        height: 600,
        xRangeMin: 0,
        xRangeMax: 100,
        yRangeMin: 0,
        yRangeMax: 100,
        marginTopRight: 10,
        marginBottomLeft: 30
    };

    const canvas = initialiseWebpage(params);

    // this is how to setup two.js for further information look into https://two.js.org/
    const two = new Two(params);
    two.appendTo(canvas);
    draw(two); // drawing action happening in app.js
}

/**
 * Maps a value between yRangeMin and yRangeMax to a pixel-coordinate for the y-axis, considering height and margins
 */
function getScaleY(two) {
    const scaleY = d3
        .scaleLinear()
        .domain([two.yRangeMin, two.yRangeMax])
        .range([two.height - two.marginBottomLeft, two.marginTopRight]);
    return scaleY;
}

/**
 * Maps a value between xRangeMin and xRangeMax to a pixel-coordinate for the x-axis, considering width and margins
 */
function getScaleX(two) {
    const scaleX = d3
        .scaleLinear()
        .domain([two.xRangeMin, two.xRangeMax])
        .range([two.marginBottomLeft, two.width - two.marginTopRight]);
    return scaleX;
}

function axesWithD3(two) {
    const svg = d3.select("svg"); // select the "canvas" svg created by two.js to manipulate it

    // create the axes
    const x_axis = d3.axisBottom(getScaleX(two));
    const y_axis = d3.axisLeft(getScaleY(two));

    // move axes according to the margins
    svg.append("g")
        .attr("transform", `translate(0, ${(two.height-two.marginBottomLeft)})`)
        .call(x_axis);

    svg.append("g")
        .attr("transform", `translate(${two.marginBottomLeft}, 0)`)
        .call(y_axis);
}

function getDataForExercise4() {
    return [{
            x: 50,
            y: 30,
            value: 25,
            category: "true"
        },
        {
            x: 55,
            y: 45,
            value: 55,
            category: "false"
        },
        {
            x: 80,
            y: 65,
            value: 50,
            category: "false"
        },
        {
            x: 95,
            y: 95,
            value: 25,
            category: "true"
        },
        {
            x: 10,
            y: 10,
            value: 10,
            category: "false"
        },
        {
            x: 30,
            y: 80,
            value: 53,
            category: "true"
        },
        {
            x: 90,
            y: 10,
            value: 88,
            category: "true"
        }
    ]
}

// call main function so something actually happens
main();