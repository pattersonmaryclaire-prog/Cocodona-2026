import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cocodona-crew-console-single-file-v1";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "12px",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    color: "#0f172a",
  },
  wrap: {
    maxWidth: "460px",
    margin: "0 auto",
    display: "grid",
    gap: "12px",
    paddingBottom: "32px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "16px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e2e8f0",
  },
  sectionTitle: { fontSize: "18px", fontWeight: 700, margin: 0 },
  muted: { color: "#64748b", fontSize: "13px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  statBox: {
    background: "#fff",
    borderRadius: "18px",
    padding: "12px",
    border: "1px solid #e2e8f0",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 600,
    border: "1px solid #cbd5e1",
    background: "#fff",
  },
  bigButton: {
    height: "88px",
    borderRadius: "22px",
    border: "none",
    fontSize: "22px",
    fontWeight: 800,
    cursor: "pointer",
  },
  tabRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" },
  tab: (active) => ({
    height: "44px",
    borderRadius: "16px",
    border: active ? "1px solid #0f172a" : "1px solid #cbd5e1",
    background: active ? "#0f172a" : "#fff",
    color: active ? "#fff" : "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
  }),
  input: {
    width: "100%",
    height: "44px",
    borderRadius: "16px",
    border: "1px solid #cbd5e1",
    padding: "0 12px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    borderRadius: "16px",
    border: "1px solid #cbd5e1",
    padding: "12px",
    fontSize: "13px",
    boxSizing: "border-box",
    resize: "vertical",
  },
  smallButton: (variant = "primary") => ({
    height: "44px",
    borderRadius: "16px",
    border: variant === "secondary" ? "1px solid #cbd5e1" : "none",
    background:
      variant === "secondary"
        ? "#fff"
        : variant === "danger"
          ? "#dc2626"
          : "#0f172a",
    color: variant === "secondary" ? "#0f172a" : "#fff",
    fontWeight: 700,
    cursor: "pointer",
    padding: "0 14px",
  }),
  progressWrap: {
    width: "100%",
    height: "8px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressBar: (value) => ({
    width: `${value}%`,
    height: "100%",
    background: "#0f172a",
  }),
};

const stations = [
  {
    name: "Start – Black Canyon",
    mile: 0.0,
    planAIn: "2026-05-04T05:00:00",
    planAOut: "2026-05-04T05:00:00",
    planBIn: "2026-05-04T05:00:00",
    planBOut: "2026-05-04T05:00:00",
    pacer: "—",
    shoes: "",
    actions: "Controlled start",
    critical: false,
  },
  {
    name: "Cottonwood Creek",
    mile: 7.4,
    planAIn: "2026-05-04T07:30:00",
    planAOut: "2026-05-04T07:35:00",
    planBIn: "2026-05-04T07:50:00",
    planBOut: "2026-05-04T07:55:00",
    pacer: "—",
    shoes: "",
    actions: "Quick fluids and go",
    critical: false,
  },
  {
    name: "Lane Mountain",
    mile: 32.5,
    planAIn: "2026-05-04T14:00:00",
    planAOut: "2026-05-04T14:30:00",
    planBIn: "2026-05-04T15:00:00",
    planBOut: "2026-05-04T15:30:00",
    pacer: "—",
    shoes: "",
    actions: "30 min cap",
    critical: false,
  },
  {
    name: "Crown King",
    mile: 36.6,
    planAIn: "2026-05-04T18:00:00",
    planAOut: "2026-05-04T19:00:00",
    planBIn: "2026-05-04T19:15:00",
    planBOut: "2026-05-04T20:30:00",
    pacer: "—",
    shoes: "",
    actions: "Food + feet + lights",
    critical: false,
  },
  {
    name: "Arrastra Creek",
    mile: 51.1,
    planAIn: "2026-05-04T23:00:00",
    planAOut: "2026-05-05T00:00:00",
    planBIn: "2026-05-05T00:30:00",
    planBOut: "2026-05-05T01:30:00",
    pacer: "—",
    shoes: "",
    actions: "1 hr max",
    critical: false,
  },
  {
    name: "Kamp Kipa",
    mile: 60.9,
    planAIn: "2026-05-05T04:00:00",
    planAOut: "2026-05-05T05:00:00",
    planBIn: "2026-05-05T05:00:00",
    planBOut: "2026-05-05T06:00:00",
    pacer: "—",
    shoes: "",
    actions: "1 hr max",
    critical: false,
  },
  {
    name: "Camp W",
    mile: 67.5,
    planAIn: "2026-05-05T06:00:00",
    planAOut: "2026-05-05T06:10:00",
    planBIn: "2026-05-05T07:10:00",
    planBOut: "2026-05-05T07:20:00",
    pacer: "—",
    shoes: "",
    actions: "Fast turnover",
    critical: false,
  },
  {
    name: "Whiskey Row",
    mile: 75.8,
    planAIn: "2026-05-05T08:30:00",
    planAOut: "2026-05-05T10:30:00",
    planBIn: "2026-05-05T10:30:00",
    planBOut: "2026-05-05T12:30:00",
    pacer: "—",
    shoes: "ROAD",
    actions: "Full reset + shoes",
    critical: true,
  },
  {
    name: "Watson Lake",
    mile: 82.8,
    planAIn: "2026-05-05T13:00:00",
    planAOut: "2026-05-05T13:10:00",
    planBIn: "2026-05-05T15:00:00",
    planBOut: "2026-05-05T15:10:00",
    pacer: "Lin / Ben",
    shoes: "",
    actions: "Quick refill, pacer starts",
    critical: false,
  },
  {
    name: "Fain Ranch",
    mile: 94.5,
    planAIn: "2026-05-05T16:00:00",
    planAOut: "2026-05-05T17:00:00",
    planBIn: "2026-05-05T18:00:00",
    planBOut: "2026-05-05T19:00:00",
    pacer: "Lin",
    shoes: "",
    actions: "Fuel before Mingus",
    critical: false,
  },
  {
    name: "Mingus Mountain",
    mile: 106.8,
    planAIn: "2026-05-05T21:00:00",
    planAOut: "2026-05-05T22:00:00",
    planBIn: "2026-05-05T23:30:00",
    planBOut: "2026-05-06T01:30:00",
    pacer: "Ben",
    shoes: "",
    actions: "Sleep + cold gear",
    critical: true,
  },
  {
    name: "Jerome",
    mile: 123.8,
    planAIn: "2026-05-06T07:00:00",
    planAOut: "2026-05-06T09:00:00",
    planBIn: "2026-05-06T09:30:00",
    planBOut: "2026-05-06T11:30:00",
    pacer: "Ben",
    shoes: "ROAD",
    actions: "Reset + shoes",
    critical: true,
  },
  {
    name: "Dead Horse Ranch",
    mile: 132.5,
    planAIn: "2026-05-06T12:00:00",
    planAOut: "2026-05-06T12:15:00",
    planBIn: "2026-05-06T14:30:00",
    planBOut: "2026-05-06T14:45:00",
    pacer: "Lin",
    shoes: "TRAIL",
    actions: "Switch for Sedona section",
    critical: false,
  },
  {
    name: "Deer Pass",
    mile: 146.5,
    planAIn: "2026-05-06T16:00:00",
    planAOut: "2026-05-06T17:00:00",
    planBIn: "2026-05-06T18:30:00",
    planBOut: "2026-05-06T19:30:00",
    pacer: "Ben",
    shoes: "",
    actions: "1 hr cap",
    critical: false,
  },
  {
    name: "Sedona Posse Grounds",
    mile: 158.8,
    planAIn: "2026-05-06T22:30:00",
    planAOut: "2026-05-07T00:30:00",
    planBIn: "2026-05-07T01:30:00",
    planBOut: "2026-05-07T04:00:00",
    pacer: "Ben",
    shoes: "",
    actions: "Critical sleep/reset",
    critical: true,
  },
  {
    name: "Schnebly Hill",
    mile: 175.7,
    planAIn: "2026-05-07T07:00:00",
    planAOut: "2026-05-07T08:00:00",
    planBIn: "2026-05-07T10:00:00",
    planBOut: "2026-05-07T11:00:00",
    pacer: "Joe",
    shoes: "ROAD",
    actions: "Recover climb + shoes",
    critical: false,
  },
  {
    name: "Munds Park",
    mile: 189.6,
    planAIn: "2026-05-07T12:00:00",
    planAOut: "2026-05-07T13:00:00",
    planBIn: "2026-05-07T15:30:00",
    planBOut: "2026-05-07T16:30:00",
    pacer: "—",
    shoes: "",
    actions: "Mental low zone",
    critical: false,
  },
  {
    name: "Kelly Canyon",
    mile: 202.3,
    planAIn: "2026-05-07T16:00:00",
    planAOut: "2026-05-07T16:10:00",
    planBIn: "2026-05-07T20:00:00",
    planBOut: "2026-05-07T20:10:00",
    pacer: "Ben",
    shoes: "",
    actions: "Fast turnover",
    critical: false,
  },
  {
    name: "Fort Tuthill",
    mile: 210.6,
    planAIn: "2026-05-07T20:30:00",
    planAOut: "2026-05-07T22:30:00",
    planBIn: "2026-05-08T01:00:00",
    planBOut: "2026-05-08T03:00:00",
    pacer: "Ben",
    shoes: "TRAIL",
    actions: "Final reset + shoes",
    critical: true,
  },
  {
    name: "Walnut Canyon",
    mile: 226.8,
    planAIn: "2026-05-08T02:30:00",
    planAOut: "2026-05-08T03:30:00",
    planBIn: "2026-05-08T07:30:00",
    planBOut: "2026-05-08T08:30:00",
    pacer: "Lin",
    shoes: "",
    actions: "Efficient stop",
    critical: false,
  },
  {
    name: "Wildcat Hill",
    mile: 233.7,
    planAIn: "2026-05-08T06:30:00",
    planAOut: "2026-05-08T07:00:00",
    planBIn: "2026-05-08T11:00:00",
    planBOut: "2026-05-08T11:30:00",
    pacer: "Joe C",
    shoes: "",
    actions: "Fuel + go",
    critical: false,
  },
  {
    name: "Trinity Heights",
    mile: 249.0,
    planAIn: "2026-05-08T12:45:00",
    planAOut: "2026-05-08T12:50:00",
    planBIn: "2026-05-08T14:30:00",
    planBOut: "2026-05-08T14:35:00",
    pacer: "—",
    shoes: "",
    actions: "Short touchpoint",
    critical: false,
  },
  {
    name: "Finish – Flagstaff",
    mile: 252.9,
    planAIn: "2026-05-08T02:00:00",
    planAOut: "",
    planBIn: "2026-05-08T15:00:00",
    planBOut: "",
    pacer: "—",
    shoes: "ROAD",
    actions: "Empty the tank",
    critical: false,
  },
];

const emptyRecords = () =>
  stations.map(() => ({ actualIn: "", actualOut: "", note: "" }));

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTimeOnly(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(ms) {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return "—";
  const sign = ms < 0 ? "-" : "";
  const abs = Math.abs(ms);
  const totalMinutes = Math.round(abs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${sign}${hours}h ${minutes}m`;
}

function statusFromDelta(ms) {
  if (ms === null || ms === undefined || Number.isNaN(ms)) {
    return { label: "Pending", bg: "#e2e8f0", color: "#334155" };
  }
  if (ms > 60 * 60000) {
    return { label: "Major loss", bg: "#fee2e2", color: "#991b1b" };
  }
  if (ms > 30 * 60000) {
    return { label: "Cut next stop", bg: "#ffedd5", color: "#9a3412" };
  }
  if (ms < -20 * 60000) {
    return { label: "Ahead — control", bg: "#dbeafe", color: "#1d4ed8" };
  }
  return { label: "On plan", bg: "#dcfce7", color: "#166534" };
}

function nextActionFromDelta(ms) {
  if (ms === null || ms === undefined || Number.isNaN(ms)) {
    return "Run the planned stop.";
  }
  if (ms > 60 * 60000) {
    return "Cut all non-critical sleep and strip extras.";
  }
  if (ms > 30 * 60000) {
    return "Shorten next stop by 25–50%.";
  }
  if (ms < -20 * 60000) {
    return "Stay controlled. Do not burn the buffer.";
  }
  return "Stay the course.";
}

function buildExportPayload(planMode, records, panicMode) {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      planMode,
      panicMode,
      records,
    },
    null,
    2
  );
}

function App() {
  const [planMode, setPlanMode] = useState("A");
  const [panicMode, setPanicMode] = useState(false);
  const [records, setRecords] = useState(emptyRecords);
  const [tab, setTab] = useState("active");
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [savedAt, setSavedAt] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.records) setRecords(parsed.records);
      if (parsed?.planMode) setPlanMode(parsed.planMode);
      if (typeof parsed?.panicMode === "boolean") setPanicMode(parsed.panicMode);
      if (parsed?.savedAt) setSavedAt(parsed.savedAt);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    try {
      const payload = {
        planMode,
        panicMode,
        records,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSavedAt(payload.savedAt);
    } catch (e) {
      console.error(e);
    }
  }, [planMode, panicMode, records]);

  const data = useMemo(() => {
    return stations.map((station, idx) => {
      const plannedIn = planMode === "A" ? station.planAIn : station.planBIn;
      const plannedOut = planMode === "A" ? station.planAOut : station.planBOut;
      const prevPlannedOut =
        idx > 0
          ? planMode === "A"
            ? stations[idx - 1].planAOut
            : stations[idx - 1].planBOut
          : plannedOut;
      const prevActualOut =
        idx > 0 ? records[idx - 1].actualOut : records[0].actualOut || records[0].actualIn;
      const plannedSplitMs =
        idx === 0 || !plannedIn || !prevPlannedOut
          ? null
          : new Date(plannedIn) - new Date(prevPlannedOut);
      const actualSplitMs =
        idx === 0 || !records[idx].actualIn || !prevActualOut
          ? null
          : new Date(records[idx].actualIn) - new Date(prevActualOut);
      const deltaMs =
        actualSplitMs !== null && plannedSplitMs !== null
          ? actualSplitMs - plannedSplitMs
          : null;
      const stopMs =
        records[idx].actualIn && records[idx].actualOut
          ? new Date(records[idx].actualOut) - new Date(records[idx].actualIn)
          : null;
      return {
        ...station,
        plannedIn,
        plannedOut,
        ...records[idx],
        plannedSplitMs,
        actualSplitMs,
        deltaMs,
        stopMs,
      };
    });
  }, [planMode, records]);

  const completedCount = data.filter((d) => d.actualIn || d.actualOut).length;
  const progress = Math.round((completedCount / data.length) * 100);
  const activeIndex = data.findIndex(
    (d, i) => !d.actualOut && (i === 0 || !!data[i - 1].actualOut || !!data[i - 1].actualIn)
  );
  const currentIndex = activeIndex === -1 ? data.length - 1 : activeIndex;
  const current = data[currentIndex];
  const nextCritical = data.find((d, i) => i >= currentIndex && d.critical && !d.actualOut);
  const overallDelta = data.reduce((acc, d) => (d.deltaMs !== null ? acc + d.deltaMs : acc), 0);
  const biggestLoss = data.reduce(
    (max, d) => (d.deltaMs !== null && d.deltaMs > max ? d.deltaMs : max),
    0
  );

  function stamp(index, field) {
    const now = new Date().toISOString();
    setRecords((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: now } : r)));
  }

  function clearStation(index) {
    setRecords((prev) =>
      prev.map((r, i) => (i === index ? { actualIn: "", actualOut: "", note: "" } : r))
    );
  }

  function setNote(index, value) {
    setRecords((prev) => prev.map((r, i) => (i === index ? { ...r, note: value } : r)));
  }

  function exportData() {
    setExportText(buildExportPayload(planMode, records, panicMode));
  }

  async function copyExport() {
    const payload = buildExportPayload(planMode, records, panicMode);
    setExportText(payload);
    try {
      await navigator.clipboard.writeText(payload);
    } catch (e) {
      console.error(e);
    }
  }

  function importData() {
    try {
      const parsed = JSON.parse(importText);
      if (parsed?.records?.length === stations.length) setRecords(parsed.records);
      if (parsed?.planMode) setPlanMode(parsed.planMode);
      if (typeof parsed?.panicMode === "boolean") setPanicMode(parsed.panicMode);
    } catch (e) {
      alert("Import failed. Make sure you pasted the full backup JSON.");
    }
  }

  function resetAll() {
    setRecords(emptyRecords());
    setExportText("");
    setImportText("");
    setPanicMode(false);
    setPlanMode("A");
    localStorage.removeItem(STORAGE_KEY);
  }

  const status = current ? statusFromDelta(current.deltaMs) : statusFromDelta(null);

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800 }}>
                Cocodona Crew Console
              </h1>
              <div style={styles.muted}>Single-file race-day mobile app</div>
            </div>
            <div style={styles.badge}>Plan {planMode}</div>
          </div>

          <div style={{ ...styles.grid2, marginTop: "12px" }}>
            <div style={styles.statBox}>
              <div style={styles.muted}>Overall delta</div>
              <div style={{ fontSize: "20px", fontWeight: 800 }}>{formatDuration(overallDelta)}</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.muted}>Next critical</div>
              <div style={{ fontSize: "15px", fontWeight: 800, lineHeight: 1.2 }}>
                {nextCritical?.name || "Done"}
              </div>
            </div>
          </div>

          <div style={{ ...styles.statBox, marginTop: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={styles.muted}>Progress</span>
              <span style={{ fontWeight: 700 }}>{progress}%</span>
            </div>
            <div style={styles.progressWrap}>
              <div style={styles.progressBar(progress)} />
            </div>
          </div>

          <div style={{ ...styles.statBox, marginTop: "10px", background: "#ecfdf5" }}>
            <div style={{ fontWeight: 700 }}>Auto-saved locally</div>
            <div style={{ ...styles.muted, marginTop: "4px" }}>
              Last saved: {savedAt ? formatDateTime(savedAt) : "—"}
            </div>
          </div>

          <div style={{ ...styles.grid2, marginTop: "10px" }}>
            <button
              style={styles.smallButton(planMode === "A" ? "primary" : "secondary")}
              onClick={() => setPlanMode("A")}
            >
              Plan A
            </button>
            <button
              style={styles.smallButton(planMode === "B" ? "primary" : "secondary")}
              onClick={() => setPlanMode("B")}
            >
              Plan B
            </button>
          </div>

          <div style={{ ...styles.grid2, marginTop: "10px" }}>
            <button
              style={styles.smallButton(panicMode ? "danger" : "secondary")}
              onClick={() => setPanicMode((v) => !v)}
            >
              {panicMode ? "Panic ON" : "Panic OFF"}
            </button>
            <button style={styles.smallButton("secondary")} onClick={exportData}>
              Export Backup
            </button>
          </div>
        </div>

        <div style={styles.tabRow}>
          {["active", "stations", "crew", "backup"].map((t) => (
            <button key={t} style={styles.tab(tab === t)} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "active" && current && (
          <div style={styles.card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <div>
                <div style={{ fontSize: "22px", fontWeight: 800, lineHeight: 1.15 }}>
                  {current.name}
                </div>
                <div style={{ ...styles.muted, marginTop: "4px" }}>Mile {current.mile}</div>
              </div>
              <div
                style={{
                  ...styles.badge,
                  background: panicMode ? "#fee2e2" : status.bg,
                  color: panicMode ? "#991b1b" : status.color,
                  borderColor: "transparent",
                }}
              >
                {panicMode ? "Save time now" : status.label}
              </div>
            </div>

            <div style={{ ...styles.grid2, marginTop: "12px" }}>
              <div style={styles.statBox}>
                <div style={styles.muted}>Planned in</div>
                <div style={{ fontWeight: 800 }}>{formatDateTime(current.plannedIn)}</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.muted}>Leave by</div>
                <div style={{ fontWeight: 800 }}>{formatDateTime(current.plannedOut)}</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.muted}>Pacer</div>
                <div style={{ fontWeight: 800 }}>{current.pacer}</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.muted}>Shoes</div>
                <div style={{ fontWeight: 800 }}>{current.shoes || "—"}</div>
              </div>
            </div>

            <div style={{ ...styles.grid2, marginTop: "12px" }}>
              <button
                style={{ ...styles.bigButton, background: "#0f172a", color: "#fff" }}
                onClick={() => stamp(currentIndex, "actualIn")}
              >
                TAP IN
              </button>
              <button
                style={{ ...styles.bigButton, background: "#e2e8f0", color: "#0f172a" }}
                onClick={() => stamp(currentIndex, "actualOut")}
              >
                TAP OUT
              </button>
            </div>

            <div style={{ ...styles.grid2, marginTop: "12px" }}>
              <div style={styles.statBox}>
                <div style={styles.muted}>Actual in</div>
                <div style={{ fontWeight: 800 }}>{formatDateTime(current.actualIn)}</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.muted}>Actual out</div>
                <div style={{ fontWeight: 800 }}>{formatDateTime(current.actualOut)}</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.muted}>Segment delta</div>
                <div style={{ fontWeight: 800 }}>{formatDuration(current.deltaMs)}</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.muted}>Stop time</div>
                <div style={{ fontWeight: 800 }}>{formatDuration(current.stopMs)}</div>
              </div>
            </div>

            <div
              style={{
                ...styles.card,
                padding: "14px",
                marginTop: "12px",
                background: panicMode ? "#fff1f2" : "#fffbeb",
                border: panicMode ? "1px solid #fecdd3" : "1px solid #fde68a",
                boxShadow: "none",
              }}
            >
              <div style={{ fontWeight: 800 }}>Crew action</div>
              <div style={{ marginTop: "6px", fontSize: "14px" }}>{current.actions}</div>
              <div style={{ marginTop: "8px", fontSize: "14px", fontWeight: 700 }}>
                {panicMode ? "Panic mode: brutally short stop." : nextActionFromDelta(current.deltaMs)}
              </div>
            </div>

            <div style={{ marginTop: "12px" }}>
              <input
                style={styles.input}
                placeholder="Quick note… feet, calories, mood"
                value={current.note}
                onChange={(e) => setNote(currentIndex, e.target.value)}
              />
            </div>

            <div style={{ marginTop: "10px" }}>
              <button
                style={{ ...styles.smallButton("secondary"), width: "100%" }}
                onClick={() => clearStation(currentIndex)}
              >
                Clear this stop
              </button>
            </div>
          </div>
        )}

        {tab === "stations" && (
          <div style={{ ...styles.card, maxHeight: "75vh", overflow: "auto" }}>
            <div style={styles.sectionTitle}>All aid stations</div>
            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
              {data.map((station, idx) => {
                const s = statusFromDelta(station.deltaMs);
                return (
                  <div
                    key={station.name}
                    style={{
                      background: "#f8fafc",
                      borderRadius: "18px",
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{station.name}</div>
                        <div style={styles.muted}>Mile {station.mile}</div>
                      </div>
                      <div
                        style={{
                          ...styles.badge,
                          background: panicMode ? "#fee2e2" : s.bg,
                          color: panicMode ? "#991b1b" : s.color,
                          borderColor: "transparent",
                        }}
                      >
                        {panicMode ? "Trim stop" : s.label}
                      </div>
                    </div>
                    <div style={{ ...styles.grid2, marginTop: "8px", fontSize: "13px" }}>
                      <div>
                        In: <strong>{formatTimeOnly(station.plannedIn)}</strong>
                      </div>
                      <div>
                        Out: <strong>{formatTimeOnly(station.plannedOut)}</strong>
                      </div>
                      <div>
                        Actual in: <strong>{formatTimeOnly(station.actualIn)}</strong>
                      </div>
                      <div>
                        Actual out: <strong>{formatTimeOnly(station.actualOut)}</strong>
                      </div>
                    </div>
                    <div style={{ ...styles.grid2, marginTop: "10px" }}>
                      <button style={styles.smallButton("primary")} onClick={() => stamp(idx, "actualIn")}>
                        IN
                      </button>
                      <button
                        style={styles.smallButton("secondary")}
                        onClick={() => stamp(idx, "actualOut")}
                      >
                        OUT
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "crew" && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Crew rules</div>
            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
              <div
                style={{
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  borderRadius: "18px",
                  padding: "12px",
                }}
              >
                <div style={{ fontWeight: 800 }}>Critical stops</div>
                <div style={{ ...styles.muted, color: "#881337", marginTop: "6px" }}>
                  Whiskey, Mingus, Jerome, Sedona, Tuthill
                </div>
              </div>
              <div style={styles.statBox}>
                <div style={{ fontWeight: 800 }}>Time rules</div>
                <div style={{ ...styles.muted, marginTop: "6px", lineHeight: 1.6 }}>
                  ≤15 min behind: stay plan
                  <br />
                  30–60 min behind: shorten next stop
                  <br />
                  &gt;60 min behind: cut non-critical sleep
                </div>
              </div>
              <div style={styles.statBox}>
                <div style={{ fontWeight: 800 }}>Shoe changes</div>
                <div style={{ ...styles.muted, marginTop: "6px", lineHeight: 1.6 }}>
                  Whiskey → ROAD
                  <br />
                  Jerome → ROAD
                  <br />
                  Dead Horse → TRAIL
                  <br />
                  Schnebly → ROAD
                  <br />
                  Tuthill → TRAIL
                  <br />
                  Finish zone → ROAD
                </div>
              </div>
              <div style={styles.statBox}>
                <div style={{ fontWeight: 800 }}>Live recommendation</div>
                <div style={{ ...styles.muted, marginTop: "6px" }}>
                  {panicMode
                    ? "Panic mode is ON. Strip anything non-essential."
                    : nextActionFromDelta(biggestLoss)}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "backup" && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Backup + transfer</div>
            <div style={{ ...styles.muted, marginTop: "6px" }}>
              Use this before crew phone handoffs or if you want a second-device backup.
            </div>
            <div style={{ ...styles.grid2, marginTop: "12px" }}>
              <button style={styles.smallButton("primary")} onClick={exportData}>
                Export
              </button>
              <button style={styles.smallButton("secondary")} onClick={copyExport}>
                Copy JSON
              </button>
            </div>
            <textarea
              style={{ ...styles.textarea, marginTop: "12px" }}
              placeholder="Exported backup appears here."
              value={exportText}
              onChange={(e) => setExportText(e.target.value)}
            />
            <textarea
              style={{ ...styles.textarea, marginTop: "12px" }}
              placeholder="Paste a backup here to restore this device."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
              <button style={styles.smallButton("secondary")} onClick={importData}>
                Restore from pasted backup
              </button>
              <button style={styles.smallButton("danger")} onClick={resetAll}>
                Reset everything
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
