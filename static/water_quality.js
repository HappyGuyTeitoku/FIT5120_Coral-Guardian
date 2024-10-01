let trendData;
let currentSiteId;

// Load the historical trend data
d3.json('../datasets/data/trend_water.json').then(function(data) {
    trendData = data;
}).catch(function(error) {
    console.error("Error loading trend_water.json:", error);
});

// Toggle function for Nitrogen switch
document.getElementById("nitrogenToggle").addEventListener("click", function() {
    const toggle = document.getElementById("nitrogenToggle");
    const container = document.getElementById("nitrogenChartContainer");
    const heading = document.getElementById("nitrogenHeading");
    if (toggle.classList.contains("toggle-on")) {
        toggle.classList.remove("toggle-on");
        container.classList.remove("trend-chart-visible");
        heading.classList.remove("trend-visible");
    } else {
        toggle.classList.add("toggle-on");
        container.classList.add("trend-chart-visible");
        heading.classList.add("trend-visible");
        drawNitrogenTrend();
    }
});

// Toggle function for Phosphate switch
document.getElementById("phosphateToggle").addEventListener("click", function() {
    const toggle = document.getElementById("phosphateToggle");
    const container = document.getElementById("phosphateChartContainer");
    const heading = document.getElementById("phosphateHeading");
    if (toggle.classList.contains("toggle-on")) {
        toggle.classList.remove("toggle-on");
        container.classList.remove("trend-chart-visible");
        heading.classList.remove("trend-visible");
    } else {
        toggle.classList.add("toggle-on");
        container.classList.add("trend-chart-visible");
        heading.classList.add("trend-visible");
        drawPhosphateTrend();
    }
});

// Function to draw the Nitrogen historical trend
function drawNitrogenTrend() {
    const svgWidth = document.querySelector(".range-indicator").clientWidth;
    const svgHeight = 150, margin = { top: 10, right: 30, bottom: 50, left: 70 }; 
    const svg = d3.select("#nitrogenChartContainer")
                  .html("") 
                  .append("svg")
                  .attr("width", svgWidth)
                  .attr("height", svgHeight + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    const imputedData = trendData.map(d => {
        return {
            ...d,
            N_TOTAL: d.N_TOTAL === null || d.N_TOTAL === undefined ? 0 : d.N_TOTAL
        };
    });

    const filteredData = imputedData.filter(d => d.site_id === currentSiteId && d.N_TOTAL !== 0);
    
    const x = d3.scaleTime()
                .domain(d3.extent(filteredData, d => new Date(d.date)))
                .range([0, svgWidth - margin.left - margin.right]);

    const y = d3.scaleLinear()
                .domain([0, d3.max(filteredData, d => d.N_TOTAL)])
                .range([svgHeight, 0]);

    svg.append("g")
       .attr("transform", `translate(0,${svgHeight})`)
       .call(d3.axisBottom(x)
       .ticks(6)
       .tickFormat(d3.timeFormat("%Y")));

    svg.append("text")
       .attr("x", svgWidth / 2 - margin.left)
       .attr("y", svgHeight + margin.bottom - 15)
       .attr("text-anchor", "middle")
       .text("Date");

    svg.append("g")
       .call(d3.axisLeft(y)
       .ticks(3)
       .tickPadding(10)); 

    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - margin.left)
       .attr("x", 0 - (svgHeight / 2))
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text("Nitrogen (µg/L)");

    svg.append("g")
       .attr("class", "grid")
       .call(d3.axisLeft(y).tickSize(-svgWidth).tickFormat(''));

    svg.append("g")
       .attr("class", "grid")
       .attr("transform", `translate(0,${svgHeight})`)
       .call(d3.axisBottom(x).tickSize(-svgHeight).tickFormat(''));

    const line = d3.line()
                   .x(d => x(new Date(d.date)))
                   .y(d => y(d.N_TOTAL));

    const path = svg.append("path")
                    .datum(filteredData)
                    .attr("fill", "none")
                    .attr("stroke", "green")
                    .attr("stroke-width", 2)
                    .attr("d", line);

    const totalLength = path.node().getTotalLength();
    path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("display", "none");
    const hoverLine = svg.append("line")
                         .attr("class", "hover-line")
                         .style("stroke", "lightgrey")
                         .style("stroke-width", "1px")
                         .style("stroke-dasharray", "3,3")
                         .style("opacity", 0);

    svg.append("rect")
       .attr("width", svgWidth - margin.left - margin.right)
       .attr("height", svgHeight)
       .style("fill", "none")
       .style("pointer-events", "all")
       .on("mouseover", () => {
            tooltip.style("display", null);
            hoverLine.style("opacity", 1);
        })
       .on("mouseout", () => {
            tooltip.style("display", "none");
            hoverLine.style("opacity", 0);
        })
       .on("mousemove", function(event) {
            const mouseX = d3.pointer(event, this)[0];
            const xDate = x.invert(mouseX);
            const closestPoint = filteredData.reduce((prev, curr) => {
                return Math.abs(new Date(curr.date) - xDate) < Math.abs(new Date(prev.date) - xDate) ? curr : prev;
            });
            
            const hoverX = x(new Date(closestPoint.date));
            const hoverY = y(closestPoint.N_TOTAL);

            hoverLine.attr("x1", hoverX).attr("x2", hoverX).attr("y1", 0).attr("y2", svgHeight);

            const tooltipXPos = hoverX > (svgWidth / 2) ? event.pageX - 100 : event.pageX + 10;

            tooltip.style("left", `${tooltipXPos}px`)
                   .style("top", `${event.pageY - 28}px`)
                   .style("display", "inline-block")
                   .html(`Date: ${formatDate(closestPoint.date)}<br>Total Nitrogen: ${closestPoint.N_TOTAL} µg/L`);
       });
}

// Function to draw the Phosphate historical trend
function drawPhosphateTrend() {
    const svgWidth = document.querySelector(".range-indicator").clientWidth;
    const svgHeight = 150, margin = { top: 10, right: 30, bottom: 50, left: 70 }; 
    const svg = d3.select("#phosphateChartContainer")
                  .html("") 
                  .append("svg")
                  .attr("width", svgWidth)
                  .attr("height", svgHeight + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    const imputedData = trendData.map(d => {
        return {
            ...d,
            P_TOTAL: d.P_TOTAL === null || d.P_TOTAL === undefined ? 0 : d.P_TOTAL
        };
    });

    const filteredData = imputedData.filter(d => d.site_id === currentSiteId && d.P_TOTAL !== 0);

    const x = d3.scaleTime()
                .domain(d3.extent(filteredData, d => new Date(d.date)))
                .range([0, svgWidth - margin.left - margin.right]);

    const y = d3.scaleLinear()
                .domain([0, d3.max(filteredData, d => d.P_TOTAL)])
                .range([svgHeight, 0]);

    svg.append("g")
       .attr("transform", `translate(0,${svgHeight})`)
       .call(d3.axisBottom(x)
       .ticks(6)
       .tickFormat(d3.timeFormat("%Y")));

    svg.append("text")
       .attr("x", svgWidth / 2 - margin.left)
       .attr("y", svgHeight + margin.bottom - 15)
       .attr("text-anchor", "middle")
       .text("Date");

    svg.append("g")
       .call(d3.axisLeft(y)
       .ticks(3)
       .tickPadding(10)); 

    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - margin.left)
       .attr("x", 0 - (svgHeight / 2))
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text("Phosphate (µg/L)");

    svg.append("g")
       .attr("class", "grid")
       .call(d3.axisLeft(y).tickSize(-svgWidth).tickFormat(''));

    svg.append("g")
       .attr("class", "grid")
       .attr("transform", `translate(0,${svgHeight})`)
       .call(d3.axisBottom(x).tickSize(-svgHeight).tickFormat(''));

    const line = d3.line()
                   .x(d => x(new Date(d.date)))
                   .y(d => y(d.P_TOTAL));

    const path = svg.append("path")
                    .datum(filteredData)
                    .attr("fill", "none")
                    .attr("stroke", "blue")
                    .attr("stroke-width", 2)
                    .attr("d", line);

    const totalLength = path.node().getTotalLength();
    path.attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    svg.append("line")
       .attr("x1", svgWidth - margin.left - margin.right)
       .attr("x2", svgWidth - margin.left - margin.right)
       .attr("y1", 0)
       .attr("y2", svgHeight)
       .attr("stroke", "black")
       .attr("stroke-width", 1);

    const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("display", "none");
    const hoverLine = svg.append("line")
                         .attr("class", "hover-line")
                         .style("stroke", "lightgrey")
                         .style("stroke-width", "1px")
                         .style("stroke-dasharray", "3,3")
                         .style("opacity", 0);

    svg.append("rect")
       .attr("width", svgWidth - margin.left - margin.right)
       .attr("height", svgHeight)
       .style("fill", "none")
       .style("pointer-events", "all")
       .on("mouseover", () => {
            tooltip.style("display", null);
            hoverLine.style("opacity", 1);
        })
       .on("mouseout", () => {
            tooltip.style("display", "none");
            hoverLine.style("opacity", 0);
        })
       .on("mousemove", function(event) {
            const mouseX = d3.pointer(event, this)[0];
            const xDate = x.invert(mouseX);
            const closestPoint = filteredData.reduce((prev, curr) => {
                return Math.abs(new Date(curr.date) - xDate) < Math.abs(new Date(prev.date) - xDate) ? curr : prev;
            });
            
            const hoverX = x(new Date(closestPoint.date));
            const hoverY = y(closestPoint.P_TOTAL);

            hoverLine.attr("x1", hoverX).attr("x2", hoverX).attr("y1", 0).attr("y2", svgHeight);

            const tooltipXPos = hoverX > (svgWidth / 2) ? event.pageX - 100 : event.pageX + 10;

            tooltip.style("left", `${tooltipXPos}px`)
                   .style("top", `${event.pageY - 28}px`)
                   .style("display", "inline-block")
                   .html(`Date: ${formatDate(closestPoint.date)}<br>Total Phosphate: ${closestPoint.P_TOTAL} µg/L`);
       });
}

// Update the Nitrogen indicator based on value
function updateNitrogenIndicator(value) {
    const maxNitrogen = 20000;
    const widthPercentage = (value / maxNitrogen) * 100;
    document.getElementById("nitrogenBar").style.width = widthPercentage + "%";

    let circleColor = "green";
    let description = "Safe to use";
    if (value < 10000) {
        document.getElementById("nitrogenBar").style.backgroundColor = "green";
        circleColor = "green";
    } else if (value <= 15000) {
        document.getElementById("nitrogenBar").style.backgroundColor = "yellow";
        circleColor = "yellow";
        description = "Start to impact aquatic ecosystems";
    } else {
        document.getElementById("nitrogenBar").style.backgroundColor = "red";
        circleColor = "red";
        description = "Harmful to aquatic life";
    }
    document.getElementById("nitrogenTitle").innerHTML = `<span class="indicator-icon">🌱</span> Total Nitrogen (${value} µg/L)`;
    document.getElementById("nitrogenDescription").innerHTML = `<div class="notification-circle" style="background-color: ${circleColor}"></div> ${description}`;
}

// Update the Phosphate indicator based on value
function updatePhosphateIndicator(value) {
    const maxPhosphate = 1500;
    const widthPercentage = (value / maxPhosphate) * 100;
    document.getElementById("phosphateBar").style.width = widthPercentage + "%";

    let circleColor = "green";
    let description = "Safe to use";
    if (value < 300) {
        document.getElementById("phosphateBar").style.backgroundColor = "green";
        circleColor = "green";
    } else if (value <= 1000) {
        document.getElementById("phosphateBar").style.backgroundColor = "yellow";
        circleColor = "yellow";
        description = "Risk of eutrophication";
    } else {
        document.getElementById("phosphateBar").style.backgroundColor = "red";
        circleColor = "red";
        description = "Severe eutrophication";
    }
    document.getElementById("phosphateTitle").innerHTML = `<span class="indicator-icon">💧</span> Total Phosphate (${value} µg/L)`;
    document.getElementById("phosphateDescription").innerHTML = `<div class="notification-circle" style="background-color: ${circleColor}"></div> ${description}`;
}

// Load merged_water.json and plot the map
d3.json('../datasets/data/merged_water.json').then(function(data) {
    const map = L.map('map').setView([-37.8136, 144.9631], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const latestDataBySite = {};
    const markers = [];

    // Collect latest data for each site and create markers
    data.forEach(function(entry) {
        const siteId = entry.site_id;
        const entryDate = new Date(entry.date);
        if (!latestDataBySite[siteId] || entryDate > new Date(latestDataBySite[siteId].date)) {
            latestDataBySite[siteId] = entry;
        }
    });

    Object.values(latestDataBySite).forEach(function(site) {
        const marker = L.marker([site.latitude, site.longitude])
            .addTo(map)
            .bindPopup(`<b>${site.site_name_short}</b><br>Date: ${formatDate(site.date)}<br>Nitrogen: ${site.N_TOTAL} µg/L<br>Phosphate: ${site.P_TOTAL} µg/L`);

        // Store marker for random selection
        markers.push({ site, marker });

        // Marker click event to update indicators and charts
        marker.on('click', function() {
            currentSiteId = site.site_id;
            document.getElementById("observation-name").textContent = `${site.site_name_short}`;
            updateNitrogenIndicator(site.N_TOTAL);
            updatePhosphateIndicator(site.P_TOTAL);

            if (document.getElementById("nitrogenToggle").classList.contains("toggle-on")) {
                drawNitrogenTrend();
            }
            if (document.getElementById("phosphateToggle").classList.contains("toggle-on")) {
                drawPhosphateTrend();
            }
        });
    });

    // Automatically select a random site after loading the markers
    if (markers.length > 0) {
        const randomIndex = Math.floor(Math.random() * markers.length);
        const randomMarker = markers[randomIndex].marker;
        randomMarker.openPopup();  // Simulate a click on the marker to show the popup

        // Trigger the 'click' event for the marker to update the data and map
        randomMarker.fire('click');
    }
});

// Format date utility function
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Tab switching logic
document.getElementById("waterQualityTab").addEventListener("click", function() {
    // Show water quality panel
    document.getElementById("waterQualityPanel").style.display = "block";
    document.getElementById("fishPanel").style.display = "none";
    
    // Show the map
    document.getElementById("map-container").style.display = "block";

    // Set active tab
    document.getElementById("waterQualityTab").classList.add("active");
    document.getElementById("fishTab").classList.remove("active");
});

document.getElementById("fishTab").addEventListener("click", function() {
    // Show fish panel and hide the water quality panel
    document.getElementById("waterQualityPanel").style.display = "none";
    document.getElementById("fishPanel").style.display = "flex";

    // Hide the map when switching to Fish tab
    document.getElementById("map-container").style.display = "none";

    // Set active tab
    document.getElementById("fishTab").classList.add("active");
    document.getElementById("waterQualityTab").classList.remove("active");
});