/**
 * METER · Digital & Technology (14 tools)
 *
 * Networking, colour, display and data tools. Data-rate maths follows the
 * decimal convention (1 MB = 8 Mb, 1 GB = 1000 MB) used by ISPs and storage
 * vendors, so results line up with the numbers printed on the box.
 */

import { needPos, needNonNeg, fail, out, P, R, M, fmt, unit, duration, gcd, clamp, pct } from "../../lib/calc/helpers";
import type { CalcSpec } from "../../lib/calc/types";

export const CALCULATORS: CalcSpec[] = [
  {
    id: "download-time", name: "Download Time Calculator", category: "digital-technology",
    description: "How long a file takes to transfer at a given connection speed.",
    keywords: ["download time", "file size", "bandwidth", "speed", "transfer", "mbps"],
    icon: "Download", featured: true, popularity: 74,
    fields: [
      { key: "size", label: "File size", def: 1000, min: 0, unit: "MB" },
      { key: "speed", label: "Connection speed", def: 100, min: 0.01, unit: "Mbps" },
    ],
    formula: "time = file size × 8 / speed",
    compute: (v) => {
      const size = needNonNeg(v.size, "File size");
      const speed = needPos(v.speed, "Speed");
      const seconds = (size * 8) / speed;
      return [P("Download time", duration(seconds)), R("In seconds", unit(seconds, "s")), M("Data to transfer", unit(size * 8, "Mb"))];
    },
    examples: [{ label: "1000 MB at 100 Mbps", inputs: { size: 1000, speed: 100 }, expect: "80" }],
  },
  {
    id: "base-converter", name: "Number Base Converter", category: "digital-technology",
    description: "Convert between binary, octal, decimal and hexadecimal.",
    keywords: ["base converter", "binary", "hexadecimal", "octal", "decimal", "radix"],
    icon: "Binary", featured: true, popularity: 68,
    fields: [
      { key: "value", label: "Value", kind: "text", def: "255", placeholder: "e.g. FF, 1010, 255" },
      {
        key: "from", label: "Input base", kind: "select", def: "10",
        options: [{ value: "2", label: "Binary (2)" }, { value: "8", label: "Octal (8)" }, { value: "10", label: "Decimal (10)" }, { value: "16", label: "Hex (16)" }],
      },
    ],
    compute: (v) => {
      const raw = String(v.value ?? "").trim().replace(/\s/g, "").toLowerCase();
      const base = parseInt(String(v.from), 10);
      if (!raw) fail("Enter a value to convert.");
      for (const ch of raw.replace(/^-/, "")) {
        const d = parseInt(ch, 36);
        if (Number.isNaN(d) || d >= base) fail(`"${raw}" is not a valid base-${base} number.`);
      }
      const n = parseInt(raw, base);
      return [
        P("Hexadecimal", n.toString(16).toUpperCase()),
        R("Decimal", n.toString(10)),
        R("Octal", n.toString(8)),
        R("Binary", n.toString(2)),
      ];
    },
    examples: [{ label: "255 (decimal)", inputs: { value: "255", from: "10" }, expect: "FF" }],
  },
  {
    id: "hex-to-rgb", name: "HEX to RGB Converter", category: "digital-technology",
    description: "Convert a hex colour code to its RGB components.",
    keywords: ["hex to rgb", "color", "colour", "hex code", "rgb", "web design"],
    icon: "Palette", featured: true, popularity: 66,
    fields: [{ key: "hex", label: "Hex colour", kind: "text", def: "#3B82F6", placeholder: "#RRGGBB" }],
    compute: (v) => {
      const hex = String(v.hex ?? "").trim().replace(/^#/, "");
      if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) fail("Enter a hex colour like #3B82F6.");
      const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
      const r = parseInt(full.slice(0, 2), 16);
      const g = parseInt(full.slice(2, 4), 16);
      const b = parseInt(full.slice(4, 6), 16);
      return [P("RGB", `rgb(${r}, ${g}, ${b})`), R("Red", `${r}`), R("Green", `${g}`), R("Blue", `${b}`)];
    },
    examples: [{ label: "#3B82F6", inputs: { hex: "#3B82F6" }, expect: "59" }],
  },
  {
    id: "rgb-to-hex", name: "RGB to HEX Converter", category: "digital-technology",
    description: "Convert RGB colour components to a hex code.",
    keywords: ["rgb to hex", "color", "colour", "hex code", "rgb", "web design"],
    icon: "Palette", popularity: 60,
    fields: [
      { key: "r", label: "Red", def: 59, min: 0, max: 255, step: 1 },
      { key: "g", label: "Green", def: 130, min: 0, max: 255, step: 1 },
      { key: "b", label: "Blue", def: 246, min: 0, max: 255, step: 1 },
    ],
    compute: (v) => {
      const chan = (x: number, label: string) => clamp(Math.round(needNonNeg(x, label)), 0, 255);
      const r = chan(v.r, "Red"), g = chan(v.g, "Green"), b = chan(v.b, "Blue");
      const hex = "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
      return [P("Hex colour", hex), M("RGB", `rgb(${r}, ${g}, ${b})`)];
    },
    examples: [{ label: "rgb(59, 130, 246)", inputs: { r: 59, g: 130, b: 246 }, expect: "3B82F6" }],
  },
  {
    id: "aspect-ratio", name: "Aspect Ratio Calculator", category: "digital-technology",
    description: "Simplify a width and height to its aspect ratio.",
    keywords: ["aspect ratio", "resolution", "16:9", "screen", "video", "dimensions"],
    icon: "RectangleHorizontal", popularity: 58,
    fields: [
      { key: "width", label: "Width", def: 1920, min: 1, step: 1, unit: "px" },
      { key: "height", label: "Height", def: 1080, min: 1, step: 1, unit: "px" },
    ],
    compute: (v) => {
      const w = Math.round(needPos(v.width, "Width"));
      const h = Math.round(needPos(v.height, "Height"));
      const g = gcd(w, h) || 1;
      return [P("Aspect ratio", `${w / g}:${h / g}`), R("Decimal ratio", fmt(w / h)), M("Total pixels", fmt(w * h))];
    },
    examples: [{ label: "1920 × 1080", inputs: { width: 1920, height: 1080 }, expect: "16:9" }],
  },
  {
    id: "pixel-density", name: "Pixel Density (PPI) Calculator", category: "digital-technology",
    description: "Pixels-per-inch from resolution and screen diagonal.",
    keywords: ["ppi", "pixel density", "dpi", "screen", "resolution", "display"],
    icon: "Monitor", popularity: 52,
    fields: [
      { key: "width", label: "Horizontal pixels", def: 1920, min: 1, step: 1, unit: "px" },
      { key: "height", label: "Vertical pixels", def: 1080, min: 1, step: 1, unit: "px" },
      { key: "diagonal", label: "Screen diagonal", def: 15.6, min: 0.1, step: 0.1, unit: "in" },
    ],
    formula: "PPI = √(w² + h²) / diagonal",
    compute: (v) => {
      const w = needPos(v.width, "Horizontal pixels");
      const h = needPos(v.height, "Vertical pixels");
      const diag = needPos(v.diagonal, "Diagonal");
      const ppi = Math.sqrt(w * w + h * h) / diag;
      return [P("Pixel density", unit(ppi, "PPI", 1)), M("Diagonal pixels", fmt(Math.sqrt(w * w + h * h)))];
    },
    examples: [{ label: "1920×1080 on 15.6″", inputs: { width: 1920, height: 1080, diagonal: 15.6 }, expect: "141.2" }],
  },
  {
    id: "resolution-megapixels", name: "Megapixel Calculator", category: "digital-technology",
    description: "Megapixels from an image's width and height in pixels.",
    keywords: ["megapixels", "resolution", "camera", "image", "pixels", "mp"],
    icon: "Camera", popularity: 46,
    fields: [
      { key: "width", label: "Width", def: 4000, min: 1, step: 1, unit: "px" },
      { key: "height", label: "Height", def: 3000, min: 1, step: 1, unit: "px" },
    ],
    compute: (v) => {
      const w = needPos(v.width, "Width");
      const h = needPos(v.height, "Height");
      return [P("Megapixels", unit((w * h) / 1e6, "MP")), M("Total pixels", fmt(w * h))];
    },
    examples: [{ label: "4000 × 3000", inputs: { width: 4000, height: 3000 }, expect: "12" }],
  },
  {
    id: "password-entropy", name: "Password Entropy Calculator", category: "digital-technology",
    description: "Estimate password strength in bits of entropy.",
    keywords: ["password", "entropy", "strength", "bits", "security", "crack time"],
    icon: "KeyRound", featured: true, popularity: 62,
    fields: [
      { key: "length", label: "Password length", def: 12, min: 1, step: 1 },
      {
        key: "charset", label: "Character set", kind: "select", def: "95",
        options: [
          { value: "26", label: "Lowercase only (26)" },
          { value: "52", label: "Upper + lower (52)" },
          { value: "62", label: "Alphanumeric (62)" },
          { value: "95", label: "All printable ASCII (95)" },
        ],
      },
    ],
    formula: "entropy = length × log₂(charset)",
    compute: (v) => {
      const len = needPos(v.length, "Length");
      const set = Number(v.charset);
      const bits = len * Math.log2(set);
      const strength = bits >= 128 ? "Excellent" : bits >= 60 ? "Strong" : bits >= 36 ? "Reasonable" : "Weak";
      return out(
        [P("Entropy", `${fmt(bits)} bits`), R("Strength", strength), M("Possible combinations", fmt(Math.pow(set, len)))],
        { note: "60+ bits resists offline attacks; 128+ bits is effectively unbreakable." },
      );
    },
    examples: [{ label: "12 chars, full ASCII", inputs: { length: 12, charset: "95" }, expect: "78.8" }],
  },
  {
    id: "ip-subnet", name: "IP Subnet Calculator", category: "digital-technology",
    description: "Subnet mask and host count from a CIDR prefix length.",
    keywords: ["subnet", "cidr", "netmask", "ip address", "hosts", "networking"],
    icon: "Network", popularity: 56,
    fields: [{ key: "prefix", label: "CIDR prefix (/n)", def: 24, min: 0, max: 32, step: 1 }],
    compute: (v) => {
      const p = clamp(Math.trunc(needNonNeg(v.prefix, "Prefix")), 0, 32);
      const maskInt = p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
      const mask = [maskInt >>> 24, (maskInt >>> 16) & 255, (maskInt >>> 8) & 255, maskInt & 255].join(".");
      const total = Math.pow(2, 32 - p);
      const usable = total > 2 ? total - 2 : 0;
      return [P("Usable hosts", fmt(usable)), R("Subnet mask", mask), R("Total addresses", fmt(total)), M("Prefix", `/${p}`)];
    },
    examples: [{ label: "/24 network", inputs: { prefix: 24 }, expect: "254" }],
  },
  {
    id: "bandwidth-transfer", name: "Data Transfer Calculator", category: "digital-technology",
    description: "Amount of data transferred at a speed over a period of time.",
    keywords: ["bandwidth", "data transfer", "throughput", "mbps", "gigabytes", "usage"],
    icon: "Wifi", popularity: 48,
    fields: [
      { key: "speed", label: "Speed", def: 50, min: 0, unit: "Mbps" },
      { key: "hours", label: "Duration", def: 2, min: 0, unit: "h" },
    ],
    formula: "data = speed × time / 8",
    compute: (v) => {
      const speed = needNonNeg(v.speed, "Speed");
      const hours = needNonNeg(v.hours, "Duration");
      const megabits = speed * hours * 3600;
      const mb = megabits / 8;
      return [P("Data transferred", unit(mb / 1000, "GB")), R("In megabytes", unit(mb, "MB")), M("In megabits", unit(megabits, "Mb"))];
    },
    examples: [{ label: "50 Mbps for 2 h", inputs: { speed: 50, hours: 2 }, expect: "45" }],
  },
  {
    id: "storage-capacity", name: "Storage Capacity Calculator", category: "digital-technology",
    description: "How many files of a given size fit on a drive.",
    keywords: ["storage", "capacity", "how many files", "drive", "gigabytes", "photos"],
    icon: "HardDrive", popularity: 50,
    fields: [
      { key: "capacity", label: "Storage capacity", def: 128, min: 0, unit: "GB" },
      { key: "fileSize", label: "Average file size", def: 4, min: 0.01, unit: "MB" },
    ],
    formula: "files = capacity(MB) / file size",
    compute: (v) => {
      const cap = needNonNeg(v.capacity, "Capacity");
      const file = needPos(v.fileSize, "File size");
      const count = Math.floor((cap * 1000) / file);
      return [P("Files that fit", fmt(count)), M("Capacity", unit(cap * 1000, "MB"))];
    },
    examples: [{ label: "128 GB, 4 MB photos", inputs: { capacity: 128, fileSize: 4 }, expect: "32,000" }],
  },
  {
    id: "uptime-sla", name: "Uptime / SLA Calculator", category: "digital-technology",
    description: "Allowed downtime for a given uptime service-level target.",
    keywords: ["uptime", "sla", "downtime", "availability", "nines", "reliability"],
    icon: "Activity", popularity: 52,
    fields: [{ key: "uptime", label: "Uptime target", def: 99.9, min: 0, max: 100, step: 0.001, unit: "%" }],
    compute: (v) => {
      const up = clamp(needNonNeg(v.uptime, "Uptime"), 0, 100);
      const frac = 1 - up / 100;
      return [
        P("Downtime per year", unit(525600 * frac, "min")),
        R("Per year (hours)", unit((525600 * frac) / 60, "h")),
        R("Per month", unit(43800 * frac, "min")),
        M("Availability", pct(up, 3)),
      ];
    },
    examples: [{ label: "99.9% (three nines)", inputs: { uptime: 99.9 }, expect: "525.6" }],
  },
  {
    id: "reading-time", name: "Reading Time Estimator", category: "digital-technology",
    description: "Estimated reading time for a word count.",
    keywords: ["reading time", "word count", "wpm", "article", "blog", "estimate"],
    icon: "BookOpen", popularity: 54,
    fields: [
      { key: "words", label: "Word count", def: 1500, min: 0, step: 1 },
      { key: "wpm", label: "Reading speed", def: 200, min: 1, unit: "wpm" },
    ],
    formula: "minutes = words / words-per-minute",
    compute: (v) => {
      const words = needNonNeg(v.words, "Word count");
      const wpm = needPos(v.wpm, "Reading speed");
      const minutes = words / wpm;
      return [P("Reading time", unit(minutes, "min")), R("Rounded", duration(minutes * 60))];
    },
    examples: [{ label: "1500 words at 200 wpm", inputs: { words: 1500, wpm: 200 }, expect: "7.5" }],
  },
  {
    id: "data-usage-streaming", name: "Streaming Data Usage", category: "digital-technology",
    description: "Data used when streaming video for a number of hours.",
    keywords: ["data usage", "streaming", "video", "netflix", "gigabytes", "data cap"],
    icon: "Play", popularity: 46,
    fields: [
      { key: "hours", label: "Hours streamed", def: 30, min: 0, unit: "h" },
      {
        key: "quality", label: "Video quality", kind: "select", def: "3",
        options: [{ value: "1", label: "SD (1 GB/h)" }, { value: "3", label: "HD (3 GB/h)" }, { value: "7", label: "4K (7 GB/h)" }],
      },
    ],
    compute: (v) => {
      const hours = needNonNeg(v.hours, "Hours");
      const rate = Number(v.quality);
      return [P("Data used", unit(hours * rate, "GB")), M("Rate", `${rate} GB per hour`)];
    },
    examples: [{ label: "30 h of HD", inputs: { hours: 30, quality: "3" }, expect: "90" }],
  },
];
