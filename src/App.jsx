import { useState, useEffect, useRef } from "react";

function getRoute() {
  return window.location.pathname === "/presenter" ? "presenter" : "customer";
}

const CHANNEL = "aim-rose-sync";

function useSyncSend() {
  const ch = useRef(null);
  const ready = useRef(false);
  useEffect(() => {
    ch.current = new BroadcastChannel(CHANNEL);
    ready.current = true;
    return () => { ch.current.close(); ready.current = false; };
  }, []);
  const fn = useRef((payload) => {
    if (ready.current) ch.current.postMessage(payload);
    else setTimeout(() => ch.current?.postMessage(payload), 150);
  });
  return fn.current;
}

function useSyncReceive(onMessage) {
  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = (e) => { if (e.data?.sectionId) onMessage(e.data); };
    return () => ch.close();
  }, [onMessage]);
}

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

const C = {
  pink: "#c9657a", rose: "#e8847a",
  bg: "#fff8f6", bgAlt: "#fdf0f5",
  border: "#f2d0d0", text: "#2a1a1a", muted: "#7a5a5a",
  white: "#ffffff",
};

const TARGET_COLORS = {
  nursing:      { main: "#e8847a", dark: "#c9657a", label: "老人ホーム向け" },
  kindergarten: { main: "#f4a261", dark: "#e76f51", label: "幼稚園・保育園向け" },
  event:        { main: "#2a9d8f", dark: "#1a7a6e", label: "イベント向け" },
};

function Card({ children, accent, style: s = {} }) {
  return (
    <div style={{ background: C.white, border: `1.5px solid ${accent || C.border}`, borderRadius: 18, padding: "28px 24px", boxShadow: `0 4px 24px #e8847a0e`, ...s }}>
      {children}
    </div>
  );
}

function H({ sub, children }) {
  return (
    <R>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", marginBottom: 40 }}>
        {sub && <div style={{ fontFamily: "'Noto Sans JP',sans-serif", fontSize: 11, letterSpacing: "0.22em", color: C.pink, marginBottom: 8, fontWeight: 500 }}>{sub}</div>}
        <h2 style={{ fontFamily: "'Noto Serif JP',serif", fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, color: C.text, lineHeight: 1.5, margin: "0 0 40px" }}>{children}</h2>
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
        <button onClick={() => setOpen(o => !o)} style={{ width: "100%", padding: "18px 24px", background: open ? "#fff5f3" : C.white, border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, textAlign: "left" }}>
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
// CONTENT DATA
// ════════════════════════════════════════════════════════════════════
const CONTENT = {
  nursing: {
    heroSub: "介護施設様向け",
    heroTitle: ["洋裁教室", "定期パッケージ"],
    heroCatch: "ご入居者様の楽しみ・充実時間創造",
    stats: [
      { n: "10名", label: "在籍講師数" }, { n: "300〜350名", label: "現在の生徒様数" },
      { n: "月1回〜", label: "柔軟な開催頻度" }, { n: "ミシン・手縫い", label: "施設環境に対応" },
    ],
    envNote: "ミシン環境のない場合は手縫い中心の内容に切り替え可能。簡単制作〜小物づくりまで、ご入居者様の負担にならない内容構成。",
    problemTitle: "介護施設様の課題",
    problems: ["ご入居者様の楽しみづくり・手先を動かす活動の重要性が増大している","単発イベントから→継続的に楽しめるプログラムへのニーズが増加している"],
    positionTitle: "洋裁教室が選ばれる理由",
    features: [{ title: "完成物が残る", body: "形として手元に残る達成感" },{ title: "達成感がある", body: "制作完了時の充実感" },{ title: "会話が生まれる", body: "制作中の自然なコミュニケーション" },{ title: "満足度向上", body: "継続的な楽しみの提供" }],
    uspTitle: "貴社メリット 3つのポイント",
    usps: [
      { n: "1", title: "ご入居者様の負担にならない内容設計", body: "ミシンを使う場合でも講師がしっかりサポートし、手縫い中心の回もあるため、どなたでも安心してご参加いただけます。" },
      { n: "2", title: "継続しやすいプログラム構成", body: "月1回等の定期開催により、ご入居者様の楽しみが増加。施設様としてもレクリエーション計画を立てやすい仕組みです。" },
      { n: "3", title: "経験豊富な講師の対応力", body: "現在300名以上の生徒様を指導する実績ある講師陣が、参加人数・レベルに合わせ柔軟に進行します。" },
    ],
    serviceTitle: "貴施設に合わせたオーダーメイド設計",
    makeItems: ["トートバッグ", "小物類"],
    steps: [{ n: "1", title: "ヒアリング", body: "参加人数・ご希望内容・開催頻度を確認し、プランを設計します。" },{ n: "2", title: "プラン設計", body: "施設環境に合わせた内容調整。ミシン環境のない場合も完全対応。" },{ n: "3", title: "定期開催", body: "継続的な洋裁教室を実施。月1回〜、施設様のペースで。" }],
    hasClassroom: true, hasWorks: true,
    resultTitle: "多数の施設様から高評価",
    results: [
      { title: "300〜350名", sub: "継続通学中の個人教室生徒様", body: "個人向け教室での豊富な実績により培われた、確かな指導力・対応力で貴施設をサポートします。" },
      { title: "「継続したい」のお声", sub: "施設様からの評価（多数）", body: "完成物が残る活動として高満足度を獲得。施設様より継続希望のお声を多数いただいています。" },
      { title: "幅広い年齢層", sub: "地域コミュニティでの実績", body: "幅広い年齢層への指導経験を活かした、きめ細かなサポートをご提供します。" },
    ],
    faqs: [
      { q: "ミシンの持ち込みは必要ですか？", a: "ミシン必要な内容時は持ち込み可。ミシン環境のない場合は手縫い中心内容への切り替えも可能です。" },
      { q: "参加人数が多くても対応できますか？", a: "講師1名での同時対応には限りがありますが、内容調整・複数回開催等で対応可能です。" },
      { q: "どんな制作物ができますか？", a: "トートバッグや小物等、ご入居者様の負担にならない内容を中心にご提案。ご希望に合わせて調整可能です。" },
      { q: "単発での依頼はできますか？", a: "可能ですが、継続性が生まれやすい定期パッケージをお勧めしております。" },
      { q: "高齢の方でも参加できますか？", a: "はい、負担の少ない内容に調整できますのでご安心ください。" },
    ],
  },

  kindergarten: {
    heroSub: "幼稚園・保育園様向け",
    heroTitle: ["洋裁教室", "定期パッケージ"],
    heroCatch: "子どもたちの「つくる喜び」を育む",
    stats: [
      { n: "10名", label: "在籍講師数" }, { n: "300〜350名", label: "現在の生徒様数" },
      { n: "月1回〜", label: "柔軟な開催頻度" }, { n: "ミシン・手縫い", label: "年齢に合わせて対応" },
    ],
    envNote: "ミシン環境のない場合は手縫い中心の内容に切り替え可能。年齢・発達段階に合わせた安全な内容構成。",
    problemTitle: "幼稚園・保育園様の課題",
    problems: ["子どもたちの創造力・巧緻性を育む活動へのニーズが増大している","単発のイベントから→継続的に楽しめるプログラムへの需要が高まっている"],
    positionTitle: "洋裁教室が選ばれる理由",
    features: [{ title: "作品が残る", body: "手で作った物が形として残る達成感" },{ title: "集中力が育つ", body: "制作に取り組む中で養われる集中力" },{ title: "表現力が伸びる", body: "制作中の自然な言葉のやりとり" },{ title: "季節感が育つ", body: "季節に合わせた制作で時間感覚が育まれる" }],
    uspTitle: "園へのメリット 3つのポイント",
    usps: [
      { n: "1", title: "年齢・発達段階に合わせた内容設計", body: "幼児でも楽しめる簡単な手縫いから始められます。講師がしっかりサポートしながら、お子様のペースで安全に進められます。" },
      { n: "2", title: "継続しやすい定期プログラム", body: "月1回等の定期開催でお子様の楽しみが継続。保護者様からも「また来たい」のお声をいただいています。" },
      { n: "3", title: "経験豊富な講師の対応力", body: "現在300名以上の生徒様を指導する講師陣が担当。子どもたちの興味を引き出しながら、楽しく安全に進行します。" },
    ],
    serviceTitle: "園に合わせたオーダーメイド設計",
    makeItems: ["トートバッグ", "小物類", "季節の飾り"],
    steps: [{ n: "1", title: "ヒアリング", body: "参加人数・年齢層・ご希望内容・開催頻度を確認し、プランを設計します。" },{ n: "2", title: "プラン設計", body: "年齢・発達段階に合わせた内容調整。安全面に十分配慮した内容で設計します。" },{ n: "3", title: "定期開催", body: "継続的な洋裁教室を実施。月1回〜、園のペースに合わせて進行します。" }],
    hasClassroom: false, hasWorks: false,
    resultTitle: "多数の園様・生徒様から高評価",
    results: [
      { title: "300〜350名", sub: "継続通学中の個人教室生徒様", body: "個人向け教室での豊富な実績により培われた、確かな指導力・対応力で貴園をサポートします。" },
      { title: "「また来たい」のお声", sub: "お子様・保護者様からの評価", body: "完成物が手元に残ることで、継続したいというお声を多数いただいています。" },
      { title: "幅広い年齢層", sub: "地域コミュニティでの実績", body: "幼児から高齢者まで幅広い年齢層への指導経験を活かした、きめ細かなサポート。" },
    ],
    faqs: [
      { q: "幼児でも参加できますか？", a: "はい、年齢や発達段階に合わせた内容に調整できますので安心してご参加いただけます。" },
      { q: "安全面は大丈夫ですか？", a: "講師が常にそばでサポートします。針・ミシンの使用は年齢・状況に応じて判断し、安全に配慮した内容で実施します。" },
      { q: "参加人数が多くても対応できますか？", a: "内容調整・複数回開催等で対応可能です。まずはご相談ください。" },
      { q: "保護者向けプログラムも対応できますか？", a: "はい、保護者様向けのワークショップや親子参加型プログラムも対応可能です。" },
      { q: "単発での依頼はできますか？", a: "可能ですが、継続性が生まれやすい定期パッケージをお勧めしております。" },
    ],
  },

  event: {
    heroSub: "イベント・ワークショップ向け",
    heroTitle: ["洋裁", "ワークショップ"],
    heroCatch: "参加者の記憶に残る、特別な体験を",
    stats: [
      { n: "10名", label: "在籍講師数" }, { n: "300〜350名", label: "個人教室の生徒様数" },
      { n: "1回〜", label: "単発・定期どちらも対応" }, { n: "ミシン・手縫い", label: "会場環境に対応" },
    ],
    envNote: "ミシン環境のない会場でも手縫い中心の内容で実施可能。材料・道具はすべて講師が持参します。",
    problemTitle: "イベント担当者様の課題",
    problems: ["イベントの差別化・体験コンテンツへのニーズが増大している","「参加して終わり」ではなく、作品が手元に残る体験型プログラムへの関心が高まっている"],
    positionTitle: "洋裁ワークショップが選ばれる理由",
    features: [{ title: "作品が残る", body: "参加者が持ち帰れる世界に一つの作品" },{ title: "達成感・満足度", body: "自分で作り上げる喜びと充実感" },{ title: "交流・コミュニケーション", body: "制作を通じた自然な会話と出会い" },{ title: "イベントの差別化", body: "他にはない体験型コンテンツで来場者を魅了" }],
    uspTitle: "イベントへのメリット 3つのポイント",
    usps: [
      { n: "1", title: "準備不要・完結型の体験設計", body: "材料・道具はすべて講師が持参。当日の準備負担ゼロで実施できます。参加者は手ぶらでご参加いただけます。" },
      { n: "2", title: "参加人数の柔軟な対応", body: "少人数のワークショップから大型イベントまで対応。複数回開催・時間分散での実施も可能です。" },
      { n: "3", title: "経験豊富な講師の進行力", body: "現在300名以上の生徒様を指導する講師陣が担当。初めての方でも楽しめるよう、丁寧にサポートします。" },
    ],
    serviceTitle: "イベントに合わせたオーダーメイド設計",
    makeItems: ["トートバッグ", "巾着袋", "小物類"],
    steps: [{ n: "1", title: "ヒアリング", body: "参加想定人数・会場環境・ご希望内容・日程を確認し、プランを設計します。" },{ n: "2", title: "企画・準備", body: "イベントに合わせた制作物・材料を準備。当日スムーズに進行できるよう調整します。" },{ n: "3", title: "当日実施", body: "講師が会場へ伺い、参加者をサポートしながら楽しいワークショップを実施します。" }],
    hasClassroom: false, hasWorks: false,
    resultTitle: "多数のイベント・施設様から高評価",
    results: [
      { title: "300〜350名", sub: "継続通学中の個人教室生徒様", body: "個人向け教室での豊富な実績により培われた、確かな指導力・進行力でイベントをサポートします。" },
      { title: "「また開催したい」のお声", sub: "イベント主催者様からの評価", body: "完成物が手元に残る体験として、参加者・主催者双方から高い評価をいただいています。" },
      { title: "幅広い年齢層", sub: "地域コミュニティでの実績", body: "幅広い年齢層への指導経験を活かした、誰でも楽しめるワークショップをご提供します。" },
    ],
    faqs: [
      { q: "当日の準備は必要ですか？", a: "材料・道具はすべて講師が持参しますので、会場と参加者数のご連絡のみで大丈夫です。" },
      { q: "ミシンは使いますか？", a: "ミシン環境のない場合は手縫い中心の内容で実施可能です。会場環境に合わせて柔軟に対応します。" },
      { q: "参加人数が多くても対応できますか？", a: "人数に合わせて複数講師での対応や複数回開催も可能です。まずはご相談ください。" },
      { q: "屋外イベントでも対応できますか？", a: "環境によって異なりますが、手縫い中心の内容であれば屋外でも対応可能な場合があります。" },
      { q: "単発・定期どちらでも対応できますか？", a: "はい、単発のイベントから定期的なワークショップまで柔軟に対応いたします。" },
    ],
  },
};

// ════════════════════════════════════════════════════════════════════
// PRESENTER DATA
// ════════════════════════════════════════════════════════════════════
const CUSTOMER_MAPS = {
  nursing:      { intro:"intro", overview:"overview", classroom:"classroom", position:"position", usp:"usp", service:"service", results:"results", works:"works", faq:"faq", pricing:"pricing" },
  kindergarten: { intro:"intro", overview:"overview", position:"position", usp:"usp", service:"service", results:"results", faq:"faq", pricing:"pricing" },
  event:        { intro:"intro", overview:"overview", position:"position", usp:"usp", service:"service", results:"results", faq:"faq", pricing:"pricing" },
};

const BANT = [
  { label: "BUDGET — 予算", q: "外部講師を招く際のご予算感はどれくらいを想定されていますでしょうか。" },
  { label: "AUTHORITY — 決裁者", q: "最終的なご判断はどなたが担当される形になりますでしょうか。" },
  { label: "NEED — 必要性", q: "今回のような定期パッケージについて、どの程度の必要性を感じていらっしゃいますか。" },
  { label: "TIMELINE — 時期", q: "もし進める場合は、いつ頃からの導入をお考えでしょうか。" },
];

const OBJECTIONS = [
  { label: "検討したい", response: "ありがとうございます。検討されたいお気持ちはよく理解できます。具体的な内容は講師責任者との打ち合わせでないと正確にお伝えできない部分が多いです。三十分ほどお時間をいただければ、具体的なプランをご提示できますので、軽く次回のお時間だけいただければと思います。" },
  { label: "見送りたい", response: "率直にお話しいただきありがとうございます。無理に進める必要はないと思います。ただ、定期パッケージがどれくらいお役に立てるかは、詳細を確認してみないと判断が難しい部分があります。情報整理の場として、次回三十分ほどお時間をいただければ幸いです。" },
  { label: "会社の確認が必要", response: "承知いたしました。社内でのご確認は大切ですし、慎重に進められるのは良いことだと思います。具体的な内容や進め方は二次商談で詳しくご説明できます。次回は具体例をご用意いたしますので、三十分ほどお時間をいただければと思います。" },
];

const P_SECTIONS_BY_TARGET = {
  nursing: [
    { id: "intro",    label: "イントロ",       script: "本日はお時間をいただきありがとうございます。\n株式会社aim roseの〇〇と申します。\n\n本日は、介護施設様や老人ホーム様向けにご提供している、洋裁教室の定期パッケージについてご紹介できればと思っております。\n\nご入居者様のレクリエーションや、日々の楽しみづくりにお役立ていただける内容になっておりますので、ぜひ気軽にお聞きいただければ幸いです。\nどうぞよろしくお願いいたします。" },
    { id: "ice",      label: "アイスブレイク",  script: "●●様、最初に1点お伺いしてもよろしいでしょうか？\n先日は突然のお電話にも関わらず、ご興味をいただけた理由を先にお伺いしてもよろしいでしょうか？\n\n（相手の回答を受ける）\n\nありがとうございます。そういった背景からご興味をお持ちいただいたんですね。\n\n現在のレクリエーションやイベントのご状況について、少しお聞かせいただけますでしょうか。\n入居者様に人気のある活動や、幅を広げたいと感じている部分など、どのあたりが課題になりやすいでしょうか。\n\nなるほど、ありがとうございます。\nお話を伺っていると、弊社のサービスがお役に立てる場面が多そうだと感じました。" },
    { id: "overview", label: "サービス概要",    script: "弊社では、介護施設様や老人ホーム様向けに、講師が施設へ伺い、洋裁を楽しんでいただく定期パッケージをご提供しています。\n\nミシンを使った簡単な制作や、手縫いでできる小物づくりなど、入居者様の負担にならない内容を中心に構成しています。\n\n講師は約10名在籍しており、現在は300〜350名ほどの生徒様に教室を提供している体制です。" },
    { id: "classroom",label: "教室風景",        script: "実際の教室風景をご覧いただきます。\n\n講師が一人ひとりに寄り添いながら、丁寧に指導しております。\n\n布を囲みながら自然に会話が生まれ、参加者様同士の笑顔があふれる教室です。" },
    { id: "position", label: "ポジショニング",  script: "最近は、入居者様の楽しみづくりや、手先を動かす活動の重要性が改めて注目されています。\n\n特に、単発のイベントだけではなく、継続的に楽しめるプログラムを求められる施設様が増えている印象です。\n\nそういった中で、洋裁のように「完成物が残る」「達成感がある」「会話が生まれる」活動は、入居者様の満足度向上にもつながりやすいと考えております。" },
    { id: "usp",      label: "USP 3点",        script: "御社にメリットがあるポイントを3つにまとめますね。\n\n一つ目は、入居者様の負担にならない内容設計です。\nミシンを使う場合でも講師がしっかりサポートし、手縫い中心の回もあるため、どなたでも安心してご参加いただけます。\n\n二つ目は、継続しやすいプログラム構成です。\n月1回などの定期開催にすることで、入居者様の楽しみが増え、施設様としてもレクリエーションの計画が立てやすくなります。\n\n最後に、講師の対応力です。\n現在300名以上の生徒様を教えている講師陣が担当するため、参加人数やレベルに合わせて柔軟に進行できます。" },
    { id: "service",  label: "基本サービス",    script: "法人向けの定期パッケージでは、まず施設様のご状況を伺い、参加人数・ご希望の内容・開催頻度などを確認したうえでプランを設計します。\n\n制作物はトートバッグや小物など、施設様のご希望に合わせて調整可能です。\n\nミシン環境のない場合は、手縫い中心の内容に切り替えるなど、施設様の環境に合わせて柔軟に対応しています。" },
    { id: "results",  label: "実績紹介",        script: "これまで、介護施設様や地域のコミュニティ向けに多数の体験会や教室を実施してきました。\n\n特に、完成物が残る活動は入居者様からの満足度が高く、施設様からも「継続したい」というお声をいただくことが多いです。\n\n個人向けの教室では300〜350名の生徒様が継続的に通われており、講師の指導力についても高い評価をいただいています。" },
    { id: "works",    label: "制作物",          script: "実際にご入居者様が制作された作品をご覧いただきます。\n\n眼鏡ケースや巾着袋など、和柄生地を使ったオリジナル作品です。\n\n「こんなものが作れるの？」という驚きの声をよくいただきます。\n完成物が手元に残ることで、達成感と継続する楽しみが生まれます。" },
    { id: "hearing",  label: "ヒアリング",      script: "すいません、ここまで一方的にお話ししてしまいました。\nここからは御社の現状や、「ここが気になる」と感じられた部分を伺えればと思っています。", bant: true },
    { id: "faq",      label: "Q&A",            script: "Q: ミシンの持ち込みは必要ですか？\n→ ミシン環境のない場合は手縫い中心の内容に切り替えできます。\n\nQ: 参加人数が多くても対応できますか？\n→ 内容調整・複数回開催等で対応可能です。\n\nQ: 高齢の方でも参加できますか？\n→ はい、負担の少ない内容に調整できますのでご安心ください。" },
    { id: "pricing",  label: "料金",            script: "想定参加人数10名のプランです。\n\nお試しプランが4万円。\n3ヶ月プランが18万円（月6万円相当）。\n6ヶ月プランが33万円（月5.5万円相当）。一番人気のプランです。\n1年プランが60万円（月5万円相当）。最もお得です。\n\n10名を超える場合や内容のご要望は別途ご相談いただけます。" },
    { id: "closing",  label: "クロージング",    script: "ありがとうございます。\nもしよろしければ、まずは御社の体制やご希望を伺いながら、最適なプランを具体化させていただければと思っています。\n\nたとえば「〇月〇日（〇曜日）」か「〇月〇日（〇曜日）」にお時間いただくことは可能でしょうか？\n\n① 「午前と午後はどちらがご都合よろしいでしょうか」\n② 「●時と●時ではどちらがよろしいでしょうか」\n③ 「では、●月●日の●時でお時間を頂戴できれば」" },
    { id: "obj",      label: "切り返し",        script: null, objections: true },
  ],

  kindergarten: [
    { id: "intro",    label: "イントロ",       script: "本日はお時間をいただきありがとうございます。\n株式会社aim roseの〇〇と申します。\n\n本日は、幼稚園・保育園様向けにご提供している、洋裁教室の定期パッケージについてご紹介できればと思っております。\n\nお子様の創造力・巧緻性を育む活動として、ぜひ気軽にお聞きいただければ幸いです。\nどうぞよろしくお願いいたします。" },
    { id: "ice",      label: "アイスブレイク",  script: "●●様、最初に1点お伺いしてもよろしいでしょうか？\n先日は突然のお電話にも関わらず、ご興味をいただけた理由を先にお伺いしてもよろしいでしょうか？\n\n（相手の回答を受ける）\n\nありがとうございます。そういった背景からご興味をお持ちいただいたんですね。\n\n現在の園内プログラムの状況について、少しお聞かせいただけますでしょうか。\n子どもたちに人気のある活動や、もう少し幅を広げたいと感じている部分はありますでしょうか。\n\nなるほど、ありがとうございます。\nお話を伺っていると、弊社のサービスがお役に立てる場面が多そうだと感じました。" },
    { id: "overview", label: "サービス概要",    script: "弊社では、幼稚園・保育園様向けに、講師が園へ伺い、洋裁を楽しんでいただく定期パッケージをご提供しています。\n\n手縫いでできる簡単な小物づくりや、子どもたちの年齢・発達に合わせた内容を中心に構成しています。\n\n講師は約10名在籍しており、現在は300〜350名ほどの生徒様に教室を提供している体制です。" },
    { id: "position", label: "ポジショニング",  script: "最近は、子どもたちの創造力・巧緻性を育む活動へのニーズが高まっています。\n\n特に、単発のイベントだけではなく、継続的に楽しめるプログラムを求める園様が増えている印象です。\n\nそういった中で、洋裁のように「作品が残る」「集中力が育つ」「表現力が伸びる」活動は、お子様の発達にもつながりやすいと考えております。" },
    { id: "usp",      label: "USP 3点",        script: "御園にメリットがあるポイントを3つにまとめますね。\n\n一つ目は、年齢・発達段階に合わせた内容設計です。\n幼児でも楽しめる簡単な手縫いから始められます。講師がしっかりサポートしながら、お子様のペースで安全に進められます。\n\n二つ目は、継続しやすい定期プログラムです。\n月1回などの定期開催にすることで、子どもたちの楽しみが継続します。保護者様からも「また来たい」のお声をいただいています。\n\n最後に、経験豊富な講師の対応力です。\n現在300名以上の生徒様を教えている講師陣が担当します。子どもたちの興味を引き出しながら楽しく安全に進行できます。" },
    { id: "service",  label: "基本サービス",    script: "法人向けの定期パッケージでは、まず園のご状況を伺い、参加人数・年齢層・ご希望の内容・開催頻度などを確認したうえでプランを設計します。\n\n制作物はトートバッグや小物、季節の飾りなど、お子様のご希望に合わせて調整可能です。\n\nミシン環境のない場合は、手縫い中心の内容に切り替えるなど、園の環境に合わせて柔軟に対応しています。" },
    { id: "results",  label: "実績紹介",        script: "これまで、幼稚園・保育園様や地域のコミュニティ向けに多数の体験会や教室を実施してきました。\n\n特に、完成物が残る活動は子どもたちからの満足度が高く、園様からも「継続したい」というお声をいただくことが多いです。\n\n個人向けの教室では300〜350名の生徒様が継続的に通われており、講師の指導力についても高い評価をいただいています。" },
    { id: "hearing",  label: "ヒアリング",      script: "すいません、ここまで一方的にお話ししてしまいました。\nここからは御園の現状や、「ここが気になる」と感じられた部分を伺えればと思っています。", bant: true },
    { id: "faq",      label: "Q&A",            script: "Q: 幼児でも参加できますか？\n→ はい、年齢や発達段階に合わせた内容に調整できます。\n\nQ: 安全面は大丈夫ですか？\n→ 講師が常にそばでサポートします。針・ミシンの使用は年齢・状況に応じて判断します。\n\nQ: 保護者向けプログラムも対応できますか？\n→ はい、保護者様向けや親子参加型プログラムも対応可能です。" },
    { id: "pricing",  label: "料金",            script: "想定参加人数10名のプランです。\n\nお試しプランが4万円。\n3ヶ月プランが18万円（月6万円相当）。\n6ヶ月プランが33万円（月5.5万円相当）。人気プランです。\n1年プランが60万円（月5万円相当）。最もお得です。\n\n人数・内容のご要望は別途ご相談いただけます。" },
    { id: "closing",  label: "クロージング",    script: "ありがとうございます。\nもしよろしければ、まずは御園の体制やご希望を伺いながら、最適なプランを具体化させていただければと思っています。\n\nたとえば「〇月〇日（〇曜日）」か「〇月〇日（〇曜日）」にお時間いただくことは可能でしょうか？\n\n① 「午前と午後はどちらがご都合よろしいでしょうか」\n② 「●時と●時ではどちらがよろしいでしょうか」\n③ 「では、●月●日の●時でお時間を頂戴できれば」" },
    { id: "obj",      label: "切り返し",        script: null, objections: true },
  ],

  event: [
    { id: "intro",    label: "イントロ",       script: "本日はお時間をいただきありがとうございます。\n株式会社aim roseの〇〇と申します。\n\n本日は、イベントやワークショップ向けにご提供している洋裁ワークショップについてご紹介できればと思っております。\n\n参加者の方に作品を持ち帰っていただける、体験型コンテンツとしてご活用いただけます。\nぜひ気軽にお聞きいただければ幸いです。" },
    { id: "ice",      label: "アイスブレイク",  script: "●●様、最初に1点お伺いしてもよろしいでしょうか？\n先日は突然のお電話にも関わらず、ご興味をいただけた理由を先にお伺いしてもよろしいでしょうか？\n\n（相手の回答を受ける）\n\nありがとうございます。そういった背景からご興味をお持ちいただいたんですね。\n\n現在のイベント・プログラムのご状況について、少しお聞かせいただけますでしょうか。\n体験型コンテンツの差別化や、参加者満足度についてどのような課題をお持ちでしょうか。\n\nなるほど、ありがとうございます。\nお話を伺っていると、弊社のサービスがお役に立てる場面が多そうだと感じました。" },
    { id: "overview", label: "サービス概要",    script: "弊社では、イベントやワークショップ向けに、講師が会場へ伺い、洋裁を楽しんでいただくプログラムをご提供しています。\n\n材料・道具はすべて講師が持参しますので、当日の準備負担ゼロで実施できます。\n\n講師は約10名在籍しており、現在は300〜350名ほどの生徒様に教室を提供している体制です。" },
    { id: "position", label: "ポジショニング",  script: "最近は、イベントの差別化・体験コンテンツへのニーズが高まっています。\n\n特に、「参加して終わり」ではなく、作品が手元に残る体験型プログラムへの関心が増えている印象です。\n\nそういった中で、洋裁のように「作品が残る」「達成感がある」「交流が生まれる」活動は、イベントの価値向上につながりやすいと考えております。" },
    { id: "usp",      label: "USP 3点",        script: "イベントにメリットがあるポイントを3つにまとめますね。\n\n一つ目は、準備不要・完結型の体験設計です。\n材料・道具はすべて講師が持参。当日の準備負担ゼロで実施できます。参加者は手ぶらでご参加いただけます。\n\n二つ目は、参加人数の柔軟な対応です。\n少人数のワークショップから大型イベントまで対応。複数回開催・時間分散での実施も可能です。\n\n最後に、経験豊富な講師の進行力です。\n現在300名以上の生徒様を指導する講師陣が担当。初めての方でも楽しめるよう丁寧にサポートします。" },
    { id: "service",  label: "基本サービス",    script: "まず、参加想定人数・会場環境・ご希望内容・日程を確認し、プランを設計します。\n\nイベントに合わせた制作物・材料を準備し、当日スムーズに進行できるよう調整します。\n\n当日は講師が会場へ伺い、参加者をサポートしながら楽しいワークショップを実施します。\n\nミシン環境のない会場でも手縫い中心の内容で対応可能です。" },
    { id: "results",  label: "実績紹介",        script: "これまで、地域イベントや施設向けに多数の体験会や教室を実施してきました。\n\n特に、完成物が残る活動は参加者からの満足度が高く、「また開催したい」というお声をいただくことが多いです。\n\n個人向けの教室では300〜350名の生徒様が継続的に通われており、講師の進行力についても高い評価をいただいています。" },
    { id: "hearing",  label: "ヒアリング",      script: "すいません、ここまで一方的にお話ししてしまいました。\nここからはイベントのご状況や、「ここが気になる」と感じられた部分を伺えればと思っています。", bant: true },
    { id: "faq",      label: "Q&A",            script: "Q: 当日の準備は必要ですか？\n→ 材料・道具はすべて講師が持参しますので、会場と参加者数のご連絡のみで大丈夫です。\n\nQ: 参加人数が多くても対応できますか？\n→ 複数講師対応や複数回開催も可能です。\n\nQ: 屋外イベントでも対応できますか？\n→ 手縫い中心の内容であれば屋外でも対応可能な場合があります。" },
    { id: "pricing",  label: "料金",            script: "想定参加人数10名のプランです。\n\nお試しプランが4万円。\n3ヶ月プランが18万円（月6万円相当）。\n6ヶ月プランが33万円（月5.5万円相当）。\n1年プランが60万円（月5万円相当）。\n\n人数・内容・開催回数のご要望は別途ご相談いただけます。" },
    { id: "closing",  label: "クロージング",    script: "ありがとうございます。\nもしよろしければ、まずはイベントの体制やご希望を伺いながら、最適なプランを具体化させていただければと思っています。\n\nたとえば「〇月〇日（〇曜日）」か「〇月〇日（〇曜日）」にお時間いただくことは可能でしょうか？\n\n① 「午前と午後はどちらがご都合よろしいでしょうか」\n② 「●時と●時ではどちらがよろしいでしょうか」\n③ 「では、●月●日の●時でお時間を頂戴できれば」" },
    { id: "obj",      label: "切り返し",        script: null, objections: true },
  ],
};

// ════════════════════════════════════════════════════════════════════
// CUSTOMER VIEW
// ════════════════════════════════════════════════════════════════════
const ALL_SECTION_IDS = ["intro","overview","classroom","position","usp","service","results","works","faq","pricing"];

function CSection({ id, bg, children }) {
  return (
    <section id={id} style={{ padding: "88px 0", background: bg || C.bg, borderBottom: `1px solid ${C.border}` }}>
      {children}
    </section>
  );
}

function Sidebar({ active, content }) {
  const [open, setOpen] = useState(false);
  const LABELS = { intro:"イントロ", overview:"サービス概要", classroom:"教室風景", position:"ポジショニング", usp:"USP", service:"基本サービス", results:"実績", works:"作品", faq:"Q&A", pricing:"料金" };
  const visible = ALL_SECTION_IDS.filter(id => {
    if (id === "classroom" && !content.hasClassroom) return false;
    if (id === "works" && !content.hasWorks) return false;
    return true;
  });
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, height: "100vh", width: open ? 220 : 48, background: C.white, borderRight: `1px solid ${C.border}`, zIndex: 100, transition: "width .35s", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "2px 0 12px #f2d0d040" }}>
      <button onClick={() => setOpen(o => !o)} style={{ padding: "16px", background: "none", border: "none", cursor: "pointer", color: C.pink, fontSize: 18, textAlign: "left", flexShrink: 0 }}>{open ? "←" : "☰"}</button>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {visible.map((id, i) => (
          <a key={id} href={`#${id}`} style={{ display: "block", padding: "10px 16px", color: active === id ? C.pink : C.muted, fontFamily: "'Noto Sans JP',sans-serif", fontSize: 12, textDecoration: "none", borderLeft: `2px solid ${active === id ? C.pink : "transparent"}`, whiteSpace: "nowrap", transition: "all .2s", background: active === id ? "#fff0ee" : "transparent" }}>
            <span style={{ opacity: 0.4, marginRight: 8, fontSize: 11 }}>{String(i + 1).padStart(2, "0")}</span>
            {open && LABELS[id]}
          </a>
        ))}
      </div>
    </nav>
  );
}

function CustomerView() {
  const [activeTarget, setActiveTarget] = useState("nursing");
  const content = CONTENT[activeTarget];
  const active = useActiveSection(ALL_SECTION_IDS);
  const W = { maxWidth: 900, margin: "0 auto", padding: "0 24px" };

  useSyncReceive(({ target, sectionId }) => {
    if (target && target !== activeTarget) setActiveTarget(target);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, target && target !== activeTarget ? 300 : 0);
  });

  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 200, background: C.border }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${C.rose},${C.pink})`, width: `${((ALL_SECTION_IDS.indexOf(active) + 1) / ALL_SECTION_IDS.length) * 100}%`, transition: "width .4s" }} />
      </div>
      <Sidebar active={active} content={content} />
      <main style={{ marginLeft: 48 }}>

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

        <CSection id="overview" bg={C.white}>
          <div style={W}>
            <H sub="SERVICE OVERVIEW">サービスのご紹介</H>
            <R d={0.05}><p style={{ fontSize: 16, color: C.muted, lineHeight: 2, marginBottom: 40 }}>経験豊富な講師が直接伺い、洋裁の楽しさをお届けします。</p></R>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 20, marginBottom: 32 }}>
              {content.stats.map((s, i) => (
                <R key={s.label} d={i * 0.1}><Card>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, background: `linear-gradient(135deg,${C.rose},${C.pink})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8, lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{s.label}</div>
                </Card></R>
              ))}
            </div>
            <R d={0.35}><div style={{ padding: "20px 28px", background: "linear-gradient(135deg,#fff0ee,#fce8f3)", border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 14, color: C.muted, lineHeight: 1.9 }}>
              <strong style={{ color: C.pink }}>環境対応力：</strong>{content.envNote}
            </div></R>
          </div>
        </CSection>

        {content.hasClassroom && (
          <CSection id="classroom" bg={C.bgAlt}>
            <div style={W}>
              <H sub="CLASS SCENE">実際の教室風景</H>
              <R d={0.05}><p style={{ fontSize: 15, color: C.muted, lineHeight: 2, marginBottom: 40 }}>講師が丁寧に寄り添いながら、参加者の皆様と楽しい時間を共有しています。</p></R>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
                {[{ src: "/classroom/class1.jpg", label: "丁寧な指導", desc: "一人ひとりのペースに合わせて、講師が丁寧にご説明します。" },{ src: "/classroom/class2.jpg", label: "賑やかな教室", desc: "布を囲みながら自然に会話が弾みます。笑顔があふれる時間です。" },{ src: "/classroom/class3.jpg", label: "布選びのサポート", desc: "好みの布を一緒に選ぶところから楽しんでいただけます。" }].map((item, i) => (
                  <R key={item.label} d={i * 0.1}>
                    <div style={{ borderRadius: 18, overflow: "hidden", border: `1.5px solid ${C.border}`, background: C.white }}>
                      <div style={{ aspectRatio: "4/3", overflow: "hidden" }}>
                        <img src={item.src} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .4s" }}
                          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
                      </div>
                      <div style={{ padding: "18px 22px" }}>
                        <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 6 }}>{item.label}</div>
                        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>{item.desc}</p>
                      </div>
                    </div>
                  </R>
                ))}
              </div>
            </div>
          </CSection>
        )}

        <CSection id="position" bg={content.hasClassroom ? C.white : C.bgAlt}>
          <div style={W}>
            <H sub="MARKET POSITIONING">{content.positionTitle}</H>
            <R d={0.1}><Card style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 13, color: C.pink, letterSpacing: "0.12em", marginBottom: 14, fontFamily: "'Noto Sans JP',sans-serif", fontWeight: 500 }}>{content.problemTitle}</div>
              {content.problems.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, fontSize: 14, color: C.muted, lineHeight: 1.8 }}>
                  <span style={{ color: C.rose, flexShrink: 0, marginTop: 3 }}>▶</span>{t}
                </div>
              ))}
            </Card></R>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
              {content.features.map((f, i) => (
                <R key={f.title} d={i * 0.1}><Card style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{f.body}</div>
                </Card></R>
              ))}
            </div>
          </div>
        </CSection>

        <CSection id="usp" bg={content.hasClassroom ? C.bgAlt : C.white}>
          <div style={W}>
            <H sub="WHY CHOOSE US">{content.uspTitle}</H>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {content.usps.map((r, i) => (
                <R key={r.n} d={i * 0.1}>
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

        <CSection id="service" bg={C.bgAlt}>
          <div style={W}>
            <H sub="SERVICE DETAILS">{content.serviceTitle}</H>
            <R d={0.1}><Card style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: C.pink }}>制作物例</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                {content.makeItems.map(item => <Chip key={item}>{item}</Chip>)}
                <span style={{ fontSize: 13, color: C.muted }}>※ご希望に合わせて調整可</span>
              </div>
            </Card></R>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginBottom: 24 }}>
              {content.steps.map((s, i) => (
                <R key={s.n} d={i * 0.15}><Card style={{ textAlign: "center", position: "relative" }}>
                  <div style={{ position: "absolute", top: 14, right: 18, fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 900, color: `${C.rose}20` }}>{s.n}</div>
                  <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 17, color: C.text, marginBottom: 10 }}>{s.title}</div>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.9 }}>{s.body}</p>
                </Card></R>
              ))}
            </div>
          </div>
        </CSection>

        <CSection id="results" bg={C.white}>
          <div style={W}>
            <H sub="TRACK RECORD">{content.resultTitle}</H>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
              {content.results.map((r, i) => (
                <R key={r.title} d={i * 0.1}>
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

        {content.hasWorks && (
          <CSection id="works" bg={C.white}>
            <div style={W}>
              <H sub="GALLERY">制作物ギャラリー</H>
              <R d={0.05}><p style={{ fontSize: 15, color: C.muted, lineHeight: 2, marginBottom: 40 }}>実際にご入居者様が制作された作品の一例です。布の選び方・デザインはお一人おひとりの個性が光ります。</p></R>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
                {[{ src: "/works/work1.png", label: "眼鏡ケース", desc: "和柄生地を使ったオリジナル眼鏡ケース。マグネットボタン付き。" },{ src: "/works/work2.png", label: "巾着袋", desc: "リボン結びが華やかな巾着袋。プレゼントにも喜ばれています。" }].map((item, i) => (
                  <R key={item.label} d={i * 0.1}>
                    <div style={{ borderRadius: 18, overflow: "hidden", border: `1.5px solid ${C.border}`, background: C.white }}>
                      <div style={{ aspectRatio: "3/4", overflow: "hidden", background: C.bgAlt }}>
                        <img src={item.src} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .4s" }}
                          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
                      </div>
                      <div style={{ padding: "20px 22px" }}>
                        <div style={{ fontFamily: "'Noto Serif JP',serif", fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 6 }}>{item.label}</div>
                        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>{item.desc}</p>
                      </div>
                    </div>
                  </R>
                ))}
              </div>
            </div>
          </CSection>
        )}

        <CSection id="faq" bg={C.bgAlt}>
          <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
            <H sub="FAQ">よくあるご質問</H>
            {content.faqs.map((item, i) => <QAItem key={item.q} q={item.q} a={item.a} delay={i * 0.05} />)}
          </div>
        </CSection>

        <section id="pricing" style={{ background: C.bg, padding: "88px 0" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
            <H sub="PRICING">料金プラン</H>
            <R d={0.05}><p style={{ fontSize: 14, color: C.muted, lineHeight: 2, marginBottom: 40 }}>※ 想定参加人数10名のプランです。人数が異なる場合はお気軽にご相談ください。</p></R>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20, marginBottom: 32 }}>
              {[{ name: "お試しプラン", duration: "1回", price: "40,000", note: "まずはお試しで", highlight: false },{ name: "3ヶ月プラン", duration: "3ヶ月", price: "180,000", note: "月60,000円相当", highlight: false },{ name: "6ヶ月プラン", duration: "6ヶ月", price: "330,000", note: "月55,000円相当", highlight: true },{ name: "1年プラン", duration: "12ヶ月", price: "600,000", note: "月50,000円相当", highlight: false }].map((plan, i) => (
                <R key={plan.name} d={i * 0.1}>
                  <div style={{ borderRadius: 20, border: plan.highlight ? `2px solid ${C.rose}` : `1.5px solid ${C.border}`, background: plan.highlight ? "linear-gradient(160deg,#fff0ee,#fce8f3)" : C.white, padding: "32px 20px", textAlign: "center", position: "relative", boxShadow: plan.highlight ? `0 8px 40px ${C.rose}20` : "none" }}>
                    {plan.highlight && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg,${C.rose},${C.pink})`, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: 50, whiteSpace: "nowrap" }}>人気プラン</div>}
                    <div style={{ fontFamily: "'Noto Sans JP',sans-serif", fontSize: 12, color: C.pink, letterSpacing: "0.12em", marginBottom: 10, fontWeight: 500 }}>{plan.name}</div>
                    <div style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 13, color: C.muted, marginBottom: 16 }}>{plan.duration}</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,38px)", fontWeight: 900, background: `linear-gradient(135deg,${C.rose},${C.pink})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>¥{plan.price}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>{plan.note}</div>
                  </div>
                </R>
              ))}
            </div>
            <R d={0.4}><div style={{ padding: "20px 28px", background: "linear-gradient(135deg,#fff0ee,#fce8f3)", border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 14, color: C.muted, lineHeight: 1.9, marginBottom: 40 }}>
              <strong style={{ color: C.pink }}>人数追加・カスタマイズ：</strong>参加人数が10名を超える場合や、開催頻度・内容のご要望は、別途ご相談のうえ柔軟に対応いたします。
            </div></R>
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

      </main>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════
// PRESENTER VIEW
// ════════════════════════════════════════════════════════════════════
function ScriptBlock({ text }) {
  return (
    <div style={{ background: "#f0fff0", border: "1.5px solid #a0d4a0", borderRadius: 12, padding: "20px 24px", fontFamily: "'Noto Sans JP',sans-serif", fontSize: 14, lineHeight: 2.2, color: "#2a4a2a", whiteSpace: "pre-wrap", marginTop: 16 }}>
      {text}
    </div>
  );
}

function BantItem({ label, q, checked, onToggle }) {
  return (
    <div onClick={onToggle} style={{ padding: "14px 18px", borderRadius: 12, border: `1.5px solid ${checked ? C.rose + "80" : C.border}`, background: checked ? "#fff5f3" : C.white, cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10, userSelect: "none", transition: "all .2s" }}>
      <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked ? C.rose : C.border}`, background: checked ? C.rose : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", transition: "all .2s" }}>{checked && "✓"}</div>
      <div>
        <div style={{ fontSize: 11, color: C.pink, letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{q}</div>
      </div>
    </div>
  );
}

function ObjectionCard({ label, response }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(o => !o)} style={{ borderRadius: 14, border: `1.5px solid ${open ? C.rose + "80" : C.border}`, background: open ? "#fff5f3" : C.white, cursor: "pointer", overflow: "hidden", marginBottom: 12, userSelect: "none" }}>
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 15, color: C.text, fontWeight: 700 }}>「{label}」と言われたら</span>
        <span style={{ color: C.pink, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </div>
      <div style={{ maxHeight: open ? 300 : 0, overflow: "hidden", transition: "max-height .3s ease" }}>
        <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ marginTop: 14, padding: "14px 18px", background: "#f0fff0", borderRadius: 10, borderLeft: "3px solid #a0d4a0", fontSize: 13, color: "#2a4a2a", lineHeight: 2 }}>{response}</div>
        </div>
      </div>
    </div>
  );
}

function PresenterView() {
  const [activeTarget, setActiveTarget] = useState("nursing");
  const [current, setCurrent] = useState(0);
  const [bantChecked, setBantChecked] = useState([false, false, false, false]);
  const sendSync = useSyncSend();

  const sections = P_SECTIONS_BY_TARGET[activeTarget];
  const total = sections.length;
  const sec = sections[current];
  const tc = TARGET_COLORS[activeTarget];

  const go = (idx) => {
    if (idx < 0 || idx >= total) return;
    setCurrent(idx);
  };

  const changeTarget = (t) => {
    setActiveTarget(t);
    setCurrent(0);
    setBantChecked([false, false, false, false]);
  };

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

  const cmap = CUSTOMER_MAPS[activeTarget];
  const isLinked = !!cmap[sec.id];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Noto Sans JP',sans-serif" }}>

      {/* Top bar */}
      <div style={{ background: "#f0fff0", borderBottom: "1.5px solid #a0d4a0", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>🎯</span>
          <span style={{ fontSize: 13, color: "#2a6a2a", fontWeight: 700, letterSpacing: "0.08em" }}>PRESENTER MODE — 営業担当専用</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.muted }}>{current + 1} / {total}</span>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.muted, textDecoration: "none", border: `1px solid ${C.border}`, padding: "6px 14px", borderRadius: 50, background: C.white }}>顧客画面 →</a>
        </div>
      </div>

      {/* Target selector */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", gap: 10, flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: C.muted, alignSelf: "center", marginRight: 4, whiteSpace: "nowrap" }}>ターゲット：</div>
        {Object.entries(TARGET_COLORS).map(([key, val]) => (
          <button key={key} onClick={() => changeTarget(key)} style={{ padding: "8px 20px", borderRadius: 50, border: `2px solid ${activeTarget === key ? val.main : C.border}`, background: activeTarget === key ? val.main : C.white, color: activeTarget === key ? "#fff" : C.muted, cursor: "pointer", fontSize: 13, fontWeight: activeTarget === key ? 700 : 400, transition: "all .2s", whiteSpace: "nowrap" }}>
            {val.label}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: C.border, flexShrink: 0 }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${tc.main},${tc.dark})`, width: `${((current + 1) / total) * 100}%`, transition: "width .3s" }} />
      </div>

      {/* Section tabs */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 24px", overflowX: "auto", flexShrink: 0, display: "flex" }}>
        {sections.map((s, i) => (
          <button key={s.id} onClick={() => go(i)} style={{ padding: "12px 16px", background: "none", border: "none", borderBottom: `2px solid ${i === current ? tc.main : "transparent"}`, cursor: "pointer", whiteSpace: "nowrap", fontSize: 12, color: i === current ? tc.dark : C.muted, fontWeight: i === current ? 700 : 400, transition: "all .2s", flexShrink: 0 }}>
            <span style={{ opacity: 0.5, marginRight: 5 }}>{String(i + 1).padStart(2, "0")}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: isLinked ? tc.main : C.muted, letterSpacing: "0.2em", marginBottom: 8 }}>
              {isLinked ? "🔗 顧客画面と連動" : "📋 カンペのみ（顧客画面は動かない）"}
            </div>
            <h2 style={{ fontFamily: "'Noto Serif JP',serif", fontSize: 22, fontWeight: 700, color: C.text }}>{sec.label}</h2>
          </div>

          {sec.script && <ScriptBlock text={sec.script} />}

          {sec.bant && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 12, color: C.pink, letterSpacing: "0.15em", marginBottom: 14 }}>BANT チェックリスト</div>
              {BANT.map((b, i) => (
                <BantItem key={i} label={b.label} q={b.q} checked={bantChecked[i]} onToggle={() => setBantChecked(p => { const n = [...p]; n[i] = !n[i]; return n; })} />
              ))}
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

      {/* Bottom nav */}
      <div style={{ background: C.white, borderTop: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <button onClick={() => go(current - 1)} disabled={current === 0} style={{ padding: "12px 28px", borderRadius: 50, border: `1.5px solid ${C.border}`, background: C.white, cursor: current === 0 ? "not-allowed" : "pointer", fontSize: 14, color: current === 0 ? C.border : C.muted }}>← 前へ</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>← → キーでも操作</div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            {sections.map((_, i) => (
              <div key={i} onClick={() => go(i)} style={{ width: i === current ? 20 : 8, height: 8, borderRadius: 4, background: i === current ? tc.main : C.border, cursor: "pointer", transition: "all .3s" }} />
            ))}
          </div>
        </div>
        <button onClick={() => go(current + 1)} disabled={current === total - 1} style={{ padding: "12px 28px", borderRadius: 50, border: "none", background: current === total - 1 ? C.border : `linear-gradient(135deg,${tc.main},${tc.dark})`, cursor: current === total - 1 ? "not-allowed" : "pointer", fontSize: 14, color: "#fff", fontWeight: 500 }}>次へ →</button>
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
