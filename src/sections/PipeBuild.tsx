import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Layers } from "lucide-react";
import { BUILD_STAGES, PipeBuildTimeline } from "../animation/PipeBuildTimeline";

export function PipeBuild() {
  const pinHostRef = useRef<HTMLDivElement>(null);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    const host = pinHostRef.current;
    if (!host) return;

    const controller = new PipeBuildTimeline({
      host,
      onStageChange: (stageIdx, prog) => {
        setActiveStageIdx(stageIdx);
        setProgressPct(Math.round(prog * 100));
      },
    });

    controller.mount();
    return () => controller.unmount();
  }, []);

  const currentStage = BUILD_STAGES[activeStageIdx] ?? BUILD_STAGES[0];

  return (
    <section
      id="process"
      aria-labelledby="pipebuild-heading"
      className="relative w-full overflow-x-clip border-b border-line bg-bg"
    >
      <div
        ref={pinHostRef}
        className="mx-auto flex h-svh max-h-svh w-full max-w-7xl flex-col justify-center px-3 pt-[72px] pb-3 sm:px-6 lg:px-8 lg:pb-6"
      >
        <div className="flex h-full max-h-full flex-col justify-between border border-line bg-surface p-3 sm:p-5 lg:p-6">
          {/* Compact Header Row: Eyebrow + Title on one line on desktop */}
          <div className="flex flex-col gap-1 border-b border-line pb-2.5 lg:flex-row lg:items-baseline lg:justify-between">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent sm:text-xs">
                FROM SPOOL TO HANDOVER
              </span>
              <h2
                id="pipebuild-heading"
                className="font-display text-xl font-bold uppercase tracking-tight text-fg sm:text-2xl lg:text-3xl"
              >
                How a Line Gets Built
              </h2>
            </div>

            <div className="flex items-center justify-between gap-3 font-mono text-[11px] text-muted sm:text-xs">
              <span className="inline-flex items-center gap-1.5 text-accent">
                <Layers className="h-3.5 w-3.5 shrink-0" />
                <span>6&quot;-P-1001-A1A</span>
              </span>
              <span>
                STAGE {currentStage.code}/06 · <strong className="text-fg">{progressPct}%</strong>
              </span>
            </div>
          </div>

          {/* P&ID Progress Bar */}
          <div className="my-2 h-1.5 w-full shrink-0 overflow-hidden bg-bg">
            <div
              className="h-full bg-accent transition-[width] duration-75"
              style={{ width: `${Math.max(4, progressPct)}%` }}
            />
          </div>

          {/* Main Grid: Drawing + Step Panel */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-12 md:items-stretch md:gap-6">
            {/* Isometric Piping Assembly SVG (capped at 42svh on mobile, fills column height on desktop) */}
            <div className="flex h-[42svh] max-h-[42svh] w-full items-center justify-center overflow-hidden border border-line bg-bg p-1.5 sm:p-2 md:col-span-8 md:h-full md:max-h-full">
              <svg
                viewBox="65 8 715 292"
                preserveAspectRatio="xMidYMid meet"
                className="h-full w-full select-none"
                role="img"
                aria-label="Isometric oil and gas piping assembly sequence"
              >
                {/* Steel Pipe Rack & Ground */}
                <g className="will-change-transform">
                  <line x1="75" y1="292" x2="770" y2="292" stroke="var(--line)" strokeWidth="2" />
                  <line x1="160" y1="226" x2="160" y2="292" stroke="var(--line)" strokeWidth="3.5" />
                  <line x1="420" y1="226" x2="420" y2="292" stroke="var(--line)" strokeWidth="3.5" />
                  <line x1="660" y1="226" x2="660" y2="292" stroke="var(--line)" strokeWidth="3.5" />
                  <line x1="105" y1="226" x2="735" y2="226" stroke="var(--line)" strokeWidth="4" />
                </g>

                {/* Support Shoe 1 */}
                <g className="part-shoe-left will-change-transform">
                  <rect x="180" y="205" width="46" height="21" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
                  <line x1="192" y1="205" x2="192" y2="226" stroke="var(--accent)" strokeWidth="1.5" />
                  <line x1="214" y1="205" x2="214" y2="226" stroke="var(--accent)" strokeWidth="1.5" />
                </g>

                {/* Support Shoe 2 */}
                <g className="part-shoe-right will-change-transform">
                  <rect x="397" y="205" width="46" height="21" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
                  <line x1="409" y1="205" x2="409" y2="226" stroke="var(--accent)" strokeWidth="1.5" />
                  <line x1="431" y1="205" x2="431" y2="226" stroke="var(--accent)" strokeWidth="1.5" />
                </g>

                {/* Spool A (bottom at y=205 rests on shoes; centerline y=187) */}
                <g className="part-spool-a will-change-transform">
                  <line x1="115" y1="187" x2="265" y2="187" stroke="var(--line)" strokeWidth="36" strokeLinecap="butt" />
                  <line x1="115" y1="171" x2="265" y2="171" stroke="var(--primary2)" strokeWidth="2.4" opacity="0.65" />
                  <line x1="115" y1="203" x2="265" y2="203" stroke="var(--bg)" strokeWidth="2.4" opacity="0.55" />
                </g>

                {/* Flange Pair 1 */}
                <g className="part-flange-left will-change-transform">
                  <rect x="262" y="165" width="7" height="44" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2.2" />
                </g>
                <g className="part-flange-right will-change-transform">
                  <rect x="273" y="165" width="7" height="44" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2.2" />
                </g>

                {/* 90° Elbow */}
                <g className="part-elbow will-change-transform">
                  <path
                    d="M 282 187 L 332 187 Q 366 187 366 153 L 366 112"
                    fill="none"
                    stroke="var(--line)"
                    strokeWidth="36"
                    strokeLinecap="butt"
                  />
                  <path
                    d="M 282 171 L 332 171 Q 349 171 349 153 L 349 112"
                    fill="none"
                    stroke="var(--primary2)"
                    strokeWidth="2.2"
                    opacity="0.6"
                  />
                  <path
                    d="M 282 203 L 332 203 Q 383 203 383 153 L 383 112"
                    fill="none"
                    stroke="var(--bg)"
                    strokeWidth="2.2"
                    opacity="0.5"
                  />
                </g>

                {/* Flange Pair 2 */}
                <g className="part-flange-left will-change-transform">
                  <rect x="342" y="103" width="48" height="7" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2.2" />
                </g>
                <g className="part-flange-right will-change-transform">
                  <rect x="342" y="92" width="48" height="7" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2.2" />
                </g>

                {/* Tee Fitting + Gate Valve */}
                <g className="part-tee will-change-transform">
                  <line x1="366" y1="90" x2="366" y2="66" stroke="var(--line)" strokeWidth="32" />
                  <line x1="366" y1="78" x2="490" y2="78" stroke="var(--line)" strokeWidth="32" />
                  <line x1="366" y1="64" x2="490" y2="64" stroke="var(--primary2)" strokeWidth="2" opacity="0.6" />
                  <line x1="366" y1="92" x2="490" y2="92" stroke="var(--bg)" strokeWidth="2" opacity="0.5" />

                  <polygon points="490,60 522,78 490,96" fill="var(--surface)" stroke="var(--line)" strokeWidth="2.2" />
                  <polygon points="554,60 522,78 554,96" fill="var(--surface)" stroke="var(--line)" strokeWidth="2.2" />
                  <line x1="522" y1="78" x2="522" y2="44" stroke="var(--line)" strokeWidth="3.5" />
                </g>

                {/* Rotating Gate Valve Handwheel */}
                <g className="valve-wheel will-change-transform" style={{ transformOrigin: "522px 40px" }}>
                  <ellipse cx="522" cy="40" rx="26" ry="8" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
                  <line x1="496" y1="40" x2="548" y2="40" stroke="var(--accent)" strokeWidth="2" />
                  <line x1="522" y1="32" x2="522" y2="48" stroke="var(--accent)" strokeWidth="2" />
                  <circle cx="522" cy="40" r="3.8" fill="var(--accent)" />
                </g>

                {/* Spool B (Right header run) */}
                <g className="part-spool-b will-change-transform">
                  <line x1="554" y1="78" x2="745" y2="78" stroke="var(--line)" strokeWidth="32" />
                  <line x1="554" y1="64" x2="745" y2="64" stroke="var(--primary2)" strokeWidth="2.2" opacity="0.65" />
                  <line x1="554" y1="92" x2="745" y2="92" stroke="var(--bg)" strokeWidth="2.2" opacity="0.55" />
                </g>

                {/* Bolts on Flange Pairs */}
                <g className="will-change-transform">
                  <rect className="part-bolt" x="267" y="169" width="8" height="5" fill="var(--accent)" />
                  <rect className="part-bolt" x="267" y="200" width="8" height="5" fill="var(--accent)" />
                  <rect className="part-bolt" x="347" y="96" width="5" height="7" fill="var(--accent)" />
                  <rect className="part-bolt" x="380" y="96" width="5" height="7" fill="var(--accent)" />
                </g>

                {/* Pressure Gauge Dial */}
                <g className="will-change-transform">
                  <line x1="366" y1="64" x2="366" y2="54" stroke="var(--line)" strokeWidth="2.8" />
                  <circle cx="366" cy="34" r="24" fill="var(--surface)" stroke="var(--line)" strokeWidth="2.2" />
                  <circle cx="366" cy="34" r="20" fill="var(--bg)" stroke="var(--line)" strokeWidth="1" />

                  <line x1="349" y1="46" x2="353" y2="43" stroke="var(--muted)" strokeWidth="1.6" />
                  <line x1="346" y1="34" x2="350" y2="34" stroke="var(--muted)" strokeWidth="1.6" />
                  <line x1="352" y1="20" x2="355" y2="23" stroke="var(--muted)" strokeWidth="1.6" />
                  <line x1="366" y1="15" x2="366" y2="19" stroke="var(--muted)" strokeWidth="1.6" />
                  <line x1="380" y1="20" x2="377" y2="23" stroke="var(--accent)" strokeWidth="1.8" />
                  <line x1="386" y1="34" x2="382" y2="34" stroke="var(--accent)" strokeWidth="1.8" />

                  <path
                    d="M 349 46 A 20 20 0 1 1 383 46"
                    fill="none"
                    stroke="var(--line)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    className="gauge-arc-fill"
                    d="M 349 46 A 20 20 0 1 1 383 46"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <g className="gauge-needle-arm will-change-transform" style={{ transformOrigin: "366px 34px" }}>
                    <line x1="366" y1="38" x2="366" y2="17" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
                  </g>
                  <circle cx="366" cy="34" r="3.5" fill="var(--fg)" stroke="var(--accent)" strokeWidth="1.4" />
                </g>

                {/* Weld Beads & Sparks at 3 Joints */}
                <g className="will-change-transform">
                  <line className="weld-bead" x1="271" y1="164" x2="271" y2="210" stroke="var(--accent)" strokeWidth="3.8" />
                  <line className="weld-bead" x1="340" y1="101" x2="392" y2="101" stroke="var(--accent)" strokeWidth="3.8" />
                  <line className="weld-bead" x1="554" y1="59" x2="554" y2="97" stroke="var(--accent)" strokeWidth="3.8" />

                  <circle className="weld-spark" cx="271" cy="172" r="3.5" fill="var(--accent)" />
                  <circle className="weld-spark" cx="280" cy="160" r="2.5" fill="var(--fg)" />
                  <circle className="weld-spark" cx="366" cy="92" r="3.5" fill="var(--accent)" />
                  <circle className="weld-spark" cx="378" cy="86" r="2.5" fill="var(--fg)" />
                  <circle className="weld-spark" cx="554" cy="66" r="3.5" fill="var(--accent)" />
                  <circle className="weld-spark" cx="565" cy="56" r="2.5" fill="var(--fg)" />
                </g>

                {/* NDT Scan Beams & Accent Check Marks */}
                <g className="will-change-transform">
                  <line className="ndt-beam" x1="262" y1="187" x2="280" y2="187" stroke="var(--primary2)" strokeWidth="3" />
                  <line className="ndt-beam" x1="355" y1="92" x2="377" y2="92" stroke="var(--primary2)" strokeWidth="3" />
                  <line className="ndt-beam" x1="544" y1="78" x2="564" y2="78" stroke="var(--primary2)" strokeWidth="3" />

                  <path className="ndt-pass" d="M 264 155 L 270 161 L 281 149" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path className="ndt-pass" d="M 398 97 L 404 103 L 415 91" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path className="ndt-pass" d="M 548 48 L 554 54 L 565 42" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </g>

                {/* Hydrotest Flowing Water Path */}
                <g className="will-change-transform">
                  <path
                    className="hydro-flow"
                    d="M 118 187 L 332 187 Q 366 187 366 153 L 366 78 L 742 78"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                </g>

                {/* HYDROTEST PASSED Stamp */}
                <g className="hydro-stamp will-change-transform" transform="translate(570, 124)">
                  <rect x="0" y="0" width="196" height="30" fill="var(--bg)" stroke="var(--accent)" strokeWidth="2.2" />
                  <text
                    x="98"
                    y="20"
                    textAnchor="middle"
                    fill="var(--accent)"
                    className="font-mono text-[11px] font-bold tracking-widest"
                  >
                    HYDROTEST PASSED
                  </text>
                </g>

                {/* Line Tag 6"-P-1001-A1A */}
                <g className="handover-tag will-change-transform" transform="translate(570, 164)">
                  <rect x="0" y="0" width="196" height="28" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.6" />
                  <text
                    x="98"
                    y="18"
                    textAnchor="middle"
                    fill="var(--fg)"
                    className="font-mono text-[11px] font-semibold tracking-wider"
                  >
                    6&quot;-P-1001-A1A
                  </text>
                </g>
              </svg>
            </div>

            {/* Step Panel: Compact on <768px with 6 numbered dots; full list on md+ */}
            <div className="flex flex-col justify-between gap-2.5 md:col-span-4 md:gap-4">
              <div className="border border-line bg-bg p-3 sm:p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent sm:text-xs">
                  STEP {currentStage.code}
                </div>
                <h3 className="mt-0.5 font-display text-xl font-bold uppercase tracking-wide text-fg sm:text-2xl lg:text-3xl">
                  {currentStage.title}
                </h3>
                <p className="mt-1.5 font-sans text-xs leading-snug text-muted sm:text-sm sm:leading-relaxed">
                  {currentStage.summary}
                </p>
              </div>

              {/* Mobile (<768px): 6 numbered dots row */}
              <div className="flex items-center justify-between gap-1.5 border border-line bg-bg px-3 py-2 md:hidden">
                {BUILD_STAGES.map((stage, idx) => {
                  const isCurrent = idx === activeStageIdx;
                  const isDone = idx < activeStageIdx;
                  return (
                    <span
                      key={stage.code}
                      aria-label={`Step ${stage.code}: ${stage.title}`}
                      className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] font-semibold transition-colors ${
                        isCurrent
                          ? "bg-accent text-on-accent ring-2 ring-accent/40"
                          : isDone
                            ? "border border-accent/60 bg-accent/15 text-accent"
                            : "border border-line bg-surface text-muted"
                      }`}
                    >
                      {Number(stage.code)}
                    </span>
                  );
                })}
              </div>

              {/* Desktop (md+): Full 6-Stage Index */}
              <ol className="hidden space-y-1.5 md:block">
                {BUILD_STAGES.map((stage, idx) => {
                  const isCurrent = idx === activeStageIdx;
                  const isDone = idx < activeStageIdx;
                  return (
                    <li
                      key={stage.code}
                      className={`flex items-center justify-between border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                        isCurrent
                          ? "border-accent bg-accent/15 text-accent font-semibold"
                          : isDone
                            ? "border-line bg-bg text-fg"
                            : "border-line/60 bg-bg/60 text-muted"
                      }`}
                    >
                      <span>
                        {stage.code} · {stage.title}
                      </span>
                      {isDone && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />}
                    </li>
                  );
                })}
              </ol>

              {/* Handover Line */}
              <p className="handover-signoff border-t border-line pt-2 font-mono text-[11px] uppercase tracking-widest text-accent sm:text-xs">
                Delivered safely, on schedule
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
