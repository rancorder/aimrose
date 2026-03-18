import { useState, useEffect, useRef } from "react";

// ─── Routing ──────────────────────────────────────────────────────────
function getRoute() {
  return window.location.pathname === "/presenter" ? "presenter" : "customer";
}

// ─── BroadcastChannel sync ────────────────────────────────────────────
const CHANNEL = "aim-rose-sync";

function useSyncSend() {
  const ch = useRef(null);
  const ready = useRef(false);
  useEffect(() => {
    ch.current = new BroadcastChannel(CHANNEL);
    ready.current = true;
    return () => { ch.current.close(); ready.current = false; };
  }, []);
  // useRefでラップして毎回同一関数参照を返す（useEffect依存配列に入れても無限ループしない）
  const fn = useRef((sectionId) => {
    if (ready.current) {
      ch.current.postMessage({ sectionId });
    } else {
      setTimeout(() => ch.current?.postMessage({ sectionId }), 150);
    }
  });
  return fn.current;
}

function useSyncReceive(onSection) {
  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = (e) => { if (e.data?.sectionId) onSection(e.data.sectionId); };
    return () => ch.close();
  }, [onSection]);
}

// ─── Hooks ────────────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, v];
}

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { threshold: 0.3 });
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);
  return active;
}

function R({ children, d = 0 }) {
  const [ref, v] = useReveal();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(24px)", transition: `opacity .65s ease ${d}s, transform .65s ease ${d}s` }}>
      {children}
    </div>
  );
}

// ─── Design tokens ────────────────────────────────────────────────────
const C = {
  pink: "#c9657a", rose: "#e8847a",
  bg: "#fff8f6", bgAlt: "#fdf0f5",
  border: "#f2d0d0", text: "#2a1a1a", muted: "#7a5a5a",
  white: "#ffffff",
};

// ─── Shared components ────────────────────────────────────────────────
function Card({ children, accent, style: s = {} }) {
  return (
    <div style={{ background: C.white, border: `1.5px solid ${accent || C.border}`, borderRadius: 18, padding: "28px 24px", boxShadow: `0 4px 24px ${accent ? accent + "18" : "#e8847a0e"}`, ...s }}>
      {children}
    </div>
  );
}

function SectionLabel({ text }) {
  return <div style={{ fontFamily: "'Noto Sans JP',sans-serif", fontSize: 11, letterSpacing: "0.22em", color: C.pink, marginBottom: 8, fontWeight: 500 }}>{text}</div>;
}

function SectionTitle({ children }) {
  return <h2 style={{ fontFamily: "'Noto Serif JP',serif", fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, color: C.text, lineHeight: 1.5, margin: "0 0 40px" }}>{children}</h2>;
}

function H({ sub, children }) {
  return (
    <R>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", marginBottom: 40 }}>
        {sub && <SectionLabel text={sub} />}
        <SectionTitle>{children}</SectionTitle>
      </div>
    </R>
  );
}

function Chip({ children }) {
  return <span style={{ display: "inline-block", padding: "6px 16px", background: "linear-gradient(135deg,#fff0ee,#fce8f3)", border: `1px solid ${C.border}`, borderRadius: 50, fontSize: 13, color: C.pink, fontWeight: 500, marginRight: 8, marginBottom: 6 }}>{children}</span>;
}

function QAItem({ q, a, delay }) {
  const [open, setOpen] = useState(false);
  return (
    <R d={delay}>
      <div style={{ borderRadius: 16, overflow: "hidden", border: `1.5px solid ${open ? C.rose + "80" : C.border}`, transition: "border-color .3s", marginBottom: 14 }}>
        <button onClick={() => setOpen(o => !o)} style={{ width: "100%", padding: "18px 24px", background: open ? "#fff5f3" : C.white, border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, textAlign: "left", transition: "background .3s" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span style={{ color: C.pink, fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, flexShrink: 0 }}>Q</span>
            <span style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 15, color: C.text, lineHeight: 1.6 }}>{q}</span>
          </div>
          <span style={{ color: C.rose, fontSize: 13, transform: open ? "rotate(45deg)" : "none", transition: ".3s", flexShrink: 0 }}>＋</span>
        </button>
        <div style={{ maxHeight: open ? 400 : 0, overflow: "hidden", transition: "max-height .4s ease" }}>
          <div style={{ padding: "20px 24px 24px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 14 }}>
            <span style={{ color: C.rose, fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, flexShrink: 0 }}>A</span>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 2, margin: 0 }}>{a}</p>
          </div>
        </div>
      </div>
    </R>
  );
}

// ════════════════════════════════════════════════════════════════════
// CUSTOMER SECTIONS MAP
// ════════════════════════════════════════════════════════════════════
const SECTIONS = [
  { id: "intro",    label: "イントロ" },
  { id: "overview", label: "サービス概要" },
  { id: "position", label: "ポジショニング" },
  { id: "usp",      label: "USP 3点" },
  { id: "service",  label: "基本サービス" },
  { id: "results",  label: "実績紹介" },
  { id: "faq",      label: "Q&A" },
  { id: "pricing",  label: "料金" },
];

function Sidebar({ active }) {
  const [open, setOpen] = useState(false);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, height: "100vh", width: open ? 220 : 48, background: C.white, borderRight: `1px solid ${C.border}`, zIndex: 100, transition: "width .35s ease", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "2px 0 12px #f2d0d040" }}>
      <button onClick={() => setOpen(o => !o)} style={{ padding: "16px", background: "none", border: "none", cursor: "pointer", color: C.pink, fontSize: 18, textAlign: "left", flexShrink: 0 }}>
        {open ? "←" : "☰"}
      </button>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {SECTIONS.map((s, i) => (
          <a key={s.id} href={`#${s.id}`} style={{ display: "block", padding: "10px 16px", color: active === s.id ? C.pink : C.muted, fontFamily: "'Noto Sans JP',sans-serif", fontSize: 12, textDecoration: "none", borderLeft: `2px solid ${active === s.id ? C.pink : "transparent"}`, whiteSpace: "nowrap", transition: "all .2s", background: active === s.id ? "#fff0ee" : "transparent" }}>
            <span style={{ opacity: 0.4, marginRight: 8, fontSize: 11 }}>{String(i + 1).padStart(2, "0")}</span>
            {open && s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function CSection({ id, bg, children }) {
  return (
    <section id={id} style={{ padding: "88px 0", background: bg || C.bg, borderBottom: `1px solid ${C.border}` }}>
      {children}
    </section>
  );
}

// ════════════════════════════════════════════════════════════════════
// CUSTOMER VIEW
// ════════════════════════════════════════════════════════════════════
function CustomerView() {
  const active = useActiveSection(SECTIONS.map(s => s.id));
  const W = { maxWidth: 900, margin: "0 auto", padding: "0 24px" };

  // Receive sync from presenter → scroll to section
  useSyncReceive((sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 200, background: C.border }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${C.rose},${C.pink})`, width: `${((SECTIONS.findIndex(s => s.id === active) + 1) / SECTIONS.length) * 100}%`, transition: "width .4s ease" }} />
      </div>
      <Sidebar active={active} />
      <main style={{ marginLeft: 48 }}>

        {/* INTRO */}
        <section id="intro" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "80px 24px", background: "linear-gradient(145deg,#fff0ed 0%,#fde8f3 50%,#fef5ee 100%)", borderBottom: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
          {[{w:480,h:480,top:-140,left:-160,c:"#f9c5c522"},{w:360,h:360,bottom:-100,right:-100,c:"#e8a4c022"},{w:200,h:200,top:"35%",right:"8%",c:"#ffd7cc28"}].map((d,i)=>(
            <div key={i} style={{position:"absolute",borderRadius:"50%",width:d.w,height:d.h,background:d.c,top:d.top,left:d.left,bottom:d.bottom,right:d.right,pointerEvents:"none"}}/>
          ))}
          <div style={{ position: "relative", maxWidth: 720 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, letterSpacing: "0.28em", color: C.pink, marginBottom: 28, opacity: 0, animation: "fadeUp .8s ease .2s forwards" }}>株式会社 aim-rose</div>
            <div style={{ fontSize: "clamp(13px,2vw,15px)", color: C.muted, marginBottom: 20, opacity: 0, animation: "fadeUp .8s ease .35s forwards" }}>介護施設様向け</div>
            <h1 style={{ fontFamily: "'Noto Serif JP',serif", fontSize: "clamp(32px,6vw,58px)", fontWeight: 700, lineHeight: 1.45, background: `linear-gradient(135deg,${C.rose},${C.pink})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", opacity: 0, animation: "fadeUp .9s ease .5s forwards" }}>
              洋裁教室<br />定期パッケージ
            </h1>
            <p style={{ marginTop: 28, fontSize: "clamp(15px,2.2vw,18px)", color: C.muted, lineHeight: 2, opacity: 0, animation: "fadeUp .9s ease .7s forwards" }}>ご入居者様の楽しみ・充実時間創造</p>
            <a href="#overview" style={{ display: "inline-block", marginTop: 52, padding: "16px 44px", background: `linear-gradient(135deg,${C.rose},${C.pink})`, color: "#fff", borderRadius: 50, textDecoration: "none", fontSize: 15, fontWeight: 500, boxShadow: `0 10px 36px ${C.rose}38`, opacity: 0, animation: "fadeUp 1s ease .9s forwards", transition: "transform .2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={e => e.currentTarget.style.transform = ""}>
              サービス内容を見る ↓
            </a>
          </div>
        </section>

        {/* SERVICE OVERVIEW */}
        <CSection id="overview" bg={C.white}>
          <div style={W}>
            <H sub="SERVICE OVERVIEW">サービスのご紹介</H>
            <R d={0.05}><p style={{ fontSize: 16, color: C.muted, lineHeight: 2, marginBottom: 40 }}>経験豊富な講師が介護施設様へ直接伺い、洋裁の楽しさをお届けします。</p></R>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 20, marginBottom: 32 }}>
              {[{ n: "10名", label: "在籍講師数", d: 0 }, { n: "300〜350名", label: "現在の生徒様数", d: 0.1 }, { n: "月1回〜", label: "柔軟な開催頻度", d: 0.2 }, { n: "ミシン・手縫い", label: "施設環境に対応", d: 0.3 }].map(s => (
                <R key={s.label} d={s.d}><Card>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 900, background: `linear-gradient(135deg,${C.rose},${C.pink})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8, lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{s.label}</div>
                </Card></R>
              ))}
            </div>
            <R d={0.35}><div style={{ padding: "20px 28px", background: "linear-gradient(135deg,#fff0ee,#fce8f3)", border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 14, color: C.muted, lineHeight: 1.9 }}>
              <strong style={{ color: C.pink }}>環境対応力：</strong>ミシン持ち込みが困難な場合は手縫い中心の内容に切り替え可能。簡単制作〜小物づくりまで、ご入居者様の負担にならない内容構成。
            </div></R>
          </div>
        </CSection>

        {/* POSITIONING */}
        <CSection id="position" bg={C.bgAlt}>
          <div style={W}>
            <H sub="MARKET POSITIONING">洋裁教室が選ばれる理由</H>
            <R d={0.1}><Card style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 13, color: C.pink, letterSpacing: "0.12em", marginBottom: 14, fontFamily: "'Noto Sans JP',sans-serif", fontWeight: 500 }}>介護施設様の課題</div>
              {["ご入居者様の楽しみづくり・手先を動かす活動の重要性が増大している", "単発イベントから→継続的に楽しめるプログラムへのニーズが増加している"].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, fontSize: 14, color: C.muted, lineHeight: 1.8 }}>
                  <span style={{ color: C.rose, flexShrink: 0, marginTop: 3 }}>▶</span>{t}
                </div>
              ))}
            </Card></R>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
              {[{ title: "完成物が残る", body: "形として手元に残る達成感", d: 0 }, { title: "達成感がある", body: "制作完了時の充実感", d: 0.1 }, { title: "会話が生まれる", body: "制作中の自然なコミュニケーション", d: 0.2 }, { title: "満足度向上", body: "継続的な楽しみの提供", d: 0.3 }].map(f => (
                <R key={f.title} d={f.d}><Card style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{f.body}</div>
                </Card></R>
              ))}
            </div>
          </div>
        </CSection>

        {/* USP */}
        <CSection id="usp" bg={C.white}>
          <div style={W}>
            <H sub="WHY CHOOSE US">貴社メリット 3つのポイント</H>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { n: "1", title: "ご入居者様の負担にならない内容設計", body: "ミシンを使う場合でも講師がしっかりサポートし、手縫い中心の回もあるため、どなたでも安心してご参加いただけます。", d: 0 },
                { n: "2", title: "継続しやすいプログラム構成", body: "月1回等の定期開催により、ご入居者様の楽しみが増加。施設様としてもレクリエーション計画を立てやすい仕組みです。", d: 0.1 },
                { n: "3", title: "経験豊富な講師の対応力", body: "現在300名以上の生徒様を指導する実績ある講師陣が、参加人数・レベルに合わせ柔軟に進行します。", d: 0.2 },
              ].map(r => (
                <R key={r.n} d={r.d}>
                  <div style={{ display: "flex", gap: 28, alignItems: "flex-start", background: C.bgAlt, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: "32px 28px" }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 64, fontWeight: 900, color: C.border, lineHeight: 1, minWidth: 56, flexShrink: 0 }}>{r.n}</div>
                    <div>
                      <div style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 19, fontWeight: 700, color: C.text, marginBottom: 10 }}>{r.title}</div>
                      <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.9 }}>{r.body}</p>
                    </div>
                  </div>
                </R>
              ))}
            </div>
          </div>
        </CSection>

        {/* SERVICE */}
        <CSection id="service" bg={C.bgAlt}>
          <div style={W}>
            <H sub="SERVICE DETAILS">貴施設に合わせたオーダーメイド設計</H>
            <R d={0.1}><Card style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: C.pink }}>制作物例</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <Chip>トートバッグ</Chip><Chip>小物類</Chip>
                <span style={{ fontSize: 13, color: C.muted }}>※施設様ご希望に合わせて調整可</span>
              </div>
            </Card></R>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginBottom: 24 }}>
              {[{ n: "1", title: "ヒアリング", body: "参加人数・ご希望内容・開催頻度を確認し、プランを設計します。", d: 0 }, { n: "2", title: "プラン設計", body: "施設環境に合わせた内容調整。ミシン不可の場合も完全対応。", d: 0.15 }, { n: "3", title: "定期開催", body: "継続的な洋裁教室を実施。月1回〜、施設様のペースで。", d: 0.3 }].map(s => (
                <R key={s.n} d={s.d}><Card style={{ textAlign: "center", position: "relative" }}>
                  <div style={{ position: "absolute", top: 14, right: 18, fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 900, color: `${C.rose}20` }}>{s.n}</div>
                  <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 10 }}>{s.title}</div>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.9 }}>{s.body}</p>
                </Card></R>
              ))}
            </div>
            <R d={0.4}><div style={{ padding: "18px 24px", background: "linear-gradient(135deg,#fff0ee,#fce8f3)", border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 14, color: C.muted, lineHeight: 1.8 }}>
              <strong style={{ color: C.pink }}>環境対応力：</strong>ミシン持ち込み困難時は手縫い中心内容に切り替え等、貴施設環境に完全対応。
            </div></R>
          </div>
        </CSection>

        {/* RESULTS */}
        <CSection id="results" bg={C.white}>
          <div style={W}>
            <H sub="TRACK RECORD">多数の施設様から高評価</H>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
              {[
                { title: "300〜350名", sub: "継続通学中の個人教室生徒様", body: "個人向け教室での豊富な実績により培われた、確かな指導力・対応力で貴施設をサポートします。", d: 0 },
                { title: "「継続したい」のお声", sub: "施設様からの評価（多数）", body: "完成物が残る活動として高満足度を獲得。施設様より継続希望のお声を多数いただいています。", d: 0.1 },
                { title: "幅広い年齢層", sub: "地域コミュニティでの実績", body: "幅広い年齢層への指導経験を活かした、きめ細かなサポートをご提供します。", d: 0.2 },
              ].map(r => (
                <R key={r.title} d={r.d}>
                  <div style={{ background: C.bgAlt, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: "32px 28px" }}>
                    <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 20, color: C.pink, marginBottom: 4 }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>{r.sub}</div>
                    <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.9 }}>{r.body}</p>
                  </div>
                </R>
              ))}
            </div>
          </div>
        </CSection>

        {/* FAQ */}
        <CSection id="faq" bg={C.bgAlt}>
          <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
            <H sub="FAQ">よくあるご質問</H>
            <QAItem q="ミシンの持ち込みは必要ですか？" a="ミシン必要な内容時は持ち込み可。手縫い中心内容への切り替えも可能です。貴施設環境に合わせて柔軟に対応いたします。" delay={0} />
            <QAItem q="参加人数が多くても対応できますか？" a="講師1名での同時対応には限りがありますが、内容調整・複数回開催等で対応可能です。" delay={0.05} />
            <QAItem q="材料費はどうなりますか？" a="制作内容によって変動しますので、ご状況に合わせて個別にご説明いたします。" delay={0.1} />
            <QAItem q="どんな制作物ができますか？" a="トートバッグや小物等、ご入居者様の負担にならない内容を中心にご提案。ご希望に合わせて調整可能です。" delay={0.15} />
            <QAItem q="講師の方はどんな方ですか？" a="現在300名以上の生徒様を教えている経験豊富な講師が担当いたします。施設様の雰囲気に合わせた柔らかい進行が評価いただいています。" delay={0.2} />
            <QAItem q="単発での依頼はできますか？" a="可能ですが、継続性が生まれやすい定期パッケージをお勧めしております。" delay={0.25} />
            <QAItem q="高齢の方でも参加できますか？" a="はい、負担の少ない内容に調整できますのでご安心ください。" delay={0.3} />
          </div>
        </CSection>

        {/* PRICING */}
        <section id="pricing" style={{ background: `linear-gradient(135deg,${C.rose},${C.pink})`, padding: "88px 24px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <R>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, letterSpacing: "0.25em", color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>PRICING</div>
              <h2 style={{ fontFamily: "'Noto Serif JP',serif", fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, color: "#fff", lineHeight: 1.5, marginBottom: 16 }}>貴施設に最適なプランをご提案</h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 2, marginBottom: 40 }}>参加人数・開催頻度・制作内容により料金が変動するため、貴施設のご状況に合わせた個別お見積りで対応いたします。</p>
            </R>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 16, marginBottom: 40 }}>
              {[{ item: "講師料", note: "開催回数・時間により設定" }, { item: "材料費", note: "制作物により変動" }, { item: "交通費", note: "施設までの実費" }, { item: "機材持込費", note: "必要な場合のみ" }].map((p, i) => (
                <R key={p.item} d={i * 0.1}>
                  <div style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", borderRadius: 16, padding: "22px 16px", textAlign: "center", border: "1px solid rgba(255,255,255,0.3)" }}>
                    <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 6 }}>{p.item}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{p.note}</div>
                  </div>
                </R>
              ))}
            </div>
            <R d={0.3}>
              <div style={{ background: "#fff", borderRadius: 20, padding: "40px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 12 }}>まずはお気軽にご相談ください</div>
                <p style={{ fontSize: 15, color: C.muted, lineHeight: 2, marginBottom: 28 }}>貴施設のご状況をお伺いし、最適なプランをご提案いたします。</p>
                <a href="mailto:info@aim-rose.co.jp" style={{ display: "inline-block", padding: "16px 48px", background: `linear-gradient(135deg,${C.rose},${C.pink})`, color: "#fff", borderRadius: 50, textDecoration: "none", fontWeight: 600, fontSize: 16, boxShadow: `0 8px 32px ${C.rose}40`, transition: "transform .2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = ""}>
                  お問い合わせ・無料相談 →
                </a>
                <div style={{ marginTop: 20, fontSize: 13, color: C.muted }}>株式会社aim-rose</div>
              </div>
            </R>
          </div>
        </section>

      </main>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════
// PRESENTER SECTIONS
// ════════════════════════════════════════════════════════════════════
const P_SECTIONS = [
  { id: "intro",    label: "イントロ",          script: "本日はお時間をいただきありがとうございます。\n株式会社aim roseの〇〇と申します。\n\n本日は、介護施設様や老人ホーム様向けにご提供している、洋裁教室の定期パッケージについてご紹介できればと思っております。\n\nご入居者様のレクリエーションや、日々の楽しみづくりにお役立ていただける内容になっておりますので、ぜひ気軽にお聞きいただければ幸いです。\nどうぞよろしくお願いいたします。" },
  { id: "ice",      label: "アイスブレイク",    script: "●●様、最初に1点お伺いしてもよろしいでしょうか？\n先日は突然のお電話にも関わらず、ご興味をいただけた理由を先にお伺いしてもよろしいでしょうか？\n\n（相手の回答を受ける）\n\nありがとうございます。そういった背景からご興味をお持ちいただいたんですね。\n\nもしよろしければ、現在のレクリエーションやイベントのご状況について、少しお聞かせいただけますでしょうか。\nたとえば、入居者様に人気のある活動や、もう少し幅を広げたいと感じている部分など、どのあたりが課題になりやすいでしょうか。\n\nなるほど、ありがとうございます。\nお話を伺っていると、弊社のサービスがお役に立てる場面が多そうだと感じました。", target: null },
  { id: "overview", label: "サービス概要",      script: "弊社では、介護施設様や老人ホーム様向けに、講師が施設へ伺い、洋裁を楽しんでいただく定期パッケージをご提供しています。\n\nミシンを使った簡単な制作や、手縫いでできる小物づくりなど、入居者様の負担にならない内容を中心に構成しています。\n\n講師は約10名在籍しており、現在は300〜350名ほどの生徒様に教室を提供している体制です。\n\n法人向けの定期パッケージでは、施設様の状況に合わせて月1回・半年・年間など柔軟に設計できます。" },
  { id: "position", label: "ポジショニング",    script: "最近は、入居者様の楽しみづくりや、手先を動かす活動の重要性が改めて注目されています。\n\n特に、単発のイベントだけではなく、継続的に楽しめるプログラムを求められる施設様が増えている印象です。\n\nそういった中で、洋裁のように「完成物が残る」「達成感がある」「会話が生まれる」活動は、入居者様の満足度向上にもつながりやすいと考えております。" },
  { id: "usp",      label: "USP 3点",          script: "御社にメリットがあるポイントを3つにまとめますね。\n\n一つ目は、入居者様の負担にならない内容設計です。\nミシンを使う場合でも講師がしっかりサポートし、手縫い中心の回もあるため、どなたでも安心してご参加いただけます。\n\n二つ目は、継続しやすいプログラム構成です。\n単発ではなく、月1回などの定期開催にすることで、入居者様の楽しみが増え、施設様としてもレクリエーションの計画が立てやすくなります。\n\n最後に、講師の対応力です。\n現在300名以上の生徒様を教えている講師陣が担当するため、参加人数やレベルに合わせて柔軟に進行できます。" },
  { id: "service",  label: "基本サービス",      script: "法人向けの定期パッケージでは、まず施設様のご状況を伺い、参加人数・ご希望の内容・開催頻度などを確認したうえでプランを設計します。\n\n制作物はトートバッグや小物など、施設様のご希望に合わせて調整可能です。\n\nまた、ミシンの持ち込みが難しい場合は、手縫い中心の内容に切り替えるなど、施設様の環境に合わせて柔軟に対応しています。" },
  { id: "results",  label: "実績紹介",          script: "これまで、介護施設様や地域のコミュニティ向けに多数の体験会や教室を実施してきました。\n\n特に、完成物が残る活動は入居者様からの満足度が高く、施設様からも「継続したい」というお声をいただくことが多いです。\n\nまた、個人向けの教室では300〜350名の生徒様が継続的に通われており、講師の指導力についても高い評価をいただいています。" },
  { id: "hearing",  label: "ヒアリング",        script: "すいません、ここまで一方的にお話ししてしまいました。\nここからは御社の現状や、「ここが気になる」「少し深掘りしたい」と感じられた部分を伺えればと思っています。", target: null, bant: true },
  { id: "faq",      label: "Q&A",              script: "Q1: ミシンの持ち込みは必要ですか？\n→ ミシンが必要な内容の場合は持ち込みも可能ですが、手縫い中心の内容に切り替えることもできます。\n\nQ2: 参加人数が多くても対応できますか？\n→ 内容調整・複数回開催等で対応可能です。詳細は二次商談で確認させていただきます。\n\nQ3: 材料費はどうなりますか？\n→ 制作内容によって変動しますので、二次商談で具体的にご説明いたします。\n\nQ4: どんな制作物ができますか？\n→ トートバッグや小物など、入居者様の負担にならない内容を中心にご提案しています。\n\nQ5: 講師の方はどんな方ですか？\n→ 現在300名以上の生徒様を教えている経験豊富な講師が担当いたします。\n\nQ6: 単発での依頼はできますか？\n→ 可能ですが、定期パッケージをおすすめしております。\n\nQ7: 高齢の方でも参加できますか？\n→ はい、負担の少ない内容に調整できますのでご安心ください。" },
  { id: "pricing",  label: "料金",             script: "参加人数・開催頻度・制作内容により料金が変動するため、貴施設のご状況に合わせた個別お見積りで対応いたします。\n\n講師料・材料費・交通費・機材持込費（必要な場合のみ）で構成されています。\n\nまずはお気軽にご相談ください。" },
  { id: "closing",  label: "クロージング",      script: "ありがとうございます。\nもしよろしければ、まずは御社の体制やご希望を伺いながら、最適なプランを具体化させていただければと思っています。\n\nたとえば「〇月〇日（〇曜日）」か「〇月〇日（〇曜日）」にお時間いただくことは可能でしょうか？\n\n▼ 日程決めステップ\n① 「午前と午後はどちらがご都合よろしいでしょうか」\n② 「●時と●時ではどちらがよろしいでしょうか」\n③ 「では、●月●日の●時でお時間を頂戴できればと思います」\n\n本日、私の方からのご案内は以上となりますが、何かご不明点はございますか？", target: null },
  { id: "obj",      label: "切り返し",          script: null, target: null, objections: true },
];

// Sections that map to a customer page section
const CUSTOMER_MAP = {
  intro: "intro", overview: "overview", position: "position",
  usp: "usp", service: "service", results: "results",
  faq: "faq", pricing: "pricing",
};

const OBJECTIONS = [
  { label: "検討したい", response: "ありがとうございます。検討されたいというお気持ちはよく理解できます。判断材料を揃える意味でも、具体的な内容は講師責任者との打ち合わせでないと正確にお伝えできない部分が多いです。三十分ほどお時間をいただければ、御社の施設に合わせた具体的なプランをご提示できますので、軽く次回のお時間だけいただければと思います。" },
  { label: "見送りたい", response: "率直にお話しいただきありがとうございます。無理に進める必要はないと思います。ただ、定期パッケージがどれくらいお役に立てるかは、詳細を確認してみないと判断が難しい部分があります。情報整理の場として、次回三十分ほどお時間をいただければ、御社にとってメリットがあるかどうかを一緒に確認できればと思います。" },
  { label: "会社の確認が必要", response: "承知いたしました。社内でのご確認は大切ですし、慎重に進められるのは良いことだと思います。具体的な制作内容や進め方は二次商談で詳しくご説明できます。次回は御社に合わせた具体例をご用意いたしますので、三十分ほどお時間をいただければと思います。" },
];

const BANT = [
  { label: "BUDGET — 予算", q: "外部講師を招く際のご予算感はどれくらいを想定されていますでしょうか。" },
  { label: "AUTHORITY — 決裁者", q: "最終的なご判断はどなたが担当される形になりますでしょうか。" },
  { label: "NEED — 必要性", q: "今回のような定期パッケージについて、御社としてどの程度の必要性を感じていらっしゃいますか。" },
  { label: "TIMELINE — 時期", q: "もし進める場合は、いつ頃からの導入をお考えでしょうか。" },
];

// ════════════════════════════════════════════════════════════════════
// PRESENTER VIEW
// ════════════════════════════════════════════════════════════════════
function PresenterView() {
  const [current, setCurrent] = useState(0);
  const [bantChecked, setBantChecked] = useState([false, false, false, false]);
  const [objOpen, setObjOpen] = useState(null);
  const sendSync = useSyncSend();

  const total = P_SECTIONS.length;
  const sec = P_SECTIONS[current];

  const go = (idx) => {
    if (idx < 0 || idx >= total) return;
    setCurrent(idx);
  };

  // currentが変わるたびに顧客画面へ同期送信（初期表示も含む）
  useEffect(() => {
    const customerSection = CUSTOMER_MAP[P_SECTIONS[current].id];
    if (customerSection) sendSync(customerSection);
  }, [current]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(current + 1);
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   go(current - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current]);

  const PG = { fontFamily: "'Noto Sans JP',sans-serif", fontSize: 14, color: C.muted };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <div style={{ background: "#f0fff0", borderBottom: "1.5px solid #a0d4a0", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>🎯</span>
          <span style={{ ...PG, color: "#2a6a2a", fontWeight: 700, letterSpacing: "0.08em" }}>PRESENTER MODE — 営業担当専用</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ ...PG, fontSize: 12 }}>{current + 1} / {total}</span>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.muted, textDecoration: "none", border: `1px solid ${C.border}`, padding: "6px 14px", borderRadius: 50, background: C.white }}>顧客画面 →</a>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: C.border, flexShrink: 0 }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${C.rose},${C.pink})`, width: `${((current + 1) / total) * 100}%`, transition: "width .3s ease" }} />
      </div>

      {/* Section tabs */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 24px", overflowX: "auto", flexShrink: 0, display: "flex" }}>
        {P_SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => go(i)} style={{ padding: "12px 16px", background: "none", border: "none", borderBottom: `2px solid ${i === current ? C.rose : "transparent"}`, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Noto Sans JP',sans-serif", fontSize: 12, color: i === current ? C.pink : C.muted, fontWeight: i === current ? 700 : 400, transition: "all .2s", flexShrink: 0 }}>
            <span style={{ opacity: 0.5, marginRight: 5 }}>{String(i + 1).padStart(2, "0")}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>

          {/* Section title */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: C.pink, letterSpacing: "0.2em", marginBottom: 8, fontFamily: "'Noto Sans JP',sans-serif" }}>
              {CUSTOMER_MAP[sec.id] ? "🔗 顧客画面と連動" : "📋 カンペのみ（顧客画面は動かない）"}
            </div>
            <h2 style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 24, fontWeight: 700, color: C.text }}>{sec.label}</h2>
          </div>

          {/* Script */}
          {sec.script && (
            <div style={{ background: "#f0fff0", border: "1.5px solid #a0d4a0", borderRadius: 14, padding: "22px 26px", fontFamily: "'Noto Sans JP',sans-serif", fontSize: 14, lineHeight: 2.2, color: "#2a4a2a", whiteSpace: "pre-wrap", marginBottom: 24 }}>
              {sec.script}
            </div>
          )}

          {/* BANT checklist */}
          {sec.bant && (
            <div>
              <div style={{ fontSize: 12, color: C.pink, letterSpacing: "0.15em", marginBottom: 14, fontFamily: "'Noto Sans JP',sans-serif" }}>BANT チェックリスト</div>
              {BANT.map((b, i) => (
                <div key={i} onClick={() => setBantChecked(p => { const n = [...p]; n[i] = !n[i]; return n; })} style={{ padding: "14px 18px", borderRadius: 12, border: `1.5px solid ${bantChecked[i] ? C.rose + "80" : C.border}`, background: bantChecked[i] ? "#fff5f3" : C.white, cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10, userSelect: "none", transition: "all .2s" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${bantChecked[i] ? C.rose : C.border}`, background: bantChecked[i] ? C.rose : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", transition: "all .2s" }}>{bantChecked[i] && "✓"}</div>
                  <div>
                    <div style={{ fontSize: 11, color: C.pink, letterSpacing: "0.1em", marginBottom: 4 }}>{b.label}</div>
                    <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{b.q}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Objections */}
          {sec.objections && (
            <div>
              <div style={{ fontSize: 12, color: C.pink, letterSpacing: "0.15em", marginBottom: 14, fontFamily: "'Noto Sans JP',sans-serif" }}>切り返しトーク</div>
              {OBJECTIONS.map((obj, i) => (
                <div key={i} onClick={() => setObjOpen(objOpen === i ? null : i)} style={{ borderRadius: 14, border: `1.5px solid ${objOpen === i ? C.rose + "80" : C.border}`, background: objOpen === i ? "#fff5f3" : C.white, cursor: "pointer", overflow: "hidden", marginBottom: 12, transition: "all .2s" }}>
                  <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 15, color: C.text, fontWeight: 700 }}>「{obj.label}」と言われたら</span>
                    <span style={{ color: C.pink, fontSize: 12 }}>{objOpen === i ? "▲" : "▼"}</span>
                  </div>
                  <div style={{ maxHeight: objOpen === i ? 300 : 0, overflow: "hidden", transition: "max-height .3s ease" }}>
                    <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}>
                      <div style={{ marginTop: 14, padding: "14px 18px", background: "#f0fff0", borderRadius: 10, borderLeft: "3px solid #a0d4a0", fontSize: 13, color: "#2a4a2a", lineHeight: 2 }}>{obj.response}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ background: C.white, borderTop: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <button onClick={() => go(current - 1)} disabled={current === 0} style={{ padding: "12px 28px", borderRadius: 50, border: `1.5px solid ${C.border}`, background: C.white, cursor: current === 0 ? "not-allowed" : "pointer", fontFamily: "'Noto Sans JP',sans-serif", fontSize: 14, color: current === 0 ? C.border : C.muted, transition: "all .2s" }}>
          ← 前へ
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ ...PG, fontSize: 12, marginBottom: 4 }}>← → キーでも操作できます</div>
          <div style={{ display: "flex", gap: 6 }}>
            {P_SECTIONS.map((_, i) => (
              <div key={i} onClick={() => go(i)} style={{ width: i === current ? 20 : 8, height: 8, borderRadius: 4, background: i === current ? C.rose : C.border, cursor: "pointer", transition: "all .3s" }} />
            ))}
          </div>
        </div>
        <button onClick={() => go(current + 1)} disabled={current === total - 1} style={{ padding: "12px 28px", borderRadius: 50, border: "none", background: current === total - 1 ? C.border : `linear-gradient(135deg,${C.rose},${C.pink})`, cursor: current === total - 1 ? "not-allowed" : "pointer", fontFamily: "'Noto Sans JP',sans-serif", fontSize: 14, color: "#fff", fontWeight: 500, transition: "all .2s" }}>
          次へ →
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════════
export default function App() {
  const [route, setRoute] = useState(getRoute());
  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Noto+Serif+JP:wght@400;700&family=Noto+Sans+JP:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:${C.bg};}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-thumb{background:#e8a4a0;border-radius:3px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
      `}</style>
      {route === "presenter" ? <PresenterView /> : <CustomerView />}
    </>
  );
}
