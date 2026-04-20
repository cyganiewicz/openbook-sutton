// Charts.jsx — Reusable Chart Components for OpenBook

const GREEN = "oklch(0.38 0.10 155)";
const GOLD = "oklch(0.72 0.12 82)";

const CHART_COLORS = [
  "#2d6a4f", "#40916c", "#c9a227", "#52b788", "#1b4332",
  "#74c69d", "#e9c46a", "#457b9d", "#6d9b7a", "#8d8741"
];

const CATEGORY_COLORS = {
  general_govt: "#2d6a4f",
  public_safety: "#1b4332",
  education: "#c9a227",
  public_works: "#457b9d",
  human_services: "#52b788",
  culture_rec: "#6d9b7a",
  debt: "#7b6fa0",
  benefits: "#6b7f8e",
};

function useChartInstance(canvasRef, getConfig, deps) {
  const instanceRef = React.useRef(null);
  React.useEffect(() => {
    if (!canvasRef.current) return;
    if (instanceRef.current) { instanceRef.current.destroy(); instanceRef.current = null; }
    const cfg = getConfig();
    if (!cfg) return;
    instanceRef.current = new Chart(canvasRef.current, cfg);
    return () => { if (instanceRef.current) { instanceRef.current.destroy(); instanceRef.current = null; } };
  }, deps);
}

function DonutChart({ labels, values, colors, centerLabel, centerSub, height = 260 }) {
  const canvasRef = React.useRef(null);
  useChartInstance(canvasRef, () => ({
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors || CHART_COLORS.slice(0, values.length),
        borderWidth: 2,
        borderColor: '#fff',
        hoverBorderWidth: 3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: $${(ctx.raw/1000000).toFixed(2)}M`
          }
        }
      }
    }
  }), [JSON.stringify(values)]);

  return (
    <div style={{ position: 'relative', height }}>
      <canvas ref={canvasRef} />
      {centerLabel && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1b2e22', fontFamily: "'Source Serif 4', serif", lineHeight: 1.1 }}>{centerLabel}</div>
          {centerSub && <div style={{ fontSize: 11, color: '#5a7a66', marginTop: 2, fontWeight: 500, letterSpacing: '0.02em' }}>{centerSub}</div>}
        </div>
      )}
    </div>
  );
}

function BarChart({ labels, datasets, height = 260, horizontal = false, stacked = false, yPrefix = '$', showLegend = true }) {
  const canvasRef = React.useRef(null);
  useChartInstance(canvasRef, () => ({
    type: horizontal ? 'bar' : 'bar',
    data: { labels, datasets },
    options: {
      indexAxis: horizontal ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: showLegend && datasets.length > 1, position: 'top', labels: { font: { family: 'Figtree', size: 12 }, padding: 16, boxWidth: 12, boxHeight: 12 } },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label || ''}: ${yPrefix}${ctx.raw.toLocaleString()}`
          }
        }
      },
      scales: {
        x: {
          stacked,
          grid: { display: !horizontal, color: 'rgba(0,0,0,0.05)' },
          ticks: { font: { family: 'Figtree', size: 11 }, maxRotation: horizontal ? 0 : 35 }
        },
        y: {
          stacked,
          grid: { display: horizontal, color: 'rgba(0,0,0,0.05)' },
          ticks: {
            font: { family: 'Figtree', size: 11 },
            callback: v => horizontal ? v : (v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v}`)
          }
        }
      }
    }
  }), [JSON.stringify({ labels, datasets })]);
  return <div style={{ height }}><canvas ref={canvasRef} /></div>;
}

function LineChart({ labels, datasets, height = 220 }) {
  const canvasRef = React.useRef(null);
  useChartInstance(canvasRef, () => ({
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: datasets.length > 1, position: 'top', labels: { font: { family: 'Figtree', size: 12 } } },
        tooltip: { callbacks: { label: ctx => ` $${(ctx.raw/1000000).toFixed(2)}M` } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'Figtree', size: 11 } } },
        y: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { font: { family: 'Figtree', size: 11 }, callback: v => `$${(v/1000000).toFixed(1)}M` }
        }
      }
    }
  }), [JSON.stringify({ labels, datasets })]);
  return <div style={{ height }}><canvas ref={canvasRef} /></div>;
}

function ChartLegend({ labels, colors, values, total }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 4px' }}>
      {labels.map((label, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: colors ? colors[i] : CHART_COLORS[i], flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 12, color: '#3a4a42', fontWeight: 500, lineHeight: 1.3 }}>{label}</div>
          {values && (
            <div style={{ fontSize: 12, color: '#1b2e22', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {total ? `${((values[i]/total)*100).toFixed(1)}%` : `$${(values[i]/1000).toFixed(0)}K`}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, delta, accent = false }) {
  const isPos = delta > 0;
  return (
    <div style={{ background: accent ? '#1b3a2a' : '#fff', borderRadius: 10, padding: '20px 24px', border: accent ? 'none' : '1px solid #dde8e2', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: accent ? 'rgba(255,255,255,0.6)' : '#6a8c78', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ? '#fff' : '#1b2e22', fontFamily: "'Source Serif 4', serif", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: accent ? 'rgba(255,255,255,0.55)' : '#6a8c78', marginTop: 4 }}>{sub}</div>}
      {delta !== undefined && (
        <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: isPos ? '#c0392b' : '#27ae60', background: isPos ? '#fdecea' : '#eafaf1', borderRadius: 20, padding: '2px 8px' }}>
          {isPos ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}% vs prior year
        </div>
      )}
    </div>
  );
}

Object.assign(window, { DonutChart, BarChart, LineChart, ChartLegend, StatCard, CHART_COLORS, CATEGORY_COLORS });
