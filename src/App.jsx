import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cocodona-crew-v16-pacer-color-fix";

const RACE_START = "2026-05-04T05:00:00";
const GOAL_FINISH = "2026-05-08T02:00:00";
const FINISH_MILE = 253.3;

const stationPlan = [
  { name: "Cottonwood Creek", mile: 7.4, restMinutes: 5, weightFromPrevious: 1.05, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },
  { name: "Lane Mountain", mile: 32.5, restMinutes: 30, weightFromPrevious: 1.25, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },
  { name: "Crown King", mile: 36.6, restMinutes: 60, weightFromPrevious: 1.75, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },
  { name: "Arrastra Creek", mile: 51.0, restMinutes: 60, weightFromPrevious: 1.05, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },
  { name: "Kamp Kipa", mile: 60.8, restMinutes: 60, weightFromPrevious: 1.1, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },
  { name: "Camp W", mile: 67.4, restMinutes: 10, weightFromPrevious: 0.95, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },
  { name: "Whiskey Row", mile: 75.6, restMinutes: 120, weightFromPrevious: 0.9, pacer: "NO PACER SECTION", shoes: "ROAD SHOES" },
  { name: "Watson Lake", mile: 82.8, restMinutes: 10, weightFromPrevious: 0.9, pacer: "Lin / Ben", shoes: "NO SHOE CHANGE" },
  { name: "Fain Ranch", mile: 96.5, restMinutes: 60, weightFromPrevious: 0.95, pacer: "Lin", shoes: "NO SHOE CHANGE" },
  { name: "Mingus Mountain", mile: 107.2, restMinutes: 60, weightFromPrevious: 1.35, pacer: "Ben", shoes: "NO SHOE CHANGE" },
  { name: "Jerome", mile: 124.2, restMinutes: 120, weightFromPrevious: 1.15, pacer: "Ben", shoes: "ROAD SHOES" },
  { name: "Dead Horse", mile: 132.9, restMinutes: 15, weightFromPrevious: 1.0, pacer: "Lin", shoes: "TRAIL SHOES" },
  { name: "Deer Pass", mile: 146.9, restMinutes: 60, weightFromPrevious: 1.15, pacer: "Ben", shoes: "NO SHOE CHANGE" },
  { name: "Sedona Posse Grounds", mile: 159.1, restMinutes: 120, weightFromPrevious: 1.3, pacer: "Ben", shoes: "NO SHOE CHANGE" },
  { name: "Schnebly Hill", mile: 176.1, restMinutes: 60, weightFromPrevious: 1.4, pacer: "Joe", shoes: "ROAD SHOES" },
  { name: "Munds Park", mile: 190.0, restMinutes: 60, weightFromPrevious: 1.05, pacer: "NO PACER SECTION", shoes: "ROAD SHOES" },
  { name: "Kelly Canyon", mile: 202.7, restMinutes: 10, weightFromPrevious: 1.0, pacer: "Ben", shoes: "NO SHOE CHANGE" },
  { name: "Fort Tuthill", mile: 211.0, restMinutes: 120, weightFromPrevious: 1.05, pacer: "Ben", shoes: "ROAD SHOES" },
  { name: "Walnut Canyon", mile: 227.1, restMinutes: 60, weightFromPrevious: 1.2, pacer: "Lin", shoes: "NO SHOE CHANGE" },
  { name: "Wildcat Hill", mile: 234.1, restMinutes: 30, weightFromPrevious: 1.15, pacer: "Joe C", shoes: "ROAD SHOES" },
  { name: "Trinity Heights", mile: 249.4, restMinutes: 5, weightFromPrevious: 1.1, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },
  { name: "Finish", mile: 253.3, restMinutes: 0, weightFromPrevious: 1.0, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },
];

function roundToFiveMinutes(date) {
  const rounded = new Date(date);
  const mins = rounded.getMinutes();
  const roundedMins = Math.round(mins / 5) * 5;
  rounded.setMinutes(roundedMins, 0, 0);
  return rounded;
}

function localDateString(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:00`;
}

function generateStations() {
  const start = new Date(RACE_START);
  const finish = new Date(GOAL_FINISH);
  const totalRaceMs = finish - start;

  const totalPlannedRestMs = stationPlan.reduce((sum, station) => {
    if (station.name === "Finish") return sum;
    return sum + station.restMinutes * 60000;
  }, 0);

  const totalMovingMs = totalRaceMs - totalPlannedRestMs;

  const weightedSegments = stationPlan.map((station, index) => {
    const previousMile = index === 0 ? 0 : stationPlan[index - 1].mile;
    const segmentMiles = station.mile - previousMile;
    const weightedMiles = segmentMiles * station.weightFromPrevious;
    return { ...station, previousMile, segmentMiles, weightedMiles };
  });

  const totalWeightedMiles = weightedSegments.reduce(
    (sum, station) => sum + station.weightedMiles,
    0
  );

  let cursor = new Date(start);

  return weightedSegments.map((station) => {
    const segmentMovingMs = (station.weightedMiles / totalWeightedMiles) * totalMovingMs;

    const plannedInDate =
      station.name === "Finish"
        ? finish
        : roundToFiveMinutes(new Date(cursor.getTime() + segmentMovingMs));

    const plannedOutDate =
      station.restMinutes > 0
        ? roundToFiveMinutes(new Date(plannedInDate.getTime() + station.restMinutes * 60000))
        : null;

    cursor = plannedOutDate || plannedInDate;

    return {
      name: station.name,
      mile: station.mile,
      restMinutes: station.restMinutes,
      weightFromPrevious: station.weightFromPrevious,
      pacer: station.pacer || "NO PACER SECTION",
      shoes: station.shoes || "NO SHOE CHANGE",
      in: localDateString(plannedInDate),
      out: plannedOutDate ? localDateString(plannedOutDate) : "",
    };
  });
}

const stations = generateStations();

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

const hotelBases = {
  anthem: {
    label: "Start Base",
    hotel: "Hampton Inn Anthem",
    address: "42415 N 41st Dr, Anthem, AZ 85086",
  },
  prescott: {
    label: "Prescott Base",
    hotel: "Hotel St. Michael",
    address: "205 W Gurley St, Prescott, AZ",
  },
  jerome: {
    label: "Jerome Base",
    hotel: "The Grand Hotel",
    address: "200 Hill St, Jerome, AZ",
  },
  sedona: {
    label: "Sedona Base",
    hotel: "The Sky Rock Sedona",
    address: "1200 AZ-89A, Sedona, AZ",
  },
  flagstaff: {
    label: "Flagstaff Base",
    hotel: "Little America Hotel",
    address: "2515 E Butler Ave, Flagstaff, AZ",
  },
};

const driveData = {
  "Cottonwood Creek": { base: "anthem", distance: 32, drive: 45 },
  "Lane Mountain": { base: "anthem", distance: 28, drive: 40 },

  "Crown King": {
    base: "anthem",
    distance: 54,
    drive: 125,
    specialRoute: true,
    routeLabel: "Anthem → Bumble Bee Ranch pass stop → Crown King",
    passStopName: "Bumble Bee Ranch",
    passStopAddress: "23925 Bumble Bee Rd, Mayer, AZ",
    finalAidAddress: "7219 Main St, Crown King, AZ",
    leg1Drive: 35,
    passStopBuffer: 15,
    leg2Drive: 75,
    instructions:
      "Go to Bumble Bee Ranch first to obtain parking pass. Then continue via fire roads to Crown King. Do not route directly to Crown King without pass stop.",
  },

  "Arrastra Creek": { base: "prescott", distance: 28, drive: 60 },
  "Kamp Kipa": { base: "prescott", distance: 18, drive: 40 },
  "Camp W": { base: "prescott", distance: 10, drive: 25 },
  "Whiskey Row": { base: "prescott", distance: 0.2, drive: 5 },
  "Watson Lake": { base: "prescott", distance: 5, drive: 15 },
  "Fain Ranch": { base: "prescott", distance: 16, drive: 30 },

  "Mingus Mountain": { base: "jerome", distance: 21, drive: 45 },
  Jerome: { base: "jerome", distance: 0.2, drive: 5 },

  "Dead Horse": { base: "sedona", distance: 20, drive: 35 },
  "Deer Pass": { base: "sedona", distance: 26, drive: 45 },
  "Sedona Posse Grounds": { base: "sedona", distance: 2, drive: 8 },
  "Schnebly Hill": { base: "sedona", distance: 7, drive: 20 },

  "Munds Park": { base: "flagstaff", distance: 22, drive: 30 },
  "Kelly Canyon": { base: "flagstaff", distance: 14, drive: 25 },
  "Fort Tuthill": { base: "flagstaff", distance: 7, drive: 15 },
  "Walnut Canyon": { base: "flagstaff", distance: 10, drive: 25 },
  "Wildcat Hill": { base: "flagstaff", distance: 9, drive: 20 },
  "Trinity Heights": { base: "flagstaff", distance: 4, drive: 12 },
  Finish: { base: "flagstaff", distance: 3, drive: 10 },
};

function buildEmptyRecords() {
  return stations.map(() => ({ in: "", out: "", note: "", open: false }));
}

function mergeRecordsWithPlan(savedRecords) {
  const fresh = buildEmptyRecords();

  if (!Array.isArray(savedRecords)) return fresh;

  return fresh.map((empty, index) => ({
    ...empty,
    in: savedRecords[index]?.in || "",
    out: savedRecords[index]?.out || "",
    note: savedRecords[index]?.note || "",
    open: savedRecords[index]?.open || false,
  }));
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

function durationShort(ms) {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return "—";
  const mins = Math.round(Math.abs(ms) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function formatPlannedLine(station) {
  if (!station?.in) return "—";
  const inDate = new Date(station.in);
  const day = inDate.toLocaleDateString([], { weekday: "long" });
  const date = `${inDate.getMonth() + 1}/${inDate.getDate()}`;
  return `${day}, ${date}, Planned In: ${time(station.in)} Out: ${time(station.out)}`;
}

function plannedRestMs(station) {
  if (!station?.in || !station?.out) return null;
  const ms = new Date(station.out) - new Date(station.in);
  return ms > 0 ? ms : null;
}

function showRestBadge(station) {
  const ms = plannedRestMs(station);
  return ms && ms > 30 * 60000;
}

function actualStopMs(record) {
  if (!record?.in || !record?.out) return null;
  const ms = new Date(record.out) - new Date(record.in);
  return ms > 0 ? ms : null;
}

function restStatus(station, record) {
  const planned = plannedRestMs(station);
  const actual = actualStopMs(record);

  if (!planned) return { label: "No planned rest", bg: "#E9E2D8", color: "#6B5B4D", delta: null, actual };
  if (!actual) return { label: "Planned rest", bg: "#F8E7B5", color: "#6E5A00", delta: null, actual };

  const delta = actual - planned;

  if (delta <= 0) return { label: "On / under rest", bg: "#dcfce7", color: "#166534", delta, actual };
  if (delta <= 15 * 60000) return { label: "Slight over rest", bg: "#ffd60a", color: "#3B2432", delta, actual };
  return { label: "Bleeding time", bg: "#fee2e2", color: "#991b1b", delta, actual };
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

function restBadgeStyle(rest) {
  return {
    display: "inline-block",
    marginTop: 8,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    background: rest.bg,
    color: rest.color,
  };
}

function infoPillStyle(bg = "#F8E7B5", color = "#3B2432") {
  return {
    display: "inline-block",
    marginTop: 8,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    background: bg,
    color,
  };
}

function pacerPillStyle() {
  return infoPillStyle("#e0e7ff", "#3730a3");
}

function shoesPillStyle(shoes) {
  return infoPillStyle(shoes === "NO SHOE CHANGE" ? "#E9E2D8" : "#bfdbfe", "#3B2432");
}

function getCrew(station) {
  const d = driveData[station.name] || { base: "prescott", distance: "—", drive: 30 };
  const base = hotelBases[d.base] || hotelBases.prescott;

  const eta = new Date(station.in);
  const arrive = new Date(eta.getTime() - 60 * 60000);
  const leave = new Date(arrive.getTime() - Number(d.drive || 30) * 60000);

  const passStopArrive =
    d.specialRoute && d.leg1Drive
      ? new Date(leave.getTime() + Number(d.leg1Drive) * 60000)
      : null;

  const passStopDepart =
    d.specialRoute && passStopArrive && d.passStopBuffer
      ? new Date(passStopArrive.getTime() + Number(d.passStopBuffer) * 60000)
      : null;

  const now = new Date();
  let status = "OK";
  if (now > arrive) status = "MISSED";
  else if (now >= leave) status = "LEAVE NOW";
  else if (leave - now < 30 * 60000) status = "SOON";

  return {
    ...d,
    baseLabel: base.label,
    hotel: base.hotel,
    hotelAddress: base.address,
    arrive,
    leave,
    passStopArrive,
    passStopDepart,
    status,
  };
}

function getNextDrive(current, next) {
  if (!next) return null;
  const miles = next.mile - current.mile;
  const drive = Math.max(5, Math.round(miles * 2));
  return { miles: miles.toFixed(1), drive };
}

function mapsLink(station, hotelAddress) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    hotelAddress || ""
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

function getProjectedSchedule(records) {
  let lastActualIndex = -1;

  records.forEach((r, i) => {
    if (r.in || r.out) lastActualIndex = i;
  });

  if (lastActualIndex < 0) {
    return stations.map((s) => ({
      projectedIn: s.in,
      projectedOut: s.out,
      deltaMs: 0,
    }));
  }

  const lastStation = stations[lastActualIndex];
  const lastRecord = records[lastActualIndex];
  const lastActualTime = new Date(lastRecord.out || lastRecord.in);

  const remainingStations = stations.slice(lastActualIndex + 1);

  const totalRemainingWeightedMiles = remainingStations.reduce((sum, station, idx) => {
    const prev = idx === 0 ? lastStation : remainingStations[idx - 1];
    const segmentMiles = station.mile - prev.mile;
    return sum + segmentMiles * (station.weightFromPrevious || 1);
  }, 0);

  const plannedFinish = new Date(stations[stations.length - 1].in);
  const remainingPlanMs = plannedFinish - new Date(lastRecord.out ? lastStation.out : lastStation.in);

  let cursor = new Date(lastActualTime);

  return stations.map((s, i) => {
    if (i <= lastActualIndex) {
      return {
        projectedIn: records[i].in || s.in,
        projectedOut: records[i].out || s.out,
        deltaMs: records[i].in ? new Date(records[i].in) - new Date(s.in) : 0,
      };
    }

    const prevStation = stations[i - 1];
    const segmentMiles = s.mile - prevStation.mile;
    const weightedMiles = segmentMiles * (s.weightFromPrevious || 1);

    const segmentMs =
      totalRemainingWeightedMiles > 0
        ? (weightedMiles / totalRemainingWeightedMiles) * remainingPlanMs
        : 0;

    const projectedInDate = roundToFiveMinutes(new Date(cursor.getTime() + segmentMs));
    const rest = plannedRestMs(s);
    const projectedOutDate = rest
      ? roundToFiveMinutes(new Date(projectedInDate.getTime() + rest))
      : null;

    cursor = projectedOutDate || projectedInDate;

    return {
      projectedIn: localDateString(projectedInDate),
      projectedOut: projectedOutDate ? localDateString(projectedOutDate) : "",
      deltaMs: projectedInDate - new Date(s.in),
    };
  });
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
      if (decoded?.length) setRecords(mergeRecordsWithPlan(decoded));
      return;
    }

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.records) setRecords(mergeRecordsWithPlan(saved.records));
      if (saved?.tab) setTab(saved.tab);
    } catch {}
  }, [sharedData]);

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
  const currentRest = restStatus(current, records[currentIndex]);
  const projectedSchedule = useMemo(() => getProjectedSchedule(records), [records]);
  const currentProjected = projectedSchedule[currentIndex];

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
    },
    wrap: { maxWidth: 430, margin: "0 auto", display: "grid", gap: 12 },
    card: {
      background: "#fff7ed",
      borderRadius: 22,
      padding: 14,
      border: "1px solid #e5d3b3",
    },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
    button: { minHeight: 48, borderRadius: 16, border: "none", fontWeight: 800 },
    input: {
      width: "100%",
      height: 42,
      borderRadius: 14,
      border: "1px solid #e5d3b3",
      padding: "0 10px",
    },
    small: { fontSize: 13, color: "#8F7D63" },
    projectionBox: {
      marginTop: 10,
      background: "#fff",
      padding: 10,
      borderRadius: 12,
      border: "1px solid #e5d3b3",
    },
    badgeRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.card}>
          <h2>{current.name}</h2>
          <div style={styles.small}>Mile {current.mile}</div>

          <div>
            {formatPlannedLine(current)}
            <br />
            Planned Rest: {durationShort(plannedRestMs(current))}
          </div>

          <div style={styles.badgeRow}>
            <div style={accessStyle(current.name)}>
              {accessLabel(current.name)}
            </div>

            {showRestBadge(current) && (
              <div style={restBadgeStyle(currentRest)}>
                {currentRest.label}
              </div>
            )}

            <div style={pacerPillStyle()}>
              PACER: {current.pacer}
            </div>

            <div style={shoesPillStyle(current.shoes)}>
              SHOES: {current.shoes}
            </div>
          </div>

          <div style={styles.projectionBox}>
            Projected In: {fmt(currentProjected?.projectedIn)}
            <br />
            Projected Out: {fmt(currentProjected?.projectedOut)}
          </div>

          <div style={styles.grid2}>
            <button onClick={() => stamp(currentIndex, "in")}>IN</button>
            <button onClick={() => stamp(currentIndex, "out")}>OUT</button>
          </div>

          <input
            style={styles.input}
            value={records[currentIndex]?.note}
            onChange={(e) => updateNote(currentIndex, e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
