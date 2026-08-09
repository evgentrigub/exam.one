// Exercise interiors — Stitch-inspired calm, airy 2-column layout
const { L, useState, useEffect, useRef, useApp, EXERCISES, MOCK_EXAMS, PLANS, SKILLS, LEVELS, TYPE_OPTIONS, Ic, useIcons, LevelPip, Divider } = window;

// =====================================================================
// Shared atoms for the calm look
// =====================================================================
const CalmCard = ({ children, className='' }) => (
  <div className={`bg-base-100 rounded-box border border-base-300/70 ${className}`}>{children}</div>
);

const MetaPill = ({ icon, children }) => (
  <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-base-200 text-base-content/70">
    <Ic name={icon} size={11}/> {children}
  </span>
);

const QuestionOption = ({ letter, selected, correct, wrong, onClick, disabled, children, accent='primary' }) => {
  const base = 'group w-full text-left px-4 py-3 rounded-box border transition-all flex items-center gap-3';
  const state = correct
    ? 'border-success bg-success/5'
    : wrong
    ? 'border-error bg-error/5'
    : selected
    ? `border-${accent} bg-${accent}/5`
    : 'border-base-300 hover:border-base-content/30 bg-base-100';
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${state}`}>
      <span className={`w-5 h-5 rounded-full border ${
        correct ? 'border-success bg-success text-success-content' :
        wrong ? 'border-error bg-error text-error-content' :
        selected ? `border-${accent} bg-${accent} text-${accent}-content` :
        'border-base-300 bg-base-100'
      } grid place-items-center text-[10px] font-mono shrink-0`}>
        {correct ? <Ic name="check" size={10}/> : wrong ? <Ic name="x" size={10}/> : <span className="opacity-70">{letter}</span>}
      </span>
      <span className="text-sm flex-1">{children}</span>
    </button>
  );
};

// Shown at the very top of an exercise opened inside a mock exam.
const ExamModeBanner = ({ exam }) => (
  <div className="mb-5 rounded-box border border-warning/40 bg-warning/10 px-4 py-3 flex items-center gap-3">
    <span className="w-9 h-9 rounded-full bg-warning/20 text-warning grid place-items-center shrink-0">
      <Ic name="file-badge" size={16}/>
    </span>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold flex items-center gap-2 flex-wrap">
        Exam mode · {exam.partLabel}
        <span className="text-[11px] font-mono font-normal px-1.5 py-0.5 rounded-full bg-warning/15 text-base-content/70">Task {exam.exNo} of {exam.exTotal}</span>
      </div>
      <div className="text-xs text-base-content/70">You’re taking this exercise as part of a timed mock exam — answers count toward your result.</div>
    </div>
    <button onClick={exam.onBack} className="btn btn-xs btn-ghost gap-1 shrink-0">
      <Ic name="arrow-left" size={12}/> Back to exam
    </button>
  </div>
);

// Sticky action bar with the "complete & lock" control for exam mode.
const ExamCompleteBar = ({ exam }) => {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="sticky bottom-4 mt-8 z-20">
      <div className="rounded-box border border-base-300 bg-base-100/95 backdrop-blur shadow-lg px-5 py-3.5 flex items-center gap-3">
        <Ic name="lock" size={15} cls="text-warning shrink-0"/>
        <div className="text-xs text-base-content/70 leading-snug">
          <b className="text-base-content">Finished this task?</b> Once you complete it you can’t return to it — your answers are final.
        </div>
        {!confirm ? (
          <button onClick={()=>setConfirm(true)} className="btn btn-primary btn-sm ml-auto gap-1.5 shrink-0">
            <Ic name="check" size={13}/> Complete exercise
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <span className="text-xs text-base-content/70 hidden sm:block">Complete and lock?</span>
            <button onClick={()=>setConfirm(false)} className="btn btn-ghost btn-xs">Cancel</button>
            <button onClick={exam.onComplete} className="btn btn-error btn-sm gap-1.5">
              <Ic name="lock" size={12}/> Yes, complete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ExerciseHeader = ({ skill, title, subtitle, level, type, onBack }) => {
  const s = SKILLS.find(x => x.id === skill);
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        <button onClick={onBack} className="mt-1 w-9 h-9 rounded-full border border-base-300 hover:bg-base-200 grid place-items-center text-base-content/70">
          <Ic name="arrow-left" size={14}/>
        </button>
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-base-content/50">
            <Ic name={s.icon} size={11}/> {s.label} practice{type ? ` · ${type}` : ''}
          </div>
          <h1 className="font-display text-[28px] font-bold leading-tight mt-1">{title}</h1>
          {subtitle && <div className="text-sm text-base-content/60 mt-1">{subtitle}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {level && <span className="text-[11px] font-mono font-semibold px-2 py-1 rounded-full bg-base-200">{level}</span>}
      </div>
    </div>
  );
};

// =====================================================================
// READING
// =====================================================================
function ReadingExercise({ exam }) {
  const { go, route } = useApp();
  const e = EXERCISES.find(x => x.id === route.id) || EXERCISES.find(x => x.skill === 'reading');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  useIcons([submitted, answers]);

  const questions = [
    { id:'q1', q:'Warum schreibt Anna an Julia?', opts:['Sie lädt sie zum Geburtstag ein.','Sie braucht Hilfe.','Sie fährt in den Urlaub.','Sie sucht eine Wohnung.'], correct:0 },
    { id:'q2', q:'Wann findet die Feier statt?', opts:['Am Freitag um 18 Uhr','Am Samstag um 19 Uhr','Am Sonntag um 16 Uhr','Am Samstag um 21 Uhr'], correct:1 },
    { id:'q3', q:'Was soll Julia mitbringen?', opts:['Nichts','Einen Salat','Getränke','Einen Kuchen'], correct:1 },
    { id:'q4', q:'Wo ist die Feier?', opts:['Bei Anna zuhause','Im Restaurant','Im Park','In der Sprachschule'], correct:0 },
  ];
  const answered = Object.keys(answers).length;

  return (
    <div className="max-w-[1180px] mx-auto px-8 py-8">
      {exam && <ExamModeBanner exam={exam}/>}
      <ExerciseHeader skill="reading" type="email" title={e.title} subtitle="Personal email · 120 words · ~3 min read"
        level={e.level} onBack={()=> exam ? exam.onBack() : go({ name:'exercises' })}/>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT — text */}
        <CalmCard className="col-span-12 lg:col-span-6 p-7">
          <div className="flex items-center gap-2 text-base-content/70">
            <Ic name="mail" size={14}/>
            <div className="text-sm font-semibold">Text</div>
            <div className="ml-auto join">
              <button className="join-item btn btn-xs btn-ghost"><Ic name="volume-2" size={12}/></button>
              <button className="join-item btn btn-xs btn-ghost"><Ic name="type" size={12}/></button>
              <button className="join-item btn btn-xs btn-ghost"><Ic name="languages" size={12}/></button>
            </div>
          </div>
          <h2 className="font-display text-xl font-bold mt-3">Einladung von Anna</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            <MetaPill icon="clock">8 min read</MetaPill>
            <MetaPill icon="book-open">120 words</MetaPill>
            <MetaPill icon="sparkles">4 new words</MetaPill>
          </div>
          <article className="mt-5 space-y-3 leading-[1.75] text-[15px] text-base-content/85">
            <div className="text-sm text-base-content/60">Liebe Julia,</div>
            <p>wie geht es dir? Mir geht es gut, aber ich habe viel zu tun. Nächste Woche ist mein Geburtstag und ich möchte dich zu meinem Geburtstag einladen. Ich werde 28 Jahre alt!</p>
            <p>Komm bitte <mark className="bg-primary/15 text-base-content rounded px-1">am Samstag um 19 Uhr</mark>. Die Feier ist bei mir in der Goethestraße 12. Wir werden grillen und Musik hören. Wenn du möchtest, bring einen Salat mit — wir haben schon genug Getränke.</p>
            <p>Meine Freunde aus der Sprachschule kommen auch. Du kennst Paul und Mira, oder? Sie freuen sich, dich wiederzusehen.</p>
            <p>Bitte schreib mir bis Donnerstag, ob du Zeit hast.</p>
            <p className="text-base-content/70">Viele Grüße,<br/>Anna</p>
          </article>
          <div className="mt-6 pt-4 border-t border-base-300/70 text-xs text-base-content/50 flex items-center justify-between">
            <span>Tap a word to see its translation</span>
            <span className="flex items-center gap-1"><Ic name="bookmark" size={11}/> Save text</span>
          </div>
        </CalmCard>

        {/* RIGHT — questions */}
        <div className="col-span-12 lg:col-span-6 space-y-5">
          <CalmCard className="p-7">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold">Questions</h2>
              <span className="ml-auto text-xs text-base-content/60">
                {submitted ? '4 of 4 answered' : `${answered} of ${questions.length} answered`}
              </span>
            </div>
            <p className="text-sm text-base-content/60 mt-1">Read the text and choose the best answer for each question.</p>

            <div className="mt-5 space-y-6">
              {questions.map((q, i) => (
                <div key={q.id}>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-sm font-semibold text-primary">{i+1}.</span>
                    <div className="text-[15px] font-semibold leading-snug">{q.q}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {q.opts.map((o,j) => (
                      <QuestionOption key={j} letter={String.fromCharCode(65+j)}
                        selected={answers[q.id]===j}
                        correct={submitted && j===q.correct}
                        wrong={submitted && answers[q.id]===j && j!==q.correct}
                        disabled={submitted}
                        onClick={()=>setAnswers({...answers,[q.id]:j})}>
                        {o}
                      </QuestionOption>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 pt-5 border-t border-base-300/70 flex items-center gap-3">
              <button onClick={()=> exam ? exam.onBack() : go({name:'exercises'})} className="btn btn-ghost btn-sm">Save & Exit</button>
              {!submitted ? (
                <button onClick={()=>setSubmitted(true)} disabled={answered<questions.length}
                  className="btn btn-primary btn-sm flex-1 gap-1">Submit Answers <Ic name="arrow-right" size={12}/></button>
              ) : exam ? (
                <div className="ml-auto text-sm">Score: <b className="font-mono">3 / 4</b> · 75%</div>
              ) : (
                <div className="flex-1 flex items-center gap-3">
                  <div className="text-sm">Score: <b className="font-mono">3 / 4</b> · 75%</div>
                  <button onClick={()=>{setAnswers({}); setSubmitted(false);}} className="btn btn-outline btn-sm gap-1 ml-auto"><Ic name="repeat" size={12}/>Retry</button>
                  <button className="btn btn-primary btn-sm gap-1">Next <Ic name="arrow-right" size={12}/></button>
                </div>
              )}
            </div>
          </CalmCard>
        </div>
      </div>
      {exam && <ExamCompleteBar exam={exam}/>}
    </div>
  );
}

// =====================================================================
// WRITING
// =====================================================================
function WritingExercise({ exam }) {
  const { go, route } = useApp();
  const e = EXERCISES.find(x => x.id === route.id) || EXERCISES.find(x => x.skill === 'writing');
  const [tab, setTab] = useState('prompt'); // prompt | ideal | feedback
  const [text, setText] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  useIcons([tab, showFeedback]);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const min = 80, max = 120;
  const pct = Math.min(100, Math.round((words/max)*100));

  return (
    <div className="max-w-[1180px] mx-auto px-8 py-8">
      {exam && <ExamModeBanner exam={exam}/>}
      <ExerciseHeader skill="writing" type="email" title="E-Mail an einen Freund"
        subtitle="Write a personal email · A2"
        level={e.level} onBack={()=> exam ? exam.onBack() : go({ name:'exercises' })}/>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT column */}
        <div className="col-span-12 lg:col-span-6 space-y-5">
          <CalmCard className="p-7">
            <div className="flex items-center gap-2 text-base-content/70">
              <Ic name="file-text" size={14}/>
              <div className="text-sm font-semibold">Description</div>
            </div>
            <h2 className="font-display text-xl font-bold mt-3">E-Mail an einen Freund</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              <MetaPill icon="clock">20 minutes</MetaPill>
              <MetaPill icon="type">80–120 words</MetaPill>
            </div>
            <p className="mt-4 text-[15px] text-base-content/80 leading-relaxed">
              Schreibe eine persönliche E‑Mail an einen Freund oder eine Freundin.
            </p>
          </CalmCard>

          {!exam && <CalmCard className="p-0 overflow-hidden">
            <div className="flex border-b border-base-300/70 px-3">
              {[
                { id:'prompt',   l:'AI Prompt',     i:'sparkles' },
                { id:'ideal',    l:'Ideal Answer',  i:'lightbulb' },
                { id:'feedback', l:'AI Feedback',   i:'message-square-quote' },
              ].map(t => (
                <button key={t.id} onClick={()=>setTab(t.id)}
                  className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors
                    ${tab===t.id ? 'text-primary' : 'text-base-content/60 hover:text-base-content'}`}>
                  <Ic name={t.i} size={12}/>{t.l}
                  {tab===t.id && <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-primary rounded-full"/>}
                </button>
              ))}
            </div>
            <div className="p-6">
              {tab==='prompt' && (
                <>
                  <div className="p-4 rounded-box bg-success/10 text-[14px] leading-relaxed text-base-content/85">
                    Dein Freund Max hat dir geschrieben, dass er nächste Woche Geburtstag hat und eine kleine Party macht. Schreibe ihm eine E‑Mail zurück.
                  </div>
                  <div className="mt-5">
                    <div className="text-sm font-semibold mb-2">Requirements</div>
                    <ul className="space-y-1.5 text-[14px] text-base-content/80">
                      {[
                        'Schreibe 80–120 Wörter',
                        'Verwende eine passende Anrede und einen passenden Gruß',
                        'Antworte auf seine Einladung',
                        'Erzähle, was du ihm zum Geburtstag schenken möchtest',
                        'Frage nach Details zur Party (Zeit, Ort, andere Gäste)',
                      ].map((r,i)=>(
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              {tab==='ideal' && (
                <div className="text-[14px] leading-relaxed text-base-content/80 whitespace-pre-line">
                  {`Lieber Max,

vielen Dank für deine Einladung! Natürlich komme ich zu deiner Geburtstagsparty. Ich freue mich sehr, dich zu sehen.

Ich habe schon ein kleines Geschenk für dich — du wirst es mögen! Es ist eine Überraschung.

Kannst du mir sagen, wann die Party genau beginnt und wo sie stattfindet? Und wer kommt noch? Ich möchte gerne wissen, ob ich Leute aus der Sprachschule wiedersehe.

Bis bald,
Lena`}
                </div>
              )}
              {tab==='feedback' && (
                <div className="space-y-3">
                  {!showFeedback ? (
                    <div className="text-center py-6 text-sm text-base-content/60">
                      <Ic name="message-square-quote" size={22} cls="mx-auto opacity-40 mb-2"/>
                      Submit your answer to see AI feedback here.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-4 gap-2">
                        {[['Task',5],['Structure',4],['Vocab',4],['Grammar',4]].map(([k,v])=>(
                          <div key={k} className="p-2.5 rounded-box bg-base-200/60 border border-base-300/70">
                            <div className="text-[10px] uppercase tracking-wider text-base-content/60">{k}</div>
                            <div className="font-mono font-bold text-sm">{v}/5</div>
                            <progress className="progress progress-primary h-1 mt-1" value={v} max="5"/>
                          </div>
                        ))}
                      </div>
                      <ul className="text-sm space-y-1.5 mt-3">
                        <li className="flex gap-2"><Ic name="check" size={14} cls="text-success mt-0.5 shrink-0"/>Good greeting and closing.</li>
                        <li className="flex gap-2"><Ic name="alert-triangle" size={14} cls="text-warning mt-0.5 shrink-0"/>You haven’t asked about the party details (req #5).</li>
                        <li className="flex gap-2"><Ic name="pen-line" size={14} cls="text-info mt-0.5 shrink-0"/>Try „Ich freue mich auf…" instead of „Ich freue auf…".</li>
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          </CalmCard>}
        </div>

        {/* RIGHT column — editor */}
        <CalmCard className="col-span-12 lg:col-span-6 p-7 h-fit">
          <div className="flex items-center gap-2">
            <Ic name="pen-line" size={14} cls="text-base-content/70"/>
            <div className="text-sm font-semibold text-base-content/70">Your Answer</div>
            <span className="ml-auto text-xs text-base-content/60">
              <span className={`font-mono font-semibold ${words<min?'text-base-content':words>max?'text-warning':'text-success'}`}>{words}</span>
              <span className="text-base-content/50"> / {min}–{max} words</span>
            </span>
          </div>

          <textarea value={text} onChange={ev=>setText(ev.target.value)}
            placeholder="Start writing your response here..."
            className="mt-4 w-full min-h-[360px] p-4 text-[15px] leading-relaxed rounded-box border border-base-300 bg-base-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-y"/>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-base-content/60 mb-1.5">
              <span>Word count progress</span>
              <span className="font-mono">{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-base-200 overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }}/>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button className="btn btn-ghost btn-sm gap-1.5 flex-1 border border-base-300 rounded-full">
              <Ic name="save" size={12}/> Save Draft
            </button>
            <button onClick={()=>{ setShowFeedback(true); setTab('feedback'); }} disabled={words<20}
              className="btn btn-primary btn-sm flex-1 gap-1.5 rounded-full">
              Submit <Ic name="arrow-right" size={12}/>
            </button>
          </div>
          <div className="text-[11px] text-success mt-2 flex items-center gap-1">
            <Ic name="check-circle-2" size={11}/> Draft auto‑saved just now
          </div>
        </CalmCard>
      </div>
      {exam && <ExamCompleteBar exam={exam}/>}
    </div>
  );
}

// =====================================================================
// LISTENING
// =====================================================================
function ListeningExercise({ exam }) {
  const { go, route } = useApp();
  const e = EXERCISES.find(x => x.id === route.id) || EXERCISES.find(x => x.skill === 'listening');
  const [t, setT] = useState(77);           // 1:17
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState('1x');
  const [volume, setVolume] = useState(0.6);
  const [answers, setAnswers] = useState({});
  const [remaining, setRemaining] = useState(14*60 + 32);
  const [submitted, setSubmitted] = useState(false);
  const total = 143; // 2:23
  useIcons([playing, submitted, answers, speed]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT(v => v < total ? v + 1 : (setPlaying(false), total)), 1000);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    const id = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const mmss = v => `${Math.floor(v/60)}:${String(v%60).padStart(2,'0')}`;
  const mm = v => String(Math.floor(v/60)).padStart(2,'0');
  const ss = v => String(v%60).padStart(2,'0');

  const questions = [
    { id:'l1', q:'What is the main topic of the conversation?', opts:['Planning a holiday trip','Discussing a new movie','Making plans for the weekend','Talking about work'], correct:2 },
    { id:'l2', q:'What does Sarah suggest they do on Saturday?', opts:['Go to the beach','Visit a museum','Go hiking','Stay home and watch TV'], correct:2 },
    { id:'l3', q:'Why is Mark hesitant about the initial suggestion?', opts:['He is afraid of heights','He has other plans','He thinks it might rain','He feels tired'], correct:2 },
    { id:'l4', q:'What do they finally decide to do on Sunday?', opts:['Go for a picnic in the park','Have a barbecue at Mark’s place','Go to a concert','Visit their friends'], correct:0 },
  ];

  return (
    <div className="max-w-[1180px] mx-auto px-8 py-8">
      {exam && <ExamModeBanner exam={exam}/>}
      <ExerciseHeader skill="listening" type="dialog" title="Listening Practice: Exercise B"
        subtitle="Short conversation · answer 4 questions"
        level={e.level} onBack={()=> exam ? exam.onBack() : go({ name:'exercises' })}/>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT — audio + timer */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          <CalmCard className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-box shrink-0 grid place-items-center"
                style={{ background:'radial-gradient(circle at 30% 30%, #fca5a5, #1e1b4b 70%)' }}>
                <Ic name="audio-waveform" size={18} cls="text-white"/>
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm leading-tight truncate">Conversation about Weekend Plans</div>
                <div className="text-xs text-base-content/60 mt-0.5">Listening Section B Audio</div>
              </div>
            </div>

            <div className="mt-5">
              <input type="range" min="0" max={total} value={t} onChange={e=>setT(+e.target.value)}
                className="w-full accent-primary"/>
              <div className="flex justify-between font-mono text-[11px] text-base-content/60 mt-1">
                <span>{mmss(t)}</span><span>{mmss(total)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-base-300/70 flex items-center gap-3">
              <button onClick={()=>setPlaying(!playing)} className="w-9 h-9 rounded-full bg-primary text-primary-content grid place-items-center shrink-0">
                <Ic name={playing ? 'pause' : 'play'} size={14}/>
              </button>
              <Ic name="volume-2" size={13} cls="text-base-content/50 shrink-0"/>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e=>setVolume(+e.target.value)}
                className="flex-1 accent-primary min-w-0"/>
              <div className="join">
                {['0.75x','1x','1.25x'].map(s => (
                  <button key={s} onClick={()=>setSpeed(s)}
                    className={`join-item btn btn-xs ${speed===s?'btn-primary':'btn-ghost'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </CalmCard>

          <CalmCard className="p-5">
            <div className="text-xs font-semibold text-base-content/70 text-center">Time Remaining</div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mt-3">
              <div className="p-3 rounded-box bg-base-200/60 text-center">
                <div className="font-display text-4xl font-bold tabular-nums">{mm(remaining)}</div>
                <div className="text-[11px] text-base-content/60 mt-1">Minutes</div>
              </div>
              <div className="text-base-content/40 text-2xl font-display leading-none">:</div>
              <div className="p-3 rounded-box bg-base-200/60 text-center">
                <div className="font-display text-4xl font-bold tabular-nums">{ss(remaining)}</div>
                <div className="text-[11px] text-base-content/60 mt-1">Seconds</div>
              </div>
            </div>
          </CalmCard>

          <CalmCard className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-base-content/80">
              <Ic name="info" size={13}/> Instructions
            </div>
            <ul className="mt-3 text-xs text-base-content/70 space-y-1.5">
              <li className="flex gap-2"><Ic name="dot" size={12}/>You may replay the audio up to 2 times.</li>
              <li className="flex gap-2"><Ic name="dot" size={12}/>Transcript unlocks after submit.</li>
              <li className="flex gap-2"><Ic name="dot" size={12}/>Take notes on scratch paper if helpful.</li>
            </ul>
          </CalmCard>
        </div>

        {/* RIGHT — questions */}
        <CalmCard className="col-span-12 lg:col-span-8 p-7">
          <h2 className="font-display text-2xl font-bold">Questions</h2>
          <p className="text-sm text-base-content/60 mt-1">Listen to the audio and answer the questions below.</p>

          <div className="mt-6 space-y-7">
            {questions.map((q, i) => (
              <div key={q.id}>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-mono text-sm font-semibold text-primary">{i+1}.</span>
                  <div className="text-[15px] font-semibold">{q.q}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.opts.map((o, j) => (
                    <QuestionOption key={j} letter={String.fromCharCode(65+j)}
                      selected={answers[q.id]===j}
                      correct={submitted && j===q.correct}
                      wrong={submitted && answers[q.id]===j && j!==q.correct}
                      disabled={submitted}
                      onClick={()=>setAnswers({...answers, [q.id]:j})}>
                      {o}
                    </QuestionOption>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-5 border-t border-base-300/70 flex items-center gap-3">
            {!exam && <button onClick={()=>go({name:'exercises'})}
              className="btn btn-sm rounded-full bg-base-200 border-base-300 hover:bg-base-300">Save & Exit</button>}
            <button onClick={()=>setSubmitted(true)} disabled={Object.keys(answers).length<questions.length || submitted}
              className="btn btn-primary btn-sm rounded-full flex-1">
              {submitted ? 'Submitted' : 'Submit Answers'}
            </button>
          </div>
          {submitted && !exam && (
            <div className="mt-4 p-4 rounded-box bg-success/5 border border-success/30 flex items-center gap-3">
              <Ic name="trophy" size={16} cls="text-success"/>
              <div className="text-sm">Great — you scored <b className="font-mono">3/4</b>. Transcript and explanations are now unlocked below.</div>
              <button className="ml-auto btn btn-xs btn-ghost gap-1"><Ic name="file-text" size={11}/> Transcript</button>
            </div>
          )}
        </CalmCard>
      </div>
      {exam && <ExamCompleteBar exam={exam}/>}
    </div>
  );
}

// =====================================================================
// SPEAKING
// =====================================================================
function SpeakingExercise({ exam }) {
  const { go, route } = useApp();
  const e = EXERCISES.find(x => x.id === route.id) || EXERCISES.find(x => x.skill === 'speaking');
  const [phase, setPhase] = useState('ready'); // ready | recording | done
  const [t, setT] = useState(0);
  useIcons([phase]);

  useEffect(()=>{
    if(phase!=='recording') return;
    const id = setInterval(()=>setT(v=>{
      if (v+1 >= 30) { clearInterval(id); setPhase('done'); return 30; }
      return v+1;
    }), 1000);
    return ()=>clearInterval(id);
  }, [phase]);

  const mmss = v => `${Math.floor(v/60)}:${String(v%60).padStart(2,'0')}`;

  return (
    <div className="max-w-[1180px] mx-auto px-8 py-8">
      {exam && <ExamModeBanner exam={exam}/>}
      <ExerciseHeader skill="speaking" type="monologue" title="Dich selbst vorstellen"
        subtitle="30‑second self‑introduction"
        level={e.level} onBack={()=> exam ? exam.onBack() : go({ name:'exercises' })}/>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT — prompt & phrases */}
        <div className="col-span-12 lg:col-span-6 space-y-5">
          <CalmCard className="p-7">
            <div className="flex items-center gap-2 text-base-content/70">
              <Ic name="file-text" size={14}/>
              <div className="text-sm font-semibold">Prompt</div>
            </div>
            <h2 className="font-display text-xl font-bold mt-3">Introduce yourself in German</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              <MetaPill icon="clock">0:30 target</MetaPill>
              <MetaPill icon="mic">1 recording</MetaPill>
              <MetaPill icon="message-square-quote">AI feedback</MetaPill>
            </div>
            <div className="mt-4 p-4 rounded-box bg-success/10 text-[14px] leading-relaxed text-base-content/85">
              Du triffst eine neue Person. Stelle dich in 30 Sekunden vor und erzähle etwas über dich.
            </div>
            <div className="mt-5">
              <div className="text-sm font-semibold mb-2">Cover these points</div>
              <ul className="space-y-1.5 text-[14px] text-base-content/80">
                {['Dein Name und Alter','Wo du wohnst','Was du machst (Beruf oder Studium)','Deine Hobbys','Warum du Deutsch lernst'].map((r,i)=>(
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span><span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CalmCard>

          {!exam && <CalmCard className="p-6">
            <div className="flex items-center gap-2 text-base-content/70">
              <Ic name="lightbulb" size={14}/>
              <div className="text-sm font-semibold">Useful phrases</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm font-mono">
              {['Ich heiße…','Ich bin … Jahre alt','Ich wohne in…','Ich arbeite als…','In meiner Freizeit…','Ich lerne Deutsch, weil…'].map(p=>(
                <div key={p} className="px-3 py-2 rounded-box bg-base-200/60 border border-base-300/70">{p}</div>
              ))}
            </div>
          </CalmCard>}
        </div>

        {/* RIGHT — recorder */}
        <CalmCard className="col-span-12 lg:col-span-6 p-7 h-fit">
          <div className="flex items-center gap-2 text-base-content/70">
            <Ic name="mic" size={14}/>
            <div className="text-sm font-semibold">Your Recording</div>
            <span className={`ml-auto text-xs font-mono ${phase==='recording'?'text-error':'text-base-content/60'}`}>
              {phase==='recording' && <span className="inline-block w-2 h-2 rounded-full bg-error mr-1 align-middle animate-pulse"/>}
              {mmss(t)} / 0:30
            </span>
          </div>

          {/* Recorder visual */}
          <div className="mt-6 flex flex-col items-center py-8">
            <div className={`w-44 h-44 rounded-full grid place-items-center transition-all
              ${phase==='recording' ? 'bg-error/5 ring-8 ring-error/10' :
                phase==='done' ? 'bg-success/5 ring-8 ring-success/10' :
                'bg-primary/5 ring-8 ring-primary/10'}`}>
              <button onClick={()=>{
                if (phase==='ready') { setT(0); setPhase('recording'); }
                else if (phase==='recording') setPhase('done');
                else { setT(0); setPhase('ready'); }
              }} className={`w-24 h-24 rounded-full grid place-items-center text-white shadow-lg transition-transform hover:scale-105
                ${phase==='recording' ? 'bg-error' : phase==='done' ? 'bg-success' : 'bg-primary'}`}>
                <Ic name={phase==='recording' ? 'square' : phase==='done' ? 'check' : 'mic'} size={34}/>
              </button>
            </div>
            <div className="mt-5 text-center">
              <div className="text-sm font-semibold">
                {phase==='ready' ? 'Tap to start recording' : phase==='recording' ? 'Recording…' : 'Recording complete'}
              </div>
              <div className="text-xs text-base-content/60 mt-1">
                {phase==='ready' && 'Speak for about 30 seconds'}
                {phase==='recording' && 'Tap again to stop early'}
                {phase==='done' && 'Play back or submit for feedback'}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full mt-6">
              <div className="h-1.5 rounded-full bg-base-200 overflow-hidden">
                <div className={`h-full transition-all ${phase==='recording'?'bg-error':'bg-primary'}`}
                  style={{ width: `${(t/30)*100}%` }}/>
              </div>
            </div>
          </div>

          {/* Live waveform sampler */}
          <div className={`h-16 rounded-box bg-base-200/60 flex items-center justify-center gap-[3px] px-4 ${phase==='recording'?'wave-live text-error':'text-base-content/30'}`}>
            {Array.from({length:40}).map((_,i)=>(
              <span key={i} className="wave-bar" style={{
                height: phase==='ready' ? 8 : `${20 + Math.abs(Math.sin(i*0.6 + t*0.3))*70}%`,
                width: 3,
              }}/>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            {!exam && <button disabled={phase!=='done'}
              className="btn btn-sm rounded-full bg-base-200 border-base-300 hover:bg-base-300 gap-1.5 flex-1">
              <Ic name="play" size={12}/> Play back
            </button>}
            <button disabled={phase!=='done'}
              className="btn btn-primary btn-sm rounded-full gap-1.5 flex-1">
              Submit for Feedback <Ic name="arrow-right" size={12}/>
            </button>
          </div>

          {phase==='done' && !exam && (
            <div className="mt-5 p-4 rounded-box bg-base-200/60 border border-base-300/70">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-base-content/60">Auto transcript (preview)</div>
              <p className="text-sm mt-2 leading-relaxed">
                „Hallo, ich heiße Lena. Ich bin 27 Jahre alt und wohne in Berlin. Ich <mark className="bg-warning/20 rounded px-0.5">arbeiten</mark> als Designerin und in meiner Freizeit <mark className="bg-success/20 rounded px-0.5">lese ich gern</mark>."
              </p>
            </div>
          )}
        </CalmCard>
      </div>
      {exam && <ExamCompleteBar exam={exam}/>}
    </div>
  );
}

// =====================================================================
// EXAMS + PROGRESS  (kept calm, rebuilt in new vocabulary)
// =====================================================================

// Modal: configure & "generate" a fresh mock exam (design-only — closes on confirm)
function GenerateExamModal({ level, onClose, onGenerate }) {
  const [lvl, setLvl] = useState(level);
  const [secs, setSecs] = useState(() => SKILLS.map(s => s.id));
  const [focus, setFocus] = useState('balanced');
  useIcons([lvl, secs, focus]);
  const toggle = (id) => setSecs(secs.includes(id) ? secs.filter(x=>x!==id) : [...secs, id]);
  const canGen = secs.length > 0;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-base-content/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        className="w-full max-w-[520px] max-h-[90vh] flex flex-col bg-base-100 rounded-box border border-base-300 shadow-xl overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-base-300/70 flex items-start gap-3 shrink-0">
          <span className="w-10 h-10 rounded-field bg-primary/10 text-primary grid place-items-center shrink-0"><Ic name="sparkles" size={18}/></span>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold leading-tight">Generate mock exam</h2>
            <p className="text-sm text-base-content/60 mt-0.5">We’ll assemble a fresh, full‑length timed exam to your spec.</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle"><Ic name="x" size={16}/></button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mb-2">Level</div>
            <div className="flex gap-2">
              {LEVELS.map(l => (
                <button key={l} onClick={()=>setLvl(l)}
                  className={`flex-1 h-10 rounded-field text-sm font-semibold border transition-colors
                    ${lvl===l ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 border-base-300 hover:border-base-content/30'}`}>{l}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mb-2">Sections to include</div>
            <div className="grid grid-cols-2 gap-2">
              {SKILLS.map(s => {
                const on = secs.includes(s.id);
                return (
                  <button key={s.id} onClick={()=>toggle(s.id)}
                    className={`flex items-center gap-2.5 px-3 h-12 rounded-box border text-left transition-colors
                      ${on ? `border-${s.color} bg-${s.color}/5` : 'border-base-300 hover:border-base-content/30'}`}>
                    <span className={`w-7 h-7 rounded-field grid place-items-center shrink-0 ${on ? `bg-${s.color}/15 text-${s.color}` : 'bg-base-200 text-base-content/50'}`}><Ic name={s.icon} size={14}/></span>
                    <span className="text-sm font-medium flex-1">{s.label}</span>
                    <span className={`w-5 h-5 rounded-md border grid place-items-center ${on ? `bg-${s.color} border-${s.color} text-${s.color}-content` : 'border-base-300'}`}>{on && <Ic name="check" size={12}/>}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50 mb-2">Difficulty mix</div>
            <div className="flex gap-2">
              {[['easier','Gentle'],['balanced','Exam‑like'],['harder','Challenging']].map(([id,l]) => (
                <button key={id} onClick={()=>setFocus(id)}
                  className={`flex-1 h-9 rounded-full text-xs font-medium border transition-colors
                    ${focus===id ? 'bg-primary text-primary-content border-primary' : 'bg-base-100 border-base-300 text-base-content/70 hover:border-base-content/30'}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-base-300/70 flex items-center gap-3 bg-base-200/40 shrink-0">
          <div className="text-xs text-base-content/55 flex items-center gap-1.5"><Ic name="info" size={13}/> {secs.length} of {SKILLS.length} sections</div>
          <button onClick={onClose} className="btn btn-ghost btn-sm ml-auto">Cancel</button>
          <button onClick={onGenerate} disabled={!canGen}
            className="btn btn-primary btn-sm rounded-full gap-2"><Ic name="sparkles" size={14}/> Generate mock exam</button>
        </div>
      </div>
    </div>
  );
}

function Exams() {
  const { go, level } = useApp();
  const [genOpen, setGenOpen] = useState(false);
  useIcons([level, genOpen]);
  const exams = MOCK_EXAMS.filter(m => m.level === level);
  const featured = exams.find(m => m.status === 'next') || exams[0];
  return (
    <div className="max-w-[1180px] mx-auto px-8 py-8 space-y-6">
      <CalmCard className="p-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-primary">
          <Ic name="file-badge" size={11}/> Full mock exam · {level}
        </div>
        <h2 className="font-display text-2xl font-bold mt-2">{featured.title}</h2>
        <p className="text-sm text-base-content/70 mt-1">Timed {featured.time} · all four skills in exam order · exam‑authentic conditions.</p>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {featured.sections.map(([l,m])=>{
            const icon = { Reading:'book-open', Listening:'headphones', Writing:'pen-line', Speaking:'mic' }[l];
            return (
              <div key={l} className="p-4 rounded-box bg-base-200/60 border border-base-300/70">
                <Ic name={icon} size={14} cls="text-base-content/60"/>
                <div className="text-sm font-semibold mt-2">{l}</div>
                <div className="text-xs text-base-content/60 font-mono">{m} min</div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={()=>setGenOpen(true)} className="btn btn-primary rounded-full gap-2"><Ic name="sparkles" size={14}/> Generate mock exam</button>
        </div>
      </CalmCard>
      <div>
        <h3 className="font-display text-lg font-bold mb-3">All {level} mock exams</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((x)=>(
            <CalmCard key={x.id} className="p-5 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase font-semibold tracking-wider text-base-content/50">{x.set}</div>
                <span className="text-[11px] font-mono text-base-content/50">{x.time}</span>
              </div>
              <div className="font-display font-bold text-lg mt-1">{x.title}</div>
              {x.status==='done' && <div className="text-success font-mono text-xs mt-1 flex items-center gap-1"><Ic name="check-circle-2" size={12}/> Passed · {x.score}%</div>}
              {x.status==='locked' && <div className="text-base-content/50 text-xs mt-1 flex items-center gap-1"><Ic name="lock" size={11}/> Unlock at 40% across all skills</div>}
              {x.status==='next' && <div className="text-primary text-xs mt-1 flex items-center gap-1"><Ic name="sparkles" size={11}/> Recommended next</div>}
              <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px] text-base-content/55">
                {x.sections.map(([l])=>(<span key={l} className="px-2 py-0.5 rounded-full bg-base-200">{l}</span>))}
              </div>
              {x.status==='done'
                ? <button onClick={()=>go({name:'mock', id:x.id})} className="btn btn-sm btn-outline mt-4 w-full rounded-full gap-1.5"><Ic name="eye" size={13}/> Review results</button>
                : x.status==='locked'
                ? <button disabled className="btn btn-sm mt-4 w-full rounded-full gap-1.5 bg-base-200 text-base-content/40 border border-base-300 hover:bg-base-200"><Ic name="lock" size={13}/> Locked</button>
                : <button onClick={()=>go({name:'mock', id:x.id})} className="btn btn-sm btn-primary mt-4 w-full rounded-full gap-1.5"><Ic name="play" size={13}/> Start exam</button>}
            </CalmCard>
          ))}
        </div>
      </div>
      {genOpen && <GenerateExamModal level={level} onClose={()=>setGenOpen(false)}
        onGenerate={()=>{ setGenOpen(false); go({name:'mock', id:featured.id}); }}/>}
    </div>
  );
}

function Progress() {
  useIcons([]);
  const skillData = [
    { pct:68, delta:'+8', attempts:14, best:92 },
    { pct:42, delta:'+5', attempts:6,  best:4.2 },
    { pct:30, delta:'+12', attempts:4, best:80 },
    { pct:35, delta:'+9', attempts:5,  best:3.9 },
  ];
  const chart = [30,34,40,38,45,52,48,55,60,58,62,64];
  const activity = [
    { skill:'reading',   title:'Einladung von Anna',        score:'92%', when:'Today · 09:14',     good:true },
    { skill:'listening', title:'Lautsprecherdurchsage',     score:'80%', when:'Today · 08:40',     good:true },
    { skill:'speaking',  title:'Dich selbst vorstellen',    score:'3.9/5', when:'Yesterday · 19:22', good:true },
    { skill:'writing',   title:'Beschwerde an Vermieter',   score:'3.4/5', when:'Yesterday · 18:05', good:false },
    { skill:'reading',   title:'Klimaschutz in Städten',    score:'64%', when:'2 days ago',        good:false },
  ];
  const skillTone = { reading:'primary', writing:'success', listening:'info', speaking:'warning' };

  return (
    <div className="max-w-[1180px] mx-auto px-8 py-8 space-y-6">

      {/* Summary stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l:'Study time', v:'18h 42m', sub:'+3h this week', icon:'clock' },
          { l:'Exercises completed', v:'29', sub:'of 64 total', icon:'check-check' },
          { l:'Average score', v:'74%', sub:'+6 vs last month', icon:'target' },
          { l:'Current streak', v:'12 days', sub:'Best: 18 days', icon:'flame' },
        ].map((s,i)=>(
          <CalmCard key={i} className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-base-content/50">{s.l}</div>
              <Ic name={s.icon} size={14} cls="text-base-content/40"/>
            </div>
            <div className="font-display text-2xl font-bold mt-2 tabular-nums">{s.v}</div>
            <div className="text-xs text-success mt-1 flex items-center gap-1"><Ic name="trending-up" size={11}/> {s.sub}</div>
          </CalmCard>
        ))}
      </div>

      {/* Per-skill readiness */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SKILLS.map((s,i) => (
          <CalmCard key={s.id} className="p-5">
            <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-${s.color}`}>
              <Ic name={s.icon} size={12}/> {s.label}
            </div>
            <div className="font-display text-3xl font-bold mt-2 tabular-nums">{skillData[i].pct}%</div>
            <div className="text-xs text-success mt-1 flex items-center gap-1"><Ic name="trending-up" size={11}/> {skillData[i].delta} this week</div>
            <div className="mt-3 h-1.5 rounded-full bg-base-200 overflow-hidden">
              <div className={`h-full rounded-full bg-${s.color}`} style={{ width: `${skillData[i].pct}%` }}/>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-base-content/60">
              <span>{skillData[i].attempts} sessions</span>
              <span>Best {skillData[i].best}</span>
            </div>
          </CalmCard>
        ))}
      </div>

      {/* Readiness over time + Recent activity */}
      <div className="grid grid-cols-12 gap-6">
        <CalmCard className="col-span-12 lg:col-span-7 p-7">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold">Readiness over time</h3>
              <p className="text-xs text-base-content/60 mt-0.5">Overall exam‑readiness, last 12 weeks</p>
            </div>
            <div className="join">
              <button className="join-item btn btn-xs btn-primary">Week</button>
              <button className="join-item btn btn-xs btn-ghost">Month</button>
              <button className="join-item btn btn-xs btn-ghost">All</button>
            </div>
          </div>
          <div className="h-60 mt-5 rounded-box bg-base-200/60 flex items-end gap-2 p-4">
            {chart.map((v,i)=>(
              <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                <div className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors" style={{ height: `${v}%` }} title={`Week ${i+1}: ${v}%`}/>
                <div className="text-[10px] text-base-content/50 font-mono">W{i+1}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-base-content/60">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary/80"/> Readiness %</span>
            <span>Target for exam day: <b className="text-base-content">85%</b></span>
          </div>
        </CalmCard>

        <CalmCard className="col-span-12 lg:col-span-5 p-7">
          <h3 className="font-display text-xl font-bold">Recent activity</h3>
          <div className="mt-4 divide-y divide-base-300/70">
            {activity.map((a,i)=>{
              const sk = SKILLS.find(s=>s.id===a.skill);
              return (
                <div key={i} className="py-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-field grid place-items-center bg-${skillTone[a.skill]}/10 text-${skillTone[a.skill]}`}>
                    <Ic name={sk.icon} size={15}/>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{a.title}</div>
                    <div className="text-[11px] text-base-content/55">{a.when}</div>
                  </div>
                  <div className={`text-sm font-mono font-semibold ${a.good?'text-success':'text-warning'}`}>{a.score}</div>
                </div>
              );
            })}
          </div>
        </CalmCard>
      </div>

      {/* Strengths & weak spots */}
      <div className="grid grid-cols-12 gap-6">
        <CalmCard className="col-span-12 lg:col-span-6 p-7">
          <div className="flex items-center gap-2">
            <Ic name="sparkles" size={15} cls="text-success"/>
            <h3 className="font-display text-lg font-bold">Strengths</h3>
          </div>
          <ul className="mt-4 space-y-3">
            {[
              ['Reading · everyday emails', 90],
              ['Writing · greetings & closings', 86],
              ['Listening · main idea', 82],
            ].map(([k,v],i)=>(
              <li key={i}>
                <div className="flex items-center justify-between text-sm"><span>{k}</span><span className="font-mono text-xs text-base-content/60">{v}%</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-base-200 overflow-hidden"><div className="h-full bg-success rounded-full" style={{ width:`${v}%` }}/></div>
              </li>
            ))}
          </ul>
        </CalmCard>

        <CalmCard className="col-span-12 lg:col-span-6 p-7">
          <div className="flex items-center gap-2">
            <Ic name="target" size={15} cls="text-warning"/>
            <h3 className="font-display text-lg font-bold">Focus areas</h3>
          </div>
          <ul className="mt-4 space-y-3">
            {[
              ['Listening · numbers & times', 58],
              ['Speaking · fillers & pacing', 49],
              ['Writing · formal register', 62],
            ].map(([k,v],i)=>(
              <li key={i}>
                <div className="flex items-center justify-between text-sm"><span>{k}</span><span className="font-mono text-xs text-base-content/60">{v}%</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-base-200 overflow-hidden"><div className="h-full bg-warning rounded-full" style={{ width:`${v}%` }}/></div>
              </li>
            ))}
          </ul>
          <button className="btn btn-outline btn-sm mt-5 w-full gap-1.5"><Ic name="zap" size={13}/> Build a 15‑min drill from focus areas</button>
        </CalmCard>
      </div>
    </div>
  );
}

// =====================================================================
// ACCOUNT + SUBSCRIPTION
// =====================================================================
function Account() {
  const { plan, setPlan, level, go } = useApp();
  useIcons([plan]);
  const current = PLANS.find(p => p.id === plan) || PLANS[0];

  return (
    <div className="max-w-[1180px] mx-auto px-8 py-8 space-y-6">
      {/* Profile */}
      <CalmCard className="p-7">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 grid place-items-center text-primary font-display text-xl font-bold">LB</div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold">Lena Bauer</h2>
            <div className="text-sm text-base-content/60">lena.bauer@email.de · Learning German · Target {level}</div>
          </div>
          <button onClick={()=>go({ name:'settings', section:'profile' })} className="btn btn-outline btn-sm rounded-full gap-1.5"><Ic name="pencil" size={13}/> Edit profile</button>
        </div>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[['Member since','Jan 2026'],['Current plan',current.name],['Exam target','Goethe '+level],['Streak','12 days']].map(([l,v])=>(
            <div key={l} className="p-3 rounded-box bg-base-200/60 border border-base-300/70">
              <div className="text-[10px] uppercase tracking-wider text-base-content/50">{l}</div>
              <div className="font-semibold text-sm mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </CalmCard>

      {/* Subscription */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-bold">Subscription</h3>
          <span className={`badge ${plan==='pro'?'badge-primary':'badge-ghost'}`}>
            Current: {current.name}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLANS.map(p => {
            const active = p.id === plan;
            return (
              <CalmCard key={p.id} className={`p-6 flex flex-col ${active ? 'border-primary ring-1 ring-primary/30' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-xl font-bold">{p.name}</h4>
                      {active && <span className="badge badge-primary badge-sm">Active</span>}
                    </div>
                    <p className="text-sm text-base-content/60 mt-0.5">{p.blurb}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold leading-none">{p.price}</div>
                    <div className="text-[11px] text-base-content/50">{p.period}</div>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Ic name="check" size={14} cls={`mt-0.5 shrink-0 ${p.id==='pro'?'text-primary':'text-success'}`}/>
                      <span className="text-base-content/80">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={()=>setPlan(p.id)}
                  disabled={active}
                  className={`btn btn-sm mt-5 w-full rounded-full gap-1.5
                    ${active ? 'bg-base-200 text-base-content/40 border border-base-300 hover:bg-base-200'
                             : p.id==='pro' ? 'btn-primary' : 'btn-outline'}`}>
                  {active ? <><Ic name="check" size={13}/> Current plan</>
                          : p.id==='pro' ? <><Ic name="arrow-up-circle" size={13}/> Upgrade to Pro</>
                          : <><Ic name="arrow-down-circle" size={13}/> Switch to Free</>}
                </button>
              </CalmCard>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-base-content/50 flex items-center gap-1.5">
          <Ic name="info" size={12}/> Demo only — switching plans changes the badge but not the available features in this prototype.
        </div>
      </div>

      {/* Billing (mock) */}
      <CalmCard className="p-6">
        <h3 className="font-display text-lg font-bold">Billing</h3>
        <div className="mt-4 divide-y divide-base-300/70">
          {[
            ['12 Apr 2026', plan==='pro'?'Pro · monthly':'Free plan', plan==='pro'?'€9.90':'€0.00'],
            ['12 Mar 2026', plan==='pro'?'Pro · monthly':'Free plan', plan==='pro'?'€9.90':'€0.00'],
          ].map(([d,desc,amt],i)=>(
            <div key={i} className="py-3 flex items-center gap-3 text-sm">
              <Ic name="receipt" size={15} cls="text-base-content/40"/>
              <div className="flex-1">
                <div className="font-medium">{desc}</div>
                <div className="text-xs text-base-content/55">{d}</div>
              </div>
              <div className="font-mono">{amt}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm mt-3 gap-1.5"><Ic name="credit-card" size={13}/> Manage payment method</button>
      </CalmCard>
    </div>
  );
}

Object.assign(window, { ReadingExercise, WritingExercise, ListeningExercise, SpeakingExercise, Exams, Progress, Account });
