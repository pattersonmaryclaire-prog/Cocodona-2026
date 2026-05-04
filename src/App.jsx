import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cocodona-crew-v19-safe-manual-inputs";

const RACE_START = "2026-05-04T05:00:00";
const GOAL_FINISH = "2026-05-08T02:00:00";

const stationPlan = [
  { name: "Cottonwood Creek", mile: 7.4, restMinutes: 5, weightFromPrevious: 1.05, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },
  { name: "Lane Mountain", mile: 32.5, restMinutes: 30, weightFromPrevious: 1.25, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },
  { name: "Crown King", mile: 36.6, restMinutes: 60, weightFromPrevious: 1.75, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },
  { name: "Arrastra Creek", mile: 51.0, restMinutes: 60, weightFromPrevious: 1.05, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },
  { name: "Kamp Kipa", mile: 60.8, restMinutes: 60, weightFromPrevious: 1.1, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },
  { name: "Camp W", mile: 67.4, restMinutes: 10, weightFromPrevious: 0.95, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },

  { name: "Whiskey Row", mile: 75.6, restMinutes: 120, weightFromPrevious: 0.9, pacer: "Lin", shoes: "ROAD SHOES" },
  { name: "Watson Lake", mile: 82.8, restMinutes: 10, weightFromPrevious: 0.9, pacer: "Lin", shoes: "NO SHOE CHANGE" },
  { name: "Fain Ranch", mile: 96.5, restMinutes: 60, weightFromPrevious: 0.95, pacer: "Ben", shoes: "NO SHOE CHANGE" },
  { name: "Mingus Mountain", mile: 107.2, restMinutes: 60, weightFromPrevious: 1.35, pacer: "Ben", shoes: "NO SHOE CHANGE" },
  { name: "Jerome", mile: 124.2, restMinutes: 120, weightFromPrevious: 1.15, pacer: "Lin", shoes: "ROAD SHOES" },
  { name: "Dead Horse", mile: 132.9, restMinutes: 15, weightFromPrevious: 1.0, pacer: "Ben", shoes: "TRAIL SHOES" },
  { name: "Deer Pass", mile: 146.9, restMinutes: 60, weightFromPrevious: 1.15, pacer: "Ben", shoes: "NO SHOE CHANGE" },
  { name: "Sedona Posse Grounds", mile: 159.1, restMinutes: 120, weightFromPrevious: 1.3, pacer: "Joe", shoes: "NO SHOE CHANGE" },
  { name: "Schnebly Hill", mile: 176.1, restMinutes: 60, weightFromPrevious: 1.4, pacer: "NO PACER SECTION", shoes: "ROAD SHOES" },
  { name: "Munds Park", mile: 190.0, restMinutes: 60, weightFromPrevious: 1.05, pacer: "Ben", shoes: "ROAD SHOES" },
  { name: "Kelly Canyon", mile: 202.7, restMinutes: 10, weightFromPrevious: 1.0, pacer: "Ben", shoes: "NO SHOE CHANGE" },
  { name: "Fort Tuthill", mile: 211.0, restMinutes: 120, weightFromPrevious: 1.05, pacer: "Lin", shoes: "ROAD SHOES" },
  { name: "Walnut Canyon", mile: 227.1, restMinutes: 60, weightFromPrevious: 1.2, pacer: "Joe C", shoes: "NO SHOE CHANGE" },
  { name: "Wildcat Hill", mile: 234.1, restMinutes: 30, weightFromPrevious: 1.15, pacer: "NO PACER SECTION", shoes: "ROAD SHOES" },
  { name: "Trinity Heights", mile: 249.4, restMinutes: 5, weightFromPrevious: 1.1, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },
  { name: "Finish", mile: 253.3, restMinutes: 0, weightFromPrevious: 1.0, pacer: "NO PACER SECTION", shoes: "NO SHOE CHANGE" },
];

function pacerStyle(pacer) {
  if (!pacer || pacer === "NO PACER SECTION") return { background: "#e5e7eb", color: "#374151" };
  if (pacer.includes("Ben")) return { background: "#dcfce7", color: "#166534" };
  if (pacer.includes("Lin")) return { background: "#dbeafe", color: "#1e3a8a" };
  if (pacer.includes("Joe")) return { background: "#fee2e2", color: "#991b1b" };
  return { background: "#ede9fe", color: "#5b21b6" };
}

function roundToFiveMinutes(date) {
  const rounded = new Date(date);
  if (Number.isNaN(rounded.getTime())) return new Date();
  const mins = rounded.getMinutes();
  const roundedMins = Math.round(mins / 5) * 5;
  rounded.setMinutes(roundedMins, 0, 0);
  return rounded;
}

function localDateString(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:00`;
}

function isValidDateValue(val) {
  if (!val) return false;
  const d = new Date(val);
  return !Number.isNaN(d.getTime());
}

function toDateTimeInputValue(val) {
  if (!val) return "";

  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val)) {
    return val.slice(0, 16);
  }

  const date = new Date(val);
  if (Number.isNaN(date.getTime())) return "";

  return localDateString(date).slice(0, 16);
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

  const totalWeightedMiles = weightedSegments.reduce((sum, station) => sum + station.weightedMiles, 0);

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
  anthem: { label: "Start Base", hotel: "Hampton Inn Anthem", address: "42415 N 41st Dr, Anthem, AZ 85086" },
  prescott: { label: "Prescott Base", hotel: "Hotel St. Michael", address: "205 W Gurley St, Prescott, AZ" },
  jerome: { label: "Jerome Base", hotel: "The Grand Hotel", address: "200 Hill St, Jerome, AZ" },
  sedona: { label: "Sedona Base", hotel: "The Sky Rock Sedona", address: "1200 AZ-89A, Sedona, AZ" },
  flagstaff: { label: "Flagstaff Base", hotel: "Little America Hotel", address: "2515 E Butler Ave, Flagstaff, AZ" },
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

function normalizeSavedRecords(savedRecords) {
  const fresh = buildEmptyRecords();
  if (!Array.isArray(savedRecords)) return fresh;

  return fresh.map((empty, index) => ({
    ...empty,
    in: isValidDateValue(savedRecords[index]?.in) ? savedRecords[index].in : "",
    out: isValidDateValue(savedRecords[index]?.out) ? savedRecords[index].out : "",
    note: savedRecords[index]?.note || "",
    open: Boolean(savedRecords[index]?.open),
  }));
}

function time(val) {
  if (!isValidDateValue(val)) return "—";
  return new Date(val).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function fmt(val) {
  if (!isValidDateValue(val)) return "—";
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
  if (!isValidDateValue(station?.in) || !isValidDateValue(station?.out)) return null;
  const ms = new Date(station.out) - new Date(station.in);
  return ms > 0 ? ms : null;
}

function showRestBadge(station) {
  const ms = plannedRestMs(station);
  return ms && ms > 30 * 60000;
}

function actualStopMs(record) {
  if (!isValidDateValue(record?.in) || !isValidDateValue(record?.out)) return null;
  const ms = new Date(record.out) - new Date(record.in);
  return ms > 0 ? ms : null;
}

function restStatus(station, record) {
  const planned = plannedRestMs(station);
  const actual = actualStopMs(record);

  if (!planned) return { label: "No planned rest", bg: "#E9E2D8", color: "#6B5B4D", delta: null, actual };
  if (!actual) return { label: "Planned rest", bg: "#ede9fe", color: "#5b21b6", delta: null, actual };

  const delta = actual - planned;

  if (delta <= 0) return { label: "On / under rest", bg: "#dcfce7", color: "#166534", delta, actual };
  if (delta <= 15 * 60000) return { label: "Slight over rest", bg: "#ffd60a", color: "#3B2432", delta, actual };
  return { label: "⚠ BLEEDING TIME", bg: "#ef4444", color: "#fff", delta, actual };
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

function pillStyle(styleObj) {
  return {
    display: "inline-block",
    marginTop: 8,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    ...styleObj,
  };
}

function shoesStyle(shoes) {
  return shoes === "NO SHOE CHANGE"
    ? { background: "#E9E2D8", color: "#3B2432" }
    : { background: "#bfdbfe", color: "#3B2432" };
}

function isPacerPickup(index) {
  if (index === 0) return false;
  return stations[index].pacer !== stations[index - 1].pacer;
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
  let lastActualField = "in";

  records.forEach((r, i) => {
    if (isValidDateValue(r.out)) {
      lastActualIndex = i;
      lastActualField = "out";
    } else if (isValidDateValue(r.in)) {
      lastActualIndex = i;
      lastActualField = "in";
    }
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

  const actualAnchorValue =
    lastActualField === "out" ? lastRecord.out : lastRecord.in;

  const plannedAnchorValue =
    lastActualField === "out" ? lastStation.out : lastStation.in;

  if (!isValidDateValue(actualAnchorValue) || !isValidDateValue(plannedAnchorValue)) {
    return stations.map((s) => ({
      projectedIn: s.in,
      projectedOut: s.out,
      deltaMs: 0,
    }));
  }

  const deltaMs = new Date(actualAnchorValue) - new Date(plannedAnchorValue);

  return stations.map((s, i) => {
    if (i <= lastActualIndex) {
      return {
        projectedIn: isValidDateValue(records[i]?.in) ? records[i].in : s.in,
        projectedOut: isValidDateValue(records[i]?.out) ? records[i].out : s.out,
        deltaMs: isValidDateValue(records[i]?.in)
          ? new Date(records[i].in) - new Date(s.in)
          : deltaMs,
      };
    }

    const projectedInDate = isValidDateValue(s.in)
      ? new Date(new Date(s.in).getTime() + deltaMs)
      : null;

    const projectedOutDate = isValidDateValue(s.out)
      ? new Date(new Date(s.out).getTime() + deltaMs)
      : null;

    return {
      projectedIn: projectedInDate ? localDateString(projectedInDate) : "",
      projectedOut: projectedOutDate ? localDateString(projectedOutDate) : "",
      deltaMs,
    };
  });
}

  const lastStation = stations[lastActualIndex];
  const lastRecord = records[lastActualIndex];

  const actualAnchorValue =
    lastActualField === "out" ? lastRecord.out : lastRecord.in;

  const plannedAnchorValue =
    lastActualField === "out" ? lastStation.out : lastStation.in;

  if (!isValidDateValue(actualAnchorValue) || !isValidDateValue(plannedAnchorValue)) {
    return stations.map((s) => ({
      projectedIn: s.in,
      projectedOut: s.out,
      deltaMs: 0,
    }));
  }

  const deltaMs = new Date(actualAnchorValue) - new Date(plannedAnchorValue);

  return stations.map((s, i) => {
    if (i <= lastActualIndex) {
      return {
        projectedIn: isValidDateValue(records[i]?.in) ? records[i].in : s.in,
        projectedOut: isValidDateValue(records[i]?.out) ? records[i].out : s.out,
        deltaMs: isValidDateValue(records[i]?.in)
          ? new Date(records[i].in) - new Date(s.in)
          : deltaMs,
      };
    }

    const projectedInDate = isValidDateValue(s.in)
      ? new Date(new Date(s.in).getTime() + deltaMs)
      : null;

    const projectedOutDate = isValidDateValue(s.out)
      ? new Date(new Date(s.out).getTime() + deltaMs)
      : null;

    return {
      projectedIn: projectedInDate ? localDateString(projectedInDate) : "",
      projectedOut: projectedOutDate ? localDateString(projectedOutDate) : "",
      deltaMs,
    };
  });
}
  

  const lastStation = stations[lastActualIndex];
  const lastRecord = records[lastActualIndex];
  const lastActualValue = isValidDateValue(lastRecord.out) ? lastRecord.out : lastRecord.in;
  const lastActualTime = new Date(lastActualValue);

  if (Number.isNaN(lastActualTime.getTime())) {
    return stations.map((s) => ({
      projectedIn: s.in,
      projectedOut: s.out,
      deltaMs: 0,
    }));
  }

  const remainingStations = stations.slice(lastActualIndex + 1);

  const totalRemainingWeightedMiles = remainingStations.reduce((sum, station, idx) => {
    const prev = idx === 0 ? lastStation : remainingStations[idx - 1];
    const segmentMiles = station.mile - prev.mile;
    return sum + segmentMiles * (station.weightFromPrevious || 1);
  }, 0);

  const plannedFinish = new Date(stations[stations.length - 1].in);
  const plannedAnchorTime = new Date(
    isValidDateValue(lastRecord.out) ? lastStation.out : lastStation.in
  );
  const plannedRemainingMs = plannedFinish - plannedAnchorTime;
  const actualDeltaMs = lastActualTime - plannedAnchorTime;
  const remainingPlanMs = Math.max(0, plannedRemainingMs - actualDeltaMs);

  let cursor = new Date(lastActualTime);

  return stations.map((s, i) => {
    if (i <= lastActualIndex) {
      return {
        projectedIn: isValidDateValue(records[i]?.in) ? records[i].in : s.in,
        projectedOut: isValidDateValue(records[i]?.out) ? records[i].out : s.out,
        deltaMs: isValidDateValue(records[i]?.in)
          ? new Date(records[i].in) - new Date(s.in)
          : 0,
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
      if (decoded?.length) setRecords(normalizeSavedRecords(decoded));
      return;
    }

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.records) setRecords(normalizeSavedRecords(saved.records));
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

  const prediction = useMemo(() => {
    const start = new Date(RACE_START);
    const finish = stations[stations.length - 1];

    let lastActualIndex = -1;
    records.forEach((r, i) => {
      if (isValidDateValue(r.in) || isValidDateValue(r.out)) lastActualIndex = i;
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
    const lastRecord = records[lastActualIndex];
    const lastActualValue = isValidDateValue(lastRecord.out) ? lastRecord.out : lastRecord.in;
    const lastTime = new Date(lastActualValue);

    if (Number.isNaN(lastTime.getTime())) {
      return {
        basedOn: "No valid actuals yet",
        projectedFinish: "",
        projectedHours: null,
        deltaVsPlan: null,
        projectedNext: "",
        paceMinPerMile: null,
      };
    }

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

  function updateRecordField(i, field, value) {
    if (readOnly) return;
    setRecords((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value || "" } : r)));
  }

  function stamp(i, field) {
    if (readOnly) return;
    updateRecordField(i, field, localDateString(new Date()));
  }

  function updateNote(i, note) {
    if (readOnly) return;
    updateRecordField(i, "note", note);
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
      minWidth: 0,
      height: 42,
      borderRadius: 14,
      border: "1px solid #e5d3b3",
      padding: "0 10px",
      boxSizing: "border-box",
      background: "#fffdf9",
      fontSize: 12,
    },
    small: {
      fontSize: 13,
      color: "#8F7D63",
    },
    projectionBox: {
      marginTop: 10,
      background: "#fff",
      padding: 10,
      borderRadius: 12,
      border: "1px solid #e5d3b3",
      fontSize: 13,
    },
    badgeRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10,
      alignItems: "center",
    },
    pickup: {
      marginTop: 8,
      padding: "8px 12px",
      borderRadius: 12,
      background: "#6366f1",
      color: "#fff",
      fontWeight: 900,
      fontSize: 12,
      textAlign: "center",
    },
    fieldBox: {
      background: "#fffdf9",
      border: "1px solid #e5d3b3",
      borderRadius: 14,
      padding: 10,
      boxSizing: "border-box",
    },
    label: {
      display: "block",
      fontSize: 12,
      fontWeight: 800,
      marginBottom: 6,
      color: "#8F7D63",
    },
  };

  const ManualInOutFields = ({ index }) => (
    <div style={{ ...styles.grid2, marginTop: 12 }}>
      <div style={styles.fieldBox}>
        <label style={styles.label}>Manual Actual In</label>
        <input
          disabled={readOnly}
          type="datetime-local"
          style={styles.input}
          value={toDateTimeInputValue(records[index]?.in)}
          onChange={(e) => updateRecordField(index, "in", e.target.value)}
        />
      </div>
      <div style={styles.fieldBox}>
        <label style={styles.label}>Manual Actual Out</label>
        <input
          disabled={readOnly}
          type="datetime-local"
          style={styles.input}
          value={toDateTimeInputValue(records[index]?.out)}
          onChange={(e) => updateRecordField(index, "out", e.target.value)}
        />
      </div>
    </div>
  );

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

          <div style={{ marginTop: 10 }}>
            <strong>Randi Planned</strong>
            <br />
            {formatPlannedLine(current)}
            <br />
            Planned Rest: {durationShort(plannedRestMs(current))}
          </div>

          <div style={styles.badgeRow}>
            <div style={{ ...accessStyle(current.name), marginTop: 0 }}>{accessLabel(current.name)}</div>

            {showRestBadge(current) && (
              <div style={{ ...restBadgeStyle(currentRest), marginTop: 0 }}>
                {currentRest.label}
                {currentRest.actual ? ` · Actual ${durationShort(currentRest.actual)}` : ""}
                {currentRest.delta ? ` · ${duration(currentRest.delta)} vs plan` : ""}
              </div>
            )}

            <div style={pillStyle({ ...pacerStyle(current.pacer), marginTop: 0 })}>
              PACER: {current.pacer || "NO PACER SECTION"}
            </div>

            <div style={pillStyle({ ...shoesStyle(current.shoes), marginTop: 0 })}>
              SHOES: {current.shoes || "NO SHOE CHANGE"}
            </div>
          </div>

          {isPacerPickup(currentIndex) && <div style={styles.pickup}>PACER PICKUP</div>}

          <div style={styles.projectionBox}>
            <strong>Live Projection</strong>
            <br />
            Projected In: {fmt(currentProjected?.projectedIn)}
            <br />
            Projected Out: {fmt(currentProjected?.projectedOut)}
            <br />
            Δ vs Plan: {duration(currentProjected?.deltaMs)}
          </div>

          <div style={{ ...styles.grid2, marginTop: 12 }}>
            <button disabled={readOnly} style={{ ...styles.button, background: "#ef476f", color: "#fff" }} onClick={() => stamp(currentIndex, "in")}>
              TAP IN
            </button>
            <button disabled={readOnly} style={{ ...styles.button, background: "#ffd60a", color: "#3B2432" }} onClick={() => stamp(currentIndex, "out")}>
              TAP OUT
            </button>
          </div>

          <ManualInOutFields index={currentIndex} />

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

            {crewAccessibleAid.has(current.name) && (
              <>
                <div>
                  <strong>Crew Base</strong>
                  <br />
                  {crew.baseLabel}
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
              </>
            )}
          </div>

          {crew.specialRoute && (
            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                background: "#fff",
                padding: 10,
                borderRadius: 12,
                border: "1px solid #ef476f",
              }}
            >
              <strong>Special Route</strong>
              <br />
              {crew.routeLabel}
              <br />
              Pass Stop: {crew.passStopName}
              <br />
              Pass Stop ETA: {crew.passStopArrive ? time(crew.passStopArrive) : "—"}
              <br />
              Depart Pass Stop: {crew.passStopDepart ? time(crew.passStopDepart) : "—"}
              <br />
              <span style={{ color: "#991b1b", fontWeight: 800 }}>{crew.instructions}</span>
            </div>
          )}

          {crewAccessibleAid.has(current.name) && <div style={statusStyle(crew.status)}>{crew.status}</div>}

          {crewAccessibleAid.has(current.name) && (
            <a
              href={mapsLink(current, crew.hotelAddress)}
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
              const r = restStatus(s, records[i]);
              const projected = projectedSchedule[i];

              return (
                <div key={s.name} style={{ borderTop: "1px solid #e5d3b3", padding: "12px 0" }}>
                  <strong>{s.name}</strong>
                  <div style={styles.small}>Mile {s.mile}</div>

                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    {formatPlannedLine(s)}
                    <br />
                    Planned Rest: {durationShort(plannedRestMs(s))}
                  </div>

                  <div style={styles.badgeRow}>
                    <div style={{ ...accessStyle(s.name), marginTop: 0 }}>{accessLabel(s.name)}</div>

                    {showRestBadge(s) && (
                      <div style={{ ...restBadgeStyle(r), marginTop: 0 }}>
                        {r.label}
                        {r.actual ? ` · Actual ${durationShort(r.actual)}` : ""}
                        {r.delta ? ` · ${duration(r.delta)} vs plan` : ""}
                      </div>
                    )}

                    <div style={pillStyle({ ...pacerStyle(s.pacer), marginTop: 0 })}>
                      PACER: {s.pacer || "NO PACER SECTION"}
                    </div>

                    <div style={pillStyle({ ...shoesStyle(s.shoes), marginTop: 0 })}>
                      SHOES: {s.shoes || "NO SHOE CHANGE"}
                    </div>
                  </div>

                  {isPacerPickup(i) && <div style={styles.pickup}>PACER PICKUP</div>}

                  <div style={styles.projectionBox}>
                    <strong>Live Projection</strong>
                    <br />
                    Projected In: {fmt(projected?.projectedIn)}
                    <br />
                    Projected Out: {fmt(projected?.projectedOut)}
                    <br />
                    Δ vs Plan: {duration(projected?.deltaMs)}
                  </div>

                  <ManualInOutFields index={i} />

                  <div style={{ fontSize: 13, marginTop: 8 }}>
                    {crewAccessibleAid.has(s.name) && (
                      <>
                        Crew Base: {c.baseLabel}
                        <br />
                        Hotel: {c.hotel}
                        <br />
                        Hotel drive: {c.drive} min / {c.distance} mi
                        <br />
                        Crew leave: {time(c.leave)} · arrive: {time(c.arrive)}
                        <br />
                        Status: {c.status}
                        <br />
                      </>
                    )}

                    {c.specialRoute && (
                      <>
                        Special Route: {c.routeLabel}
                        <br />
                        Pass Stop: {c.passStopName}
                        <br />
                        Pass Stop ETA: {c.passStopArrive ? time(c.passStopArrive) : "—"}
                        <br />
                        Depart Pass Stop: {c.passStopDepart ? time(c.passStopDepart) : "—"}
                        <br />
                        {c.instructions}
                        <br />
                      </>
                    )}

                    {!crewAccessibleAid.has(s.name) && (
                      <>
                        Status: NO CREW ACCESS
                        <br />
                      </>
                    )}

                    {nextStation && (
                      <>
                        To next: {nextStation.name} · {stationDrive.drive} min / {stationDrive.miles} mi
                      </>
                    )}
                  </div>

                  {crewAccessibleAid.has(s.name) && (
                    <a
                      href={mapsLink(s, c.hotelAddress)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "block", marginTop: 8, color: "#ef476f", fontWeight: 800 }}
                    >
                      Open route
                    </a>
                  )}

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
                      style={{
                        ...styles.button,
                        width: "100%",
                        marginTop: 8,
                        cursor: "pointer",
                        opacity: 1,
                      }}
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
            <strong>Based on:</strong>
            <br />
            {prediction.basedOn}
            <br />
            <br />
            <strong>Projected Finish:</strong>
            <br />
            {fmt(prediction.projectedFinish)}
            <br />
            <br />
            <strong>Projected Cumulative Hours:</strong>
            <br />
            {prediction.projectedHours ? `${prediction.projectedHours.toFixed(1)} hrs` : "—"}
            <br />
            <br />
            <strong>Trend vs Goal Finish:</strong>
            <br />
            {duration(prediction.deltaVsPlan)}
            <br />
            <br />
            <strong>Projected Next Station:</strong>
            <br />
            {prediction.nextTarget ? `${prediction.nextTarget.name}: ${fmt(prediction.projectedNext)}` : "—"}
            <br />
            <br />
            <strong>Average Actual Pace:</strong>
            <br />
            {prediction.paceMinPerMile
              ? `${prediction.paceMinPerMile.toFixed(1)} min / mile elapsed`
              : "—"}
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
