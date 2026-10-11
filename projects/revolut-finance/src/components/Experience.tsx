import { useState, useId, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
  Snowflake,
  ShieldCheck,
  Fingerprint,
  Bell,
  Lock,
  Check,
  ChevronDown,
  Menu,
  X,
  Globe,
} from "lucide-react";
const money = (n: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
export function Navigation() {
  const [menu, setMenu] = useState(false);
  const [drop, setDrop] = useState("");
  return (
    <header className="nav">
      <a className="brand" href="#" aria-label="Orbit home">
        orbit<span>®</span>
      </a>
      <nav
        aria-label="Main navigation"
        className={menu ? "nav-links open" : "nav-links"}
      >
        {["Personal", "Business", "Features"].map((x) => (
          <div className="nav-item" key={x}>
            <button
              aria-expanded={drop === x}
              onClick={() => setDrop(drop === x ? "" : x)}
            >
              {x}
              <ChevronDown size={12} />
            </button>
            {drop === x && (
              <div className="dropdown">
                {(x === "Business"
                  ? [
                      ["Global business demo", "payments"],
                      ["Team spending demo", "banking"],
                    ]
                  : [
                      ["Everyday banking", "banking"],
                      ["Global payments", "payments"],
                      ["Cards & savings", "cards"],
                      ["Investments", "invest"],
                    ]
                ).map(([t, id]) => (
                  <a
                    key={id}
                    href={"#" + id}
                    onClick={() => {
                      setDrop("");
                      setMenu(false);
                    }}
                  >
                    {t}
                    <ArrowUpRight size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {[
          ["Plans", "plans"],
          ["Security", "security"],
        ].map(([t, id]) => (
          <a key={id} href={"#" + id} onClick={() => setMenu(false)}>
            {t}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <button
          className="login"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("orbit-demo", {
                detail: "Welcome to your demo account",
              }),
            )
          }
        >
          Log in
        </button>
        <a className="button small" href="#banking">
          Get started <ArrowUpRight size={15} />
        </a>
        <button
          className="menu"
          aria-label={menu ? "Close navigation" : "Open navigation"}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
const transactions = [
  {
    name: "Studio North",
    detail: "Salary · Today, 09:41",
    value: 3200,
    type: "Income",
    icon: "↙",
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
    icon: "↗",
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
  useEffect(
    () =>
      setAnimate(
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    [],
  );
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
      role="img"
      aria-label={
        investment
          ? "Simulated portfolio performance chart"
          : "Monthly demonstration spending chart"
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 15, left: 5, right: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b3a3fa" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#b3a3fa" stopOpacity={0} />
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
            tick={{ fill: "#8c8c98", fontSize: 11 }}
            interval={investment ? 4 : 0}
          />
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
            stroke="#b6a5ff"
            strokeWidth={2.5}
            fill={"url(#" + id + ")"}
            isAnimationActive={animate}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
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
            Euro account <ChevronDown size={12} />
          </small>
        </div>
        <div className="phone-buttons">
          {[
            [Plus, "Add money"],
            [ArrowUpRight, "Send"],
            [ArrowLeftRight, "Exchange"],
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
          <span>orbit</span>
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
                icon: "↗",
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
                    : "↗"}
              <small>{t}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
export function Banking() {
  const [filter, setFilter] = useState("All");
  return (
    <div className="dashboard light">
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
          <strong>€24,680.50</strong>
          <small className="positive">↗ €3,200 income this month</small>
        </div>
        <div className="balance-mini">
          <span>Monthly spending</span>
          <strong>€1,140.80</strong>
          <small>↓ 18% from last month</small>
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
        <ArrowUpRight size={18} />
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
        <ArrowLeftRight size={20} />
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
            Preview exchange <ArrowUpRight size={18} />
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
  const [finish, setFinish] = useState("Silver");
  const [virtual, setVirtual] = useState(false);
  return (
    <div className="cards-experience">
      <div className="card-stage">
        <div
          className={
            "payment-card " + finish.toLowerCase() + (virtual ? " virtual" : "")
          }
          onPointerMove={(e) => {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
              return;
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.transform = `rotateX(${-(e.clientY - r.top - r.height / 2) / 25}deg) rotateY(${(e.clientX - r.left - r.width / 2) / 25}deg)`;
          }}
          onPointerLeave={(e) => (e.currentTarget.style.transform = "")}
        >
          <div className="row-between">
            <span className="card-brand">orbit</span>
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
          {["Silver", "Graphite", "Lilac"].map((f) => (
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
        <button className="text-button" onClick={() => setVirtual(!virtual)}>
          {virtual ? "View physical card" : "Explore virtual card"}{" "}
          <ArrowUpRight size={16} />
        </button>
      </div>
      <p className="fine">
        {virtual
          ? "Instantly virtual. A fictional digital card concept."
          : finish + " finish. Move your cursor to explore the details."}
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
      icon: "↗",
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
            <div className="progress">
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
        <span>orbit</span>
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
  const [range, setRange] = useState("1M");
  const value = range === "1W" ? 21320 : range === "1Y" ? 28940 : 24680;
  return (
    <div className="investment-panel">
      <div className="row-between">
        <span className="label">YOUR PORTFOLIO</span>
        <span className="badge">Simulated market data</span>
      </div>
      <strong className="portfolio-value">{money(value)}</strong>
      <span className="positive">
        ↗ {range === "1Y" ? "18.42" : range === "1W" ? "2.13" : "8.24"}%{" "}
        <span className="muted">over selected period</span>
      </span>
      <Chart investment range={range} />
      <div className="range-filter">
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
      <div className="pricing-switch">
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
            <button className="button wide" onClick={() => setChosen(p.name)}>
              Explore {p.name}
              <ArrowUpRight size={16} />
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
            <a className="button" href="#banking" onClick={() => setChosen("")}>
              Explore the demo <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
export function DemoDialog() {
  const [title, setTitle] = useState("");
  useEffect(() => {
    const handler = (e: Event) => setTitle((e as CustomEvent<string>).detail);
    window.addEventListener("orbit-demo", handler);
    return () => window.removeEventListener("orbit-demo", handler);
  }, []);
  return title ? (
    <div className="modal-backdrop" onClick={() => setTitle("")}>
      <div
        className="demo-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Demo account"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          autoFocus
          className="close-modal"
          aria-label="Close demo"
          onClick={() => setTitle("")}
        >
          <X />
        </button>
        <span className="label">INDEPENDENT PORTFOLIO CONCEPT</span>
        <h3>{title}</h3>
        <p>
          Your demo is ready. All balances, cards and transactions are
          fictional. No authentication or personal information is needed.
        </p>
        <a className="button" href="#banking" onClick={() => setTitle("")}>
          Enter the experience <ArrowUpRight size={18} />
        </a>
      </div>
    </div>
  ) : null;
}
