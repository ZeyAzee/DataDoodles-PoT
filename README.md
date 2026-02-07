# DataDoodles-PoT
# The Price of Truth  
### A Data-Driven Storytelling Website on Violence Against Journalists

## Project Overview
**The Price of Truth** is a data-driven storytelling website that explores the human cost of journalism worldwide. Through interactive visualizations, the project shows where and why journalists are killed or imprisoned, highlighting geographic patterns, temporal trends, and individual stories behind the numbers.

---

## Live Website
🔗 https://zeyazee.github.io/DataDoodles-PoT/

---

## Team Members
- Maryam Bagherirad – Data collection, cleaning, and analysis & Narrative Lead 
- Yaugeniya Andreyeva – Visualization design and front-end development  

---

## Data Sources
This project uses publicly available datasets:

- **Committee to Protect Journalists (CPJ)**  
  https://cpj.org/data/  
  Provides detailed records of journalists killed or imprisoned due to their professional activity, including country, year, case status, motive, and type of death.

- **Freedom House – Freedom in the World**  
  https://freedomhouse.org/report/freedom-world  
  Used for contextual background on press freedom and political conditions.

---

## Data Methodology
The analysis focuses on the period **2010–2024**. Only records of journalists **killed or imprisoned in connection with their professional activity** are included.  
Data preprocessing was performed in **Python using Pandas**, executed in **Google Colab**. Dates were converted to yearly values and variables were standardized across datasets. No reclassification of confirmation status was applied; original labels from the source were preserved to maintain data integrity.

---

## Visualization Methodology

The project is implemented as a multi-page interactive dashboard built with **HTML5, Tailwind CSS, and D3.js (v7)**. The visualization strategy focuses on translating complex datasets into a cohesive narrative through several layers of interaction:
* **Visual Encodings:**
* **Linked Interactions:**
* **Individual-Level Granularity:**
* **Performance Optimization:** 

---

## How to Reproduce the Project

### 1. Data Preprocessing (Python)

To recreate the data cleansing and transformation process, follow these steps:

* Install the necessary libraries: `pip install pandas numpy`.
* Run the Jupyter notebooks in the `/Notebooks` folder in strict numerical order:
1. `01_merge_and_filter_cpj.ipynb`: merges the `Killed.csv` and `Imprisoned.csv` files into a single master file.
2. `02_block1_geography_of_danger.ipynb`: prepares aggregated data for maps and geographic charts.
3. `03_block2_risk_profile_case_characteristics.ipynb`: processes data on motives and types of death and normalizes the roles of journalists.
4. `04_block3_time_slice.ipynb`: generates the final CSV files for timelines and the victim registry.


* The results of the scripts are automatically saved in the corresponding subfolders of the `/Data` directory, which are used by D3.js visualizations.

### 2. Serving the Website Locally

Since the project uses **D3.js** to load data via the Fetch API, opening the `index.html` file directly in the browser will result in a CORS error. The site must be run via a local server:

* **VS Code:** Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, open the project folder, and click “Go Live.”
* **Python:** run the command `python -m http.server 8000` in the project's root directory and go to `http://localhost:8000`.
* **Node.js:** use the `serve` package with the command `npx serve .`.

---

## Technology Stack

### **Frontend & Visualization**

* **HTML5 / CSS3 / JavaScript (ES6+):** Basic structure and logic of the web interface.
* **D3.js (v7):** Library for creating dynamic interactive visualizations (maps, graphs, linked views).
* **Tailwind CSS:** Framework for layout and styling in the style of “Top Secret” documentation.
* **Lucide-icons:** A set of vector icons for navigation and UI elements.
* **TopoJSON:** Extension for working with geographic data and rendering a world map.

### **Data Processing & Analysis (Preprocessing)**

* **Python 3.x:** The main language for cleaning, filtering, and preparing data.
* **Pandas:** A key library for manipulating tabular data, combining datasets, and aggregating metrics.
* **NumPy:** Used for mathematical operations and processing data arrays.


---

Folder Structure

```text
.
├── Data/
│   ├── Raw/             # Original downloaded datasets
│   ├── Clean/           # Cleaned master dataset
│   ├── Block 1/         # Geography of Danger datasets
│   ├── Block 2/         # Risk Profile datasets
│   └── Block 3/         # Time Slice datasets
├── Notebooks/           # Data processing and analysis
│   ├── 01_merge_and_filter_cpj.ipynb
│   ├── 02_block1_geography_of_danger.ipynb
│   ├── 03_block2_risk_profile_case_characteristics.ipynb
│   └── 04_block3_time_slice.ipynb
├── css/
│   └── style.css        # Project styling
├── js/
│   ├── block1.js        # Logic for Geography of Danger visualizations
│   ├── block2.js        # Logic for Risk Profile visualizations
│   ├── block3.js        # Logic for Time Slice visualizations
│   └── script.js        # Shared JavaScript functions
├── index.html           # Main dashboard entry point
├── block1.html          # Geography of Danger page
├── block2.html          # Risk Profile page
├── block3.html          # Time Slice page
└── README.md            # Project documentation
```

---

## Limitations
- Underreporting: Data includes only confirmed cases. In countries with strict censorship, actual figures may differ.
- Confirmation Bias: We have retained the division between “Confirmed” and “Unconfirmed” motives in order to communicate honestly the degree of uncertainty in investigations.
- Conflict Zones: Data spikes (e.g., 2023–2024) are closely linked to active phases of regional conflicts, which imposes limitations on long-term forecasting.
---

## License
This project uses publicly available data and is intended for academic and educational purposes.
