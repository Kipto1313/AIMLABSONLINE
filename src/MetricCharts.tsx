interface TrendSession {
  id: string
  accuracy: number
  averageReaction: number
}

interface MetricChartsProps {
  sessions: TrendSession[]
}

export default function MetricCharts({ sessions }: MetricChartsProps) {
  const accuracy = sessions.slice(0, 12).reverse().map((session) => ({ id: session.id, value: session.accuracy * 100, label: `${(session.accuracy * 100).toFixed(1)}%` }))
  const reaction = sessions.filter((session) => session.averageReaction > 0).slice(0, 12).reverse().map((session) => ({ id: session.id, value: session.averageReaction, label: `${Math.round(session.averageReaction)}ms` }))

  return <div className="metric-charts">
    <TrendChart title="Accuracy over time" legend="ACCURACY" values={accuracy} empty="Accuracy appears after your first session." />
    <TrendChart title="Reaction time over time" legend="REACTION" values={reaction} empty="Reaction-focused drills add reaction data here." />
  </div>
}

function TrendChart({ title, legend, values, empty }: { title: string; legend: string; values: { id: string; value: number; label: string }[]; empty: string }) {
  const max = Math.max(...values.map((point) => point.value), 1)
  return <section className="chart-panel trend-panel">
    <div className="chart-heading"><div><span className="eyebrow">PERFORMANCE</span><h2>{title}</h2></div><span className="chart-legend"><i /> {legend}</span></div>
    {values.length > 1 ? <div className="bar-chart">{values.map((point, index) => <div className="chart-column" key={point.id}><div className="chart-value">{point.label}</div><div className="chart-bar-wrap"><span className="chart-bar" style={{ height: `${Math.max(7, point.value / max * 100)}%` }} /></div><small>{index + 1}</small></div>)}</div> : <div className="chart-empty"><span>{empty}</span></div>}
  </section>
}
