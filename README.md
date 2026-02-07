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
The website is built using **HTML, CSS, JavaScript, and D3.js**.  
Cleaned datasets are loaded as CSV files and visualized through interactive charts. Techniques such as linked views, filtering, and time-based brushing are used to help users explore geographic patterns, temporal trends, and individual cases of violence against journalists.

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

## How to Reproduce the Project
1. Run the notebooks in the `/notebooks` folder in numerical order using Google Colab or Jupyter.  
2. Each notebook outputs cleaned CSV files into the corresponding `/data/blockX` folder.  
3. The website loads these CSV files directly for visualization using D3.js.

---

## Technologies Used
- HTML, CSS, JavaScript  
- D3.js  
- Python (Pandas)  
- Google Colab (execution environment)

---

## Limitations
Violence against journalists is often underreported, especially in conflict zones. Data availability and reporting practices vary across countries and years, which may affect comparability. The project reflects documented cases and does not capture unreported incidents.

---

## License
This project uses publicly available data and is intended for academic and educational purposes.
