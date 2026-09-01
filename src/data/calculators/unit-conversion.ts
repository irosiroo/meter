/**
 * METER · Unit Conversion (22 tools)
 *
 * Every converter is built from the `converter()` factory: a value + from/to
 * selects, a headline result, forward/reverse rates and a full comparison
 * table. Linear units come from the `units([key,label,factor])` helper; the
 * affine ones (temperature) and reciprocal ones (fuel economy) supply their
 * own toBase / fromBase functions.
 */

import { converter, units } from "../../lib/calc/factories";
import type { UnitDef } from "../../lib/calc/factories";
import type { CalcSpec } from "../../lib/calc/types";

const tempUnits: UnitDef[] = [
  { key: "C", label: "Celsius (°C)", toBase: (v) => v + 273.15, fromBase: (v) => v - 273.15 },
  { key: "F", label: "Fahrenheit (°F)", toBase: (v) => ((v - 32) * 5) / 9 + 273.15, fromBase: (v) => ((v - 273.15) * 9) / 5 + 32 },
  { key: "K", label: "Kelvin (K)", factor: 1 },
  { key: "R", label: "Rankine (°R)", toBase: (v) => (v * 5) / 9, fromBase: (v) => (v * 9) / 5 },
];

const fuelUnits: UnitDef[] = [
  { key: "L/100km", label: "Litres per 100 km (L/100km)", factor: 1 },
  { key: "mpgUS", label: "Miles per gallon (US)", toBase: (v) => 235.214583 / v, fromBase: (v) => 235.214583 / v },
  { key: "mpgUK", label: "Miles per gallon (UK)", toBase: (v) => 282.480936 / v, fromBase: (v) => 282.480936 / v },
  { key: "km/L", label: "Kilometres per litre (km/L)", toBase: (v) => 100 / v, fromBase: (v) => 100 / v },
];

export const CALCULATORS: CalcSpec[] = [
  converter({
    id: "length-converter", name: "Length Converter", base: "metre",
    description: "Convert between metric and imperial units of length and distance.",
    keywords: ["length", "distance", "metre", "feet", "inch", "mile", "km"],
    icon: "Ruler", featured: true, popularity: 95,
    units: units([
      ["nm", "Nanometre (nm)", 1e-9], ["µm", "Micrometre (µm)", 1e-6], ["mm", "Millimetre (mm)", 0.001],
      ["cm", "Centimetre (cm)", 0.01], ["m", "Metre (m)", 1], ["km", "Kilometre (km)", 1000],
      ["in", "Inch (in)", 0.0254], ["ft", "Foot (ft)", 0.3048], ["yd", "Yard (yd)", 0.9144],
      ["mi", "Mile (mi)", 1609.344], ["nmi", "Nautical mile", 1852], ["ly", "Light-year", 9.4607304725808e15],
    ]),
    def: ["km", "mi"], defValue: 10,
    examples: [
      { label: "1 km in metres", inputs: { value: 1, from: "km", to: "m" }, expect: "1,000" },
      { label: "1 mile in km", inputs: { value: 1, from: "mi", to: "km" }, expect: "1.6093" },
    ],
  }),
  converter({
    id: "weight-converter", name: "Weight & Mass Converter", base: "gram",
    description: "Convert grams, kilograms, pounds, ounces, stones and tonnes.",
    keywords: ["weight", "mass", "kg", "pound", "ounce", "gram", "stone"],
    icon: "Weight", featured: true, popularity: 92,
    units: units([
      ["mg", "Milligram (mg)", 0.001], ["g", "Gram (g)", 1], ["kg", "Kilogram (kg)", 1000],
      ["t", "Tonne (t)", 1e6], ["oz", "Ounce (oz)", 28.349523125], ["lb", "Pound (lb)", 453.59237],
      ["st", "Stone (st)", 6350.29318], ["ton", "US ton", 907184.74], ["lt", "Long ton (UK)", 1016046.9088],
    ]),
    def: ["kg", "lb"], defValue: 1,
    examples: [
      { label: "1 kg in pounds", inputs: { value: 1, from: "kg", to: "lb" }, expect: "2.2046" },
      { label: "1 lb in grams", inputs: { value: 1, from: "lb", to: "g" }, expect: "453" },
    ],
  }),
  converter({
    id: "temperature-converter", name: "Temperature Converter", base: "kelvin",
    description: "Convert Celsius, Fahrenheit, Kelvin and Rankine with correct offsets.",
    keywords: ["temperature", "celsius", "fahrenheit", "kelvin", "degrees", "heat"],
    icon: "Thermometer", featured: true, popularity: 90,
    units: tempUnits, def: ["C", "F"], defValue: 100,
    how: "Temperature scales have different zero points, so each unit converts through Kelvin: to Kelvin on the way in, back out to the target scale. That keeps 0 °C = 32 °F = 273.15 K exact.",
    examples: [
      { label: "100 °C in °F", inputs: { value: 100, from: "C", to: "F" }, expect: "212" },
      { label: "0 °C in Kelvin", inputs: { value: 0, from: "C", to: "K" }, expect: "273" },
    ],
  }),
  converter({
    id: "area-converter", name: "Area Converter", base: "square metre",
    description: "Convert square metres, acres, hectares, square feet and more.",
    keywords: ["area", "square", "acre", "hectare", "square feet", "land"],
    icon: "Square", popularity: 78,
    units: units([
      ["mm2", "Square millimetre (mm²)", 1e-6], ["cm2", "Square centimetre (cm²)", 1e-4],
      ["m2", "Square metre (m²)", 1], ["ha", "Hectare (ha)", 1e4], ["km2", "Square kilometre (km²)", 1e6],
      ["in2", "Square inch (in²)", 0.00064516], ["ft2", "Square foot (ft²)", 0.09290304],
      ["yd2", "Square yard (yd²)", 0.83612736], ["ac", "Acre", 4046.8564224], ["mi2", "Square mile (mi²)", 2589988.110336],
    ]),
    def: ["m2", "ft2"], defValue: 100,
    examples: [
      { label: "1 hectare in m²", inputs: { value: 1, from: "ha", to: "m2" }, expect: "10,000" },
      { label: "1 acre in m²", inputs: { value: 1, from: "ac", to: "m2" }, expect: "4,046" },
    ],
  }),
  converter({
    id: "volume-converter", name: "Volume Converter", base: "litre",
    description: "Convert litres, millilitres, gallons, cups, pints and cubic metres.",
    keywords: ["volume", "litre", "gallon", "cup", "pint", "millilitre", "cubic"],
    icon: "FlaskRound", popularity: 80,
    units: units([
      ["ml", "Millilitre (ml)", 0.001], ["l", "Litre (l)", 1], ["m3", "Cubic metre (m³)", 1000],
      ["cm3", "Cubic centimetre (cm³)", 0.001], ["tsp", "Teaspoon (US)", 0.00492892159375],
      ["tbsp", "Tablespoon (US)", 0.01478676478125], ["floz", "Fluid ounce (US)", 0.0295735295625],
      ["cup", "Cup (US)", 0.2365882365], ["pt", "Pint (US)", 0.473176473], ["qt", "Quart (US)", 0.946352946],
      ["gal", "Gallon (US)", 3.785411784], ["galUK", "Gallon (UK)", 4.54609],
    ]),
    def: ["l", "gal"], defValue: 10,
    examples: [
      { label: "1 gallon (US) in litres", inputs: { value: 1, from: "gal", to: "l" }, expect: "3.7854" },
      { label: "1 m³ in litres", inputs: { value: 1, from: "m3", to: "l" }, expect: "1,000" },
    ],
  }),
  converter({
    id: "speed-converter", name: "Speed Converter", base: "metre per second",
    description: "Convert m/s, km/h, mph, knots and the speed of light.",
    keywords: ["speed", "velocity", "mph", "kmh", "knot", "mach"],
    icon: "Gauge", popularity: 76,
    units: units([
      ["mps", "Metre per second (m/s)", 1], ["kph", "Kilometre per hour (km/h)", 0.277777778],
      ["mph", "Mile per hour (mph)", 0.44704], ["fps", "Foot per second (ft/s)", 0.3048],
      ["kn", "Knot (kn)", 0.514444444], ["mach", "Mach (sea level)", 340.29], ["c", "Speed of light", 299792458],
    ]),
    def: ["kph", "mph"], defValue: 100,
    examples: [
      { label: "100 km/h in mph", inputs: { value: 100, from: "kph", to: "mph" }, expect: "62.137" },
      { label: "1 knot in km/h", inputs: { value: 1, from: "kn", to: "kph" }, expect: "1.852" },
    ],
  }),
  converter({
    id: "time-converter", name: "Time Converter", base: "second",
    description: "Convert seconds, minutes, hours, days, weeks, months and years.",
    keywords: ["time", "seconds", "minutes", "hours", "days", "weeks", "years"],
    icon: "Clock", popularity: 74,
    units: units([
      ["ms", "Millisecond (ms)", 0.001], ["s", "Second (s)", 1], ["min", "Minute (min)", 60],
      ["h", "Hour (h)", 3600], ["d", "Day (d)", 86400], ["wk", "Week (wk)", 604800],
      ["mo", "Month (30.44 d)", 2629746], ["yr", "Year (365.25 d)", 31557600], ["dec", "Decade", 315576000],
    ]),
    def: ["h", "min"], defValue: 1,
    examples: [
      { label: "1 hour in minutes", inputs: { value: 1, from: "h", to: "min" }, expect: "60" },
      { label: "1 day in seconds", inputs: { value: 1, from: "d", to: "s" }, expect: "86,400" },
    ],
  }),
  converter({
    id: "data-storage-converter", name: "Data Storage Converter", base: "byte",
    description: "Convert bytes, kilobytes, gigabytes and the binary KiB/MiB/GiB units.",
    keywords: ["data", "storage", "byte", "gigabyte", "megabyte", "kib", "gib"],
    icon: "HardDrive", popularity: 72,
    units: units([
      ["bit", "Bit (b)", 0.125], ["B", "Byte (B)", 1], ["KB", "Kilobyte (KB, 10³)", 1e3],
      ["MB", "Megabyte (MB, 10⁶)", 1e6], ["GB", "Gigabyte (GB, 10⁹)", 1e9], ["TB", "Terabyte (TB, 10¹²)", 1e12],
      ["KiB", "Kibibyte (KiB, 2¹⁰)", 1024], ["MiB", "Mebibyte (MiB, 2²⁰)", 1048576],
      ["GiB", "Gibibyte (GiB, 2³⁰)", 1073741824], ["TiB", "Tebibyte (TiB, 2⁴⁰)", 1099511627776],
    ]),
    def: ["GB", "MB"], defValue: 1,
    examples: [
      { label: "1 GB in MB", inputs: { value: 1, from: "GB", to: "MB" }, expect: "1,000" },
      { label: "1 GiB in bytes", inputs: { value: 1, from: "GiB", to: "B" }, expect: "1,073,741,824" },
    ],
  }),
  converter({
    id: "pressure-converter", name: "Pressure Converter", base: "pascal",
    description: "Convert pascals, bar, psi, atmospheres, mmHg and torr.",
    keywords: ["pressure", "pascal", "bar", "psi", "atmosphere", "mmhg", "torr"],
    icon: "Gauge", popularity: 66,
    units: units([
      ["Pa", "Pascal (Pa)", 1], ["hPa", "Hectopascal (hPa)", 100], ["kPa", "Kilopascal (kPa)", 1000],
      ["MPa", "Megapascal (MPa)", 1e6], ["bar", "Bar", 1e5], ["mbar", "Millibar (mbar)", 100],
      ["atm", "Atmosphere (atm)", 101325], ["psi", "Pounds per sq. inch (psi)", 6894.757293],
      ["mmHg", "Millimetre of mercury", 133.322387], ["torr", "Torr", 133.322368],
    ]),
    def: ["bar", "psi"], defValue: 1,
    examples: [
      { label: "1 atm in kPa", inputs: { value: 1, from: "atm", to: "kPa" }, expect: "101.32" },
      { label: "1 bar in psi", inputs: { value: 1, from: "bar", to: "psi" }, expect: "14.503" },
    ],
  }),
  converter({
    id: "energy-converter", name: "Energy Converter", base: "joule",
    description: "Convert joules, calories, kilowatt-hours, BTU and electronvolts.",
    keywords: ["energy", "joule", "calorie", "kwh", "btu", "work"],
    icon: "Zap", popularity: 68,
    units: units([
      ["J", "Joule (J)", 1], ["kJ", "Kilojoule (kJ)", 1000], ["cal", "Calorie (cal)", 4.184],
      ["kcal", "Kilocalorie (kcal)", 4184], ["Wh", "Watt-hour (Wh)", 3600], ["kWh", "Kilowatt-hour (kWh)", 3.6e6],
      ["BTU", "British thermal unit", 1055.05585], ["eV", "Electronvolt (eV)", 1.602176634e-19], ["ftlb", "Foot-pound", 1.355817948],
    ]),
    def: ["kWh", "kJ"], defValue: 1,
    examples: [
      { label: "1 kWh in kJ", inputs: { value: 1, from: "kWh", to: "kJ" }, expect: "3,600" },
      { label: "1 kcal in joules", inputs: { value: 1, from: "kcal", to: "J" }, expect: "4,184" },
    ],
  }),
  converter({
    id: "power-converter", name: "Power Converter", base: "watt",
    description: "Convert watts, kilowatts, horsepower and BTU per hour.",
    keywords: ["power", "watt", "kilowatt", "horsepower", "hp", "btu"],
    icon: "Zap", popularity: 64,
    units: units([
      ["W", "Watt (W)", 1], ["kW", "Kilowatt (kW)", 1000], ["MW", "Megawatt (MW)", 1e6],
      ["hp", "Horsepower (mechanical)", 745.699872], ["hpM", "Metric horsepower (PS)", 735.49875],
      ["BTUh", "BTU per hour", 0.29307107], ["ftlbs", "Foot-pound per second", 1.355817948],
    ]),
    def: ["hp", "kW"], defValue: 100,
    examples: [
      { label: "1 kW in horsepower", inputs: { value: 1, from: "kW", to: "hp" }, expect: "1.341" },
      { label: "100 hp in kW", inputs: { value: 100, from: "hp", to: "kW" }, expect: "74.57" },
    ],
  }),
  converter({
    id: "angle-converter", name: "Angle Converter", base: "degree",
    description: "Convert degrees, radians, gradians, arcminutes and full turns.",
    keywords: ["angle", "degree", "radian", "gradian", "turn", "arcminute"],
    icon: "Compass", popularity: 58,
    units: units([
      ["deg", "Degree (°)", 1], ["rad", "Radian (rad)", 57.29577951308232], ["grad", "Gradian (gon)", 0.9],
      ["arcmin", "Arcminute (′)", 1 / 60], ["arcsec", "Arcsecond (″)", 1 / 3600], ["turn", "Full turn", 360],
    ]),
    def: ["deg", "rad"], defValue: 180,
    examples: [
      { label: "1 turn in degrees", inputs: { value: 1, from: "turn", to: "deg" }, expect: "360" },
      { label: "180° in radians", inputs: { value: 180, from: "deg", to: "rad" }, expect: "3.1416" },
    ],
  }),
  converter({
    id: "fuel-economy-converter", name: "Fuel Economy Converter", base: "L/100km",
    description: "Convert between MPG (US/UK), litres per 100 km and km per litre.",
    keywords: ["fuel", "economy", "mpg", "consumption", "efficiency", "mileage"],
    icon: "Fuel", popularity: 60,
    units: fuelUnits, def: ["mpgUS", "L/100km"], defValue: 30,
    how: "Fuel economy is reciprocal: miles-per-gallon rises as litres-per-100 km falls. Each unit converts through a common L/100 km base, so a low L/100 km figure maps to a high MPG.",
    examples: [
      { label: "1 km/L in L/100km", inputs: { value: 1, from: "km/L", to: "L/100km" }, expect: "100" },
      { label: "30 mpg (US) in L/100km", inputs: { value: 30, from: "mpgUS", to: "L/100km" }, expect: "7.84" },
    ],
  }),
  converter({
    id: "frequency-converter", name: "Frequency Converter", base: "hertz",
    description: "Convert hertz, kilohertz, megahertz, gigahertz and RPM.",
    keywords: ["frequency", "hertz", "hz", "khz", "mhz", "ghz", "rpm"],
    icon: "Activity", popularity: 56,
    units: units([
      ["Hz", "Hertz (Hz)", 1], ["kHz", "Kilohertz (kHz)", 1e3], ["MHz", "Megahertz (MHz)", 1e6],
      ["GHz", "Gigahertz (GHz)", 1e9], ["THz", "Terahertz (THz)", 1e12], ["rpm", "Revolutions per minute", 1 / 60],
    ]),
    def: ["GHz", "MHz"], defValue: 2.4,
    examples: [
      { label: "1 MHz in Hz", inputs: { value: 1, from: "MHz", to: "Hz" }, expect: "1,000,000" },
      { label: "3000 rpm in Hz", inputs: { value: 3000, from: "rpm", to: "Hz" }, expect: "50" },
    ],
  }),
  converter({
    id: "force-converter", name: "Force Converter", base: "newton",
    description: "Convert newtons, kilonewtons, pound-force, kilogram-force and dynes.",
    keywords: ["force", "newton", "pound force", "kgf", "dyne"],
    icon: "Move", popularity: 52,
    units: units([
      ["N", "Newton (N)", 1], ["kN", "Kilonewton (kN)", 1000], ["dyn", "Dyne", 1e-5],
      ["kgf", "Kilogram-force (kgf)", 9.80665], ["lbf", "Pound-force (lbf)", 4.4482216153], ["ozf", "Ounce-force", 0.27801385],
    ]),
    def: ["N", "lbf"], defValue: 100,
    examples: [
      { label: "1 kgf in newtons", inputs: { value: 1, from: "kgf", to: "N" }, expect: "9.8067" },
      { label: "100 N in pound-force", inputs: { value: 100, from: "N", to: "lbf" }, expect: "22.48" },
    ],
  }),
  converter({
    id: "density-converter", name: "Density Converter", base: "kg/m³",
    description: "Convert density units: kg/m³, g/cm³, lb/ft³ and g/mL.",
    keywords: ["density", "kg/m3", "g/cm3", "specific", "mass per volume"],
    icon: "Layers", popularity: 48,
    units: units([
      ["kgm3", "Kilogram per m³ (kg/m³)", 1], ["gcm3", "Gram per cm³ (g/cm³)", 1000],
      ["gml", "Gram per mL (g/mL)", 1000], ["gl", "Gram per litre (g/L)", 1],
      ["lbft3", "Pound per ft³ (lb/ft³)", 16.018463], ["lbin3", "Pound per in³ (lb/in³)", 27679.9047],
    ]),
    def: ["gcm3", "kgm3"], defValue: 1,
    examples: [
      { label: "1 g/cm³ in kg/m³", inputs: { value: 1, from: "gcm3", to: "kgm3" }, expect: "1,000" },
      { label: "Water density", inputs: { value: 1000, from: "kgm3", to: "gcm3" }, expect: "1" },
    ],
  }),
  converter({
    id: "torque-converter", name: "Torque Converter", base: "newton-metre",
    description: "Convert newton-metres, pound-feet, pound-inches and kgf·m.",
    keywords: ["torque", "newton metre", "nm", "pound feet", "lbft", "moment"],
    icon: "Wrench", popularity: 50,
    units: units([
      ["Nm", "Newton-metre (N·m)", 1], ["kNm", "Kilonewton-metre (kN·m)", 1000],
      ["lbft", "Pound-foot (lb·ft)", 1.3558179483], ["lbin", "Pound-inch (lb·in)", 0.1129848290],
      ["kgfm", "Kilogram-force metre", 9.80665],
    ]),
    def: ["Nm", "lbft"], defValue: 100,
    examples: [
      { label: "1 lb·ft in N·m", inputs: { value: 1, from: "lbft", to: "Nm" }, expect: "1.3558" },
      { label: "100 N·m in lb·ft", inputs: { value: 100, from: "Nm", to: "lbft" }, expect: "73.75" },
    ],
  }),
  converter({
    id: "cooking-volume-converter", name: "Cooking Measurement Converter", base: "millilitre",
    description: "Convert cups, tablespoons, teaspoons, millilitres and fluid ounces for recipes.",
    keywords: ["cooking", "recipe", "cup", "tablespoon", "teaspoon", "ml", "kitchen"],
    icon: "ChefHat", featured: true, popularity: 70,
    units: units([
      ["ml", "Millilitre (ml)", 1], ["l", "Litre (l)", 1000], ["tsp", "Teaspoon (US)", 4.92892159375],
      ["tbsp", "Tablespoon (US)", 14.78676478125], ["floz", "Fluid ounce (US)", 29.5735295625],
      ["cup", "Cup (US)", 236.5882365], ["pt", "Pint (US)", 473.176473], ["cupM", "Cup (metric)", 250],
    ]),
    def: ["cup", "ml"], defValue: 1,
    examples: [
      { label: "1 US cup in ml", inputs: { value: 1, from: "cup", to: "ml" }, expect: "236" },
      { label: "1 tablespoon in tsp", inputs: { value: 1, from: "tbsp", to: "tsp" }, expect: "3" },
    ],
  }),
  converter({
    id: "data-rate-converter", name: "Data Transfer Rate Converter", base: "bit per second",
    description: "Convert bits and bytes per second: bps, Mbps, MB/s and Gbps.",
    keywords: ["data rate", "bandwidth", "mbps", "gbps", "bit rate", "internet speed"],
    icon: "Wifi", popularity: 62,
    units: units([
      ["bps", "Bit per second (bps)", 1], ["kbps", "Kilobit per second (kbps)", 1e3],
      ["Mbps", "Megabit per second (Mbps)", 1e6], ["Gbps", "Gigabit per second (Gbps)", 1e9],
      ["Bps", "Byte per second (B/s)", 8], ["KBps", "Kilobyte per second (KB/s)", 8e3],
      ["MBps", "Megabyte per second (MB/s)", 8e6], ["GBps", "Gigabyte per second (GB/s)", 8e9],
    ]),
    def: ["Mbps", "MBps"], defValue: 100,
    examples: [
      { label: "100 Mbps in MB/s", inputs: { value: 100, from: "Mbps", to: "MBps" }, expect: "12.5" },
      { label: "1 Gbps in Mbps", inputs: { value: 1, from: "Gbps", to: "Mbps" }, expect: "1,000" },
    ],
  }),
  converter({
    id: "illuminance-converter", name: "Illuminance Converter", base: "lux",
    description: "Convert lux, foot-candles, phot and lumens per square metre.",
    keywords: ["illuminance", "lux", "foot candle", "light", "brightness", "phot"],
    icon: "Lightbulb", popularity: 40,
    units: units([
      ["lx", "Lux (lx)", 1], ["lmm2", "Lumen per m²", 1], ["klx", "Kilolux (klx)", 1000],
      ["fc", "Foot-candle (fc)", 10.763910417], ["phot", "Phot (ph)", 10000], ["nox", "Nox", 0.001],
    ]),
    def: ["lx", "fc"], defValue: 500,
    examples: [
      { label: "1 foot-candle in lux", inputs: { value: 1, from: "fc", to: "lx" }, expect: "10.763" },
      { label: "1000 lux in klx", inputs: { value: 1000, from: "lx", to: "klx" }, expect: "1" },
    ],
  }),
  converter({
    id: "flow-rate-converter", name: "Flow Rate Converter", base: "litre per second",
    description: "Convert volumetric flow: L/s, L/min, m³/h, gallons per minute and CFM.",
    keywords: ["flow rate", "litre per second", "gpm", "cfm", "m3/h", "discharge"],
    icon: "Droplets", popularity: 42,
    units: units([
      ["Ls", "Litre per second (L/s)", 1], ["Lmin", "Litre per minute (L/min)", 1 / 60],
      ["Lh", "Litre per hour (L/h)", 1 / 3600], ["m3h", "Cubic metre per hour (m³/h)", 1000 / 3600],
      ["m3s", "Cubic metre per second (m³/s)", 1000], ["gpm", "US gallon per minute (GPM)", 0.0630901964],
      ["cfm", "Cubic foot per minute (CFM)", 0.4719474432],
    ]),
    def: ["Lmin", "gpm"], defValue: 60,
    examples: [
      { label: "1 L/s in L/min", inputs: { value: 1, from: "Ls", to: "Lmin" }, expect: "60" },
      { label: "1 m³/h in L/s", inputs: { value: 1, from: "m3h", to: "Ls" }, expect: "0.2778" },
    ],
  }),
  converter({
    id: "acceleration-converter", name: "Acceleration Converter", base: "metre per second²",
    description: "Convert m/s², g-force, ft/s² and km/h per second.",
    keywords: ["acceleration", "m/s2", "g force", "gravity", "ft/s2"],
    icon: "TrendingUp", popularity: 38,
    units: units([
      ["ms2", "Metre per second² (m/s²)", 1], ["g", "Standard gravity (g)", 9.80665],
      ["fts2", "Foot per second² (ft/s²)", 0.3048], ["gal", "Gal (cm/s²)", 0.01],
      ["kmhs", "km/h per second", 0.277777778],
    ]),
    def: ["g", "ms2"], defValue: 1,
    examples: [
      { label: "1 g in m/s²", inputs: { value: 1, from: "g", to: "ms2" }, expect: "9.8067" },
      { label: "9.80665 m/s² in g", inputs: { value: 9.80665, from: "ms2", to: "g" }, expect: "1" },
    ],
  }),
];
