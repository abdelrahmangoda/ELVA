import React, { useState, useEffect, useRef } from 'react';

// ══════════════════════════════════════════════════════════════
// AVATAR DATA
// ══════════════════════════════════════════════════════════════
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
    { id: "short", label: "Short" },
    { id: "fade", label: "Fade" },
    { id: "curly", label: "Curly" },
    { id: "bald", label: "Bald" },
    { id: "mohawk", label: "Mohawk" },
    { id: "slick", label: "Slick" },
    { id: "spiky", label: "Spiky" },
    { id: "afro", label: "Afro" }
  ],
  female: [
    { id: "long", label: "Long" },
    { id: "ponytail", label: "Ponytail" },
    { id: "bun", label: "Bun" },
    { id: "curly", label: "Curly" },
    { id: "pixie", label: "Pixie" },
    { id: "wavy", label: "Wavy" },
    { id: "braids", label: "Braids" },
    { id: "bob", label: "Bob" }
  ]
};

const ACCESSORIES = [
  { id: "none", label: "None" },
  { id: "glasses", label: "Glasses" },
  { id: "sunglasses", label: "Shades" },
  { id: "headband", label: "Headband" },
  { id: "cap", label: "Cap" },
  { id: "earrings", label: "Earrings" }
];

const PRESETS = {
  male: [
    { name: "Alex", gender: "male", skin: SKIN[0], hair: HAIR[0], hairStyle: "short", eye: EYE[2], lip: LIP[0], bg: BG[0], accessory: "none" },
    { name: "Marcus", gender: "male", skin: SKIN[4], hair: HAIR[2], hairStyle: "fade", eye: EYE[0], lip: LIP[5], bg: BG[3], accessory: "none" },
    { name: "Jake", gender: "male", skin: SKIN[2], hair: HAIR[10], hairStyle: "curly", eye: EYE[4], lip: LIP[1], bg: BG[4], accessory: "glasses" },
    { name: "Tyler", gender: "male", skin: SKIN[8], hair: HAIR[0], hairStyle: "bald", eye: EYE[0], lip: LIP[5], bg: BG[5], accessory: "sunglasses" },
    { name: "Ryan", gender: "male", skin: SKIN[1], hair: HAIR[12], hairStyle: "mohawk", eye: EYE[8], lip: LIP[2], bg: BG[2], accessory: "none" },
    { name: "Chris", gender: "male", skin: SKIN[6], hair: HAIR[8], hairStyle: "slick", eye: EYE[6], lip: LIP[3], bg: BG[9], accessory: "none" }
  ],
  female: [
    { name: "Emma", gender: "female", skin: SKIN[0], hair: HAIR[12], hairStyle: "long", eye: EYE[4], lip: LIP[2], bg: BG[2], accessory: "earrings" },
    { name: "Sophia", gender: "female", skin: SKIN[2], hair: HAIR[0], hairStyle: "ponytail", eye: EYE[2], lip: LIP[0], bg: BG[8], accessory: "headband" },
    { name: "Mia", gender: "female", skin: SKIN[4], hair: HAIR[6], hairStyle: "bun", eye: EYE[6], lip: LIP[4], bg: BG[5], accessory: "glasses" },
    { name: "Zara", gender: "female", skin: SKIN[8], hair: HAIR[16], hairStyle: "curly", eye: EYE[0], lip: LIP[5], bg: BG[6], accessory: "none" },
    { name: "Luna", gender: "female", skin: SKIN[1], hair: HAIR[20], hairStyle: "pixie", eye: EYE[12], lip: LIP[1], bg: BG[10], accessory: "none" },
    { name: "Aria", gender: "female", skin: SKIN[3], hair: HAIR[10], hairStyle: "wavy", eye: EYE[3], lip: LIP[0], bg: BG[1], accessory: "sunglasses" }
  ]
};

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/";

// ══════════════════════════════════════════════════════════════
// SVG BUILDER FUNCTION
// ══════════════════════════════════════════════════════════════
export function buildAvatarSVG(cfg, size = 160) {
  const { 
    gender = "male", 
    skin = SKIN[0], 
    hair = HAIR[0], 
    hairStyle = "short", 
    eye = EYE[2], 
    lip = LIP[0], 
    bg = BG[0], 
    accessory = "none" 
  } = cfg || {};

  const getHairSVG = () => {
    if (hairStyle === "bald") return "";
    
    switch (hairStyle) {
      case "short":
        return `<ellipse cx="80" cy="56" rx="38" ry="22" fill="${hair}"/>`;
      case "fade":
        return `<ellipse cx="80" cy="58" rx="38" ry="20" fill="${hair}"/>
          <rect x="42" y="66" width="10" height="28" fill="${hair}" rx="5"/>
          <rect x="108" y="66" width="10" height="28" fill="${hair}" rx="5"/>`;
      case "curly":
        return [48, 58, 68, 78, 88, 98, 108].map((x, i) => 
          `<circle cx="${x}" cy="${48 + i % 2 * 8}" r="14" fill="${hair}"/>`
        ).join("");
      case "mohawk":
        return `<ellipse cx="80" cy="58" rx="36" ry="18" fill="${hair}"/>
          <rect x="72" y="18" width="16" height="45" fill="${hair}" rx="8"/>`;
      case "slick":
        return `<ellipse cx="80" cy="54" rx="40" ry="22" fill="${hair}"/>
          <path d="M40 62 Q60 46 80 48 Q100 46 120 62" fill="${hair}"/>`;
      case "spiky":
        return `<ellipse cx="80" cy="58" rx="36" ry="18" fill="${hair}"/>
          ${[55, 65, 75, 85, 95, 105].map(x => `<polygon points="${x},60 ${x + 5},30 ${x + 10},60" fill="${hair}"/>`).join("")}`;
      case "afro":
        return `<circle cx="80" cy="55" r="45" fill="${hair}"/>`;
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
      case "pixie":
        return `<ellipse cx="80" cy="52" rx="38" ry="20" fill="${hair}"/>`;
      case "wavy":
        return `<ellipse cx="80" cy="54" rx="42" ry="26" fill="${hair}"/>
          <path d="M38 72 Q46 84 38 96 Q46 108 38 120 Q46 132 40 140" stroke="${hair}" stroke-width="16" fill="none" stroke-linecap="round"/>
          <path d="M122 72 Q114 84 122 96 Q114 108 122 120 Q114 132 120 140" stroke="${hair}" stroke-width="16" fill="none" stroke-linecap="round"/>`;
      case "braids":
        return `<ellipse cx="80" cy="54" rx="40" ry="24" fill="${hair}"/>
          <rect x="38" y="65" width="12" height="75" fill="${hair}" rx="6"/>
          <rect x="110" y="65" width="12" height="75" fill="${hair}" rx="6"/>`;
      case "bob":
        return `<ellipse cx="80" cy="54" rx="44" ry="26" fill="${hair}"/>
          <rect x="36" y="65" width="88" height="35" fill="${hair}" rx="15"/>`;
      default:
        return `<ellipse cx="80" cy="56" rx="38" ry="22" fill="${hair}"/>`;
    }
  };

  const getAccessorySVG = () => {
    if (!accessory || accessory === "none") return "";
    
    switch (accessory) {
      case "glasses":
        return `<circle cx="66" cy="90" r="12" fill="none" stroke="#444" stroke-width="2.5"/>
          <circle cx="94" cy="90" r="12" fill="none" stroke="#444" stroke-width="2.5"/>
          <line x1="78" y1="90" x2="82" y2="90" stroke="#444" stroke-width="2"/>
          <line x1="54" y1="88" x2="42" y2="85" stroke="#444" stroke-width="2"/>
          <line x1="106" y1="88" x2="118" y2="85" stroke="#444" stroke-width="2"/>`;
      case "sunglasses":
        return `<rect x="52" y="82" width="28" height="16" rx="6" fill="#111" opacity=".95"/>
          <rect x="80" y="82" width="28" height="16" rx="6" fill="#111" opacity=".95"/>
          <line x1="80" y1="90" x2="80" y2="90" stroke="#333" stroke-width="2"/>
          <line x1="42" y1="87" x2="52" y2="88" stroke="#333" stroke-width="2"/>
          <line x1="108" y1="88" x2="118" y2="87" stroke="#333" stroke-width="2"/>`;
      case "headband":
        return `<rect x="38" y="62" width="84" height="12" rx="6" fill="#7c3aed" opacity=".9"/>`;
      case "cap":
        return `<ellipse cx="80" cy="60" rx="44" ry="14" fill="#2C3E50"/>
          <ellipse cx="80" cy="50" rx="34" ry="20" fill="#2C3E50"/>
          <ellipse cx="52" cy="62" rx="20" ry="6" fill="#2C3E50" opacity=".8"/>`;
      case "earrings":
        return `<circle cx="42" cy="95" r="5" fill="#F6A623" stroke="#D4871A"/>
          <circle cx="118" cy="95" r="5" fill="#F6A623" stroke="#D4871A"/>`;
      default:
        return "";
    }
  };

  const uniqueId = Math.random().toString(36).substr(2, 9);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="avatar-clip-${uniqueId}">
        <circle cx="80" cy="80" r="80"/>
      </clipPath>
    </defs>
    <g clip-path="url(#avatar-clip-${uniqueId})">
      <circle cx="80" cy="80" r="80" fill="${bg}"/>
      <ellipse cx="42" cy="90" rx="7" ry="10" fill="${skin}"/>
      <ellipse cx="118" cy="90" rx="7" ry="10" fill="${skin}"/>
      <ellipse cx="80" cy="88" rx="36" ry="40" fill="${skin}"/>
      ${getHairSVG()}
      <path d="M58 78 Q66 73 74 78" stroke="#3D2010" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M86 78 Q94 73 102 78" stroke="#3D2010" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="66" cy="90" rx="9" ry="8" fill="white"/>
      <ellipse cx="94" cy="90" rx="9" ry="8" fill="white"/>
      <circle cx="66" cy="91" r="5" fill="${eye}"/>
      <circle cx="94" cy="91" r="5" fill="${eye}"/>
      <circle cx="68" cy="88" r="2" fill="white"/>
      <circle cx="96" cy="88" r="2" fill="white"/>
      <path d="M77 100 Q80 106 83 100" stroke="#a06030" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M66 115 Q73 120 80 118 Q87 120 94 115" fill="${lip}"/>
      <path d="M66 115 Q80 111 94 115" fill="${lip}" opacity="0.8"/>
      ${getAccessorySVG()}
    </g>
  </svg>`;
}

export function buildMiniAvatarSVG(cfg, size = 32) {
  return buildAvatarSVG(cfg, size);
}

// ══════════════════════════════════════════════════════════════
// DEFAULT AVATAR
// ══════════════════════════════════════════════════════════════
const DEFAULT_AVATAR = {
  gender: "male",
  skin: SKIN[0],
  hair: HAIR[0],
  hairStyle: "short",
  eye: EYE[2],
  lip: LIP[0],
  bg: BG[0],
  accessory: "none"
};

// ══════════════════════════════════════════════════════════════
// AVATAR CREATOR COMPONENT
// ══════════════════════════════════════════════════════════════
export default function AvatarCreator({ 
  initialAvatar, 
  onSave, 
  onClose, 
  isModal = true,
  showFaceScan = true 
}) {
  const [avatar, setAvatar] = useState(() => ({
    ...DEFAULT_AVATAR,
    ...(initialAvatar || {})
  }));
  
  const [gender, setGender] = useState(avatar.gender || "male");
  const [activeTab, setActiveTab] = useState("presets");
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Update avatar function
  const update = (key, value) => {
    setAvatar(prev => ({ ...prev, [key]: value }));
  };
  
  // Select preset
  const selectPreset = (preset) => {
    setAvatar({ ...preset });
    setGender(preset.gender);
  };
  
  // Randomize avatar
  const randomize = () => {
    const g = Math.random() > 0.5 ? "male" : "female";
    const styles = HAIR_STYLES[g];
    const newAvatar = {
      gender: g,
      skin: SKIN[Math.floor(Math.random() * SKIN.length)],
      hair: HAIR[Math.floor(Math.random() * HAIR.length)],
      hairStyle: styles[Math.floor(Math.random() * styles.length)].id,
      eye: EYE[Math.floor(Math.random() * EYE.length)],
      lip: LIP[Math.floor(Math.random() * LIP.length)],
      bg: BG[Math.floor(Math.random() * BG.length)],
      accessory: ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)].id
    };
    setAvatar(newAvatar);
    setGender(g);
  };
  
  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave(avatar);
    }
    if (onClose) {
      onClose();
    }
  };

  // Handle gender change
  const handleGenderChange = (newGender) => {
    setGender(newGender);
    update("gender", newGender);
    update("hairStyle", newGender === "male" ? "short" : "long");
  };

  // ══════════════════════════════════════════════════════════════
  // FACE SCANNING
  // ══════════════════════════════════════════════════════════════
  const loadModels = async () => {
    if (modelsLoaded) return true;
    
    // Check if faceapi is available
    if (typeof faceapi === 'undefined') {
      setScanStatus("Face detection not available");
      return false;
    }
    
    setScanStatus("Loading AI models...");
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
      return true;
    } catch (e) {
      console.error("Failed to load face models:", e);
      setScanStatus("Failed to load AI models");
      return false;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', 
          width: { ideal: 640 }, 
          height: { ideal: 480 } 
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return true;
    } catch (e) {
      console.error("Camera access error:", e);
      setScanStatus("Camera access denied");
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const startScan = async () => {
    setScanning(true);
    setScanStatus("Initializing...");
    
    const loaded = await loadModels();
    if (!loaded) { 
      setScanning(false); 
      return; 
    }
    
    const cameraStarted = await startCamera();
    if (!cameraStarted) { 
      setScanning(false); 
      return; 
    }
    
    setScanStatus("Position your face in the frame...");
    
    // Wait for video to be ready then detect
    setTimeout(async () => {
      if (!videoRef.current || !scanning) return;
      
      try {
        setScanStatus("Analyzing face...");
        
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withAgeAndGender();
        
        if (detection) {
          const detectedGender = detection.gender;
          const g = detectedGender === "male" ? "male" : "female";
          
          // Update avatar based on detection
          const newAvatar = {
            ...avatar,
            gender: g,
            hairStyle: g === "male" ? "short" : "long",
            skin: SKIN[Math.floor(Math.random() * 6)],
            hair: HAIR[Math.floor(Math.random() * 6)],
            eye: EYE[Math.floor(Math.random() * 6)]
          };
          
          setAvatar(newAvatar);
          setGender(g);
          
          setScanStatus(`✅ Detected: ${g}, ~${Math.round(detection.age)} years old`);
          
          // Switch to customize tab after successful scan
          setTimeout(() => {
            setActiveTab("customize");
          }, 1500);
        } else {
          setScanStatus("No face detected. Try again.");
        }
      } catch (e) {
        console.error("Face detection error:", e);
        setScanStatus("Scan failed. Please try again.");
      }
      
      stopCamera();
    }, 3000);
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER CONTENT
  // ══════════════════════════════════════════════════════════════
  const renderContent = () => (
    <div className="avatar-creator-inner">
      {/* Header */}
      <div className="avatar-creator-header">
        <h3>🎨 Create Your Avatar</h3>
        {isModal && onClose && (
          <button className="avatar-close-btn" onClick={onClose}>✕</button>
        )}
      </div>
      
      {/* Tabs */}
      <div className="avatar-tabs">
        <button 
          className={`avatar-tab ${activeTab === 'presets' ? 'active' : ''}`}
          onClick={() => setActiveTab('presets')}
        >
          ⭐ Presets
        </button>
        <button 
          className={`avatar-tab ${activeTab === 'customize' ? 'active' : ''}`}
          onClick={() => setActiveTab('customize')}
        >
          ✏️ Customize
        </button>
        {showFaceScan && (
          <button 
            className={`avatar-tab ${activeTab === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            📷 Face Scan
          </button>
        )}
      </div>
      
      {/* Content */}
      <div className="avatar-creator-content">
        {/* Preview Section */}
        <div className="avatar-preview-section">
          <div 
            className="avatar-preview-box" 
            dangerouslySetInnerHTML={{ __html: buildAvatarSVG(avatar, 200) }} 
          />
          <div className="avatar-actions">
            <button className="avatar-action-btn" onClick={randomize}>
              🎲 Random
            </button>
            <button className="avatar-action-btn save" onClick={handleSave}>
              💾 Save
            </button>
          </div>
        </div>
        
        {/* Controls Section */}
        <div className="avatar-controls-section">
          {/* PRESETS TAB */}
          {activeTab === 'presets' && (
            <>
              <div className="avatar-section">
                <label>Gender</label>
                <div className="avatar-gender-btns">
                  <button 
                    className={`avatar-gender-btn ${gender === "male" ? "active" : ""}`}
                    onClick={() => handleGenderChange("male")}
                  >
                    👨 Male
                  </button>
                  <button 
                    className={`avatar-gender-btn ${gender === "female" ? "active" : ""}`}
                    onClick={() => handleGenderChange("female")}
                  >
                    👩 Female
                  </button>
                </div>
              </div>
              
              <div className="avatar-section">
                <label>Choose a Preset</label>
                <div className="avatar-presets-grid">
                  {PRESETS[gender].map((preset, i) => (
                    <button 
                      key={i} 
                      className="avatar-preset-card"
                      onClick={() => selectPreset(preset)}
                      title={preset.name}
                    >
                      <div dangerouslySetInnerHTML={{ __html: buildAvatarSVG(preset, 70) }} />
                      <span className="preset-name">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* CUSTOMIZE TAB */}
          {activeTab === 'customize' && (
            <>
              <div className="avatar-section">
                <label>Gender</label>
                <div className="avatar-gender-btns">
                  <button 
                    className={`avatar-gender-btn ${gender === "male" ? "active" : ""}`}
                    onClick={() => handleGenderChange("male")}
                  >
                    👨 Male
                  </button>
                  <button 
                    className={`avatar-gender-btn ${gender === "female" ? "active" : ""}`}
                    onClick={() => handleGenderChange("female")}
                  >
                    👩 Female
                  </button>
                </div>
              </div>
              
              <div className="avatar-section">
                <label>Skin Tone</label>
                <div className="avatar-swatches">
                  {SKIN.map((c, i) => (
                    <button 
                      key={i}
                      className={`avatar-swatch ${avatar.skin === c ? "selected" : ""}`}
                      style={{ background: c }}
                      onClick={() => update("skin", c)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="avatar-section">
                <label>Hair Style</label>
                <div className="avatar-pills">
                  {HAIR_STYLES[gender].map((style) => (
                    <button
                      key={style.id}
                      className={`avatar-pill ${avatar.hairStyle === style.id ? "selected" : ""}`}
                      onClick={() => update("hairStyle", style.id)}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="avatar-section">
                <label>Hair Color</label>
                <div className="avatar-swatches">
                  {HAIR.slice(0, 16).map((c, i) => (
                    <button 
                      key={i}
                      className={`avatar-swatch ${avatar.hair === c ? "selected" : ""}`}
                      style={{ background: c }}
                      onClick={() => update("hair", c)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="avatar-section">
                <label>Eye Color</label>
                <div className="avatar-swatches">
                  {EYE.map((c, i) => (
                    <button 
                      key={i}
                      className={`avatar-swatch ${avatar.eye === c ? "selected" : ""}`}
                      style={{ background: c }}
                      onClick={() => update("eye", c)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="avatar-section">
                <label>Lip Color</label>
                <div className="avatar-swatches">
                  {LIP.map((c, i) => (
                    <button 
                      key={i}
                      className={`avatar-swatch ${avatar.lip === c ? "selected" : ""}`}
                      style={{ background: c }}
                      onClick={() => update("lip", c)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="avatar-section">
                <label>Accessory</label>
                <div className="avatar-pills">
                  {ACCESSORIES.map((acc) => (
                    <button
                      key={acc.id}
                      className={`avatar-pill ${avatar.accessory === acc.id ? "selected" : ""}`}
                      onClick={() => update("accessory", acc.id)}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="avatar-section">
                <label>Background</label>
                <div className="avatar-swatches">
                  {BG.map((c, i) => (
                    <button 
                      key={i}
                      className={`avatar-swatch ${avatar.bg === c ? "selected" : ""}`}
                      style={{ background: c }}
                      onClick={() => update("bg", c)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* FACE SCAN TAB */}
          {activeTab === 'scan' && showFaceScan && (
            <div className="avatar-scan-section">
              <div className="scan-preview">
                {scanning ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="scan-video" 
                  />
                ) : (
                  <div className="scan-placeholder">
                    <span>📷</span>
                    <p>Scan your face to create a personalized avatar</p>
                  </div>
                )}
                <div className="scan-overlay">
                  <div className="scan-frame"></div>
                </div>
              </div>
              
              {scanStatus && (
                <div className="scan-status">{scanStatus}</div>
              )}
              
              <div className="scan-actions">
                {scanning ? (
                  <button className="scan-btn cancel" onClick={stopCamera}>
                    ✕ Cancel
                  </button>
                ) : (
                  <button className="scan-btn start" onClick={startScan}>
                    📷 Start Face Scan
                  </button>
                )}
              </div>
              
              <div className="scan-note">
                <p>🔒 Your camera feed is processed locally and never uploaded.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  if (isModal) {
    return (
      <div className="avatar-creator-modal">
        <div className="avatar-creator-overlay" onClick={onClose} />
        <div className="avatar-creator-panel">
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="avatar-creator-inline">
      {renderContent()}
    </div>
  );
}