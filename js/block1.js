/**
 * BLOCK 1: THE GEOGRAPHY OF DANGER
 */

const COLORS = {
    stamp: "#b71c1c",
    ink: "#2b2b2b",
    paperDark: "#e3dfd0",
    paper: "#f3f0e6"
};

let fullMapData, fullTimelineData, fullImpunityData;

// Маппинг для синхронизации карты (TopoJSON) и баз данных (CSV)
const countryNameMap = {
    "United States of America": "USA",
    "Russian Federation": "Russia",
    "Israel": "Israel and the Occupied Palestinian Territory",
    "Syrian Arab Republic": "Syria"
};

// Функция для получения "технического" имени из CSV
function getCsvName(geoName) {
    return countryNameMap[geoName] || geoName;
}

// Функция для получения "красивого" имени для сайта
function getDisplayName(name) {
    if (name === "Israel and the Occupied Palestinian Territory") return "Israel";
    return name;
}

// Загрузка данных
Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
    d3.csv("Data/Block 1/map_country_total.csv"),
    d3.csv("Data/Block 1/timeline_country.csv"),
    d3.csv("Data/Block 1/impunity_country.csv")
]).then(([world, mapData, timelineData, impunityData]) => {
    fullMapData = mapData;
    fullTimelineData = timelineData;
    fullImpunityData = impunityData;

    const countries = topojson.feature(world, world.objects.countries);
    
    calculateKeyData(); // Считаем данные для правого блока
    drawMap(countries); // Рисуем карту
    updateCharts("Mexico"); // Стартовая страна
});

// --- 1. KEY DATA (АВТОМАТИЧЕСКИЙ РАСЧЕТ) ---
function calculateKeyData() {
    const totalVictims = d3.sum(fullMapData, d => +d.killed_count);
    
    // Находим самую опасную запись
    const topEntry = fullMapData.reduce((prev, curr) => (+prev.killed_count > +curr.killed_count) ? prev : curr);
    
    // Расчет общей безнаказанности
    const totalConfirmed = d3.sum(fullImpunityData.filter(d => d.case_type === 'confirmed'), d => +d.count);
    const totalUnconfirmed = d3.sum(fullImpunityData.filter(d => d.case_type === 'unconfirmed'), d => +d.count);
    const globalRate = Math.round((totalUnconfirmed / (totalConfirmed + totalUnconfirmed)) * 100);

    // Вывод в HTML с заменой имени
    d3.select("#key-total-victims").text(totalVictims.toLocaleString() + "+");
    d3.select("#key-dangerous-zone").text(getDisplayName(topEntry.country));
    d3.select("#key-impunity-rate").text(globalRate + "%");
}

// --- 2. ОБНОВЛЕНИЕ ГРАФИКОВ ---
function updateCharts(countryName) {
    const csvName = countryName; // Имя для поиска в базе
    const displayName = getDisplayName(countryName); // Имя для заголовка (Israel)

    const hasData = fullMapData.some(d => d.country === csvName);

    d3.selectAll(".country-name").text(displayName);
    d3.select("#selected-country-label").text(`[REG: ${displayName.toUpperCase()}]`);

    if (!hasData) {
        showNoDataPlaceholder("#timeline-viz");
        showNoDataPlaceholder("#impunity-viz");
    } else {
        renderTimeline(csvName);
        renderImpunity(csvName);
    }
}

// Заглушка для пустых стран
function showNoDataPlaceholder(selector) {
    const container = d3.select(selector);
    container.selectAll("*").remove();
    container.append("div")
        .attr("class", "absolute inset-0 flex items-center justify-center font-mono text-lg font-bold text-stamp/30 rotate-[-5deg] border-2 border-dashed border-stamp/10 m-4 text-center")
        .html("NO SUCH<br>DATA");
}

// --- 3. TIMELINE (Area Chart) ---
function renderTimeline(countryName) {
    const container = d3.select("#timeline-viz");
    container.selectAll("*").remove();
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    const margin = { top: 10, right: 15, bottom: 25, left: 30 };

    const data = fullTimelineData.filter(d => d.country === countryName)
        .map(d => ({ year: +d.year, count: +d.killed_count }))
        .sort((a, b) => a.year - b.year);

    if (!data.length) { showNoDataPlaceholder("#timeline-viz"); return; }

    const svg = container.append("svg").attr("viewBox", [0, 0, width, height]);
    const x = d3.scaleLinear().domain(d3.extent(data, d => d.year)).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.count)]).range([height - margin.bottom, margin.top]);

    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d"))).attr("class", "font-mono text-[9px]");
    svg.append("g").attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(3)).attr("class", "font-mono text-[9px]");

    const area = d3.area().x(d => x(d.year)).y0(height - margin.bottom).y1(d => y(d.count)).curve(d3.curveMonotoneX);
    svg.append("path").datum(data).attr("fill", COLORS.stamp).attr("opacity", 0.2).attr("d", area);
    svg.append("path").datum(data).attr("fill", "none").attr("stroke", COLORS.stamp).attr("stroke-width", 2).attr("d", d3.line().x(d => x(d.year)).y(d => y(d.count)).curve(d3.curveMonotoneX));
}

// --- 4. DONUT (Donut Chart + Legend) ---
function renderImpunity(countryName) {
    const container = d3.select("#impunity-viz");
    container.selectAll("*").remove();
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    const margin = { top: 5, bottom: 60 }; 
    const radius = Math.min(width, height - margin.bottom) / 2 - 5;

    const stats = fullImpunityData.filter(d => d.country === countryName);
    const confirmed = +((stats.find(d => d.case_type === 'confirmed') || {}).count || 0);
    const unconfirmed = +((stats.find(d => d.case_type === 'unconfirmed') || {}).count || 0);
    const total = confirmed + unconfirmed;

    if (total === 0) { showNoDataPlaceholder("#impunity-viz"); return; }

    const rate = Math.round((unconfirmed / total) * 100);
    const svg = container.append("svg").attr("viewBox", [0, 0, width, height]);
    const chartGroup = svg.append("g").attr("transform", `translate(${width / 2}, ${radius + margin.top})`);

    const pieData = [
        { label: 'Unconfirmed', val: unconfirmed, color: COLORS.stamp },
        { label: 'Confirmed', val: confirmed, color: COLORS.ink }
    ];

    const pie = d3.pie().value(d => d.val).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius * 1.0);

    chartGroup.selectAll("path").data(pie(pieData)).join("path").attr("d", arc).attr("fill", d => d.data.color).attr("stroke", COLORS.paper).style("stroke-width", "2px");
    chartGroup.append("text").attr("text-anchor", "middle").attr("dy", ".35em").attr("class", "font-serif font-bold text-3xl").text(`${rate}%`);

    // Легенда в столбик
    const legend = svg.append("g").attr("transform", `translate(${width / 2 - 55}, ${radius * 2 + margin.top + 15})`);
    const legendItems = legend.selectAll(".legend-item").data(pieData).enter().append("g").attr("transform", (d, i) => `translate(0, ${i * 18})`);
    legendItems.append("rect").attr("width", 10).attr("height", 10).attr("fill", d => d.color);
    legendItems.append("text").attr("x", 20).attr("y", 10).attr("class", "font-mono text-[15px] uppercase").text(d => `${d.label}: ${d.val}`);
}

// --- 5. БЕСКОНЕЧНАЯ КАРТА ---
function drawMap(geoData) {
    const container = d3.select("#map-viz");
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    container.selectAll("*").remove();

    const svg = container.append("svg").attr("width", "100%").attr("height", "100%").attr("viewBox", [0, 0, width, height]).style("cursor", "move");
    const g = svg.append("g");
    const projection = d3.geoMercator().scale(width / 6.5).translate([width / 2, height / 1.4]);
    const path = d3.geoPath().projection(projection);
    const deathsMap = new Map(fullMapData.map(d => [d.country, +d.killed_count]));
    const colorScale = d3.scaleThreshold().domain([1, 5, 20, 50, 100]).range(["#f3f0e6", "#ffcdd2", "#ef9a9a", "#e57373", "#ef5350", "#b71c1c"]);

    const worldWidth = projection.scale() * 2 * Math.PI;

    [-1, 0, 1].forEach(offset => {
        const layer = g.append("g").attr("transform", `translate(${offset * worldWidth}, 0)`);
        layer.selectAll("path").data(geoData.features).join("path").attr("d", path)
            .attr("fill", d => {
                const val = deathsMap.get(getCsvName(d.properties.name));
                return val ? colorScale(val) : COLORS.paperDark;
            })
            .attr("stroke", COLORS.ink).attr("stroke-width", 0.5).attr("class", "country-path")
            .on("click", function(event, d) {
                const name = getCsvName(d.properties.name);
                updateCharts(name);
                d3.selectAll(".country-path").attr("stroke", COLORS.ink).attr("stroke-width", 0.5);
                d3.selectAll(".country-path").filter(p => p.properties.name === d.properties.name).attr("stroke", COLORS.stamp).attr("stroke-width", 1.5);
            });
    });

    const zoom = d3.zoom().scaleExtent([1, 12]).on("zoom", (event) => {
        let {x, y, k} = event.transform;
        x = x % (worldWidth * k); if (x > 0) x -= (worldWidth * k);
        g.attr("transform", `translate(${x},${y}) scale(${k})`);
    });
    svg.call(zoom);
}