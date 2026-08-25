import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./styles.css";

type PartType = "blade" | "lockChip" | "overBlade" | "assistBlade" | "ratchet" | "bit";
type BladeSpecial = "normal" | "simpleOnly" | "UXX" | "CX" | "CXX";
type RatchetSpecial = "normal" | "simple" | "integrated";

type Part = {
  id: string;
  name: string;
  type: PartType;
  bladeSpecial?: BladeSpecial;
  ratchetSpecial?: RatchetSpecial;
};

type Custom = {
  blade: Part;
  lockChip?: Part;
  overBlade?: Part;
  assistBlade?: Part;
  ratchet?: Part;
  bit?: Part;
};

const STORAGE_KEY = "beyblade-random-maker-parts-v1";
const TYPES: PartType[] = ["blade", "lockChip", "overBlade", "assistBlade", "ratchet", "bit"];

const TYPE_LABEL: Record<PartType, string> = {
  blade: "ブレード",
  lockChip: "ロックチップ",
  overBlade: "オーバーブレード",
  assistBlade: "アシストブレード",
  ratchet: "ラチェット",
  bit: "ビット",
};

const BLADE_LABEL: Record<BladeSpecial, string> = {
  normal: "通常",
  simpleOnly: "シンプル専用",
  UXX: "UXX",
  CX: "CX",
  CXX: "CXX",
};

const RATCHET_LABEL: Record<RatchetSpecial, string> = {
  normal: "通常",
  simple: "シンプルタイプ",
  integrated: "一体型",
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function randomOf<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function loadParts(): Part[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function App() {
  const [parts, setParts] = useState<Part[]>(loadParts);
  const [page, setPage] = useState<"random" | "parts">("random");
  const [type, setType] = useState<PartType>("blade");
  const [name, setName] = useState("");
  const [bladeSpecial, setBladeSpecial] = useState<BladeSpecial>("normal");
  const [ratchetSpecial, setRatchetSpecial] = useState<RatchetSpecial>("normal");
  const [custom, setCustom] = useState<Custom | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
  }, [parts]);

  const counts = useMemo(() => {
    return Object.fromEntries(TYPES.map((t) => [t, parts.filter((p) => p.type === t).length])) as Record<PartType, number>;
  }, [parts]);

  function addPart(e: FormEvent) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) {
      setNotice("パーツ名を入力してください。");
      return;
    }

    const part: Part = {
      id: makeId(),
      name: clean,
      type,
      ...(type === "blade" ? { bladeSpecial } : {}),
      ...(type === "ratchet" ? { ratchetSpecial } : {}),
    };

    setParts((current) => [...current, part]);
    setName("");
    setNotice(`${clean} を登録しました。`);
  }

  function deletePart(id: string) {
    setParts((current) => current.filter((p) => p.id !== id));
  }

  function resetParts() {
    if (!window.confirm("登録したパーツをすべて削除しますか？")) return;
    setParts([]);
    setCustom(null);
    setNotice("パーツをすべて削除しました。");
  }

  function generate() {
    setNotice("");
    const blades = parts.filter((p) => p.type === "blade");
    if (blades.length === 0) {
      setNotice("まずブレードを1個以上登録してください。");
      return;
    }

    const blade = randomOf(blades);
    const special = blade.bladeSpecial ?? "normal";
    const next: Custom = { blade };

    // CX / CXX: ロックチップ
    if (special === "CX" || special === "CXX") {
      const candidates = parts.filter((p) => p.type === "lockChip");
      if (!candidates.length) {
        setNotice("CX / CXXにはロックチップが必要です。登録してください。");
        return;
      }
      next.lockChip = randomOf(candidates);
    }

    // CXX: オーバーブレード
    if (special === "CXX") {
      const candidates = parts.filter((p) => p.type === "overBlade");
      if (!candidates.length) {
        setNotice("CXXにはオーバーブレードが必要です。登録してください。");
        return;
      }
      next.overBlade = randomOf(candidates);
    }

    // CX / CXX: アシストブレード
    if (special === "CX" || special === "CXX") {
      const candidates = parts.filter((p) => p.type === "assistBlade");
      if (!candidates.length) {
        setNotice("CX / CXXにはアシストブレードが必要です。登録してください。");
        return;
      }
      next.assistBlade = randomOf(candidates);
    }

    // UXX: ラチェットを選択しない
    if (special !== "UXX") {
      let ratchets = parts.filter((p) => p.type === "ratchet");

      // シンプル専用: シンプルタイプだけから選択
      if (special === "simpleOnly") {
        ratchets = ratchets.filter((p) => p.ratchetSpecial === "simple");
        if (!ratchets.length) {
          setNotice("シンプルタイプのラチェットを1個以上登録してください。");
          return;
        }
      } else if (!ratchets.length) {
        setNotice("ラチェットを1個以上登録してください。");
        return;
      }

      const ratchet = randomOf(ratchets);
      next.ratchet = ratchet;

      // 一体型: ビットを選択しない
      if (ratchet.ratchetSpecial === "integrated") {
        setCustom(next);
        return;
      }
    }

    // 通常 / シンプル専用 / UXX: ビットを選択
    const bits = parts.filter((p) => p.type === "bit");
    if (!bits.length) {
      setNotice("ビットを1個以上登録してください。");
      return;
    }
    next.bit = randomOf(bits);
    setCustom(next);
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <div className="eyebrow">BEYBLADE X</div>
          <h1>RANDOM MAKER</h1>
          <p>持っているパーツだけでランダムカスタム</p>
        </div>
        <div className="version">v1.0</div>
      </header>

      <div className="tabs">
        <button className={page === "random" ? "tab active" : "tab"} onClick={() => setPage("random")}>🎲 ランダム生成</button>
        <button className={page === "parts" ? "tab active" : "tab"} onClick={() => setPage("parts")}>📦 パーツ登録</button>
      </div>

      {page === "random" ? (
        <main>
          <section className="card">
            <div className="heading-row">
              <div><div className="eyebrow">RANDOM CUSTOM</div><h2>ランダム生成</h2></div>
              <span className="pill">{parts.length} パーツ</span>
            </div>
            <button className="generate" onClick={generate}>🎲 ランダムカスタムを生成</button>
            {notice && <div className="notice">{notice}</div>}
            {custom && <Result custom={custom} onAgain={generate} />}
          </section>

          <section className="card">
            <div className="heading-row"><div><div className="eyebrow">INVENTORY</div><h2>登録数</h2></div></div>
            <div className="counts">
              {TYPES.map((t) => <div className="count" key={t}><b>{counts[t]}</b><span>{TYPE_LABEL[t]}</span></div>)}
            </div>
          </section>
        </main>
      ) : (
        <main>
          <section className="card">
            <div className="heading-row"><div><div className="eyebrow">ADD PART</div><h2>パーツを登録</h2></div></div>
            <form onSubmit={addPart}>
              <label>パーツ種類
                <select value={type} onChange={(e) => setType(e.target.value as PartType)}>
                  {TYPES.map((t) => <option value={t} key={t}>{TYPE_LABEL[t]}</option>)}
                </select>
              </label>
              <label>パーツ名
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例：ウィザードロッド" />
              </label>
              {type === "blade" && <label>特殊タイプ
                <select value={bladeSpecial} onChange={(e) => setBladeSpecial(e.target.value as BladeSpecial)}>
                  {Object.entries(BLADE_LABEL).map(([v, l]) => <option value={v} key={v}>{l}</option>)}
                </select>
              </label>}
              {type === "ratchet" && <label>特殊タイプ
                <select value={ratchetSpecial} onChange={(e) => setRatchetSpecial(e.target.value as RatchetSpecial)}>
                  {Object.entries(RATCHET_LABEL).map(([v, l]) => <option value={v} key={v}>{l}</option>)}
                </select>
              </label>}
              <button className="primary" type="submit">＋ パーツを登録</button>
            </form>
            {notice && <div className="notice">{notice}</div>}
          </section>

          <section className="card">
            <div className="heading-row">
              <div><div className="eyebrow">MY PARTS</div><h2>登録済みパーツ</h2></div>
              <button className="secondary" onClick={resetParts}>全削除</button>
            </div>
            {TYPES.map((t) => {
              const list = parts.filter((p) => p.type === t);
              return <div className="group" key={t}>
                <h3>{TYPE_LABEL[t]} <span>{list.length}</span></h3>
                {list.length === 0 ? <div className="empty">登録なし</div> : list.map((p) => <div className="row" key={p.id}>
                  <div><strong>{p.name}</strong>{p.type === "blade" && p.bladeSpecial !== "normal" && <span className="tag">{BLADE_LABEL[p.bladeSpecial ?? "normal"]}</span>}{p.type === "ratchet" && p.ratchetSpecial !== "normal" && <span className="tag">{RATCHET_LABEL[p.ratchetSpecial ?? "normal"]}</span>}</div>
                  <button className="delete" onClick={() => deletePart(p.id)}>削除</button>
                </div>)}
              </div>;
            })}
          </section>
        </main>
      )}

      <footer>パーツデータはこの端末のブラウザに保存されます。</footer>
    </div>
  );
}

function Result({ custom, onAgain }: { custom: Custom; onAgain: () => void }) {
  const items: Part[] = [custom.lockChip, custom.overBlade, custom.assistBlade, custom.blade, custom.ratchet, custom.bit].filter(Boolean) as Part[];
  return <div className="result">
    <div className="eyebrow">GENERATED CUSTOM</div>
    <div className="combo">{items.map((p, i) => <span className={p.type === "blade" ? "combo-part blade" : "combo-part"} key={`${p.id}-${i}`}>{p.name}</span>)}</div>
    <button className="secondary wide" onClick={onAgain}>もう一度生成</button>
  </div>;
}

export default App;
