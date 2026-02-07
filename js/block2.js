(function() {
    const config = {
        colors: {
            ink: "#2b2b2b",
            stamp: "#b71c1c",
            paper: "#f3f0e6",
            freelance: "#b5b32e",
            other: "#c58936"
        },
        fonts: { mono: '"Courier Prime", monospace' }
    };

    let state = {
        selectedMotive: "Confirmed",
        data: { overview: [], death: [], employment: [] }
    };

    Promise.all([
        d3.csv("Data/Block 2/motive_overview.csv"),
        d3.csv("Data/Block 2/motive_type_of_death.csv"),
        d3.csv("Data/Block 2/motive_employment.csv")
    ]).then(([overview, death, employment]) => {
        state.data.overview = overview;
        state.data.death = death;
        state.data.employment = employment;
        renderAll();
        window.addEventListener('resize', renderAll);
    });

    function renderAll() {
        renderBarChart();
        renderTreemap();
        renderWaffleChart();
    }

    function renderBarChart() {
        const container = d3.select("#motive-bar-chart");
        container.selectAll("*").remove();

        // Увеличены отступы слева (для текста) и справа (для цифр)
        const margin = { top: 10, right: 40, bottom: 20, left: 120 };
        const width = container.node().clientWidth - margin.left - margin.right;
        const height = container.node().clientHeight - margin.top - margin.bottom;

        const svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .domain([0, d3.max(state.data.overview, d => +d.killed_count)])
            .range([0, width]);

        const y = d3.scaleBand()
            .domain(state.data.overview.map(d => d.motive))
            .range([0, height])
            .padding(0.4); // Увеличен отступ между барами

        svg.selectAll("rect")
            .data(state.data.overview)
            .enter()
            .append("rect")
            .attr("y", d => y(d.motive))
            .attr("width", d => x(+d.killed_count))
            .attr("height", y.bandwidth())
            .attr("fill", d => d.motive === state.selectedMotive ? config.colors.stamp : config.colors.ink)
            .attr("class", "cursor-pointer transition-all duration-300 hover:opacity-80")
            .on("click", (e, d) => {
                state.selectedMotive = d.motive;
                d3.select("#selected-motive-label").text(d.motive.toUpperCase());
                renderAll();
            });

        svg.append("g")
            .call(d3.axisLeft(y).tickSize(0).tickPadding(15)) // Увеличен отступ текста от осей
            .attr("font-family", config.fonts.mono)
            .attr("font-size", "13px")
            .select(".domain").remove();

        svg.selectAll(".val")
            .data(state.data.overview)
            .enter()
            .append("text")
            .attr("x", d => x(+d.killed_count) + 10)
            .attr("y", d => y(d.motive) + y.bandwidth()/2 + 5)
            .attr("font-family", config.fonts.mono)
            .text(d => d.killed_count);
    }

    function renderTreemap() {
        const container = d3.select("#death-treemap");
        container.selectAll("*").remove();

        // Размеры с учетом внутренних отступов контейнера
        const width = container.node().clientWidth - 16;
        const height = container.node().clientHeight - 16;

        const filtered = state.data.death.filter(d => d.motive === state.selectedMotive);
        
        // Считаем общую сумму для вычисления пропорций
        const totalCount = d3.sum(filtered, d => +d.count);

        // Увеличиваем визуальный вес маленьких категорий, чтобы их было видно
        const displayData = filtered.map(d => ({
            ...d,
            // Каждая категория получит минимум 6% площади, даже если там мало случаев
            displayValue: Math.max(+d.count, totalCount * 0.06) 
        }));

        const root = d3.hierarchy({ children: displayData })
            .sum(d => d.displayValue)
            .sort((a, b) => b.value - a.value);

        d3.treemap()
            .size([width, height])
            .paddingInner(2)
            .round(true)(root);

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("overflow", "visible");

        const cells = svg.selectAll("g")
            .data(root.leaves())
            .enter().append("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

        // Отрисовка прямоугольников
        cells.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", config.colors.ink)
            .attr("stroke", config.colors.paper)
            .attr("opacity", (d, i) => 1 - (i * 0.15))
            .append("title") 
            .text(d => `${d.data.type_of_death}: ${d.data.count} cases`); // Данные остаются в тултипе

        // Отрисовка текста (только название, без скобок)
        cells.append("text")
            .attr("x", 8)
            .attr("y", 22)
            .attr("fill", config.colors.paper)
            .attr("font-size", "11px")
            .attr("font-family", config.fonts.mono)
            .style("text-transform", "uppercase")
            .text(d => {
                // Показываем текст, только если прямоугольник достаточно широкий
                const label = d.data.type_of_death;
                return (d.x1 - d.x0 > 45) ? label : "";
            })
            .each(function(d) {
                // Если текст слишком длинный для блока, пробуем перенести его (опционально)
                const el = d3.select(this);
                if (d.x1 - d.x0 < 100 && el.text().includes(" ")) {
                    const words = el.text().split(" ");
                    el.text("");
                    el.append("tspan").attr("x", 8).attr("dy", "0em").text(words[0]);
                    el.append("tspan").attr("x", 8).attr("dy", "1.2em").text(words[1] || "");
                }
            });
    }

    function renderWaffleChart() {
        const container = d3.select("#employment-waffle");
        const legend = d3.select("#waffle-legend");
        container.selectAll("*").remove();
        legend.selectAll("*").remove();

        const filtered = state.data.employment.filter(d => d.motive === state.selectedMotive);
        const total = d3.sum(filtered, d => +d.count);
        
        const waffleData = [];
        filtered.forEach(d => {
            const count = Math.round((+d.count / total) * 100);
            for(let n=0; n<count; n++) if(waffleData.length < 100) waffleData.push({ type: d.employment_type });
        });
        while(waffleData.length < 100) waffleData.push({ type: filtered[0].employment_type });

        // Рассчитываем размер сетки с учетом оступов
        const availableHeight = container.node().clientHeight - 20;
        const size = Math.min(260, availableHeight);
        const cellSize = (size / 10) - 3; // Увеличен зазор между квадратами

        const svg = container.append("svg")
            .attr("width", size)
            .attr("height", size);

        svg.selectAll("rect")
            .data(waffleData)
            .enter().append("rect")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", (d, i) => (i % 10) * (cellSize + 3))
            .attr("y", (d, i) => Math.floor(i / 10) * (cellSize + 3))
            .attr("fill", d => {
                if (d.type === 'staff') return config.colors.ink;
                if (d.type === 'freelance') return config.colors.freelance;
                if (d.type === 'other') return config.colors.other;
                return 'transparent';
            })
            .attr("stroke", config.colors.ink)
            .attr("rx", 1);

        filtered.forEach(d => {
            const perc = Math.round((+d.count/total)*100);
            let color = config.colors.ink;
            if (d.employment_type === 'freelance') color = config.colors.freelance;
            if (d.employment_type === 'other') color = config.colors.other;

            legend.append("div").attr("class", "flex items-center")
                .html(`<span class="w-4 h-4 mr-2 border border-ink" style="background-color: ${color}"></span> 
                       <span class="uppercase">${d.employment_type}</span> <span class="ml-1 opacity-60">${perc}%</span>`);
        });
    }
})();