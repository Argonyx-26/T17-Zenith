import { ArrowRight, Check, CircleAlert, Sparkles } from 'lucide-react'

function QuizSession({ student, quizState, dispatch }) {
  const question = quizState.questions[quizState.questionIndex]
  if (!question) return null

  const isLastQuestion = quizState.questionIndex === quizState.questions.length - 1

  return (
    <main className="mx-auto max-w-[1050px] px-4 py-6 sm:px-6 sm:py-9">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-lavender">{student.name} · {student.email}</p><h1 className="mt-1 font-display text-[27px] text-ink">Subject: {quizState.subject} <span className="text-lavender">|</span> Question {quizState.questionIndex + 1} of 10</h1></div>
        <div className="rounded-2xl border border-line bg-white px-4 py-2.5 text-xs font-semibold text-muted"><span className="text-on-track">{quizState.score}</span> correct <span className="mx-1">·</span> {quizState.answers.length} answered</div>
      </div>
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-lavender-wash"><div className="h-full rounded-full bg-lavender transition-[width] duration-500" style={{ width: `${(quizState.answers.length / 10) * 100}%` }} /></div>

      <section className="rounded-2xl border border-line bg-white p-5 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-lavender">{question.concept}</p>
        <h2 className="mt-3 max-w-[760px] font-display text-[25px] leading-snug text-ink sm:text-[32px]">{question.prompt}</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Choose an answer">
          {question.options.map((option, index) => {
            const selected = quizState.selectedOptionIndex === index
            const correctAnswer = quizState.answerRevealed && option.isCorrect
            const incorrectAnswer = quizState.answerRevealed && selected && !option.isCorrect
            return <button type="button" role="radio" aria-checked={selected} disabled={quizState.answerRevealed} key={`${question.id}-${option.label}`} onClick={() => dispatch({ type: 'ANSWER_QUESTION', optionIndex: index })} className={`flex min-h-[58px] items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all duration-200 disabled:cursor-default ${correctAnswer ? 'border-on-track/35 bg-on-track-bg text-on-track' : incorrectAnswer ? 'border-at-risk/35 bg-at-risk-bg text-at-risk' : selected ? 'border-lavender bg-lavender-wash text-ink' : 'border-line text-ink hover:border-lavender-light hover:bg-page'}`}>
              <span>{option.label}</span>{correctAnswer ? <Check size={17} /> : incorrectAnswer ? <CircleAlert size={17} /> : <span className="size-4 rounded-full border border-line" />}
            </button>
          })}
        </div>

        {quizState.answerRevealed && quizState.latestAnswer && <ExplanationHub answer={quizState.latestAnswer} />}

        {quizState.answerRevealed && <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5"><p className="text-xs text-muted">{isLastQuestion ? 'Your report is ready after this answer.' : 'Your explanation is saved as you move through the quiz.'}</p><button type="button" onClick={() => dispatch({ type: 'NEXT_QUESTION' })} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-ink px-5 text-sm font-bold text-white transition-colors hover:bg-lavender">Acknowledge &amp; Proceed <ArrowRight size={16} /></button></div>}
      </section>
    </main>
  )
}

function ExplanationHub({ answer }) {
  const { question, selectedOption, correctOption, isCorrect } = answer
  const otherOptions = question.options.filter((option) => !option.isCorrect && option !== selectedOption)
  return (
    <section className="mt-5 space-y-3" aria-live="polite" aria-labelledby="explanation-title">
      {!isCorrect && <div role="status" className="flex items-start gap-3 rounded-2xl border border-at-risk/20 bg-at-risk-bg px-4 py-3.5"><CircleAlert size={18} className="mt-0.5 shrink-0 text-at-risk" /><div><p className="text-xs font-bold uppercase tracking-[0.1em] text-at-risk">AI MindGap diagnosis</p><p className="mt-1 text-sm font-semibold leading-5 text-ink">{selectedOption.misconception}</p></div></div>}
      <div className="rounded-2xl border border-lavender-light/50 bg-lavender-wash p-4 sm:p-5">
        <div className="flex items-center gap-2"><span className={`grid size-8 place-items-center rounded-xl ${isCorrect ? 'bg-on-track-bg text-on-track' : 'bg-white text-lavender'}`}><Sparkles size={16} /></span><h3 id="explanation-title" className="text-sm font-bold text-ink">Deep Concept Analysis</h3></div>
        <p className={`mt-4 rounded-xl px-3 py-2.5 text-sm font-extrabold ${isCorrect ? 'bg-on-track-bg text-on-track' : 'bg-at-risk-bg text-at-risk'}`}>{isCorrect ? 'Correct Answer!' : 'Incorrect Choice!'}</p>
        <p className="mt-3 text-sm leading-6 text-ink"><strong>Why {correctOption.label} is right:</strong> {question.explanation}</p>
        {!isCorrect && <p className="mt-2 text-sm leading-6 text-muted"><strong className="text-at-risk">Your choice ({selectedOption.label}):</strong> {selectedOption.explanation} <span className="font-semibold text-at-risk">Prerequisite gap: {selectedOption.misconception}</span></p>}
        {otherOptions.length > 0 && <div className="mt-4 border-t border-lavender-light/50 pt-3"><p className="text-xs font-bold text-ink">Why the other options are false</p><ul className="mt-2 space-y-2">{otherOptions.map((option) => <li key={option.label} className="text-xs leading-5 text-muted"><strong className="text-ink">{option.label}:</strong> {option.explanation} <span className="text-at-risk">{option.misconception}</span></li>)}</ul></div>}
        {isCorrect && <p className="mt-3 text-sm font-semibold text-on-track">Nice work. This concept will be marked mastered on your knowledge map.</p>}
      </div>
    </section>
  )
}

export default QuizSession