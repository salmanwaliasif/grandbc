/* ------------------------------------------------------------------
   Grand Business Center — content & pricing config
   Edit this one file to change spaces, prices and contact details.
   Office plan prices come from grand-bc.com/pricing. Meeting room,
   desk, virtual office and add-on prices are INDICATIVE placeholders
   for the prototype — confirm with GBC before going live.
------------------------------------------------------------------- */
window.GBC = {
  company: {
    name: "Grand Business Center",
    legal: "Grand Business Center LLC",
    nameAr: "مركز الكبير للأعمال",
    tagline: "Workplace for today; flexibility for tomorrow",
    cr: "1382948",
    whatsapp: "96891580111",
    phones: ["+968 9158 0111", "+968 9499 0212", "+968 2231 2501"],
    landline: "+968 2231 2555",
    email: "info@grand-bc.com",
    address: "Building 4, 5th Floor, Tilal Offices, Muscat Grand Mall, Al Khuwair",
    postal: "P.O. Box 7, Postal Code 136, Al Khuwair, Sultanate of Oman",
    mapsQuery: "Muscat Grand Mall, Tilal Offices, Al Khuwair, Muscat",
    vat: 0.05,
    openHour: 8,
    closeHour: 21
  },

  // type: office | meeting | desk | virtual
  spaces: [
    {
      id: "office-starter", type: "office", name: "Starter office", capacity: "1–2 people", seats: 2,
      price: 300, unit: "month", img: "desk-single", photos: ["desk-single", "office-private-white", "glass-corridor"],
      blurb: "A compact glass-fronted office for a founder or a two-person team.",
      features: ["Ergonomic desk & chair setup", "Lockable glass door, frosted film", "2 meeting rooms bookable in advance", "300 B/W prints a month"]
    },
    {
      id: "office-standard", type: "office", name: "Standard office", capacity: "2–3 people", seats: 3,
      price: 350, unit: "month", img: "office-private-white", photos: ["office-private-white", "office-private-glass", "glass-suite"],
      blurb: "Room for a small team, with storage and space for a visitor chair.",
      features: ["Desks, storage and visitor seating", "Cisco-managed network & desk phone", "Pantry with tea & coffee", "Water, electricity & housekeeping"]
    },
    {
      id: "office-professional", type: "office", name: "Professional office", capacity: "3–4 people", seats: 4, popular: true,
      price: 450, unit: "month", img: "office-executive", photos: ["office-executive", "office-corner-window", "office-private-glass"],
      blurb: "A larger private office with natural light and room to receive clients.",
      features: ["Executive desk + team desks", "Window offices available", "Unlimited tea & coffee", "Office customisation on request"]
    },
    {
      id: "office-business", type: "office", name: "Business suite", capacity: "4–6 people", seats: 6,
      price: 500, unit: "month", img: "office-manager-lounge", photos: ["office-manager-lounge", "office-corner-window", "glass-suite"],
      blurb: "An executive suite with a lounge corner for meetings without leaving your office.",
      features: ["Manager desk with lounge seating", "Room for a team of up to 6", "Priority meeting room booking", "Branded entrance signage"]
    },
    {
      id: "room-huddle", type: "meeting", name: "Huddle room", capacity: "Up to 4", seats: 4,
      price: 6, unit: "hour", img: "huddle-room", photos: ["huddle-room", "meeting-glass-a", "meeting-glass-b"],
      blurb: "A quiet glass room with a screen for calls, interviews and quick reviews.",
      features: ["Wall-mounted screen with HDMI", "Whiteboard", "Tea, coffee & water", "High-speed Wi-Fi"]
    },
    {
      id: "room-meeting", type: "meeting", name: "Meeting room", capacity: "Up to 8", seats: 8, popular: true,
      price: 10, unit: "hour", img: "meeting-room-8", photos: ["meeting-room-8", "meeting-room-screen", "meeting-glass-b"],
      blurb: "Seats eight around one table — sized for client meetings and team workshops.",
      features: ["Large display for presentations", "Conference phone", "Tea, coffee & water", "Reception greets your guests"]
    },
    {
      id: "room-board", type: "meeting", name: "Boardroom", capacity: "Up to 12", seats: 12,
      price: 15, unit: "hour", img: "boardroom-led", photos: ["boardroom-led", "boardroom-table", "meeting-room-screen"],
      blurb: "Our largest room, with a twelve-seat table for board meetings, signings and trainings.",
      features: ["12-seat boardroom table", "Presentation screen", "Catering on request", "Ideal for signings & trainings"]
    },
    {
      id: "desk-day", type: "desk", name: "Day pass", capacity: "1 person", seats: 1,
      price: 8, unit: "day", img: "glass-corridor", photos: ["glass-corridor", "desk-single", "view-courtyard"],
      blurb: "Drop in for a day of focused work with Wi-Fi, coffee and reception support.",
      features: ["Any free desk, 8am–9pm", "Wi-Fi, tea & coffee", "Parking in the mall", "First day free for new members"]
    },
    {
      id: "desk-hot", type: "desk", name: "Hot desk", capacity: "1 person", seats: 1,
      price: 75, unit: "month", img: "desk-single", photos: ["desk-single", "glass-corridor", "courtyard"],
      blurb: "Unlimited access to shared desks, Monday to Saturday.",
      features: ["Any free desk, every day", "4 meeting-room hours a month", "Mail collection", "Member events"]
    },
    {
      id: "desk-dedicated", type: "desk", name: "Dedicated desk", capacity: "1 person", seats: 1,
      price: 110, unit: "month", img: "office-private-white", photos: ["office-private-white", "desk-phone", "glass-corridor"],
      blurb: "Your own desk with a lockable pedestal — leave your things and come back to them.",
      features: ["Your own fixed desk & storage", "24/7 access", "6 meeting-room hours a month", "Business address use"]
    },
    {
      id: "virtual-address", type: "virtual", name: "Virtual office", capacity: "Business address", seats: 0,
      price: 35, unit: "month", billing: "annual", img: "reception-map-wall", photos: ["reception-map-wall", "lobby-tenant-wall", "floor-sign"],
      blurb: "A Muscat Grand Mall business address for your company documents and mail.",
      features: ["Prestigious Al Khuwair address", "Mail & courier handling", "Name on the tenant board", "2 meeting-room hours a month"]
    },
    {
      id: "virtual-plus", type: "virtual", name: "Virtual office plus", capacity: "Address + phone", seats: 0,
      price: 60, unit: "month", billing: "annual", img: "lobby-tenant-wall", photos: ["lobby-tenant-wall", "desk-phone", "reception-map-wall"],
      blurb: "Everything in Virtual office, plus a local number answered by our receptionist.",
      features: ["Dedicated local phone number", "Call answering in your company name", "Mail scanning", "6 meeting-room hours a month"]
    }
  ],

  // Add-ons offered during booking, keyed by space type
  addons: {
    meeting: [
      { id: "coffee", name: "Coffee & refreshments", note: "Per guest, served at start", price: 1.5, per: "guest" },
      { id: "lunch", name: "Working lunch", note: "Per guest, from partner caterer", price: 4, per: "guest" },
      { id: "print", name: "Printing pack", note: "Up to 50 colour pages", price: 5, per: "booking" },
      { id: "parking", name: "Reserved visitor parking", note: "Basement bay near Building 4 lifts", price: 2, per: "booking" }
    ],
    office: [
      { id: "parking", name: "Reserved parking bay", note: "Basement bay, monthly", price: 25, per: "month" },
      { id: "phone", name: "Extra Cisco phone line", note: "Ooredoo usage billed separately", price: 10, per: "month" },
      { id: "signage", name: "Branded door signage", note: "One-time", price: 30, per: "once" },
      { id: "setup", name: "Company formation support", note: "We'll contact you with a quote", price: 0, per: "quote" }
    ],
    desk: [
      { id: "locker", name: "Personal locker", note: "Monthly", price: 8, per: "month" },
      { id: "parking", name: "Reserved parking bay", note: "Monthly", price: 25, per: "month" }
    ],
    virtual: [
      { id: "setup", name: "Company formation support", note: "We'll contact you with a quote", price: 0, per: "quote" },
      { id: "scan", name: "Mail scanning", note: "Scanned and emailed same day", price: 5, per: "month" }
    ]
  },

  setupServices: [
    { id: "formation", name: "Company formation", icon: "building-2" },
    { id: "licensing", name: "Business licensing", icon: "file-badge" },
    { id: "compliance", name: "Local compliance", icon: "shield-check" },
    { id: "visa", name: "Investor visa process", icon: "id-card" },
    { id: "bank", name: "Corporate bank account", icon: "landmark" },
    { id: "office", name: "Furnished office", icon: "armchair" },
    { id: "vehicle", name: "Rental vehicle coordination", icon: "car" },
    { id: "housing", name: "Residential leasing support", icon: "home" }
  ],

  amenities: [
    ["clock", "24/7 access", "Biometric entry at the main door"],
    ["wifi", "High-speed Wi-Fi", "Managed Cisco network"],
    ["armchair", "Furnished desks", "Ergonomic chairs throughout"],
    ["presentation", "Meeting rooms", "Huddle room to boardroom"],
    ["concierge-bell", "Reception", "Full-time receptionist"],
    ["car", "Parking", "Covered basement parking"],
    ["coffee", "Pantry", "Tea, coffee & soft drinks"],
    ["printer", "Printing", "300 B/W pages a month"],
    ["battery-charging", "Power backup", "UPS & inverter"],
    ["sparkles", "Housekeeping", "Daily cleaning"],
    ["cctv", "Security", "IP CCTV & 24/7 guards"],
    ["droplets", "Purified water", "Zero-sodium drinking water"],
    ["archive", "Storage", "Secure storage on request"],
    ["phone", "Desk phones", "Cisco IP phone per office"],
    ["bus", "Public transport", "Bus routes on Sultan Qaboos St"],
    ["shopping-bag", "Mall on your doorstep", "Carrefour, food court, gym"]
  ]
};
