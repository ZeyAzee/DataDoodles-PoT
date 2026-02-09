/**
 * BLOCK 3: Time Slice
 */

(function() {
    const COLORS = {
        paper: "#f3f0e6",
        ink: "#2b2b2b",
        stamp: "#b71c1c",
        redaction: "#111111"
    };

    const TARGET_NAME = "Israel and the Occupied Palestinian Territory";
    const SHORT_NAME = "Israel";

    let fullData = {};

    // Uploading data
    Promise.all([
        d3.csv("Data/Block 3/timeline_global.csv"),
        d3.csv("Data/Block 3/bubble_country_year.csv"),
        d3.csv("Data/Block 3/status_year.csv"),
        d3.csv("Data/Block 3/beeswarm_raw.csv")
    ]).then(([timeline, bubbles, status, raw]) => {
        fullData.timeline = timeline.map(d => ({ 
            year: +d.year, 
            count: +d.killed_count 
        }));

        fullData.bubbles = bubbles.map(d => ({ 
            country: d.country === TARGET_NAME ? SHORT_NAME : d.country, 
            year: +d.year, 
            count: +d.killed_count 
        }));

        fullData.status = status.map(d => ({ 
            year: +d.year, 
            status: d.case_status, 
            count: +d.count 
        }));

        fullData.raw = raw.map(d => ({ 
            ...d, 
            country: d.country === TARGET_NAME ? SHORT_NAME : d.country,
            year: +d.year 
        }));

        initTimeline();
        updateDependents(2011, 2015); // Start period
    });

    // 1. TIMELINE ( interactive with brush for zooming) ---
    function initTimeline() {
        const container = d3.select("#timeline-chart");
        if (container.empty()) return;
        
        const margin = { top: 20, right: 30, bottom: 30, left: 60 };
        const width = container.node().clientWidth - margin.left - margin.right;
        const height = container.node().clientHeight - margin.top - margin.bottom;

        const svg = container.append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .domain(d3.extent(fullData.timeline, d => d.year))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(fullData.timeline, d => d.count) * 1.1])
            .range([height, 0]);

        svg.append("g")			
            .attr("class", "grid")
            .attr("opacity", 0.1)
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSize(-width)
                .tickFormat("")
            );

        const line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.count))
            .curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(fullData.timeline)
            .attr("fill", "none")
            .attr("stroke", COLORS.ink)
            .attr("stroke-width", 2)
            .attr("d", line);
        
        // X-AXIS
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")))
            .attr("font-family", "Courier Prime")
            .attr("color", COLORS.ink);

        // Y-AXIS
        svg.append("g")
            .call(d3.axisLeft(y).ticks(5))
            .attr("font-family", "Courier Prime")
            .attr("color", COLORS.ink)
            .append("text")
            .attr("fill", COLORS.ink)
            .attr("transform", "rotate(-90)")
            .attr("y", -45)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .attr("class", "uppercase tracking-widest")
            .text("Victims");

        // Tool Brush
        const brush = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on("brush end", (event) => {
                if (!event.selection) return;
                const [x0, x1] = event.selection.map(x.invert);
                updateDependents(Math.round(x0), Math.round(x1));
            });

        const gBrush = svg.append("g")
            .attr("class", "brush")
            .call(brush);

        gBrush.call(brush.move, [x(2011), x(2015)]);
    }

    // UPDATING ALL DEPENDENT GRAPHS ---
    function updateDependents(start, end) {
        updateBubbles(start, end);
        updateStatusPie(start, end);
        updateBeeswarm(start, end);
    }

    function updateBubbles(start, end) {
        const filtered = d3.rollups(
            fullData.bubbles.filter(d => d.year >= start && d.year <= end),
            v => d3.sum(v, d => d.count),
            d => d.country
        ).map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count).slice(0, 15); 

        const container = d3.select("#bubble-chart");
        container.selectAll("svg").remove();
        
        const w = container.node().clientWidth, 
            h = container.node().clientHeight;

        const svg = container.append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("viewBox", `0 0 ${w} ${h}`);

        const zoomGroup = svg.append("g");

        // TOOL ZOOM
        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on("zoom", (event) => {
                zoomGroup.attr("transform", event.transform);
            });

        // PUTTING INVISIBLE LAYER TO CATCH ZOOM EVENTS --- IGNORE ---
        svg.append("rect")
            .attr("width", w)
            .attr("height", h)
            .style("fill", "none")
            .style("pointer-events", "all")
            .call(zoom);

        const root = d3.hierarchy({ children: filtered }).sum(d => d.count);
        d3.pack().size([w, h]).padding(4)(root);

        const nodes = zoomGroup.selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        nodes.append("circle")
            .attr("r", d => d.r)
            .attr("fill", COLORS.paper)
            .attr("stroke", COLORS.ink)
            .attr("stroke-width", 1.5);

        nodes.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".3em")
            .style("font-size", d => Math.min(d.r / 3, 11) + "px")
            .attr("class", "font-serif font-bold")
            .style("pointer-events", "none")
            .text(d => d.data.country);
    }

    function updateStatusPie(start, end) {
        const filtered = d3.rollups(
            fullData.status.filter(d => d.year >= start && d.year <= end),
            v => d3.sum(v, d => d.count),
            d => d.status
        ).map(([status, count]) => ({ status, count }));

        const container = d3.select("#status-pie-chart");
        container.selectAll("*").remove();
        const svg = container.append("svg").attr("width", 220).attr("height", 220)
            .append("g").attr("transform", "translate(110,110)");

        const pie = d3.pie().value(d => d.count);
        const arc = d3.arc().innerRadius(0).outerRadius(105);
        const colors = d3.scaleOrdinal().domain(["killed", "imprisoned"]).range([COLORS.stamp, COLORS.ink]);

        svg.selectAll("path").data(pie(filtered)).join("path")
            .attr("d", arc).attr("fill", d => colors(d.data.status)).attr("stroke", COLORS.paper);

        const legend = container.append("div").attr("class", "flex gap-3 mt-4 text-[15px] font-mono font-bold");
        filtered.forEach(d => {
            legend.append("span").style("color", colors(d.status)).text(`${d.status.toUpperCase()}: ${d.count}`);
        });
    }

    function updateBeeswarm(start, end) {
        // Filtering data but NOT slicing it (removing .slice)
        const data = fullData.raw.filter(d => d.year >= start && d.year <= end);

        const container = d3.select("#beeswarm-chart");
        
        // Clearing the container before rendering new data
        container.selectAll("div").remove();

        container.selectAll("div")
            .data(data)
            .join("div")
            .attr("class", d => {
                const baseClass = "w-2 h-2 rounded-full inline-block m-0.5 transition-transform hover:scale-150 cursor-help";
                const colorClass = d.case_status === 'killed' ? 'bg-stamp' : 'bg-ink';
                return `${baseClass} ${colorClass}`;
            })
            .attr("title", d => `${d.country} | ${d.year} | ${d.role || 'Journalist'}`);
    }
})();