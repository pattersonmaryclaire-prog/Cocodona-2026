import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cocodona-crew-v8-live-prediction";

const stations = [
  { name: "Cottonwood Creek", mile: 7.4, in: "2026-05-04T07:30:00", out: "2026-05-04T07:35:00" },
  { name: "Lane Mountain", mile: 32.5, in: "2026-05-04T14:00:00", out: "2026-05-04T14:30:00" },
  { name: "Crown King", mile: 36.6, in: "2026-05-04T18:00:00", out: "2026-05-04T19:00:00" },
  { name: "Arrastra Creek", mile: 51.1, in: "2026-05-04T23:00:00", out: "2026-05-05T00:00:00" },
  { name: "Kamp Kipa", mile: 60.9, in: "2026-05-05T04:00:00", out: "2026-05-05T05:00:00" },
  { name: "Whiskey Row", mile: 75.7, in: "2026-05-05T08:30:00", out: "2026-05-05T10:30:00" },
  { name: "Watson Lake", mile: 82.8, in: "2026-05-05T13:00:00", out: "2026-05-05T13:10:00" },
  { name: "Fain Ranch", mile: 94.5, in: "2026-05-05T16:00:00", out: "2026-05-05T17:00:00" },
  { name: "Mingus Mountain", mile: 106.8, in: "2026-05-05T21:00:00", out: "2026-05-05T22:00:00" },
  { name: "Jerome", mile: 123.8, in: "2026-05-06T07:00:00", out: "2026-05-06T09:00:00" },
  { name: "Dead Horse", mile: 132.5, in: "2026-05-06T12:00:00", out: "2026-05-06T12:15:00" },
  { name: "Deer Pass", mile: 146.5, in: "2026-05-06T16:00:00", out: "2026-05-06T17:00:00" },
  { name: "Sedona Posse Grounds", mile: 158.8, in: "2026-05-06T22:30:00", out: "2026-05-07T00:30:00" },
  { name: "Schnebly Hill", mile: 175.7, in: "2026-05-07T07:00:00", out: "2026-05-07T08:00:00" },
  { name: "Munds Park", mile: 189.6, in: "2026-05-07T12:00:00", out: "2026-05-07T13:00:00" },
  { name: "Kelly Canyon", mile: 202.3, in: "2026-05-07T16:00:00", out: "2026-05-07T16:10:00" },
  { name: "Fort Tuthill", mile: 210.6, in: "2026-05-07T20:30:00", out: "2026-05-07T22:30:00" },
  { name: "Walnut Canyon", mile: 226.8, in: "2026-05-08T02:30:00", out: "2026-05-08T03:30:00" },
  { name: "Wildcat Hill", mile: 233.7, in: "2026-05-08T06:30:00", out: "2026-05-08T07:00:00" },
  { name: "Trinity Heights", mile: 249.0, in: "2026-05-08T13:00:00", out: "2026-05-08T13:05:00" },
  { name: "Finish", mile: 252.9, in: "2026-05-08T14:00:00", out: "" },
];

const driveData = {
  "Cottonwood Creek": { hotel: "Hotel St. Michael", distance: 58, drive: 75 },
  "Lane Mountain": { hotel: "Hotel St. Michael", distance: 49, drive: 70 },
  "Crown King": { hotel: "Hotel St. Michael", distance: 48, drive: 85 },
  "Arrastra Creek": { hotel: "Hotel St. Michael", distance: 28, drive: 60 },
  "Kamp Kipa": { hotel: "Hotel St. Michael", distance: 18, drive: 40 },
  "Whiskey Row": { hotel: "Hotel St. Michael", distance: 0.2, drive: 5 },
  "Watson Lake": { hotel: "Hotel St. Michael", distance: 5, drive: 15 },
  "Fain Ranch": { hotel: "Hotel St. Michael", distance: 16, drive: 30 },
  "Mingus Mountain": { hotel: "Grand Hotel", distance: 21, drive: 45 },
  Jerome: { hotel: "Grand Hotel", distance: 0.2, drive: 5 },
  "Dead Horse": { hotel: "Sky Rock Sedona", distance: 20, drive: 35 },
  "Deer Pass": { hotel: "Sky Rock Sedona", distance: 26, drive: 45 },
  "Sedona Posse Grounds": { hotel: "Sky Rock Sedona", distance: 2, drive: 8 },
  "Schnebly Hill": { hotel: "Sky Rock Sedona", distance: 7, drive: 20 },
  "Munds Park": { hotel: "Little America", distance: 22, drive: 30 },
  "Kelly Canyon": { hotel: "Little America", distance: 14, drive: 25 },
  "Fort Tuthill": { hotel: "Little America", distance: 7, drive: 15 },
  "Walnut Canyon": { hotel: "Little America", distance: 10, drive: 25 },
  "Wildcat Hill": { hotel: "Little America", distance: 9, drive: 20 },
  "Trinity Heights": { hotel: "Little America", distance: 4, drive: 12 },
  Finish: { hotel: "Little America", distance: 3, drive: 10 },
};

function time(val) {
  if (!val) return "—";
  return new Date(val).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function fmt(val) {
  if (!val) return "—";
  return new Date(val).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function duration(ms) {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return "—";
  const sign = ms < 0 ? "-" : "";
  const abs = Math.abs(ms);
  const mins = Math.round(abs / 60000);
  return `${sign}${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function getCrew(station) {
  const d = driveData[station.name] || {};
  const eta = new Date(station.in);
  const arrive = new Date(eta.getTime() - 60 * 60000);
  const leave = new Date(arrive.getTime() - (d.drive || 30) * 60000);

  const now = new Date();
  let status = "OK";
  if (now > arrive) status = "MISSED";
  else if (now >= leave) status = "LEAVE NOW";
  else if (leave - now < 30 * 60000) status = "SOON";

  return { ...d, arrive, leave, status };
}

function getNextDrive(current, next) {
  if (!next) return null;
  const miles = next.mile - current.mile;
  const drive = Math.max(5, Math.round(miles * 2));
  return { miles: miles.toFixed(1), drive };
}

function buildEmptyRecords() {
  return stations.map(() => ({ in: "", out: "", note: "", open: false }));
}

export default function App() {
  const [records, setRecords] = useState(buildEmptyRecords);
  const [tab, setTab] = useState("active");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.records) setRecords(saved.records);
      if (saved?.tab) setTab(saved.tab);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ records, tab }));
  }, [records, tab]);

  const currentIndexRaw = records.findIndex((r) => !r.out);
  const currentIndex = currentIndexRaw === -1 ? stations.length - 1 : currentIndexRaw;
  const current = stations[currentIndex];
  const next = stations[currentIndex + 1];

  const crew = getCrew(current);
  const nextDrive = getNextDrive(current, next);

  const prediction = useMemo(() => {
    const start = new Date("2026-05-04T05:00:00");
    const finish = stations[stations.length - 1];

    let lastActualIndex = -1;
    records.forEach((r, i) => {
      if (r.in || r.out) lastActualIndex = i;
    });

    if (lastActualIndex < 0) {
      return {
        basedOn: "No actuals yet",
        projectedFinish: "",
        projectedHours: null,
        deltaVsPlan: null,
        projectedNext: "",
        paceMinPerMile: null,
      };
    }

    const lastStation = stations[lastActualIndex];
    const lastTime = new Date(records[lastActualIndex].out || records[lastActualIndex].in);
    const elapsedMs = lastTime - start;
    const elapsedMinutes = elapsedMs / 60000;
    const paceMinPerMile = elapsedMinutes / lastStation.mile;

    const remainingMiles = finish.mile - lastStation.mile;
    const projectedFinish = new Date(lastTime.getTime() + remainingMiles * paceMinPerMile * 60000);

    const plannedFinish = new Date(finish.in);
    const deltaVsPlan = projectedFinish - plannedFinish;

    const nextTarget = stations.find((s, i) => i > lastActualIndex);
    const projectedNext = nextTarget
      ? new Date(lastTime.getTime() + (nextTarget.mile - lastStation.mile) * paceMinPerMile * 60000)
      : "";

    return {
      basedOn: `${lastStation.name} mile ${lastStation.mile}`,
      projectedFinish,
      projectedHours: (projectedFinish - start) / 3600000,
      deltaVsPlan,
      projectedNext,
      nextTarget,
      paceMinPerMile,
    };
  }, [records]);

  function stamp(i, field) {
    const now = new Date().toISOString();
    setRecords((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: now } : r)));
  }

  function updateNote(i, note) {
    setRecords((prev) => prev.map((r, idx) => (idx === i ? { ...r, note } : r)));
  }

  function toggleNote(i) {
    setRecords((prev) => prev.map((r, idx) => (idx === i ? { ...r, open: !r.open } : r)));
  }

  function resetAll() {
    if (!confirm("Reset all local race data?")) return;
    setRecords(buildEmptyRecords());
    localStorage.removeItem(STORAGE_KEY);
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#fdf6ec",
      padding: 12,
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      color: "#3B2432",
    },
    wrap: {
      maxWidth: 430,
      margin: "0 auto",
      display: "grid",
      gap: 12,
    },
    card: {
      background: "#fff7ed",
      borderRadius: 22,
      padding: 14,
      border: "1px solid #e5d3b3",
    },
    grid2: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 10,
    },
    button: {
      minHeight: 48,
      borderRadius: 16,
      border: "none",
      fontWeight: 800,
      padding: 10,
    },
    input: {
      width: "100%",
      height: 42,
      borderRadius: 14,
      border: "1px solid #e5d3b3",
      padding: "0 10px",
      boxSizing: "border-box",
    },
    small: {
      fontSize: 13,
      color: "#8F7D63",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.card}>
          <h2 style={{ margin: 0 }}>{current.name}</h2>
          <div style={styles.small}>Mile {current.mile}</div>

          <div style={{ marginTop: 10 }}>
            <strong>Randi Planned</strong>
            <br />
            In: {time(current.in)}
            <br />
            Out: {time(current.out)}
          </div>

          <div style={{ ...styles.grid2, marginTop: 12 }}>
            <button
              style={{ ...styles.button, background: "#ef476f", color: "#fff" }}
              onClick={() => stamp(currentIndex, "in")}
            >
              TAP IN
            </button>
            <button
              style={{ ...styles.button, background: "#ffd60a", color: "#3B2432" }}
              onClick={() => stamp(currentIndex, "out")}
            >
              TAP OUT
            </button>
          </div>

          <div style={{ ...styles.grid2, marginTop: 12, fontSize: 13 }}>
            <div>
              <strong>Actual In</strong>
              <br />
              {fmt(records[currentIndex]?.in)}
            </div>
            <div>
              <strong>Actual Out</strong>
              <br />
              {fmt(records[currentIndex]?.out)}
            </div>
            <div>
              <strong>Hotel</strong>
              <br />
              {crew.hotel}
            </div>
            <div>
              <strong>Hotel Drive</strong>
              <br />
              {crew.drive} min / {crew.distance} mi
            </div>
            <div>
              <strong>Crew Leave</strong>
              <br />
              {time(crew.leave)}
            </div>
            <div>
              <strong>Crew Arrive</strong>
              <br />
              {time(crew.arrive)}
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <strong>Status:</strong> {crew.status}
          </div>

          {next && (
            <div style={{ marginTop: 12 }}>
              <strong>Current → Next Aid</strong>
              <br />
              {current.name} → {next.name}
              <br />
              Drive estimate: {nextDrive.drive} min / {nextDrive.miles} mi
            </div>
          )}

          <input
            style={{ ...styles.input, marginTop: 12 }}
            placeholder="Notes"
            value={records[currentIndex]?.note || ""}
            onChange={(e) => updateNote(currentIndex, e.target.value)}
          />
        </div>

        <div style={styles.grid2}>
          {["active", "stations", "prediction", "backup"].map((t) => (
            <button
              key={t}
              style={{
                ...styles.button,
                background: tab === t ? "#ef476f" : "#fff7ed",
                color: tab === t ? "#fff" : "#3B2432",
                border: "1px solid #e5d3b3",
              }}
              onClick={() => setTab(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {tab === "stations" && (
          <div style={styles.card}>
            <h3>Stations</h3>
            {stations.map((s, i) => {
              const c = getCrew(s);
              const nextStation = stations[i + 1];
              const stationDrive = getNextDrive(s, nextStation);

              return (
                <div key={s.name} style={{ borderTop: "1px solid #e5d3b3", padding: "12px 0" }}>
                  <strong>{s.name}</strong>
                  <div style={styles.small}>
                    Mile {s.mile} · Planned In {time(s.in)} · Out {time(s.out)}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>
                    Hotel: {c.hotel}
                    <br />
                    Hotel drive: {c.drive} min / {c.distance} mi
                    <br />
                    Crew leave: {time(c.leave)} · arrive: {time(c.arrive)}
                    <br />
                    Status: {c.status}
                    <br />
                    {nextStation && (
                      <>
                        To next: {nextStation.name} · {stationDrive.drive} min / {stationDrive.miles} mi
                      </>
                    )}
                  </div>

                  <div style={{ ...styles.grid2, marginTop: 8 }}>
                    <button style={styles.button} onClick={() => stamp(i, "in")}>
                      IN
                    </button>
                    <button style={styles.button} onClick={() => stamp(i, "out")}>
                      OUT
                    </button>
                  </div>

                  <input
                    style={{ ...styles.input, marginTop: 8 }}
                    placeholder="Station note"
                    value={records[i]?.note || ""}
                    onChange={(e) => updateNote(i, e.target.value)}
                  />

                  {records[i]?.note && (
                    <button
                      style={{ ...styles.button, width: "100%", marginTop: 8 }}
                      onClick={() => toggleNote(i)}
                    >
                      {records[i].open ? "Hide note" : "Show note"}
                    </button>
                  )}

                  {records[i]?.open && (
                    <div style={{ background: "#fff", padding: 10, borderRadius: 12, marginTop: 8 }}>
                      {records[i].note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "prediction" && (
          <div style={styles.card}>
            <h3>Live Prediction Engine</h3>
            <div>
              <strong>Based on:</strong>
              <br />
              {prediction.basedOn}
            </div>
            <div style={{ marginTop: 10 }}>
              <strong>Projected Finish:</strong>
              <br />
              {fmt(prediction.projectedFinish)}
            </div>
            <div style={{ marginTop: 10 }}>
              <strong>Projected Cumulative Hours:</strong>
              <br />
              {prediction.projectedHours ? `${prediction.projectedHours.toFixed(1)} hrs` : "—"}
            </div>
            <div style={{ marginTop: 10 }}>
              <strong>Trend vs Planned Finish:</strong>
              <br />
              {duration(prediction.deltaVsPlan)}
            </div>
            <div style={{ marginTop: 10 }}>
              <strong>Projected Next Station:</strong>
              <br />
              {prediction.nextTarget
                ? `${prediction.nextTarget.name}: ${fmt(prediction.projectedNext)}`
                : "—"}
            </div>
            <div style={{ marginTop: 10 }}>
              <strong>Average Actual Pace:</strong>
              <br />
              {prediction.paceMinPerMile
                ? `${prediction.paceMinPerMile.toFixed(1)} min / mile elapsed`
                : "—"}
            </div>
          </div>
        )}

        {tab === "backup" && (
          <div style={styles.card}>
            <h3>Backup</h3>
            <button
              style={{ ...styles.button, width: "100%" }}
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify({ records, tab }, null, 2));
                alert("Backup copied.");
              }}
            >
              Copy Backup JSON
            </button>
            <button
              style={{
                ...styles.button,
                width: "100%",
                marginTop: 10,
                background: "#fee2e2",
              }}
              onClick={resetAll}
            >
              Reset All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
