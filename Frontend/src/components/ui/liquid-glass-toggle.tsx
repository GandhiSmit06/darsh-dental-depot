"use client"

/**
 * Nimbus UI · Liquid Toggle — "Surface Tension"
 * Customized for Darsh Dental Depot color style:
 * - Light Mode: Sky / Marine Blue (#0284c7 / #38bdf8) & Warm Amber Sun (#F59E0B)
 * - Dark Mode: Clinical Teal (#12A488) & Bright Mint (#3FD1B3) on Clinical Dark (#070B0A)
 *
 * The knob is a drop of water. Drag it and it stretches, grows a neck, and past
 * the middle it snaps to the other side, shedding droplets that merge back with a ripple.
 * WebGL shader rendered with CSS drop fallback.
 * No dependencies besides React.
 */

import * as React from "react"

export type LiquidToggleProps = {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** "light" water for bright backgrounds, "dark" for dark ones */
  tone?: "light" | "dark"
  /** track height in px (width is 2.1×) */
  size?: number
  /** icons that ride inside the drop, e.g. NimbusToggleIcons.sun / .moon */
  icons?: { off?: React.ReactNode; on?: React.ReactNode }
  disabled?: boolean
  /** soft synthesized "plip" on snap (no audio files) */
  sound?: boolean
  /** accessible name */
  label?: string
  /** form support: submits `value` when checked */
  name?: string
  value?: string
  id?: string
  className?: string
  style?: React.CSSProperties
}

/* ---------- icons ---------- */
const I = (d: React.ReactNode) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
)
export const NimbusToggleIcons = {
  sun: I(<><circle cx="12" cy="12" r="4.2" /><path d="M12 2.8v2.1M12 19.1v2.1M2.8 12h2.1M19.1 12h2.1M5.5 5.5 7 7M17 17l1.5 1.5M5.5 18.5 7 17M17 7l1.5-1.5" /></>),
  moon: I(<path d="M20 14.6A8.3 8.3 0 1 1 9.4 4a6.6 6.6 0 0 0 10.6 10.6Z" />),
  check: I(<path d="m5 12.5 4.5 4.5L19 7.5" />),
  close: I(<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />),
}

/* ---------- styles with Darsh Dental Depot clinical branding ---------- */
const NT_CSS = `
.nimbus-toggle{--t-tint:rgba(255,255,255,.22);--t-rim:rgba(255,255,255,.85);--t-ico-off:#F59E0B;--t-ico-on:#0284c7;
  position:relative;display:inline-block;flex:none;padding:0;margin:0;border:0;background:none;border-radius:999px;cursor:pointer;isolation:isolate;
  vertical-align:middle;touch-action:pan-y;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;outline:none;transition:box-shadow .2s ease}
.nimbus-toggle[data-tone="dark"]{--t-tint:rgba(7,11,10,.48);--t-rim:rgba(63,209,179,.35);--t-ico-off:#FBBF24;--t-ico-on:#3FD1B3}
.nimbus-toggle:focus-visible{outline:2px solid #12A488;outline-offset:3px}
.nimbus-toggle:disabled{opacity:.45;cursor:not-allowed}
.nt-glass{position:absolute;inset:0;border-radius:inherit;z-index:-2;overflow:hidden;background:var(--t-tint);
  -webkit-backdrop-filter:blur(10px) saturate(1.2) brightness(1.06);backdrop-filter:blur(10px) saturate(1.2) brightness(1.06);
  box-shadow:inset 0 2px 5px rgba(2,132,199,.18),inset 0 -1px 1px var(--t-rim),inset 0 0 0 1px rgba(255,255,255,.28),0 1px 0 rgba(255,255,255,.45),0 10px 24px -14px rgba(2,132,199,.45)}
.nimbus-toggle[data-tone="dark"] .nt-glass{box-shadow:inset 0 2px 6px rgba(0,0,0,.55),inset 0 -1px 1px var(--t-rim),inset 0 0 0 1px rgba(63,209,179,.2),0 10px 24px -14px rgba(0,0,0,.8)}
.nt-water{position:absolute;z-index:-1;pointer-events:none}
.nimbus-toggle[data-gl="off"] .nt-water{display:none}
.nt-fill,.nt-knob{display:none;position:absolute;pointer-events:none;border-radius:999px;will-change:transform,width}
.nimbus-toggle[data-gl="off"] .nt-fill,.nimbus-toggle[data-gl="off"] .nt-knob{display:block}
.nt-fill{z-index:-1;left:2px;top:2px;bottom:2px;background:linear-gradient(180deg,#38bdf8,#0284c7);opacity:.88}
.nt-knob{z-index:0;left:0;background:radial-gradient(120% 140% at 30% 0%,rgba(255,255,255,.95),rgba(255,255,255,0) 60%),rgba(240,250,255,.82);
  box-shadow:inset 0 1px 1px #fff,inset 0 -2px 6px rgba(2,132,199,.25),inset 0 0 0 1px rgba(255,255,255,.6),0 4px 10px -3px rgba(2,132,199,.45)}
.nimbus-toggle[data-tone="dark"] .nt-knob{background:radial-gradient(120% 140% at 30% 0%,rgba(255,255,255,.65),rgba(255,255,255,0) 60%),rgba(18,164,136,.45);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.7),inset 0 0 0 1px rgba(63,209,179,.4),0 4px 10px -3px rgba(0,0,0,.7)}
.nimbus-toggle[data-tone="dark"] .nt-fill{background:linear-gradient(180deg,#3FD1B3,#12A488)}
.nt-icon{position:absolute;left:0;top:0;z-index:1;pointer-events:none;will-change:transform}
.nt-icon>span{position:absolute;inset:0;display:block}
.nt-icon>span:first-child{color:var(--t-ico-off)}
.nt-icon>span:last-child{color:var(--t-ico-on)}
`

/* ---------- the water shader (Waterline engine + track fill) ---------- */
const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uS;uniform float uTime;uniform vec4 uPill;uniform vec4 uFill;
uniform vec4 uBlob[6];uniform float uSy[6];uniform vec4 uRip[6];uniform vec3 uMouse;uniform float uDark;uniform float uAmb;uniform float uK;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float sdCap(vec2 p,vec4 B,float sy){p-=B.xy;p.y/=sy;p.x=max(abs(p.x)-B.z,0.);return(length(p)-B.w)*min(1.,sy);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float dropD(vec2 p){float d=1e4;for(int i=0;i<6;i++){if(uBlob[i].w>.5){d=smin(d,sdCap(p,uBlob[i],uSy[i]),uK);}}return d;}
float pillD(vec2 p){vec2 h=uPill.zw*.5;return sdRB(p-uPill.xy-h,h,h.y);}
float fillD(vec2 p){float w=(sin(p.y*.3+uTime*5.)+.6*sin(p.y*.17-uTime*3.3))*uFill.y;float f=smin(p.x-uFill.x-w,dropD(p)+3.+(1.-uFill.z)*60.,9.);return max(pillD(p)+2.,f);}
float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}
float waves(vec2 p){float w=0.;
 for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}
 vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1000.);
 w+=uAmb*(sin(p.x*.05+uTime*1.2)*.45+sin(p.x*.13-uTime*.85+p.y*.2)*.25);return w;}
float H(vec2 p){float dp=pillD(p);return lens(dp,uPill.w*.36)*2.4+lens(fillD(p),9.)*2.2+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,7.,-dp);}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr/uS;
 float dp=pillD(p);float dd=dropD(p);float fd=fillD(p);
 float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));
 vec3 V=vec3(0.,0.,1.);
 float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),V),0.),70.);
 float spec2=pow(max(dot(reflect(-normalize(vec3(.6,.75,.7)),n),V),0.),22.)*.3;
 float fres=clamp((1.-n.z)*4.,0.,1.);
 vec3 irid=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fres*.85+p.x*.0028+uTime*.035));
 float pm=smoothstep(1.,-1.,dp);float dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);
 /* water in the track: light mode sky blue / dark mode clinical teal-mint */
 float fm=smoothstep(1.,-1.,fd)*pm;
 float depth=clamp((p.y-uPill.y)/uPill.w,0.,1.);
 vec3 wc=mix(mix(vec3(.42,.85,1.),vec3(.01,.52,.78),depth),mix(vec3(.25,.82,.70),vec3(.07,.64,.53),depth),uDark);
 float cw=caus((p+n.xy*8.)*.09,uTime*.8);
 wc+=vec3(.75,.95,1.)*smoothstep(.55,1.,cw)*.32;
 wc=mix(wc,vec3(1.),fm*(1.-smoothstep(0.,2.5,-fd))*.7);
 float wa=fm*(.78+.1*uDark);
 vec3 c=wc*wa;float a=wa;
 /* drop shadow */
 float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*(.2+.1*uDark);
 c=vec3(0.,.14,.36)*sh+c*(1.-sh);a=sh+a*(1.-sh);
 /* glass rim */
 float pa=clamp(pm*(fres*.5+spec*.9+spec2),0.,1.);
 c=mix(vec3(1.),irid,.5*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);
 /* the drop */
 float th=lens(dd,11.);
 float cs=caus((p+n.xy*th*18.)*.085,uTime*.9);
 vec3 tint=mix(vec3(.86,.96,1.),vec3(.75,.95,.90),uDark);
 float rim=dm*(1.-smoothstep(0.,8.,-dd));
 float cres=dm*smoothstep(.12,.55,dot(n.xy,normalize(vec2(.55,.85))))*smoothstep(0.,3.,-dd);
 float body=.5+.5*clamp(-n.y*3.,-1.,1.);
 float da=dm*(mix(.62,.76,uDark)+.18*body);vec3 dc=mix(tint,vec3(1.),body*.6);
 float la=rim*.3;vec3 lc=mix(vec3(0.,.42,.78),vec3(.07,.64,.53),uDark);dc=lc*la+dc*da*(1.-la);da=la+da*(1.-la);
 la=clamp(cres*.7+smoothstep(.6,1.,cs)*.28*th*dm,0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=clamp(dm*(spec*1.2+spec2*.5),0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=dm*smoothstep(-2.,0.,dd)*.4;dc=mix(vec3(1.),irid,.35)*la+dc*(1.-la);da=la+da*(1.-la);
 c=dc+c*(1.-da);a=da+a*(1.-da);
 gl_FragColor=vec4(c,a);
}`

type Body = { x: number; v: number }
type Sat = { x: number; y: number; vx: number; vy: number; r: number; k: number }
type Rip = { x: number; y: number; age: number; amp: number }
type GLC = { gl: WebGLRenderingContext; u: Record<string, WebGLUniformLocation | null> }

function geometry(size: number) {
  const h = Math.max(20, Math.round(size))
  const w = Math.round(h * 2.1)
  const pad = h * 0.1
  const r = h / 2 - pad
  const PAD = Math.round(h * 0.45)
  return { w, h, pad, r, PAD, xOff: PAD + pad + r, xOn: PAD + w - pad - r, cy: PAD + h / 2, S: r / 21 }
}

function makeState() {
  return {
    a: { x: 0, v: 0 } as Body,
    b: { x: 0, v: 0 } as Body,
    lead: 0 as 0 | 1,
    lagUntil: 0,
    sy: { s: 1, v: 0 },
    q: 0,
    qT: 0,
    sats: [] as Sat[],
    rips: [] as Rip[],
    fill: { x: 0, v: 0 } as Body,
    on: false,
    g: geometry(40),
    mouse: { x: 0, y: 0, s: 0, on: false },
    drag: { id: -1, startX: 0, grab: 0, moved: false, x: 0 },
    suppressClick: false,
    moving: false,
    split: false,
    ready: false,
    visible: true,
    reduce: false,
    raf: 0,
    last: 0,
    time: 0,
    glc: null as GLC | null,
  }
}

function initGL(canvas: HTMLCanvasElement): GLC | null {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false }) as WebGLRenderingContext | null
  if (!gl) return null
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)
    if (!s) return null
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  }
  const vs = sh(gl.VERTEX_SHADER, VERT)
  const fs = sh(gl.FRAGMENT_SHADER, FRAG)
  const p = gl.createProgram()
  if (!vs || !fs || !p) return null
  gl.attachShader(p, vs)
  gl.attachShader(p, fs)
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null
  gl.useProgram(p)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(p, "a")
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const u: Record<string, WebGLUniformLocation | null> = {}
  for (const n of ["uRes", "uDpr", "uS", "uTime", "uPill", "uFill", "uBlob", "uSy", "uRip", "uMouse", "uDark", "uAmb", "uK"]) u[n] = gl.getUniformLocation(p, n)
  return { gl, u }
}

export function LiquidToggle({
  checked,
  defaultChecked = false,
  onCheckedChange,
  tone = "light",
  size = 40,
  icons,
  disabled = false,
  sound = false,
  label = "Toggle theme",
  name,
  value = "on",
  id,
  className,
  style,
}: LiquidToggleProps) {
  const [inner, setInner] = React.useState(defaultChecked)
  const current = checked ?? inner
  const [, bump] = React.useReducer((n: number) => n + 1, 0)
  const btnRef = React.useRef<HTMLButtonElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const knobRef = React.useRef<HTMLSpanElement>(null)
  const fillRef = React.useRef<HTMLSpanElement>(null)
  const iconRef = React.useRef<HTMLSpanElement>(null)
  const audio = React.useRef<AudioContext | null>(null)
  const st = React.useRef(makeState())
  const [gl, setGl] = React.useState<"on" | "off">("on")
  const darkRef = React.useRef(0)
  darkRef.current = tone === "dark" ? 1 : 0
  const cbRef = React.useRef({ onCheckedChange, controlled: checked !== undefined, sound })
  cbRef.current = { onCheckedChange, controlled: checked !== undefined, sound }

  const g = geometry(size)
  const hasIcons = !!(icons?.off || icons?.on)

  /* ---- drawing ---- */
  const draw = React.useCallback(() => {
    const s = st.current
    const G = s.g
    const head = s.lead === 0 ? s.a : s.b
    const tail = s.lead === 0 ? s.b : s.a
    const sep = Math.abs(head.x - tail.x)
    const thin = Math.min(sep / (1.7 * G.r), 1)
    if (s.glc) {
      const { gl: c, u } = s.glc
      const S = G.S
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      c.viewport(0, 0, c.drawingBufferWidth, c.drawingBufferHeight)
      c.uniform2f(u.uRes, G.w + G.PAD * 2, G.h + G.PAD * 2)
      c.uniform1f(u.uDpr, dpr)
      c.uniform1f(u.uS, S)
      c.uniform1f(u.uTime, s.time)
      c.uniform4f(u.uPill, G.PAD / S, G.PAD / S, G.w / S, G.h / S)
      const amp = s.reduce ? 0 : Math.min(Math.abs(s.fill.v) / S * 0.004, 2.6) + 0.35
      const fz = Math.max(0, Math.min(1, (s.fill.x - G.PAD) / G.w))
      c.uniform4f(u.uFill, s.fill.x / S, amp, fz, 0)
      const blobs = new Float32Array(24)
      const sy = new Float32Array(6).fill(1)
      blobs.set([head.x / S, G.cy / S, (s.q * (1 - 0.25 * thin)) / S, (G.r * (1 - 0.12 * thin)) / S, tail.x / S, G.cy / S, (s.q * (1 - 0.8 * thin)) / S, (G.r * (1 - 0.55 * thin)) / S], 0)
      sy[0] = sy[1] = s.sy.s
      s.sats.slice(0, 4).forEach((d, i) => blobs.set([d.x / S, d.y / S, 0, d.r / S], 8 + i * 4))
      c.uniform4fv(u.uBlob, blobs)
      c.uniform1fv(u.uSy, sy)
      const rips = new Float32Array(24)
      s.rips.slice(-6).forEach((p, i) => rips.set([p.x / S, p.y / S, p.age, p.amp], i * 4))
      c.uniform4fv(u.uRip, rips)
      c.uniform3f(u.uMouse, s.mouse.x / S, s.mouse.y / S, s.mouse.s)
      c.uniform1f(u.uDark, darkRef.current)
      c.uniform1f(u.uAmb, s.reduce ? 0 : 1)
      c.uniform1f(u.uK, 10)
      c.clearColor(0, 0, 0, 0)
      c.clear(c.COLOR_BUFFER_BIT)
      c.drawArrays(c.TRIANGLES, 0, 3)
    } else {
      if (knobRef.current) {
        const left = Math.min(head.x, tail.x) - s.q - G.r - G.PAD
        knobRef.current.style.width = `${sep + 2 * (s.q + G.r)}px`
        knobRef.current.style.top = `${G.pad}px`
        knobRef.current.style.height = `${G.r * 2}px`
        knobRef.current.style.transform = `translateX(${left}px) scaleY(${s.sy.s})`
      }
      if (fillRef.current) fillRef.current.style.width = `${Math.max(0, Math.min(G.w - 4, s.fill.x - G.PAD - 2))}px`
    }
    const ic = iconRef.current
    if (ic) {
      const cx = head.x * 0.7 + tail.x * 0.3
      const t = Math.max(0, Math.min(1, (cx - G.xOff) / (G.xOn - G.xOff)))
      const box = G.r * 1.05
      ic.style.width = ic.style.height = `${box}px`
      // the icon rolls with the drop, and is upright again at each end
      const roll = (x: number) => (s.reduce ? 0 : ((cx - x) / G.r) * 57.3)
      ic.style.transform = `translate(${cx - G.PAD - box / 2}px,${G.cy - G.PAD - box / 2}px) scale(${s.sy.s * (1 + (s.q / G.r) * 0.25)},${1 / s.sy.s})`
      const [off, on] = Array.from(ic.children) as HTMLElement[]
      // swap without overlap: one shrinks away, then the other grows in
      const a = 1 - Math.max(0, Math.min(1, (t - 0.25) / 0.3)), b = Math.max(0, Math.min(1, (t - 0.5) / 0.3))
      if (off) { off.style.opacity = String(a); off.style.transform = `rotate(${roll(G.xOff)}deg) scale(${0.4 + 0.6 * a})` }
      if (on) { on.style.opacity = String(b); on.style.transform = `rotate(${roll(G.xOn)}deg) scale(${0.4 + 0.6 * b})` }
    }
  }, [])

  /* ---- physics ---- */
  const step = React.useCallback((dt: number, now: number) => {
    const s = st.current
    const G = s.g
    const S = G.S
    s.time += dt
    s.q += (s.qT - s.q) * Math.min(1, dt * 14)
    const home = s.on ? G.xOn : G.xOff
    const dragging = s.drag.id !== -1 && s.drag.moved
    const hT = dragging ? s.drag.x : home
    const bodies = [s.a, s.b]
    const fillT = s.on ? G.PAD + G.w + 6 : G.PAD - 6
    let still = true
    if (s.reduce) {
      s.a.x = s.b.x = hT; s.a.v = s.b.v = 0; s.sy.s = 1; s.sy.v = 0; s.sats = []
      s.fill.x = fillT; s.fill.v = 0
    } else {
      bodies.forEach((B, i) => {
        const lead = i === s.lead
        // the tail is held by surface tension near home while the head is pulled away
        const T = lead ? hT : dragging ? home + (hT - home) * 0.06 : home
        const k = lead ? 260 : dragging ? 150 : 72
        const c = lead ? 28 : 13
        const f = !lead && now < s.lagUntil ? 0.06 : 1
        B.v += (k * (T - B.x) - c * B.v) * dt * f
        B.x += B.v * dt
        const lo = G.xOff + s.q - 2, hi = G.xOn - s.q + 2
        if (B.x < lo || B.x > hi) {
          s.sy.v -= Math.min(Math.abs(B.v) / S, 900) * 0.0018
          B.x = Math.max(lo, Math.min(hi, B.x))
          B.v *= -0.25
        }
        if (Math.abs(T - B.x) > 0.3 || Math.abs(B.v) > 3) still = false
      })
      const L = bodies[s.lead]
      const syT = 1 - 0.18 * Math.min(Math.abs(L.v) / S / 1500, 1)
      s.sy.v += (280 * (syT - s.sy.s) - 9 * s.sy.v) * dt
      s.sy.s += s.sy.v * dt
      if (Math.abs(s.sy.s - 1) > 0.002 || Math.abs(s.sy.v) > 0.02) still = false
      // break the neck: droplets pinch off between head and tail
      const sep = Math.abs(s.a.x - s.b.x)
      if (!s.split && (s.moving || dragging) && sep > G.r * 1.6) {
        s.split = true
        const lo = bodies[1 - s.lead], hi = bodies[s.lead]
        ;[0.38, 0.62].forEach((t, j) => {
          s.sats.push({
            x: lo.x + (hi.x - lo.x) * t,
            y: G.cy + (Math.random() - 0.5) * G.r * 0.4,
            vx: (lo.v + hi.v) * 0.4,
            vy: (Math.random() - 0.5) * 50 * S,
            r: G.r * (0.36 - j * 0.06),
            k: 60 + Math.random() * 70,
          })
        })
      }
      const sink = bodies[s.lead].x
      s.sats = s.sats.filter((d) => {
        d.vx += (d.k * (sink - d.x) - 9 * d.vx) * dt
        d.vy += (90 * (G.cy - d.y) - 7 * d.vy) * dt
        d.x += d.vx * dt
        d.y += d.vy * dt
        d.x = Math.max(G.xOff - G.r + d.r, Math.min(G.xOn + G.r - d.r, d.x))
        d.y = Math.max(G.cy - G.r + d.r, Math.min(G.cy + G.r - d.r, d.y))
        if (Math.abs(sink - d.x) < G.r * 0.55) d.r -= dt * 30 * S
        return d.r > 0.6 * S
      })
      if (s.sats.length) still = false
      // the water follows a little behind the drop
      s.fill.v += (70 * (fillT - s.fill.x) - 12 * s.fill.v) * dt
      s.fill.x += s.fill.v * dt
      if (Math.abs(fillT - s.fill.x) > 0.3 || Math.abs(s.fill.v) > 2) still = false
    }
    if (dragging) still = false
    if (s.moving && still) {
      s.moving = false
      if (!s.reduce) s.rips.push({ x: home, y: G.cy, age: 0, amp: s.split ? 1.1 : 0.6 })
    }
    s.rips.forEach((p) => (p.age += dt))
    s.rips = s.rips.filter((p) => p.age < 2.4)
    s.mouse.s += ((s.mouse.on ? 1 : 0) - s.mouse.s) * Math.min(1, dt * 7)
  }, [])

  const loop = React.useCallback(() => {
    const s = st.current
    if (s.raf) return
    s.last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - s.last) / 1000, 1 / 30)
      s.last = now
      step(dt, now)
      draw()
      const busy = s.moving || s.drag.id !== -1 || s.rips.length || s.sats.length || s.mouse.s > 0.01
      if (s.visible && (!s.reduce || busy)) s.raf = requestAnimationFrame(tick)
      else s.raf = 0
    }
    s.raf = requestAnimationFrame(tick)
  }, [draw, step])

  /* ---- sound ---- */
  const plip = (up: boolean) => {
    if (!cbRef.current.sound) return
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = (audio.current ||= new AC())
      const t = ctx.currentTime
      const o = ctx.createOscillator()
      const gn = ctx.createGain()
      o.type = "sine"
      o.frequency.setValueAtTime(up ? 460 : 620, t)
      o.frequency.exponentialRampToValueAtTime(up ? 1500 : 380, t + 0.08)
      gn.gain.setValueAtTime(0.0001, t)
      gn.gain.exponentialRampToValueAtTime(0.15, t + 0.008)
      gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
      o.connect(gn).connect(ctx.destination)
      o.start(t)
      o.stop(t + 0.18)
    } catch {
      /* audio is optional */
    }
  }

  /* move the water to a state (animated unless reduced motion) */
  const goTo = React.useCallback((on: boolean, lag = true) => {
    const s = st.current
    if (s.on === on) return
    s.on = on
    const target = on ? s.g.xOn : s.g.xOff
    s.lead = Math.abs(target - s.a.x) >= Math.abs(target - s.b.x) ? 0 : 1
    if (lag) s.lagUntil = performance.now() + 90
    s.moving = true
    s.split = false
    loop()
  }, [loop])

  /* user changed the value (tap, key, drag snap) */
  const commit = (on: boolean) => {
    const s = st.current
    if (s.on === on) return
    goTo(on, s.drag.id === -1)
    plip(on)
    try { if (navigator.vibrate && s.drag.id !== -1) navigator.vibrate(8) } catch { /* optional */ }
    if (!cbRef.current.controlled) setInner(on)
    cbRef.current.onCheckedChange?.(on)
    bump()
  }

  /* ---- setup ---- */
  React.useEffect(() => {
    const s = st.current
    s.reduce = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    const cv = canvasRef.current
    s.glc = cv ? initGL(cv) : null
    if (!s.glc) setGl("off")
    const lost = (e: Event) => { e.preventDefault(); s.glc = null; setGl("off") }
    cv?.addEventListener("webglcontextlost", lost)
    const io = new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; if (s.visible) loop() })
    if (btnRef.current) io.observe(btnRef.current)
    const vis = () => { s.visible = document.visibilityState === "visible"; if (s.visible) loop() }
    document.addEventListener("visibilitychange", vis)
    return () => {
      cv?.removeEventListener("webglcontextlost", lost)
      io.disconnect()
      document.removeEventListener("visibilitychange", vis)
      cancelAnimationFrame(s.raf)
      s.raf = 0
    }
  }, [loop])

  /* geometry (size) */
  React.useLayoutEffect(() => {
    const s = st.current
    s.g = geometry(size)
    const G = s.g
    if (!s.ready) {
      s.on = current
      s.ready = true
    }
    s.a.x = s.b.x = s.on ? G.xOn : G.xOff
    s.a.v = s.b.v = 0
    s.fill.x = s.on ? G.PAD + G.w + 6 : G.PAD - 6
    const cv = canvasRef.current
    if (cv) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const W = G.w + G.PAD * 2, Hh = G.h + G.PAD * 2
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(Hh * dpr)
      cv.style.width = `${W}px`
      cv.style.height = `${Hh}px`
      cv.style.left = cv.style.top = `${-G.PAD}px`
    }
    draw()
    loop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, draw, loop])

  /* follow the controlled / uncontrolled value */
  React.useEffect(() => {
    if (st.current.drag.id === -1) goTo(current)
  })
  React.useEffect(() => { loop() }, [tone, hasIcons, loop])

  /* ---- interaction ---- */
  const localX = (clientX: number) => clientX - (btnRef.current?.getBoundingClientRect().left ?? 0) + st.current.g.PAD

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || (e.pointerType === "mouse" && e.button !== 0)) return
    const s = st.current
    const x = localX(e.clientX)
    const head = s.lead === 0 ? s.a : s.b
    s.drag = { id: e.pointerId, startX: x, grab: x - head.x, moved: false, x: head.x }
    s.suppressClick = false
    s.qT = s.g.r * 0.32
    if (!s.reduce) {
      s.sy.v -= 1.2
      const r = btnRef.current?.getBoundingClientRect()
      if (r) s.rips.push({ x, y: e.clientY - r.top + s.g.PAD, age: 0, amp: 0.7 })
    }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* optional */ }
    loop()
  }

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = st.current
    const G = s.g
    const r = btnRef.current?.getBoundingClientRect()
    if (e.pointerType === "mouse" && r) {
      s.mouse.x = e.clientX - r.left + G.PAD
      s.mouse.y = e.clientY - r.top + G.PAD
      s.mouse.on = true
    }
    if (s.drag.id === e.pointerId) {
      const x = localX(e.clientX)
      if (!s.drag.moved && Math.abs(x - s.drag.startX) > 4) {
        s.drag.moved = true
        s.suppressClick = true
        s.lead = Math.abs(x - s.a.x) <= Math.abs(x - s.b.x) ? 0 : 1
        s.lagUntil = 0
        s.split = false
        s.moving = true
      }
      if (s.drag.moved) {
        s.drag.x = Math.max(G.xOff - G.r * 0.3, Math.min(G.xOn + G.r * 0.3, x - s.drag.grab))
        const t = (s.drag.x - G.xOff) / (G.xOn - G.xOff)
        // past the middle the neck lets go and the drop snaps across
        if (!s.on && t > 0.68) { s.split = false; commit(true); s.rips.push({ x: G.xOn, y: G.cy, age: 0, amp: 0.9 }) }
        else if (s.on && t < 0.32) { s.split = false; commit(false); s.rips.push({ x: G.xOff, y: G.cy, age: 0, amp: 0.9 }) }
      }
    }
    loop()
  }

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = st.current
    if (s.drag.id !== e.pointerId) return
    const wasMoved = s.drag.moved
    s.drag.id = -1
    s.qT = 0
    s.moving = true
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* optional */ }
    if (!wasMoved && !s.suppressClick) {
      commit(!s.on)
      s.suppressClick = true
    }
    loop()
    bump() // re-sync with a controlled value that may have refused the change
  }

  const onClick = () => {
    const s = st.current
    if (disabled) return
    if (s.suppressClick) { s.suppressClick = false; return }
    commit(!s.on)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault()
      commit(e.key === "ArrowRight")
    }
  }

  return (
    <button
      ref={btnRef}
      id={id}
      type="button"
      role="switch"
      aria-checked={current}
      aria-label={label}
      disabled={disabled}
      className={["nimbus-toggle", className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-gl={gl}
      data-state={current ? "on" : "off"}
      style={{ width: g.w, height: g.h, ...style }}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={() => { st.current.mouse.on = false; loop() }}
    >
      <style dangerouslySetInnerHTML={{ __html: NT_CSS }} />
      <span className="nt-glass" aria-hidden="true" />
      <canvas className="nt-water" ref={canvasRef} aria-hidden="true" />
      <span className="nt-fill" ref={fillRef} aria-hidden="true" />
      <span className="nt-knob" ref={knobRef} aria-hidden="true" />
      {hasIcons && (
        <span className="nt-icon" ref={iconRef} aria-hidden="true">
          <span>{icons?.off}</span>
          <span>{icons?.on}</span>
        </span>
      )}
      {name && <input type="checkbox" hidden readOnly tabIndex={-1} aria-hidden="true" name={name} value={value} checked={current} />}
    </button>
  )
}

/** alias for registries that import { Component } */
export { LiquidToggle as Component }

export default LiquidToggle
