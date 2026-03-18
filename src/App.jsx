import { useState, useEffect, useRef } from "react";

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function useCounter(target, duration = 1600, trigger) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, target, duration]);
  return val;
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{
      fontFamily: "'Noto Sans JP', sans-serif",
      fontSize: 11, letterSpacing: "0.22em",
      color: "#c9657a", marginBottom: 8, fontWeight: 500,
    }}>{text}</div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: "'Noto Serif JP', serif",
      fontSize: "clamp(22px,3.5vw,34px)",
      fontWeight: 700, color: "#2a1a1a",
      lineHeight: 1.5, margin: "0 0 40px",
    }}>{children}</h2>
  );
}

function StatCard({ number, suffix, prefix = "", label, sub, delay, trigger }) {
  const val = useCounter(number, 1600, trigger);
  return (
    <Reveal delay={delay}>
      <div style={{
        background: "#fff",
        border: "1.5px solid #f2d0d0",
        borderRadius: 18,
        padding: "32px 20px",
        textAlign: "center",
        boxShadow: "0 4px 24px #e8847a12",
      }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(36px,5vw,52px)",
          fontWeight: 900,
          background: "linear-gradient(135deg,#e8847a,#c9657a)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
        }}>
          {prefix}{val}<span style={{ fontSize: "0.5em" }}>{suffix}</span>
        </div>
        <div style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 14, color: "#5a3a3a",
          marginTop: 10, fontWeight: 500,
        }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "#9a7a7a", marginTop: 4 }}>{sub}</div>}
      </div>
    </Reveal>
  );
}

export default function App() {
  const [statsRef, statsVisible] = useReveal(0.2);

  const C = {
    pink: "#c9657a", rose: "#e8847a",
    bg: "#fff8f6", bgAlt: "#fdf0f5",
    border: "#f2d0d0", text: "#2a1a1a", muted: "#7a5a5a",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Noto+Serif+JP:wght@400;700&family=Noto+Sans+JP:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:${C.bg};}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-thumb{background:#e8a4a0;border-radius:3px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{ color: C.text, fontFamily: "'Noto Sans JP', sans-serif" }}>

        {/* P1 COVER */}
        <section style={{
          minHeight: "100vh",
          display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center",
          textAlign: "center", padding: "80px 24px",
          background: "linear-gradient(145deg,#fff0ed 0%,#fde8f3 50%,#fef5ee 100%)",
          position: "relative", overflow: "hidden",
        }}>
          {[{w:480,h:480,top:-140,left:-160,c:"#f9c5c522"},{w:360,h:360,bottom:-100,right:-100,c:"#e8a4c022"},{w:200,h:200,top:"35%",right:"8%",c:"#ffd7cc28"}].map((d,i)=>(
            <div key={i} style={{position:"absolute",borderRadius:"50%",width:d.w,height:d.h,background:d.c,top:d.top,left:d.left,bottom:d.bottom,right:d.right,pointerEvents:"none"}}/>
          ))}
          <div style={{position:"relative",maxWidth:720}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:12,letterSpacing:"0.28em",color:C.pink,marginBottom:28,opacity:0,animation:"fadeUp 0.8s ease 0.2s forwards"}}>株式会社 aim-rose</div>
            <div style={{fontSize:"clamp(13px,2vw,15px)",color:C.muted,marginBottom:20,opacity:0,animation:"fadeUp 0.8s ease 0.35s forwards"}}>介護施設様向け</div>
            <h1 style={{fontFamily:"'Noto Serif JP',serif",fontSize:"clamp(32px,6vw,58px)",fontWeight:700,lineHeight:1.45,background:"linear-gradient(135deg,#e8847a,#c9657a)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",opacity:0,animation:"fadeUp 0.9s ease 0.5s forwards"}}>
              洋裁教室<br/>定期パッケージ
            </h1>
            <p style={{marginTop:28,fontSize:"clamp(15px,2.2vw,18px)",color:C.muted,lineHeight:2,opacity:0,animation:"fadeUp 0.9s ease 0.7s forwards"}}>ご入居者様の楽しみ・充実時間創造</p>
            <a href="#service" style={{display:"inline-block",marginTop:52,padding:"16px 44px",background:"linear-gradient(135deg,#e8847a,#c9657a)",color:"#fff",borderRadius:50,textDecoration:"none",fontSize:15,fontWeight:500,boxShadow:"0 10px 36px #e8847a38",opacity:0,animation:"fadeUp 1s ease 0.9s forwards",transition:"transform 0.2s,box-shadow 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 16px 44px #e8847a50";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 10px 36px #e8847a38";}}>
              サービス内容を見る ↓
            </a>
          </div>
        </section>

        {/* P2 サービスのご紹介 */}
        <section id="service" style={{background:"#fff",padding:"88px 24px"}}>
          <div style={{maxWidth:920,margin:"0 auto"}}>
            <Reveal><SectionLabel text="SERVICE OVERVIEW"/><SectionTitle>サービスのご紹介</SectionTitle></Reveal>
            <Reveal delay={0.05}><p style={{fontSize:16,color:C.muted,lineHeight:2,marginBottom:48}}>経験豊富な講師が介護施設様へ直接伺い、洋裁の楽しさをお届けします。</p></Reveal>
            <div ref={statsRef} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:20,marginBottom:40}}>
              <StatCard number={10} suffix="名" label="在籍講師数" delay={0} trigger={statsVisible}/>
              <StatCard number={350} suffix="名" prefix="300〜" label="現在の生徒様数" delay={0.1} trigger={statsVisible}/>
              <StatCard number={1} suffix="回〜" label="開催頻度（月）" sub="柔軟にご対応" delay={0.2} trigger={statsVisible}/>
              <StatCard number={2} suffix="対応" label="ミシン・手縫い" sub="施設環境に完全対応" delay={0.3} trigger={statsVisible}/>
            </div>
            <Reveal delay={0.2}>
              <div style={{background:"linear-gradient(135deg,#fff0ee,#fce8f3)",border:`1.5px solid ${C.border}`,borderRadius:18,padding:"28px 32px",display:"flex",gap:16,alignItems:"flex-start"}}>
                <div style={{fontSize:28,flexShrink:0}}>✂️</div>
                <div>
                  <div style={{fontWeight:700,marginBottom:6,fontSize:16}}>ミシン・手縫い 対応</div>
                  <div style={{fontSize:14,color:C.muted,lineHeight:1.9}}>ミシン持ち込みが困難な場合は手縫い中心の内容に切り替え可能。簡単制作〜小物づくりまで、ご入居者様の負担にならない内容構成。</div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* P3 市場ニーズとポジショニング */}
        <section style={{background:C.bgAlt,padding:"88px 24px"}}>
          <div style={{maxWidth:920,margin:"0 auto"}}>
            <Reveal><SectionLabel text="MARKET POSITIONING"/><SectionTitle>洋裁教室が選ばれる理由</SectionTitle></Reveal>
            <Reveal delay={0.1}>
              <div style={{background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:18,padding:"32px",marginBottom:32}}>
                <div style={{fontWeight:700,fontSize:16,color:C.pink,marginBottom:16}}>🏥 介護施設様の課題</div>
                <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10}}>
                  {["ご入居者様の楽しみづくり・手先を動かす活動の重要性が増大している","単発イベントから→継続的に楽しめるプログラムへのニーズが増加している"].map((t,i)=>(
                    <li key={i} style={{display:"flex",gap:12,alignItems:"flex-start",fontSize:15,color:C.muted,lineHeight:1.8}}>
                      <span style={{color:C.rose,marginTop:3,flexShrink:0}}>▶</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:20}}>
              {[
                {icon:"🎁",title:"完成物が残る",body:"形として手元に残る達成感",delay:0.0},
                {icon:"✨",title:"達成感がある",body:"制作完了時の充実感",delay:0.1},
                {icon:"💬",title:"会話が生まれる",body:"制作中の自然なコミュニケーション",delay:0.2},
                {icon:"😊",title:"満足度向上",body:"継続的な楽しみの提供",delay:0.3},
              ].map((f)=>(
                <Reveal key={f.title} delay={f.delay}>
                  <div style={{background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:18,padding:"28px 24px",textAlign:"center",boxShadow:"0 4px 20px #e8847a0e"}}>
                    <div style={{fontSize:40,marginBottom:12}}>{f.icon}</div>
                    <div style={{fontFamily:"'Noto Serif JP',serif",fontWeight:700,fontSize:17,color:C.text,marginBottom:8}}>{f.title}</div>
                    <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>{f.body}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* P4 選ばれる3つの理由 */}
        <section style={{background:"#fff",padding:"88px 24px"}}>
          <div style={{maxWidth:920,margin:"0 auto"}}>
            <Reveal><SectionLabel text="WHY CHOOSE US"/><SectionTitle>貴社メリット 3つのポイント</SectionTitle></Reveal>
            <div style={{display:"flex",flexDirection:"column",gap:24}}>
              {[
                {n:"1",title:"ご入居者様の負担にならない内容設計",body:"ミシン使用時も講師がしっかりサポート。手縫い中心の回もあり、どなたでも安心してご参加いただけます。",delay:0.0},
                {n:"2",title:"継続しやすいプログラム構成",body:"月1回等の定期開催により、ご入居者様の楽しみが増加。施設様としてもレク計画を立案しやすい仕組みです。",delay:0.1},
                {n:"3",title:"経験豊富な講師の対応力",body:"現在300名以上の生徒様を指導する実績ある講師陣が、参加人数・レベルに合わせ柔軟に進行します。",delay:0.2},
              ].map((r)=>(
                <Reveal key={r.n} delay={r.delay}>
                  <div style={{display:"flex",gap:28,alignItems:"flex-start",background:C.bgAlt,border:`1.5px solid ${C.border}`,borderRadius:20,padding:"32px 28px"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:64,fontWeight:900,color:C.border,lineHeight:1,minWidth:56,flexShrink:0}}>{r.n}</div>
                    <div>
                      <div style={{fontFamily:"'Noto Serif JP',serif",fontSize:19,fontWeight:700,color:C.text,marginBottom:10}}>{r.title}</div>
                      <p style={{fontSize:15,color:C.muted,lineHeight:1.9}}>{r.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* P5 基本サービス内容 */}
        <section style={{background:C.bgAlt,padding:"88px 24px"}}>
          <div style={{maxWidth:920,margin:"0 auto"}}>
            <Reveal><SectionLabel text="SERVICE DETAILS"/><SectionTitle>貴施設に合わせたオーダーメイド設計</SectionTitle></Reveal>
            <Reveal delay={0.1}>
              <div style={{background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:18,padding:"28px 32px",marginBottom:40}}>
                <div style={{fontWeight:700,fontSize:15,marginBottom:14,color:C.pink}}>🧵 制作物例</div>
                <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
                  {["トートバッグ","小物類"].map((item)=>(
                    <span key={item} style={{padding:"8px 20px",background:"linear-gradient(135deg,#fff0ee,#fce8f3)",border:`1px solid ${C.border}`,borderRadius:50,fontSize:14,color:C.pink,fontWeight:500}}>{item}</span>
                  ))}
                  <span style={{fontSize:13,color:C.muted}}>※施設様ご希望に合わせて調整可</span>
                </div>
              </div>
            </Reveal>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:20}}>
              {[
                {n:"1",icon:"📋",title:"ヒアリング",body:"参加人数・ご希望内容・開催頻度を確認し、プラン設計を行います。",delay:0.0},
                {n:"2",icon:"✏️",title:"プラン設計",body:"施設様の環境に合わせた内容を調整。ミシン不可の場合も完全対応。",delay:0.15},
                {n:"3",icon:"🎓",title:"定期開催",body:"継続的な洋裁教室を実施。月1回〜、施設様のペースに合わせます。",delay:0.3},
              ].map((s)=>(
                <Reveal key={s.n} delay={s.delay}>
                  <div style={{background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:18,padding:"32px 24px",textAlign:"center",position:"relative"}}>
                    <div style={{position:"absolute",top:16,right:20,fontFamily:"'Playfair Display',serif",fontSize:40,fontWeight:900,color:`${C.rose}20`}}>{s.n}</div>
                    <div style={{fontSize:36,marginBottom:14}}>{s.icon}</div>
                    <div style={{fontFamily:"'Noto Serif JP',serif",fontWeight:700,fontSize:17,color:C.text,marginBottom:10}}>{s.title}</div>
                    <p style={{fontSize:14,color:C.muted,lineHeight:1.9}}>{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.35}>
              <div style={{marginTop:32,background:"linear-gradient(135deg,#fff0ee,#fce8f3)",border:`1.5px solid ${C.border}`,borderRadius:14,padding:"20px 28px",fontSize:14,color:C.muted,lineHeight:1.8}}>
                <strong style={{color:C.pink}}>環境対応力：</strong>ミシン持ち込み困難時は手縫い中心内容に切り替え等、貴施設環境に完全対応。
              </div>
            </Reveal>
          </div>
        </section>

        {/* P6 実績紹介 */}
        <section style={{background:"#fff",padding:"88px 24px"}}>
          <div style={{maxWidth:920,margin:"0 auto"}}>
            <Reveal><SectionLabel text="TRACK RECORD"/><SectionTitle>多数の施設様から高評価</SectionTitle></Reveal>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:24}}>
              {[
                {icon:"👥",title:"300〜350名",sub:"継続通学中の個人教室生徒様",body:"個人向け教室での豊富な指導実績により培われた、確かな指導力・対応力で貴施設をサポートします。",delay:0.0},
                {icon:"🏠",title:"介護施設様での実績",sub:"多数の体験会・教室を実施",body:"完成物が残る活動として高満足度を獲得。施設様より「継続したい」のお声を多数いただいています。",delay:0.1},
                {icon:"🌏",title:"地域コミュニティでの実績",sub:"幅広い年齢層への指導経験",body:"幅広い年齢層への指導経験を活かした、きめ細かなサポートをご提供します。",delay:0.2},
              ].map((r)=>(
                <Reveal key={r.title} delay={r.delay}>
                  <div style={{background:C.bgAlt,border:`1.5px solid ${C.border}`,borderRadius:20,padding:"32px 28px",boxShadow:"0 4px 24px #e8847a0e"}}>
                    <div style={{fontSize:36,marginBottom:12}}>{r.icon}</div>
                    <div style={{fontFamily:"'Noto Serif JP',serif",fontWeight:700,fontSize:20,color:C.pink,marginBottom:4}}>{r.title}</div>
                    <div style={{fontSize:13,color:C.muted,marginBottom:16}}>{r.sub}</div>
                    <p style={{fontSize:14,color:C.muted,lineHeight:1.9}}>{r.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* P7 よくあるご質問 */}
        <section style={{background:C.bgAlt,padding:"88px 24px"}}>
          <div style={{maxWidth:800,margin:"0 auto"}}>
            <Reveal><SectionLabel text="FAQ"/><SectionTitle>よくあるご質問</SectionTitle></Reveal>
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              {[
                {q:"ミシンの持ち込みは必要ですか？",a:"ミシン必要な内容時は持ち込み可。手縫い中心内容への切り替えも可能です。貴施設環境に合わせて柔軟に対応いたします。",delay:0.0},
                {q:"参加人数が多くても対応できますか？",a:"講師1名での同時対応には限りがありますが、内容調整・複数回開催等で対応可能です。",delay:0.1},
                {q:"高齢の方でも参加できますか？",a:"負担の少ない内容に調整可能です。安心してご参加いただけるようサポートします。",delay:0.2},
                {q:"どんな制作物ができますか？",a:"トートバッグ・小物等、ご入居者様の負担にならない内容を中心にご提案。ご希望に合わせて調整可能です。",delay:0.3},
                {q:"単発での依頼はできますか？",a:"単発でのご依頼も可能です。ただし継続性が生まれやすい定期パッケージをお勧めしております。",delay:0.4},
              ].map((item)=>(
                <Reveal key={item.q} delay={item.delay}>
                  <div style={{background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:18,overflow:"hidden"}}>
                    <div style={{padding:"22px 28px",display:"flex",gap:16,alignItems:"flex-start",background:"linear-gradient(90deg,#fff0ee,#fff)",borderBottom:`1px solid ${C.border}`}}>
                      <span style={{color:C.pink,fontWeight:700,fontSize:18,flexShrink:0,marginTop:1}}>Q</span>
                      <span style={{fontFamily:"'Noto Serif JP',serif",fontSize:16,fontWeight:700,color:C.text}}>{item.q}</span>
                    </div>
                    <div style={{padding:"20px 28px",display:"flex",gap:16,alignItems:"flex-start"}}>
                      <span style={{color:C.rose,fontWeight:700,fontSize:18,flexShrink:0,marginTop:1}}>A</span>
                      <p style={{fontSize:15,color:C.muted,lineHeight:1.9}}>{item.a}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* P8 講師紹介 */}
        <section style={{background:"#fff",padding:"88px 24px"}}>
          <div style={{maxWidth:920,margin:"0 auto"}}>
            <Reveal><SectionLabel text="OUR INSTRUCTORS"/><SectionTitle>経験豊富な講師陣がサポート</SectionTitle></Reveal>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:20,marginBottom:40}}>
              {[
                {icon:"👩‍🏫",title:"300名以上",sub:"現在指導中の生徒様数",delay:0},
                {icon:"🏫",title:"10名",sub:"在籍講師数",delay:0.1},
                {icon:"🔄",title:"柔軟進行",sub:"多様ニーズに対応可",delay:0.2},
                {icon:"🏠",title:"施設対応",sub:"施設様に合わせた対応",delay:0.3},
              ].map((s)=>(
                <Reveal key={s.sub} delay={s.delay}>
                  <div style={{background:C.bgAlt,border:`1.5px solid ${C.border}`,borderRadius:18,padding:"28px 20px",textAlign:"center"}}>
                    <div style={{fontSize:36,marginBottom:10}}>{s.icon}</div>
                    <div style={{fontFamily:"'Noto Serif JP',serif",fontWeight:700,fontSize:22,background:"linear-gradient(135deg,#e8847a,#c9657a)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:6}}>{s.title}</div>
                    <div style={{fontSize:13,color:C.muted}}>{s.sub}</div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2}>
              <div style={{background:C.bgAlt,border:`1.5px solid ${C.border}`,borderRadius:18,padding:"32px"}}>
                <div style={{fontWeight:700,fontSize:15,color:C.pink,marginBottom:16}}>講師の特徴</div>
                <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:12}}>
                  {["300名以上の生徒様継続指導実績","参加人数・レベルに合わせた柔軟進行力","貴施設の雰囲気に合わせたコミュニケーション","幅広い年齢層への指導経験"].map((t,i)=>(
                    <li key={i} style={{display:"flex",gap:12,alignItems:"center",fontSize:15,color:C.muted}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:"linear-gradient(135deg,#e8847a,#c9657a)",flexShrink:0,display:"inline-block"}}/>
                      {t}
                    </li>
                  ))}
                </ul>
                <div style={{marginTop:24,paddingTop:24,borderTop:`1px solid ${C.border}`,fontSize:14,color:C.muted,lineHeight:1.9}}>
                  <strong style={{color:C.pink}}>安心の指導体制：</strong>個人教室での豊富な経験を活かし、ご入居者様一人ひとりに寄り添った丁寧な指導を行います。
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* P9 料金について */}
        <section style={{background:"linear-gradient(135deg,#e8847a,#c9657a)",padding:"88px 24px"}}>
          <div style={{maxWidth:860,margin:"0 auto"}}>
            <Reveal>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:12,letterSpacing:"0.25em",color:"rgba(255,255,255,0.7)",marginBottom:10}}>PRICING</div>
              <h2 style={{fontFamily:"'Noto Serif JP',serif",fontSize:"clamp(22px,3.5vw,34px)",fontWeight:700,color:"#fff",lineHeight:1.5,marginBottom:16}}>貴施設に最適なプランをご提案</h2>
              <p style={{fontSize:15,color:"rgba(255,255,255,0.85)",lineHeight:2,marginBottom:48}}>
                参加人数・開催頻度・制作内容により料金が変動するため、貴施設のご状況に合わせた個別お見積りで対応いたします。
              </p>
            </Reveal>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:16,marginBottom:48}}>
              {[
                {icon:"👩‍🏫",item:"講師料",note:"開催回数・時間により設定",delay:0.0},
                {icon:"🧵",item:"材料費",note:"制作物により変動",delay:0.1},
                {icon:"🚗",item:"交通費",note:"施設までの実費",delay:0.2},
                {icon:"🪡",item:"機材持込費",note:"必要な場合のみ",delay:0.3},
              ].map((p)=>(
                <Reveal key={p.item} delay={p.delay}>
                  <div style={{background:"rgba(255,255,255,0.2)",backdropFilter:"blur(8px)",borderRadius:16,padding:"24px 16px",textAlign:"center",border:"1px solid rgba(255,255,255,0.3)"}}>
                    <div style={{fontSize:32,marginBottom:8}}>{p.icon}</div>
                    <div style={{fontFamily:"'Noto Serif JP',serif",fontWeight:700,fontSize:16,color:"#fff",marginBottom:6}}>{p.item}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.75)"}}>{p.note}</div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.3}>
              <div style={{background:"#fff",borderRadius:20,padding:"40px",textAlign:"center"}}>
                <div style={{fontFamily:"'Noto Serif JP',serif",fontSize:20,fontWeight:700,color:C.text,marginBottom:12}}>まずはお気軽にご相談ください</div>
                <p style={{fontSize:15,color:C.muted,lineHeight:2,marginBottom:28}}>貴施設のご状況をお伺いし、最適なプランをご提案いたします。</p>
                <a href="mailto:info@aim-rose.co.jp" style={{display:"inline-block",padding:"16px 48px",background:"linear-gradient(135deg,#e8847a,#c9657a)",color:"#fff",borderRadius:50,textDecoration:"none",fontWeight:600,fontSize:16,boxShadow:"0 8px 32px #e8847a40",transition:"transform 0.2s,box-shadow 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 14px 40px #e8847a55";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 8px 32px #e8847a40";}}>
                  お問い合わせ・無料相談 →
                </a>
                <div style={{marginTop:20,fontSize:13,color:C.muted}}>株式会社aim-rose</div>
              </div>
            </Reveal>
          </div>
        </section>

      </div>
    </>
  );
}
