import React, { useRef, useEffect } from "react";

// A lightweight vanilla chart rendering (replace with chart.js in future)
function color(idx) {
  const palette = [
    "#1976D2", "#424242", "#FFC107", "#2196F3", "#E87A41", "#6A1B9A", "#43A047"
  ];
  return palette[idx % palette.length];
}

// PUBLIC_INTERFACE
const ChartWidget = ({ title, labels, series, chartType = "bar", data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    drawChart();
    // eslint-disable-next-line
  }, [labels, series]);

  function drawChart() {
    const canvas = canvasRef.current;
    if (!canvas || !labels || !series) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 500, 320);
    // Bar chart logic
    const width = 400, height = 200, padding = 40;
    canvas.width = width + 2 * padding;
    canvas.height = height + 2 * padding;
    // Calculate max
    let maxY = 1;
    series.forEach(s => s.data.forEach(v => { if (v > maxY) maxY = v; }));
    // Draw axis
    ctx.strokeStyle = "#424242";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height + padding);
    ctx.lineTo(width + padding, height + padding);
    ctx.stroke();
    // Draw bars/stacked for each series
    const barWidth = Math.max(20, ((width - 10) / labels.length) / (chartType === "stackedBar" ? 1 : series.length) - 4);
    for (let i = 0; i < labels.length; ++i) {
      let x0 = padding + 12 + i * ((width - 24) / labels.length);
      let baseY = height + padding;
      for (let sidx = 0; sidx < series.length; ++sidx) {
        let val = series[sidx].data[i] || 0;
        let barHeight = val * height / (maxY * 1.08);
        ctx.fillStyle = color(sidx);
        if (chartType === "stackedBar") {
          ctx.fillRect(x0, baseY - barHeight, barWidth, barHeight);
          baseY = baseY - barHeight;
        } else {
          ctx.fillRect(x0 + sidx * (barWidth + 2), height + padding - barHeight, barWidth, barHeight);
        }
      }
    }
    // Labels
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#222";
    for (let i = 0; i < labels.length; ++i) {
      let x0 = padding + 12 + i * ((width - 24) / labels.length);
      ctx.fillText(labels[i].toString().slice(0, 12), x0, height + padding + 16);
    }
    // Legend
    series.forEach((s, idx) => {
      ctx.fillStyle = color(idx);
      ctx.fillRect(width + 2, padding + 8 + idx * 22, 15, 15);
      ctx.fillStyle = "#484848";
      ctx.font = "normal 13px sans-serif";
      ctx.fillText(s.label, width + 25, padding + 20 + idx * 22);
    });
  }

  return (
    <div style={{ width: 520, maxWidth: "95vw" }}>
      <div style={{ fontWeight: 600, color: "var(--primary)", marginBottom: 8 }}>{title}</div>
      <canvas ref={canvasRef} style={{ width: 500, height: 260 }} aria-label={title}></canvas>
    </div>
  );
};
export default ChartWidget;
