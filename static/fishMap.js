let fishIntroData = [];  // Stores description and findings from fish_intro_fin.json
let fishPopulationData = [];  // Stores population and nutrient data from preprocessed_fish_data.json

// Fetch both JSON files when the app initializes
function fetchFishData() {
    return Promise.all([
        fetch('../static/data/preprocessed_fish_data.json')
            .then(response => response.json())
            .then(data => fishPopulationData = data),
        fetch('../static/data/fish_intro_fin.json')
            .then(response => response.json())
            .then(data => fishIntroData = data)
    ]).catch(error => console.error('Error fetching fish data:', error));
}

// Initialize the Leaflet map
function initializeFishMap() {
    const map = L.map('map').setView([-37.8136, 144.9631], 12);  // Melbourne coordinates

    // Add a tile layer (map base)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let highlightedLayer = null;  // Track the currently highlighted layer

    // Set default heading when no river is selected
    document.getElementById('riverNameTitle').innerHTML = 'Please select the river';

    // Load the river polygon data
    fetch('../static/data/preprocessed_river_polygon.geojson')  // Replace with the correct path
        .then(response => response.json())
        .then(data => {
            if (data.type !== 'FeatureCollection') {
                throw new Error('Invalid GeoJSON format');
            }

            // Add the polygon to the map
            const geoJsonLayer = L.geoJSON(data, {
                style: {
                    color: 'blue',
                    weight: 2,
                    fillOpacity: 0.2
                },
                onEachFeature: function (feature, layer) {
                    // Highlight the polygon when clicked
                    layer.on('click', function () {
                        // Reset the previous highlight
                        if (highlightedLayer) {
                            highlightedLayer.setStyle({
                                weight: 2,
                                color: 'blue',
                                fillOpacity: 0.2
                            });
                        }

                        // Highlight the selected polygon in yellow
                        layer.setStyle({
                            weight: 5,
                            color: 'yellow',
                            fillOpacity: 0.7
                        });

                        highlightedLayer = layer;

                        // Update the header with the river name
                        const riverName = feature.properties.NAME;
                        document.getElementById('riverNameTitle').innerHTML = riverName;

                        // Fetch fish data for the selected river and update the cards
                        updateFishCards(riverName);
                    });
                }
            }).addTo(map);
        })
        .catch(error => console.error('Error loading the river polygon data:', error));
}

// Function to render the dual-axis chart for a selected fish
function renderDualAxisChart(fishData) {
    const chartContainer = d3.select("#expandedFishChart");
    chartContainer.html(""); // Clear any previous chart

    // Set up the dimensions of the graph
    const margin = { top: 20, right: 50, bottom: 50, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = chartContainer.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse the years
    const years = fishData.map(d => d.year);
    
    // Create scales
    const xScale = d3.scaleBand().domain(years).range([0, width]).padding(0.2);
    const yLeftScale = d3.scaleLinear()
        .domain([0, d3.max(fishData, d => d.estimated_population)])
        .range([height, 0]);
    const yRightScale = d3.scaleLinear()
        .domain([0, d3.max(fishData, d => Math.max(d.N_TOTAL_avg, d.P_TOTAL_avg))])
        .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxisLeft = d3.axisLeft(yLeftScale);
    const yAxisRight = d3.axisRight(yRightScale);

    // Add X Axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Add X Axis Label
    svg.append("text")
        .attr("fill", "black")
        .attr("x", width / 2) // Center the label horizontally
        .attr("y", height + 40) // Position it just below the X axis
        .attr("text-anchor", "middle")
        .text("Year"); // X-axis label

    // Add left Y Axis (Fish Population)
    svg.append("g")
        .call(yAxisLeft)
        .append("text")
        .attr("fill", "black")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text("Estimated Fish Population");

    // Add right Y Axis (Nutrient Levels)
    svg.append("g")
        .attr("transform", `translate(${width},0)`)
        .call(yAxisRight)
        .append("text")
        .attr("fill", "black")
        .attr("x", height / 2)
        .attr("y", -40)
        .attr("transform", "rotate(90)")
        .attr("text-anchor", "middle")
        .text("Nutrient Levels (μg/L)");

    // Draw the bars (Fish Population) with animation
    svg.selectAll(".bar")
        .data(fishData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.year))
        .attr("width", xScale.bandwidth())
        .attr("y", height)  // Start bars at the bottom
        .attr("height", 0)  // Start bars with 0 height
        .attr("fill", "#4682b4")
        .transition()  // Animate the bars
        .duration(800)
        .attr("y", d => yLeftScale(d.estimated_population))
        .attr("height", d => height - yLeftScale(d.estimated_population));

    // Draw Nitrogen Line (Yellow solid line with points)
    const nitrogenLine = d3.line()
        .x(d => xScale(d.year) + xScale.bandwidth() / 2)
        .y(d => yRightScale(d.N_TOTAL_avg));

    const nitrogenPath = svg.append("path")
        .datum(fishData)
        .attr("fill", "none")
        .attr("stroke", "#FFD700") // Darker yellow color
        .attr("stroke-width", 2)
        .attr("d", nitrogenLine)
        .attr("opacity", 0)
        .transition()  // Animate the line
        .duration(800)
        .attr("opacity", 1);

    // Animate the nitrogen line
    nitrogenPath
        .attr("stroke-dasharray", function() {
            const length = this.getTotalLength();
            return `${length} ${length}`;
        })
        .attr("stroke-dashoffset", function() {
            return this.getTotalLength();
        })
        .transition()
        .duration(800)
        .attr("stroke-dashoffset", 0);

    // Add points to the nitrogen line
    svg.selectAll(".line-nitrogen-point")
        .data(fishData)
        .enter()
        .append("circle")
        .attr("class", "line-nitrogen-point")
        .attr("cx", d => xScale(d.year) + xScale.bandwidth() / 2)
        .attr("cy", d => yRightScale(d.N_TOTAL_avg))
        .attr("r", 4)
        .attr("fill", "#FFD700")
        .attr("opacity", 0)
        .transition()  // Animate the points
        .duration(800)
        .attr("opacity", 1);

    // Draw Phosphate Line (Green solid line with points)
    const phosphateLine = d3.line()
        .x(d => xScale(d.year) + xScale.bandwidth() / 2)
        .y(d => yRightScale(d.P_TOTAL_avg));

    const phosphatePath = svg.append("path")
        .datum(fishData)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 2)
        .attr("d", phosphateLine)
        .attr("opacity", 0)
        .transition()  // Animate the line
        .duration(800)
        .attr("opacity", 1);

    // Animate the phosphate line
    phosphatePath
        .attr("stroke-dasharray", function() {
            const length = this.getTotalLength();
            return `${length} ${length}`;
        })
        .attr("stroke-dashoffset", function() {
            return this.getTotalLength();
        })
        .transition()
        .duration(800)
        .attr("stroke-dashoffset", 0);

    // Add points to the phosphate line
    svg.selectAll(".line-phosphate-point")
        .data(fishData)
        .enter()
        .append("circle")
        .attr("class", "line-phosphate-point")
        .attr("cx", d => xScale(d.year) + xScale.bandwidth() / 2)
        .attr("cy", d => yRightScale(d.P_TOTAL_avg))
        .attr("r", 4)
        .attr("fill", "green")
        .attr("opacity", 0)
        .transition()  // Animate the points
        .duration(800)
        .attr("opacity", 1);

    // Tooltip and hover line for interactivity (same logic as previous)
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("padding", "10px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("display", "none");

    const hoverLine = svg.append("line")
        .attr("stroke", "#bbb")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4")
        .attr("y1", 0)
        .attr("y2", height)
        .style("display", "none");

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mousemove", function(event) {
            const [mouseX] = d3.pointer(event);
            const closestYear = fishData.reduce((a, b) => {
                const centerA = xScale(a.year) + xScale.bandwidth() / 2;
                const centerB = xScale(b.year) + xScale.bandwidth() / 2;
                return Math.abs(mouseX - centerA) < Math.abs(mouseX - centerB) ? a : b;
            });

            if (!closestYear) return;

            const data = closestYear;
            const formattedPopulation = Math.round(data.estimated_population);
            const formattedNitrogen = Math.round(data.N_TOTAL_avg);
            const formattedPhosphate = Math.round(data.P_TOTAL_avg);

            tooltip.html(`<strong>Year:</strong> ${data.year} <br>
                        <span style="display:inline-block;width:12px;height:12px;background-color:#4682b4;"></span> Fish Population: ${formattedPopulation} fishes <br>
                        <span style="display:inline-block;width:12px;height:12px;background-color:#FFD700;"></span> Nitrogen: ${formattedNitrogen} μg/L <br>
                        <span style="display:inline-block;width:12px;height:12px;background-color:green;"></span> Phosphate: ${formattedPhosphate} μg/L`)
                .style("display", "block")
                .style("left", (event.pageX + 15)+ "px")
                .style("top", event.pageY - 50 + "px");

            const centerX = xScale(data.year) + xScale.bandwidth() / 2;
            hoverLine.attr("x1", centerX).attr("x2", centerX).attr("y1", 0).attr("y2", height).style("display", "block");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
            hoverLine.style("display", "none");
        });
}

// Function to update the expanded fish card with relevant data and render dual-axis chart
function updateExpandedFishCard(fish) {
    const expandedCard = document.getElementById('expandedFishCard');
    expandedCard.style.display = 'block';

    const fishIntro = fishIntroData.find(item => 
        item.common_name === fish.common_name && item.water_body === fish.water_body
    );

    if (fishIntro) {
        const fishImage = document.getElementById('fishImage');
        const imageName = fish.common_name;
        fishImage.src = `../static/images/${imageName}.jpg`;

        fishImage.onerror = function() {
            this.src = '../static/images/default_fish.jpg';
        };

        document.getElementById('expandedFishName').textContent = fish.common_name;
        document.getElementById('fishDescription').textContent = fishIntro.description;
        document.getElementById('fishDiscussion').textContent = fishIntro.finding;

        const fishData = fishPopulationData.filter(item => 
            item.common_name === fish.common_name && item.water_body === fish.water_body
        );

        if (fishData.length > 0) {
            renderDualAxisChart(fishData);
        } else {
            const chartPlaceholder = document.getElementById('expandedFishChart');
            chartPlaceholder.innerHTML = '<p>No data available for this fish</p>';
        }
    } else {
        console.error('No description data found for', fish.common_name);
    }

    expandedCard.scrollIntoView({ behavior: 'smooth' });
}

// Add event listener to each fish card for expanding
function addCardClickListeners(cards, fishData) {
    cards.forEach((card, index) => {
        card.addEventListener('click', function () {
            updateExpandedFishCard(fishData[index]);
        });
    });
}

// Reset expanded fish card when changing rivers (hides the expanded card)
function resetExpandedFishCard() {
    const expandedCard = document.getElementById('expandedFishCard');
    expandedCard.style.display = 'none';
}

// Update fish cards based on selected river
function updateFishCards(riverName) {
    resetExpandedFishCard();
    const fishContainer = document.getElementById('fishCardsContainer');
    fishContainer.innerHTML = '';

    const filteredFishData = fishPopulationData.filter(fish => fish.water_body === riverName);
    const uniqueFishNames = new Set();

    const filteredUniqueFishData = filteredFishData.filter(fish => {
        if (!uniqueFishNames.has(fish.common_name)) {
            uniqueFishNames.add(fish.common_name);
            return true;
        }
        return false;
    });

    filteredUniqueFishData.forEach(fish => {
        const card = document.createElement('div');
        card.classList.add('fish-card');

        const fishName = document.createElement('div');
        fishName.classList.add('fish-name');
        fishName.innerText = fish.common_name;

        let impactColor;
        switch (fish.impact_level) {
            case 'High Impact':
                impactColor = 'red';
                break;
            case 'Medium Impact':
                impactColor = 'yellow';
                break;
            case 'Low Impact':
                impactColor = 'green';
                break;
        }

        const fishImpact = document.createElement('div');
        fishImpact.classList.add('fish-impact');
        const circle = document.createElement('span');
        circle.classList.add('circle');
        circle.style.backgroundColor = impactColor;

        fishImpact.appendChild(circle);
        fishImpact.append(` ${fish.impact_level}`);

        card.appendChild(fishName);
        card.appendChild(fishImpact);

        fishContainer.appendChild(card);
    });

    const fishCards = document.querySelectorAll('.fish-card');
    addCardClickListeners(fishCards, filteredUniqueFishData);
}

// Initialize map and data on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchFishData().then(() => initializeFishMap());
});

// Information button logic
document.addEventListener("DOMContentLoaded", function() {
    // Show popup and overlay on button click
    document.getElementById("info-button").onclick = function() {
        document.getElementById("popup-text").style.display = "block";
        document.getElementById("popup-overlay").style.display = "block";
    };

    // Hide popup and overlay on close button click
    document.getElementById("close-popup").onclick = function() {
        document.getElementById("popup-text").style.display = "none";
        document.getElementById("popup-overlay").style.display = "none";
    };

    // Hide popup and overlay when clicking outside the popup
    document.getElementById("popup-overlay").onclick = function() {
        document.getElementById("popup-text").style.display = "none";
        document.getElementById("popup-overlay").style.display = "none";
    };
});
