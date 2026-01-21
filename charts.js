const DATA_URL = "data.csv";

// egységes embed opciók
const embedOptions = {
  actions: { export: true, source: false, compiled: false, editor: false },
  renderer: "canvas"
};

async function render() {
  // 1) Megújulók aránya (line + dropdown)
  const renewablesLine = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Megújulók aránya időben (országválasztóval).",
    width: "container",
    height: 280,
    data: { url: DATA_URL },
    params: [
      {
        name: "Country",
        value: "Romania",
        bind: { input: "select", options: ["Romania","Hungary","Germany","France","Sweden"], name: "Ország: " }
      }
    ],
    transform: [{ filter: "datum.country === Country" }],
    mark: { type: "line", point: true },
    encoding: {
      x: { field: "year", type: "quantitative", title: "Év" },
      y: {
        field: "renewables_share",
        type: "quantitative",
        title: "Megújulók aránya (%)",
        scale: { domain: [0, 80] }
      },
      tooltip: [
        { field: "country", title: "Ország" },
        { field: "year", title: "Év" },
        { field: "renewables_share", title: "Megújulók (%)" }
      ]
    },
    config: { background: "transparent" }
  };

  // 2) Szórás: CO2 vs Megújulók (év slider + ország multi select)
  const scatter = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "CO2/fő vs megújulók aránya, év csúszkával.",
    width: "container",
    height: 280,
    data: { url: DATA_URL },
    params: [
      {
        name: "Year",
        value: 2024,
        bind: { input: "range", min: 2010, max: 2024, step: 1, name: "Év: " }
      },
      {
        name: "Pick",
        select: { type: "point", fields: ["country"] },
        bind: "legend"
      }
    ],
    transform: [{ filter: "datum.year === Year" }],
    mark: { type: "circle", size: 180, opacity: 0.9 },
    encoding: {
      x: { field: "renewables_share", type: "quantitative", title: "Megújulók aránya (%)" },
      y: { field: "co2_per_capita", type: "quantitative", title: "CO₂ / fő (t)" },
      color: { field: "country", type: "nominal", title: "Ország" },
      opacity: {
        condition: { param: "Pick", value: 1 },
        value: 0.25
      },
      tooltip: [
        { field: "country", title: "Ország" },
        { field: "year", title: "Év" },
        { field: "renewables_share", title: "Megújulók (%)" },
        { field: "co2_per_capita", title: "CO₂/fő (t)" }
      ]
    },
    config: { background: "transparent" }
  };

  // 3) Hőtérkép: energiaár index (country x year)
  const heatmap = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Energiaár index hőtérkép.",
    width: "container",
    height: 280,
    data: { url: DATA_URL },
    mark: { type: "rect" },
    encoding: {
      x: { field: "year", type: "ordinal", title: "Év" },
      y: { field: "country", type: "nominal", title: "Ország" },
      color: { field: "energy_price_index", type: "quantitative", title: "Árindex (2010=100)" },
      tooltip: [
        { field: "country", title: "Ország" },
        { field: "year", title: "Év" },
        { field: "energy_price_index", title: "Árindex" }
      ]
    },
    config: { background: "transparent" }
  };

  // 4) Oszlop: 2010→2024 megújuló növekedés (delta)
  const deltaBars = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Megújulók arányának változása 2010 és 2024 között.",
    width: "container",
    height: 280,
    data: { url: DATA_URL },
    transform: [
      { filter: "datum.year === 2010 || datum.year === 2024" },
      {
        pivot: "year",
        value: "renewables_share",
        groupby: ["country"]
      },
      {
        calculate: "datum['2024'] - datum['2010']",
        as: "delta"
      }
    ],
    mark: { type: "bar" },
    encoding: {
      y: { field: "country", type: "nominal", sort: "-x", title: "Ország" },
      x: { field: "delta", type: "quantitative", title: "Változás (százalékpont)" },
      tooltip: [
        { field: "country", title: "Ország" },
        { field: "2010", title: "2010 (%)" },
        { field: "2024", title: "2024 (%)" },
        { field: "delta", title: "Változás (pp)" }
      ]
    },
    config: { background: "transparent" }
  };

  await vegaEmbed("#chartRenewablesLine", renewablesLine, embedOptions);
  await vegaEmbed("#chartScatter", scatter, embedOptions);
  await vegaEmbed("#chartHeatmap", heatmap, embedOptions);
  await vegaEmbed("#chartDeltaBars", deltaBars, embedOptions);
}

render().catch(console.error);
