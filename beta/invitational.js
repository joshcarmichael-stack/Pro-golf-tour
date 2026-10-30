/*! Internet Invitational — beta mode (Sunday Pins)
 * Self-contained flow. Uses React/C/FONT/UI/Btn/BackTop/Shell/ShotWheel/QuickShotFeed/
 * WheelModePicker/chShot/chShotChoices/playHole/COURSES/calcOverall/clampN from the main app.
 */
(function (global) {
"use strict";
const useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;
const h = (...a) => React.createElement(...a);
const INV_LS = "sunday-pins-invitational-v1";
const INV_ACH_LS = "sunday-pins-inv-achievements";

const INV_ROSTER_RAW = [{"name":"Brad","shortName":"Brad","sourceTeam":"Dalke","handicapDisplay":"+6","overall":89,"rank":1,"attrs":{"drivingAccuracy":89,"drivingDistance":95,"longApproach":92,"shortApproach":88,"chipping":88,"putting":86,"recovery":90,"bunker":85,"paceControl":87,"shotShaping":91,"courseManagement":88,"composure":90}},{"name":"Ryan","shortName":"Ryan","sourceTeam":"Ruffels","handicapDisplay":"+6","overall":89,"rank":2,"attrs":{"drivingAccuracy":85,"drivingDistance":93,"longApproach":85,"shortApproach":90,"chipping":88,"putting":91,"recovery":88,"bunker":91,"paceControl":91,"shotShaping":88,"courseManagement":90,"composure":91}},{"name":"Wesley","shortName":"Wesley","sourceTeam":"Bryan","handicapDisplay":"+5","overall":87,"rank":3,"attrs":{"drivingAccuracy":94,"drivingDistance":84,"longApproach":84,"shortApproach":88,"chipping":85,"putting":90,"recovery":83,"bunker":87,"paceControl":84,"shotShaping":91,"courseManagement":89,"composure":89}},{"name":"Tooms","shortName":"Tooms","sourceTeam":"Dalke","handicapDisplay":"+4.5","overall":86,"rank":4,"attrs":{"drivingAccuracy":83,"drivingDistance":81,"longApproach":86,"shortApproach":89,"chipping":89,"putting":88,"recovery":86,"bunker":85,"paceControl":84,"shotShaping":88,"courseManagement":87,"composure":86}},{"name":"Micah","shortName":"Micah","sourceTeam":"Ruffels","handicapDisplay":"+4","overall":86,"rank":5,"attrs":{"drivingAccuracy":86,"drivingDistance":91,"longApproach":83,"shortApproach":87,"chipping":86,"putting":88,"recovery":84,"bunker":86,"paceControl":88,"shotShaping":82,"courseManagement":82,"composure":83}},{"name":"George","shortName":"George","sourceTeam":"Bryan","handicapDisplay":"+4","overall":85,"rank":6,"attrs":{"drivingAccuracy":82,"drivingDistance":85,"longApproach":88,"shortApproach":83,"chipping":86,"putting":86,"recovery":83,"bunker":88,"paceControl":90,"shotShaping":84,"courseManagement":84,"composure":85}},{"name":"Kwon","shortName":"Kwon","sourceTeam":"Finch","handicapDisplay":"+3","overall":85,"rank":7,"attrs":{"drivingAccuracy":90,"drivingDistance":86,"longApproach":85,"shortApproach":86,"chipping":87,"putting":82,"recovery":81,"bunker":83,"paceControl":85,"shotShaping":83,"courseManagement":85,"composure":83}},{"name":"Mac","shortName":"Mac","sourceTeam":"Bryan","handicapDisplay":"+3","overall":85,"rank":8,"attrs":{"drivingAccuracy":85,"drivingDistance":85,"longApproach":86,"shortApproach":84,"chipping":84,"putting":86,"recovery":85,"bunker":87,"paceControl":83,"shotShaping":85,"courseManagement":81,"composure":85}},{"name":"Evan","shortName":"Evan","sourceTeam":"Bryan","handicapDisplay":"+3.5","overall":84,"rank":9,"attrs":{"drivingAccuracy":82,"drivingDistance":84,"longApproach":87,"shortApproach":87,"chipping":81,"putting":80,"recovery":86,"bunker":86,"paceControl":86,"shotShaping":87,"courseManagement":87,"composure":87}},{"name":"Garrett","shortName":"Garrett","sourceTeam":"Dalke","handicapDisplay":"+3","overall":84,"rank":10,"attrs":{"drivingAccuracy":87,"drivingDistance":89,"longApproach":87,"shortApproach":81,"chipping":83,"putting":79,"recovery":82,"bunker":87,"paceControl":82,"shotShaping":84,"courseManagement":83,"composure":81}},{"name":"Taco","shortName":"Taco","sourceTeam":"Dalke","handicapDisplay":"+3","overall":84,"rank":11,"attrs":{"drivingAccuracy":82,"drivingDistance":83,"longApproach":83,"shortApproach":82,"chipping":85,"putting":87,"recovery":87,"bunker":82,"paceControl":85,"shotShaping":86,"courseManagement":84,"composure":86}},{"name":"Cole","shortName":"Cole","sourceTeam":"Bryan","handicapDisplay":"+2.5","overall":84,"rank":12,"attrs":{"drivingAccuracy":84,"drivingDistance":87,"longApproach":85,"shortApproach":86,"chipping":79,"putting":84,"recovery":85,"bunker":84,"paceControl":81,"shotShaping":85,"courseManagement":80,"composure":81}},{"name":"Paige","shortName":"Paige","sourceTeam":"Ruffels","handicapDisplay":"+2.4","overall":84,"rank":13,"attrs":{"drivingAccuracy":82,"drivingDistance":80,"longApproach":84,"shortApproach":86,"chipping":86,"putting":87,"recovery":84,"bunker":86,"paceControl":83,"shotShaping":84,"courseManagement":83,"composure":84}},{"name":"Peter","shortName":"Peter","sourceTeam":"Finch","handicapDisplay":"+3","overall":83,"rank":14,"attrs":{"drivingAccuracy":81,"drivingDistance":85,"longApproach":83,"shortApproach":83,"chipping":82,"putting":81,"recovery":83,"bunker":83,"paceControl":81,"shotShaping":85,"courseManagement":89,"composure":86}},{"name":"Sam","shortName":"Sam","sourceTeam":"Bryan","handicapDisplay":"+2.5","overall":83,"rank":15,"attrs":{"drivingAccuracy":89,"drivingDistance":85,"longApproach":83,"shortApproach":80,"chipping":86,"putting":80,"recovery":78,"bunker":85,"paceControl":84,"shotShaping":82,"courseManagement":89,"composure":81}},{"name":"Mason","shortName":"Mason","sourceTeam":"Dalke","handicapDisplay":"+2","overall":83,"rank":16,"attrs":{"drivingAccuracy":80,"drivingDistance":86,"longApproach":85,"shortApproach":80,"chipping":85,"putting":84,"recovery":78,"bunker":85,"paceControl":84,"shotShaping":85,"courseManagement":83,"composure":80}},{"name":"Grant","shortName":"Grant","sourceTeam":"Ruffels","handicapDisplay":"+1.9","overall":83,"rank":17,"attrs":{"drivingAccuracy":80,"drivingDistance":79,"longApproach":82,"shortApproach":85,"chipping":85,"putting":84,"recovery":82,"bunker":83,"paceControl":84,"shotShaping":85,"courseManagement":84,"composure":80}},{"name":"Josh (Finch)","shortName":"Josh (Finch)","sourceTeam":"Finch","handicapDisplay":"+1.5","overall":83,"rank":18,"attrs":{"drivingAccuracy":82,"drivingDistance":82,"longApproach":82,"shortApproach":84,"chipping":83,"putting":83,"recovery":85,"bunker":82,"paceControl":85,"shotShaping":82,"courseManagement":80,"composure":82}},{"name":"Roger","shortName":"Roger","sourceTeam":"Finch","handicapDisplay":"+2.5","overall":82,"rank":19,"attrs":{"drivingAccuracy":82,"drivingDistance":86,"longApproach":84,"shortApproach":80,"chipping":84,"putting":80,"recovery":86,"bunker":82,"paceControl":80,"shotShaping":84,"courseManagement":82,"composure":84}},{"name":"Marissa","shortName":"Marissa","sourceTeam":"Ruffels","handicapDisplay":"+2","overall":82,"rank":20,"attrs":{"drivingAccuracy":85,"drivingDistance":82,"longApproach":79,"shortApproach":85,"chipping":84,"putting":83,"recovery":81,"bunker":80,"paceControl":82,"shotShaping":79,"courseManagement":81,"composure":82}},{"name":"Rick","shortName":"Rick","sourceTeam":"Finch","handicapDisplay":"+1.5","overall":82,"rank":21,"attrs":{"drivingAccuracy":84,"drivingDistance":80,"longApproach":82,"shortApproach":79,"chipping":84,"putting":85,"recovery":84,"bunker":84,"paceControl":80,"shotShaping":81,"courseManagement":84,"composure":87}},{"name":"Malosi","shortName":"Malosi","sourceTeam":"Finch","handicapDisplay":"+0.7","overall":82,"rank":22,"attrs":{"drivingAccuracy":75,"drivingDistance":89,"longApproach":84,"shortApproach":84,"chipping":80,"putting":78,"recovery":85,"bunker":81,"paceControl":78,"shotShaping":82,"courseManagement":80,"composure":79}},{"name":"Hailey","shortName":"Hailey","sourceTeam":"Dalke","handicapDisplay":"+0.5","overall":81,"rank":23,"attrs":{"drivingAccuracy":81,"drivingDistance":76,"longApproach":83,"shortApproach":85,"chipping":82,"putting":84,"recovery":81,"bunker":83,"paceControl":77,"shotShaping":79,"courseManagement":78,"composure":80}},{"name":"Big John","shortName":"Big John","sourceTeam":"Ruffels","handicapDisplay":"0.0","overall":81,"rank":24,"attrs":{"drivingAccuracy":75,"drivingDistance":84,"longApproach":80,"shortApproach":82,"chipping":81,"putting":82,"recovery":78,"bunker":77,"paceControl":79,"shotShaping":79,"courseManagement":83,"composure":83}},{"name":"Perez","shortName":"Perez","sourceTeam":"Ruffels","handicapDisplay":"1","overall":79,"rank":25,"attrs":{"drivingAccuracy":80,"drivingDistance":77,"longApproach":79,"shortApproach":75,"chipping":83,"putting":81,"recovery":78,"bunker":79,"paceControl":80,"shotShaping":75,"courseManagement":78,"composure":79}},{"name":"Short Game","shortName":"Short Game","sourceTeam":"Finch","handicapDisplay":"1","overall":79,"rank":26,"attrs":{"drivingAccuracy":76,"drivingDistance":72,"longApproach":80,"shortApproach":81,"chipping":85,"putting":79,"recovery":79,"bunker":86,"paceControl":76,"shotShaping":78,"courseManagement":80,"composure":76}},{"name":"Seb","shortName":"Seb","sourceTeam":"Bryan","handicapDisplay":"2","overall":78,"rank":27,"attrs":{"drivingAccuracy":80,"drivingDistance":75,"longApproach":76,"shortApproach":79,"chipping":80,"putting":77,"recovery":75,"bunker":78,"paceControl":81,"shotShaping":77,"courseManagement":76,"composure":79}},{"name":"Sara","shortName":"Sara","sourceTeam":"Dalke","handicapDisplay":"1.5","overall":77,"rank":28,"attrs":{"drivingAccuracy":79,"drivingDistance":78,"longApproach":79,"shortApproach":77,"chipping":74,"putting":76,"recovery":79,"bunker":74,"paceControl":77,"shotShaping":74,"courseManagement":79,"composure":78}},{"name":"Manziel","shortName":"Manziel","sourceTeam":"Dalke","handicapDisplay":"1.7","overall":77,"rank":29,"attrs":{"drivingAccuracy":74,"drivingDistance":78,"longApproach":80,"shortApproach":75,"chipping":78,"putting":79,"recovery":76,"bunker":80,"paceControl":74,"shotShaping":77,"courseManagement":74,"composure":75}},{"name":"Martin","shortName":"Martin","sourceTeam":"Finch","handicapDisplay":"2","overall":76,"rank":30,"attrs":{"drivingAccuracy":78,"drivingDistance":74,"longApproach":75,"shortApproach":75,"chipping":77,"putting":76,"recovery":79,"bunker":77,"paceControl":75,"shotShaping":80,"courseManagement":80,"composure":78}},{"name":"Tisha","shortName":"Tisha","sourceTeam":"Bryan","handicapDisplay":"3","overall":76,"rank":31,"attrs":{"drivingAccuracy":74,"drivingDistance":78,"longApproach":78,"shortApproach":73,"chipping":81,"putting":75,"recovery":75,"bunker":78,"paceControl":76,"shotShaping":77,"courseManagement":78,"composure":77}},{"name":"Chaz","shortName":"Chaz","sourceTeam":"Bryan","handicapDisplay":"3.2","overall":75,"rank":32,"attrs":{"drivingAccuracy":78,"drivingDistance":78,"longApproach":74,"shortApproach":73,"chipping":72,"putting":73,"recovery":77,"bunker":77,"paceControl":75,"shotShaping":75,"courseManagement":75,"composure":73}},{"name":"Bubbie","shortName":"Bubbie","sourceTeam":"Ruffels","handicapDisplay":"4","overall":74,"rank":33,"attrs":{"drivingAccuracy":75,"drivingDistance":77,"longApproach":75,"shortApproach":72,"chipping":74,"putting":71,"recovery":78,"bunker":77,"paceControl":75,"shotShaping":72,"courseManagement":69,"composure":75}},{"name":"Tyler","shortName":"Tyler","sourceTeam":"Dalke","handicapDisplay":"4","overall":74,"rank":34,"attrs":{"drivingAccuracy":74,"drivingDistance":74,"longApproach":73,"shortApproach":77,"chipping":77,"putting":71,"recovery":73,"bunker":73,"paceControl":75,"shotShaping":71,"courseManagement":72,"composure":71}},{"name":"Dod King","shortName":"Dod King","sourceTeam":"Dalke","handicapDisplay":"4.5","overall":73,"rank":35,"attrs":{"drivingAccuracy":72,"drivingDistance":73,"longApproach":75,"shortApproach":73,"chipping":73,"putting":70,"recovery":76,"bunker":76,"paceControl":73,"shotShaping":78,"courseManagement":73,"composure":76}},{"name":"Bobby","shortName":"Bobby","sourceTeam":"Ruffels","handicapDisplay":"5","overall":73,"rank":36,"attrs":{"drivingAccuracy":69,"drivingDistance":70,"longApproach":72,"shortApproach":74,"chipping":77,"putting":75,"recovery":73,"bunker":71,"paceControl":71,"shotShaping":71,"courseManagement":70,"composure":75}},{"name":"Riggs","shortName":"Riggs","sourceTeam":"Ruffels","handicapDisplay":"5","overall":72,"rank":37,"attrs":{"drivingAccuracy":70,"drivingDistance":74,"longApproach":73,"shortApproach":70,"chipping":74,"putting":72,"recovery":70,"bunker":72,"paceControl":71,"shotShaping":72,"courseManagement":73,"composure":74}},{"name":"Jake","shortName":"Jake","sourceTeam":"Ruffels","handicapDisplay":"5","overall":71,"rank":38,"attrs":{"drivingAccuracy":70,"drivingDistance":73,"longApproach":69,"shortApproach":69,"chipping":73,"putting":71,"recovery":76,"bunker":75,"paceControl":75,"shotShaping":69,"courseManagement":71,"composure":71}},{"name":"Cassandra","shortName":"Cassandra","sourceTeam":"Finch","handicapDisplay":"6","overall":71,"rank":39,"attrs":{"drivingAccuracy":73,"drivingDistance":71,"longApproach":71,"shortApproach":72,"chipping":71,"putting":72,"recovery":71,"bunker":68,"paceControl":70,"shotShaping":72,"courseManagement":70,"composure":73}},{"name":"Yandle","shortName":"Yandle","sourceTeam":"Dalke","handicapDisplay":"6","overall":71,"rank":40,"attrs":{"drivingAccuracy":69,"drivingDistance":76,"longApproach":69,"shortApproach":70,"chipping":71,"putting":71,"recovery":69,"bunker":70,"paceControl":74,"shotShaping":68,"courseManagement":74,"composure":69}},{"name":"Frankie","shortName":"Frankie","sourceTeam":"Finch","handicapDisplay":"6","overall":70,"rank":41,"attrs":{"drivingAccuracy":71,"drivingDistance":70,"longApproach":69,"shortApproach":71,"chipping":73,"putting":69,"recovery":74,"bunker":71,"paceControl":73,"shotShaping":68,"courseManagement":68,"composure":68}},{"name":"Francis","shortName":"Francis","sourceTeam":"Finch","handicapDisplay":"7.5","overall":70,"rank":42,"attrs":{"drivingAccuracy":69,"drivingDistance":69,"longApproach":66,"shortApproach":72,"chipping":69,"putting":72,"recovery":73,"bunker":68,"paceControl":71,"shotShaping":72,"courseManagement":74,"composure":66}},{"name":"Gaethje","shortName":"Gaethje","sourceTeam":"Ruffels","handicapDisplay":"7.1","overall":69,"rank":43,"attrs":{"drivingAccuracy":67,"drivingDistance":76,"longApproach":68,"shortApproach":68,"chipping":69,"putting":67,"recovery":72,"bunker":67,"paceControl":67,"shotShaping":68,"courseManagement":70,"composure":76}},{"name":"Josh (Dalke)","shortName":"Josh (Dalke)","sourceTeam":"Dalke","handicapDisplay":"8","overall":69,"rank":44,"attrs":{"drivingAccuracy":70,"drivingDistance":69,"longApproach":68,"shortApproach":70,"chipping":70,"putting":67,"recovery":71,"bunker":70,"paceControl":68,"shotShaping":66,"courseManagement":69,"composure":68}},{"name":"Chedoy","shortName":"Chedoy","sourceTeam":"Bryan","handicapDisplay":"8","overall":68,"rank":45,"attrs":{"drivingAccuracy":68,"drivingDistance":65,"longApproach":66,"shortApproach":69,"chipping":66,"putting":70,"recovery":72,"bunker":67,"paceControl":68,"shotShaping":68,"courseManagement":70,"composure":66}},{"name":"Claire","shortName":"Claire","sourceTeam":"Bryan","handicapDisplay":"8","overall":68,"rank":46,"attrs":{"drivingAccuracy":66,"drivingDistance":71,"longApproach":66,"shortApproach":71,"chipping":69,"putting":68,"recovery":66,"bunker":69,"paceControl":66,"shotShaping":66,"courseManagement":71,"composure":66}},{"name":"Whit","shortName":"Whit","sourceTeam":"Ruffels","handicapDisplay":"8","overall":68,"rank":47,"attrs":{"drivingAccuracy":73,"drivingDistance":68,"longApproach":69,"shortApproach":69,"chipping":66,"putting":72,"recovery":65,"bunker":66,"paceControl":67,"shotShaping":65,"courseManagement":65,"composure":69}},{"name":"Santino","shortName":"Santino","sourceTeam":"Dalke","handicapDisplay":"9","overall":66,"rank":48,"attrs":{"drivingAccuracy":69,"drivingDistance":66,"longApproach":67,"shortApproach":65,"chipping":69,"putting":66,"recovery":70,"bunker":67,"paceControl":65,"shotShaping":64,"courseManagement":64,"composure":68}},{"name":"Biz","shortName":"Biz","sourceTeam":"Dalke","handicapDisplay":"10","overall":66,"rank":49,"attrs":{"drivingAccuracy":64,"drivingDistance":64,"longApproach":67,"shortApproach":66,"chipping":66,"putting":63,"recovery":67,"bunker":68,"paceControl":68,"shotShaping":64,"courseManagement":67,"composure":66}},{"name":"JWill","shortName":"JWill","sourceTeam":"Finch","handicapDisplay":"10","overall":66,"rank":50,"attrs":{"drivingAccuracy":68,"drivingDistance":66,"longApproach":66,"shortApproach":64,"chipping":68,"putting":66,"recovery":68,"bunker":66,"paceControl":67,"shotShaping":68,"courseManagement":66,"composure":66}},{"name":"Sabrina","shortName":"Sabrina","sourceTeam":"Bryan","handicapDisplay":"10","overall":66,"rank":51,"attrs":{"drivingAccuracy":66,"drivingDistance":67,"longApproach":62,"shortApproach":70,"chipping":62,"putting":71,"recovery":64,"bunker":64,"paceControl":68,"shotShaping":63,"courseManagement":62,"composure":63}},{"name":"Cold Cuts","shortName":"Cold Cuts","sourceTeam":"Finch","handicapDisplay":"10","overall":65,"rank":52,"attrs":{"drivingAccuracy":62,"drivingDistance":64,"longApproach":64,"shortApproach":66,"chipping":66,"putting":63,"recovery":65,"bunker":66,"paceControl":64,"shotShaping":65,"courseManagement":67,"composure":70}},{"name":"Karol","shortName":"Karol","sourceTeam":"Dalke","handicapDisplay":"12","overall":64,"rank":53,"attrs":{"drivingAccuracy":66,"drivingDistance":66,"longApproach":60,"shortApproach":64,"chipping":63,"putting":64,"recovery":61,"bunker":66,"paceControl":62,"shotShaping":66,"courseManagement":63,"composure":62}},{"name":"The Jet","shortName":"The Jet","sourceTeam":"Finch","handicapDisplay":"12","overall":64,"rank":54,"attrs":{"drivingAccuracy":57,"drivingDistance":71,"longApproach":62,"shortApproach":65,"chipping":61,"putting":66,"recovery":65,"bunker":61,"paceControl":64,"shotShaping":66,"courseManagement":60,"composure":60}},{"name":"Robby","shortName":"Robby","sourceTeam":"Bryan","handicapDisplay":"12.9","overall":62,"rank":55,"attrs":{"drivingAccuracy":65,"drivingDistance":62,"longApproach":63,"shortApproach":63,"chipping":58,"putting":63,"recovery":64,"bunker":62,"paceControl":61,"shotShaping":64,"courseManagement":66,"composure":62}},{"name":"Callux","shortName":"Callux","sourceTeam":"Bryan","handicapDisplay":"13","overall":61,"rank":56,"attrs":{"drivingAccuracy":62,"drivingDistance":58,"longApproach":60,"shortApproach":62,"chipping":61,"putting":58,"recovery":65,"bunker":59,"paceControl":62,"shotShaping":61,"courseManagement":60,"composure":66}},{"name":"Gruden","shortName":"Gruden","sourceTeam":"Ruffels","handicapDisplay":"13.7","overall":60,"rank":57,"attrs":{"drivingAccuracy":61,"drivingDistance":59,"longApproach":60,"shortApproach":60,"chipping":57,"putting":61,"recovery":59,"bunker":57,"paceControl":57,"shotShaping":57,"courseManagement":66,"composure":59}},{"name":"Trent","shortName":"Trent","sourceTeam":"Finch","handicapDisplay":"14","overall":60,"rank":58,"attrs":{"drivingAccuracy":57,"drivingDistance":64,"longApproach":59,"shortApproach":60,"chipping":61,"putting":58,"recovery":60,"bunker":61,"paceControl":62,"shotShaping":59,"courseManagement":62,"composure":59}},{"name":"Daltoosh","shortName":"Daltoosh","sourceTeam":"Dalke","handicapDisplay":"14","overall":59,"rank":59,"attrs":{"drivingAccuracy":59,"drivingDistance":58,"longApproach":60,"shortApproach":63,"chipping":58,"putting":55,"recovery":57,"bunker":60,"paceControl":63,"shotShaping":62,"courseManagement":57,"composure":66}},{"name":"Salim","shortName":"Salim","sourceTeam":"Ruffels","handicapDisplay":"15","overall":59,"rank":60,"attrs":{"drivingAccuracy":59,"drivingDistance":61,"longApproach":55,"shortApproach":58,"chipping":62,"putting":61,"recovery":57,"bunker":60,"paceControl":61,"shotShaping":61,"courseManagement":55,"composure":55}},{"name":"Kyle","shortName":"Kyle","sourceTeam":"Bryan","handicapDisplay":"15","overall":58,"rank":61,"attrs":{"drivingAccuracy":60,"drivingDistance":55,"longApproach":57,"shortApproach":59,"chipping":59,"putting":58,"recovery":60,"bunker":58,"paceControl":57,"shotShaping":57,"courseManagement":57,"composure":58}},{"name":"PFT","shortName":"PFT","sourceTeam":"Bryan","handicapDisplay":"17","overall":56,"rank":62,"attrs":{"drivingAccuracy":58,"drivingDistance":54,"longApproach":54,"shortApproach":58,"chipping":55,"putting":57,"recovery":53,"bunker":58,"paceControl":56,"shotShaping":56,"courseManagement":61,"composure":61}},{"name":"Jerry","shortName":"Jerry","sourceTeam":"Finch","handicapDisplay":"18","overall":54,"rank":63,"attrs":{"drivingAccuracy":54,"drivingDistance":56,"longApproach":54,"shortApproach":52,"chipping":55,"putting":54,"recovery":55,"bunker":56,"paceControl":53,"shotShaping":54,"courseManagement":57,"composure":51}},{"name":"Duke","shortName":"Duke","sourceTeam":"Ruffels","handicapDisplay":"28","overall":40,"rank":64,"attrs":{"drivingAccuracy":40,"drivingDistance":35,"longApproach":43,"shortApproach":43,"chipping":40,"putting":39,"recovery":40,"bunker":42,"paceControl":43,"shotShaping":37,"courseManagement":38,"composure":46}}];

const ATTR_KEYS = ["drivingAccuracy","drivingDistance","longApproach","shortApproach","chipping","putting","recovery","bunker","paceControl","shotShaping","courseManagement","composure"];

const CHANNELS = [
  { id: "elite", emoji: "🏆", name: "Elite Competitive", blurb: "Scratch golf content. Flavour for your brand — the land wheel still sets your band.", bias: { drivingDistance: 3, longApproach: 2, composure: 2 } },
  { id: "tips", emoji: "⛳", name: "Golf Tips Channel", blurb: "Solid tips and drills. Flavour for your brand — the land wheel still sets your band.", bias: { shortApproach: 2, chipping: 2, courseManagement: 2 } },
  { id: "vlog", emoji: "🎥", name: "Day-in-the-Life Vlog", blurb: "Fun rounds with mates. Flavour for your brand — the land wheel still sets your band.", bias: { putting: 2, composure: 1 } },
  { id: "scramble", emoji: "🎢", name: "Scramble & Chaos", blurb: "High-handicap entertainment. Flavour for your brand — the land wheel still sets your band.", bias: { recovery: 3, bunker: 2, drivingDistance: 1 } },
  { id: "comedy", emoji: "😂", name: "Comedy Golf", blurb: "Bits over birdies. Flavour for your brand — the land wheel still sets your band.", bias: { composure: 3, recovery: 1 } },
];

// Where do you land? Roughly equal slices. Band mid ± spread, then channel/combine nudge a few points.
const LAND_BANDS = [
  { id: "elite", name: "Elite", slice: "longfw", blurb: "Best in the field energy. High 70s into the high 80s.", mid: 82, spread: 6, min: 76, max: 89 },
  { id: "middle", name: "Middle of the pack", slice: "fairway", blurb: "Solid midfield. Plenty of golf left either side of you.", mid: 64, spread: 8, min: 55, max: 74 },
  { id: "underdog", name: "Underdog", slice: "rough", blurb: "Near the bottom. Your draft and your shots still win it.", mid: 46, spread: 6, min: 40, max: 54 },
];

const ANYONE_WINS = "Your overall picks your rivals, not your result. Every captain starts level — your draft and your shots win it.";

const COMBINE_DRILLS = [
  { id: "drive", name: "Driver Booth", attr: "drivingDistance", desc: "Smash it. Longer is better." },
  { id: "iron", name: "Iron Ladder", attr: "longApproach", desc: "Hit the ladder sticks." },
  { id: "wedge", name: "Wedge Window", attr: "shortApproach", desc: "Flight it through the window." },
  { id: "putt", name: "Putt Gate", attr: "putting", desc: "Start line through the gate." },
];

const INV_BADGES = [
  { id: "inv_win", name: "Internet Champ", desc: "Win the Internet Invitational (Day 1)", attr: "ALL" },
  { id: "inv_duke", name: "Win with the Duke", desc: "Have Duke on your team and win Day 1", attr: "recovery" },
  { id: "inv_lastpick", name: "Diamond in the Rough", desc: "Draft the last pick and win Day 1", attr: "courseManagement" },
  { id: "inv_lowcap", name: "Captain Underdog", desc: "Win Day 1 as the lowest-rated captain", attr: "composure" },
  { id: "inv_comeback", name: "Back-Nine Heist", desc: "Lose the front 9, then win the match", attr: "putting" },
  { id: "inv_clean9", name: "Perfect Nine", desc: "Take all 8 points on a nine", attr: "longApproach" },
  { id: "inv_bothjosh", name: "Josh Squared", desc: "Draft both Joshes onto your team", attr: "shortApproach" },
  { id: "inv_combine_elite", name: "Combine King", desc: "Post a 85+ combine overall", attr: "drivingDistance" },
];

function invLoad() {
  try { return JSON.parse(localStorage.getItem(INV_LS) || "null"); } catch (e) { return null; }
}
function invSave(st) {
  try { localStorage.setItem(INV_LS, JSON.stringify(st)); } catch (e) {}
}
function invAchLoad() {
  try { return JSON.parse(localStorage.getItem(INV_ACH_LS) || "[]"); } catch (e) { return []; }
}
function invAchSave(ids) {
  try { localStorage.setItem(INV_ACH_LS, JSON.stringify(ids)); } catch (e) {}
}
function invGrantAch(ids) {
  const have = new Set(invAchLoad());
  const news = [];
  (ids || []).forEach((id) => { if (!have.has(id)) { have.add(id); news.push(id); } });
  invAchSave([...have]);
  return news;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function pickRng(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

function attrsFromBase(base, bias, rng) {
  const a = {};
  ATTR_KEYS.forEach((k) => {
    const b = (bias && bias[k]) || 0;
    const jitter = Math.floor(rng() * 7) - 3;
    a[k] = clampN(Math.round(base + b + jitter), 28, 96);
  });
  let o = calcOverall(a), guard = 0;
  while (Math.abs(o - base) > 2 && guard++ < 40) {
    const keys = ATTR_KEYS.slice().sort(() => rng() - 0.5);
    const k = keys[0];
    a[k] = clampN(a[k] + (o < base ? 1 : -1), 28, 96);
    o = calcOverall(a);
  }
  return a;
}

function rollLandBand(seed) {
  const rng = mulberry32(seed ^ 0x1A4D);
  const r = rng();
  // roughly equal thirds
  const band = r < 1 / 3 ? LAND_BANDS[0] : r < 2 / 3 ? LAND_BANDS[1] : LAND_BANDS[2];
  const base = clampN(Math.round(band.mid + (rng() * 2 - 1) * band.spread), band.min, band.max);
  return { band, base, sliceIdx: LAND_BANDS.indexOf(band) };
}

function buildPlayerFromLand(channel, land, channelName, seed) {
  const rng = mulberry32(seed ^ hashStr(channel.id + "|" + channelName + "|" + land.band.id));
  // channel bias nudges a point or two inside the land band
  let base = land.base + Math.round((rng() * 5) - 2);
  base = clampN(base, 40, 89);
  // soft-keep near band
  base = clampN(base, Math.max(40, land.band.min - 3), Math.min(89, land.band.max + 3));
  const attrs = attrsFromBase(base, channel.bias, rng);
  return {
    name: channelName || "You", channelId: channel.id, channelName: channel.name,
    landId: land.band.id, landName: land.band.name, landBase: land.base,
    attrs, overall: calcOverall(attrs), isYou: true, combine: null
  };
}

function applyCombine(player, scores, seed) {
  const rng = mulberry32(seed ^ 0xC0FFEE);
  const attrs = { ...player.attrs };
  const map = { drive: "drivingDistance", iron: "longApproach", wedge: "shortApproach", putt: "putting" };
  let bumpSum = 0;
  Object.keys(map).forEach((k) => {
    const sc = scores[k] == null ? 50 : scores[k];
    // combine only nudges a few points
    const delta = Math.round((sc - 50) / 12 + (rng() * 2 - 1));
    attrs[map[k]] = clampN(attrs[map[k]] + delta, 28, 96);
    bumpSum += delta;
  });
  attrs.drivingAccuracy = clampN(attrs.drivingAccuracy + Math.round((scores.drive - 50) / 20), 28, 96);
  attrs.chipping = clampN(attrs.chipping + Math.round((scores.wedge - 50) / 22), 28, 96);
  attrs.composure = clampN(attrs.composure + Math.round((scores.putt - 50) / 24), 28, 96);
  let overall = calcOverall(attrs);
  // stay near land band (±5 soft)
  const lo = player.landBase != null ? clampN(player.landBase - 5, 40, 89) : 40;
  const hi = player.landBase != null ? clampN(player.landBase + 5, 40, 89) : 89;
  let guard = 0;
  while ((overall < lo || overall > hi) && guard++ < 30) {
    const dir = overall < lo ? 1 : -1;
    const k = ATTR_KEYS[Math.floor(rng() * ATTR_KEYS.length)];
    attrs[k] = clampN(attrs[k] + dir, 28, 96);
    overall = calcOverall(attrs);
  }
  overall = clampN(calcOverall(attrs), 40, 89);
  return { ...player, attrs, overall, combine: { scores, bumpSum } };
}

function rosterPlayers() {
  return INV_ROSTER_RAW.map((p) => ({
    name: p.name, shortName: p.shortName, sourceTeam: p.sourceTeam,
    attrs: { ...p.attrs }, overall: p.overall, rank: p.rank, isYou: false
  }));
}

function pickCaptains(player, field) {
  const ai = field.filter((p) => !p.isYou).slice().sort((a, b) => Math.abs(a.overall - player.overall) - Math.abs(b.overall - player.overall) || a.overall - b.overall);
  const caps = [player, ai[0], ai[1], ai[2]];
  const colors = ["#E8C35A", "#6FB3A8", "#D4796A", "#7FB7D9"];
  return caps.map((c, i) => ({ ...c, captainIdx: i, color: colors[i], teamName: c.isYou ? (c.name + "'s Squad") : (c.shortName || c.name) + "'s Squad" }));
}

function draftPool(field, captains) {
  const capNames = new Set(captains.map((c) => c.name));
  const pool = field.filter((p) => !capNames.has(p.name));
  if (pool.length <= 60) return pool;
  const med = pool.slice().sort((a, b) => a.overall - b.overall)[Math.floor(pool.length / 2)].overall;
  const sorted = pool.slice().sort((a, b) => Math.abs(b.overall - med) - Math.abs(a.overall - med));
  const sit = sorted[0];
  return pool.filter((p) => p.name !== sit.name);
}

function snakeOrder(nCaptains, nRounds) {
  const order = [];
  for (let r = 0; r < nRounds; r++) {
    const fwd = r % 2 === 0;
    for (let i = 0; i < nCaptains; i++) order.push(fwd ? i : (nCaptains - 1 - i));
  }
  return order;
}

function aiDraftPick(pool, team, captains, myIdx) {
  const avg = team.length ? team.reduce((s, p) => s + p.overall, 0) / team.length : captains[myIdx].overall;
  return pool.slice().sort((a, b) => {
    const sa = a.overall - Math.abs(a.overall - avg) * 0.05;
    const sb = b.overall - Math.abs(b.overall - avg) * 0.05;
    return sb - sa;
  })[0];
}

function invCourse() {
  const c = (typeof COURSES !== "undefined" && COURSES.find((x) => x.holes && x.holes.length >= 18)) || null;
  if (c) return c;
  const holes = [];
  for (let i = 0; i < 18; i++) holes.push([i % 3 === 0 ? 5 : (i % 2 ? 3 : 4), i % 2 ? 175 : (i % 3 === 0 ? 520 : 410), 3, i + 1, {}]);
  return { name: "Internet Links", holes };
}

function shortNameOf(p) { return (p && (p.shortName || p.name || "Player")).split(" ")[0]; }

// --- Per-hitter shot engine (alt shot + scramble) ---
// Low-rated players: tops/duffs, shanks, multi-try bunkers, chunked chips, three-putts.
// High-rated: big drives, clean escapes. An 88+40 pair visibly alternates great and terrible.

function skill01(v) { return clampN((v - 32) / 58, 0.06, 1); }

function hitOneShot(hitter, lie, distToGreen, holePar, rng) {
  // returns { yards, lie, text, holed, pen }
  const a = hitter.attrs || hitter;
  const name = shortNameOf(hitter);
  const ovr = hitter.overall != null ? hitter.overall : calcOverall(a);
  const sk = skill01(ovr);
  const puttSk = skill01(a.putting || ovr);
  const chipSk = skill01(a.chipping || ovr);
  const bunkSk = skill01(a.bunker || ovr);
  const drvSk = skill01(a.drivingDistance || ovr);
  const accSk = skill01(a.drivingAccuracy || ovr);

  // On green — putting
  if (lie === "green") {
    const feet = Math.max(1, distToGreen); // reuse dist as feet on green
    // Realistic make curve: 3ft ~85% elite / ~55% 40-ovr; 20ft ~20% elite / ~5% dog
    const makeP = clampN(0.84 - feet * 0.032 + puttSk * 0.11 - (1 - puttSk) * 0.08, 0.05, 0.90);
    if (rng() < makeP) return { yards: 0, lie: "holed", text: name + (feet <= 3 ? " taps in." : " drains it from " + feet + " ft."), holed: true };
    // miss — bad putters three-putt often (leave long or lip out short then miss again)
    let leave;
    if (feet <= 5) {
      leave = rng() < (0.55 + puttSk * 0.35) ? 0 : Math.round(1 + (1 - puttSk) * 4 * rng());
    } else {
      leave = Math.round(2 + (1 - puttSk) * 14 * rng() + (feet > 20 ? 3 : 0) + rng() * 4);
      if (rng() < (1 - puttSk) * 0.35) leave = Math.round(leave + 4 + rng() * 8); // hammer past
    }
    if (leave === 0) return { yards: 0, lie: "holed", text: name + " lips it in.", holed: true };
    return { yards: leave, lie: "green", text: name + (puttSk < 0.4 ? " hammers it " + leave + " ft past." : " leaves " + leave + " ft."), holed: false };
  }

  // Bunker
  if (lie === "bunker" || lie === "gbunker") {
    // low bunker skill: often stay in (40 can take 2–4 goes)
    const escapeP = clampN(0.42 + bunkSk * 0.48, 0.34, 0.94);
    if (rng() > escapeP) {
      const again = bunkSk < 0.35 ? "still in the bunker… again." : "still in the sand.";
      return { yards: 0, lie: "bunker", text: name + " blasts it thin — " + again, holed: false };
    }
    if (rng() < 0.04 + (1 - bunkSk) * 0.08) {
      return { yards: Math.round(2 + rng() * 6), lie: "green", text: name + " skulls it over the green.", holed: false };
    }
    const ft = Math.round(4 + (1 - bunkSk) * 18 * rng() + rng() * 8);
    return { yards: ft, lie: "green", text: name + " splashes out to " + ft + " ft.", holed: false };
  }

  // Around green / chip
  if (lie === "fringe" || lie === "rough_short" || (lie !== "tee" && distToGreen <= 40)) {
    // chunk / duff
    if (rng() < (1 - chipSk) * 0.30) {
      const yds = Math.max(1, Math.round(2 + rng() * 8));
      return { yards: yds, lie: "fringe", text: name + " chunks it " + yds + " yards.", holed: false };
    }
    if (rng() < (1 - chipSk) * 0.12) {
      return { yards: 0, lie: "bunker", text: name + " chunks it straight into the bunker.", holed: false };
    }
    if (rng() < 0.05 + chipSk * 0.10) {
      return { yards: 0, lie: "holed", text: name + " chips in!", holed: true };
    }
    // occasional tidy up-and-down leave even for dogs
    const tidy = rng() < 0.16 + chipSk * 0.22;
    const ft = tidy ? Math.round(2 + rng() * 6) : Math.round(4 + (1 - chipSk) * 18 * rng() + rng() * 10);
    return { yards: ft, lie: "green", text: name + (tidy ? " chips it close — " + ft + " ft." : " chips to " + ft + " ft."), holed: false };
  }

  // Tee / fairway / long rough — full swing
  const isTee = lie === "tee";
  const isDriver = isTee && holePar > 3;
  // Top / duff of a few yards — common for low OVR
  const topP = isDriver ? clampN((1 - drvSk) * 0.24, 0.02, 0.30) : clampN((1 - sk) * 0.12, 0.01, 0.18);
  if (rng() < topP) {
    const yds = Math.round(3 + rng() * 12);
    return { yards: yds, lie: "fairway", text: name + " tops it " + yds + " yards.", holed: false };
  }
  // Shank
  if (rng() < (1 - sk) * 0.07) {
    const yds = Math.round(40 + rng() * 50);
    return { yards: yds, lie: "rough", text: name + " shanks it " + yds + " yards into trouble.", holed: false };
  }
  // Water / big miss
  if (rng() < (1 - accSk) * 0.11) {
    return { yards: Math.round(distToGreen * 0.4), lie: "fairway", text: name + " finds the drink. Drop, still a way in.", holed: false, pen: 1 };
  }

  let carry;
  // Hero / half-decent swing — dogs can still flush one
  const hero = rng() < (0.14 + sk * 0.06);  // dogs ~14–17% flush chance
  if (isDriver) {
    // 40 OVR typical ~180–230, hero ~250; 88 OVR ~280–320
    const mean = 165 + drvSk * 145;
    let c = mean + (rng() - 0.5) * 36;
    if (hero) c = Math.max(c, 230 + drvSk * 60 + rng() * 30);
    carry = Math.round(clampN(c, 50, 340));
  } else {
    // approach / layup intent toward green
    const want = Math.min(distToGreen, 220);
    const miss = (1 - sk) * 64 * (rng() - 0.26) - sk * 3;
    let c = want + miss;
    if (hero) c = want - 5 + (rng() - 0.5) * 16; // flush approach
    carry = Math.round(clampN(c, 18, 250));
  }

  const rem = Math.max(0, distToGreen - carry);
  // lie after shot
  if (rem <= 0) {
    // Overshoot / thin through: low skill often fails to hold
    if (rng() < (1 - sk) * 0.22) {
      const long = Math.round(8 + (1 - sk) * 25 * rng());
      if (rng() < 0.4) return { yards: carry, lie: "bunker", text: name + " flies the green into the bunker.", holed: false };
      return { yards: carry, lie: "fringe", text: name + " flies it long by " + long + " yards.", holed: false };
    }
    const ft = Math.round(6 + (1 - sk) * 30 * rng() + rng() * 14);
    return { yards: carry, lie: "green", text: name + (isDriver && carry >= 280 ? " bombs one " + carry + " yards onto the dancefloor — " + ft + " ft." : " finds the green, " + ft + " ft."), holed: false, greenFt: ft };
  }
  // From 40–120 in, hold green only with skill
  if (rem <= 120 && rem > 0 && !isDriver) {
    const holdP = clampN(0.07 + sk * 0.55 - rem * 0.003, 0.05, 0.78);
    if (rng() < holdP) {
      const ft = Math.round(5 + (1 - sk) * 28 * rng() + rng() * 12);
      return { yards: carry, lie: "green", text: name + " sticks it to " + ft + " ft.", holed: false, greenFt: ft };
    }
    if (rng() < (1 - sk) * 0.22) {
      return { yards: carry, lie: "bunker", text: name + " dumps it in the greenside bunker.", holed: false };
    }
    if (rng() < (1 - sk) * 0.20) {
      return { yards: carry, lie: "rough", text: name + " leaks it wide into the rough.", holed: false };
    }
    return { yards: carry, lie: "fringe", text: name + " comes up " + Math.max(1, rem) + " yards short.", holed: false };
  }
  if (rem <= 40 && rng() < 0.25 + sk * 0.35) {
    return { yards: carry, lie: "fringe", text: name + " to " + rem + " yards short.", holed: false };
  }
  // bunker chance near green
  if (rem < 50 && rng() < (1 - sk) * 0.28) {
    return { yards: carry, lie: "bunker", text: name + " dumps it in the greenside bunker.", holed: false };
  }
  if (rng() < (1 - accSk) * 0.35) {
    return { yards: carry, lie: "rough", text: name + " leaks it into the rough, " + rem + " yards in.", holed: false };
  }
  let label;
  if (isDriver && carry >= 290) label = "ripping a " + carry + "-yard drive.";
  else if (isDriver && hero && sk < 0.45) label = "catches one flush — " + carry + " yards down the middle.";
  else if (isDriver && hero) label = "stripes one " + carry + " yards.";
  else if (hero && !isDriver) label = "pure strike — " + carry + " yards, " + rem + " in.";
  else label = "hits it " + carry + " yards. " + rem + " in.";
  return { yards: carry, lie: "fairway", text: name + " " + label, holed: false };
}

function playBallHole(hitters, hole, startIdx, rng, mode) {
  // hitters: [p0, p1] for alt (alternate each shot); scramble uses one hitter array of 1
  // mode: "alt" | "solo"
  const par = hole[0];
  const yardage = hole[1] || 400;
  let dist = yardage;
  let lie = "tee";
  let strokes = 0;
  let pens = 0;
  const log = [];
  let hIdx = startIdx || 0;
  let greenFt = null;
  let guard = 0;

  while (guard++ < 24) {
    const hitter = hitters[hIdx % hitters.length];
    const inputDist = lie === "green" ? (greenFt || 12) : dist;
    const shot = hitOneShot(hitter, lie === "gbunker" ? "bunker" : lie, inputDist, par, rng);
    strokes += 1 + (shot.pen || 0);
    pens += shot.pen || 0;
    log.push({ name: shortNameOf(hitter), text: shot.text, lie: shot.lie, ovr: hitter.overall });
    if (shot.holed || shot.lie === "holed") break;
    if (shot.lie === "green") {
      lie = "green";
      greenFt = shot.greenFt != null ? shot.greenFt : (shot.yards || 10);
      dist = 0;
    } else if (shot.lie === "bunker" || shot.lie === "gbunker") {
      lie = "bunker";
      // stay roughly near green
      dist = Math.min(dist, 30);
    } else if (shot.lie === "fringe") {
      lie = "fringe";
      dist = Math.max(5, dist - (shot.yards || 10));
    } else {
      lie = shot.lie || "fairway";
      dist = Math.max(0, dist - (shot.yards || 0));
      if (dist < 1) { lie = "green"; greenFt = Math.round(8 + rng() * 20); }
    }
    if (mode === "alt") hIdx += 1;
    // three-putt / endless bunker safety: cap
    if (strokes >= par + 6) {
      log.push({ name: shortNameOf(hitter), text: shortNameOf(hitter) + " finally picks it up.", lie: "holed" });
      strokes = par + 6;
      break;
    }
  }
  return { score: strokes, log, pens };
}

function playAltHole(p0, p1, hole, startIdx, rng) {
  return playBallHole([p0, p1], hole, startIdx || 0, rng, "alt");
}

function playScrambleHole(p0, p1, hole, rng) {
  // each plays own ball; take best score; merge logs tagged
  const a = playBallHole([p0], hole, 0, rng, "solo");
  const b = playBallHole([p1], hole, 0, rng, "solo");
  const best = a.score <= b.score ? a : b;
  const other = a.score <= b.score ? b : a;
  const log = best.log.map((x) => ({ ...x, text: x.text })).concat(
    [{ name: "—", text: "(partner " + other.score + ", best ball " + best.score + ")", lie: "note" }]
  );
  return { score: best.score, log };
}

function scrambleScores(pair, hole, rng) {
  const r = rng || mulberry32(Date.now() ^ 0x5C12);
  return playScrambleHole(pair[0], pair[1], hole, r).score;
}
function altShotScore(pair, hole, startIdx, rng) {
  const r = rng || mulberry32(Date.now() ^ 0xA17);
  return playAltHole(pair[0], pair[1], hole, startIdx, r).score;
}

function pairingsForNine(teamA, teamB, seed, nine) {
  const rng = mulberry32(seed ^ (nine * 9973));
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const makePairs = (team) => {
    const s = shuffle(team);
    const pairs = [];
    for (let i = 0; i < 8; i++) pairs.push([s[i * 2], s[i * 2 + 1]]);
    return pairs;
  };
  const pa = makePairs(teamA), pb = makePairs(teamB);
  const youIdx = pa.findIndex((pr) => pr.some((p) => p.isYou));
  if (youIdx > 0) { const t = pa[0]; pa[0] = pa[youIdx]; pa[youIdx] = t; }
  return pa.map((pr, i) => ({ a: pr, b: pb[i], ptsA: 0, ptsB: 0, holes: [] }));
}

function matchPointsFromHoles(holes) {
  let a = 0, b = 0;
  holes.forEach((x) => { if (x.sa < x.sb) a += 1; else if (x.sb < x.sa) b += 1; else { a += 0.5; b += 0.5; } });
  return { a, b };
}

function makeAttrsAtOvr(target) {
  const rng = mulberry32(target * 9999 + 42);
  return attrsFromBase(target, {}, rng);
}

/** Calibration: 9-hole alt-shot averages vs par for pairings. */
function calibrateAltPairs(nRuns) {
  const course = invCourse();
  const holes = course.holes.slice(0, 9);
  const par = holes.reduce((s, h) => s + h[0], 0);
  const specs = [
    { label: "88+88", a: 88, b: 88 },
    { label: "88+40", a: 88, b: 40 },
    { label: "60+60", a: 60, b: 60 },
    { label: "40+40", a: 40, b: 40 },
  ];
  const runs = nRuns || 80;
  return specs.map((sp) => {
    const p0 = { name: "A", shortName: "A", overall: sp.a, attrs: makeAttrsAtOvr(sp.a) };
    const p1 = { name: "B", shortName: "B", overall: sp.b, attrs: makeAttrsAtOvr(sp.b) };
    let sum = 0, bunkMulti = 0, tops = 0;
    for (let r = 0; r < runs; r++) {
      const rng = mulberry32((r + 1) * 10007 + sp.a * 13 + sp.b);
      let score = 0;
      holes.forEach((hl, hi) => {
        const res = playAltHole(p0, p1, hl, hi % 2, rng);
        score += res.score;
        res.log.forEach((line) => {
          if (/still in the bunker/i.test(line.text)) bunkMulti++;
          if (/tops it/i.test(line.text)) tops++;
        });
      });
      sum += score;
    }
    const avg = sum / runs;
    return { label: sp.label, avg: Math.round(avg * 10) / 10, vsPar: Math.round((avg - par) * 10) / 10, par, bunkStuck: bunkMulti, tops, runs };
  });
}

function InvAiDraftTick({ onTick }) {
  useEffect(() => { const t = setTimeout(onTick, 350); return () => clearTimeout(t); }, []);
  return null;
}

// --- React root component ---
function InternetInvitational({ onHome }) {
  const [st, setSt] = useState(() => invLoad() || null);
  const [phase, setPhase] = useState(() => (invLoad() && invLoad().phase) || "intro");
  const [name, setName] = useState("");
  const [channelId, setChannelId] = useState("tips");
  const [combineIdx, setCombineIdx] = useState(0);
  const [combineScores, setCombineScores] = useState({});
  const [combineFlash, setCombineFlash] = useState(null);
  const [draftSel, setDraftSel] = useState(null);
  const [wheelSpin, setWheelSpin] = useState(null);
  const [play, setPlay] = useState(null); // live match state for player's matchup
  const [toast, setToast] = useState(null);
  const [achNews, setAchNews] = useState([]);

  const persist = (next, ph) => {
    const s = { ...next, phase: ph != null ? ph : next.phase };
    invSave(s); setSt(s); if (ph) setPhase(ph);
  };

  const goHome = () => {
    if (phase === "play" || phase === "nineBreak") {
      if (!window.confirm("Leave the Invitational? You can resume from the home card.")) return;
    }
    onHome && onHome();
  };

  // ---------- INTRO ----------
  if (phase === "intro") {
    return h(Shell, null,
      h(BackTop, { onClick: goHome, label: "Home" }),
      h("div", { className: "pt-2 text-center mb-4" },
        h("div", { style: { fontFamily: FONT, fontSize: 13, letterSpacing: 4, color: C.gold } }, "BETA EVENT"),
        h("h1", { style: { fontFamily: FONT, fontSize: 40, color: C.chalk, lineHeight: 1.05 } }, "INTERNET INVITATIONAL"),
        h("p", { className: "text-sm mt-2", style: { color: C.muted } }, "64 YouTube golfers. Four captains. Scramble front nine, alternate shot back nine. Wheel draft. Your shots, your wheel.")),
      h("div", { className: "p-3 rounded-xl mb-3 text-left", style: { background: "linear-gradient(160deg,#1D5237,#123524)", border: "1.5px solid " + C.gold } },
        h("div", { style: { color: C.gold, fontFamily: FONT, fontSize: 14, letterSpacing: 2 } }, "HOW IT WORKS"),
        h("ul", { className: "text-sm mt-2 space-y-1", style: { color: C.chalk, paddingLeft: 18 } },
          h("li", null, "Pick a channel vibe (flavour), then spin Where do you land? — Elite / Middle / Underdog."),
          h("li", null, "Combine only nudges a few points. Anyone can win from any band."),
          h("li", null, "You captain. Three AI captains closest to your overall join you."),
          h("li", null, "Wheel for draft order, then snake draft your squad."),
          h("li", null, "Day 1: front 9 scramble 2v2 match play (8 pts), reshuffle, back 9 alternate shot (8 pts)."),
          h("li", null, "Winners go to Day 2 (coming soon)."))),
      st && st.phase && st.phase !== "intro" && h(Btn, { small: true, onClick: () => setPhase(st.phase) }, "RESUME EVENT"),
      h(Btn, { onClick: () => { setName(""); setChannelId("tips"); setCombineScores({}); setCombineIdx(0); setPhase("channel"); } }, "START INVITATIONAL"),
      h("p", { className: "text-[11px] text-center mt-3", style: { color: C.muted } }, "Names only · fair use · no photos or likenesses"));
  }

  // ---------- CHANNEL ----------
  if (phase === "channel") {
    const ch = CHANNELS.find((c) => c.id === channelId) || CHANNELS[1];
    return h(Shell, null,
      h(BackTop, { onClick: () => setPhase("intro"), label: "Back" }),
      h("div", { className: "text-center mb-3" },
        h("div", { style: { fontFamily: FONT, fontSize: 12, letterSpacing: 3, color: C.gold } }, "STEP 1 · YOUR CHANNEL"),
        h("h2", { style: { fontFamily: FONT, fontSize: 28, color: C.chalk } }, "Who are you on YouTube?")),
      h("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "Channel / player name", className: "w-full mb-3 px-4 py-3 rounded-md outline-none text-center", style: { background: C.panel, color: C.chalk, border: "1px solid rgba(244,247,242,0.25)", fontSize: 16 } }),
      CHANNELS.map((c) => h("button", { key: c.id, onClick: () => setChannelId(c.id), className: "w-full mb-2 p-3 rounded-xl text-left", style: { background: channelId === c.id ? "linear-gradient(160deg,#1D5237,#123524)" : C.panel, border: channelId === c.id ? "1.5px solid " + C.gold : "1px solid rgba(244,247,242,0.12)" } },
        h("div", { style: { fontFamily: FONT, fontSize: 18, color: C.chalk } }, c.emoji + " " + c.name),
        h("div", { className: "text-xs mt-1", style: { color: C.muted } }, c.blurb),
        h("div", { className: "text-[11px] mt-1", style: { color: C.gold } }, "Brand flavour — the land wheel sets your band"))),
      h(Btn, { disabled: !name.trim(), onClick: () => {
        const seed = (Date.now() ^ hashStr(name.trim())) >>> 0;
        persist({ seed, pendingName: name.trim(), pendingChannelId: ch.id, phase: "land" }, "land");
        setWheelSpin(null);
      } }, "WHERE DO YOU LAND?"));
  }

  // ---------- LAND WHEEL ----------
  if (phase === "land" && st) {
    const ch = CHANNELS.find((c) => c.id === (st.pendingChannelId || channelId)) || CHANNELS[1];
    const finishLand = (land) => {
      const player = buildPlayerFromLand(ch, land, st.pendingName || name || "You", st.seed);
      persist({ ...st, player, land: { id: land.band.id, name: land.band.name, base: land.base }, phase: "landResult" }, "landResult");
      setWheelSpin(null);
    };
    if (wheelSpin && wheelSpin.kind === "land" && wheelSpin.done) {
      return h(Shell, null,
        h(BackTop, { onClick: () => setPhase("channel"), label: "Back" }),
        h("div", { className: "text-center mb-3" },
          h("div", { style: { fontFamily: FONT, fontSize: 12, letterSpacing: 3, color: C.gold } }, "WHERE DO YOU LAND?"),
          h("h2", { style: { fontFamily: FONT, fontSize: 32, color: C.chalk } }, wheelSpin.land.band.name),
          h("p", { className: "text-sm mt-1", style: { color: C.muted } }, wheelSpin.land.band.blurb)),
        h(Btn, { onClick: () => finishLand(wheelSpin.land) }, "LOCK IT IN"));
    }
    if (wheelSpin && wheelSpin.kind === "land" && !wheelSpin.done) {
      const fakeWheel = { o: LAND_BANDS.map((b) => ({ p: 1 / 3, s: b.slice })), i: wheelSpin.land.sliceIdx };
      return h(Shell, null,
        h("div", { className: "text-center mb-2", style: { fontFamily: FONT, fontSize: 14, color: C.gold } }, "WHERE DO YOU LAND?"),
        h(ShotWheel, { wheel: fakeWheel, label: "ELITE · MIDDLE · UNDERDOG", onDone: () => setWheelSpin({ ...wheelSpin, done: true }) }),
        h("p", { className: "text-xs text-center mt-2", style: { color: C.muted } }, "Roughly even odds. Channel flavour nudges you a few points after."));
    }
    return h(Shell, null,
      h(BackTop, { onClick: () => setPhase("channel"), label: "Back" }),
      h("div", { className: "text-center mb-4" },
        h("div", { style: { fontFamily: FONT, fontSize: 12, letterSpacing: 3, color: C.gold } }, "STEP 1B · THE LAND WHEEL"),
        h("h2", { style: { fontFamily: FONT, fontSize: 28, color: C.chalk } }, "Where do you land?"),
        h("p", { className: "text-sm", style: { color: C.muted } }, "Elite, middle of the pack, or underdog — about the same chance of each. That sets your overall band. Channel and combine only nudge from there.")),
      LAND_BANDS.map((b) => h("div", { key: b.id, className: "mb-2 p-3 rounded-xl text-left", style: { background: C.panel } },
        h("div", { style: { fontFamily: FONT, fontSize: 16, color: C.chalk } }, b.name),
        h("div", { className: "text-xs", style: { color: C.muted } }, b.blurb + " (~" + b.min + "–" + b.max + ")"))),
      h(Btn, { onClick: () => {
        const land = rollLandBand(st.seed ^ Date.now());
        setWheelSpin({ kind: "land", land, done: false });
      } }, "SPIN"));
  }

  // ---------- LAND RESULT ----------
  if (phase === "landResult" && st && st.player) {
    const under = st.land && st.land.id === "underdog";
    return h(Shell, null,
      h(BackTop, { onClick: goHome, label: "Home", confirm: true }),
      h("div", { className: "text-center mb-3" },
        h("div", { style: { fontFamily: FONT, fontSize: 12, letterSpacing: 3, color: C.gold } }, "YOU LANDED"),
        h("h2", { style: { fontFamily: FONT, fontSize: 28, color: C.chalk } }, st.land ? st.land.name : "—"),
        h("div", { style: { fontFamily: FONT, fontSize: 48, color: C.gold } }, st.player.overall),
        h("div", { className: "text-sm", style: { color: C.muted } }, "Band base · combine still to come")),
      h("div", { className: "p-3 rounded-xl mb-3 text-left", style: { background: "linear-gradient(160deg,#1D5237,#123524)", border: "1.5px solid " + C.gold } },
        h("div", { style: { fontFamily: FONT, fontSize: 14, color: C.gold } }, "ANYONE CAN WIN"),
        h("p", { className: "text-sm mt-1", style: { color: C.chalk } }, ANYONE_WINS)),
      under && h("div", { className: "p-3 rounded-xl mb-3 text-left", style: { background: "rgba(212,121,106,0.15)", border: "1px solid #D4796A" } },
        h("div", { style: { fontFamily: FONT, fontSize: 14, color: "#D4796A" } }, "UNDERDOG PATH"),
        h("p", { className: "text-sm mt-1", style: { color: C.chalk } }, "Chase Captain Underdog, Win with the Duke, Diamond in the Rough, Josh Squared — low overall is a story, not a sentence.")),
      h(Btn, { onClick: () => { setCombineIdx(0); setCombineScores({}); persist({ ...st, phase: "combine" }, "combine"); } }, "CONTINUE TO COMBINE"));
  }

  // ---------- COMBINE ----------
  if (phase === "combine" && st && st.player) {
    const drill = COMBINE_DRILLS[combineIdx];
    const done = combineIdx >= COMBINE_DRILLS.length;
    if (done) {
      const seeded = applyCombine(st.player, combineScores, st.seed);
      return h(Shell, null,
        h(BackTop, { onClick: goHome, label: "Home", confirm: "Leave combine?" }),
        h("div", { className: "text-center mb-3" },
          h("div", { style: { fontFamily: FONT, fontSize: 12, letterSpacing: 3, color: C.gold } }, "COMBINE COMPLETE"),
          h("h2", { style: { fontFamily: FONT, fontSize: 32, color: C.chalk } }, seeded.name),
          h("div", { style: { fontFamily: FONT, fontSize: 56, color: C.gold, lineHeight: 1 } }, seeded.overall),
          h("div", { className: "text-sm", style: { color: C.muted } }, "Overall · " + seeded.channelName)),
        h("p", { className: "text-sm mb-3 text-center", style: { color: C.chalk } }, "The field runs from the high 80s down to the 40s. Captains are you plus the three closest overalls."),
        h(Btn, { onClick: () => {
          const field = [...rosterPlayers()];
          const captains = pickCaptains(seeded, field);
          const pool = draftPool(field, captains);
          const next = { ...st, player: seeded, field, captains, pool, teams: captains.map((c) => [c]), draftPick: 0, draftOrder: null, sitOut: field.filter((p) => !captains.some((c) => c.name === p.name) && !pool.some((x) => x.name === p.name)).map((p) => p.name), phase: "reveal" };
          persist(next, "reveal");
        } }, "SEE THE FIELD"));
    }
    const fire = () => {
      // one-tap minigame: RNG with skill floor from current attr
      const attr = st.player.attrs[drill.attr] || 70;
      const roll = Math.random();
      const score = clampN(Math.round(attr * 0.35 + roll * 65 + (Math.random() * 8 - 4)), 5, 99);
      const nextScores = { ...combineScores, [drill.id === "drive" ? "drive" : drill.id === "iron" ? "iron" : drill.id === "wedge" ? "wedge" : "putt"]: score };
      setCombineScores(nextScores);
      setCombineFlash({ score, label: score >= 85 ? "Elite" : score >= 70 ? "Solid" : score >= 50 ? "Mixed" : "Rough" });
      setTimeout(() => { setCombineFlash(null); setCombineIdx(combineIdx + 1); }, 900);
    };
    return h(Shell, null,
      h(BackTop, { onClick: () => setPhase("channel"), label: "Back" }),
      h("div", { className: "text-center mb-2" },
        h("div", { style: { fontFamily: FONT, fontSize: 12, letterSpacing: 3, color: C.gold } }, "STEP 2 · COMBINE · " + (combineIdx + 1) + "/4"),
        h("h2", { style: { fontFamily: FONT, fontSize: 28, color: C.chalk } }, drill.name),
        h("p", { className: "text-sm", style: { color: C.muted } }, drill.desc)),
      h("div", { className: "p-6 rounded-2xl mb-3 text-center", style: { background: "linear-gradient(160deg,#1D5237,#0B2318)", border: "1.5px solid " + C.gold, minHeight: 160 } },
        combineFlash ? h(React.Fragment, null,
          h("div", { style: { fontFamily: FONT, fontSize: 48, color: C.gold } }, combineFlash.score),
          h("div", { style: { color: C.chalk } }, combineFlash.label))
          : h(React.Fragment, null,
            h("div", { style: { fontSize: 48 } }, "🎯"),
            h("p", { className: "text-sm mt-2", style: { color: C.chalk } }, "Tap when ready. Your channel base plus a roll decide the score.")),
      ),
      !combineFlash && h(Btn, { onClick: fire }, "TAKE THE SHOT"),
      h(WheelModePicker, { compact: true }));
  }

  // ---------- REVEAL / CAPTAINS ----------
  if (phase === "reveal" && st && st.captains) {
    const all = [st.player, ...st.field].filter((p, i, a) => a.findIndex((x) => x.name === p.name) === i).sort((a, b) => b.overall - a.overall);
    return h(Shell, null,
      h(BackTop, { onClick: goHome, label: "Home", confirm: true }),
      h("div", { className: "text-center mb-3" },
        h("div", { style: { fontFamily: FONT, fontSize: 12, letterSpacing: 3, color: C.gold } }, "THE FIELD"),
        h("h2", { style: { fontFamily: FONT, fontSize: 28, color: C.chalk } }, "Four captains"),
        h("p", { className: "text-xs", style: { color: C.muted } }, "You plus the three overalls closest to yours.")),
      st.captains.map((c, i) => h("div", { key: c.name, className: "mb-2 p-3 rounded-xl flex justify-between items-center", style: { background: C.panel, borderLeft: "4px solid " + c.color } },
        h("div", null,
          h("div", { style: { fontFamily: FONT, fontSize: 16, color: C.chalk } }, (c.isYou ? "⭐ " : "") + c.name),
          h("div", { className: "text-[11px]", style: { color: C.muted } }, c.teamName)),
        h("div", { style: { fontFamily: FONT, fontSize: 22, color: C.gold } }, c.overall))),
      h("div", { className: "text-[11px] mb-2 mt-3", style: { color: C.muted } }, "Field overalls (sample)"),
      h("div", { className: "rounded-xl p-2 mb-3 max-h-40 overflow-auto", style: { background: "rgba(0,0,0,0.25)" } },
        all.filter((_, i) => i < 5 || i >= all.length - 3 || all[i].isYou).map((p) => h("div", { key: p.name, className: "flex justify-between text-xs py-0.5", style: { color: p.isYou ? C.gold : C.chalk } },
          h("span", null, p.isYou ? "★ " + p.name : p.name),
          h("span", null, p.overall)))),
      h("div", { className: "p-3 rounded-xl mb-3 text-left", style: { background: "linear-gradient(160deg,#1D5237,#123524)", border: "1.5px solid " + C.gold } },
        h("div", { style: { fontFamily: FONT, fontSize: 14, color: C.gold } }, "ANYONE CAN WIN"),
        h("p", { className: "text-sm mt-1", style: { color: C.chalk } }, ANYONE_WINS)),
      st.player && st.player.landId === "underdog" && h("div", { className: "p-3 rounded-xl mb-3 text-left", style: { background: "rgba(212,121,106,0.15)", border: "1px solid #D4796A" } },
        h("div", { style: { fontFamily: FONT, fontSize: 14, color: "#D4796A" } }, "UNDERDOG CAPTAIN"),
        h("p", { className: "text-sm mt-1", style: { color: C.chalk } }, "Captain Underdog, Win with the Duke, Diamond in the Rough — these are made for you.")),
      h("p", { className: "text-[11px] mb-3 text-center", style: { color: C.muted } }, "Top of the board near 89. Floor in the 40s. Your band picks rivals — not the trophy."),
      h(Btn, { onClick: () => setPhase("wheel") }, "SPIN FOR DRAFT ORDER"));
  }

  // ---------- WHEEL DRAFT ORDER ----------
  if (phase === "wheel" && st && st.captains) {
    const doSpin = () => {
      const rng = mulberry32((st.seed ^ 0xDFA70) >>> 0);
      const order = [0, 1, 2, 3].sort(() => rng() - 0.5);
      // build wheel slices equal
      const slices = order.map((capIdx, i) => ({ p: 0.25, s: ["longfw","fairway","green","close"][i], capIdx }));
      // pretend land on first of shuffled = order[0] gets pick 1
      setWheelSpin({ order, slices, i: 0 });
    };
    if (wheelSpin && wheelSpin.done) {
      const draftOrder = snakeOrder(4, 15); // 15 rounds × 4 = 60 picks; but first pick captain order from wheel
      // Remap: wheel order is captainIdx sequence for round 1; snake uses seat 0..3
      const seatOf = {};
      wheelSpin.order.forEach((capIdx, seat) => { seatOf[seat] = capIdx; });
      // draftOrder entries are seats; convert to captainIdx
      const picks = snakeOrder(4, 15).map((seat) => wheelSpin.order[seat]);
      return h(Shell, null,
        h(BackTop, { onClick: goHome, label: "Home", confirm: true }),
        h("div", { className: "text-center mb-3" },
          h("div", { style: { fontFamily: FONT, fontSize: 12, letterSpacing: 3, color: C.gold } }, "DRAFT ORDER"),
          h("h2", { style: { fontFamily: FONT, fontSize: 28, color: C.chalk } }, "Snake draft locked")),
        wheelSpin.order.map((ci, i) => h("div", { key: i, className: "mb-2 p-3 rounded-xl flex justify-between", style: { background: C.panel, borderLeft: "4px solid " + st.captains[ci].color } },
          h("span", { style: { color: C.chalk } }, "Pick " + (i + 1) + " · " + st.captains[ci].name),
          h("span", { style: { color: C.gold } }, st.captains[ci].overall))),
        h(Btn, { onClick: () => {
          persist({ ...st, wheelOrder: wheelSpin.order, draftPicks: picks, draftPick: 0, pool: st.pool.slice(), teams: st.captains.map((c) => [c]), lastPickMeta: {}, phase: "draft" }, "draft");
        } }, "START DRAFT"));
    }
    if (wheelSpin && !wheelSpin.done) {
      const fakeWheel = { o: wheelSpin.order.map((_, i) => ({ p: 0.25, s: ["longfw", "fairway", "green", "close"][i] })), i: 0 };
      // ShotWheel expects CH_SLICE keys - use after spin callback
      return h(Shell, null,
        h("div", { className: "text-center mb-2", style: { fontFamily: FONT, fontSize: 14, color: C.gold } }, "DRAFT ORDER WHEEL"),
        h(ShotWheel, { wheel: fakeWheel, label: "WHO PICKS FIRST?", onDone: () => setWheelSpin({ ...wheelSpin, done: true }) }),
        h("p", { className: "text-xs text-center mt-2", style: { color: C.muted } }, "Landing is random — first slice wins pick 1. Then snake."));
    }
    return h(Shell, null,
      h(BackTop, { onClick: () => setPhase("reveal"), label: "Back" }),
      h("div", { className: "text-center mb-4" },
        h("h2", { style: { fontFamily: FONT, fontSize: 28, color: C.chalk } }, "Wheel for first pick"),
        h("p", { className: "text-sm", style: { color: C.muted } }, "Equal slices. Fate picks the order. Snake after that.")),
      h(Btn, { onClick: doSpin }, "SPIN THE WHEEL"));
  }

  // ---------- DRAFT ----------
  if (phase === "draft" && st && st.draftPicks) {
    const pickNum = st.draftPick;
    const done = pickNum >= st.draftPicks.length || (st.pool || []).length === 0;
    if (done) {
      return h(Shell, null,
        h(BackTop, { onClick: goHome, label: "Home" }),
        h("div", { className: "text-center mb-3" },
          h("div", { style: { fontFamily: FONT, fontSize: 12, letterSpacing: 3, color: C.gold } }, "DRAFT COMPLETE"),
          h("h2", { style: { fontFamily: FONT, fontSize: 28, color: C.chalk } }, "Squads are set")),
        st.teams.map((tm, i) => h("div", { key: i, className: "mb-2 p-3 rounded-xl", style: { background: C.panel, borderLeft: "4px solid " + st.captains[i].color } },
          h("div", { style: { color: C.gold, fontFamily: FONT } }, st.captains[i].teamName + " · " + tm.length + " players · avg " + Math.round(tm.reduce((s, p) => s + p.overall, 0) / tm.length)),
          h("div", { className: "text-[11px] mt-1", style: { color: C.muted } }, tm.map((p) => p.name).join(" · ")))),
        (() => {
          const my = st.teams[0];
          const bothJosh = my.filter((p) => /Josh/i.test(p.name)).length >= 2;
          const news = bothJosh ? invGrantAch(["inv_bothjosh"]) : [];
          return bothJosh ? h("p", { className: "text-sm mb-2 text-center", style: { color: C.gold } }, "Achievement unlocked: Josh Squared — you drafted both Joshes.") : null;
        })(),
        h(Btn, { onClick: () => {
          // set up Day 1 vs random other team
          const rng = mulberry32((st.seed ^ 0xDA41) >>> 0);
          const oppIdx = 1 + Math.floor(rng() * 3);
          const matchupsFront = pairingsForNine(st.teams[0], st.teams[oppIdx], st.seed, 1);
          persist({ ...st, oppIdx, matchupsFront, matchupsBack: null, frontPts: { us: 0, them: 0 }, backPts: { us: 0, them: 0 }, nine: "front", phase: "brief" }, "brief");
        } }, "DAY 1 BRIEFING"));
    }
    const capIdx = st.draftPicks[pickNum];
    const isYou = st.captains[capIdx].isYou;
    const pool = st.pool;
    const auto = () => {
      let nextPool = pool.slice(), teams = st.teams.map((t) => t.slice());
      const pick = aiDraftPick(nextPool, teams[capIdx], st.captains, capIdx);
      nextPool = nextPool.filter((p) => p.name !== pick.name);
      teams[capIdx] = teams[capIdx].concat([pick]);
      const lastPickMeta = { ...(st.lastPickMeta || {}) };
      if (pickNum === st.draftPicks.length - 1) lastPickMeta.capIdx = capIdx;
      persist({ ...st, pool: nextPool, teams, draftPick: pickNum + 1, lastPickMeta }, "draft");
      setDraftSel(null);
    };
    // AI picks via effect (declared below with hooks at top of draft branch — use dedicated effect component)
    if (!isYou) {
      return h(Shell, null,
        h(InvAiDraftTick, { key: "ai-" + pickNum, onTick: auto }),
        h("div", { className: "text-center py-10" },
          h("div", { style: { fontFamily: FONT, fontSize: 14, color: C.gold } }, "PICK " + (pickNum + 1) + " / " + st.draftPicks.length),
          h("h2", { style: { fontFamily: FONT, fontSize: 24, color: C.chalk } }, st.captains[capIdx].name + " is picking…")));
    }
    const sorted = pool.slice().sort((a, b) => b.overall - a.overall);
    return h(Shell, null,
      h(BackTop, { onClick: goHome, label: "Home", confirm: "Leave draft?" }),
      h("div", { className: "text-center mb-2" },
        h("div", { style: { fontFamily: FONT, fontSize: 12, letterSpacing: 3, color: C.gold } }, "YOUR PICK · " + (pickNum + 1) + " / " + st.draftPicks.length),
        h("h2", { style: { fontFamily: FONT, fontSize: 22, color: C.chalk } }, "Draft your squad"),
        h("p", { className: "text-xs", style: { color: C.muted } }, "Team so far: " + st.teams[capIdx].map((p) => p.name).join(", "))),
      h("div", { className: "max-h-72 overflow-auto mb-3" },
        sorted.map((p) => h("button", { key: p.name, onClick: () => setDraftSel(p.name), className: "w-full mb-1 p-2 rounded-lg flex justify-between text-left", style: { background: draftSel === p.name ? "rgba(232,195,90,0.15)" : C.panel, border: draftSel === p.name ? "1px solid " + C.gold : "1px solid transparent" } },
          h("span", { style: { color: C.chalk, fontSize: 14 } }, p.name + (p.sourceTeam ? " · " + p.sourceTeam : "")),
          h("span", { style: { color: C.gold, fontFamily: FONT } }, p.overall)))),
      h(Btn, { disabled: !draftSel, onClick: () => {
        const pick = pool.find((p) => p.name === draftSel);
        const nextPool = pool.filter((p) => p.name !== draftSel);
        const teams = st.teams.map((t, i) => i === capIdx ? t.concat([pick]) : t);
        const lastPickMeta = { ...(st.lastPickMeta || {}) };
        if (pickNum === st.draftPicks.length - 1) lastPickMeta.capIdx = capIdx;
        persist({ ...st, pool: nextPool, teams, draftPick: pickNum + 1, lastPickMeta }, "draft");
        setDraftSel(null);
      } }, "DRAFT PLAYER"));
  }

  // ---------- BRIEF ----------
  if (phase === "brief" && st) {
    const opp = st.captains[st.oppIdx];
    return h(Shell, null,
      h(BackTop, { onClick: goHome, label: "Home", confirm: true }),
      h("div", { className: "text-center mb-3" },
        h("div", { style: { fontFamily: FONT, fontSize: 12, letterSpacing: 3, color: C.gold } }, "DAY 1"),
        h("h2", { style: { fontFamily: FONT, fontSize: 28, color: C.chalk } }, st.captains[0].teamName + " vs " + opp.teamName)),
      h("div", { className: "p-3 rounded-xl mb-3", style: { background: "linear-gradient(160deg,#1D5237,#123524)", border: "1px solid " + C.gold } },
        h("div", { style: { color: C.gold, fontFamily: FONT, fontSize: 14 } }, "FRONT 9 · SCRAMBLE"),
        h("p", { className: "text-sm mt-1", style: { color: C.chalk } }, "2v2 match play. Best ball each hole. 8 points on the line (one per matchup). You play your own shots; partner and opponents are simulated by overall.")),
      h("div", { className: "p-3 rounded-xl mb-3", style: { background: C.panel } },
        h("div", { style: { color: C.gold, fontFamily: FONT, fontSize: 14 } }, "TURN · RE-PAIR"),
        h("p", { className: "text-sm mt-1", style: { color: C.chalk } }, "Fresh pairings and matchups for the back nine.")),
      h("div", { className: "p-3 rounded-xl mb-3", style: { background: C.panel } },
        h("div", { style: { color: C.gold, fontFamily: FONT, fontSize: 14 } }, "BACK 9 · ALTERNATE SHOT"),
        h("p", { className: "text-sm mt-1", style: { color: C.chalk } }, "2v2 match play again. One ball per side. Another 8 points.")),
      h(Btn, { onClick: () => {
        const m = st.matchupsFront;
        // start player's first matchup (index 0)
        persist({ ...st, phase: "play", playMatchIdx: 0, playHoleIdx: 0, nine: "front" }, "play");
        setPlay({ matchIdx: 0, holeIdx: 0, nine: "front", holes: [], waiting: false });
      } }, "TEE IT UP — FRONT 9"));
  }

  // ---------- PLAY ----------
  if (phase === "play" && st) {
    const nine = st.nine || "front";
    const matchups = nine === "front" ? st.matchupsFront : st.matchupsBack;
    const matchIdx = (play && play.matchIdx) != null ? play.matchIdx : (st.playMatchIdx || 0);
    const holeIdx = (play && play.holeIdx) != null ? play.holeIdx : (st.playHoleIdx || 0);
    const course = invCourse();
    const holesSlice = nine === "front" ? course.holes.slice(0, 9) : course.holes.slice(9, 18);
    const mu = matchups[matchIdx];
    const hole = holesSlice[holeIdx];
    const youPair = mu.a;
    const oppPair = mu.b;
    const fmtPair = (pr) => pr.map((p) => p.isYou ? "YOU" : p.name).join(" + ");

    const finishNine = (mus) => {
      let us = 0, them = 0;
      mus.forEach((m) => { const pts = matchPointsFromHoles(m.holes); // convert hole wins to match point: winner of matchup gets 1
        // actually each matchup is worth 1 point total (match play session)
        const diff = m.holes.reduce((d, x) => d + (x.sa < x.sb ? 1 : x.sb < x.sa ? -1 : 0), 0);
        if (diff > 0) us += 1; else if (diff < 0) them += 1; else { us += 0.5; them += 0.5; }
      });
      return { us, them };
    };

    const resolveHole = (entry) => {
      const mode = nine === "front" ? "scramble" : "alt";
      const newHoles = (mu.holes || []).concat([entry]);
      const newMus = matchups.map((m, i) => i === matchIdx ? { ...m, holes: newHoles } : m);

      if (holeIdx + 1 >= 9) {
        let finalMus = newMus.map((m, i) => {
          if (i === matchIdx) return m;
          if (m.holes && m.holes.length >= 9) return m;
          const hs = [];
          const rngM = mulberry32((st.seed ^ (i * 7919) ^ (nine === "front" ? 1 : 2)) >>> 0);
          for (let hi = 0; hi < 9; hi++) {
            const hl = holesSlice[hi];
            const ra = mode === "scramble" ? playScrambleHole(m.a[0], m.a[1], hl, rngM) : playAltHole(m.a[0], m.a[1], hl, hi % 2, rngM);
            const rb = mode === "scramble" ? playScrambleHole(m.b[0], m.b[1], hl, rngM) : playAltHole(m.b[0], m.b[1], hl, hi % 2, rngM);
            hs.push({ n: hi + 1, par: hl[0], sa: ra.score, sb: rb.score });
          }
          return { ...m, holes: hs };
        });
        const pts = finishNine(finalMus);
        if (nine === "front") {
          const matchupsBack = pairingsForNine(st.teams[0], st.teams[st.oppIdx], st.seed ^ 0xB9, 2);
          persist({ ...st, matchupsFront: finalMus, frontPts: pts, matchupsBack, nine: "back", phase: "nineBreak" }, "nineBreak");
          setPlay(null);
        } else {
          persist({ ...st, matchupsBack: finalMus, backPts: pts, phase: "results" }, "results");
          setPlay(null);
        }
      } else {
        const key = nine === "front" ? "matchupsFront" : "matchupsBack";
        persist({ ...st, [key]: newMus, playHoleIdx: holeIdx + 1, playMatchIdx: matchIdx }, "play");
        setPlay({ matchIdx, holeIdx: holeIdx + 1, nine, holes: newHoles, last: entry, shotLog: entry.log || [] });
      }
    };

    const takeShot = () => {
      const mode = nine === "front" ? "scramble" : "alt";
      const rng = mulberry32((st.seed ^ (holeIdx + 1) * 13331 ^ (nine === "front" ? 11 : 22) ^ Date.now()) >>> 0);
      const partner = youPair.find((p) => !p.isYou) || youPair[1];
      const youP = youPair.find((p) => p.isYou) || st.player;
      let resA, resB;
      if (mode === "scramble") {
        resA = playScrambleHole(youP, partner, hole, rng);
        resB = playScrambleHole(oppPair[0], oppPair[1], hole, rng);
      } else {
        const start = holeIdx % 2;
        const ordered = start === 0 ? [youP, partner] : [partner, youP];
        resA = playAltHole(ordered[0], ordered[1], hole, 0, rng);
        resB = playAltHole(oppPair[0], oppPair[1], hole, holeIdx % 2, rng);
      }
      const sa = resA.score, sb = resB.score;
      const log = (resA.log || []).concat([{ name: "vs", text: "— opponents —", lie: "note" }]).concat(resB.log || []);
      const entry = { n: holeIdx + 1, par: hole[0], sa, sb, log };
      const slices = [
        { p: 0.18, s: "longfw" }, { p: 0.32, s: "fairway" }, { p: 0.30, s: "green" }, { p: 0.20, s: "rough" }
      ];
      let i = sa <= hole[0] - 1 ? 0 : sa === hole[0] ? 1 : sa === hole[0] + 1 ? 2 : 3;
      setPlay({ ...(play || {}), matchIdx, holeIdx, nine, spinning: { o: slices, i }, pendingEntry: entry });
    };

    if (play && play.spinning) {
      return h(Shell, null,
        h(BackTop, { onClick: goHome, label: "Home", confirm: "Leave mid-round?" }),
        h(ShotWheel, { wheel: play.spinning, label: (nine === "front" ? "SCRAMBLE" : "ALT SHOT") + " · HOLE " + (holeIdx + 1), onDone: () => {
          const entry = play.pendingEntry;
          setPlay({ ...play, spinning: null, pendingEntry: null, shotLog: entry.log || [], last: entry });
          resolveHole(entry);
        } }));
    }

    const holeLog = (mu.holes || []);
    const diff = holeLog.reduce((d, x) => d + (x.sa < x.sb ? 1 : x.sb < x.sa ? -1 : 0), 0);
    const shotLog = (play && play.shotLog) || (play && play.last && play.last.log) || [];
    return h(Shell, null,
      h(BackTop, { onClick: goHome, label: "Home", confirm: "Leave mid-round? Progress is saved." }),
      h("div", { className: "text-center mb-2" },
        h("div", { style: { fontFamily: FONT, fontSize: 12, letterSpacing: 3, color: C.gold } }, (nine === "front" ? "FRONT 9 · SCRAMBLE" : "BACK 9 · ALTERNATE SHOT") + " · MATCHUP 1/8"),
        h("div", { style: { fontFamily: FONT, fontSize: 18, color: C.chalk } }, fmtPair(youPair) + "  vs  " + fmtPair(oppPair)),
        h("div", { className: "text-[11px]", style: { color: C.muted } }, youPair.map((p) => (p.isYou ? "YOU" : p.name) + " " + p.overall).join(" · ") + "  vs  " + oppPair.map((p) => p.name + " " + p.overall).join(" · ")),
        h("div", { className: "text-sm mt-1", style: { color: diff > 0 ? C.gold : diff < 0 ? "#D4796A" : C.muted } }, diff === 0 && !holeLog.length ? "All square" : (diff === 0 ? "AS" : (Math.abs(diff) + " UP")))),
      h("div", { className: "p-3 rounded-xl mb-3 text-center", style: { background: "linear-gradient(160deg,#1D5237,#0B2318)", border: "1px solid " + C.gold } },
        h("div", { style: { fontFamily: FONT, fontSize: 14, color: C.gold } }, "HOLE " + (holeIdx + 1) + " · PAR " + hole[0] + " · " + hole[1] + " yds"),
        play && play.last && h("div", { className: "text-sm mt-2", style: { color: C.chalk } }, "Last: you " + play.last.sa + " · them " + play.last.sb + (play.last.sa < play.last.sb ? " · won" : play.last.sa > play.last.sb ? " · lost" : " · halved")),
        h("div", { className: "mt-3" }, h(Btn, { onClick: takeShot }, nine === "front" ? "PLAY SCRAMBLE HOLE" : "PLAY ALT-SHOT HOLE")),
        h(WheelModePicker, { compact: true })),
      shotLog.length > 0 && h("div", { className: "rounded-xl p-2 mb-3 text-left", style: { background: "rgba(0,0,0,0.35)", maxHeight: 220, overflow: "auto" } },
        h("div", { className: "text-[11px] mb-1", style: { color: C.gold } }, "SHOT LOG"),
        shotLog.map((line, li) => h("div", { key: li, className: "text-xs py-0.5", style: { color: line.lie === "note" ? C.muted : C.chalk } }, line.text))),
      h("div", { className: "rounded-xl p-2", style: { background: C.panel } },
        h("div", { className: "text-[11px] mb-1", style: { color: C.muted } }, "Scorecard"),
        holeLog.map((x) => h("div", { key: x.n, className: "flex justify-between text-xs py-0.5", style: { color: C.chalk } },
          h("span", null, "H" + x.n + " (par " + x.par + ")"),
          h("span", null, x.sa + "–" + x.sb)))));
  }

  // ---------- NINE BREAK ----------
  if (phase === "nineBreak" && st) {
    const fp = st.frontPts || { us: 0, them: 0 };
    return h(Shell, null,
      h(BackTop, { onClick: goHome, label: "Home" }),
      h("div", { className: "text-center mb-3" },
        h("div", { style: { fontFamily: FONT, fontSize: 12, letterSpacing: 3, color: C.gold } }, "TURN"),
        h("h2", { style: { fontFamily: FONT, fontSize: 28, color: C.chalk } }, "Front 9 done"),
        h("div", { style: { fontFamily: FONT, fontSize: 40, color: C.gold } }, fp.us + " – " + fp.them),
        h("p", { className: "text-sm", style: { color: C.muted } }, "of 8 scramble points")),
      h("p", { className: "text-sm mb-3 text-center", style: { color: C.chalk } }, "Pairs and matchups reshuffle for alternate shot."),
      fp.us === 8 && h("p", { className: "text-sm mb-2 text-center", style: { color: C.gold } }, "Perfect Nine unlocked if you hold the clean sheet."),
      h(Btn, { onClick: () => {
        persist({ ...st, nine: "back", playMatchIdx: 0, playHoleIdx: 0, phase: "play" }, "play");
        setPlay({ matchIdx: 0, holeIdx: 0, nine: "back", holes: [] });
      } }, "BACK 9 · ALTERNATE SHOT"));
  }

  // ---------- RESULTS ----------
  if (phase === "results" && st) {
    const fp = st.frontPts || { us: 0, them: 0 };
    const bp = st.backPts || { us: 0, them: 0 };
    const us = fp.us + bp.us, them = fp.them + bp.them;
    const won = us > them;
    const myTeam = st.teams[0];
    const hasDuke = myTeam.some((p) => /^Duke$/i.test(p.name) || /Duke/i.test(p.name));
    const lastPickWin = won && st.lastPickMeta && st.lastPickMeta.capIdx === 0;
    const lowCap = won && st.captains.every((c) => c.overall >= st.captains[0].overall);
    const comeback = won && fp.us < fp.them;
    const clean = (fp.us === 8) || (bp.us === 8);
    const bothJosh = myTeam.filter((p) => /Josh/i.test(p.name)).length >= 2;
    const eliteCombine = (st.player.overall || 0) >= 85;
    const want = [];
    if (won) want.push("inv_win");
    if (won && hasDuke) want.push("inv_duke");
    if (lastPickWin) want.push("inv_lastpick");
    if (lowCap) want.push("inv_lowcap");
    if (comeback) want.push("inv_comeback");
    if (clean) want.push("inv_clean9");
    if (bothJosh) want.push("inv_bothjosh");
    if (eliteCombine) want.push("inv_combine_elite");
    const news = invGrantAch(want);
    const newsBadges = INV_BADGES.filter((b) => news.includes(b.id));

    return h(Shell, null,
      h(BackTop, { onClick: goHome, label: "Home" }),
      h("div", { className: "text-center mb-3" },
        h("div", { style: { fontFamily: FONT, fontSize: 12, letterSpacing: 3, color: C.gold } }, "DAY 1 FINAL"),
        h("h2", { style: { fontFamily: FONT, fontSize: 32, color: won ? C.gold : C.chalk } }, won ? "YOU WIN" : us === them ? "TIED" : "DEFEAT"),
        h("div", { style: { fontFamily: FONT, fontSize: 48, color: C.gold } }, us + " – " + them),
        h("p", { className: "text-xs", style: { color: C.muted } }, "Front " + fp.us + "–" + fp.them + " · Back " + bp.us + "–" + bp.them)),
      newsBadges.length > 0 && h("div", { className: "p-3 rounded-xl mb-3", style: { background: "rgba(232,195,90,0.1)", border: "1px solid " + C.gold } },
        h("div", { style: { fontFamily: FONT, fontSize: 14, color: C.gold } }, "ACHIEVEMENTS UNLOCKED"),
        newsBadges.map((b) => h("div", { key: b.id, className: "text-sm mt-1", style: { color: C.chalk } }, "🏅 " + b.name + " — " + b.desc))),
      h("div", { className: "p-3 rounded-xl mb-3", style: { background: C.panel } },
        h("div", { style: { color: C.gold, fontFamily: FONT } }, "DAY 2"),
        h("p", { className: "text-sm mt-1", style: { color: C.chalk } }, won ? "You're through. Day 2 bracket is coming soon." : "Day 2 is for winners — re-run the Invitational and chase the W.")),
      h(Btn, { onClick: () => { invSave(null); setSt(null); setPhase("intro"); } }, "PLAY AGAIN"),
      h(Btn, { small: true, kind: "panel", onClick: goHome }, "BACK TO HOME"));
  }

  // fallback
  return h(Shell, null,
    h(BackTop, { onClick: goHome, label: "Home" }),
    h("p", { style: { color: C.chalk } }, "Loading Invitational…"),
    h(Btn, { onClick: () => setPhase("intro") }, "RESET"));
}

// expose
global.InternetInvitational = InternetInvitational;
global.INV_BADGES = INV_BADGES;
global.invAchLoad = invAchLoad;
global.INV_CHANNELS = CHANNELS;
global.INV_LAND_BANDS = LAND_BANDS;
global.invRosterRaw = INV_ROSTER_RAW;
global.calibrateAltPairs = calibrateAltPairs;
global.playAltHole = playAltHole;
global.makeAttrsAtOvr = makeAttrsAtOvr;
})(typeof window !== "undefined" ? window : globalThis);
