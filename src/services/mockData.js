export const DOMAINS = [
  { name: 'All', id: 'all' },
  { name: 'Evacuation', id: 'evacuation' },
  { name: 'Infrastructure', id: 'infrastructure' },
  { name: 'Relief', id: 'relief' },
  { name: 'Medical', id: 'medical' }
];

export const INITIAL_INCIDENTS = [
  {
    id: "DS-4412",
    time: "Just now",
    domain: "Evacuation",
    source: "SMS Text (Translated from ES)",
    rawInput: "Water is up to the second floor. 4 adults, 2 kids trapped. Address: 402 River Street. Phone battery at 4%.",
    intent: "Critical Swift-Water Rescue - Multiple Trapped",
    confidence: 98,
    action: "Deploy Zodiak Boat Unit 04. Escalate priority due to failing comms.",
    status: "pending_verification",
    lat: 34.0522, lng: -118.2437
  },
  {
    id: "DS-4411",
    time: "2 min ago",
    domain: "Infrastructure",
    source: "Citizen App (Image Attached)",
    rawInput: "[IMAGE: collapsed_bridge_route7.jpg] The main bridge into town just washed out! Nobody can cross.",
    intent: "Complete Route Severance - Key Supply Line Cut",
    confidence: 96,
    action: "Update routing matrix: Mark Route 7 impassable. Reroute convoy Alpha.",
    status: "pending_verification",
    lat: 34.055, lng: -118.25
  },
  {
    id: "DS-4410",
    time: "Auto-Feed",
    domain: "Relief",
    source: "Automated IoT Sensor",
    rawInput: "[DEPOT_02] Generator fuel at critical levels (12%). Power failure imminent in 2 hours.",
    intent: "Critical Supply Protocol - Fuel Replenishment",
    confidence: 99,
    action: "Reroute fuel truck TX-88 to Relief Depot 02 immediately.",
    status: "approved",
    lat: 34.04, lng: -118.23
  }
];

export const AUTOMATED_FEEDS = [
  { source: "NOAA", message: "Category 4 Hurricane Warning updated. Eye path shifted 2 degrees East." },
  { source: "USGS", message: "Minor seismic aftershock (3.2) detected near Sector B dam." },
  { source: "DOT", message: "Highway 9 underpass flooding warning triggered." }
];
