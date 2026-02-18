import { useState, useEffect } from 'react'

const defaultSheet = () => ({
  playerName: '',
  riskPhrase: '',
  archetype: '',
  qualities: ['', '', '', '', '', ''],
  skills: ['', '', '', '', '', '', '', '', '', '', '', ''],
  misfortunes: [
    { text: '', complications: 0 },
    { text: '', complications: 0 },
    { text: '', complications: 0 },
    { text: '', complications: 0 },
  ],
  confusion: false,
  adrenaline: false,
})

const normalizeMisfortunes = (misfortunes) => {
  if (!Array.isArray(misfortunes)) return defaultSheet().misfortunes
  return misfortunes.map(m =>
    typeof m === 'string' ? { text: m, complications: 0 } : (m || { text: '', complications: 0 })
  )
}

export default function CharacterSheet({ sheet: initialSheet, onUpdate, readOnly = false, playerName = '', activeTest = null, onHexClick = null, onUpdateMisfortuneComplication = null, onMisfortuneClick = null }) {
  const [sheet, setSheet] = useState(() => ({
    ...defaultSheet(),
    ...initialSheet,
    playerName: initialSheet?.playerName || playerName,
    misfortunes: normalizeMisfortunes(initialSheet?.misfortunes),
  }))

  useEffect(() => {
    if (initialSheet) {
      setSheet(prev => ({
        ...prev,
        ...initialSheet,
        misfortunes: normalizeMisfortunes(initialSheet.misfortunes),
      }))
    }
  }, [initialSheet])

  const update = (field, value) => {
    if (readOnly) return
    const updated = { ...sheet, [field]: value }
    setSheet(updated)
    onUpdate?.(updated)
  }

  const updateArray = (field, index, value) => {
    if (readOnly) return
    const arr = [...sheet[field]]
    arr[index] = value
    const updated = { ...sheet, [field]: arr }
    setSheet(updated)
    onUpdate?.(updated)
  }

  const updateMisfortuneText = (index, text) => {
    if (readOnly) return
    const arr = sheet.misfortunes.map((m, i) => i === index ? { ...m, text } : m)
    const updated = { ...sheet, misfortunes: arr }
    setSheet(updated)
    onUpdate?.(updated)
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6">
      {/* Top section: Name + Logo + Risk */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-6">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            Meu nome é
          </label>
          <input
            type="text"
            value={sheet.playerName}
            onChange={(e) => update('playerName', e.target.value)}
            readOnly={readOnly}
            className="w-full px-0 py-1 text-base font-bold bg-transparent border-b-2 border-dotted border-border-purple text-text-primary focus:outline-none focus:border-neon"
            placeholder="..."
          />
        </div>
        <div className="hidden sm:flex items-center justify-center px-6">
          <span className="text-3xl font-black text-neon-bright tracking-tighter neon-text">NTE</span>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            Eu arriscaria tudo por
          </label>
          <input
            type="text"
            value={sheet.riskPhrase}
            onChange={(e) => update('riskPhrase', e.target.value)}
            readOnly={readOnly}
            className="w-full px-0 py-1 text-base bg-transparent border-b-2 border-dotted border-border-purple text-text-primary focus:outline-none focus:border-neon"
            placeholder="..."
          />
        </div>
      </div>

      {/* Hexagon Grid */}
      <div className="flex justify-center mb-8">
        <HexGrid
          archetype={sheet.archetype}
          qualities={sheet.qualities}
          skills={sheet.skills}
          onArchetypeChange={(v) => update('archetype', v)}
          onQualityChange={(i, v) => updateArray('qualities', i, v)}
          onSkillChange={(i, v) => updateArray('skills', i, v)}
          readOnly={readOnly}
          activeTest={activeTest}
          onHexClick={onHexClick}
        />
      </div>

      {/* Bottom section */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Misfortunes */}
        <div className="flex-1">
          <div className="mb-3">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Qual <span className="text-danger">infortúnio</span> que me aflige?
            </h3>
          </div>
          <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2">
            {sheet.misfortunes.map((m, i) => {
              const misfortune = typeof m === 'string' ? { text: m, complications: 0 } : (m || { text: '', complications: 0 })
              const isClickable = !!onMisfortuneClick && misfortune.complications > 0
              return (
                <div key={`misfortune-wrapper-${i}`} className="flex flex-col items-center gap-1.5 shrink-0">
                  <FlatHex
                    title="Infortúnio"
                    value={misfortune.text}
                    onChange={(v) => updateMisfortuneText(i, v)}
                    readOnly={readOnly}
                    dashed
                    w={150}
                    h={130}
                    clickable={isClickable}
                    onClick={isClickable ? () => onMisfortuneClick(misfortune) : null}
                  />
                  {/* Per-misfortune complications counter */}
                  <div className="flex items-center gap-1">
                    {onUpdateMisfortuneComplication && (
                      <button
                        onClick={() => onUpdateMisfortuneComplication(i, Math.max(0, misfortune.complications - 1))}
                        className="w-5 h-5 rounded btn-ghost text-text-secondary hover:text-danger flex items-center justify-center text-sm font-bold leading-none"
                      >
                        −
                      </button>
                    )}
                    <div
                      className="px-2 py-0.5 rounded text-xs font-bold min-w-[1.5rem] text-center"
                      style={{
                        background: misfortune.complications > 0
                          ? 'linear-gradient(135deg, rgba(220,38,38,0.2), rgba(239,68,68,0.1))'
                          : 'rgba(30,20,60,0.6)',
                        border: `1px solid ${misfortune.complications > 0 ? 'rgba(239,68,68,0.5)' : 'rgba(124,58,237,0.3)'}`,
                        color: misfortune.complications > 0 ? '#EF4444' : 'var(--color-text-muted)',
                        boxShadow: misfortune.complications > 0 ? '0 0 8px rgba(239,68,68,0.2)' : 'none'
                      }}
                    >
                      {misfortune.complications}
                    </div>
                    {onUpdateMisfortuneComplication && (
                      <button
                        onClick={() => onUpdateMisfortuneComplication(i, misfortune.complications + 1)}
                        className="w-5 h-5 rounded btn-ghost text-text-secondary hover:text-neon-bright flex items-center justify-center text-sm font-bold leading-none"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mental state */}
        <div className="flex-1">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 text-right lg:text-left">
            O que se passa na minha cabeça?
          </h3>
          <div className="flex flex-nowrap gap-2">
            <FlatHex
              title="Confusão"
              displayText="No próximo teste adicione um ☺ ao invés de ○ à sacola"
              checkable
              checked={sheet.confusion}
              onCheck={() => !readOnly && update('confusion', !sheet.confusion)}
              dashed
              w={110}
              h={96}
            />
            <FlatHex
              title="Adrenalina"
              displayText="No próximo teste você deve sacar pelo menos 4 ☺"
              checkable
              checked={sheet.adrenaline}
              onCheck={() => !readOnly && update('adrenaline', !sheet.adrenaline)}
              dashed
              w={110}
              h={96}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ====== Flat-top Hexagon Component (standalone, for bottom sections) ====== */
const HEX_POINTS = '25,1 75,1 99,44 75,86 25,86 1,44'

function FlatHex({ title, value, onChange, readOnly, checkable, checked, onCheck, displayText, dashed, w = 100, h = 87, clickable = false, onClick = null }) {
  const fillClass = checkable && checked
    ? 'fill-neon-dim/30'
    : clickable
      ? 'fill-[rgba(220,38,38,0.15)]'
      : 'fill-panel'
  const strokeClass = checkable && checked
    ? 'stroke-neon-bright'
    : clickable
      ? 'stroke-danger'
      : 'stroke-border-glow'

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${clickable ? 'cursor-pointer' : ''}`}
      style={{ width: w, height: h }}
      onClick={onClick}
    >
      <svg viewBox="0 0 100 87" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <polygon
          points={HEX_POINTS}
          className={`${fillClass} ${strokeClass} transition-opacity ${clickable ? 'hover:opacity-75' : ''}`}
          strokeWidth="2"
          strokeDasharray={dashed ? '6,3' : 'none'}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center text-center px-3 max-w-[85%]">
        {title && (
          <span className="text-[9px] sm:text-[11px] font-bold text-text-muted uppercase tracking-wider leading-tight mb-0.5">
            {title}
          </span>
        )}
        {checkable ? (
          <button
            onClick={onCheck}
            className={`text-[8px] sm:text-[9px] leading-tight cursor-pointer transition-colors px-1 ${
              checked
                ? 'text-neon-bright font-semibold'
                : 'text-text-muted'
            }`}
          >
            {displayText}
          </button>
        ) : readOnly ? (
          <span className="text-[11px] sm:text-[13px] text-text-primary leading-tight">
            {value || '—'}
          </span>
        ) : (
          <textarea
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-10 sm:h-14 text-[10px] sm:text-[12px] text-center bg-transparent text-text-primary resize-none border-none focus:outline-none leading-tight"
            placeholder="..."
          />
        )}
      </div>
    </div>
  )
}

/* ====== Hex Grid: Flat-top honeycomb with gaps and colored layers ====== */

function HexGrid({ archetype, qualities, skills, onArchetypeChange, onQualityChange, onSkillChange, readOnly, activeTest, onHexClick }) {
  const S = 70
  const W = 2 * S
  const H = Math.round(Math.sqrt(3) * S)
  const W34 = W * 3 / 4
  const H2 = H / 2

  const GAP = 1.18

  const CX = 280
  const CY = 290

  const qPos = [
    { x: CX,            y: CY - H * GAP },
    { x: CX + W34 * GAP, y: CY - H2 * GAP },
    { x: CX + W34 * GAP, y: CY + H2 * GAP },
    { x: CX,            y: CY + H * GAP },
    { x: CX - W34 * GAP, y: CY + H2 * GAP },
    { x: CX - W34 * GAP, y: CY - H2 * GAP },
  ]

  const aPos = [
    { x: CX,                y: CY - 2 * H * GAP },
    { x: CX + W34 * GAP,    y: CY - (H + H2) * GAP },
    { x: CX + 2 * W34 * GAP, y: CY - H * GAP },
    { x: CX + 2 * W34 * GAP, y: CY },
    { x: CX + 2 * W34 * GAP, y: CY + H * GAP },
    { x: CX + W34 * GAP,    y: CY + (H + H2) * GAP },
    { x: CX,                y: CY + 2 * H * GAP },
    { x: CX - W34 * GAP,    y: CY + (H + H2) * GAP },
    { x: CX - 2 * W34 * GAP, y: CY + H * GAP },
    { x: CX - 2 * W34 * GAP, y: CY },
    { x: CX - 2 * W34 * GAP, y: CY - H * GAP },
    { x: CX - W34 * GAP,    y: CY - (H + H2) * GAP },
  ]

  const abilityLinks = [
    [0],    [0, 1], [1],    [1, 2],
    [2],    [2, 3], [3],    [3, 4],
    [4],    [4, 5], [5],    [5, 0],
  ]

  const padding = 20
  const minX = CX - 2 * W34 * GAP - S - padding
  const maxX = CX + 2 * W34 * GAP + S + padding
  const minY = CY - 2 * H * GAP - H2 - padding
  const maxY = CY + 2 * H * GAP + H2 + padding
  const vw = maxX - minX
  const vh = maxY - minY

  const sx = -minX
  const sy = -minY
  const shift = (pos) => ({ x: pos.x + sx, y: pos.y + sy })
  const center = shift({ x: CX, y: CY })
  const qS = qPos.map(shift)
  const aS = aPos.map(shift)

  const dotR = 3

  // Dark purple neon layer colors
  const archFill = 'fill-[rgba(251,191,36,0.12)]'
  const archStroke = 'stroke-gold'
  const qualFill = 'fill-[rgba(56,189,248,0.10)]'
  const qualStroke = 'stroke-sky-neon'
  const abilFill = 'fill-[rgba(52,211,153,0.08)]'
  const abilStroke = 'stroke-emerald-neon'

  const canClickHex = activeTest && !activeTest.shuffled && onHexClick

  return (
    <div className="relative w-full overflow-x-auto">
      <div className="relative mx-auto" style={{ width: '100%', maxWidth: 900, aspectRatio: `${vw}/${vh}` }}>
        <svg
          viewBox={`0 0 ${vw} ${vh}`}
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Glow filter definitions */}
          <defs>
            <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor="#FBBF24" floodOpacity="0.3" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-sky" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feFlood floodColor="#38BDF8" floodOpacity="0.25" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feFlood floodColor="#34D399" floodOpacity="0.2" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection lines */}
          {qS.map((q, i) => (
            <line key={`qa-${i}`}
              x1={center.x} y1={center.y} x2={q.x} y2={q.y}
              stroke="rgba(124,58,237,0.25)" strokeWidth="1.5"
            />
          ))}

          {aS.map((a, ai) =>
            abilityLinks[ai].map(qi => (
              <line key={`aq-${ai}-${qi}`}
                x1={a.x} y1={a.y} x2={qS[qi].x} y2={qS[qi].y}
                stroke="rgba(124,58,237,0.25)" strokeWidth="1.5"
              />
            ))
          )}

          {/* Connection dots */}
          {qS.map((q, i) => (
            <circle key={`d-qa-${i}`}
              cx={(center.x + q.x) / 2} cy={(center.y + q.y) / 2} r={dotR}
              fill="var(--color-panel)" stroke="var(--color-neon-dim)" strokeWidth="1" />
          ))}
          {aS.map((a, ai) =>
            abilityLinks[ai].map(qi => (
              <circle key={`d-aq-${ai}-${qi}`}
                cx={(a.x + qS[qi].x) / 2} cy={(a.y + qS[qi].y) / 2} r={dotR}
                fill="var(--color-panel)" stroke="var(--color-neon-dim)" strokeWidth="1" />
            ))
          )}

          {/* Archetype hex */}
          <HexSVG cx={center.x} cy={center.y} s={S}
            className={`${archFill} ${archStroke} ${canClickHex ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            strokeW={2.5}
            filter="url(#glow-gold)"
            onClick={canClickHex ? onHexClick : null} />

          {/* Quality hexes */}
          {qS.map((q, i) => (
            <HexSVG key={`qh-${i}`} cx={q.x} cy={q.y} s={S}
              className={`${qualFill} ${qualStroke} ${canClickHex ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
              strokeW={2}
              filter="url(#glow-sky)"
              onClick={canClickHex ? onHexClick : null} />
          ))}

          {/* Ability hexes (dashed) */}
          {aS.map((a, i) => (
            <HexSVG key={`ah-${i}`} cx={a.x} cy={a.y} s={S}
              className={`${abilFill} ${abilStroke} ${canClickHex ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
              strokeW={1.5} dashed
              filter="url(#glow-emerald)"
              onClick={canClickHex ? onHexClick : null} />
          ))}
        </svg>

        {/* Text input overlays */}
        <HexInput x={center.x} y={center.y} s={S} vw={vw} vh={vh}
          title="Arquétipo" value={archetype} onChange={onArchetypeChange} readOnly={readOnly} />

        {qS.map((q, i) => (
          <HexInput key={`qi-${i}`} x={q.x} y={q.y} s={S} vw={vw} vh={vh}
            title="Qualidade" value={qualities[i]} onChange={(v) => onQualityChange(i, v)} readOnly={readOnly} />
        ))}

        {aS.map((a, i) => (
          <HexInput key={`ai-${i}`} x={a.x} y={a.y} s={S} vw={vw} vh={vh}
            title="Habilidade" value={skills[i]} onChange={(v) => onSkillChange(i, v)} readOnly={readOnly} />
        ))}
      </div>
    </div>
  )
}

/* SVG flat-top hexagon shape */
function HexSVG({ cx, cy, s, className, strokeW = 2, dashed = false, onClick = null, filter = null }) {
  const h = Math.sqrt(3) * s / 2
  const points = [
    [cx - s / 2, cy - h],
    [cx + s / 2, cy - h],
    [cx + s,     cy],
    [cx + s / 2, cy + h],
    [cx - s / 2, cy + h],
    [cx - s,     cy],
  ].map(p => p.join(',')).join(' ')

  return (
    <polygon
      points={points}
      className={className}
      strokeWidth={strokeW}
      strokeDasharray={dashed ? '8,4' : 'none'}
      onClick={onClick}
      filter={filter}
      style={onClick ? { pointerEvents: 'auto' } : {}}
    />
  )
}

/* HTML input overlay positioned over a hex */
function HexInput({ x, y, s, vw, vh, title, value, onChange, readOnly }) {
  const hexW = 2 * s
  const hexH = Math.sqrt(3) * s
  const wPct = (hexW * 0.75 / vw) * 100
  const hPct = (hexH * 0.7 / vh) * 100
  const leftPct = ((x / vw) * 100) - wPct / 2
  const topPct = ((y / vh) * 100) - hPct / 2

  return (
    <div
      className="absolute flex flex-col items-center justify-center text-center pointer-events-none"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: `${wPct}%`,
        height: `${hPct}%`,
      }}
    >
      <span className="text-[8px] sm:text-[10px] md:text-[12px] font-bold text-text-muted uppercase tracking-wider leading-none select-none">
        {title}
      </span>
      {readOnly ? (
        <span className="text-[9px] sm:text-[11px] md:text-[13px] text-text-primary leading-tight mt-0.5">
          {value || '—'}
        </span>
      ) : (
        <textarea
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          className="pointer-events-auto w-full h-7 sm:h-9 md:h-12 text-[9px] sm:text-[11px] md:text-[13px] text-center bg-transparent text-text-primary resize-none border-none focus:outline-none leading-tight mt-0.5"
          placeholder="..."
        />
      )}
    </div>
  )
}
