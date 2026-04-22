import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cocodona-crew-console";

const stations = [
  { name: "Start – Black Canyon", mile: 0.0 },
  { name: "Cottonwood Creek", mile: 7.4 },
  { name: "Lane Mountain", mile: 32.5 },
  { name: "Crown King", mile: 36.6 },
  { name: "Arrastra Creek", mile: 51.1 },
  { name: "Kamp Kipa", mile: 60.9 },
  { name: "Camp W", mile: 67.5 },
  { name: "Whiskey Row", mile: 75.8 },
  { name: "Watson Lake", mile: 82.8 },
  { name: "Fain Ranch", mile: 94.5 },
  { name: "Mingus Mountain", mile: 106.8 },
  { name: "Jerome", mile: 123.8 },
  { name: "Dead Horse Ranch", mile: 132.5 },
  { name: "Deer Pass", mile: 146.5 },
  { name: "Sedona Posse Grounds", mile: 158.8 },
  { name: "Schnebly Hill", mile: 175.7 },
  { name: "Munds Park", mile: 189.6 },
  { name: "Kelly Canyon", mile: 202.3 },
  { name: "Fort Tuthill", mile: 210.6 },
  { name: "Walnut Canyon", mile: 226.8 },
  { name: "Wildcat Hill", mile: 233.7 },
  { name: "Trinity Heights", mile: 249.0 },
  { name: "Finish – Flagstaff", mile: 252.9 }
];

function nowString() {
  return new Date().toLocaleString();
}

function App() {
  const [records, setRecords] = useState(() =>
    stations.map(() => ({ inTime: "", outTime: "", note: "" }))
  );

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setRecords(JSON.parse(raw));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const completed = useMemo(
    () => records.filter((r) => r.inTime || r.outTime).length,
    [records]
  );

  function stamp(index, field) {
    setRecords((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, [field]: nowString() } : r
      )
    );
  }

  function updateNote(index, value) {
    setRecords((prev) =>
      prev.map((r, i) => (i === index ? { ...r, note: value } : r))
    );
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 16, background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 4 }}>Cocodona Crew Console</h1>
        <p style={{ color: "#475569", marginTop: 0 }}>
          Simple persistent race tracker
        </p>

        <div style={{ marginBottom: 20, padding: 12, background: "#fff", borderRadius: 12, border: "1px solid #cbd5e1" }}>
          Progress: {completed} / {stations.length}
        </div>

        {stations.map((station, index) => (
          <div
            key={station.name}
            style={{
              background: "#fff",
              border: "1px solid #cbd5e1",
              borderRadius: 16,
              padding: 16,
              marginBottom: 12
            }}
          >
            <h3 style={{ margin: "0 0 6px 0" }}>
              {station.name}
            </h3>
            <div style={{ color: "#64748b", marginBottom: 12 }}>
              Mile {station.mile}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button
                onClick={() => stamp(index, "inTime")}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "none",
                  background: "#111827",
                  color: "#fff",
                  fontWeight: 700
                }}
              >
                TAP IN
              </button>
              <button
                onClick={() => stamp(index, "outTime")}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  color: "#111827",
                  fontWeight: 700
                }}
              >
                TAP OUT
              </button>
            </div>

            <div style={{ marginBottom: 8 }}>
              <strong>In:</strong> {records[index].inTime || "—"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Out:</strong> {records[index].outTime || "—"}
            </div>

            <input
              value={records[index].note}
              onChange={(e) => updateNote(index, e.target.value)}
              placeholder="Quick note"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                boxSizing: "border-box"
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
