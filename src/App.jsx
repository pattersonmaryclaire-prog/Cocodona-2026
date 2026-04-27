import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cocodona-crew-console-prod-v6";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fdf6ec",
    padding: 12,
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    color: "#3B2432",
    boxSizing: "border-box",
  },
  wrap: {
    width: "100%",
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
    minHeight: 50,
    borderRadius: 16,
    fontWeight: 800,
    border: "none",
    cursor: "pointer",
    padding: "10px 12px",
    boxSizing: "border-box",
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
  small: { fontSize: 13, color: "#8F7D63" },
  badge: (status) => ({
    display: "inline-block",
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
    color:
      status === "LEAVE NOW"
        ? "#fff"
        : status === "MISSED"
          ? "#991b1b"
          : "#3B2432",
  }),
};

const stations = [
  { name: "Cottonwood Creek", mile: 7.4, plannedIn: "2026-05-04T07:30:00" },
  { name: "Lane Mountain", mile: 32.5, plannedIn: "2026-05-04T14:00:00" },
  { name: "Crown King", mile: 36.6, plannedIn: "2026-05-04T18:00:00" },
  { name: "Arrastra Creek", mile: 51.1, plannedIn: "2026-05-04T23:00:00" },
  { name: "Kamp Kipa", mile: 60.9, plannedIn: "2026-05-05T04:00:00" },
  { name: "Whiskey Row", mile: 75.7, plannedIn: "2026-05-05T08:30:00" },
  { name: "Watson Lake", mile: 82.8, plannedIn: "2026-05-05T13:00:00" },
  { name: "Fain Ranch", mile: 94.5, plannedIn: "2026-05-05T16:00:00" },
  { name: "Mingus Mountain", mile: 106.8, plannedIn: "2026-05-05T21:00:00" },
  { name: "Jerome", mile: 123.8, plannedIn: "2026-05-06T07:00:00" },
  { name: "Dead Horse", mile: 132.5, plannedIn: "2026-05-06T12:00:00" },
  { name: "Deer Pass", mile: 146.5, plannedIn: "2026-05-06T16:00:00" },
  { name: "Sedona Posse Grounds", mile: 158.8, plannedIn: "2026-05-06T22:30:00" },
  { name: "Schnebly Hill", mile: 175.7, plannedIn: "2026-05-07T07:00:00" },
  { name: "Munds Park", mile: 189.6, plannedIn: "2026-05-07T12:00:00" },
  { name: "Kelly Canyon", mile: 202.3, plannedIn: "2026-05-07T16:00:00" },
  { name: "Fort Tuthill", mile: 210.6, plannedIn: "2026-05-07T20:30:00" },
  { name: "Walnut Canyon", mile: 226.8, plannedIn: "2026-05-08T02:30:00" },
  { name: "Wildcat Hill", mile: 233.7, plannedIn: "2026-05-08T06:30:00" },
  { name: "Trinity Heights", mile: 249.0, plannedIn: "2026-05-08T13:00:00" },
  { name: "Finish", mile: 252.9, plannedIn: "2026-05-08T14:00:00" },
];

const defaultDriveData = {
  "Cottonwood Creek": { hotel: "Hotel St. Michael", optional: "Grand Highland Hotel / Hassayampa Inn", distance: 58, drive: 75 },
  "Lane Mountain": { hotel: "Hotel St. Michael", optional: "Grand Highland Hotel / Hassayampa Inn", distance: 49, drive: 70 },
  "Crown King": { hotel: "Hotel St. Michael", optional: "Grand Highland Hotel / Hassayampa Inn", distance: 48, drive: 85 },
  "Arrastra Creek": { hotel: "Hotel St. Michael", optional: "Grand Highland Hotel / Hassayampa Inn", distance: 28, drive: 60 },
  "Kamp Kipa": { hotel: "Hotel St. Michael", optional: "Grand Highland Hotel / Hassayampa Inn", distance: 18, drive: 40 },
  "Whiskey Row": { hotel: "Hotel St. Michael", optional: "Grand Highland Hotel / Hassayampa Inn", distance: 0.2, drive: 5 },
  "Watson Lake": { hotel: "Hotel St. Michael", optional: "Grand Highland Hotel / Hassayampa Inn", distance: 5, drive: 15 },
  "Fain Ranch": { hotel: "Hotel St. Michael", optional: "Grand Highland Hotel / Hassayampa Inn", distance: 16, drive: 30 },
  "Mingus Mountain": { hotel: "The Grand Hotel", optional: "Connor Hotel / Surgeons House B&B", distance: 21, drive: 45 },
  Jerome: { hotel: "The Grand Hotel", optional: "Connor Hotel / Surgeons House B&B", distance: 0.2, drive: 5 },
  "Dead Horse": { hotel: "Sky Rock Sedona", optional: "Arabella Sedona / Poco Diablo Resort", distance: 20, drive: 35 },
  "Deer Pass": { hotel: "Sky Rock Sedona", optional: "Arabella Sedona / Poco Diablo Resort", distance: 26, drive: 45 },
  "Sedona Posse Grounds": { hotel: "Sky Rock Sedona", optional: "Arabella Sedona / Poco Diablo Resort", distance: 2, drive: 8 },
  "Schnebly Hill": { hotel: "Sky Rock Sedona", optional: "Arabella Sedona / Poco Diablo Resort", distance: 7, drive: 20 },
  "Munds Park": { hotel: "Little America Hotel", optional: "Drury Inn Flagstaff / Residence Inn Flagstaff", distance: 22, drive: 30 },
  "Kelly Canyon": { hotel: "Little America Hotel", optional: "Drury Inn Flagstaff / Residence Inn Flagstaff", distance: 14, drive: 25 },
  "Fort Tuthill": { hotel: "Little America Hotel", optional: "Drury Inn Flagstaff / Residence Inn Flagstaff", distance: 7, drive: 15 },
  "Walnut Canyon": { hotel: "Little America Hotel", optional: "Drury Inn Flagstaff / Residence Inn Flagstaff", distance: 10, drive: 25 },
  "Wildcat Hill": { hotel: "Little America Hotel", optional: "Drury Inn Flagstaff / Residence Inn Flagstaff", distance: 9, drive: 20 },
  "Trinity Heights": { hotel: "Little America Hotel", optional: "Drury Inn Flagstaff / Residence Inn Flagstaff", distance: 4, drive: 12 },
  Finish: { hotel: "Little America Hotel", optional: "Drury Inn Flagstaff / Residence Inn Flagstaff", distance: 3, drive: 10 },
};

function emptyRecords() {
  return stations.map(() => ({ in: "", out: "", note: "", open: false }));
}

function fmt(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function time(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function mapsLink(station, hotel) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    hotel || ""
  )}&destination=${encodeURIComponent(station.name + " Cocodona")}`;
}

function getCrew(station, driveData) {
  const d = driveData[station.name] || {};
  const eta = new Date(station.plannedIn);
  const arrive = new Date(eta.getTime() - 60 * 60000);
  const drive = Number(d.drive || 30);
  const leave = new Date(arrive.getTime() - drive * 60000);
  const now = new Date();

  let status = "OK";
  if (now > arrive) status = "MISSED";
  else if (now >= leave) status = "LEAVE NOW";
  else if (leave - now <= 30 * 60000) status = "SOON";

  return { ...d, drive, arrive, leave, status };
}

export default function App() {
  const [records, setRecords] = useState(emptyRecords);
  const [driveData, setDriveData] = useState(defaultDriveData);
  const [tab, setTab] = useState("active");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.records) setRecords(parsed.records);
      if (parsed.driveData) setDriveData(parsed.driveData);
      if (parsed.tab) setTab(parsed.tab);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ records, driveData, tab }));
  }, [records, driveData, tab]);

  const currentIndexRaw = records.findIndex((r) => !r.out);
  const currentIndex = currentIndexRaw === -1 ? stations.length - 1 : currentIndexRaw;
  const current = stations[currentIndex];
  const crew = getCrew(current, driveData);

  const nextLeaveNow = useMemo(() => {
    return stations
      .map((s, i) => ({ station: s, crew: getCrew(s, driveData), i }))
      .find((x) => x.crew.status === "LEAVE NOW" || x.crew.status === "SOON");
  }, [driveData]);

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

  function updateDrive(stationName, drive) {
    setDriveData((prev) => ({
      ...prev,
      [stationName]: { ...prev[stationName], drive: Number(drive || 0) },
    }));
  }

  function resetAll() {
    if (!confirm("Reset all race data on this device?")) return;
    setRecords(emptyRecords());
    setDriveData(defaultDriveData);
    localStorage.removeItem(STORAGE_KEY);
  }

  function exportBackup() {
    const payload = JSON.stringify({ records, driveData, tab }, null, 2);
    navigator.clipboard?.writeText(payload);
    alert("Backup copied to clipboard.");
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        {nextLeaveNow && (
          <div
            style={{
              ...styles.card,
              background: nextLeaveNow.crew.status === "LEAVE NOW" ? "#ef476f" : "#ffd60a",
              color: nextLeaveNow.crew.status === "LEAVE NOW" ? "#fff" : "#3B2432",
              fontWeight: 900,
            }}
          >
            {nextLeaveNow.crew.status}: {nextLeaveNow.station.name}
            <div style={{ fontSize: 13, marginTop: 4 }}>
              Leave {time(nextLeaveNow.crew.leave)} · Arrive {time(nextLeaveNow.crew.arrive)}
            </div>
          </div>
        )}

        <div style={styles.card}>
          <h2 style={{ margin: 0 }}>{current.name}</h2>
          <div style={styles.small}>Mile {current.mile} · ETA {fmt(current.plannedIn)}</div>

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
            <div><strong>Actual In</strong><br />{fmt(records[currentIndex]?.in)}</div>
            <div><strong>Actual Out</strong><br />{fmt(records[currentIndex]?.out)}</div>
            <div><strong>Hotel</strong><br />{crew.hotel}</div>
            <div><strong>Optional</strong><br />{crew.optional}</div>
            <div><strong>Distance</strong><br />{crew.distance} mi</div>
            <div><strong>Drive</strong><br />{crew.drive} min</div>
            <div><strong>Crew Arrive</strong><br />{time(crew.arrive)}</div>
            <div><strong>Crew Leave</strong><br />{time(crew.leave)}</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <span style={styles.badge(crew.status)}>{crew.status}</span>
          </div>

          <a
            href={mapsLink(current, crew.hotel)}
            target="_blank"
            rel="noreferrer"
            style={{ display: "block", marginTop: 12 }}
          >
            Open route in Maps
          </a>

          <input
            style={{ ...styles.input, marginTop: 12 }}
            placeholder="Crew notes"
            value={records[currentIndex]?.note || ""}
            onChange={(e) => updateNote(currentIndex, e.target.value)}
          />
        </div>

        <div style={styles.grid2}>
          {["active", "stations", "drive", "backup"].map((t) => (
            <button
              key={t}
              style={{
                ...styles.button,
                height: 44,
                background: tab === t ? "#ef476f" : "#fff7ed",
                color: tab === t ? "#fff" : "#3B2432",
                border: "1px solid #e5d3b3",
                fontSize: 14,
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
              const c = getCrew(s, driveData);
              return (
                <div key={s.name} style={{ borderTop: "1px solid #e5d3b3", padding: "12px 0" }}>
                  <strong>{s.name}</strong>
                  <div style={styles.small}>Mile {s.mile} · ETA {fmt(s.plannedIn)}</div>
                  <span style={styles.badge(c.status)}>{c.status}</span>
                  <div style={{ fontSize: 13, marginTop: 8 }}>
                    Hotel: {c.hotel}<br />
                    Optional: {c.optional}<br />
                    Distance: {c.distance} mi · Drive: {c.drive} min<br />
                    Leave: {time(c.leave)} · Arrive: {time(c.arrive)}
                  </div>
                  <a href={mapsLink(s, c.hotel)} target="_blank" rel="noreferrer">
                    Open route
                  </a>
                  <div style={{ ...styles.grid2, marginTop: 8 }}>
                    <button style={styles.button} onClick={() => stamp(i, "in")}>IN</button>
                    <button style={styles.button} onClick={() => stamp(i, "out")}>OUT</button>
                  </div>
                  {records[i]?.note && (
                    <>
                      <button
                        style={{ ...styles.button, width: "100%", marginTop: 8, height: 40, fontSize: 14 }}
                        onClick={() => toggleNote(i)}
                      >
                        {records[i].open ? "Hide note" : "Show note"}
                      </button>
                      {records[i].open && (
                        <div style={{ marginTop: 8, background: "#fff", padding: 10, borderRadius: 12 }}>
                          {records[i].note}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "drive" && (
          <div style={styles.card}>
            <h3>Editable Drive Times</h3>
            {stations.map((s) => {
              const d = driveData[s.name] || {};
              return (
                <div key={s.name} style={{ borderTop: "1px solid #e5d3b3", padding: "12px 0" }}>
                  <strong>{s.name}</strong>
                  <div style={styles.small}>{d.hotel} · {d.distance} mi</div>
                  <input
                    style={styles.input}
                    type="number"
                    value={d.drive || ""}
                    onChange={(e) => updateDrive(s.name, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {tab === "backup" && (
          <div style={styles.card}>
            <h3>Backup</h3>
            <button style={{ ...styles.button, width: "100%" }} onClick={exportBackup}>
              Copy Backup JSON
            </button>
            <button
              style={{ ...styles.button, width: "100%", marginTop: 10, background: "#fee2e2" }}
              onClick={resetAll}
            >
              Reset All Local Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
