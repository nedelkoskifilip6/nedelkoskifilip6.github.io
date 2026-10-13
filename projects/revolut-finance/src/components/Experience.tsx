import { useState, useId, useEffect, useRef } from "react";
import { useDialogLifecycle } from "./DemoDialog";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Wallet,
  Plus,
  Snowflake,
  ShieldCheck,
  Fingerprint,
  Bell,
  Lock,
  Check,
  X,
  Globe,
} from "lucide-react";
const assetBase = import.meta.env.BASE_URL.replace(/\/$/, "");
function BrandLogo({
  white = false,
  className = "",
}: {
  white?: boolean;
  className?: string;
}) {
  return (
    <img
      className={"revolut-logo " + className}
      src={`${assetBase}/brand/revolut-${white ? "white" : "black"}.svg`}
      alt="Revolut"
      width="110"
      height="28"
    />
  );
}

const money = (n: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
/** A short, local count animation; screen readers always receive the final value. */
function AnimatedMoney({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const element = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);
  const revealed = useRef(false);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    const finish = () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      setDisplay(value);
      previous.current = value;
      revealed.current = true;
    };
    const animate = () => {
      if (motion.matches) { finish(); return; }
      const from = revealed.current ? previous.current : value * 0.92;
      revealed.current = true;
      const started = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - started) / 680);
        const eased = 1 - Math.pow(1 - progress, 3);
        previous.current = from + (value - from) * eased;
        setDisplay(previous.current);
        if (progress < 1) frame = requestAnimationFrame(tick);
        else previous.current = value;
      };
      frame = requestAnimationFrame(tick);
    };
    if (motion.matches) finish();
    else if (revealed.current) animate();
    else if (element.current) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          observer?.disconnect();
          animate();
        }
      }, { threshold: 0.6 });
      observer.observe(element.current);
    }
    const onPreference = () => { if (motion.matches) finish(); };
    motion.addEventListener("change", onPreference);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      motion.removeEventListener("change", onPreference);
    };
  }, [value]);
  return <span ref={element} className="animated-money" role="img" aria-label={money(value)}><span aria-hidden="true">{money(display)}</span></span>;
}


const transactions = [
  {
    name: "Studio North",
    detail: "Salary · Today, 09:41",
    value: 3200,
    type: "Income",
    icon: "S",
    color: "violet",
  },
  {
    name: "Aesop",
    detail: "Shopping · Today, 12:24",
    value: -48,
    type: "Shopping",
    icon: "A",
    color: "sand",
  },
  {
    name: "Blue Bottle",
    detail: "Food & drink · Yesterday",
    value: -6.8,
    type: "Lifestyle",
    icon: "☕",
    color: "blue",
  },
  {
    name: "Airbnb",
    detail: "Travel · 06 October",
    value: -285,
    type: "Travel",
    icon: "◎",
    color: "pink",
  },
];
const spending = [
  { name: "May", value: 940 },
  { name: "Jun", value: 1300 },
  { name: "Jul", value: 1050 },
  { name: "Aug", value: 1680 },
  { name: "Sep", value: 1390 },
  { name: "Oct", value: 1140 },
];
function Chart({
  investment = false,
  range = "1M",
}: {
  investment?: boolean;
  range?: string;
}) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAnimate(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  const id = useId().replace(/:/g, "");
  const data = investment
    ? Array.from({ length: 18 }, (_, i) => {
        const end = range === "1W" ? 21320 : range === "1Y" ? 28940 : 24680;
        const gain = range === "1W" ? 0.0213 : range === "1Y" ? 0.1842 : 0.0824;
        const start = end / (1 + gain);
        return {
          name: String(i + 1),
          value:
            start +
            ((end - start) * i) / 17 +
            Math.sin(i * 1.5) * Math.sin((Math.PI * i) / 17) * 240,
        };
      })
    : spending;
  return (
    <div
      className="chart"
      role="group"
      aria-label={
        investment
          ? `Simulated portfolio performance, ${range === "1W" ? "one week" : range === "1Y" ? "one year" : "one month"}, from ${money(data[0].value)} to ${money(data[data.length - 1].value)}.`
          : `Monthly demonstration spending: ${spending.map(point => `${point.name} ${money(point.value)}`).join(", ")}.`
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 15, left: 5, right: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#71917e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#71917e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="currentColor"
            opacity={0.08}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#737b72", fontSize: 11 }}
            interval={investment ? 4 : 0}
          />
          {investment && <YAxis hide domain={["dataMin - 200", "dataMax + 200"]} />}
          <Tooltip
            formatter={(v) => money(Number(v))}
            contentStyle={{
              background: "#22222a",
              border: "1px solid #454550",
              borderRadius: 12,
              color: "#fff",
            }}
            labelFormatter={(v) => (investment ? "Demo day " + v : v)}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#71917e"
            strokeWidth={2.5}
            fill={"url(#" + id + ")"}
            isAnimationActive={animate}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
/** Motion starts after React has committed, so GSAP never mutates SSR markup. */
function useMotionReady() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    element.dataset.motionReady = "true";
    element.dispatchEvent(new Event("fintech:motion-ready"));
    return () => { delete element.dataset.motionReady; };
  }, []);
  return root;
}

export function Phone() {
  const [tab, setTab] = useState("Home");
  return (
    <div className="phone">
      <div className="phone-top">
        <span>9:41</span>
        <div className="island" />
        <span>••• ▰</span>
      </div>
      <div className="phone-app">
        <div className="phone-user">
          <span className="avatar">JD</span>
          <span>Good morning, Jamie</span>
          <span>◉</span>
        </div>
        <div className="phone-balance">
          <span>
            {tab === "Savings"
              ? "Your savings"
              : tab === "Cards"
                ? "Available to spend"
                : tab === "Invest"
                  ? "Portfolio value"
                  : "Total balance"}
          </span>
          <strong>{tab === "Savings" ? "€6,240.00" : "€24,680.50"}</strong>
          <small>
            Euro account 
          </small>
        </div>
        <div className="phone-buttons">
          {[
            [Plus, "Add money"],
            [Wallet, "Send"],
            [Globe, "Exchange"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof Plus;
            return (
              <a
                key={String(label)}
                href={label === "Exchange" ? "#payments" : "#banking"}
              >
                <span>
                  <I size={18} />
                </span>
                {String(label)}
              </a>
            );
          })}
        </div>
        <div className="mini-card">
          <BrandLogo className="product-logo" />
          <Globe size={17} />
          <small>•••• 2048</small>
          <b>VISA</b>
        </div>
        <div className="phone-transactions">
          <b>
            {tab === "Savings"
              ? "Your goals"
              : tab === "Cards"
                ? "Card activity"
                : tab === "Invest"
                  ? "Your holdings"
                  : "Transactions"}
          </b>
          <a href="#banking">View all</a>
        </div>
        {(tab === "Savings"
          ? [
              {
                name: "Travel fund",
                type: "60% of goal",
                value: 2400,
                icon: "◎",
                color: "violet",
              },
              {
                name: "New studio",
                type: "48% of goal",
                value: 3840,
                icon: "⌘",
                color: "blue",
              },
            ]
          : tab === "Invest"
            ? [
                {
                  name: "Global equities",
                  type: "60% allocation",
                  value: 14808.3,
                  icon: "◉",
                  color: "violet",
                },
                {
                  name: "Bonds",
                  type: "25% allocation",
                  value: 6170.13,
                  icon: "◎",
                  color: "blue",
                },
                {
                  name: "Alternatives",
                  type: "15% allocation",
                  value: 3702.07,
                  icon: "◇",
                  color: "sand",
                },
              ]
            : transactions.slice(1)
        ).map((t) => (
          <div className="phone-row" key={t.name}>
            <i className={t.color}>{t.icon}</i>
            <div>
              <b>{t.name}</b>
              <small>{t.type}</small>
            </div>
            <b>{money(t.value)}</b>
          </div>
        ))}
        <div className="phone-bottom">
          {["Home", "Cards", "Savings", "Invest"].map((t) => (
            <button
              className={tab === t ? "active" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {t === "Home"
                ? "◉"
                : t === "Cards"
                  ? "▣"
                  : t === "Savings"
                    ? "◎"
                    : "◈"}
              <small>{t}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
export function Banking() {
  const motionRoot = useMotionReady();
  const [filter, setFilter] = useState("All");
  return (
    <div ref={motionRoot} className="dashboard light">
      <div className="dashboard-header">
        <div>
          <span className="label">YOUR OVERVIEW</span>
          <h3>A little clarity. A lot of possibility.</h3>
        </div>
        <span className="badge">Demo account</span>
      </div>
      <div className="balance-grid">
        <div>
          <span>Total balance</span>
          <strong><AnimatedMoney value={24680.5} /></strong>
          <small className="positive"> €3,200 income this month</small>
        </div>
        <div className="balance-mini">
          <span>Monthly spending</span>
          <strong><AnimatedMoney value={1140.8} /></strong>
          <small> 18% from last month</small>
        </div>
      </div>
      <div className="banking-grid">
        <div>
          <div className="row-between">
            <b>Spending insights</b>
            <span className="muted">May — Oct</span>
          </div>
          <Chart />
          <div className="categories">
            <span>
              <i />
              Lifestyle <b>42%</b>
            </span>
            <span>
              <i />
              Travel <b>35%</b>
            </span>
            <span>
              <i />
              Shopping <b>23%</b>
            </span>
          </div>
        </div>
        <div>
          <div className="row-between">
            <b>Recent activity</b>
            <span className="muted">October</span>
          </div>
          <div className="filter" aria-label="Transaction filters">
            {["All", "Income", "Shopping", "Travel", "Lifestyle"].map((f) => (
              <button
                className={f === filter ? "selected" : ""}
                key={f}
                aria-pressed={f === filter}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div aria-live="polite">
            {transactions
              .filter((t) => filter === "All" || t.type === filter)
              .map((t) => (
                <div className="transaction" key={t.name}>
                  <span className={"transaction-icon " + t.color}>
                    {t.icon}
                  </span>
                  <div>
                    <b>{t.name}</b>
                    <small>{t.detail}</small>
                  </div>
                  <strong className={t.value > 0 ? "positive" : ""}>
                    {t.value > 0 ? "+" : ""}
                    {money(t.value)}
                  </strong>
                </div>
              ))}
          </div>
        </div>
      </div>
      <a className="dashboard-goal" href="#savings">
        <span>◎</span>
        <div>
          <b>Your next adventure</b>
          <small>€2,400 of €4,000 saved</small>
        </div>
        <div className="progress">
          <i style={{ width: "60%" }} />
        </div>
        
      </a>
    </div>
  );
}
const rates: Record<string, number> = {
  EUR: 1,
  USD: 1.09,
  GBP: 0.86,
  JPY: 162.4,
  CHF: 0.96,
  MKD: 61.5,
};
export function Exchange() {
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState(1000);
  const [done, setDone] = useState(false);
  const result = (amount / rates[from]) * rates[to];
  return (
    <div className="exchange-panel">
      <div className="row-between">
        <b>Exchange money</b>
        <span className="badge">Demo</span>
      </div>
      <div className="exchange-field">
        <label htmlFor="amount">You exchange</label>
        <div>
          <input
            id="amount"
            type="number"
            min="0"
            max="100000000"
            value={amount}
            onChange={(e) => {
              setAmount(
                Math.min(100000000, Math.max(0, Number(e.target.value))),
              );
              setDone(false);
            }}
          />
          <label className="sr-only" htmlFor="from">
            From currency
          </label>
          <select
            id="from"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setDone(false);
            }}
          >
            {Object.keys(rates).map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <small>Demonstration balance: {money(24680.5)}</small>
      </div>
      <button
        className="swap"
        aria-label="Swap currencies"
        onClick={() => {
          setFrom(to);
          setTo(from);
          setDone(false);
        }}
      >
        <span>Swap</span>
      </button>
      <div className="exchange-field">
        <label htmlFor="to">You receive</label>
        <div>
          <output aria-live="polite">
            {result.toLocaleString("en-US", {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            })}
          </output>
          <select
            id="to"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setDone(false);
            }}
          >
            {Object.keys(rates).map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="rate">
        1 {from} = {(rates[to] / rates[from]).toFixed(4)} {to}{" "}
        <span>Illustrative fixed rate</span>
      </p>
      <button className="button wide" onClick={() => setDone(true)}>
        {done ? (
          <>
            <Check size={18} /> Exchange preview complete
          </>
        ) : (
          <>
            Preview exchange 
          </>
        )}
      </button>
      <p className="fine" aria-live="polite">
        {done
          ? "Simulation only. No money has been moved."
          : "No fees, funds or live rates are involved in this demo."}
      </p>
    </div>
  );
}
export function Cards() {
  const motionRoot = useMotionReady();
  const [finish, setFinish] = useState("Silver");
  const [virtual, setVirtual] = useState(false);
  const [canTilt, setCanTilt] = useState(false);
  const paymentCard = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const enabled = hover.matches && !motion.matches;
      setCanTilt(enabled);
      if (!enabled) {
        paymentCard.current?.style.removeProperty("--card-rotate-x");
        paymentCard.current?.style.removeProperty("--card-rotate-y");
      }
    };
    update();
    hover.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      hover.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);
  return (
    <div ref={motionRoot} className="cards-experience">
      <div className="card-stage">
        <div
          ref={paymentCard}
          className={
            "payment-card " + finish.toLowerCase() + (virtual ? " virtual" : "")
          }
          onPointerMove={(e) => {
            if (!canTilt || e.pointerType === "touch") return;
            const r = e.currentTarget.getBoundingClientRect();
            const clamp = (value: number) => Math.max(-10, Math.min(10, value));
            const x = clamp(-((e.clientY - r.top) / r.height - 0.5) * 20);
            const y = clamp(((e.clientX - r.left) / r.width - 0.5) * 20);
            e.currentTarget.style.setProperty("--card-rotate-x", x + "deg");
            e.currentTarget.style.setProperty("--card-rotate-y", y + "deg");
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.removeProperty("--card-rotate-x");
            e.currentTarget.style.removeProperty("--card-rotate-y");
          }}
          onPointerCancel={(e) => {
            e.currentTarget.style.removeProperty("--card-rotate-x");
            e.currentTarget.style.removeProperty("--card-rotate-y");
          }}
        >
          <div className="row-between">
            <span className="card-brand">
              <BrandLogo white={finish === "Graphite" || virtual} />
            </span>
            <Globe />
          </div>
          <div className="chip">▥</div>
          <div className="card-detail">
            <span>
              JAMIE DAVIS<small>•••• •••• •••• 2048 · DEMO</small>
            </span>
            <b>VISA</b>
          </div>
          {virtual && <span className="virtual-label">VIRTUAL</span>}
        </div>
        <div className="card-shadow" />
      </div>
      <div className="card-controls">
        <div className="finish-options" aria-label="Choose card finish">
          {["Silver", "Graphite", "Champagne"].map((f) => (
            <button
              key={f}
              className={f === finish ? "selected" : ""}
              aria-pressed={f === finish}
              onClick={() => setFinish(f)}
            >
              <i className={f.toLowerCase()} />
              {f}
            </button>
          ))}
        </div>
        <button className="text-button" aria-pressed={virtual} onClick={() => setVirtual(!virtual)}>
          {virtual ? "View physical card" : "Explore virtual card"}{" "}
          
        </button>
      </div>
      <p className="fine">
        {virtual
          ? "Instantly virtual. A fictional digital card concept."
          : finish + " finish. " + (canTilt ? "Move your cursor to explore the details." : "Select a finish to explore the details.")}
      </p>
    </div>
  );
}
export function Savings() {
  const goals = [
    {
      name: "A little further away",
      desc: "Travel fund",
      saved: 2400,
      target: 4000,
      icon: "◎",
    },
    {
      name: "Space to create",
      desc: "New studio",
      saved: 3840,
      target: 8000,
      icon: "⌘",
    },
    {
      name: "Ready for anything",
      desc: "Rainy day",
      saved: 1800,
      target: 6000,
      icon: "☂",
    },
  ];
  const [selected, setSelected] = useState(0);
  const [monthly, setMonthly] = useState(200);
  const [months, setMonths] = useState(6);
  const g = goals[selected];
  const projected = Math.min(g.target, g.saved + monthly * months);
  return (
    <div>
      <div className="goal-grid">
        {goals.map((goal, i) => (
          <button
            className={"goal-card " + (i === selected ? "selected" : "")}
            key={goal.name}
            onClick={() => setSelected(i)}
            aria-pressed={i === selected}
          >
            <span className="goal-icon">{goal.icon}</span>
            <small>{goal.desc}</small>
            <h3>{goal.name}</h3>
            <div className="row-between">
              <b>{money(goal.saved)}</b>
              <span>of {money(goal.target)}</span>
            </div>
            <div className="progress">
              <i style={{ width: (goal.saved / goal.target) * 100 + "%" }} />
            </div>
          </button>
        ))}
      </div>
      <div className="savings-calculator">
        <div>
          <span className="label">BUILD YOUR MOMENTUM</span>
          <h3>
            A small habit.
            <br />A bigger future.
          </h3>
          <p>
            See where a little consistency could take you.
            <br />
            No interest assumed. Just your contributions.
          </p>
        </div>
        <div className="calculator-controls">
          <div className="row-between">
            <label htmlFor="contribution">Monthly contribution</label>
            <b>{money(monthly)}</b>
          </div>
          <input
            id="contribution"
            type="range"
            min="25"
            max="1000"
            step="25"
            value={monthly}
            aria-valuetext={money(monthly) + " per month"}
            onChange={(e) => setMonthly(Number(e.target.value))}
          />
          <div className="row-between">
            <label htmlFor="months">Plan ahead</label>
            <select
              id="months"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
            >
              {[3, 6, 12, 24].map((m) => (
                <option key={m} value={m}>
                  {m} months
                </option>
              ))}
            </select>
          </div>
          <div className="projected" aria-live="polite">
            <span>Projected savings · {g.desc}</span>
            <strong>{money(projected)}</strong>
            <div className="progress" role="progressbar" aria-label={g.desc + " projected goal progress"} aria-valuemin={0} aria-valuemax={g.target} aria-valuenow={projected} aria-valuetext={money(projected) + " of " + money(g.target)}>
              <i style={{ width: (projected / g.target) * 100 + "%" }} />
            </div>
            <small>
              {Math.ceil((g.target - g.saved) / monthly)} months to your goal at
              this contribution
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
export function Security() {
  const [frozen, setFrozen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(true);
  return (
    <div className="security-ui">
      <div className={"security-card " + (frozen ? "frozen" : "")}>
        <BrandLogo white className="product-logo" />
        {frozen ? <Snowflake size={48} /> : <ShieldCheck size={48} />}
        <b>{frozen ? "Card frozen" : "You’re in control"}</b>
        <small>Virtual card •••• 2048</small>
        <button
          className="button"
          onClick={() => setFrozen(!frozen)}
          aria-pressed={frozen}
        >
          {frozen ? "Unfreeze card" : "Freeze card"} <Snowflake size={17} />
        </button>
        <p aria-live="polite">
          {frozen
            ? "Demo payments are paused. Unfreeze anytime."
            : "Your demonstration card is active."}
        </p>
      </div>
      <div className="security-controls">
        <div>
          <Fingerprint />
          <span>
            <b>A touch of reassurance</b>
            <small>Biometric authentication concept</small>
          </span>
          <Check size={17} />
        </div>
        <div>
          <Bell />
          <span>
            <b>Stay in the know</b>
            <small>Demo transaction notifications</small>
          </span>
          <button
            className={"switch " + (notifications ? "on" : "")}
            role="switch"
            aria-label="Transaction notifications"
            aria-checked={notifications}
            onClick={() => setNotifications(!notifications)}
          />
        </div>
        <div>
          <Lock />
          <span>
            <b>Your privacy, your rules</b>
            <small>Hide balance in demo previews</small>
          </span>
          <button
            className={"switch " + (privacy ? "on" : "")}
            role="switch"
            aria-label="Hide balance"
            aria-checked={privacy}
            onClick={() => setPrivacy(!privacy)}
          />
        </div>
        <div className="privacy-preview">
          <small>Preview balance</small>
          <b>{privacy ? "€ ••••••" : "€24,680.50"}</b>
          <span>
            {notifications ? "Notifications enabled" : "Notifications muted"}
          </span>
        </div>
      </div>
    </div>
  );
}
export function Investments() {
  const motionRoot = useMotionReady();
  const [range, setRange] = useState("1M");
  const value = range === "1W" ? 21320 : range === "1Y" ? 28940 : 24680;
  return (
    <div ref={motionRoot} className="investment-panel">
      <div className="row-between">
        <span className="label">YOUR PORTFOLIO</span>
        <span className="badge">Simulated market data</span>
      </div>
      <strong className="portfolio-value"><AnimatedMoney value={value} /></strong>
      <span className="positive">
         {range === "1Y" ? "18.42" : range === "1W" ? "2.13" : "8.24"}%{" "}
        <span className="muted">over selected period</span>
      </span>
      <Chart investment range={range} />
      <div className="range-filter" role="group" aria-label="Portfolio time range">
        {["1W", "1M", "1Y"].map((r) => (
          <button
            key={r}
            className={r === range ? "selected" : ""}
            aria-pressed={r === range}
            onClick={() => setRange(r)}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="asset-grid">
        <div>
          <span>◉</span>
          <b>Global equities</b>
          <small>60% allocation</small>
          <strong>+8.2%</strong>
        </div>
        <div>
          <span>◎</span>
          <b>Bonds</b>
          <small>25% allocation</small>
          <strong>+2.1%</strong>
        </div>
        <div>
          <span>◇</span>
          <b>Alternatives</b>
          <small>15% allocation</small>
          <strong>−1.4%</strong>
        </div>
      </div>
      <p className="fine">
        Illustrative assets and performance. No trading or investment advice.
      </p>
    </div>
  );
}
export function Plans() {
  const [yearly, setYearly] = useState(false);
  const [chosen, setChosen] = useState("");
  const { dialog, captureOpener, focusSectionOnClose } = useDialogLifecycle(Boolean(chosen));
  const plans = [
    {
      name: "Essential",
      price: 0,
      desc: "Your everyday, elevated.",
      features: [
        "Everyday banking preview",
        "Virtual card concept",
        "Spending insights",
      ],
    },
    {
      name: "Plus",
      price: 4,
      desc: "A little more possibility.",
      features: [
        "Everything in Essential",
        "Savings goal planner",
        "Global exchange preview",
      ],
    },
    {
      name: "Premium",
      price: 9,
      desc: "Made for a bigger world.",
      features: [
        "Everything in Plus",
        "Premium card finishes",
        "Investment dashboard",
      ],
    },
    {
      name: "Ultra",
      price: 24,
      desc: "Extraordinary, by design.",
      features: [
        "Everything in Premium",
        "Platinum card concept",
        "Complete demo experience",
      ],
    },
  ];
  return (
    <>
      <div className="pricing-switch" role="group" aria-label="Billing period">
        <button
          className={!yearly ? "selected" : ""}
          onClick={() => setYearly(false)}
          aria-pressed={!yearly}
        >
          Monthly
        </button>
        <button
          className={yearly ? "selected" : ""}
          onClick={() => setYearly(true)}
          aria-pressed={yearly}
        >
          Yearly <span>Save 20%</span>
        </button>
      </div>
      <div className="plan-grid">
        {plans.map((p, i) => (
          <article
            key={p.name}
            className={"plan " + (i === 2 ? "featured" : "")}
          >
            <div className="row-between">
              <h3>{p.name}</h3>
              {i === 2 && <span className="badge">Most popular</span>}
            </div>
            <p>{p.desc}</p>
            <div className="plan-price">
              €
              {(yearly ? p.price * 0.8 : p.price).toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
              <span>/ month</span>
            </div>
            <small>
              {yearly
                ? `€${(p.price * 0.8 * 12).toFixed(2)} billed yearly (fictional)`
                : "Fictional demo pricing"}
            </small>
            <button className="button wide" onClick={event => { captureOpener(event.currentTarget); setChosen(p.name); }}>
              Explore {p.name}
              
            </button>
            <ul>
              {p.features.map((f) => (
                <li key={f}>
                  <Check size={15} />
                  {f}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      {chosen && (
        <div className="modal-backdrop" onClick={() => setChosen("")}>
          <div
            ref={dialog}
            className="demo-modal"
            role="dialog"
            aria-modal="true"
            aria-label={chosen + " plan preview"}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="close-modal"
              aria-label="Close plan preview"
              onClick={() => setChosen("")}
            >
              <X />
            </button>
            <span className="label">PLAN PREVIEW</span>
            <h3>
              {chosen}.<br />
              Your possibilities.
            </h3>
            <p>
              This is a fictional portfolio plan. Explore the banking, card,
              savings and investment demonstrations without signing up or
              purchasing anything.
            </p>
            <a className="button" href="#banking" onClick={() => { focusSectionOnClose("banking"); setChosen(""); }}>
              Explore the demo 
            </a>
          </div>
        </div>
      )}
    </>
  );
}
