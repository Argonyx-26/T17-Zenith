import { BookOpenCheck, Braces, FlaskConical, History, Play, Sparkles } from 'lucide-react'
import { SUBJECTS, subjectDetails } from '../mockData.js'

const subjectIcons = {
  Mathematics: BookOpenCheck,
  'Python Coding': Braces,
  'General Science': FlaskConical,
}

const subjectTones = {
  Mathematics: 'bg-lavender-wash text-lavender',
  'Python Coding': 'bg-on-track-bg text-on-track',
  'General Science': 'bg-progress-bg text-progress',
}

function StudentHub({ student, onStartQuiz }) {
  const recentSessions = [...student.quizHistory].reverse().slice(0, 3)

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <section className="relative mb-7 overflow-hidden rounded-2xl bg-ink px-6 py-7 text-white sm:px-9 sm:py-9">
        <div className="absolute -right-16 -top-24 size-64 rounded-full border-[42px] border-lavender/20" aria-hidden="true" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-lavender-light"><Sparkles size={14} /> Student Learning Hub</p>
            <h1 className="font-display text-[32px] leading-tight sm:text-[40px]">Welcome back, {student.name.split(' ')[0]}.</h1>
            <p className="mt-2 text-sm text-white/75">{student.name} <span className="mx-1.5 text-lavender-light">·</span> {student.email}</p>
          </div>
          <div className="min-w-[180px] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/65">Overall mastery</p>
            <p className="mt-1 font-display text-[30px] leading-none">{student.overallMastery}<span className="ml-1 text-base">%</span></p>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-line bg-white p-5 sm:p-6" aria-labelledby="your-progress-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-lavender">Your Progress</p><h2 id="your-progress-title" className="mt-1 text-base font-bold text-ink">Overall mastery</h2></div>
          <p className="font-display text-[30px] leading-none text-ink">{student.overallMastery}%</p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full border border-line bg-page"><div className="h-full rounded-full bg-lavender transition-[width] duration-700" style={{ width: `${student.overallMastery}%` }} /></div>
        <p className="mt-2 text-[11px] text-muted">Progress updates as you complete subject quizzes.</p>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-lavender">Pick up where curiosity takes you</p><h2 className="mt-1 text-xl font-bold text-ink">Choose a subject</h2></div>
          <p className="text-xs text-muted">10 questions · selected from a 30-question bank</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {SUBJECTS.map((subject) => {
            const Icon = subjectIcons[subject]
            const mastery = student.subjectMastery[subject] ?? 0
            return (
              <article key={subject} className="group rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-lavender-light hover:shadow-[0_14px_36px_rgba(58,42,69,0.08)] sm:p-6">
                <div className="flex items-start justify-between gap-3"><span className={`grid size-11 place-items-center rounded-2xl ${subjectTones[subject]}`}><Icon size={21} /></span><span className="rounded-full bg-page px-2.5 py-1 text-[10px] font-bold text-muted">{subjectDetails[subject].eyebrow}</span></div>
                <h3 className="mt-5 text-lg font-bold text-ink">{subject}</h3>
                <p className="mt-1 min-h-10 text-xs leading-5 text-muted">{subjectDetails[subject].description}</p>
                <div className="mt-5 flex items-center justify-between text-xs"><span className="font-semibold text-muted">Current mastery</span><span className="font-bold text-ink">{mastery}%</span></div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-lavender-wash"><div className="h-full rounded-full bg-lavender transition-[width] duration-700 group-hover:bg-on-track" style={{ width: `${mastery}%` }} /></div>
                <button type="button" onClick={() => onStartQuiz(subject)} className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-lavender px-4 text-sm font-bold text-white transition-colors hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender"><Play size={15} fill="currentColor" /> Start quiz</button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-lavender">Your learning record</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-page p-4"><p className="text-xs font-semibold text-muted">Quizzes completed</p><p className="mt-2 font-display text-[30px] leading-none text-ink">{student.quizzesTaken}</p></div>
            <div className="rounded-2xl bg-page p-4"><p className="text-xs font-semibold text-muted">Questions answered</p><p className="mt-2 font-display text-[30px] leading-none text-ink">{student.totalQuestionsAttempted}</p></div>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">Your mastery and session history are saved to your account when each quiz is complete.</p>
        </article>
        <article className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-lavender">Recent sessions</p><h2 className="mt-1 text-base font-bold text-ink">Progress at a glance</h2></div><History size={18} className="text-lavender" /></div>
          {recentSessions.length ? <div className="mt-4 divide-y divide-line">{recentSessions.map((session) => <div key={session.id} className="flex flex-wrap items-center justify-between gap-2 py-3"><div><p className="text-sm font-semibold text-ink">{session.subject}</p><p className="mt-0.5 text-[11px] text-muted">{new Date(session.completedAt).toLocaleDateString()} · {session.correctCount} of {session.questionsTotal} correct</p></div><span className="rounded-full bg-on-track-bg px-2.5 py-1 text-xs font-bold text-on-track">{session.score}%</span></div>)}</div> : <p className="mt-5 rounded-xl bg-page px-4 py-5 text-sm leading-6 text-muted">Your completed quizzes will appear here with their scores and subject mastery updates.</p>}
        </article>
      </section>
    </main>
  )
}

export default StudentHub