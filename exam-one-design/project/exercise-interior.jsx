// Exercise interiors — Stitch-inspired calm, airy 2-column layout
const { L, useState, useEffect, useRef, useApp, EXERCISES, SKILLS, Ic, useIcons, LevelPip, Divider } = window;

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
function ReadingExercise() {
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
      <ExerciseHeader skill="reading" type="email" title={e.title} subtitle="Personal email · 120 words · ~3 min read"
        level={e.level} onBack={()=>go({ name:'exercises' })}/>

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
              <button onClick={()=>go({name:'exercises'})} className="btn btn-ghost btn-sm">Save & Exit</button>
              {!submitted ? (
                <button onClick={()=>setSubmitted(true)} disabled={answered<questions.length}
                  className="btn btn-primary btn-sm flex-1 gap-1">Submit Answers <Ic name="arrow-right" size={12}/></button>
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
    </div>
  );
}

// =====================================================================
// WRITING
// =====================================================================
function WritingExercise() {
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
      <ExerciseHeader skill="writing" type="email" title="E-Mail an einen Freund"
        subtitle="Write a personal email · A2"
        level={e.level} onBack={()=>go({ name:'exercises' })}/>

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

          <CalmCard className="p-0 overflow-hidden">
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
          </CalmCard>
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
    </div>
  );
}

// =====================================================================
// LISTENING
// =====================================================================
function ListeningExercise() {
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
      <ExerciseHeader skill="listening" type="dialog" title="Listening Practice: Exercise B"
        subtitle="Short conversation · answer 4 questions"
        level={e.level} onBack={()=>go({ name:'exercises' })}/>

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
            <button onClick={()=>go({name:'exercises'})}
              className="btn btn-sm rounded-full bg-base-200 border-base-300 hover:bg-base-300">Save & Exit</button>
            <button onClick={()=>setSubmitted(true)} disabled={Object.keys(answers).length<questions.length || submitted}
              className="btn btn-primary btn-sm rounded-full flex-1">
              {submitted ? 'Submitted' : 'Submit Answers'}
            </button>
          </div>
          {submitted && (
            <div className="mt-4 p-4 rounded-box bg-success/5 border border-success/30 flex items-center gap-3">
              <Ic name="trophy" size={16} cls="text-success"/>
              <div className="text-sm">Great — you scored <b className="font-mono">3/4</b>. Transcript and explanations are now unlocked below.</div>
              <button className="ml-auto btn btn-xs btn-ghost gap-1"><Ic name="file-text" size={11}/> Transcript</button>
            </div>
          )}
        </CalmCard>
      </div>
    </div>
  );
}

// =====================================================================
// SPEAKING
// =====================================================================
function SpeakingExercise() {
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
      <ExerciseHeader skill="speaking" type="monologue" title="Dich selbst vorstellen"
        subtitle="30‑second self‑introduction"
        level={e.level} onBack={()=>go({ name:'exercises' })}/>

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

          <CalmCard className="p-6">
            <div className="flex items-center gap-2 text-base-content/70">
              <Ic name="lightbulb" size={14}/>
              <div className="text-sm font-semibold">Useful phrases</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm font-mono">
              {['Ich heiße…','Ich bin … Jahre alt','Ich wohne in…','Ich arbeite als…','In meiner Freizeit…','Ich lerne Deutsch, weil…'].map(p=>(
                <div key={p} className="px-3 py-2 rounded-box bg-base-200/60 border border-base-300/70">{p}</div>
              ))}
            </div>
          </CalmCard>
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
            <button disabled={phase!=='done'}
              className="btn btn-sm rounded-full bg-base-200 border-base-300 hover:bg-base-300 gap-1.5 flex-1">
              <Ic name="play" size={12}/> Play back
            </button>
            <button disabled={phase!=='done'}
              className="btn btn-primary btn-sm rounded-full gap-1.5 flex-1">
              Submit for Feedback <Ic name="arrow-right" size={12}/>
            </button>
          </div>

          {phase==='done' && (
            <div className="mt-5 p-4 rounded-box bg-base-200/60 border border-base-300/70">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-base-content/60">Auto transcript (preview)</div>
              <p className="text-sm mt-2 leading-relaxed">
                „Hallo, ich heiße Lena. Ich bin 27 Jahre alt und wohne in Berlin. Ich <mark className="bg-warning/20 rounded px-0.5">arbeiten</mark> als Designerin und in meiner Freizeit <mark className="bg-success/20 rounded px-0.5">lese ich gern</mark>."
              </p>
            </div>
          )}
        </CalmCard>
      </div>
    </div>
  );
}

// =====================================================================
// EXAMS + PROGRESS  (kept calm, rebuilt in new vocabulary)
// =====================================================================
function Exams() {
  const { go } = useApp(); useIcons([]);
  return (
    <div className="max-w-[1180px] mx-auto px-8 py-8 space-y-6">
      <CalmCard className="p-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-primary">
          <Ic name="file-badge" size={11}/> Full mock exam
        </div>
        <h2 className="font-display text-2xl font-bold mt-2">Goethe Zertifikat C1 · Set 2</h2>
        <p className="text-sm text-base-content/70 mt-1">Timed 3h 20m · all four skills in exam order · exam‑authentic conditions.</p>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[['Reading','book-open','70 min'],['Listening','headphones','40 min'],['Writing','pen-line','80 min'],['Speaking','mic','15 min']].map(([l,i,t])=>(
            <div key={l} className="p-4 rounded-box bg-base-200/60 border border-base-300/70">
              <Ic name={i} size={14} cls="text-base-content/60"/>
              <div className="text-sm font-semibold mt-2">{l}</div>
              <div className="text-xs text-base-content/60 font-mono">{t}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <button className="btn btn-primary rounded-full gap-2"><Ic name="play" size={14}/> Start full exam</button>
          <button className="btn btn-ghost rounded-full gap-2"><Ic name="clock" size={14}/> Schedule for later</button>
        </div>
      </CalmCard>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { t:'C1 · Set 1', s:72, when:'18 Mar', done:true },
          { t:'C1 · Set 2', s:null, when:'Next up', done:false },
          { t:'C1 · Set 3', s:null, when:'Locked', done:false, locked:true },
        ].map((x,i)=>(
          <CalmCard key={i} className="p-5">
            <div className="text-[11px] uppercase font-semibold tracking-wider text-base-content/50">{x.when}</div>
            <div className="font-display font-bold text-lg mt-1">{x.t}</div>
            {x.done && <div className="text-success font-mono text-xs mt-1">Passed · {x.s}%</div>}
            {x.locked && <div className="text-base-content/50 text-xs mt-1 flex items-center gap-1"><Ic name="lock" size={11}/> Unlock at 40% across all skills</div>}
            <button className={`btn btn-sm mt-4 w-full rounded-full ${x.done?'btn-ghost bg-base-200 border-base-300':x.locked?'btn-disabled':'btn-primary'}`}>
              {x.done?'Review':x.locked?'Locked':'Start'}
            </button>
          </CalmCard>
        ))}
      </div>
    </div>
  );
}

function Progress() {
  useIcons([]);
  return (
    <div className="max-w-[1180px] mx-auto px-8 py-8 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SKILLS.map((s,i) => (
          <CalmCard key={s.id} className="p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-base-content/60">
              <Ic name={s.icon} size={12}/> {s.label}
            </div>
            <div className="font-display text-3xl font-bold mt-2 tabular-nums">{[68,42,30,35][i]}%</div>
            <div className="text-xs text-success mt-1 flex items-center gap-1"><Ic name="trending-up" size={11}/> +8 this week</div>
          </CalmCard>
        ))}
      </div>
      <CalmCard className="p-7">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold">Readiness over time</h3>
          <div className="join"><button className="join-item btn btn-xs btn-primary">Week</button><button className="join-item btn btn-xs btn-ghost">Month</button><button className="join-item btn btn-xs btn-ghost">All</button></div>
        </div>
        <div className="h-60 mt-5 rounded-box bg-base-200/60 flex items-end gap-2 p-4">
          {[30,34,40,38,45,52,48,55,60,58,62,64].map((v,i)=>(
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${v}%` }}/>
              <div className="text-[10px] text-base-content/50 font-mono">W{i+1}</div>
            </div>
          ))}
        </div>
      </CalmCard>
    </div>
  );
}

Object.assign(window, { ReadingExercise, WritingExercise, ListeningExercise, SpeakingExercise, Exams, Progress });
