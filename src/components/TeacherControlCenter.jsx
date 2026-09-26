import { Fragment, useMemo, useState } from 'react'
import { Activity, ArrowDownRight, Search, UsersRound } from 'lucide-react'
import { SUBJECTS } from '../mockData.js'

const trackedTopics = [
  { label: 'Fractions', title: 'Fractions Mastery', masteryKey: 'Fractions', concept: 'Fractions', color: 'bg-[#9F84B1]' },
  { label: 'Equations', title: 'Equations Isolation', masteryKey: 'Algebra', concept: 'Algebra', color: 'bg-[#4F3A5F]' },
  { label: 'Loops', title: 'Code Loop Logic', concept: 'Loops', color: 'bg-[#4EAB7A]' },
  { label: 'Syntax', title: 'Syntax Parsing', concept: 'Syntax', color: 'bg-[#E06B7F]' },
]

function getStudentSessionTotals(student) {
  return student.quizHistory.reduce((totals, session) => ({
    questions: totals.questions + session.questionsTotal,
    correct: totals.correct + session.correctCount,
  }), { questions: 0, correct: 0 })
}

function getWeightedScore(student) {
  const totals = getStudentSessionTotals(student)
  return totals.questions ? Math.round((totals.correct / totals.questions) * 100) : 0
}

function summarizeClass(studentsList) {
  const submittedStudents = studentsList.filter((student) => student.quizHistory.length > 0)
  const totals = submittedStudents.reduce((result, student) => {
    const studentTotals = getStudentSessionTotals(student)
    return { questions: result.questions + studentTotals.questions, correct: result.correct + studentTotals.correct }
  }, { questions: 0, correct: 0 })
  const areasOfConcern = submittedStudents.reduce((sum, student) => sum + student.quizHistory.reduce((sessionSum, session) => sessionSum + session.areasOfConcern.length, 0), 0)
  return {
    submittedStudents,
    classAverage: totals.questions ? Math.round((totals.correct / totals.questions) * 100) : 0,
    areasOfConcern,
    totalQuestions: totals.questions,
  }
}

function getSubjectAverages(studentsList) {
  return SUBJECTS.map((subject) => {
    const sessions = studentsList.flatMap((student) => student.quizHistory.filter((session) => session.subject === subject))
    const totals = sessions.reduce((result, session) => ({ questions: result.questions + session.questionsTotal, correct: result.correct + session.correctCount }), { questions: 0, correct: 0 })
    return { subject, average: totals.questions ? Math.round((totals.correct / totals.questions) * 100) : 0, submissions: sessions.length }
  })
}

function getStudentTopicScore(student, topic) {
  const individualScore = topic.masteryKey ? student.individualTopicMastery?.[topic.masteryKey] : undefined
  if (Number.isFinite(individualScore)) return individualScore

  const sessionScores = student.quizHistory.flatMap((session) => {
    const status = session.nodeResults?.[topic.concept]
    if (status === 'mastered') return [100]
    if (status === 'needsPractice') return [0]
    return []
  })
  if (sessionScores.length) return Math.round(sessionScores.reduce((sum, score) => sum + score, 0) / sessionScores.length)
  return student.nodeStatuses?.[topic.concept] === 'mastered' ? 100 : 0
}

function getTopicAverages(studentsList) {
  return trackedTopics.map((topic) => ({
    ...topic,
    average: studentsList.length
      ? Math.round(studentsList.reduce((sum, student) => sum + getStudentTopicScore(student, topic), 0) / studentsList.length)
      : 0,
  }))
}

function TeacherControlCenter({ studentsList, view }) {
  const [query, setQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('All subjects')
  const [scoreFilter, setScoreFilter] = useState('Any score')
  const [expandedStudentId, setExpandedStudentId] = useState(null)
  const classSummary = useMemo(() => summarizeClass(studentsList), [studentsList])
  const subjectAverages = useMemo(() => getSubjectAverages(classSummary.submittedStudents), [classSummary.submittedStudents])
  const topicAverages = useMemo(() => getTopicAverages(studentsList), [studentsList])
  const searchTerm = query.trim().toLowerCase()
  const visibleStudents = classSummary.submittedStudents.filter((student) => {
    const weightedScore = getWeightedScore(student)
    const attemptedSubjects = [...new Set(student.quizHistory.map((session) => session.subject))]
    const matchesQuery = !searchTerm || [student.name, student.email, ...attemptedSubjects, String(weightedScore), `${weightedScore}%`].some((value) => value.toLowerCase().includes(searchTerm))
    const matchesSubject = subjectFilter === 'All subjects' || attemptedSubjects.includes(subjectFilter)
    const matchesScore = scoreFilter === 'Any score' || (scoreFilter === '80% and above' ? weightedScore >= 80 : weightedScore < 60)
    return matchesQuery && matchesSubject && matchesScore
  })
  const allReports = classSummary.submittedStudents.flatMap((student) => student.quizHistory.flatMap((session) => session.areasOfConcern.map((concern) => ({ student, session, concern }))))
  const avgFractions = studentsList.length ? (studentsList.reduce((acc, curr) => acc + (curr.individualTopicMastery?.Fractions || 0), 0) / studentsList.length) : 0
  const avgEquations = studentsList.length ? (studentsList.reduce((acc, curr) => acc + (curr.individualTopicMastery?.Equations || 0), 0) / studentsList.length) : 0
  const avgLoops = studentsList.length ? (studentsList.reduce((acc, curr) => acc + (curr.individualTopicMastery?.Loops || 0), 0) / studentsList.length) : 0
  const avgSyntax = studentsList.length ? (studentsList.reduce((acc, curr) => acc + (curr.individualTopicMastery?.Syntax || 0), 0) / studentsList.length) : 0
  const directTopicAverages = { Fractions: avgFractions, Equations: avgEquations, Loops: avgLoops, Syntax: avgSyntax }
  const visualTopicAverages = topicAverages.map((topic) => {
    const hasDirectScores = studentsList.some((student) => Number.isFinite(student.individualTopicMastery?.[topic.label]))
    return {
      ...topic,
      average: hasDirectScores ? directTopicAverages[topic.label] : topic.average,
    }
  })

  return (
    <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-lavender">EduTrack · live submissions</p><h1 className="font-display text-[30px] leading-tight text-ink sm:text-[36px]">{view === 'reports' ? 'Class reports' : 'Panoramic dashboard'}</h1><p className="mt-2 text-sm text-muted">Analytics are calculated from completed student quiz sessions.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-on-track/20 bg-on-track-bg px-3 py-2 text-xs font-bold text-on-track"><i className="size-2 animate-pulse rounded-full bg-on-track" /> Session data synced</span></section>
      <section className="mb-5 grid gap-3 sm:grid-cols-3" aria-label="Class summary analytics"><MetricCard label="Total logged students" value={classSummary.submittedStudents.length} detail={`${studentsList.length} student profiles in the database`} icon={<UsersRound size={18} />} tone="lavender" /><MetricCard label="Class global average" value={`${classSummary.classAverage}%`} detail={`${classSummary.totalQuestions} answered questions, weighted`} icon={<Activity size={18} />} tone="teal" /><MetricCard label="Areas of concern" value={classSummary.areasOfConcern} detail="Incorrect-input diagnoses across completed sessions" icon={<ArrowDownRight size={18} />} tone="rose" /></section>
      {view === 'reports' ? <ReportsView reports={allReports} /> : (
        <>
        <TopicCollectiveChart topics={visualTopicAverages} studentCount={studentsList.length} />
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-line bg-white">
            <div className="border-b border-line px-5 py-5 sm:px-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-base font-bold text-ink">Unified scoreboard</h2><p className="mt-1 text-xs text-muted">{visibleStudents.length} of {classSummary.submittedStudents.length} students with completed quizzes</p></div><label className="relative block w-full sm:w-[245px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, subject, score" aria-label="Filter scoreboard" className="h-9 w-full rounded-xl border border-line bg-page pl-9 pr-3 text-xs text-ink outline-none placeholder:text-muted focus:border-lavender focus:ring-2 focus:ring-lavender/15" /></label></div>
              <div className="mt-3 flex flex-wrap gap-2"><select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)} aria-label="Filter by attempted subject" className="h-9 rounded-xl border border-line bg-white px-3 text-xs font-semibold text-ink outline-none focus:border-lavender"><option>All subjects</option>{SUBJECTS.map((subject) => <option key={subject}>{subject}</option>)}</select><select value={scoreFilter} onChange={(event) => setScoreFilter(event.target.value)} aria-label="Filter by weighted score" className="h-9 rounded-xl border border-line bg-white px-3 text-xs font-semibold text-ink outline-none focus:border-lavender"><option>Any score</option><option>80% and above</option><option>Below 60%</option></select></div>
            </div>
            <div className="overflow-x-auto"><table className="w-full min-w-[730px] border-collapse text-left"><thead><tr className="bg-page/70 text-[10px] font-bold uppercase tracking-[0.1em] text-muted"><th className="px-5 py-3 font-semibold sm:px-6">Student</th><th className="px-4 py-3 font-semibold">Subjects attempted</th><th className="px-4 py-3 font-semibold">Weighted score</th><th className="px-4 py-3 font-semibold">Sessions</th><th className="px-5 py-3 font-semibold sm:px-6">Concerns</th></tr></thead><tbody className="divide-y divide-line">{visibleStudents.map((student) => { const score = getWeightedScore(student); const subjects = [...new Set(student.quizHistory.map((session) => session.subject))]; const concerns = student.quizHistory.reduce((sum, session) => sum + session.areasOfConcern.length, 0); const expanded = expandedStudentId === student.id; return <Fragment key={student.id}><tr tabIndex={0} aria-expanded={expanded} onClick={() => setExpandedStudentId(expanded ? null : student.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setExpandedStudentId(expanded ? null : student.id) } }} className={`cursor-pointer transition-colors hover:bg-lavender-wash/60 ${expanded ? 'bg-lavender-wash/50' : ''}`}><td className="px-5 py-4 sm:px-6"><p className="text-sm font-bold text-ink">{student.name}</p><p className="mt-0.5 text-[11px] text-muted">{student.email}</p></td><td className="px-4 py-4"><div className="flex flex-wrap gap-1">{subjects.map((subject) => <span key={subject} className="rounded-lg bg-lavender-wash px-2 py-1 text-[10px] font-semibold text-lavender">{subject}</span>)}</div></td><td className="px-4 py-4"><div className="flex items-center gap-2"><div className="h-2 w-[80px] overflow-hidden rounded-full bg-lavender-wash"><div className={`h-full rounded-full transition-[width] duration-700 ${score >= 80 ? 'bg-on-track' : score < 60 ? 'bg-at-risk' : 'bg-lavender'}`} style={{ width: `${score}%` }} /></div><span className="text-xs font-bold text-ink">{score}%</span></div></td><td className="px-4 py-4 text-xs font-semibold text-muted">{student.quizHistory.length}</td><td className="px-5 py-4 sm:px-6"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${concerns ? 'bg-at-risk-bg text-at-risk' : 'bg-on-track-bg text-on-track'}`}>{concerns}</span></td></tr>{expanded && <tr><td colSpan="5" className="bg-page/60 px-4 py-5 sm:px-6"><StudentDrillDown student={student} /></td></tr>}</Fragment> })}{!visibleStudents.length && <tr><td colSpan="5" className="px-6 py-12 text-center text-sm text-muted">No completed student sessions match these filters.</td></tr>}</tbody></table></div>
          </section>
          <section className="rounded-2xl border border-line bg-white p-5 sm:p-6"><div className="mb-5"><h2 className="text-base font-bold text-ink">Overall class performance</h2><p className="mt-1 text-xs text-muted">Weighted averages across completed quizzes</p></div><SubjectAverageChart subjects={subjectAverages} /></section>
        </div>
        </>
      )}
    </main>
  )
}

function TopicCollectiveChart({ topics, studentCount }) {
  return (
    <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" aria-labelledby="topic-average-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><h2 id="topic-average-title" className="text-base font-bold text-ink">📊 Class Overall Performance Tracker (Topic-Wise Breakdown)</h2><p className="text-[11px] text-muted">Averages across {studentCount} student profiles</p></div>
      <div className="h-64 w-full flex items-end justify-around border-b border-gray-200 pb-2 pt-6">
        {topics.map((topic) => <div key={topic.label} className="flex h-full w-16 flex-col items-center justify-end"><span className="mb-2 text-xs font-bold text-ink">{Math.round(topic.average)}%</span><div className="flex h-[175px] w-full items-end"><div className={`flex w-full items-center justify-center rounded-t-lg text-xs font-bold text-white transition-all duration-500 hover:opacity-90 ${topic.color}`} style={{ height: `${topic.average}%` }} /></div></div>)}
      </div>
      <div className="flex justify-around pt-2">{topics.map((topic) => <p key={topic.label} className="w-16 text-center text-[10px] font-semibold leading-4 text-ink sm:w-28 sm:text-xs">{topic.title}</p>)}</div>
    </section>
  )
}

function MetricCard({ label, value, detail, icon, tone }) {
  const tones = { lavender: 'bg-lavender-wash text-lavender', teal: 'bg-on-track-bg text-on-track', rose: 'bg-at-risk-bg text-at-risk' }
  return <article className="rounded-2xl border border-line bg-white p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-muted sm:text-sm">{label}</p><span className={`grid size-9 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span></div><p className="mt-4 font-display text-[32px] leading-none text-ink">{value}</p><p className="mt-2 text-[11px] leading-5 text-muted">{detail}</p></article>
}

function SubjectAverageChart({ subjects }) {
  return <div className="grid h-[300px] grid-cols-3 items-end gap-3 border-b border-line px-2 sm:gap-5 sm:px-4">{subjects.map(({ subject, average, submissions }) => <div key={subject} className="flex h-full min-w-0 flex-col items-center justify-end"><span className="mb-2 text-xs font-bold text-ink">{submissions ? `${average}%` : '—'}</span><div className="relative flex h-[205px] w-full max-w-[84px] items-end overflow-hidden rounded-t-2xl bg-lavender-wash"><div className="w-full rounded-t-2xl bg-lavender transition-[height] duration-700 hover:bg-on-track" style={{ height: `${average}%` }} /></div><span className="min-h-10 pt-2 text-center text-[10px] font-semibold leading-4 text-muted sm:text-[11px]">{subject}</span></div>)}</div>
}

function StudentDrillDown({ student }) {
  const sessions = student.quizHistory
  return <div className="rounded-2xl border border-line bg-white p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-lavender">Student drill-down</p><h3 className="mt-1 text-sm font-bold text-ink">{student.name} · {student.email}</h3></div><span className="rounded-full bg-lavender-wash px-3 py-1.5 text-xs font-bold text-ink">Weighted score {getWeightedScore(student)}%</span></div><div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]"><div><p className="mb-3 text-xs font-bold text-ink">Mastery by subject</p><div className="space-y-3">{SUBJECTS.map((subject) => <div key={subject}><div className="mb-1 flex justify-between text-[11px]"><span className="font-semibold text-muted">{subject}</span><span className="font-bold text-ink">{student.subjectMastery[subject]}%</span></div><div className="h-2 overflow-hidden rounded-full bg-lavender-wash"><div className="h-full rounded-full bg-lavender transition-[width] duration-700" style={{ width: `${student.subjectMastery[subject]}%` }} /></div></div>)}</div></div><div><p className="mb-3 text-xs font-bold text-ink">Session record</p><div className="max-h-[160px] space-y-2 overflow-y-auto">{sessions.map((session) => <div key={session.id} className="flex items-center justify-between gap-2 rounded-xl bg-page px-3 py-2"><span className="truncate text-[11px] font-semibold text-muted">{session.subject} · {session.correctCount}/{session.questionsTotal}</span><span className="text-xs font-bold text-ink">{session.score}%</span></div>)}</div></div></div>
  </div>
}

function ReportsView({ reports }) {
  return <section className="rounded-2xl border border-line bg-white p-5 sm:p-7"><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-at-risk-bg text-at-risk"><ArrowDownRight size={19} /></span><div><h2 className="text-base font-bold text-ink">Areas of concern</h2><p className="mt-1 text-xs text-muted">Each entry comes from an incorrect answer in a completed quiz.</p></div></div>{reports.length ? <div className="mt-5 divide-y divide-line">{reports.map(({ student, session, concern }, index) => <article key={`${session.id}-${index}`} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm font-bold text-ink">{student.name} · {session.subject}</p><p className="mt-1 text-xs text-at-risk">{concern}</p></div><time className="text-[11px] text-muted">{new Date(session.completedAt).toLocaleString()}</time></article>)}</div> : <p className="mt-5 rounded-2xl bg-page p-5 text-sm text-muted">No completed quiz has reported an area of concern yet.</p>}</section>
}

export default TeacherControlCenter