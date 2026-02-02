# Swastiik Chart API Documentation

This document provides a comprehensive reference for the `Chart` class. Every function and argument is detailed below.

---

## Class: `Chart`

### `constructor(container)`
Initializes the chart within a specific DOM element.

**Arguments:**
| Name | Type | Description |
| :--- | :--- | :--- |
| `container` | `HTMLElement` | The DOM element (e.g., a `div`) where the chart will be mounted. |

**Example:**
```javascript
const el = document.getElementById('chart-id');
const chart = new Chart(el);
```

---

### `addSeries(type, name, options)`
Adds a standard data series to the chart.

**Arguments:**
| Name | Type | Description |
| :--- | :--- | :--- |
| `type` | `String` | Type of series. Options: `'candlestick'`, `'line'`, `'area'`, `'histogram'`. |
| `name` | `String` | A unique identifier for this series (used to retrieve it later). |
| `options` | `Object` | (Optional) Configuration object for style and behavior. |

**Returns:** `ISeriesApi` (The created series instance)

**Example:**
```javascript
const series = chart.addSeries('candlestick', 'main', {
    upColor: 'green',
    downColor: 'red',
});
```

---

### `addCustomSeries(customSeriesDefinition, name, options)`
Adds a custom-drawn series using the Lightweight Charts v5 API.

**Arguments:**
| Name | Type | Description |
| :--- | :--- | :--- |
| `customSeriesDefinition` | `Object` | Object with `renderer()` (factory), `update()`, and `defaultOptions`. |
| `name` | `String` | A unique identifier for this custom series. |
| `options` | `Object` | (Optional) Initial style definitions. |

**Returns:** `ICustomSeriesApi` (The created custom series instance)

**Example:**
```javascript
const customDef = { renderer: () => new CirclePaneView(), ... };
chart.addCustomSeries(customDef, 'circles', { color: 'blue' });
```

---

### `removeSeries(name)`
Removes a specific series from the chart via its unique name.

**Arguments:**
| Name | Type | Description |
| :--- | :--- | :--- |
| `name` | `String` | The unique name assigned during `addSeries`. |

**Example:**
```javascript
chart.removeSeries('main');
```

---

### `getSeriesByName(name)`
Retrieves a series instance using its unique name.

**Arguments:**
| Name | Type | Description |
| :--- | :--- | :--- |
| `name` | `String` | The unique name of the series to find. |

**Returns:** `ISeriesApi` | `undefined`

**Example:**
```javascript
const series = chart.getSeriesByName('main');
series.setData([...]);
```

---

### `getSeries()`
Retrieves all series currently on the chart.

**Returns:** `Array<ISeriesApi>` (Array of all series instances)

**Example:**
```javascript
const all = chart.getSeries();
console.log(`Found ${all.length} series`);
```

---

### `applyOptions(options)`
Updates the global configuration of the chart (layout, grid, scales, etc.).

**Arguments:**
| Name | Type | Description |
| :--- | :--- | :--- |
| `options` | `Object` | Deep partial object containing configuration overrides. |

**Example:**
```javascript
chart.applyOptions({
    layout: { backgroundColor: '#111' },
    grid: { vertLines: { visible: false } }
});
```

---

### `fitContent()`
Automatically adjusts the time scale (X-axis) to fit all available data points within the view.

**Example:**
```javascript
chart.fitContent();
```

---

### `subscribeCrosshairMove(callback)`
Registers a function to be called whenever the crosshair moves across the chart.

**Arguments:**
| Name | Type | Description |
| :--- | :--- | :--- |
| `callback` | `Function` | Function to execute on move. Receives `param` object. |

**Callback Parameter (`param`):**
- `time`: (Number|Object) The time of the bar under the cursor.
- `point`: (Object `{x, y}`) Cartesian coordinates of the cursor.
- `seriesData`: (Map) Map of `SeriesApi` to the data value at that location.

**Example:**
```javascript
chart.subscribeCrosshairMove((param) => {
    if (param.time) {
        console.log('Price at cursor:', param.seriesData.get(mySeries));
    }
});
```

---

### `addOverlay(id, content, positionCallback)`
Places a custom HTML element on top of the chart canvas.

**Arguments:**
| Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `String` | Unique ID for this overlay element. |
| `content` | `String`\|`HTMLElement` | The HTML content to display (e.g., '<div>Buy</div>'). |
| `positionCallback` | `Function` | Function that determines where the element is placed. |

**Position Callback:**
- **Input:** `(chartInstance)`
- **Output:** Object `{ x: number, y: number, visible: boolean, centerX: boolean }`

**Returns:** `HTMLElement` (The created wrapper div)

**Example:**
```javascript
chart.addOverlay('label-1', '<span>Top</span>', (chart) => {
    return { x: 500, y: 100, visible: true };
});
```

---

### `removeOverlay(id)`
Removes an overlay element from the DOM.

**Arguments:**
| Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `String` | The unique ID of the overlay to remove. |

**Example:**
```javascript
chart.removeOverlay('label-1');
```

---

### `updateOverlays()`
Forces a recalculation of all overlay positions. Useful if external data changes affecting positions.

**Example:**
```javascript
chart.updateOverlays();
```

---
---

## Configuration Object Reference
Detailed options for `applyOptions`.

### `layout`
| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `background` | `Object` | `{ type: 'solid', color: '#0C0C0C' }` | Background style. |
| `textColor` | `String` | `'#F9F9F9'` | Color of scales and labels. |

### `grid`
| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `vertLines` | `Object` | `{ color: '#404040' }` | Vertical grid lines style. |
| `horzLines` | `Object` | `{ color: '#404040' }` | Horizontal grid lines style. |

### `timeScale`
| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `timeVisible` | `Boolean` | `true` | Show time in crosshair label. |
| `secondsVisible` | `Boolean` | `false` | Show seconds in time scale. |
| `borderColor` | `String` | `'#C5CBCE'` | Color of bottom border. |

### `rightPriceScale`
| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `visible` | `Boolean` | `true` | Show price scale. |
| `borderColor` | `String` | `'#C5CBCE'` | Color of right border. |
| `autoScale` | `Boolean` | `true` | Automatically fit price range. |
