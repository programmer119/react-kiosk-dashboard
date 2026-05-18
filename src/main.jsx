import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Database,
  Download,
  Eye,
  Filter,
  Gauge,
  LineChart,
  Pause,
  Play,
  RefreshCw,
  Search,
  Settings2,
  Sparkles,
  UploadCloud,
  Zap
} from 'lucide-react';
import './styles.css';

const datasets = {
  sales: {
    label: 'Sales Forecast',
    accent: '#12a87d',
    summary: '매출 예측',
    kpis: ['93.8%', '1.7M', '18.4%', '42ms'],
    series: [31, 44, 39, 57, 63, 61, 78, 84, 79, 92, 88, 96],
    heat: [62, 78, 41, 86, 55, 92, 73, 68, 95, 49, 82, 76],
    pipeline: [96, 88, 81, 74]
  },
  ops: {
    label: 'Operation Signals',
    accent: '#4267e8',
    summary: '운영 이상탐지',
    kpis: ['88.1%', '24.6K', '7.2%', '31ms'],
    series: [74, 69, 76, 71, 82, 64, 58, 73, 86, 91, 77, 83],
    heat: [48, 67, 89, 52, 74, 38, 96, 81, 69, 57, 91, 63],
    pipeline: [91, 84, 69, 86]
  },
  risk: {
    label: 'Risk Modeling',
    accent: '#ef6b4a',
    summary: '리스크 모델링',
    kpis: ['91.4%', '384K', '11.9%', '56ms'],
    series: [43, 51, 66, 59, 72, 81, 69, 77, 85, 73, 89, 94],
    heat: [91, 84, 76, 69, 88, 93, 57, 62, 79, 85, 71, 96],
    pipeline: [88, 77, 92, 79]
  }
};

const pipelineLabels = ['Ingest', 'Clean', 'Train', 'Visualize'];
const kpiLabels = ['모델 정확도', '처리 레코드', '변화율', '응답 속도'];
const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function linePath(values) {
  return values
    .map((value, index) => {
      const x = 18 + index * 32;
      const y = 142 - value * 1.18;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function LiveChart({ data, tick }) {
  const animatedSeries = data.series.map((value, index) => {
    const wave = Math.sin((tick + index) / 2.2) * 5;
    return Math.max(24, Math.min(98, value + wave));
  });

  return (
    <div className="chart-panel">
      <div className="panel-title">
        <div>
          <span>Live Trend</span>
          <h2>{data.summary} 시계열</h2>
        </div>
        <LineChart size={22} />
      </div>
      <svg className="line-chart" viewBox="0 0 390 160" role="img" aria-label="실시간 추세 차트">
        {[30, 60, 90, 120].map((y) => (
          <line key={y} x1="18" x2="372" y1={y} y2={y} />
        ))}
        <path className="area" d={`${linePath(animatedSeries)} L 370 148 L 18 148 Z`} />
        <path className="trend" d={linePath(animatedSeries)} style={{ stroke: data.accent }} />
        {animatedSeries.map((value, index) => (
          <circle
            key={chartLabels[index]}
            cx={18 + index * 32}
            cy={142 - value * 1.18}
            r={index === tick % 12 ? 6 : 4}
            style={{ fill: index === tick % 12 ? data.accent : '#ffffff', stroke: data.accent }}
          />
        ))}
      </svg>
      <div className="chart-labels">
        {chartLabels.map((label, index) => (
          <span className={index === tick % 12 ? 'active' : ''} key={label}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function HeatMap({ data, selectedCell, setSelectedCell }) {
  return (
    <div className="panel heat-panel">
      <div className="panel-title">
        <div>
          <span>Signal Heatmap</span>
          <h2>세그먼트 밀도</h2>
        </div>
        <BarChart3 size={22} />
      </div>
      <div className="heat-grid">
        {data.heat.map((value, index) => (
          <button
            key={`${value}-${index}`}
            type="button"
            className={selectedCell === index ? 'heat-cell selected' : 'heat-cell'}
            style={{
              '--heat': value,
              background: `color-mix(in srgb, ${data.accent} ${value}%, #eef4f1)`
            }}
            onClick={() => setSelectedCell(index)}
            aria-label={`세그먼트 ${index + 1}, 강도 ${value}`}
          >
            <strong>{value}</strong>
            <span>S{index + 1}</span>
          </button>
        ))}
      </div>
      <p className="mini-copy">
        선택 세그먼트 S{selectedCell + 1}: 상관 신호 {data.heat[selectedCell]}점, 집중 분석 대상으로 표시됨
      </p>
    </div>
  );
}

function Pipeline({ data, activeStep, setActiveStep }) {
  return (
    <div className="panel">
      <div className="panel-title">
        <div>
          <span>Workflow</span>
          <h2>분석 파이프라인</h2>
        </div>
        <Settings2 size={22} />
      </div>
      <div className="pipeline">
        {pipelineLabels.map((label, index) => {
          const icons = [Database, Filter, Brain, Eye];
          const Icon = icons[index];

          return (
            <button
              key={label}
              type="button"
              className={activeStep === index ? 'pipe-step active' : 'pipe-step'}
              onClick={() => setActiveStep(index)}
            >
              <Icon size={20} />
              <span>{label}</span>
              <b>{data.pipeline[index]}%</b>
            </button>
          );
        })}
      </div>
      <div className="step-meter">
        <span style={{ width: `${data.pipeline[activeStep]}%`, background: data.accent }} />
      </div>
    </div>
  );
}

function GaugeCluster({ sensitivity, data }) {
  const score = Math.round((data.pipeline.reduce((sum, value) => sum + value, 0) / 4) * (0.72 + sensitivity / 360));
  const clipped = Math.min(99, score);
  const dash = clipped * 2.64;

  return (
    <div className="panel gauge-panel">
      <div className="panel-title">
        <div>
          <span>Model Score</span>
          <h2>운영 적합도</h2>
        </div>
        <Gauge size={22} />
      </div>
      <svg className="big-gauge" viewBox="0 0 220 130" role="img" aria-label={`운영 적합도 ${clipped}`}>
        <path d="M28 110a82 82 0 0 1 164 0" />
        <path className="gauge-fill" d="M28 110a82 82 0 0 1 164 0" strokeDasharray={`${dash} 265`} style={{ stroke: data.accent }} />
      </svg>
      <strong>{clipped}</strong>
      <span>adaptive confidence</span>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState('sales');
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [sensitivity, setSensitivity] = useState(58);
  const [activeStep, setActiveStep] = useState(2);
  const [selectedCell, setSelectedCell] = useState(5);
  const data = datasets[mode];

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      setTick((current) => current + 1);
      setActiveStep((current) => (current + 1) % pipelineLabels.length);
    }, 1200);
    return () => window.clearInterval(timer);
  }, [playing]);

  const dynamicKpis = useMemo(
    () =>
      data.kpis.map((value, index) => ({
        label: kpiLabels[index],
        value,
        delta: Math.round(Math.sin((tick + index) / 1.7) * 8 + sensitivity / 12)
      })),
    [data, sensitivity, tick]
  );

  return (
    <main className="app-shell" style={{ '--accent': data.accent }}>
      <section className="workspace">
        <aside className="sidebar">
          <div className="brand">
            <Sparkles size={21} />
            <span>Insight Studio</span>
          </div>

          <div className="mode-stack">
            {Object.entries(datasets).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={mode === key ? 'mode active' : 'mode'}
                onClick={() => {
                  setMode(key);
                  setSelectedCell(0);
                }}
              >
                <span style={{ background: item.accent }} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="upload-card">
            <UploadCloud size={24} />
            <strong>Dataset Ready</strong>
            <p>CSV, API, DB stream 입력을 한 화면에서 모니터링하는 업무형 UI 샘플</p>
          </div>
        </aside>

        <section className="main-stage">
          <header className="topbar">
            <div>
              <span className="eyebrow">React Interactive Dashboard</span>
              <h1>AI 데이터 분석 웹 프로그램</h1>
            </div>
            <div className="top-actions">
              <button type="button" onClick={() => setPlaying((value) => !value)} aria-label="재생 전환">
                {playing ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button type="button" onClick={() => setTick((value) => value + 1)} aria-label="데이터 새로고침">
                <RefreshCw size={18} />
              </button>
              <button type="button" aria-label="내보내기">
                <Download size={18} />
              </button>
            </div>
          </header>

          <div className="hero-strip">
            <div className="hero-copy">
              <h2>{data.summary} 분석 콘솔</h2>
              <p>
                데이터 수집, 전처리, 모델링, 시각화까지 이어지는 웹 프로그램 화면을 가정한 동적 React 프로토타입입니다.
              </p>
            </div>
            <div className="search-box">
              <Search size={18} />
              <span>segment: S{selectedCell + 1} / sensitivity: {sensitivity}</span>
            </div>
          </div>

          <section className="kpi-grid">
            {dynamicKpis.map((item, index) => (
              <article className="kpi-card" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <b className={item.delta >= 0 ? 'up' : 'down'}>
                  <ArrowUpRight size={16} />
                  {item.delta > 0 ? '+' : ''}
                  {item.delta}
                </b>
                <div className="spark">
                  {data.series.slice(index, index + 6).map((value, barIndex) => (
                    <i key={`${value}-${barIndex}`} style={{ height: `${32 + ((value + tick * 3) % 50)}%` }} />
                  ))}
                </div>
              </article>
            ))}
          </section>

          <section className="content-grid">
            <LiveChart data={data} tick={tick} />
            <GaugeCluster data={data} sensitivity={sensitivity} />
            <HeatMap data={data} selectedCell={selectedCell} setSelectedCell={setSelectedCell} />
            <Pipeline data={data} activeStep={activeStep} setActiveStep={setActiveStep} />
          </section>

          <section className="control-deck">
            <div>
              <div className="deck-title">
                <Activity size={18} />
                <strong>민감도 조정</strong>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                value={sensitivity}
                onChange={(event) => setSensitivity(Number(event.target.value))}
              />
            </div>
            <div className="status-row">
              <CheckCircle2 size={19} />
              <span>Active simulation running on React state</span>
              <Zap size={18} />
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
