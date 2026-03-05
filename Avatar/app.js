// ══════════════════════════════════════════════════════════════════════════════
// PALETTES & OPTIONS
// ══════════════════════════════════════════════════════════════════════════════

const SKIN = [
  "#FDDBB4", "#FCCFA0", "#F5C08A", "#EDB17F", "#D4956A", "#C68454",
  "#B8754E", "#A66A42", "#8D5524", "#724A1E", "#5C3317", "#4A2810"
];

const HAIR = [
  "#0A0A0A", "#1A1A1A", "#2C1A0E", "#3D2817", "#5C3317", "#6F4E37",
  "#8B6914", "#A0826D", "#C68642", "#D4A574", "#E8C86D", "#F5E6C8",
  "#D44C4C", "#C41E3A", "#8B0000", "#FF6347", "#7B2FBE", "#9B59B6",
  "#6A0DAD", "#4B0082", "#1A6FA3", "#2E86AB", "#5DADE2", "#2E8B57"
];

const EYE = [
  "#2C1A0E", "#3D2817", "#4A90D9", "#2E86AB", "#4A7C59", "#2E8B57",
  "#8B6914", "#A0826D", "#C0392B", "#8B0000", "#6D4E8A", "#7B2FBE",
  "#1A5E8A", "#5DADE2", "#2E7D4F", "#808080"
];

const LIP = [
  "#D47070", "#E8A090", "#C04040", "#8B3A3A", "#F4B8C0", "#A0522D",
  "#CC6666", "#B85C5C", "#E07070", "#993333", "#FFB6C1", "#DB7093"
];

const BG = [
  "#1A2980", "#2C3E50", "#FF4D6D", "#00897B", "#E65100", "#4527A0",
  "#C62828", "#00695C", "#AD1457", "#1565C0", "#558B2F", "#6A1B9A",
  "#00838F", "#EF6C00", "#37474F", "#263238"
];

const HAIR_STYLES = {
  male: [
    {id:"short", l:"Short"},
    {id:"fade", l:"Fade"},
    {id:"curly", l:"Curly"},
    {id:"bald", l:"Bald"},
    {id:"mohawk", l:"Mohawk"},
    {id:"slick", l:"Slick Back"},
    {id:"spiky", l:"Spiky"},
    {id:"afro", l:"Afro"}
  ],
  female: [
    {id:"long", l:"Long"},
    {id:"ponytail", l:"Ponytail"},
    {id:"bun", l:"Bun"},
    {id:"curly", l:"Curly"},
    {id:"pixie", l:"Pixie"},
    {id:"wavy", l:"Wavy"},
    {id:"braids", l:"Braids"},
    {id:"bob", l:"Bob"}
  ]
};

const FACIAL_HAIR = {
  male: [
    {id:"none", l:"None"},
    {id:"stubble", l:"Stubble"},
    {id:"beard", l:"Full Beard"},
    {id:"goatee", l:"Goatee"},
    {id:"mustache", l:"Mustache"},
    {id:"vandyke", l:"Van Dyke"}
  ],
  female: [{id:"none", l:"None"}]
};

const FACE_SHAPES = [
  {id:"oval", l:"Oval"},
  {id:"round", l:"Round"},
  {id:"square", l:"Square"},
  {id:"heart", l:"Heart"},
  {id:"long", l:"Long"}
];

const EYEBROW_STYLES = [
  {id:"normal", l:"Normal"},
  {id:"thick", l:"Thick"},
  {id:"thin", l:"Thin"},
  {id:"arched", l:"Arched"},
  {id:"straight", l:"Straight"},
  {id:"angry", l:"Angry"}
];

const EYE_SHAPES = [
  {id:"normal", l:"Normal"},
  {id:"round", l:"Round"},
  {id:"almond", l:"Almond"},
  {id:"narrow", l:"Narrow"},
  {id:"wide", l:"Wide"}
];

const NOSE_STYLES = [
  {id:"normal", l:"Normal"},
  {id:"small", l:"Small"},
  {id:"wide", l:"Wide"},
  {id:"pointed", l:"Pointed"},
  {id:"round", l:"Round"}
];

const LIP_STYLES = [
  {id:"normal", l:"Normal"},
  {id:"thin", l:"Thin"},
  {id:"full", l:"Full"},
  {id:"smile", l:"Smile"},
  {id:"pout", l:"Pout"}
];

const ACCESSORIES = [
  {id:"none", l:"None"},
  {id:"glasses", l:"Glasses"},
  {id:"sunglasses", l:"Shades"},
  {id:"roundglasses", l:"Round Glasses"},
  {id:"headband", l:"Headband"},
  {id:"cap", l:"Cap"},
  {id:"beanie", l:"Beanie"},
  {id:"crown", l:"Crown"},
  {id:"earrings", l:"Earrings"},
  {id:"headphones", l:"Headphones"}
];

const OUTFITS = [
  {id:"casual", l:"Casual", color:"#4A90E2"},
  {id:"formal", l:"Formal", color:"#2C3E50"},
  {id:"sports", l:"Sports", color:"#E74C3C"},
  {id:"hoodie", l:"Hoodie", color:"#95A5A6"},
  {id:"tshirt", l:"T-Shirt", color:"#3498DB"},
  {id:"dress", l:"Dress", color:"#9B59B6"},
  {id:"suit", l:"Suit", color:"#1A1A1A"}
];

// ══════════════════════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

let avatar = {
  gender: "male",
  faceShape: "oval",
  skin: SKIN[0],
  hair: HAIR[0],
  hairStyle: "short",
  facialHair: "none",
  eyebrows: "normal",
  eyeShape: "normal",
  eye: EYE[2],
  nose: "normal",
  lipStyle: "normal",
  lip: LIP[0],
  bg: BG[0],
  accessory: "none",
  outfit: "casual",
  outfitColor: "#4A90E2"
};

let currentGender = "male";
let scanning = false;
let videoStream = null;
let detectionInterval = null;

// History for undo/redo
const history = {
  states: [],
  index: -1,
  maxSize: 50,
  
  push(state) {
    this.states = this.states.slice(0, this.index + 1);
    this.states.push(JSON.parse(JSON.stringify(state)));
    this.index++;
    if (this.states.length > this.maxSize) {
      this.states.shift();
      this.index--;
    }
    this.updateButtons();
  },
  
  undo() {
    if (this.index > 0) {
      this.index--;
      this.updateButtons();
      return JSON.parse(JSON.stringify(this.states[this.index]));
    }
    return null;
  },
  
  redo() {
    if (this.index < this.states.length - 1) {
      this.index++;
      this.updateButtons();
      return JSON.parse(JSON.stringify(this.states[this.index]));
    }
    return null;
  },
  
  updateButtons() {
    document.getElementById('btn-undo').disabled = this.index <= 0;
    document.getElementById('btn-redo').disabled = this.index >= this.states.length - 1;
  }
};

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/";

// ══════════════════════════════════════════════════════════════════════════════
// PRESETS
// ══════════════════════════════════════════════════════════════════════════════

const PRESETS = {
  male: [
    {name:"Alex", gender:"male", faceShape:"oval", skin:SKIN[0], hair:HAIR[0], hairStyle:"short", facialHair:"none", eyebrows:"normal", eyeShape:"normal", eye:EYE[2], nose:"normal", lipStyle:"normal", lip:LIP[0], bg:BG[0], accessory:"none", outfit:"casual", outfitColor:"#4A90E2"},
    {name:"Marcus", gender:"male", faceShape:"square", skin:SKIN[4], hair:HAIR[2], hairStyle:"fade", facialHair:"stubble", eyebrows:"thick", eyeShape:"almond", eye:EYE[0], nose:"wide", lipStyle:"normal", lip:LIP[5], bg:BG[3], accessory:"none", outfit:"formal", outfitColor:"#2C3E50"},
    {name:"Jake", gender:"male", faceShape:"round", skin:SKIN[2], hair:HAIR[10], hairStyle:"curly", facialHair:"beard", eyebrows:"normal", eyeShape:"round", eye:EYE[4], nose:"normal", lipStyle:"smile", lip:LIP[1], bg:BG[4], accessory:"glasses", outfit:"hoodie", outfitColor:"#95A5A6"},
    {name:"Tyler", gender:"male", faceShape:"oval", skin:SKIN[8], hair:HAIR[0], hairStyle:"bald", facialHair:"goatee", eyebrows:"thick", eyeShape:"narrow", eye:EYE[0], nose:"pointed", lipStyle:"normal", lip:LIP[5], bg:BG[5], accessory:"sunglasses", outfit:"sports", outfitColor:"#E74C3C"},
    {name:"Ryan", gender:"male", faceShape:"heart", skin:SKIN[1], hair:HAIR[12], hairStyle:"mohawk", facialHair:"none", eyebrows:"angry", eyeShape:"normal", eye:EYE[8], nose:"small", lipStyle:"normal", lip:LIP[2], bg:BG[2], accessory:"headphones", outfit:"tshirt", outfitColor:"#3498DB"},
    {name:"Chris", gender:"male", faceShape:"long", skin:SKIN[6], hair:HAIR[8], hairStyle:"slick", facialHair:"mustache", eyebrows:"arched", eyeShape:"almond", eye:EYE[6], nose:"normal", lipStyle:"thin", lip:LIP[3], bg:BG[9], accessory:"none", outfit:"suit", outfitColor:"#1A1A1A"}
  ],
  female: [
    {name:"Emma", gender:"female", faceShape:"heart", skin:SKIN[0], hair:HAIR[12], hairStyle:"long", facialHair:"none", eyebrows:"arched", eyeShape:"almond", eye:EYE[4], nose:"small", lipStyle:"full", lip:LIP[2], bg:BG[2], accessory:"earrings", outfit:"dress", outfitColor:"#9B59B6"},
    {name:"Sophia", gender:"female", faceShape:"oval", skin:SKIN[2], hair:HAIR[0], hairStyle:"ponytail", facialHair:"none", eyebrows:"normal", eyeShape:"round", eye:EYE[2], nose:"normal", lipStyle:"smile", lip:LIP[0], bg:BG[8], accessory:"headband", outfit:"casual", outfitColor:"#4A90E2"},
    {name:"Mia", gender:"female", faceShape:"round", skin:SKIN[4], hair:HAIR[6], hairStyle:"bun", facialHair:"none", eyebrows:"thin", eyeShape:"wide", eye:EYE[6], nose:"round", lipStyle:"pout", lip:LIP[4], bg:BG[5], accessory:"glasses", outfit:"formal", outfitColor:"#2C3E50"},
    {name:"Zara", gender:"female", faceShape:"oval", skin:SKIN[8], hair:HAIR[16], hairStyle:"curly", facialHair:"none", eyebrows:"thick", eyeShape:"normal", eye:EYE[0], nose:"wide", lipStyle:"full", lip:LIP[5], bg:BG[6], accessory:"crown", outfit:"dress", outfitColor:"#E74C3C"},
    {name:"Luna", gender:"female", faceShape:"heart", skin:SKIN[1], hair:HAIR[20], hairStyle:"pixie", facialHair:"none", eyebrows:"straight", eyeShape:"almond", eye:EYE[12], nose:"pointed", lipStyle:"thin", lip:LIP[1], bg:BG[10], accessory:"none", outfit:"hoodie", outfitColor:"#95A5A6"},
    {name:"Aria", gender:"female", faceShape:"long", skin:SKIN[3], hair:HAIR[10], hairStyle:"wavy", facialHair:"none", eyebrows:"arched", eyeShape:"narrow", eye:EYE[3], nose:"normal", lipStyle:"normal", lip:LIP[0], bg:BG[1], accessory:"sunglasses", outfit:"tshirt", outfitColor:"#3498DB"}
  ]
};

// ══════════════════════════════════════════════════════════════════════════════
// SVG AVATAR BUILDER
// ══════════════════════════════════════════════════════════════════════════════

function buildAvatarSVG(cfg, size = 160) {
  const {gender, faceShape, skin, hair, hairStyle, facialHair, eyebrows, eyeShape, eye, nose, lipStyle, lip, bg, accessory, outfit, outfitColor} = cfg;

  function getFaceShape() {
    switch(faceShape) {
      case "round": return `<ellipse cx="80" cy="90" rx="38" ry="38" fill="${skin}"/>`;
      case "square": return `<rect x="44" y="52" width="72" height="76" rx="16" fill="${skin}"/>`;
      case "heart": return `<path d="M80 130 Q44 110 44 80 Q44 50 80 50 Q116 50 116 80 Q116 110 80 130" fill="${skin}"/>`;
      case "long": return `<ellipse cx="80" cy="90" rx="34" ry="44" fill="${skin}"/>`;
      default: return `<ellipse cx="80" cy="88" rx="36" ry="40" fill="${skin}"/>`;
    }
  }

  function getHairStyle() {
    if (hairStyle === "bald") return "";
    if (gender === "male") {
      switch(hairStyle) {
        case "short":
          return `<ellipse cx="80" cy="56" rx="38" ry="22" fill="${hair}"/>`;
        case "fade":
          return `<ellipse cx="80" cy="58" rx="38" ry="20" fill="${hair}"/>
                  <rect x="42" y="66" width="10" height="28" fill="${hair}" rx="5"/>
                  <rect x="108" y="66" width="10" height="28" fill="${hair}" rx="5"/>`;
        case "curly":
          return [48,58,68,78,88,98,108].map((x,i)=>`<circle cx="${x}" cy="${48+i%2*8}" r="14" fill="${hair}"/>`).join("");
        case "mohawk":
          return `<ellipse cx="80" cy="58" rx="36" ry="18" fill="${hair}"/>
                  <rect x="72" y="18" width="16" height="45" fill="${hair}" rx="8"/>`;
        case "slick":
          return `<ellipse cx="80" cy="54" rx="40" ry="22" fill="${hair}"/>
                  <path d="M40 62 Q60 46 80 48 Q100 46 120 62" fill="${hair}"/>`;
        case "spiky":
          return `<ellipse cx="80" cy="58" rx="36" ry="18" fill="${hair}"/>
                  ${[55,65,75,85,95,105].map(x=>`<polygon points="${x},60 ${x+5},30 ${x+10},60" fill="${hair}"/>`).join("")}`;
        case "afro":
          return `<circle cx="80" cy="55" r="45" fill="${hair}"/>`;
        default:
          return `<ellipse cx="80" cy="56" rx="38" ry="22" fill="${hair}"/>`;
      }
    } else {
      switch(hairStyle) {
        case "long":
          return `<ellipse cx="80" cy="54" rx="42" ry="26" fill="${hair}"/>
                  <rect x="38" y="68" width="18" height="70" fill="${hair}" rx="9"/>
                  <rect x="104" y="68" width="18" height="70" fill="${hair}" rx="9"/>`;
        case "ponytail":
          return `<ellipse cx="80" cy="54" rx="40" ry="24" fill="${hair}"/>
                  <ellipse cx="80" cy="38" rx="12" ry="42" fill="${hair}"/>
                  <circle cx="80" cy="80" r="6" fill="#333"/>`;
        case "bun":
          return `<ellipse cx="80" cy="60" rx="40" ry="22" fill="${hair}"/>
                  <circle cx="80" cy="32" r="20" fill="${hair}"/>`;
        case "curly":
          return [45,56,67,78,89,100,111].map((x,i)=>`<circle cx="${x}" cy="${48+i%2*9}" r="15" fill="${hair}"/>`).join("")+
                 `<rect x="38" y="66" width="15" height="65" fill="${hair}" rx="7"/>
                  <rect x="107" y="66" width="15" height="65" fill="${hair}" rx="7"/>`;
        case "pixie":
          return `<ellipse cx="80" cy="52" rx="38" ry="20" fill="${hair}"/>`;
        case "wavy":
          return `<ellipse cx="80" cy="54" rx="42" ry="26" fill="${hair}"/>
                  <path d="M38 72 Q46 84 38 96 Q46 108 38 120 Q46 132 40 140" stroke="${hair}" stroke-width="16" fill="none" stroke-linecap="round"/>
                  <path d="M122 72 Q114 84 122 96 Q114 108 122 120 Q114 132 120 140" stroke="${hair}" stroke-width="16" fill="none" stroke-linecap="round"/>`;
        case "braids":
          return `<ellipse cx="80" cy="54" rx="40" ry="24" fill="${hair}"/>
                  <rect x="38" y="65" width="12" height="75" fill="${hair}" rx="6"/>
                  <rect x="110" y="65" width="12" height="75" fill="${hair}" rx="6"/>
                  ${[70,80,90,100,110,120].map(y=>`<line x1="38" y1="${y}" x2="50" y2="${y}" stroke="${hair}" stroke-width="2" opacity="0.5"/>`).join("")}
                  ${[70,80,90,100,110,120].map(y=>`<line x1="110" y1="${y}" x2="122" y2="${y}" stroke="${hair}" stroke-width="2" opacity="0.5"/>`).join("")}`;
        case "bob":
          return `<ellipse cx="80" cy="54" rx="44" ry="26" fill="${hair}"/>
                  <rect x="36" y="65" width="88" height="35" fill="${hair}" rx="15"/>`;
        default:
          return `<ellipse cx="80" cy="54" rx="40" ry="24" fill="${hair}"/>`;
      }
    }
  }

  function getEyebrows() {
    const browColor = hair === "#F5E6C8" || hair === "#E8C86D" ? "#8B6914" : "#3D2010";
    switch(eyebrows) {
      case "thick":
        return `<path d="M56 76 Q64 70 76 76" stroke="${browColor}" stroke-width="4" fill="none" stroke-linecap="round"/>
                <path d="M84 76 Q96 70 104 76" stroke="${browColor}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      case "thin":
        return `<path d="M58 78 Q66 74 74 78" stroke="${browColor}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                <path d="M86 78 Q94 74 102 78" stroke="${browColor}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
      case "arched":
        return `<path d="M56 80 Q66 70 76 78" stroke="${browColor}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <path d="M84 78 Q94 70 104 80" stroke="${browColor}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
      case "straight":
        return `<line x1="56" y1="78" x2="76" y2="78" stroke="${browColor}" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="84" y1="78" x2="104" y2="78" stroke="${browColor}" stroke-width="2.5" stroke-linecap="round"/>`;
      case "angry":
        return `<path d="M56 82 Q66 76 76 78" stroke="${browColor}" stroke-width="3" fill="none" stroke-linecap="round"/>
                <path d="M84 78 Q94 76 104 82" stroke="${browColor}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      default:
        return `<path d="M58 78 Q66 73 74 78" stroke="${browColor}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <path d="M86 78 Q94 73 102 78" stroke="${browColor}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    }
  }

  function getEyes() {
    let eyeWhite, pupil, highlight;
    switch(eyeShape) {
      case "round":
        eyeWhite = `<circle cx="66" cy="90" r="9" fill="white"/><circle cx="94" cy="90" r="9" fill="white"/>`;
        pupil = `<circle cx="66" cy="91" r="5" fill="${eye}"/><circle cx="94" cy="91" r="5" fill="${eye}"/>`;
        break;
      case "almond":
        eyeWhite = `<ellipse cx="66" cy="90" rx="10" ry="6" fill="white"/><ellipse cx="94" cy="90" rx="10" ry="6" fill="white"/>`;
        pupil = `<circle cx="66" cy="90" r="4" fill="${eye}"/><circle cx="94" cy="90" r="4" fill="${eye}"/>`;
        break;
      case "narrow":
        eyeWhite = `<ellipse cx="66" cy="90" rx="9" ry="5" fill="white"/><ellipse cx="94" cy="90" rx="9" ry="5" fill="white"/>`;
        pupil = `<circle cx="66" cy="90" r="3.5" fill="${eye}"/><circle cx="94" cy="90" r="3.5" fill="${eye}"/>`;
        break;
      case "wide":
        eyeWhite = `<ellipse cx="66" cy="90" rx="11" ry="9" fill="white"/><ellipse cx="94" cy="90" rx="11" ry="9" fill="white"/>`;
        pupil = `<circle cx="66" cy="91" r="5.5" fill="${eye}"/><circle cx="94" cy="91" r="5.5" fill="${eye}"/>`;
        break;
      default:
        eyeWhite = `<ellipse cx="66" cy="90" rx="9" ry="8" fill="white"/><ellipse cx="94" cy="90" rx="9" ry="8" fill="white"/>`;
        pupil = `<circle cx="66" cy="91" r="5" fill="${eye}"/><circle cx="94" cy="91" r="5" fill="${eye}"/>`;
    }
    highlight = `<circle cx="68" cy="88" r="2" fill="white"/><circle cx="96" cy="88" r="2" fill="white"/>`;
    return eyeWhite + pupil + highlight;
  }

  function getNose() {
    switch(nose) {
      case "small":
        return `<path d="M78 100 Q80 103 82 100" stroke="#a06030" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
      case "wide":
        return `<path d="M74 100 Q80 108 86 100" stroke="#a06030" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      case "pointed":
        return `<path d="M78 98 L80 105 L82 98" stroke="#a06030" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      case "round":
        return `<circle cx="80" cy="102" r="4" fill="none" stroke="#a06030" stroke-width="1.5"/>`;
      default:
        return `<path d="M77 100 Q80 106 83 100" stroke="#a06030" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
    }
  }

  function getLips() {
    switch(lipStyle) {
      case "thin":
        return `<path d="M68 115 Q80 118 92 115" fill="${lip}" stroke="${lip}" stroke-width="2" stroke-linecap="round"/>`;
      case "full":
        return `<path d="M65 115 Q75 120 80 118 Q85 120 95 115 Q85 124 80 122 Q75 124 65 115" fill="${lip}"/>`;
      case "smile":
        return `<path d="M65 113 Q80 125 95 113" fill="none" stroke="${lip}" stroke-width="3" stroke-linecap="round"/>
                <path d="M65 113 Q80 118 95 113" fill="${lip}"/>`;
      case "pout":
        return `<ellipse cx="80" cy="116" rx="12" ry="6" fill="${lip}"/>
                <path d="M68 115 Q80 112 92 115" fill="none" stroke="${lip}" stroke-width="1"/>`;
      default:
        return `<path d="M66 115 Q73 120 80 118 Q87 120 94 115" fill="${lip}"/>
                <path d="M66 115 Q80 111 94 115" fill="${lip}" opacity="0.8"/>`;
    }
  }

  function getFacialHair() {
    if (!facialHair || facialHair === "none" || gender === "female") return "";
    const hairDark = hair === "#F5E6C8" || hair === "#E8C86D" ? "#8B6914" : hair;
    switch(facialHair) {
      case "stubble":
        return `<ellipse cx="80" cy="118" rx="26" ry="14" fill="${hairDark}" opacity="0.25"/>`;
      case "beard":
        return `<path d="M52 105 Q52 135 70 138 Q80 142 90 138 Q108 135 108 105" fill="${hairDark}" opacity="0.9"/>`;
      case "goatee":
        return `<path d="M72 115 Q80 120 88 115 L88 128 Q80 134 72 128 Z" fill="${hairDark}"/>`;
      case "mustache":
        return `<path d="M64 108 Q72 114 80 110 Q88 114 96 108" stroke="${hairDark}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      case "vandyke":
        return `<path d="M64 108 Q72 114 80 110 Q88 114 96 108" stroke="${hairDark}" stroke-width="4" fill="none" stroke-linecap="round"/>
                <path d="M74 116 Q80 120 86 116 L84 130 Q80 134 76 130 Z" fill="${hairDark}"/>`;
      default:
        return "";
    }
  }

  function getAccessory() {
    if (!accessory || accessory === "none") return "";
    switch(accessory) {
      case "glasses":
        return `<circle cx="66" cy="90" r="12" fill="none" stroke="#444" stroke-width="2.5"/>
                <circle cx="94" cy="90" r="12" fill="none" stroke="#444" stroke-width="2.5"/>
                <line x1="78" y1="90" x2="82" y2="90" stroke="#444" stroke-width="2"/>
                <line x1="54" y1="88" x2="42" y2="85" stroke="#444" stroke-width="2"/>
                <line x1="106" y1="88" x2="118" y2="85" stroke="#444" stroke-width="2"/>`;
      case "roundglasses":
        return `<circle cx="66" cy="90" r="14" fill="none" stroke="#8B4513" stroke-width="3"/>
                <circle cx="94" cy="90" r="14" fill="none" stroke="#8B4513" stroke-width="3"/>
                <line x1="80" y1="90" x2="80" y2="90" stroke="#8B4513" stroke-width="3"/>
                <path d="M52 88 L40 84" stroke="#8B4513" stroke-width="2"/>
                <path d="M108 88 L120 84" stroke="#8B4513" stroke-width="2"/>`;
      case "sunglasses":
        return `<rect x="52" y="82" width="28" height="16" rx="6" fill="#111" opacity=".95"/>
                <rect x="80" y="82" width="28" height="16" rx="6" fill="#111" opacity=".95"/>
                <line x1="80" y1="90" x2="80" y2="90" stroke="#333" stroke-width="2"/>
                <line x1="42" y1="87" x2="52" y2="88" stroke="#333" stroke-width="2"/>
                <line x1="108" y1="88" x2="118" y2="87" stroke="#333" stroke-width="2"/>`;
      case "headband":
        return `<rect x="38" y="62" width="84" height="12" rx="6" fill="${outfitColor}" opacity=".9"/>`;
      case "cap":
        return `<ellipse cx="80" cy="60" rx="44" ry="14" fill="${outfitColor}"/>
                <ellipse cx="80" cy="50" rx="34" ry="20" fill="${outfitColor}"/>
                <ellipse cx="52" cy="62" rx="20" ry="6" fill="${outfitColor}" opacity=".8"/>`;
      case "beanie":
        return `<ellipse cx="80" cy="52" rx="42" ry="28" fill="${outfitColor}"/>
                <rect x="38" y="64" width="84" height="10" fill="${outfitColor}" opacity=".8"/>
                <circle cx="80" cy="26" r="6" fill="${outfitColor}"/>`;
      case "crown":
        return `<polygon points="46,66 54,42 66,56 80,36 94,56 106,42 114,66" fill="#F6A623" stroke="#D4871A" stroke-width="2"/>
                <circle cx="54" cy="44" r="4" fill="#E74C3C"/>
                <circle cx="80" cy="38" r="5" fill="#3498DB"/>
                <circle cx="106" cy="44" r="4" fill="#2ECC71"/>`;
      case "earrings":
        return `<circle cx="42" cy="95" r="5" fill="#F6A623" stroke="#D4871A"/>
                <circle cx="118" cy="95" r="5" fill="#F6A623" stroke="#D4871A"/>`;
      case "headphones":
        return `<path d="M38 85 Q38 55 80 55 Q122 55 122 85" stroke="#333" stroke-width="6" fill="none"/>
                <rect x="32" y="80" width="14" height="25" rx="7" fill="#333"/>
                <rect x="114" y="80" width="14" height="25" rx="7" fill="#333"/>
                <rect x="34" y="85" width="10" height="15" rx="4" fill="#666"/>
                <rect x="116" y="85" width="10" height="15" rx="4" fill="#666"/>`;
      default:
        return "";
    }
  }

  function getOutfit() {
    const color = outfitColor || "#4A90E2";
    switch(outfit) {
      case "formal":
        return `<ellipse cx="80" cy="162" rx="48" ry="22" fill="#2C3E50"/>
                <rect x="68" y="120" width="24" height="35" fill="${skin}" rx="8"/>
                <path d="M55 145 L45 162 L60 162 Z" fill="#fff"/>
                <path d="M105 145 L115 162 L100 162 Z" fill="#fff"/>
                <rect x="55" y="148" width="50" height="20" fill="#2C3E50"/>
                <rect x="78" y="148" width="4" height="12" fill="#C0392B"/>`;
      case "sports":
        return `<ellipse cx="80" cy="162" rx="48" ry="22" fill="${color}"/>
                <rect x="68" y="120" width="24" height="35" fill="${skin}" rx="8"/>
                <path d="M48 155 Q80 140 112 155 L112 162 L48 162 Z" fill="${color}"/>
                <line x1="80" y1="145" x2="80" y2="162" stroke="#fff" stroke-width="3"/>
                <line x1="60" y1="155" x2="100" y2="155" stroke="#fff" stroke-width="2"/>`;
      case "hoodie":
        return `<ellipse cx="80" cy="162" rx="48" ry="22" fill="${color}"/>
                <rect x="68" y="120" width="24" height="30" fill="${skin}" rx="8"/>
                <path d="M50 145 Q80 135 110 145 L115 162 L45 162 Z" fill="${color}"/>
                <ellipse cx="80" cy="145" rx="15" ry="8" fill="${color}"/>
                <ellipse cx="80" cy="145" rx="10" ry="5" fill="${skin}"/>
                <rect x="72" y="155" width="16" height="10" rx="4" fill="${color}" opacity="0.8"/>`;
      case "tshirt":
        return `<ellipse cx="80" cy="162" rx="48" ry="22" fill="${color}"/>
                <rect x="68" y="120" width="24" height="30" fill="${skin}" rx="8"/>
                <path d="M50 150 Q80 140 110 150 L110 162 L50 162 Z" fill="${color}"/>
                <ellipse cx="80" cy="148" rx="12" ry="6" fill="${skin}"/>`;
      case "dress":
        return `<path d="M55 145 Q40 162 35 180 L125 180 Q120 162 105 145 Q80 135 55 145" fill="${color}"/>
                <rect x="68" y="120" width="24" height="28" fill="${skin}" rx="8"/>
                <path d="M60 145 Q80 138 100 145" fill="${color}"/>`;
      case "suit":
        return `<ellipse cx="80" cy="162" rx="50" ry="24" fill="#1A1A1A"/>
                <rect x="68" y="120" width="24" height="32" fill="#fff" rx="8"/>
                <path d="M52 145 L42 168 L56 168 Z" fill="#1A1A1A"/>
                <path d="M108 145 L118 168 L104 168 Z" fill="#1A1A1A"/>
                <rect x="55" y="148" width="50" height="22" fill="#1A1A1A"/>
                <line x1="80" y1="148" x2="80" y2="168" stroke="#333" stroke-width="1"/>
                <rect x="78" y="150" width="4" height="8" fill="#8B0000"/>
                <circle cx="80" cy="162" r="2" fill="#F6A623"/>`;
      default:
        return `<ellipse cx="80" cy="162" rx="48" ry="22" fill="${color}"/>
                <rect x="68" y="120" width="24" height="30" fill="${skin}" rx="8"/>
                <path d="M48 148 Q80 140 112 148 L112 162 L48 162 Z" fill="${color}"/>
                <ellipse cx="80" cy="146" rx="10" ry="5" fill="${skin}"/>`;
    }
  }

  function getEars() {
    return `<ellipse cx="42" cy="90" rx="7" ry="10" fill="${skin}"/>
            <ellipse cx="118" cy="90" rx="7" ry="10" fill="${skin}"/>`;
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="avatar-clip">
        <circle cx="80" cy="80" r="80"/>
      </clipPath>
    </defs>
    <g clip-path="url(#avatar-clip)">
      <circle cx="80" cy="80" r="80" fill="${bg}"/>
      ${getOutfit()}
      ${getEars()}
      ${getFaceShape()}
      ${getHairStyle()}
      ${getEyebrows()}
      ${getEyes()}
      ${getNose()}
      ${getLips()}
      ${getFacialHair()}
      ${getAccessory()}
    </g>
  </svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// UI FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

function updateAllPreviews() {
  const svgContent = buildAvatarSVG(avatar, 180);
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const inner = doc.documentElement.innerHTML;
  ["preview-svg", "preview-svg-scan", "preview-svg-edit"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = inner;
  });
}

function animatePreview() {
  document.querySelectorAll('.preview-box').forEach(box => {
    box.classList.add('animating');
    setTimeout(() => box.classList.remove('animating'), 500);
  });
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`.tab:nth-child(${tab === 'choose' ? 1 : tab === 'scan' ? 2 : 3})`).classList.add('active');
  document.getElementById(`panel-${tab}`).classList.add('active');
  if (tab === 'scan') initCamera();
  else stopCamera();
  if (tab === 'edit') buildEditControls();
}

function buildPresetGrid() {
  const grid = document.getElementById("preset-grid");
  grid.innerHTML = "";
  PRESETS[currentGender].forEach((p) => {
    const svg = buildAvatarSVG(p, 80);
    const isSelected = JSON.stringify(avatar) === JSON.stringify({...p});
    const div = document.createElement("div");
    div.className = "preset-card" + (isSelected ? " selected" : "");
    div.innerHTML = `${svg}<div class="preset-name">${p.name}</div>${isSelected ? '<div class="selected-badge">✓ ACTIVE</div>' : ''}`;
    div.onclick = () => {
      avatar = {...p};
      saveToHistory();
      buildPresetGrid();
      updateAllPreviews();
      buildEditControls();
    };
    grid.appendChild(div);
  });
  buildMiniPresets();
}

function buildMiniPresets() {
  const row = document.getElementById("mini-presets-row");
  if (!row) return;
  row.innerHTML = "";
  PRESETS[currentGender].forEach((p) => {
    const btn = document.createElement("button");
    const isSelected = JSON.stringify(avatar) === JSON.stringify({...p});
    btn.className = "mini-card" + (isSelected ? " selected" : "");
    btn.innerHTML = buildAvatarSVG(p, 40);
    btn.onclick = () => {
      avatar = {...p};
      saveToHistory();
      updateAllPreviews();
      buildEditControls();
      buildPresetGrid();
    };
    row.appendChild(btn);
  });
}

function setGender(g) {
  currentGender = g;
  avatar.gender = g;
  avatar.hairStyle = g === "male" ? "short" : "long";
  avatar.facialHair = "none";
  document.getElementById("gbtn-male").classList.toggle("active", g === "male");
  document.getElementById("gbtn-female").classList.toggle("active", g === "female");
  saveToHistory();
  buildPresetGrid();
  updateAllPreviews();
}

function editGender(g) {
  avatar.gender = g;
  currentGender = g;
  avatar.hairStyle = g === "male" ? "short" : "long";
  avatar.facialHair = "none";
  document.getElementById("ebtn-male").classList.toggle("active", g === "male");
  document.getElementById("ebtn-female").classList.toggle("active", g === "female");
  saveToHistory();
  buildEditControls();
  updateAllPreviews();
  buildPresetGrid();
}

// ══════════════════════════════════════════════════════════════════════════════
// EDIT CONTROLS
// ══════════════════════════════════════════════════════════════════════════════

function makeSwatch(containerId, palette, avatarKey, labels = null) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = "";
  palette.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.className = "swatch" + (avatar[avatarKey] === c ? " selected" : "");
    btn.style.background = c;
    btn.title = labels ? labels[i] : c;
    btn.onclick = () => {
      avatar[avatarKey] = c;
      saveToHistory();
      buildEditControls();
      updateAllPreviews();
    };
    el.appendChild(btn);
  });
  const picker = document.createElement("div");
  picker.className = "color-picker-wrap";
  picker.innerHTML = `<button class="custom-color-btn" title="Custom color">+</button><input type="color" class="color-picker-input" value="${avatar[avatarKey]}">`;
  picker.querySelector('.custom-color-btn').onclick = () => picker.querySelector('.color-picker-input').click();
  picker.querySelector('.color-picker-input').onchange = (e) => {
    avatar[avatarKey] = e.target.value;
    saveToHistory();
    buildEditControls();
    updateAllPreviews();
  };
  el.appendChild(picker);
}

function makePills(containerId, options, avatarKey) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = "";
  options.forEach(o => {
    const btn = document.createElement("button");
    btn.className = "pill" + (avatar[avatarKey] === o.id ? " selected" : "");
    btn.textContent = o.l;
    btn.onclick = () => {
      avatar[avatarKey] = o.id;
      if (o.color) avatar.outfitColor = o.color;
      saveToHistory();
      buildEditControls();
      updateAllPreviews();
    };
    el.appendChild(btn);
  });
}

function buildEditControls() {
  document.getElementById("ebtn-male").classList.toggle("active", avatar.gender === "male");
  document.getElementById("ebtn-female").classList.toggle("active", avatar.gender === "female");
  makePills("edit-faceshape", FACE_SHAPES, "faceShape");
  makeSwatch("edit-skin", SKIN, "skin");
  makePills("edit-hairstyle", HAIR_STYLES[avatar.gender], "hairStyle");
  makeSwatch("edit-hair", HAIR, "hair");
  const facialHairSection = document.getElementById("facial-hair-section");
  if (facialHairSection) facialHairSection.style.display = avatar.gender === "male" ? "block" : "none";
  makePills("edit-facialhair", FACIAL_HAIR[avatar.gender], "facialHair");
  makePills("edit-eyebrows", EYEBROW_STYLES, "eyebrows");
  makePills("edit-eyeshape", EYE_SHAPES, "eyeShape");
  makeSwatch("edit-eye", EYE, "eye");
  makePills("edit-nose", NOSE_STYLES, "nose");
  makePills("edit-lipstyle", LIP_STYLES, "lipStyle");
  makeSwatch("edit-lip", LIP, "lip");
  makePills("edit-accessory", ACCESSORIES, "accessory");
  makePills("edit-outfit", OUTFITS, "outfit");
  makeSwatch("edit-bg", BG, "bg");
  buildMiniPresets();
}

function resetToDefault() {
  avatar = {
    gender: "male", faceShape: "oval", skin: SKIN[0], hair: HAIR[0],
    hairStyle: "short", facialHair: "none", eyebrows: "normal", eyeShape: "normal",
    eye: EYE[2], nose: "normal", lipStyle: "normal", lip: LIP[0],
    bg: BG[0], accessory: "none", outfit: "casual", outfitColor: "#4A90E2"
  };
  currentGender = "male";
  saveToHistory();
  buildEditControls();
  updateAllPreviews();
  buildPresetGrid();
  showToast("↺ Reset to default", "info");
}

function randomizeAvatar() {
  const randomFrom = arr => arr[Math.floor(Math.random() * arr.length)];
  avatar.gender = Math.random() > 0.5 ? "male" : "female";
  currentGender = avatar.gender;
  avatar.faceShape = randomFrom(FACE_SHAPES).id;
  avatar.skin = randomFrom(SKIN);
  avatar.hair = randomFrom(HAIR);
  avatar.hairStyle = randomFrom(HAIR_STYLES[avatar.gender]).id;
  avatar.facialHair = avatar.gender === "male" ? randomFrom(FACIAL_HAIR.male).id : "none";
  avatar.eyebrows = randomFrom(EYEBROW_STYLES).id;
  avatar.eyeShape = randomFrom(EYE_SHAPES).id;
  avatar.eye = randomFrom(EYE);
  avatar.nose = randomFrom(NOSE_STYLES).id;
  avatar.lipStyle = randomFrom(LIP_STYLES).id;
  avatar.lip = randomFrom(LIP);
  avatar.bg = randomFrom(BG);
  avatar.accessory = randomFrom(ACCESSORIES).id;
  const outfitChoice = randomFrom(OUTFITS);
  avatar.outfit = outfitChoice.id;
  avatar.outfitColor = outfitChoice.color;
  saveToHistory();
  buildEditControls();
  updateAllPreviews();
  buildPresetGrid();
  showToast("🎲 Randomized!", "info");
}

// ══════════════════════════════════════════════════════════════════════════════
// HISTORY (UNDO/REDO)
// ══════════════════════════════════════════════════════════════════════════════

function saveToHistory() { history.push(avatar); }

function undo() {
  const state = history.undo();
  if (state) {
    avatar = state;
    currentGender = avatar.gender;
    buildEditControls();
    updateAllPreviews();
    buildPresetGrid();
    showToast("↶ Undo", "info");
  }
}

function redo() {
  const state = history.redo();
  if (state) {
    avatar = state;
    currentGender = avatar.gender;
    buildEditControls();
    updateAllPreviews();
    buildPresetGrid();
    showToast("↷ Redo", "info");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SAVE & EXPORT
// ══════════════════════════════════════════════════════════════════════════════

function saveAvatar() {
  localStorage.setItem('edtech-avatar', JSON.stringify(avatar));
  const buttons = document.querySelectorAll('.save-btn');
  buttons.forEach(btn => {
    btn.classList.add('saved');
    btn.textContent = '✓ Saved!';
    setTimeout(() => { btn.classList.remove('saved'); btn.textContent = '💾 Save Avatar'; }, 2000);
  });
  showToast("✓ Avatar saved to browser!");
}

function toggleExportMenu() {
  const menu = document.getElementById('export-menu');
  menu.classList.toggle('show');
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!e.target.closest('.export-dropdown')) {
        menu.classList.remove('show');
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 10);
}

async function exportAs(format) {
  const svg = buildAvatarSVG(avatar, 512);
  switch(format) {
    case 'svg':
      downloadFile(new Blob([svg], {type: 'image/svg+xml'}), 'avatar.svg');
      showToast("📄 SVG downloaded!");
      break;
    case 'png':
      try {
        const pngBlob = await convertSVGtoPNG(svg, 512);
        downloadFile(pngBlob, 'avatar.png');
        showToast("🖼️ PNG downloaded!");
      } catch(e) { showToast("❌ PNG export failed", "error"); }
      break;
    case 'json':
      downloadFile(new Blob([JSON.stringify(avatar, null, 2)], {type: 'application/json'}), 'avatar-data.json');
      showToast("📋 Data exported!");
      break;
  }
  document.getElementById('export-menu').classList.remove('show');
}

async function convertSVGtoPNG(svgString, size) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob(blob => { if (blob) resolve(blob); else reject(new Error('Failed')); }, 'image/png');
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'}));
  });
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function copyAvatarLink() {
  const data = btoa(JSON.stringify(avatar));
  const url = window.location.href.split('?')[0] + '?avatar=' + data;
  navigator.clipboard.writeText(url).then(() => showToast("🔗 Link copied!")).catch(() => showToast("❌ Failed to copy", "error"));
}

async function shareAvatar() {
  if (navigator.share) {
    try {
      const svg = buildAvatarSVG(avatar, 512);
      const pngBlob = await convertSVGtoPNG(svg, 512);
      const file = new File([pngBlob], 'my-avatar.png', {type: 'image/png'});
      await navigator.share({ files: [file], title: 'My Custom Avatar', text: 'Check out my custom avatar!' });
      showToast("📤 Shared!");
    } catch(e) { if (e.name !== 'AbortError') copyAvatarLink(); }
  } else { copyAvatarLink(); }
}

// ══════════════════════════════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════════════════════════════

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'show' + (type !== 'success' ? ' ' + type : '');
  setTimeout(() => { toast.className = ''; }, 3000);
}

// ══════════════════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ══════════════════════════════════════════════════════════════════════════════

function toggleShortcuts() { document.getElementById('shortcuts-hint').classList.toggle('show'); }

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveAvatar(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') { e.preventDefault(); resetToDefault(); }
  if (e.key === 'r' && !e.ctrlKey && !e.metaKey) randomizeAvatar();
  if (e.key === 'Escape') {
    document.getElementById('shortcuts-hint').classList.remove('show');
    document.getElementById('export-menu').classList.remove('show');
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// FACE SCANNING
// ══════════════════════════════════════════════════════════════════════════════

async function loadModels() {
  const overlay = document.getElementById('model-overlay');
  const status = document.getElementById('model-status');
  const progress = document.getElementById('model-prog-fill');
  try {
    status.textContent = 'Loading TinyFaceDetector...'; progress.style.width = '20%';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    status.textContent = 'Loading Face Landmarks...'; progress.style.width = '40%';
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    status.textContent = 'Loading Face Recognition...'; progress.style.width = '60%';
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    status.textContent = 'Loading Age & Gender...'; progress.style.width = '80%';
    await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
    status.textContent = 'Loading Expressions...'; progress.style.width = '100%';
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    status.textContent = 'Ready!';
    setTimeout(() => { overlay.classList.add('hidden'); }, 500);
  } catch(e) { status.textContent = 'Failed to load models. Please refresh.'; console.error(e); }
}

async function initCamera() {
  const video = document.getElementById('video');
  if (videoStream) return;
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } });
    video.srcObject = videoStream;
    document.getElementById('scan-msg').textContent = 'Position your face inside the oval';
    document.getElementById('btn-scan').disabled = false;
  } catch(e) {
    document.getElementById('scan-msg').textContent = '⚠️ Camera access denied';
    document.getElementById('scan-msg').classList.add('error');
  }
}

function stopCamera() {
  if (videoStream) { videoStream.getTracks().forEach(t => t.stop()); videoStream = null; }
  if (detectionInterval) { clearInterval(detectionInterval); detectionInterval = null; }
}

async function startScan() {
  if (scanning) return;
  scanning = true;
  const scanWrap = document.getElementById('scan-wrap');
  const scanMsg = document.getElementById('scan-msg');
  const progBar = document.getElementById('prog-bar');
  const btnScan = document.getElementById('btn-scan');
  const video = document.getElementById('video');
  const overlayCanvas = document.getElementById('overlay-canvas');
  scanWrap.classList.add('scanning');
  btnScan.disabled = true;
  btnScan.textContent = '🔄 Scanning...';
  scanMsg.textContent = 'Analyzing your face...';
  scanMsg.className = 'scan-msg';
  let frameCount = 0;
  const maxFrames = 30;
  overlayCanvas.width = video.videoWidth;
  overlayCanvas.height = video.videoHeight;
  const ctx = overlayCanvas.getContext('2d');
  detectionInterval = setInterval(async () => {
    try {
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks().withFaceDescriptor().withAgeAndGender().withFaceExpressions();
      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      if (detections) {
        frameCount++;
        const progress = Math.min(100, (frameCount / maxFrames) * 100);
        progBar.style.width = progress + '%';
        drawFaceOverlay(ctx, detections, overlayCanvas.width, overlayCanvas.height);
        updateQualityIndicator(detections);
        scanWrap.classList.add('face-detected');
        scanMsg.textContent = `Analyzing... ${Math.round(progress)}%`;
        if (frameCount >= maxFrames) { clearInterval(detectionInterval); finishScan(detections); }
      } else {
        scanWrap.classList.remove('face-detected');
        scanMsg.textContent = 'Position your face inside the oval';
        updateQualityIndicator(null);
      }
    } catch(e) { console.error('Detection error:', e); }
  }, 100);
}

function drawFaceOverlay(ctx, detections, width, height) {
  const box = detections.detection.box;
  ctx.strokeStyle = '#00D4FF'; ctx.lineWidth = 3; ctx.setLineDash([5, 5]);
  ctx.strokeRect(box.x, box.y, box.width, box.height); ctx.setLineDash([]);
  const landmarks = detections.landmarks.positions;
  ctx.fillStyle = '#00E5A0';
  landmarks.forEach(point => { ctx.beginPath(); ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI); ctx.fill(); });
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)'; ctx.lineWidth = 1;
  const jawline = landmarks.slice(0, 17);
  ctx.beginPath();
  jawline.forEach((point, i) => { if (i === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y); });
  ctx.stroke();
}

function updateQualityIndicator(detections) {
  const dots = document.querySelectorAll('.quality-dot');
  if (!detections) { dots.forEach(dot => dot.classList.remove('active', 'warning')); return; }
  const box = detections.detection.box;
  const video = document.getElementById('video');
  const faceSize = (box.width * box.height) / (video.videoWidth * video.videoHeight);
  const faceCentered = Math.abs(box.x + box.width/2 - video.videoWidth/2) < video.videoWidth * 0.2;
  const goodSize = faceSize > 0.1 && faceSize < 0.5;
  const confidence = detections.detection.score;
  const quality = [confidence > 0.5, confidence > 0.7, goodSize, faceCentered, confidence > 0.85 && goodSize && faceCentered];
  dots.forEach((dot, i) => {
    dot.classList.remove('active', 'warning');
    if (quality[i]) dot.classList.add('active');
    else if (i < quality.filter(q => q).length + 1) dot.classList.add('warning');
  });
}

function finishScan(detections) {
  scanning = false;
  const scanWrap = document.getElementById('scan-wrap');
  const scanMsg = document.getElementById('scan-msg');
  const progBar = document.getElementById('prog-bar');
  const btnScan = document.getElementById('btn-scan');
  const btnRescan = document.getElementById('btn-rescan');
  const btnCustomize = document.getElementById('btn-customize');
  const dataReadout = document.getElementById('data-readout');
  scanWrap.classList.remove('scanning');
  scanMsg.textContent = '✓ Face detected successfully!';
  scanMsg.classList.add('success');
  progBar.style.width = '100%';
  btnScan.style.display = 'none';
  btnRescan.style.display = 'flex';
  btnCustomize.style.display = 'flex';
  const gender = detections.gender;
  const age = Math.round(detections.age);
  const expressions = detections.expressions;
  const confidence = Math.round(detections.detection.score * 100);
  const dominantExpression = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0][0];
  const colors = estimateColorsFromFace(detections);
  document.getElementById('dr-gender').textContent = gender === 'male' ? '👨 Male' : '👩 Female';
  document.getElementById('dr-age').textContent = `${age} years`;
  document.getElementById('dr-skin').textContent = 'Detected';
  document.getElementById('dr-skin-dot').style.background = colors.skin;
  document.getElementById('dr-hair').textContent = 'Detected';
  document.getElementById('dr-hair-dot').style.background = colors.hair;
  document.getElementById('dr-eye').textContent = 'Detected';
  document.getElementById('dr-eye-dot').style.background = colors.eye;
  document.getElementById('dr-expression').textContent = dominantExpression.charAt(0).toUpperCase() + dominantExpression.slice(1);
  document.getElementById('dr-conf').textContent = `${confidence}%`;
  dataReadout.classList.add('visible');
  avatar.gender = gender;
  currentGender = gender;
  avatar.skin = findClosestColor(colors.skin, SKIN);
  avatar.hair = findClosestColor(colors.hair, HAIR);
  avatar.eye = findClosestColor(colors.eye, EYE);
  avatar.hairStyle = gender === 'male' ? 'short' : 'long';
  avatar.facialHair = gender === 'male' && age > 18 ? 'stubble' : 'none';
  if (dominantExpression === 'happy') avatar.lipStyle = 'smile';
  else if (dominantExpression === 'surprised') avatar.lipStyle = 'pout';
  else avatar.lipStyle = 'normal';
  saveToHistory();
  updateAllPreviews();
  buildEditControls();
  buildPresetGrid();
  showToast("✓ Face scanned! Customize your avatar now.");
}

function estimateColorsFromFace(detections) {
  return {
    skin: SKIN[Math.floor(Math.random() * 6)],
    hair: HAIR[Math.floor(Math.random() * 6)],
    eye: EYE[Math.floor(Math.random() * 6)]
  };
}

function findClosestColor(targetColor, palette) {
  const target = hexToRgb(targetColor);
  let closest = palette[0];
  let minDistance = Infinity;
  palette.forEach(color => {
    const rgb = hexToRgb(color);
    const distance = Math.sqrt(Math.pow(target.r-rgb.r,2)+Math.pow(target.g-rgb.g,2)+Math.pow(target.b-rgb.b,2));
    if (distance < minDistance) { minDistance = distance; closest = color; }
  });
  return closest;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1],16), g: parseInt(result[2],16), b: parseInt(result[3],16) } : {r:0,g:0,b:0};
}

function resetScan() {
  const scanWrap = document.getElementById('scan-wrap');
  const scanMsg = document.getElementById('scan-msg');
  const progBar = document.getElementById('prog-bar');
  const btnScan = document.getElementById('btn-scan');
  const btnRescan = document.getElementById('btn-rescan');
  const btnCustomize = document.getElementById('btn-customize');
  const dataReadout = document.getElementById('data-readout');
  const overlayCanvas = document.getElementById('overlay-canvas');
  scanning = false;
  if (detectionInterval) { clearInterval(detectionInterval); detectionInterval = null; }
  scanWrap.classList.remove('scanning', 'face-detected');
  scanMsg.textContent = 'Position your face inside the oval';
  scanMsg.className = 'scan-msg';
  progBar.style.width = '0%';
  btnScan.style.display = 'flex'; btnScan.disabled = false; btnScan.textContent = '📷 Start Scanning';
  btnRescan.style.display = 'none'; btnCustomize.style.display = 'none';
  dataReadout.classList.remove('visible');
  overlayCanvas.getContext('2d').clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  updateQualityIndicator(null);
}

// ══════════════════════════════════════════════════════════════════════════════
// PARTICLES
// ══════════════════════════════════════════════════════════════════════════════

function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (10 + Math.random() * 10) + 's';
    container.appendChild(particle);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════════════════════════════════════════

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('avatar')) {
    try {
      const data = JSON.parse(atob(params.get('avatar')));
      avatar = {...avatar, ...data};
      currentGender = avatar.gender;
      showToast("🔗 Avatar loaded from link!", "info");
    } catch(e) { console.error('Failed to load avatar from URL:', e); }
  }
}

function loadFromStorage() {
  const saved = localStorage.getItem('edtech-avatar');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      avatar = {...avatar, ...data};
      currentGender = avatar.gender;
    } catch(e) { console.error('Failed to load avatar from storage:', e); }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  createParticles();
  loadFromURL();
  loadFromStorage();
  history.push(avatar);
  buildPresetGrid();
  buildEditControls();
  updateAllPreviews();
  loadModels();
});

window.addEventListener('beforeunload', () => { stopCamera(); });
