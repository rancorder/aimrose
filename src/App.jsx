import { useState, useEffect, useRef } from "react";

function getRoute() {
  return window.location.pathname === "/presenter" ? "presenter" : "customer";
}
const CHANNEL = "aim-rose-sync";
function useSyncSend() {
  const ch = useRef(null); const ready = useRef(false);
  useEffect(() => { ch.current = new BroadcastChannel(CHANNEL); ready.current = true; return () => { ch.current.close(); ready.current = false; }; }, []);
  const fn = useRef((payload) => { if (ready.current) ch.current.postMessage(payload); else setTimeout(() => ch.current?.postMessage(payload), 150); });
  return fn.current;
}
function useSyncReceive(onMessage) {
  useEffect(() => { const ch = new BroadcastChannel(CHANNEL); ch.onmessage = (e) => { if (e.data?.sectionId) onMessage(e.data); }; return () => ch.close(); }, [onMessage]);
}
function useReveal(threshold = 0.12) {
  const ref = useRef(null); const [v, setV] = useState(false);
  useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect(); }, []);
  return [ref, v];
}
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => { const obs = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }); }, { threshold: 0.3 }); ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); }); return () => obs.disconnect(); }, []);
  return active;
}
function R({ children, d = 0 }) {
  const [ref, v] = useReveal();
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(24px)", transition: `opacity .65s ease ${d}s, transform .65s ease ${d}s` }}>{children}</div>;
}

const C = { pink: "#c9657a", rose: "#e8847a", bg: "#fff8f6", bgAlt: "#fdf0f5", border: "#f2d0d0", text: "#2a1a1a", muted: "#7a5a5a", white: "#ffffff" };
const TARGET_COLORS = {
  nursing:      { main: "#e8847a", dark: "#c9657a", label: "老人ホーム向け" },
  kindergarten: { main: "#f4a261", dark: "#e76f51", label: "幼稚園・保育園向け" },
  event:        { main: "#2a9d8f", dark: "#1a7a6e", label: "イベント向け" },
};

function Card({ children, accent, style: s = {} }) {
  return <div style={{ background: C.white, border: `1.5px solid ${accent || C.border}`, borderRadius: 18, padding: "28px 24px", boxShadow: "0 4px 24px #e8847a0e", ...s }}>{children}</div>;
}
function H({ sub, children, center }) {
  return <R><div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", marginBottom: 40, textAlign: center ? "center" : "left" }}>{sub && <div style={{ fontFamily: "'Noto Sans JP',sans-serif", fontSize: 11, letterSpacing: "0.22em", color: C.pink, marginBottom: 8, fontWeight: 500 }}>{sub}</div>}<h2 style={{ fontFamily: "'Noto Serif JP',serif", fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, color: C.text, lineHeight: 1.5, margin: "0 0 40px" }}>{children}</h2></div></R>;
}
function Chip({ children }) {
  return <span style={{ display: "inline-block", padding: "6px 16px", background: "linear-gradient(135deg,#fff0ee,#fce8f3)", border: `1px solid ${C.border}`, borderRadius: 50, fontSize: 13, color: C.pink, fontWeight: 500, marginRight: 8, marginBottom: 6 }}>{children}</span>;
}
function QAItem({ q, a, delay }) {
  const [open, setOpen] = useState(false);
  return <R d={delay}><div style={{ borderRadius: 16, overflow: "hidden", border: `1.5px solid ${open ? C.rose + "80" : C.border}`, transition: "border-color .3s", marginBottom: 14 }}><button onClick={() => setOpen(o => !o)} style={{ width: "100%", padding: "18px 24px", background: open ? "#fff5f3" : C.white, border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, textAlign: "left" }}><div style={{ display: "flex", gap: 14, alignItems: "center" }}><span style={{ color: C.pink, fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, flexShrink: 0 }}>Q</span><span style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 15, color: C.text, lineHeight: 1.6 }}>{q}</span></div><span style={{ color: C.rose, fontSize: 13, transform: open ? "rotate(45deg)" : "none", transition: ".3s", flexShrink: 0 }}>＋</span></button><div style={{ maxHeight: open ? 400 : 0, overflow: "hidden", transition: "max-height .4s ease" }}><div style={{ padding: "20px 24px 24px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 14 }}><span style={{ color: C.rose, fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, flexShrink: 0 }}>A</span><p style={{ fontSize: 14, color: C.muted, lineHeight: 2, margin: 0 }}>{a}</p></div></div></div></R>;
}

// ═══════════════════════════════════════════════════════
// CONTENT
// ═══════════════════════════════════════════════════════
const CONTENT = {
  nursing: {
    visibleSections: ["intro","overview","classroom","position","usp","service","results","works","faq","pricing"],
    heroSub: "介護施設様向け", heroTitle: ["洋裁教室","定期パッケージ"], heroCatch: "ご入居者様の楽しみ・充実時間創造",
    stats: [{ n: "10名", label: "在籍講師数" },{ n: "300〜350名", label: "現在の生徒様数" },{ n: "月1回〜", label: "柔軟な開催頻度" },{ n: "ミシン・手縫い", label: "施設環境に対応" }],
    envNote: "ミシン環境のない場合は手縫い中心の内容に切り替え可能。簡単制作〜小物づくりまで、ご入居者様の負担にならない内容構成。",
    problemTitle: "介護施設様の課題", positionTitle: "洋裁教室が選ばれる理由",
    problems: ["ご入居者様の楽しみづくり・手先を動かす活動の重要性が増大している","単発イベントから→継続的に楽しめるプログラムへのニーズが増加している"],
    features: [{ title: "完成物が残る", body: "形として手元に残る達成感" },{ title: "達成感がある", body: "制作完了時の充実感" },{ title: "会話が生まれる", body: "制作中の自然なコミュニケーション" },{ title: "満足度向上", body: "継続的な楽しみの提供" }],
    uspTitle: "貴社メリット 3つのポイント",
    usps: [{ n: "1", title: "ご入居者様の負担にならない内容設計", body: "ミシンを使う場合でも講師がしっかりサポートし、手縫い中心の回もあるため、どなたでも安心してご参加いただけます。" },{ n: "2", title: "継続しやすいプログラム構成", body: "月1回等の定期開催により、ご入居者様の楽しみが増加。施設様としてもレクリエーション計画を立てやすい仕組みです。" },{ n: "3", title: "経験豊富な講師の対応力", body: "現在300名以上の生徒様を指導する実績ある講師陣が、参加人数・レベルに合わせ柔軟に進行します。" }],
    serviceTitle: "貴施設に合わせたオーダーメイド設計", makeItems: ["トートバッグ","小物類"],
    steps: [{ n: "1", title: "ヒアリング", body: "参加人数・ご希望内容・開催頻度を確認し、プランを設計します。" },{ n: "2", title: "プラン設計", body: "施設環境に合わせた内容調整。ミシン環境のない場合も完全対応。" },{ n: "3", title: "定期開催", body: "継続的な洋裁教室を実施。月1回〜、施設様のペースで。" }],
    hasClassroom: true, hasWorks: true, resultTitle: "多数の施設様から高評価",
    results: [{ title: "300〜350名", sub: "継続通学中の個人教室生徒様", body: "個人向け教室での豊富な実績により培われた確かな指導力で貴施設をサポートします。" },{ title: "「継続したい」のお声", sub: "施設様からの評価（多数）", body: "完成物が残る活動として高満足度を獲得。施設様より継続希望のお声を多数いただいています。" },{ title: "幅広い年齢層", sub: "地域コミュニティでの実績", body: "幅広い年齢層への指導経験を活かしたきめ細かなサポートをご提供します。" }],
    faqs: [{ q: "ミシンの持ち込みは必要ですか？", a: "ミシン必要な内容時は持ち込み可。ミシン環境のない場合は手縫い中心内容への切り替えも可能です。" },{ q: "参加人数が多くても対応できますか？", a: "内容調整・複数回開催等で対応可能です。" },{ q: "どんな制作物ができますか？", a: "トートバッグや小物等、ご入居者様の負担にならない内容を中心にご提案。" },{ q: "単発での依頼はできますか？", a: "可能ですが、継続性が生まれやすい定期パッケージをお勧めしております。" },{ q: "高齢の方でも参加できますか？", a: "はい、負担の少ない内容に調整できますのでご安心ください。" }],
  },

  kindergarten: {
    visibleSections: ["intro","challenge","positioning","ikupower","programs","kinder_proposal","kinder_events","reassurance","strengths","service_range","flow","faq","pricing"],
    heroSub: "幼稚園・保育園様向け 知育プログラム",
    heroTitle: ["“やってみたい！”を", "子どもの力に変える"],
    heroCatch: "先生の負担を増やさず、子どもの「育つ力」と笑顔を引き出す知育プログラム",
    positioningPre: "“裁縫教室”ではなく、",
    positioningEm: "“子どもの力が育つ知育プログラム”",
    positioningPost: "として導入できます。",
    ikuIntro: "「園が何かを教える」のではなく、「園が “育つ体験” を届ける」。子どもの “やってみたい！” という気持ちを起点に、楽しみながら自然と力が育つよう設計しています。",
    ikuPowers: [
      { icon: "💡", title: "創造力・発想力", body: "自由な発想で「自分だけの作品」を生み出す力が育ちます。", accent: "#f0a93a" },
      { icon: "🎨", title: "色彩感覚・表現力", body: "色や柄の組み合わせを楽しみながら、感性を育てます。", accent: "#e86fa0" },
      { icon: "✋", title: "指先の発達", body: "切る・貼る・縫う動作を通して、手先の巧緻性を育てます。", accent: "#3aa98c" },
      { icon: "🔍", title: "集中力", body: "夢中になって取り組むことで、自然と集中する力が身につきます。", accent: "#4a90d9" },
      { icon: "❤️", title: "達成感・自己肯定感", body: "完成した作品を見て「できた！」という自信につながります。", accent: "#e8615a" },
    ],
    programsIntro: "年齢・季節・行事に合わせて、複数の知育プログラムからお選びいただけます。針を使う本格派から、はさみとのりだけの安心メニューまで。",
    programs: [
      { icon: "👗", name: "お洋服デザイナー", tag: "針・アイロン不要", age: "年少〜年長", body: "切って・貼って・自由にデザイン。世界にひとつだけのオリジナルコーデをつくる造形あそび。" },
      { icon: "🧶", name: "ニット帽リメイク", tag: "子ども針にチャレンジ", age: "年中〜年長", body: "着なくなったセーターが帽子に変身。SDGsの心も育つ、本格リメイク体験。" },
      { icon: "🎀", name: "オリジナル小物づくり", tag: "年齢に合わせて調整", age: "全年齢対応", body: "巾着・ワッペン・布小物など。行事やテーマに合わせて自由にアレンジできます。" },
    ],
    flyers: [
      { src: "/flyers/clothing-designer.jpg", label: "お洋服デザイナープログラム", desc: "切って・貼って・自由にデザイン。針を使わず、年少さんから楽しめる造形あそび。" },
      { src: "/flyers/knit-remake.jpg", label: "ニット帽リメイクプログラム", desc: "着なくなったセーターが、世界にひとつのニット帽に。子ども針でチャレンジする本格リメイク。" },
    ],
    challenges: [
      { icon: "📅", text: "毎年似たような行事になってしまう" },
      { icon: "🤔", text: "保護者が参加しやすい企画を考えるのが難しい" },
      { icon: "⚠️", text: "子ども向けは安全面・準備面が不安" },
      { icon: "😓", text: "当日の運営負担が大きい" },
      { icon: "📣", text: "保護者への告知・巻き込みが難しい" },
      { icon: "📸", text: "写真・思い出に残る企画を作りたい" },
    ],
    participantValues: [
      { title: "自分で作った", body: "制作の達成感と自己肯定感" },
      { title: "家に持ち帰れる", body: "日常で使い続ける体験の延長" },
      { title: "写真に残せる", body: "アルバムに残る特別な瞬間" },
      { title: "会話が生まれる", body: "親子・参加者間の自然な交流" },
    ],
    organizerValues: [
      { title: "企画しやすい", body: "実績ある企画パッケージとして導入可能" },
      { title: "告知しやすい", body: "「親子でつくる○○」でそのまま告知文に" },
      { title: "当日運営しやすい", body: "進行台本・講師・材料がセット" },
      { title: "満足度が見えやすい", body: "完成品という具体的な成果が残る" },
    ],
    kinderUseCases: [
      "親子参加イベント・ふれあいデー",
      "入園・進級準備イベント",
      "季節行事（七夕・ハロウィン・クリスマス等）",
      "祖父母参観・敬老の日",
      "保護者会・保護者向けイベント",
      "園開放・未就園児向けイベント",
      "卒園前の思い出づくり",
    ],
    kinderEvents: [
      { title: "親子でつくるオリジナル巾着", target: "年少〜年長・保護者", time: "60〜90分", burden: "場所・人数連絡のみ", merit: "保護者との協力体験・毎日使える完成品" },
      { title: "入園準備 ネームタグ・ワッペンづくり", target: "新入園児・保護者", time: "45〜60分", burden: "場所・告知文のみ", merit: "入園不安の軽減・園への親しみ形成" },
      { title: "敬老の日 プレゼント布小物", target: "年中〜年長", time: "45分", burden: "場所のみ", merit: "祖父母へのプレゼント。感謝を形にできる" },
      { title: "卒園記念 思い出ミニバッグ", target: "年長・保護者", time: "90分", burden: "場所・日程のみ", merit: "卒園記念として特別感。保護者満足度が高い" },
      { title: "未就園児向け はじめての手づくり体験", target: "0〜3歳・保護者", time: "30〜45分", burden: "場所・人数のみ", merit: "入園前の来園理由になる。口コミ波及しやすい" },
    ],
    concerns: [
      { q: "針を使うのは危なくないか", a: "年齢に応じて針を使わない内容も設計可能。3〜4歳はシール・接着剤中心で対応します。" },
      { q: "子どもが飽きないか", a: "30〜45分で完成するキット設計。飽きる前に持ち帰れる構成です。" },
      { q: "先生の準備が増えないか", a: "材料・道具・進行台本はすべて講師側で用意。先生は場所と人数確認のみ。" },
      { q: "参加人数が多い場合どうするか", a: "少人数制・時間入替制で運営可能。グループ分け案も事前に設計します。" },
      { q: "保護者対応が大変では", a: "当日の説明・進行はすべて講師が担当。保護者からのQA対応も含みます。" },
      { q: "材料管理が面倒では", a: "材料はキット化して持参。終了後の片付けも講師が行います。" },
    ],
    faqs: [
      { q: "針を使う内容と使わない内容、どちらでも対応できますか？", a: "はい。年齢や安全面を考慮して、針を使わない接着剤・シール中心のメニューから、年長向けの簡単な手縫いまで対応可能です。" },
      { q: "少人数（5名程度）でも依頼できますか？", a: "はい、小規模から対応可能です。人数に合わせて内容・時間・価格を調整します。" },
      { q: "単発と定期開催、どちらでも可能ですか？", a: "どちらも対応可能です。まずは単発でお試しいただき、継続につなげていただく形が多いです。" },
      { q: "告知文やチラシ文面の作成も相談できますか？", a: "はい、告知文案・チラシ文面の作成もサポート可能です。保護者向けのご案内文もご用意します。" },
      { q: "保護者向けプログラムも対応できますか？", a: "はい、保護者様向けのワークショップや親子参加型プログラムも対応可能です。" },
    ],
  },

  event: {
    visibleSections: ["intro","challenge","positioning","event_proposal","event_cases","strengths","service_range","flow","faq","pricing"],
    heroSub: "商業施設・地域イベント向け",
    heroTitle: ["裁縫体験を", "来場の参加理由に"],
    heroCatch: "来場者が足を止め、作り、持ち帰り、思い出に残る時間をつくる",
    challenges: [
      { icon: "⏱️", text: "物販・抽選会だけでは滞在時間が伸びにくい" },
      { icon: "👨‍👩‍👧", text: "親子連れを長く留められる体験コンテンツがない" },
      { icon: "📸", text: "写真・SNSに残るような企画を作りたい" },
      { icon: "🔄", text: "イベントは実施して終わりになりやすい" },
      { icon: "😐", text: "毎回似たようなコンテンツになってしまう" },
      { icon: "🔗", text: "次回来場へつながる導線が作りにくい" },
    ],
    participantValues: [
      { title: "作品が残る", body: "参加者が持ち帰れる世界に一つの作品" },
      { title: "達成感・満足度", body: "自分で作り上げる喜びと充実感" },
      { title: "写真に残せる", body: "制作中・完成後にSNS映えする瞬間" },
      { title: "会話・交流", body: "制作を通じた自然なコミュニケーション" },
    ],
    organizerValues: [
      { title: "滞在時間が伸びる", body: "45〜90分の制作体験で会場に留まる" },
      { title: "告知コピーになる", body: "「親子でつくる○○」がそのまま集客文に" },
      { title: "当日運営しやすい", body: "材料・進行台本・講師がすべてセット" },
      { title: "次回導線につながる", body: "完成品が日常で使われ続けることで記憶に残る" },
    ],
    eventTargets: [
      { type: "商業施設", icon: "🏬", desc: "親子連れの滞在時間延長・回遊促進" },
      { type: "住宅展示場", icon: "🏡", desc: "家族来場促進・子どもを夢中にする間に商談" },
      { type: "地域イベント", icon: "🎪", desc: "参加者の満足度向上・思い出づくり" },
      { type: "企業ファミリーイベント", icon: "🏢", desc: "社員家族への体験・オリジナルノベルティ制作" },
      { type: "マルシェ・マーケット", icon: "🌿", desc: "ハンドメイド体験での差別化・回遊促進" },
      { type: "子育て支援イベント", icon: "👨‍👩‍👧", desc: "親子の創作体験・自然な交流促進" },
    ],
    eventCases: [
      { title: "親子でつくるミニトートバッグ", target: "商業施設・地域イベント", visitors: "3歳〜保護者", time: "45〜60分", merit: "日常で使える完成品。来場後もブランド接触が続く" },
      { title: "施設ロゴ入りワッペン体験", target: "商業施設・企業イベント", visitors: "幅広い年齢層", time: "30〜45分", merit: "施設名入りで特別感。SNS投稿されやすい" },
      { title: "季節限定 オーナメントづくり", target: "クリスマス・ハロウィン等", visitors: "親子全般", time: "30分", merit: "季節感×体験。飾れるため長期間記憶に残る" },
      { title: "住宅展示場向け おうち型布小物", target: "住宅展示場", visitors: "検討中のファミリー", time: "60分", merit: "子どもが夢中＝保護者が安心して商談できる時間確保" },
      { title: "母の日・父の日ギフト制作体験", target: "商業施設・地域イベント", visitors: "子ども・ファミリー", time: "45〜60分", merit: "贈る相手が決まっているため制作モチベーションが高い" },
    ],
    faqs: [
      { q: "当日の準備はどこまで対応してもらえますか？", a: "材料・道具・進行台本はすべて持参します。主催者側は会場と参加者数のご連絡のみで対応可能です。" },
      { q: "屋外イベントでも対応できますか？", a: "環境によりますが、手縫い中心のメニューであれば屋外でも対応可能です。事前にご相談ください。" },
      { q: "参加人数が多い場合は？", a: "時間入替制・複数ブース対応も可能です。規模に応じた運営プランを事前に設計します。" },
      { q: "SNS投稿向けの撮影スポットなども相談できますか？", a: "完成品を撮影しやすいディスプレイ設計も提案できます。告知用の写真撮影ポイントも含めてご相談ください。" },
      { q: "単発と複数回開催、どちらでも対応できますか？", a: "はい。単発のイベントから定期的なワークショップまで柔軟に対応いたします。" },
    ],
  },
};

const STRENGTHS_ROWS = [
  ["見るだけ", "作って持ち帰れる"],
  ["その場で終わる", "家に残る・日常で使える"],
  ["写真が弱い", "制作中・完成後に写真が撮れる"],
  ["子どもだけ参加", "親子で参加しやすい"],
  ["主催者が企画を考える", "企画パッケージとして導入可能"],
  ["記憶に残りにくい", "「自分で作った」記憶が残る"],
];

const PACKAGE_ITEMS = [
  { icon: "📋", title: "企画設計", body: "実施メニュー提案・内容調整" },
  { icon: "🧵", title: "材料・キット準備", body: "すべて持参。主催者の用意不要" },
  { icon: "👩‍🏫", title: "当日進行・講師派遣", body: "進行台本込みで対応" },
  { icon: "📢", title: "告知文案", body: "チラシ・SNS投稿文も含む" },
  { icon: "📊", title: "参加者アンケート案", body: "実施後の改善データ収集" },
  { icon: "📝", title: "実施後レポート", body: "次回開催提案まで含む" },
];

const FLOW_STEPS = [
  { n: "01", title: "事前ヒアリング", body: "対象・会場・人数・日程確認" },
  { n: "02", title: "企画メニュー決定", body: "内容・材料・進行タイムライン" },
  { n: "03", title: "告知・集客サポート", body: "告知文案・チラシ文面提供" },
  { n: "04", title: "当日実施", body: "材料持参・講師進行・全対応" },
  { n: "05", title: "完成品持ち帰り", body: "参加者アンケート収集" },
  { n: "06", title: "次回開催提案", body: "レポート・改善案・継続提案" },
];

// ═══════════════════════════════════════════════════════
// CUSTOMER_MAPS
// ═══════════════════════════════════════════════════════
const CUSTOMER_MAPS = {
  nursing: { intro:"intro",overview:"overview",classroom:"classroom",position:"position",usp:"usp",service:"service",results:"results",works:"works",faq:"faq",pricing:"pricing" },
  kindergarten: { intro:"intro",challenge:"challenge",positioning:"positioning",ikupower:"ikupower",programs:"programs",kinder_proposal:"kinder_proposal",kinder_events:"kinder_events",reassurance:"reassurance",strengths:"strengths",service_range:"service_range",flow:"flow",faq:"faq",pricing:"pricing" },
  event: { intro:"intro",challenge:"challenge",positioning:"positioning",event_proposal:"event_proposal",event_cases:"event_cases",strengths:"strengths",service_range:"service_range",flow:"flow",faq:"faq",pricing:"pricing" },
};

const ALL_SECTION_LABELS = {
  intro:"イントロ",overview:"サービス概要",classroom:"教室風景",position:"ポジショニング",usp:"USP",service:"基本サービス",results:"実績",works:"作品",
  challenge:"課題",positioning:"提案の位置づけ",ikupower:"育つ力",programs:"選べるプログラム",kinder_proposal:"園での活用",kinder_events:"具体イベント案",reassurance:"不安解消",
  event_proposal:"活用シーン",event_cases:"具体企画案",strengths:"この企画の強み",service_range:"提供範囲",flow:"実施の流れ",
  faq:"よくある質問",pricing:"料金",
};

// ═══════════════════════════════════════════════════════
// SECTION RENDERERS
// ═══════════════════════════════════════════════════════
function CSection({ id, bg, children }) {
  return <section id={id} style={{ padding: "88px 0", background: bg || C.bg, borderBottom: `1px solid ${C.border}` }}>{children}</section>;
}

function IntroSection({ content }) {
  return (
    <section id="intro" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "80px 24px", background: "linear-gradient(145deg,#fff0ed 0%,#fde8f3 50%,#fef5ee 100%)", borderBottom: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
      {[{w:480,h:480,top:-140,left:-160,c:"#f9c5c522"},{w:360,h:360,bottom:-100,right:-100,c:"#e8a4c022"},{w:200,h:200,top:"35%",right:"8%",c:"#ffd7cc28"}].map((d,i)=>(
        <div key={i} style={{position:"absolute",borderRadius:"50%",width:d.w,height:d.h,background:d.c,top:d.top,left:d.left,bottom:d.bottom,right:d.right,pointerEvents:"none"}}/>
      ))}
      <div style={{ position: "relative", maxWidth: 720 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, letterSpacing: "0.28em", color: C.pink, marginBottom: 28, opacity: 0, animation: "fadeUp .8s ease .2s forwards" }}>株式会社 aim-rose</div>
        <div style={{ fontSize: "clamp(13px,2vw,15px)", color: C.muted, marginBottom: 20, opacity: 0, animation: "fadeUp .8s ease .35s forwards" }}>{content.heroSub}</div>
        <h1 style={{ fontFamily: "'Noto Serif JP',serif", fontSize: "clamp(32px,6vw,58px)", fontWeight: 700, lineHeight: 1.45, background: `linear-gradient(135deg,${C.rose},${C.pink})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", opacity: 0, animation: "fadeUp .9s ease .5s forwards" }}>
          {content.heroTitle[0]}<br />{content.heroTitle[1]}
        </h1>
        <p style={{ marginTop: 28, fontSize: "clamp(15px,2.2vw,18px)", color: C.muted, lineHeight: 2, opacity: 0, animation: "fadeUp .9s ease .7s forwards" }}>{content.heroCatch}</p>
        <a href="#challenge" style={{ display: "inline-block", marginTop: 52, padding: "16px 44px", background: `linear-gradient(135deg,${C.rose},${C.pink})`, color: "#fff", borderRadius: 50, textDecoration: "none", fontSize: 15, fontWeight: 500, boxShadow: `0 10px 36px ${C.rose}38`, opacity: 0, animation: "fadeUp 1s ease .9s forwards", transition: "transform .2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
          onMouseLeave={e => e.currentTarget.style.transform = ""}>詳しく見る ↓</a>
      </div>
    </section>
  );
}

function NursingIntroSection({ content }) {
  return (
    <section id="intro" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "80px 24px", background: "linear-gradient(145deg,#fff0ed 0%,#fde8f3 50%,#fef5ee 100%)", borderBottom: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
      {[{w:480,h:480,top:-140,left:-160,c:"#f9c5c522"},{w:360,h:360,bottom:-100,right:-100,c:"#e8a4c022"},{w:200,h:200,top:"35%",right:"8%",c:"#ffd7cc28"}].map((d,i)=>(
        <div key={i} style={{position:"absolute",borderRadius:"50%",width:d.w,height:d.h,background:d.c,top:d.top,left:d.left,bottom:d.bottom,right:d.right,pointerEvents:"none"}}/>
      ))}
      <div style={{ position: "relative", maxWidth: 720 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, letterSpacing: "0.28em", color: C.pink, marginBottom: 28, opacity: 0, animation: "fadeUp .8s ease .2s forwards" }}>株式会社 aim-rose</div>
        <div style={{ fontSize: "clamp(13px,2vw,15px)", color: C.muted, marginBottom: 20, opacity: 0, animation: "fadeUp .8s ease .35s forwards" }}>{content.heroSub}</div>
        <h1 style={{ fontFamily: "'Noto Serif JP',serif", fontSize: "clamp(32px,6vw,58px)", fontWeight: 700, lineHeight: 1.45, background: `linear-gradient(135deg,${C.rose},${C.pink})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", opacity: 0, animation: "fadeUp .9s ease .5s forwards" }}>
          {content.heroTitle[0]}<br />{content.heroTitle[1]}
        </h1>
        <p style={{ marginTop: 28, fontSize: "clamp(15px,2.2vw,18px)", color: C.muted, lineHeight: 2, opacity: 0, animation: "fadeUp .9s ease .7s forwards" }}>{content.heroCatch}</p>
        <a href="#overview" style={{ display: "inline-block", marginTop: 52, padding: "16px 44px", background: `linear-gradient(135deg,${C.rose},${C.pink})`, color: "#fff", borderRadius: 50, textDecoration: "none", fontSize: 15, fontWeight: 500, boxShadow: `0 10px 36px ${C.rose}38`, opacity: 0, animation: "fadeUp 1s ease .9s forwards", transition: "transform .2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
          onMouseLeave={e => e.currentTarget.style.transform = ""}>サービス内容を見る ↓</a>
      </div>
    </section>
  );
}

function ChallengeSection({ content, W }) {
  return (
    <CSection id="challenge" bg={C.bgAlt}>
      <div style={W}>
        <H sub="CHALLENGES">よくある課題</H>
        <R d={0.05}><p style={{ fontSize: 15, color: C.muted, lineHeight: 2, marginBottom: 40 }}>まず、園やイベントを運営される担当者様が日々感じていらっしゃる課題から、整理させてください。</p></R>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
          {content.challenges.map((item, i) => (
            <R key={i} d={i * 0.07}>
              <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: "22px 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</span>
                <div style={{ fontFamily: "'Noto Sans JP',sans-serif", fontSize: 15, color: C.text, lineHeight: 1.7 }}>{item.text}</div>
              </div>
            </R>
          ))}
        </div>
        <R d={0.5}>
          <div style={{ marginTop: 40, padding: "24px 32px", background: "linear-gradient(135deg,#fff0ee,#fce8f3)", border: `1.5px solid ${C.border}`, borderRadius: 16, textAlign: "center" }}>
            <div style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8 }}>これらの課題に対して、裁縫体験は意外な解決策になります。</div>
            <div style={{ fontSize: 14, color: C.muted }}>次のスライドで、本提案の位置づけをご説明します。</div>
          </div>
        </R>
      </div>
    </CSection>
  );
}

function PositioningSection({ content, W }) {
  return (
    <CSection id="positioning" bg={C.white}>
      <div style={W}>
        <H sub="OUR POSITIONING">本提案の位置づけ</H>
        <R d={0.05}>
          <div style={{ background: "linear-gradient(135deg,#fff0ee,#fce8f3)", border: `2px solid ${C.rose}40`, borderRadius: 20, padding: "32px 40px", textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: "'Noto Serif JP',serif", fontSize: "clamp(18px,3vw,26px)", fontWeight: 700, color: C.text, lineHeight: 1.7 }}>
              {content.positioningPre ?? '"教室"ではなく、'}<span style={{ color: C.rose }}>{content.positioningEm ?? '"参加したくなる体験企画"'}</span>{content.positioningPost ?? "として導入できます。"}
            </div>
          </div>
        </R>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(400px,1fr))", gap: 32 }}>
          <R d={0.1}>
            <div style={{ background: C.bgAlt, border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "28px" }}>
              <div style={{ fontFamily: "'Noto Sans JP',sans-serif", fontSize: 13, color: C.pink, letterSpacing: "0.12em", marginBottom: 20, fontWeight: 500 }}>参加者（子ども・保護者）にとって</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {content.participantValues.map((v, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: `linear-gradient(135deg,${C.rose},${C.pink})`, flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{v.title}</span>
                      <span style={{ fontSize: 13, color: C.muted, marginLeft: 8 }}>— {v.body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </R>
          <R d={0.2}>
            <div style={{ background: C.bgAlt, border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "28px" }}>
              <div style={{ fontFamily: "'Noto Sans JP',sans-serif", fontSize: 13, color: C.pink, letterSpacing: "0.12em", marginBottom: 20, fontWeight: 500 }}>主催者（園・イベント担当者）にとって</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {content.organizerValues.map((v, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: `linear-gradient(135deg,${C.rose},${C.pink})`, flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{v.title}</span>
                      <span style={{ fontSize: 13, color: C.muted, marginLeft: 8 }}>— {v.body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </R>
        </div>
      </div>
    </CSection>
  );
}

function KinderProposalSection({ content, W }) {
  return (
    <CSection id="kinder_proposal" bg={C.bgAlt}>
      <div style={W}>
        <H sub="FOR KINDERGARTENS">園行事に"保護者が喜ぶ体験"を追加する</H>
        <R d={0.05}><p style={{ fontSize: 15, color: C.muted, lineHeight: 2, marginBottom: 40 }}>幼稚園・保育園では、以下のような場面で自然に活用できます。重要なのは「園が裁縫を教える」のではなく、<strong style={{ color: C.pink }}>園が"思い出に残る体験機会"を提供する</strong>という発想です。</p></R>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          {content.kinderUseCases.map((item, i) => (
            <R key={i} d={i * 0.08}>
              <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: `linear-gradient(135deg,${C.rose},${C.pink})`, flexShrink: 0 }} />
                <div style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 15, color: C.text }}>{item}</div>
              </div>
            </R>
          ))}
        </div>
      </div>
    </CSection>
  );
}

function KinderEventsSection({ content, W }) {
  return (
    <CSection id="kinder_events" bg={C.white}>
      <div style={W}>
        <H sub="EVENT IDEAS">具体的なイベント案</H>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {content.kinderEvents.map((ev, i) => (
            <R key={i} d={i * 0.1}>
              <div style={{ background: C.bgAlt, border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "24px 28px" }}>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 12 }}>{ev.title}</div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 6, lineHeight: 1.7 }}><strong style={{ color: C.pink }}>✓</strong> {ev.merit}</div>
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
                    {[["対象", ev.target],["所要時間", ev.time],["主催者負担", ev.burden]].map(([label, val]) => (
                      <div key={label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 14px", textAlign: "center", minWidth: 100 }}>
                        <div style={{ fontSize: 10, color: C.muted, marginBottom: 3, letterSpacing: "0.08em" }}>{label}</div>
                        <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </R>
          ))}
        </div>
      </div>
    </CSection>
  );
}

function ReassuranceSection({ content, W }) {
  return (
    <CSection id="reassurance" bg={C.bgAlt}>
      <div style={W}>
        <H sub="PEACE OF MIND">園側の不安を先回りして解決します</H>
        <R d={0.05}><p style={{ fontSize: 15, color: C.muted, lineHeight: 2, marginBottom: 40 }}>「楽しそう」より先に、担当者様が感じる不安があります。それぞれに対して、実務的にお答えします。</p></R>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 16 }}>
          {content.concerns.map((item, i) => (
            <R key={i} d={i * 0.08}>
              <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "16px 22px", background: "linear-gradient(90deg,#fff0ee,#fff)", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: C.rose, fontWeight: 700, fontSize: 16, flexShrink: 0 }}>❓</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.6 }}>{item.q}</div>
                </div>
                <div style={{ padding: "16px 22px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>✓</span>
                  <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.8 }}>{item.a}</div>
                </div>
              </div>
            </R>
          ))}
        </div>
      </div>
    </CSection>
  );
}

function KinderIkuPowerSection({ content, W }) {
  return (
    <CSection id="ikupower" bg={C.white}>
      <div style={W}>
        <H sub="WHY IT MATTERS">遊びながら、子どもの「育つ力」が伸びる</H>
        <R d={0.05}><p style={{ fontSize: 15, color: C.muted, lineHeight: 2, marginBottom: 40 }}>{content.ikuIntro}</p></R>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
          {content.ikuPowers.map((p, i) => (
            <R key={p.title} d={i * 0.08}>
              <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "28px 24px", height: "100%", borderTop: `4px solid ${p.accent}`, boxShadow: "0 4px 24px #e8847a0e" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${p.accent}1a`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16 }}>{p.icon}</div>
                <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 10 }}>{p.title}</div>
                <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.9, margin: 0 }}>{p.body}</p>
              </div>
            </R>
          ))}
        </div>
        <R d={0.45}>
          <div style={{ marginTop: 36, padding: "24px 32px", background: "linear-gradient(135deg,#fff0ee,#fce8f3)", border: `1.5px solid ${C.border}`, borderRadius: 16, textAlign: "center" }}>
            <div style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 17, fontWeight: 700, color: C.text, lineHeight: 1.7 }}>「楽しかった！」の先に、ちゃんと “育ち” が残る。</div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 8 }}>だから保護者にも、園にも喜ばれる活動になります。</div>
          </div>
        </R>
      </div>
    </CSection>
  );
}

function KinderProgramsSection({ content, W }) {
  return (
    <CSection id="programs" bg={C.bgAlt}>
      <div style={W}>
        <H sub="PROGRAM LINEUP">園に合わせて、選べる知育プログラム</H>
        <R d={0.05}><p style={{ fontSize: 15, color: C.muted, lineHeight: 2, marginBottom: 36 }}>{content.programsIntro}</p></R>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginBottom: 48 }}>
          {content.programs.map((p, i) => (
            <R key={p.name} d={i * 0.1}>
              <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "26px 24px", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 32 }}>{p.icon}</span>
                  <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 17, color: C.text }}>{p.name}</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  <span style={{ fontSize: 11, color: C.pink, background: "linear-gradient(135deg,#fff0ee,#fce8f3)", border: `1px solid ${C.border}`, borderRadius: 50, padding: "4px 12px", fontWeight: 500 }}>{p.tag}</span>
                  <span style={{ fontSize: 11, color: C.muted, background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: 50, padding: "4px 12px" }}>{p.age}</span>
                </div>
                <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.9, margin: 0 }}>{p.body}</p>
              </div>
            </R>
          ))}
        </div>
        <R d={0.1}><div style={{ fontFamily: "'Noto Sans JP',sans-serif", fontSize: 12, letterSpacing: "0.18em", color: C.pink, marginBottom: 18, fontWeight: 500, textAlign: "center" }}>PROGRAM EXAMPLES</div></R>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
          {content.flyers.map((f, i) => (
            <R key={f.label} d={i * 0.12}>
              <div style={{ borderRadius: 18, overflow: "hidden", border: `1.5px solid ${C.border}`, background: C.white, boxShadow: "0 6px 28px #e8847a14" }}>
                <a href={f.src} target="_blank" rel="noopener noreferrer" style={{ display: "block", position: "relative" }}>
                  <img src={f.src} alt={f.label} style={{ width: "100%", display: "block" }} />
                  <span style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(42,26,26,0.7)", color: "#fff", fontSize: 11, padding: "5px 12px", borderRadius: 50, backdropFilter: "blur(4px)" }}>タップで拡大 ⤢</span>
                </a>
                <div style={{ padding: "18px 22px" }}>
                  <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 6 }}>{f.label}</div>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            </R>
          ))}
        </div>
        <R d={0.4}>
          <div style={{ marginTop: 32, padding: "20px 28px", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 14, color: C.muted, lineHeight: 1.9, textAlign: "center" }}>
            ここに挙げたのは一例です。<strong style={{ color: C.pink }}>園のテーマや行事に合わせて、内容はいくらでもアレンジできます。</strong><br />「こんなことできる？」というご相談から一緒に考えます。
          </div>
        </R>
      </div>
    </CSection>
  );
}

function EventProposalSection({ content, W }) {
  return (
    <CSection id="event_proposal" bg={C.bgAlt}>
      <div style={W}>
        <H sub="WHERE TO USE IT">来場者が"滞在したくなる"体験コンテンツとして使える</H>
        <R d={0.05}><p style={{ fontSize: 15, color: C.muted, lineHeight: 2, marginBottom: 40 }}>以下のような場面で、来場者の体験価値を高めるコンテンツとして活用できます。</p></R>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          {content.eventTargets.map((item, i) => (
            <R key={i} d={i * 0.08}>
              <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: "24px 22px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 10 }}>{item.type}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            </R>
          ))}
        </div>
      </div>
    </CSection>
  );
}

function EventCasesSection({ content, W }) {
  return (
    <CSection id="event_cases" bg={C.white}>
      <div style={W}>
        <H sub="EVENT IDEAS">具体的な企画案</H>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {content.eventCases.map((ev, i) => (
            <R key={i} d={i * 0.1}>
              <div style={{ background: C.bgAlt, border: `1.5px solid ${C.border}`, borderRadius: 18, padding: "24px 28px" }}>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 12 }}>{ev.title}</div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 6, lineHeight: 1.7 }}><strong style={{ color: C.pink }}>✓</strong> {ev.merit}</div>
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
                    {[["対象場所", ev.target],["参加者", ev.visitors],["所要時間", ev.time]].map(([label, val]) => (
                      <div key={label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 14px", textAlign: "center", minWidth: 100 }}>
                        <div style={{ fontSize: 10, color: C.muted, marginBottom: 3, letterSpacing: "0.08em" }}>{label}</div>
                        <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </R>
          ))}
        </div>
      </div>
    </CSection>
  );
}

function StrengthsSection({ content, W }) {
  return (
    <CSection id="strengths" bg={C.bgAlt}>
      <div style={W}>
        <H sub="WHY THIS WORKS">この企画が強い理由</H>
        <R d={0.05}>
          <div style={{ borderRadius: 18, overflow: "hidden", border: `1.5px solid ${C.border}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ padding: "16px 28px", background: C.bgAlt, textAlign: "center", fontWeight: 700, fontSize: 13, color: C.muted, borderBottom: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }}>一般的なイベント</div>
              <div style={{ padding: "16px 28px", background: "linear-gradient(135deg,#fff0ee,#fce8f3)", textAlign: "center", fontWeight: 700, fontSize: 13, color: C.pink, borderBottom: `1px solid ${C.border}` }}>裁縫体験イベント</div>
            </div>
            {STRENGTHS_ROWS.map(([left, right], i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ padding: "14px 28px", fontSize: 14, color: C.muted, borderBottom: i < STRENGTHS_ROWS.length - 1 ? `1px solid ${C.border}` : "none", borderRight: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : C.bgAlt }}>{left}</div>
                <div style={{ padding: "14px 28px", fontSize: 14, color: C.text, fontWeight: 500, borderBottom: i < STRENGTHS_ROWS.length - 1 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? "#fff5f3" : "#fce8f3", borderLeft: `3px solid ${C.rose}` }}>{right}</div>
              </div>
            ))}
          </div>
        </R>
        <R d={0.3}>
          <div style={{ marginTop: 28, padding: "20px 28px", background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 14, color: C.muted, lineHeight: 1.9 }}>
            <strong style={{ color: C.pink }}>ただし、</strong>「必ず集客できます」「必ず満足度が上がります」という保証はできません。参加者構成・会場環境・告知方法によって結果は異なります。まずは小規模なテスト開催からご相談ください。
          </div>
        </R>
      </div>
    </CSection>
  );
}

function ServiceRangeSection({ content, W }) {
  return (
    <CSection id="service_range" bg={C.white}>
      <div style={W}>
        <H sub="WHAT WE PROVIDE">提供範囲</H>
        <R d={0.05}><p style={{ fontSize: 15, color: C.muted, lineHeight: 2, marginBottom: 40 }}>主催者側の負担を減らしながら実施しやすい形に整えます。完全にお任せというよりも、<strong style={{ color: C.pink }}>主催者が"判断するだけ"で動ける状態</strong>を目指します。</p></R>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
          {PACKAGE_ITEMS.map((item, i) => (
            <R key={i} d={i * 0.08}>
              <div style={{ background: C.bgAlt, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: "24px 22px" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{item.body}</div>
              </div>
            </R>
          ))}
        </div>
      </div>
    </CSection>
  );
}

function FlowSection({ content, W }) {
  return (
    <CSection id="flow" bg={C.bgAlt}>
      <div style={W}>
        <H sub="HOW IT WORKS">実施の流れ</H>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16 }}>
          {FLOW_STEPS.map((step, i) => (
            <R key={i} d={i * 0.08}>
              <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: "24px 18px", textAlign: "center", position: "relative" }}>
                {i < FLOW_STEPS.length - 1 && (
                  <div style={{ position: "absolute", top: "50%", right: -20, transform: "translateY(-50%)", color: C.border, fontSize: 20, zIndex: 1 }}>→</div>
                )}
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: `${C.rose}30`, marginBottom: 8 }}>{step.n}</div>
                <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>{step.body}</div>
              </div>
            </R>
          ))}
        </div>
        <R d={0.5}>
          <div style={{ marginTop: 32, padding: "20px 28px", background: "linear-gradient(135deg,#fff0ee,#fce8f3)", border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 14, color: C.muted, lineHeight: 1.9, textAlign: "center" }}>
            まずは既存行事・既存イベントに組み込めるか確認してみましょう。<br />
            小規模なテスト開催から相談可能です。
          </div>
        </R>
      </div>
    </CSection>
  );
}

function NursingOverviewSection({ content, W }) {
  return (
    <CSection id="overview" bg={C.white}>
      <div style={W}>
        <H sub="SERVICE OVERVIEW">サービスのご紹介</H>
        <R d={0.05}><p style={{ fontSize: 16, color: C.muted, lineHeight: 2, marginBottom: 40 }}>経験豊富な講師が介護施設様へ直接伺い、洋裁の楽しさをお届けします。</p></R>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 20, marginBottom: 32 }}>
          {content.stats.map((s, i) => (
            <R key={s.label} d={i * 0.1}><Card>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, background: `linear-gradient(135deg,${C.rose},${C.pink})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 13, color: C.muted }}>{s.label}</div>
            </Card></R>
          ))}
        </div>
        <R d={0.35}><div style={{ padding: "20px 28px", background: "linear-gradient(135deg,#fff0ee,#fce8f3)", border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 14, color: C.muted, lineHeight: 1.9 }}><strong style={{ color: C.pink }}>環境対応力：</strong>{content.envNote}</div></R>
      </div>
    </CSection>
  );
}

function FaqSection({ content, W }) {
  return (
    <CSection id="faq" bg={C.bgAlt}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
        <H sub="FAQ">よくあるご質問</H>
        {content.faqs.map((item, i) => <QAItem key={item.q} q={item.q} a={item.a} delay={i * 0.05} />)}
      </div>
    </CSection>
  );
}

function PricingSection({ W }) {
  return (
    <section id="pricing" style={{ background: C.bg, padding: "88px 0" }}>
      <div style={W}>
        <H sub="PRICING">料金プラン</H>
        <R d={0.05}><p style={{ fontSize: 14, color: C.muted, lineHeight: 2, marginBottom: 40 }}>※ 想定参加人数10名のプランです。人数が異なる場合はお気軽にご相談ください。</p></R>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20, marginBottom: 32 }}>
          {[{ name: "お試しプラン", duration: "1回", price: "40,000", note: "まずはお試しで", highlight: false },{ name: "3ヶ月プラン", duration: "3ヶ月", price: "180,000", note: "月60,000円相当", highlight: false },{ name: "6ヶ月プラン", duration: "6ヶ月", price: "330,000", note: "月55,000円相当", highlight: true },{ name: "1年プラン", duration: "12ヶ月", price: "600,000", note: "月50,000円相当", highlight: false }].map((plan, i) => (
            <R key={plan.name} d={i * 0.1}>
              <div style={{ borderRadius: 20, border: plan.highlight ? `2px solid ${C.rose}` : `1.5px solid ${C.border}`, background: plan.highlight ? "linear-gradient(160deg,#fff0ee,#fce8f3)" : C.white, padding: "32px 20px", textAlign: "center", position: "relative", boxShadow: plan.highlight ? `0 8px 40px ${C.rose}20` : "none" }}>
                {plan.highlight && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg,${C.rose},${C.pink})`, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: 50, whiteSpace: "nowrap" }}>人気プラン</div>}
                <div style={{ fontSize: 12, color: C.pink, letterSpacing: "0.12em", marginBottom: 10, fontWeight: 500 }}>{plan.name}</div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>{plan.duration}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,38px)", fontWeight: 900, background: `linear-gradient(135deg,${C.rose},${C.pink})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>¥{plan.price}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>{plan.note}</div>
              </div>
            </R>
          ))}
        </div>
        <R d={0.4}><div style={{ padding: "20px 28px", background: "linear-gradient(135deg,#fff0ee,#fce8f3)", border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 14, color: C.muted, lineHeight: 1.9, marginBottom: 40 }}><strong style={{ color: C.pink }}>人数追加・カスタマイズ：</strong>参加人数が10名を超える場合や、開催頻度・内容のご要望は、別途ご相談のうえ柔軟に対応いたします。</div></R>
        <R d={0.5}>
          <div style={{ background: `linear-gradient(135deg,${C.rose},${C.pink})`, borderRadius: 24, padding: "48px 40px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 }}>まずはお気軽にご相談ください</div>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 2, marginBottom: 28 }}>貴施設のご状況をお伺いし、最適なプランをご提案いたします。</p>
            <a href="mailto:aimrose.dm@gmail.com" style={{ display: "inline-block", padding: "16px 48px", background: "#fff", color: C.pink, borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", transition: "transform .2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={e => e.currentTarget.style.transform = ""}>お問い合わせ・無料相談 →</a>
            <div style={{ marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>株式会社aim-rose｜aimrose.dm@gmail.com</div>
          </div>
        </R>
      </div>
    </section>
  );
}

// Nursing-specific sections
function NursingPositionSection({ content, W }) {
  return (
    <CSection id="position" bg={C.bgAlt}>
      <div style={W}>
        <H sub="MARKET POSITIONING">{content.positionTitle}</H>
        <R d={0.1}><Card style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: C.pink, letterSpacing: "0.12em", marginBottom: 14, fontWeight: 500 }}>{content.problemTitle}</div>
          {content.problems.map((t, i) => <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, fontSize: 14, color: C.muted, lineHeight: 1.8 }}><span style={{ color: C.rose, flexShrink: 0, marginTop: 3 }}>▶</span>{t}</div>)}
        </Card></R>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          {content.features.map((f, i) => <R key={f.title} d={i * 0.1}><Card style={{ textAlign: "center" }}><div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 8 }}>{f.title}</div><div style={{ fontSize: 13, color: C.muted }}>{f.body}</div></Card></R>)}
        </div>
      </div>
    </CSection>
  );
}
function NursingUspSection({ content, W }) {
  return (
    <CSection id="usp" bg={C.white}>
      <div style={W}>
        <H sub="WHY CHOOSE US">{content.uspTitle}</H>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {content.usps.map((r, i) => <R key={r.n} d={i * 0.1}><div style={{ display: "flex", gap: 28, alignItems: "flex-start", background: C.bgAlt, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: "32px 28px" }}><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 64, fontWeight: 900, color: C.border, lineHeight: 1, minWidth: 56, flexShrink: 0 }}>{r.n}</div><div><div style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 19, fontWeight: 700, color: C.text, marginBottom: 10 }}>{r.title}</div><p style={{ fontSize: 15, color: C.muted, lineHeight: 1.9 }}>{r.body}</p></div></div></R>)}
        </div>
      </div>
    </CSection>
  );
}
function NursingServiceSection({ content, W }) {
  return (
    <CSection id="service" bg={C.bgAlt}>
      <div style={W}>
        <H sub="SERVICE DETAILS">{content.serviceTitle}</H>
        <R d={0.1}><Card style={{ marginBottom: 32 }}><div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: C.pink }}>制作物例</div><div style={{ display: "flex", flexWrap: "wrap" }}>{content.makeItems.map(item => <Chip key={item}>{item}</Chip>)}<span style={{ fontSize: 13, color: C.muted, alignSelf: "center" }}>※ご希望に合わせて調整可</span></div></Card></R>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          {content.steps.map((s, i) => <R key={s.n} d={i * 0.15}><Card style={{ textAlign: "center", position: "relative" }}><div style={{ position: "absolute", top: 14, right: 18, fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 900, color: `${C.rose}20` }}>{s.n}</div><div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 10 }}>{s.title}</div><p style={{ fontSize: 14, color: C.muted, lineHeight: 1.9 }}>{s.body}</p></Card></R>)}
        </div>
      </div>
    </CSection>
  );
}
function NursingResultsSection({ content, W }) {
  return (
    <CSection id="results" bg={C.white}>
      <div style={W}>
        <H sub="TRACK RECORD">{content.resultTitle}</H>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
          {content.results.map((r, i) => <R key={r.title} d={i * 0.1}><div style={{ background: C.bgAlt, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: "32px 28px" }}><div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 20, color: C.pink, marginBottom: 4 }}>{r.title}</div><div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>{r.sub}</div><p style={{ fontSize: 14, color: C.muted, lineHeight: 1.9 }}>{r.body}</p></div></R>)}
        </div>
      </div>
    </CSection>
  );
}
function NursingClassroomSection({ W }) {
  return (
    <CSection id="classroom" bg={C.bgAlt}>
      <div style={W}>
        <H sub="CLASS SCENE">実際の教室風景</H>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {[{ src: "/classroom/class1.jpg", label: "丁寧な指導", desc: "一人ひとりのペースに合わせて、講師が丁寧にご説明します。" },{ src: "/classroom/class2.jpg", label: "賑やかな教室", desc: "布を囲みながら自然に会話が弾みます。笑顔があふれる時間です。" },{ src: "/classroom/class3.jpg", label: "布選びのサポート", desc: "好みの布を一緒に選ぶところから楽しんでいただけます。" }].map((item, i) => (
            <R key={item.label} d={i * 0.1}>
              <div style={{ borderRadius: 18, overflow: "hidden", border: `1.5px solid ${C.border}`, background: C.white }}>
                <div style={{ aspectRatio: "4/3", overflow: "hidden" }}><img src={item.src} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .4s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} /></div>
                <div style={{ padding: "18px 22px" }}><div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 6 }}>{item.label}</div><p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>{item.desc}</p></div>
              </div>
            </R>
          ))}
        </div>
      </div>
    </CSection>
  );
}
function NursingWorksSection({ W }) {
  return (
    <CSection id="works" bg={C.white}>
      <div style={W}>
        <H sub="GALLERY">制作物ギャラリー</H>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
          {[{ src: "/works/work1.png", label: "眼鏡ケース", desc: "和柄生地を使ったオリジナル眼鏡ケース。マグネットボタン付き。" },{ src: "/works/work2.png", label: "巾着袋", desc: "リボン結びが華やかな巾着袋。プレゼントにも喜ばれています。" }].map((item, i) => (
            <R key={item.label} d={i * 0.1}>
              <div style={{ borderRadius: 18, overflow: "hidden", border: `1.5px solid ${C.border}`, background: C.white }}>
                <div style={{ aspectRatio: "3/4", overflow: "hidden", background: C.bgAlt }}><img src={item.src} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .4s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} /></div>
                <div style={{ padding: "20px 22px" }}><div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 6 }}>{item.label}</div><p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>{item.desc}</p></div>
              </div>
            </R>
          ))}
        </div>
      </div>
    </CSection>
  );
}

// ═══════════════════════════════════════════════════════
// CUSTOMER VIEW
// ═══════════════════════════════════════════════════════
function Sidebar({ active, visibleSections }) {
  const [open, setOpen] = useState(false);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, height: "100vh", width: open ? 220 : 48, background: C.white, borderRight: `1px solid ${C.border}`, zIndex: 100, transition: "width .35s", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "2px 0 12px #f2d0d040" }}>
      <button onClick={() => setOpen(o => !o)} style={{ padding: "16px", background: "none", border: "none", cursor: "pointer", color: C.pink, fontSize: 18, textAlign: "left", flexShrink: 0 }}>{open ? "←" : "☰"}</button>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {visibleSections.map((id, i) => (
          <a key={id} href={`#${id}`} style={{ display: "block", padding: "10px 16px", color: active === id ? C.pink : C.muted, fontFamily: "'Noto Sans JP',sans-serif", fontSize: 12, textDecoration: "none", borderLeft: `2px solid ${active === id ? C.pink : "transparent"}`, whiteSpace: "nowrap", transition: "all .2s", background: active === id ? "#fff0ee" : "transparent" }}>
            <span style={{ opacity: 0.4, marginRight: 8, fontSize: 11 }}>{String(i + 1).padStart(2, "0")}</span>
            {open && ALL_SECTION_LABELS[id]}
          </a>
        ))}
      </div>
    </nav>
  );
}

function CustomerView() {
  const [activeTarget, setActiveTarget] = useState(() => localStorage.getItem("aim-rose-target") || "nursing");
  const content = CONTENT[activeTarget];
  const visibleSections = content.visibleSections;
  const active = useActiveSection(visibleSections);
  const W = { maxWidth: 900, margin: "0 auto", padding: "0 24px" };

  useSyncReceive(({ target, sectionId }) => {
    if (target && target !== activeTarget) {
      localStorage.setItem("aim-rose-target", target);
      setActiveTarget(target);
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, target && target !== activeTarget ? 400 : 0);
  });

  const renderSection = (id) => {
    if (activeTarget === "nursing") {
      switch(id) {
        case "intro": return <NursingIntroSection key={id} content={content} />;
        case "overview": return <NursingOverviewSection key={id} content={content} W={W} />;
        case "classroom": return <NursingClassroomSection key={id} W={W} />;
        case "position": return <NursingPositionSection key={id} content={content} W={W} />;
        case "usp": return <NursingUspSection key={id} content={content} W={W} />;
        case "service": return <NursingServiceSection key={id} content={content} W={W} />;
        case "results": return <NursingResultsSection key={id} content={content} W={W} />;
        case "works": return <NursingWorksSection key={id} W={W} />;
        case "faq": return <FaqSection key={id} content={content} W={W} />;
        case "pricing": return <PricingSection key={id} W={W} />;
      }
    } else {
      switch(id) {
        case "intro": return <IntroSection key={id} content={content} />;
        case "challenge": return <ChallengeSection key={id} content={content} W={W} />;
        case "positioning": return <PositioningSection key={id} content={content} W={W} />;
        case "ikupower": return <KinderIkuPowerSection key={id} content={content} W={W} />;
        case "programs": return <KinderProgramsSection key={id} content={content} W={W} />;
        case "kinder_proposal": return <KinderProposalSection key={id} content={content} W={W} />;
        case "kinder_events": return <KinderEventsSection key={id} content={content} W={W} />;
        case "reassurance": return <ReassuranceSection key={id} content={content} W={W} />;
        case "event_proposal": return <EventProposalSection key={id} content={content} W={W} />;
        case "event_cases": return <EventCasesSection key={id} content={content} W={W} />;
        case "strengths": return <StrengthsSection key={id} content={content} W={W} />;
        case "service_range": return <ServiceRangeSection key={id} content={content} W={W} />;
        case "flow": return <FlowSection key={id} content={content} W={W} />;
        case "faq": return <FaqSection key={id} content={content} W={W} />;
        case "pricing": return <PricingSection key={id} W={W} />;
      }
    }
    return null;
  };

  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 200, background: C.border }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${C.rose},${C.pink})`, width: `${((visibleSections.indexOf(active) + 1) / visibleSections.length) * 100}%`, transition: "width .4s" }} />
      </div>
      <Sidebar active={active} visibleSections={visibleSections} />
      <main style={{ marginLeft: 48 }}>
        {visibleSections.map(id => renderSection(id))}
      </main>
    </>
  );
}

// ═══════════════════════════════════════════════════════
// PRESENTER DATA
// ═══════════════════════════════════════════════════════
const BANT = [
  { label: "BUDGET — 予算", q: "外部講師を招く際のご予算感はどれくらいを想定されていますでしょうか。" },
  { label: "AUTHORITY — 決裁者", q: "最終的なご判断はどなたが担当される形になりますでしょうか。" },
  { label: "NEED — 必要性", q: "今回のような企画について、どの程度の必要性を感じていらっしゃいますか。" },
  { label: "TIMELINE — 時期", q: "もし進める場合は、いつ頃からの導入をお考えでしょうか。" },
];
const OBJECTIONS = [
  { label: "検討したい", response: "ありがとうございます。検討されたいお気持ちはよく理解できます。具体的な内容は打ち合わせでないと正確にお伝えできない部分が多いです。三十分ほどお時間をいただければ、具体的なプランをご提示できますので、軽く次回のお時間だけいただければと思います。" },
  { label: "見送りたい", response: "率直にお話しいただきありがとうございます。無理に進める必要はないと思います。ただ、この企画がどれくらいお役に立てるかは、詳細を確認してみないと判断が難しい部分があります。情報整理の場として、次回三十分ほどお時間をいただければ幸いです。" },
  { label: "予算がない", response: "ご事情を教えていただきありがとうございます。お試しプランは1回4万円からご用意しています。まず小規模な形でご確認いただいたうえで、継続するかどうかをご判断いただく形でも構いません。" },
  { label: "会社の確認が必要", response: "承知いたしました。社内でのご確認は大切ですし、慎重に進められるのは良いことだと思います。次回は具体例をご用意いたしますので、三十分ほどお時間をいただければと思います。" },
];

const P_SECTIONS_BY_TARGET = {
  nursing: [
    { id: "intro",    label: "イントロ",     script: "本日はお時間をいただきありがとうございます。\n株式会社aim roseの〇〇と申します。\n\n本日は、介護施設様や老人ホーム様向けにご提供している洋裁教室の定期パッケージについてご紹介できればと思っております。\n\nご入居者様のレクリエーションや、日々の楽しみづくりにお役立ていただける内容ですので、ぜひ気軽にお聞きいただければ幸いです。" },
    { id: "ice",      label: "アイスブレイク", script: "●●様、先日は突然のお電話にも関わらずご興味をいただけた理由を先にお伺いしてもよろしいでしょうか？\n\n（相手の回答を受ける）\n\nありがとうございます。現在のレクリエーションで課題を感じていらっしゃる部分はありますでしょうか。\n\nなるほど、ありがとうございます。弊社のサービスがお役に立てる場面が多そうだと感じました。" },
    { id: "overview", label: "サービス概要", script: "弊社では、介護施設様向けに、講師が施設へ伺い洋裁を楽しんでいただく定期パッケージをご提供しています。\n\n講師は約10名在籍しており、300〜350名ほどの生徒様に教室を提供している体制です。\n\nミシン環境のない場合は手縫い中心の内容に切り替えるなど、施設様の環境に合わせて柔軟に対応しています。" },
    { id: "classroom",label: "教室風景",    script: "実際の教室風景をご覧いただきます。\n\n講師が一人ひとりに寄り添いながら、丁寧に指導しております。\n\n布を囲みながら自然に会話が生まれ、笑顔があふれる教室です。" },
    { id: "position", label: "ポジショニング", script: "最近は、入居者様の楽しみづくりや手先を動かす活動の重要性が注目されています。\n\n洋裁のように「完成物が残る」「達成感がある」「会話が生まれる」活動は、入居者様の満足度向上にもつながりやすいと考えております。" },
    { id: "usp",      label: "USP 3点",    script: "御社にメリットがあるポイントを3つにまとめますね。\n\n一つ目は、入居者様の負担にならない内容設計です。\n\n二つ目は、継続しやすいプログラム構成です。\n\n最後に、経験豊富な講師の対応力です。300名以上の生徒様を教えている講師陣が担当します。" },
    { id: "service",  label: "基本サービス", script: "まず施設様のご状況を伺い、参加人数・内容・開催頻度を確認したうえでプランを設計します。\n\n制作物はトートバッグや小物など、ご希望に合わせて調整可能です。" },
    { id: "results",  label: "実績紹介",    script: "これまで介護施設様や地域のコミュニティ向けに多数の体験会・教室を実施してきました。\n\n「継続したい」というお声を多数いただいています。" },
    { id: "works",    label: "制作物",      script: "実際にご入居者様が制作された作品をご覧いただきます。\n\n「こんなものが作れるの？」という驚きの声をよくいただきます。" },
    { id: "hearing",  label: "ヒアリング",  script: "ここまで一方的にお話ししてしまいました。ここからは御社の現状をお聞かせいただければと思います。", bant: true },
    { id: "faq",      label: "Q&A",        script: "Q: ミシンの持ち込みは必要ですか？\n→ ミシン環境のない場合は手縫い中心に切り替えできます。\n\nQ: 高齢の方でも参加できますか？\n→ 負担の少ない内容に調整できますのでご安心ください。" },
    { id: "pricing",  label: "料金",        script: "想定参加人数10名のプランです。\n\nお試しプランが4万円。\n3ヶ月プランが18万円（月6万円相当）。\n6ヶ月プランが33万円（月5.5万円相当）。人気プランです。\n1年プランが60万円（月5万円相当）。" },
    { id: "closing",  label: "クロージング", script: "ありがとうございます。まずは御社の体制やご希望を伺いながら最適なプランを具体化させていただければと思っています。\n\nたとえば「〇月〇日（〇曜日）」か「〇月〇日（〇曜日）」にお時間いただくことは可能でしょうか？\n\n① 「午前と午後はどちらがご都合よろしいでしょうか」\n② 「●時と●時ではどちらがよろしいでしょうか」" },
    { id: "obj",      label: "切り返し",    script: null, objections: true },
  ],

  kindergarten: [
    { id: "intro",    label: "イントロ",        script: "本日はお時間をいただきありがとうございます。\n株式会社aim roseの〇〇と申します。\n\n本日は、園で取り入れていただける「知育プログラム」としてご紹介できればと思っています。\n\n裁縫や造形を通して、子どもの創造力・集中力・自己肯定感といった “育つ力” を引き出す内容です。先生が指導する必要はなく、作って終わりではなく、持ち帰って思い出にも残る企画として活用いただけます。\n\nどうぞよろしくお願いいたします。" },
    { id: "ice",      label: "アイスブレイク",   script: "●●様、今日お時間いただけた背景として、何か現在の行事やイベントで感じていらっしゃることがあればお聞きしてもよろしいでしょうか？\n\n（相手の回答を受ける）\n\nありがとうございます。年間行事の中で、保護者参加型の企画はいかがでしょうか。\n\n現在の企画で「もう少し参加者が喜ぶ形にしたい」と感じていらっしゃる部分はありますか？\n\nなるほど。その部分で弊社のサービスが何かお役に立てるかもしれません。" },
    { id: "challenge",label: "よくある課題",    script: "まず、園を運営される担当者様が日々感じていらっしゃる課題について、整理させてください。\n\n「毎年似たような行事になってしまう」「保護者が参加しやすい企画を考えるのが難しい」というお声はよく聞きます。\n\nここで申し上げたいのは、これらの課題に対して「裁縫教室」が意外な解決策になるということです。\n\n少し意外に聞こえるかもしれませんが、次のスライドで位置づけをご説明します。" },
    { id: "positioning",label:"提案の位置づけ", script: "弊社がご提案するのは、「裁縫教室」ではなく、子どもの力が育つ「知育プログラム」です。\n\n園にとっては、「教える」のではなく「育つ体験を届ける」という発想で導入いただけます。\n\n参加した子どもにとっては、自分で作った、家に持ち帰れる、できた！という達成感が残る。\n\n園にとっては、企画しやすい、告知しやすい、当日運営しやすい。「親子でつくる○○」という告知文は、そのまま集客コピーになります。" },
    { id: "ikupower",  label:"育つ力",          script: "この活動で何が育つのか、5つの力に整理してご説明します。\n\n創造力・発想力、色彩感覚・表現力、指先の発達、集中力、そして達成感・自己肯定感です。\n\nポイントは、子どもが「楽しい！」と夢中になっているうちに、自然とこれらの力が育つということです。\n\n保護者の方にも「ただ遊んだだけ」ではなく「成長につながる時間だった」とご納得いただける、それが園としての価値になります。" },
    { id: "programs",  label:"選べるプログラム", script: "プログラムは1つではなく、園のご希望に合わせてお選びいただけます。\n\nたとえば、針を使わずはさみとのりだけでできる「お洋服デザイナー」は年少さんから安心。\n\n子ども針にチャレンジする「ニット帽リメイク」は、年中・年長向けで、SDGsの学びにもつながります。\n\n（チラシをお見せしながら）こちらが実際のプログラム資料です。年齢・季節・行事に合わせて、内容は自由にアレンジできますので、まずは「こんなことできる？」というところから一緒に考えさせてください。" },
    { id: "kinder_proposal",label:"園での活用", script: "具体的には、以下のような場面で活用できます。\n\n親子参加イベント、入園・進級準備イベント、季節行事、祖父母参観、未就園児向けイベント、卒園前の思い出づくりなどです。\n\n重要なのは、「園が裁縫を教える」のではなく、「園が思い出に残る体験機会を提供する」という発想です。\n\n先生が何かを指導する必要は一切ありません。" },
    { id: "kinder_events",label:"具体イベント案",script: "具体的なイベント案をいくつかご紹介します。\n\n「親子でつくるオリジナル巾着」は年少〜年長・保護者対象で60〜90分。主催者側は場所と人数連絡のみです。\n\n「入園準備ネームタグ・ワッペンづくり」は新入園児・保護者向けで入園不安の軽減に効果的です。\n\n「未就園児向けはじめての手づくり体験」は0〜3歳と保護者対象で30〜45分。入園前の来園理由になり、口コミ波及しやすいです。\n\nそれぞれ、先生の準備は一切不要です。" },
    { id: "reassurance",label:"不安解消",       script: "「楽しそう」より先に、担当者様が感じる不安があります。実務的にお答えします。\n\n「針を使うのは危なくないか」→年齢に応じて針を使わない内容も設計可能です。3〜4歳はシール・接着剤中心で対応します。\n\n「先生の準備が増えないか」→材料・道具・進行台本はすべて講師側で用意。先生は場所と人数確認のみです。\n\n「参加人数が多い場合どうするか」→少人数制・時間入替制で運営可能です。\n\nこれらは実際に多くの園様から事前にいただいた質問です。" },
    { id: "strengths",label:"この企画の強み",   script: "一般的なイベントと比較してみます。\n\n一般的なイベントは「見るだけ」「その場で終わる」「記憶に残りにくい」という特徴があります。\n\n裁縫体験は「作って持ち帰れる」「家に残る・日常で使える」「自分で作った記憶が残る」という価値があります。\n\nただし、必ず集客できるとか、必ず満足度が上がるというお約束はできません。まずは小規模なテスト開催からご相談ください。" },
    { id: "service_range",label:"提供範囲",     script: "弊社の提供範囲をご説明します。\n\n企画設計・材料準備・当日進行・講師派遣・告知文案・チラシ文面・参加者アンケート案・実施後レポート・次回開催提案まで含みます。\n\n「完全丸投げ」ではなく、「主催者が判断するだけで動ける状態」を目指します。\n\n先生方や担当者様の負担が大きくならない形で設計することを最優先にしています。" },
    { id: "flow",     label:"実施の流れ",       script: "実施の流れは6ステップです。\n\n事前ヒアリング→企画メニュー決定→告知・集客サポート→当日実施→完成品持ち帰り→次回開催提案という流れです。\n\n主催者様が動くのは、ヒアリング時の情報共有と日程調整、当日の場所提供のみです。\n\nまずは既存行事・既存イベントに組み込めるか確認してみましょう。" },
    { id: "hearing",  label:"ヒアリング",       script: "ここまで一方的にお話ししてしまいました。\nここからは御園の現状や気になった部分をお聞かせいただければと思います。\n\n年間行事の中で、保護者参加型の企画はありますか？\n未就園児向けの園開放イベントは実施されていますか？\n先生方の準備負担が少ない形であれば、外部企画の導入余地はありますか？", bant: true },
    { id: "faq",      label:"Q&A",             script: "Q: 針を使う内容と使わない内容、どちらでも対応できますか？\n→ はい。年齢に応じて接着剤・シール中心から手縫いまで対応可能です。\n\nQ: 少人数でも依頼できますか？\n→ はい、小規模から対応可能です。\n\nQ: 告知文の作成も相談できますか？\n→ はい、告知文案・チラシ文面の作成もサポート可能です。" },
    { id: "pricing",  label:"料金",             script: "想定参加人数10名のプランです。\n\nお試しプランが4万円。まずは1回試していただけます。\n3ヶ月プランが18万円（月6万円相当）。\n6ヶ月プランが33万円（月5.5万円相当）。人気プランです。\n1年プランが60万円（月5万円相当）。\n\n人数・内容のご要望は別途ご相談いただけます。" },
    { id: "closing",  label:"クロージング",     script: "ありがとうございます。\nまずは、現在予定されている行事やイベントの中で、組み込めそうな場面があるか一緒に確認できればと思います。\n\n小規模なテスト開催から相談可能ですので、まずは次回30分ほどお時間をいただければ具体的な企画案を数パターンご提示できます。\n\nたとえば「〇月〇日（〇曜日）」か「〇月〇日（〇曜日）」はいかがでしょうか？" },
    { id: "obj",      label:"切り返し",         script: null, objections: true },
  ],

  event: [
    { id: "intro",    label: "イントロ",        script: "本日はお時間をいただきありがとうございます。\n株式会社aim roseの〇〇と申します。\n\n本日は裁縫教室そのもののご案内というより、イベントや集客施策の中で使える「体験コンテンツ」としてご紹介できればと思っています。\n\n特に、来場者が作って持ち帰れる体験企画として、滞在時間の延長や満足度向上に活用できる可能性があります。" },
    { id: "ice",      label: "アイスブレイク",   script: "●●様、今日お時間いただけた背景として、現在のイベントで感じていらっしゃることがあればお聞きしてもよろしいでしょうか？\n\n（相手の回答を受ける）\n\n来場者の滞在時間を伸ばしたいイベントはありますか？\n\n物販・抽選会以外の体験コンテンツを探すことはありますか？\n\nなるほど。その部分で弊社のサービスが何かお役に立てるかもしれません。" },
    { id: "challenge",label: "よくある課題",    script: "まず、イベントを企画される担当者様が感じていらっしゃる課題について整理させてください。\n\n「物販・抽選会だけでは滞在時間が伸びにくい」「親子連れを長く留められる体験コンテンツがない」というお声はよく聞きます。\n\nまた「イベントは実施して終わりになりやすい」という課題も多くの主催者様から伺います。\n\n裁縫体験は、これらの課題に対して意外な解決策になります。" },
    { id: "positioning",label:"提案の位置づけ", script: "弊社がご提案するのは、単なるワークショップではなく、来場者が「参加したくなる体験企画」です。\n\n来場者にとっては、作品が残る、達成感がある、写真に残せる、という体験価値があります。\n\n主催者側にとっては、滞在時間が伸びる、告知コピーになる、当日運営しやすい、次回導線につながるというメリットがあります。\n\n「親子でつくる○○」という告知文は、そのまま集客コピーになります。" },
    { id: "event_proposal",label:"活用シーン",  script: "商業施設、住宅展示場、地域イベント、企業ファミリーイベント、マルシェ、子育て支援イベントなど幅広い場面で活用できます。\n\n特に住宅展示場では「子どもが夢中になっている間、保護者が安心して商談できる」という使い方をされている事例があります。\n\nどのような場面でお使いになりたいか、後ほど伺わせてください。" },
    { id: "event_cases",label:"具体企画案",     script: "具体的な企画案をいくつかご紹介します。\n\n「親子でつくるミニトートバッグ」は商業施設・地域イベント向けで45〜60分。日常で使える完成品が来場後もブランド接触を継続させます。\n\n「施設ロゴ入りワッペン体験」は商業施設・企業イベント向けで施設名入りのため特別感があり、SNS投稿されやすいです。\n\n「住宅展示場向けおうち型布小物」は60分で、子どもが夢中になる間に保護者が商談できる時間を確保できます。" },
    { id: "strengths",label:"この企画の強み",   script: "一般的なイベントと比較してみます。\n\n一般的なイベントは「見るだけ」「その場で終わる」「記憶に残りにくい」という特徴があります。\n\n裁縫体験は「作って持ち帰れる」「家に残る」「自分で作った記憶が残る」という価値があります。\n\nただし、必ず集客できるというお約束はできません。参加者構成や告知方法によって結果は異なります。まずは小規模なテスト開催からご相談ください。" },
    { id: "service_range",label:"提供範囲",     script: "企画設計・材料準備・当日進行・講師派遣・告知文案・SNS投稿文案・参加者アンケート案・実施後レポート・次回開催提案まで含みます。\n\n材料・道具はすべて持参しますので、主催者側は会場と参加者数のご連絡のみで対応可能です。\n\n主催者が「判断するだけで動ける状態」を目指します。" },
    { id: "flow",     label:"実施の流れ",       script: "実施の流れは6ステップです。\n\n事前ヒアリング→企画メニュー決定→告知・集客サポート→当日実施→完成品持ち帰り→次回開催提案という流れです。\n\n当日の準備・設営・進行・片付けまですべて対応します。\n\nまずは既存イベントに組み込めるか確認してみましょう。" },
    { id: "hearing",  label:"ヒアリング",       script: "ここまで一方的にお話ししてしまいました。\n\n来場者の滞在時間を伸ばしたいイベントはありますか？\n物販・抽選会以外の体験コンテンツを探すことはありますか？\n写真やSNSに残る企画を求められることはありますか？\n参加者アンケートや次回導線まで必要ですか？", bant: true },
    { id: "faq",      label:"Q&A",             script: "Q: 当日の準備は必要ですか？\n→ 材料・道具はすべて持参。会場と参加者数のご連絡のみで大丈夫です。\n\nQ: 屋外イベントでも対応できますか？\n→ 手縫い中心であれば屋外でも可能な場合があります。\n\nQ: 参加人数が多い場合は？\n→ 時間入替制・複数ブース対応も可能です。" },
    { id: "pricing",  label:"料金",             script: "想定参加人数10名のプランです。\n\nお試しプランが4万円。\n3ヶ月プランが18万円。\n6ヶ月プランが33万円。人気プランです。\n1年プランが60万円。\n\n人数・内容・開催回数のご要望は別途ご相談いただけます。" },
    { id: "closing",  label:"クロージング",     script: "ありがとうございます。\nまずは、現在予定されているイベントの中で、組み込めそうな場面があるか一緒に確認できればと思います。\n\n小規模なテスト開催から相談可能ですので、次回30分ほどお時間をいただければ具体的な企画案を数パターンご提示できます。\n\nたとえば「〇月〇日（〇曜日）」か「〇月〇日（〇曜日）」はいかがでしょうか？" },
    { id: "obj",      label:"切り返し",         script: null, objections: true },
  ],
};

// ═══════════════════════════════════════════════════════
// PRESENTER VIEW
// ═══════════════════════════════════════════════════════
function ScriptBlock({ text }) {
  return <div style={{ background: "#f0fff0", border: "1.5px solid #a0d4a0", borderRadius: 12, padding: "20px 24px", fontFamily: "'Noto Sans JP',sans-serif", fontSize: 14, lineHeight: 2.2, color: "#2a4a2a", whiteSpace: "pre-wrap", marginTop: 16 }}>{text}</div>;
}
function BantItem({ label, q, checked, onToggle }) {
  return <div onClick={onToggle} style={{ padding: "14px 18px", borderRadius: 12, border: `1.5px solid ${checked ? C.rose + "80" : C.border}`, background: checked ? "#fff5f3" : C.white, cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10, userSelect: "none", transition: "all .2s" }}><div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked ? C.rose : C.border}`, background: checked ? C.rose : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", transition: "all .2s" }}>{checked && "✓"}</div><div><div style={{ fontSize: 11, color: C.pink, letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div><div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{q}</div></div></div>;
}
function ObjectionCard({ label, response }) {
  const [open, setOpen] = useState(false);
  return <div onClick={() => setOpen(o => !o)} style={{ borderRadius: 14, border: `1.5px solid ${open ? C.rose + "80" : C.border}`, background: open ? "#fff5f3" : C.white, cursor: "pointer", overflow: "hidden", marginBottom: 12, userSelect: "none" }}><div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 15, color: C.text, fontWeight: 700 }}>「{label}」と言われたら</span><span style={{ color: C.pink, fontSize: 12 }}>{open ? "▲" : "▼"}</span></div><div style={{ maxHeight: open ? 300 : 0, overflow: "hidden", transition: "max-height .3s ease" }}><div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}><div style={{ marginTop: 14, padding: "14px 18px", background: "#f0fff0", borderRadius: 10, borderLeft: "3px solid #a0d4a0", fontSize: 13, color: "#2a4a2a", lineHeight: 2 }}>{response}</div></div></div></div>;
}

function PresenterView() {
  const [activeTarget, setActiveTarget] = useState("nursing");
  const [current, setCurrent] = useState(0);
  const [bantChecked, setBantChecked] = useState([false,false,false,false]);
  const sendSync = useSyncSend();
  const sections = P_SECTIONS_BY_TARGET[activeTarget];
  const total = sections.length;
  const sec = sections[current];
  const tc = TARGET_COLORS[activeTarget];

  const go = (idx) => { if (idx < 0 || idx >= total) return; setCurrent(idx); };
  const changeTarget = (t) => { setActiveTarget(t); setCurrent(0); setBantChecked([false,false,false,false]); localStorage.setItem("aim-rose-target", t); };

  useEffect(() => {
    const cmap = CUSTOMER_MAPS[activeTarget];
    const sectionId = cmap[sections[current].id];
    if (sectionId) sendSync({ target: activeTarget, sectionId });
  }, [current, activeTarget]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(current + 1);
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   go(current - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [current, activeTarget]);

  const isLinked = !!CUSTOMER_MAPS[activeTarget][sec.id];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Noto Sans JP',sans-serif" }}>
      <div style={{ background: "#f0fff0", borderBottom: "1.5px solid #a0d4a0", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span>🎯</span><span style={{ fontSize: 13, color: "#2a6a2a", fontWeight: 700 }}>PRESENTER MODE — 営業担当専用</span></div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.muted }}>{current + 1} / {total}</span>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#fff", textDecoration: "none", padding: "8px 20px", borderRadius: 50, background: `linear-gradient(135deg,${C.rose},${C.pink})`, fontWeight: 700, boxShadow: `0 4px 16px ${C.rose}40`, letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15 }}>📺</span> 顧客画面を開く
          </a>
        </div>
      </div>
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, color: C.muted, alignSelf: "center", marginRight: 4, whiteSpace: "nowrap" }}>ターゲット：</div>
        {Object.entries(TARGET_COLORS).map(([key, val]) => (
          <button key={key} onClick={() => changeTarget(key)} style={{ padding: "8px 20px", borderRadius: 50, border: `2px solid ${activeTarget === key ? val.main : C.border}`, background: activeTarget === key ? val.main : C.white, color: activeTarget === key ? "#fff" : C.muted, cursor: "pointer", fontSize: 13, fontWeight: activeTarget === key ? 700 : 400, transition: "all .2s", whiteSpace: "nowrap" }}>{val.label}</button>
        ))}
      </div>
      <div style={{ height: 4, background: C.border, flexShrink: 0 }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${tc.main},${tc.dark})`, width: `${((current + 1) / total) * 100}%`, transition: "width .3s" }} />
      </div>
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 24px", overflowX: "auto", flexShrink: 0, display: "flex" }}>
        {sections.map((s, i) => (
          <button key={s.id} onClick={() => go(i)} style={{ padding: "12px 16px", background: "none", border: "none", borderBottom: `2px solid ${i === current ? tc.main : "transparent"}`, cursor: "pointer", whiteSpace: "nowrap", fontSize: 12, color: i === current ? tc.dark : C.muted, fontWeight: i === current ? 700 : 400, transition: "all .2s", flexShrink: 0 }}>
            <span style={{ opacity: 0.5, marginRight: 5 }}>{String(i + 1).padStart(2, "0")}</span>{s.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: isLinked ? tc.main : C.muted, letterSpacing: "0.2em", marginBottom: 8 }}>{isLinked ? "🔗 顧客画面と連動" : "📋 カンペのみ（顧客画面は動かない）"}</div>
            <h2 style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 22, fontWeight: 700, color: C.text }}>{sec.label}</h2>
          </div>
          {sec.script && <ScriptBlock text={sec.script} />}
          {sec.bant && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 12, color: C.pink, letterSpacing: "0.15em", marginBottom: 14 }}>BANT チェックリスト</div>
              {BANT.map((b, i) => <BantItem key={i} label={b.label} q={b.q} checked={bantChecked[i]} onToggle={() => setBantChecked(p => { const n = [...p]; n[i] = !n[i]; return n; })} />)}
            </div>
          )}
          {sec.objections && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 12, color: C.pink, letterSpacing: "0.15em", marginBottom: 14 }}>切り返しトーク</div>
              {OBJECTIONS.map((obj, i) => <ObjectionCard key={i} label={obj.label} response={obj.response} />)}
            </div>
          )}
        </div>
      </div>
      <div style={{ background: C.white, borderTop: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <button onClick={() => go(current - 1)} disabled={current === 0} style={{ padding: "12px 28px", borderRadius: 50, border: `1.5px solid ${C.border}`, background: C.white, cursor: current === 0 ? "not-allowed" : "pointer", fontSize: 14, color: current === 0 ? C.border : C.muted }}>← 前へ</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>← → キーでも操作</div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            {sections.map((_, i) => <div key={i} onClick={() => go(i)} style={{ width: i === current ? 20 : 8, height: 8, borderRadius: 4, background: i === current ? tc.main : C.border, cursor: "pointer", transition: "all .3s" }} />)}
          </div>
        </div>
        <button onClick={() => go(current + 1)} disabled={current === total - 1} style={{ padding: "12px 28px", borderRadius: 50, border: "none", background: current === total - 1 ? C.border : `linear-gradient(135deg,${tc.main},${tc.dark})`, cursor: current === total - 1 ? "not-allowed" : "pointer", fontSize: 14, color: "#fff", fontWeight: 500 }}>次へ →</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════
export default function App() {
  const [route, setRoute] = useState(getRoute());
  useEffect(() => { const handler = () => setRoute(getRoute()); window.addEventListener("popstate", handler); return () => window.removeEventListener("popstate", handler); }, []);
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
