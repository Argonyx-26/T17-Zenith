import { ArrowLeft, Check, CircleAlert } from 'lucide-react'
import { SUBJECTS, conceptNodes } from '../mockData.js'

const nodeStyles = {
  mastered: 'border-on-track/35 bg-on-track-bg text-on-track',
  needsPractice: 'border-at-risk/35 bg-at-risk-bg text-at-risk',
  inProgress: 'border-line bg-white text-muted',
}

function PerformanceAnalytics({ student, session, onReturn }) {
  const currentMastery = student.subjectMastery[session.subject] ?? session.score
  const conceptsLogged = Object.keys(session.nodeResults).length
  const weakTopics = session.conceptsOfConcern?.length
    ? [...new Set(session.conceptsOfConcern)]
    : Object.entries(session.nodeResults).filter(([, status]) => status === 'needsPractice').map(([topic]) => topic)

  return (
    <main className="mx-auto max-w-[1250px] px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-lavender">Post-quiz analysis · {session.subject}</p><h1 className="mt-1 font-display text-[30px] text-ink sm:text-[36px]">Your performance analytics</h1><p className="mt-2 text-sm text-muted">Your results are saved to your learning record.</p></div><button type="button" onClick={onReturn} className="inline-flex h-10 items-center gap-2 rounded-2xl border border-line bg-white px-4 text-sm font-bold text-ink transition-colors hover:bg-lavender-wash"><ArrowLeft size={16} /> Return to Learning Hub</button></div>

      <section className="grid items-stretch gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-line bg-white p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-lavender">Text summary</p>
          <h2 className="mt-2 font-display text-[28px] text-ink">Quiz Complete!</h2>
          <p className="mt-4 rounded-2xl bg-lavender-wash px-4 py-3 text-lg font-bold text-ink">Final Score: {session.correctCount}/{session.questionsTotal} ({session.score}%)</p>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-line px-4 py-3"><span className="text-sm font-semibold text-muted">Total Concepts Logged</span><span className="font-display text-2xl text-ink">{conceptsLogged}</span></div>
          <h3 className="mt-5 text-sm font-bold text-ink">Weak topics encountered</h3>
          {weakTopics.length ? <ul className="mt-2 flex flex-wrap gap-2">{weakTopics.map((topic) => <li key={topic} className="rounded-xl bg-at-risk-bg px-3 py-2 text-xs font-semibold text-at-risk">{topic}</li>)}</ul> : <p className="mt-2 rounded-xl bg-on-track-bg px-3 py-2.5 text-xs font-semibold text-on-track">No weak topics were flagged in this session.</p>}
          <p className="mt-5 text-xs text-muted">Overall mastery: <strong className="text-ink">{student.overallMastery}%</strong> · Subject mastery: <strong className="text-ink">{currentMastery}%</strong></p>
        </article>
        <article className="rounded-2xl border border-line bg-white p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-lavender">Visual report</p>
          <h2 className="mt-2 text-base font-bold text-ink">Individual subject mastery</h2>
          <p className="mt-1 text-xs text-muted">Live scores across your learning subjects</p>
          <SubjectLineGraph student={student} />
        </article>
      </section>

      <section className="mt-5 rounded-2xl border border-line bg-white p-5 sm:p-7"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-base font-bold text-ink">Comprehensive knowledge map</h2><p className="mt-1 text-xs text-muted">Nodes reflect your latest answers across all subjects.</p></div><div className="flex gap-3 text-[10px] font-semibold text-muted"><span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full bg-on-track" /> Mastered</span><span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full bg-at-risk" /> Needs support</span><span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full bg-lavender" /> In progress</span></div></div>
        <div className="concept-network grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">{conceptNodes.map((node) => { const status = student.nodeStatuses[node.name] ?? 'inProgress'; return <article key={node.name} className={`relative z-[1] flex min-h-[92px] flex-col items-center justify-center rounded-2xl border p-3 text-center ${nodeStyles[status]}`}><span className="grid size-7 place-items-center rounded-full bg-white/75">{status === 'mastered' ? <Check size={15} /> : status === 'needsPractice' ? <CircleAlert size={15} /> : <span className="size-2 rounded-full bg-lavender" />}</span><h3 className="mt-2 text-xs font-bold text-ink">{node.name}</h3><p className="mt-1 text-[10px] font-semibold">{status === 'needsPractice' ? 'Needs support' : status === 'mastered' ? 'Mastered' : 'In progress'}</p></article> })}</div>
      </section>
      {session.areasOfConcern.length > 0 && <section className="mt-5 rounded-2xl border border-at-risk/20 bg-at-risk-bg/70 p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-at-risk">Concepts to revisit</p><div className="mt-3 flex flex-wrap gap-2">{session.areasOfConcern.map((concern, index) => <span key={`${concern}-${index}`} className="rounded-xl border border-at-risk/15 bg-white px-3 py-2 text-xs font-semibold text-ink">{concern}</span>)}</div></section>}
      <p className="mt-5 text-right text-[11px] text-muted">Compared across {SUBJECTS.length} subjects</p>
    </main>
  )
}

function SubjectLineGraph({ student }) {
  const points = [
    { label: 'Math', subject: 'Mathematics', x: 50 },
    { label: 'Coding', subject: 'Python Coding', x: 250 },
    { label: 'Science', subject: 'General Science', x: 450 },
  ].map((point) => {
    const score = student.subjectMastery[point.subject] ?? 0
    return { ...point, score, y: 200 - (2 * score) }
  })
  const [math, coding, science] = points
  const path = `M ${math.x} ${math.y} C 116 ${math.y}, 184 ${coding.y}, ${coding.x} ${coding.y} S 384 ${science.y}, ${science.x} ${science.y}`

  return (
    <svg className="mt-5 w-full overflow-visible" viewBox="0 0 500 200" role="img" aria-labelledby="subject-graph-title subject-graph-description">
      <title id="subject-graph-title">Individual subject mastery</title>
      <desc id="subject-graph-description">{`Math ${math.score} percent, Coding ${coding.score} percent, Science ${science.score} percent.`}</desc>
      {[0, 100, 200].map((y) => <line key={y} x1="30" y1={y} x2="480" y2={y} stroke="#E8E0EC" strokeWidth="1" />)}
      <line x1="30" y1="0" x2="30" y2="200" stroke="#BCA5D3" strokeWidth="1.5" />
      <line x1="30" y1="200" x2="480" y2="200" stroke="#BCA5D3" strokeWidth="1.5" />
      <text x="2" y="7" fill="#766A80" fontSize="10">100%</text>
      <text x="2" y="104" fill="#766A80" fontSize="10">50%</text>
      <text x="2" y="198" fill="#766A80" fontSize="10">0%</text>
      <path d={path} stroke="#9F84B1" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point) => {
        const pointColor = point.score > 70 ? '#4EAB7A' : point.score < 50 ? '#E06B7F' : '#9F84B1'
        return <g key={point.subject}><text x={point.x} y={Math.max(14, point.y - 12)} textAnchor="middle" fill="#3A2A45" fontSize="11" fontWeight="700">{point.score}%</text><circle className="animate-pulse" cx={point.x} cy={point.y} r="7" fill={pointColor} stroke="white" strokeWidth="2" /><text x={point.x} y="194" textAnchor="middle" fill="#766A80" fontSize="11">{point.label}</text></g>
      })}
    </svg>
  )
}

export default PerformanceAnalytics