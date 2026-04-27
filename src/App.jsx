import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cocodona-crew-v10-pwa-readonly";

const stations = [
  { name: "Cottonwood Creek", mile: 7.4, in: "2026-05-04T07:30:00", out: "2026-05-04T07:35:00" },
  { name: "Lane Mountain", mile: 32.5, in: "2026-05-04T14:00:00", out: "2026-05-04T14:30:00" },
  { name: "Crown King", mile: 36.6, in: "2026-05-04T18:00:00", out: "2026-05-04T19:00:00" },
  { name: "Arrastra Creek", mile: 51.1, in: "2026-05-04T23:00:00", out: "2026-05-05T00:00:00" },
  { name: "Kamp Kipa", mile: 60.9, in: "2026-05-05T04:00:00", out: "2026-05-05T05:00:00" },
  { name: "Camp W", mile: 67.5, in: "2026-05-05T06:00:00", out: "2026-05-05T06:10:00" },
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

const crewAccessibleAid = new Set([
  "Crown King",
  "Whiskey Row",
  "Watson Lake",
  "Fain Ranch",
  "Mingus Mountain",
  "Jerome",
  "Dead Horse",
  "Sedona Posse Grounds",
  "Schnebly Hill",
  "Munds Park",
  "Fort Tuthill",
  "Walnut Canyon",
  "Wildcat Hill",
  "Finish",
]);

const driveData = {
  "Cottonwood Creek": { hotel: "Hotel St. Michael", distance: 58, drive: 75 },
  "Lane Mountain": { hotel: "Hotel St. Michael", distance: 49, drive: 70 },
  "Crown King": { hotel: "Hotel St. Michael", distance: 48, drive: 85 },
  "Arrastra Creek": { hotel: "Hotel St. Michael", distance: 28, drive: 60 },
  "Kamp Kipa": { hotel: "Hotel St. Michael", distance: 18, drive: 40 },
  "Camp W": { hotel: "Hotel St. Michael", distance: 10, drive: 25 },
  "Whiskey Row": { hotel: "Hotel St. Michael", distance: 0.2, drive: 5 },
  "Watson Lake": { hotel: "Hotel St. Michael", distance: 5, drive: 15 },
  "Fain Ranch": { hotel: "Hotel St. Michael", distance: 16, drive: 30 },
  "Mingus Mountain": { hotel: "The Grand Hotel", distance: 21, drive: 45 },
  Jerome: { hotel: "The Grand Hotel", distance: 0.2, drive: 5 },
  "Dead Horse": { hotel: "The Sky Rock Sedona", distance: 20, drive: 35 },
  "Deer Pass": { hotel: "The Sky Rock Sedona", distance: 26, drive: 45 },
  "Sedona Posse Grounds": { hotel: "The Sky Rock Sedona", distance: 2, drive: 8 },
  "Schnebly Hill": { hotel: "The Sky Rock Sedona", distance: 7, drive: 20 },
  "Munds Park": { hotel: "Little America Hotel", distance: 22, drive: 30 },
  "Kelly Canyon": { hotel: "Little America Hotel", distance: 14, drive: 25 },
  "Fort Tuthill": { hotel: "Little America Hotel", distance: 7, drive: 15 },
  "Walnut Canyon": { hotel: "Little America Hotel", distance: 10, drive: 25 },
  "Wildcat Hill": { hotel: "Little America Hotel", distance: 9, drive: 20 },
  "Trinity Heights": { hotel: "Little America Hotel", distance: 4, drive: 12 },
  Finish: { hotel: "Little America Hotel", distance: 3, drive: 10 },
};

function buildEmptyRecords() {
  return stations.map(() => ({ in: "", out: "", note: "", open: false }));
}

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

function accessLabel(name) {
  return crewAccessibleAid.has(name) ? "CREW ACCESSIBLE" : "NO CREW ACCESS";
}

function accessStyle(name) {
  const ok = crewAccessibleAid.has(name);
  return {
    display: "inline-block",
    marginTop: 8,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    background: ok ? "#dcfce7" : "#fee2e2",
    color: ok ? "#166534" : "#991b1b",
  };
}

function statusStyle(status) {
  return {
    display: "inline-block",
    marginTop: 8,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    background:
      status === "MISSED"
        ? "#fee2e2"
        : status === "LEAVE NOW"
          ? "#ef476f"
          : status === "SOON"
            ? "#ffd60a"
            : "#dcfce7",
    color: status === "LEAVE NOW" ? "#fff" : status === "MISSED" ? "#991b1b" : "#3B2432",
  };
}

function getCrew(station) {
  const d = driveData[station.name] || { hotel: "—", distance: "—", drive: 30 };
  const eta = new Date(station.in);
  const arrive = new Date(eta.getTime() - 60 * 60000);
  const leave = new Date(arrive.getTime() - Number(d.drive || 30) * 60000);

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

function mapsLink(station, hotel) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    hotel || ""
  )}&destination=${encodeURIComponent(station.name + " Cocodona")}`;
}

function encodeShareData(records) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(records))));
  } catch {
    return "";
  }
}

function decodeShareData(value) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(value))));
  } catch {
    return null;
  }
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const readOnly = params.get("readonly") === "1";
  const sharedData = params.get("data");

  const [records, setRecords] = useState(buildEmptyRecords);
  const [tab, setTab] = useState("active");

  useEffect(() => {
    if (sharedData) {
      const decoded = decodeShareData(sharedData);
      if (decoded?.length) setRecords(decoded);
      return;
    }

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.records) setRecords(saved.records);
      if (saved?.tab) setTab(saved.tab);
    } catch {}
  }, []);

  useEffect(() => {
    if (readOnly) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ records, tab }));
  }, [records, tab, readOnly]);

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
    if (readOnly) return;
    const now = new Date().toISOString();
    setRecords((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: now } : r)));
  }

  function updateNote(i, note) {
    if (readOnly) return;
    setRecords((prev) => prev.map((r, idx) => (idx === i ? { ...r, note } : r)));
  }

  function toggleNote(i) {
    setRecords((prev) => prev.map((r, idx) => (idx === i ? { ...r, open: !r.open } : r)));
  }

  function resetAll() {
    if (readOnly) return;
    if (!confirm("Reset all local race data?")) return;
    setRecords(buildEmptyRecords());
    localStorage.removeItem(STORAGE_KEY);
  }

  function copyReadOnlyLink() {
    const data = encodeShareData(records);
    const url = `${window.location.origin}${window.location.pathname}?readonly=1&data=${data}`;
    navigator.clipboard.writeText(url);
    alert("Read-only crew link copied.");
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(180deg, #FFF8EF 0%, #F8EFE2 100%)",
      padding: 12,
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      color: "#3B2432",
      boxSizing: "border-box",
      overflowX: "hidden",
    },
    wrap: {
      maxWidth: 430,
      margin: "0 auto",
      display: "grid",
      gap: 12,
      paddingBottom: 40,
    },
    card: {
      background: "#fff7ed",
      borderRadius: 22,
      padding: 14,
      border: "1px solid #e5d3b3",
      boxSizing: "border-box",
      overflow: "hidden",
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
      cursor: readOnly ? "not-allowed" : "pointer",
      opacity: readOnly ? 0.65 : 1,
    },
    input: {
      width: "100%",
      height: 42,
      borderRadius: 14,
      border: "1px solid #e5d3b3",
      padding: "0 10px",
      boxSizing: "border-box",
      background: "#fffdf9",
    },
    small: {
      fontSize: 13,
      color: "#8F7D63",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        {readOnly && (
          <div style={{ ...styles.card, background: "#fee2e2", fontWeight: 900 }}>
            READ-ONLY CREW VIEW
          </div>
        )}

        <div style={styles.card}>
          <h2 style={{ margin: 0 }}>{current.name}</h2>
          <div style={styles.small}>Mile {current.mile}</div>

          <div style={accessStyle(current.name)}>{accessLabel(current.name)}</div>

          <div style={{ marginTop: 10 }}>
            <strong>Randi Planned</strong>
            <br />
            In: {time(current.in)}
            <br />
            Out: {time(current.out)}
          </div>

          <div style={{ ...styles.grid2, marginTop: 12 }}>
            <button
              disabled={readOnly}
              style={{ ...styles.button, background: "#ef476f", color: "#fff" }}
              onClick={() => stamp(currentIndex, "in")}
            >
              TAP IN
            </button>
            <button
              disabled={readOnly}
              style={{ ...styles.button, background: "#ffd60a", color: "#3B2432" }}
              onClick={() => stamp(currentIndex, "out")}
            >
              TAP OUT
            </button>
          </div>

          <div style={{ ...styles.grid2, marginTop: 12, fontSize: 13 }}>
            <div><strong>Actual In</strong><br />{fmt(records[currentIndex]?.in)}</div>
            <div><strong>Actual Out</strong><br />{fmt(records[currentIndex]?.out)}</div>
            <div><strong>Hotel</strong><br />{crew.hotel}</div>
            <div><strong>Hotel Drive</strong><br />{crew.drive} min / {crew.distance} mi</div>
            <div><strong>Crew Leave</strong><br />{time(crew.leave)}</div>
            <div><strong>Crew Arrive</strong><br />{time(crew.arrive)}</div>
          </div>

          <div style={statusStyle(crew.status)}>{crew.status}</div>

          {crewAccessibleAid.has(current.name) && (
            <a
              href={mapsLink(current, crew.hotel)}
              target="_blank"
              rel="noreferrer"
              style={{ display: "block", marginTop: 12, color: "#ef476f", fontWeight: 800 }}
            >
              Open hotel → aid route
            </a>
          )}

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
            disabled={readOnly}
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
                cursor: "pointer",
                opacity: 1,
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

                  <div style={accessStyle(s.name)}>{accessLabel(s.name)}</div>

                  <div style={{ fontSize: 13, marginTop: 8 }}>
                    Hotel: {crewAccessibleAid.has(s.name) ? c.hotel : "No crew access"}
                    <br />
                    Hotel drive: {crewAccessibleAid.has(s.name) ? `${c.drive} min / ${c.distance} mi` : "—"}
                    <br />
                    Crew leave: {crewAccessibleAid.has(s.name) ? time(c.leave) : "—"} · arrive:{" "}
                    {crewAccessibleAid.has(s.name) ? time(c.arrive) : "—"}
                    <br />
                    Status: {crewAccessibleAid.has(s.name) ? c.status : "NO CREW ACCESS"}
                    <br />
                    {nextStation && (
                      <>
                        To next: {nextStation.name} · {stationDrive.drive} min / {stationDrive.miles} mi
                      </>
                    )}
                  </div>

                  <div style={{ ...styles.grid2, marginTop: 8 }}>
                    <button disabled={readOnly} style={styles.button} onClick={() => stamp(i, "in")}>
                      IN
                    </button>
                    <button disabled={readOnly} style={styles.button} onClick={() => stamp(i, "out")}>
                      OUT
                    </button>
                  </div>

                  <input
                    disabled={readOnly}
                    style={{ ...styles.input, marginTop: 8 }}
                    placeholder="Station note"
                    value={records[i]?.note || ""}
                    onChange={(e) => updateNote(i, e.target.value)}
                  />

                  {records[i]?.note && (
                    <button
                      style={{ ...styles.button, width: "100%", marginTop: 8, cursor: "pointer", opacity: 1 }}
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
            <strong>Based on:</strong><br />{prediction.basedOn}
            <br /><br />
            <strong>Projected Finish:</strong><br />{fmt(prediction.projectedFinish)}
            <br /><br />
            <strong>Projected Cumulative Hours:</strong><br />
            {prediction.projectedHours ? `${prediction.projectedHours.toFixed(1)} hrs` : "—"}
            <br /><br />
            <strong>Trend vs Planned Finish:</strong><br />{duration(prediction.deltaVsPlan)}
            <br /><br />
            <strong>Projected Next Station:</strong><br />
            {prediction.nextTarget ? `${prediction.nextTarget.name}: ${fmt(prediction.projectedNext)}` : "—"}
          </div>
        )}

        {tab === "backup" && (
          <div style={styles.card}>
            <h3>Backup / Share</h3>

            {!readOnly && (
              <>
                <button style={{ ...styles.button, width: "100%" }} onClick={copyReadOnlyLink}>
                  Copy Read-Only Crew Link
                </button>

                <button
                  style={{ ...styles.button, width: "100%", marginTop: 10 }}
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
              </>
            )}

            {readOnly && <div>This is a locked crew view. No edits allowed.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
