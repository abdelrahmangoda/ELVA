// src/components/AvatarCreator.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

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

const FACE_SHAPES = [
  { id: "oval", label: "Oval" },
  { id: "round", label: "Round" },
  { id: "square", label: "Square" },
  { id: "heart", label: "Heart" }
];

const PRESETS = {
  male: [
    { name: "Alex", gender: "male", skin: SKIN[0], hair: HAIR[0], hairStyle: "short", eye: EYE[2], lip: LIP[0], bg: BG[0], accessory: "none", faceShape: "oval" },
    { name: "Marcus", gender: "male", skin: SKIN[4], hair: HAIR[2], hairStyle: "fade", eye: EYE[0], lip: LIP[5], bg: BG[3], accessory: "none", faceShape: "square" },
    { name: "Jake", gender: "male", skin: SKIN[2], hair: HAIR[10], hairStyle: "curly", eye: EYE[4], lip: LIP[1], bg: BG[4], accessory: "glasses", faceShape: "round" },
    { name: "Tyler", gender: "male", skin: SKIN[8], hair: HAIR[0], hairStyle: "bald", eye: EYE[0], lip: LIP[5], bg: BG[5], accessory: "sunglasses", faceShape: "oval" },
    { name: "Ryan", gender: "male", skin: SKIN[1], hair: HAIR[12], hairStyle: "mohawk", eye: EYE[8], lip: LIP[2], bg: BG[2], accessory: "none", faceShape: "heart" },
    { name: "Chris", gender: "male", skin: SKIN[6], hair: HAIR[8], hairStyle: "slick", eye: EYE[6], lip: LIP[3], bg: BG[9], accessory: "none", faceShape: "square" },
    { name: "David", gender: "male", skin: SKIN[3], hair: HAIR[4], hairStyle: "spiky", eye: EYE[3], lip: LIP[0], bg: BG[1], accessory: "none", faceShape: "oval" },
    { name: "James", gender: "male", skin: SKIN[7], hair: HAIR[1], hairStyle: "afro", eye: EYE[1], lip: LIP[4], bg: BG[7], accessory: "headband", faceShape: "round" }
  ],
  female: [
    { name: "Emma", gender: "female", skin: SKIN[0], hair: HAIR[12], hairStyle: "long", eye: EYE[4], lip: LIP[2], bg: BG[2], accessory: "earrings", faceShape: "oval" },
    { name: "Sophia", gender: "female", skin: SKIN[2], hair: HAIR[0], hairStyle: "ponytail", eye: EYE[2], lip: LIP[0], bg: BG[8], accessory: "headband", faceShape: "heart" },
    { name: "Mia", gender: "female", skin: SKIN[4], hair: HAIR[6], hairStyle: "bun", eye: EYE[6], lip: LIP[4], bg: BG[5], accessory: "glasses", faceShape: "round" },
    { name: "Zara", gender: "female", skin: SKIN[8], hair: HAIR[16], hairStyle: "curly", eye: EYE[0], lip: LIP[5], bg: BG[6], accessory: "none", faceShape: "oval" },
    { name: "Luna", gender: "female", skin: SKIN[1], hair: HAIR[20], hairStyle: "pixie", eye: EYE[12], lip: LIP[1], bg: BG[10], accessory: "none", faceShape: "square" },
    { name: "Aria", gender: "female", skin: SKIN[3], hair: HAIR[10], hairStyle: "wavy", eye: EYE[3], lip: LIP[0], bg: BG[1], accessory: "sunglasses", faceShape: "heart" },
    { name: "Olivia", gender: "female", skin: SKIN[5], hair: HAIR[8], hairStyle: "braids", eye: EYE[5], lip: LIP[3], bg: BG[11], accessory: "earrings", faceShape: "oval" },
    { name: "Chloe", gender: "female", skin: SKIN[6], hair: HAIR[14], hairStyle: "bob", eye: EYE[7], lip: LIP[6], bg: BG[0], accessory: "none", faceShape: "round" }
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
    accessory = "none",
    faceShape = "oval",
    hasBeard = false
  } = cfg || {};

  const getFacePathD = () => {
    switch (faceShape) {
      case "round":
        return "M80 48 C120 48 118 88 118 100 C118 125 105 135 80 138 C55 135 42 125 42 100 C42 88 40 48 80 48";
      case "square":
        return "M80 48 C115 48 118 75 118 95 C118 125 108 138 80 138 C52 138 42 125 42 95 C42 75 45 48 80 48";
      case "heart":
        return "M80 48 C120 48 120 78 118 95 C116 120 100 138 80 140 C60 138 44 120 42 95 C40 78 40 48 80 48";
      default:
        return "M80 48 C115 52 118 85 118 100 C118 125 100 138 80 140 C60 138 42 125 42 100 C42 85 45 52 80 48";
    }
  };

  const getBeardSVG = () => {
    if (!hasBeard || gender !== "male") return "";
    return `
      <ellipse cx="80" cy="125" rx="22" ry="18" fill="${hair}" opacity="0.7"/>
      <rect x="58" y="108" width="44" height="20" fill="${hair}" opacity="0.5" rx="4"/>
      <ellipse cx="80" cy="130" rx="18" ry="12" fill="${hair}" opacity="0.8"/>
    `;
  };

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
        return `
          <ellipse cx="66" cy="90" rx="14" ry="12" fill="none" stroke="#333" stroke-width="2.5"/>
          <ellipse cx="94" cy="90" rx="14" ry="12" fill="none" stroke="#333" stroke-width="2.5"/>
          <line x1="80" y1="90" x2="80" y2="90" stroke="#333" stroke-width="3"/>
          <path d="M52 88 L42 85" stroke="#333" stroke-width="2" stroke-linecap="round"/>
          <path d="M108 88 L118 85" stroke="#333" stroke-width="2" stroke-linecap="round"/>
          <ellipse cx="66" cy="90" rx="12" ry="10" fill="rgba(200,220,255,0.15)"/>
          <ellipse cx="94" cy="90" rx="12" ry="10" fill="rgba(200,220,255,0.15)"/>
        `;
      case "sunglasses":
        return `
          <rect x="50" y="82" width="30" height="18" rx="4" fill="#111" opacity=".95"/>
          <rect x="80" y="82" width="30" height="18" rx="4" fill="#111" opacity=".95"/>
          <rect x="78" y="88" width="4" height="4" fill="#333"/>
          <path d="M50 88 L40 85" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M110 88 L120 85" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M54 86 L60 84" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
          <path d="M84 86 L90 84" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
        `;
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
      <path d="${getFacePathD()}" fill="${skin}"/>
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
      ${getBeardSVG()}
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
  accessory: "none",
  faceShape: "oval",
  hasBeard: false
};

// ══════════════════════════════════════════════════════════════
// FACE ANALYSIS UTILITIES
// ══════════════════════════════════════════════════════════════

// Analyze pixel region for glasses detection
function analyzeRegionForGlasses(canvas, ctx, landmarks, faceBox) {
  try {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    if (!leftEye || !rightEye || leftEye.length === 0) return false;
    
    // Get eye region bounds
    const leftEyeCenter = {
      x: leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length,
      y: leftEye.reduce((sum, p) => sum + p.y, 0) / leftEye.length
    };
    const rightEyeCenter = {
      x: rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length,
      y: rightEye.reduce((sum, p) => sum + p.y, 0) / rightEye.length
    };
    
    // Sample area above and around eyes for glasses frames
    const sampleSize = Math.abs(rightEyeCenter.x - leftEyeCenter.x) * 0.15;
    const regions = [
      { x: leftEyeCenter.x - sampleSize, y: leftEyeCenter.y - sampleSize * 2 },
      { x: leftEyeCenter.x + sampleSize, y: leftEyeCenter.y - sampleSize * 2 },
      { x: rightEyeCenter.x - sampleSize, y: rightEyeCenter.y - sampleSize * 2 },
      { x: rightEyeCenter.x + sampleSize, y: rightEyeCenter.y - sampleSize * 2 },
      // Bridge of nose
      { x: (leftEyeCenter.x + rightEyeCenter.x) / 2, y: leftEyeCenter.y - sampleSize },
    ];
    
    let darkPixelCount = 0;
    let totalPixels = 0;
    
    regions.forEach(region => {
      const x = Math.max(0, Math.min(canvas.width - 3, Math.floor(region.x)));
      const y = Math.max(0, Math.min(canvas.height - 3, Math.floor(region.y)));
      
      try {
        const imageData = ctx.getImageData(x, y, 3, 3);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness < 80) darkPixelCount++;
          totalPixels++;
        }
      } catch (e) {
        // Ignore sampling errors
      }
    });
    
    // If more than 40% of sampled pixels are dark, likely glasses
    const darkRatio = darkPixelCount / Math.max(totalPixels, 1);
    return darkRatio > 0.35;
  } catch (e) {
    console.error("Glasses detection error:", e);
    return false;
  }
}

// Analyze for beard/facial hair
function analyzeRegionForBeard(canvas, ctx, landmarks, faceBox, gender) {
  if (gender !== "male") return false;
  
  try {
    const jawOutline = landmarks.getJawOutline();
    const nose = landmarks.getNose();
    
    if (!jawOutline || jawOutline.length < 10 || !nose || nose.length === 0) return false;
    
    // Get chin/jaw area
    const chinPoint = jawOutline[Math.floor(jawOutline.length / 2)];
    const noseBottom = nose[nose.length - 1];
    
    // Sample region between nose bottom and chin
    const sampleY = (noseBottom.y + chinPoint.y) / 2;
    const sampleWidth = Math.abs(jawOutline[jawOutline.length - 1].x - jawOutline[0].x) * 0.4;
    const centerX = chinPoint.x;
    
    const regions = [
      { x: centerX - sampleWidth / 2, y: sampleY },
      { x: centerX, y: sampleY },
      { x: centerX + sampleWidth / 2, y: sampleY },
      { x: centerX, y: sampleY + 10 },
      { x: centerX, y: chinPoint.y - 5 },
    ];
    
    let darkPixelCount = 0;
    let skinPixelCount = 0;
    let totalPixels = 0;
    
    // First, sample forehead for skin color reference
    const foreheadY = faceBox.y + faceBox.height * 0.1;
    const foreheadX = faceBox.x + faceBox.width / 2;
    let skinBrightness = 180;
    
    try {
      const skinSample = ctx.getImageData(
        Math.floor(foreheadX), 
        Math.floor(foreheadY), 
        5, 5
      );
      let totalBrightness = 0;
      for (let i = 0; i < skinSample.data.length; i += 4) {
        totalBrightness += (skinSample.data[i] + skinSample.data[i + 1] + skinSample.data[i + 2]) / 3;
      }
      skinBrightness = totalBrightness / (skinSample.data.length / 4);
    } catch (e) {}
    
    // Now sample beard region
    regions.forEach(region => {
      const x = Math.max(0, Math.min(canvas.width - 5, Math.floor(region.x)));
      const y = Math.max(0, Math.min(canvas.height - 5, Math.floor(region.y)));
      
      try {
        const imageData = ctx.getImageData(x, y, 5, 5);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          // Compare to skin - beard is usually significantly darker
          if (brightness < skinBrightness * 0.65) {
            darkPixelCount++;
          }
          totalPixels++;
        }
      } catch (e) {}
    });
    
    // If beard region is significantly darker than skin
    const darkRatio = darkPixelCount / Math.max(totalPixels, 1);
    return darkRatio > 0.25;
  } catch (e) {
    console.error("Beard detection error:", e);
    return false;
  }
}

// Detect skin tone from face
function detectSkinTone(canvas, ctx, landmarks, faceBox) {
  try {
    // Sample from cheek area (more reliable than forehead due to hair)
    const leftCheek = landmarks.getLeftEye();
    const rightCheek = landmarks.getRightEye();
    const jawOutline = landmarks.getJawOutline();
    
    if (!leftCheek || !jawOutline) return SKIN[2]; // Default
    
    // Sample from cheek region
    const leftEyeCenter = {
      x: leftCheek.reduce((sum, p) => sum + p.x, 0) / leftCheek.length,
      y: leftCheek.reduce((sum, p) => sum + p.y, 0) / leftCheek.length
    };
    
    const cheekY = leftEyeCenter.y + (jawOutline[0].y - leftEyeCenter.y) * 0.4;
    const cheekX = jawOutline[2].x;
    
    const x = Math.max(0, Math.min(canvas.width - 10, Math.floor(cheekX)));
    const y = Math.max(0, Math.min(canvas.height - 10, Math.floor(cheekY)));
    
    const imageData = ctx.getImageData(x, y, 10, 10);
    const data = imageData.data;
    
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
    
    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);
    
    // Find closest skin tone
    let closestSkin = SKIN[0];
    let minDistance = Infinity;
    
    SKIN.forEach(skinColor => {
      // Parse hex color
      const sr = parseInt(skinColor.slice(1, 3), 16);
      const sg = parseInt(skinColor.slice(3, 5), 16);
      const sb = parseInt(skinColor.slice(5, 7), 16);
      
      const distance = Math.sqrt(
        Math.pow(r - sr, 2) + 
        Math.pow(g - sg, 2) + 
        Math.pow(b - sb, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestSkin = skinColor;
      }
    });
    
    return closestSkin;
  } catch (e) {
    console.error("Skin tone detection error:", e);
    return SKIN[2];
  }
}

// Detect face shape from landmarks
function detectFaceShape(landmarks) {
  try {
    const jawOutline = landmarks.getJawOutline();
    if (!jawOutline || jawOutline.length < 10) return "oval";
    
    // Calculate face dimensions
    const faceWidth = Math.abs(jawOutline[jawOutline.length - 1].x - jawOutline[0].x);
    const faceHeight = Math.abs(jawOutline[Math.floor(jawOutline.length / 2)].y - jawOutline[0].y);
    const ratio = faceWidth / faceHeight;
    
    // Calculate jaw width vs cheekbone width
    const jawWidth = Math.abs(jawOutline[jawOutline.length - 3].x - jawOutline[2].x);
    const midWidth = Math.abs(jawOutline[jawOutline.length - 5].x - jawOutline[4].x);
    const jawRatio = jawWidth / midWidth;
    
    if (ratio > 1.1) return "round";
    if (ratio < 0.75) return "oval";
    if (jawRatio > 0.9) return "square";
    if (jawRatio < 0.75) return "heart";
    
    return "oval";
  } catch (e) {
    return "oval";
  }
}

// Get hair style based on age
function getHairStyleForAge(age, gender) {
  if (gender === "male") {
    if (age > 50) return Math.random() > 0.4 ? "bald" : "short";
    if (age > 35) return Math.random() > 0.7 ? "slick" : "short";
    if (age < 25) return ["spiky", "fade", "curly", "mohawk"][Math.floor(Math.random() * 4)];
    return ["short", "fade", "slick"][Math.floor(Math.random() * 3)];
  } else {
    if (age > 40) return ["bob", "short", "bun"][Math.floor(Math.random() * 3)];
    if (age < 25) return ["long", "ponytail", "wavy", "braids"][Math.floor(Math.random() * 4)];
    return ["long", "bob", "wavy", "bun"][Math.floor(Math.random() * 4)];
  }
}

// Get hair color based on age
function getHairColorForAge(age) {
  if (age > 55) {
    // Gray/white hair
    return HAIR[Math.random() > 0.5 ? 11 : 7]; // Lighter colors
  }
  if (age > 45 && Math.random() > 0.6) {
    return HAIR[7]; // Some gray
  }
  // Natural colors
  return HAIR[Math.floor(Math.random() * 6)];
}

// ══════════════════════════════════════════════════════════════
// AVATAR CREATOR COMPONENT
// ══════════════════════════════════════════════════════════════
export default function AvatarCreator({ 
  initialAvatar, 
  onSave, 
  onClose, 
  isModal = true,
  showFaceScan = true,
  filterGender = null,
  fullScreen = false
}) {
  const [avatar, setAvatar] = useState(() => ({
    ...DEFAULT_AVATAR,
    ...(initialAvatar || {})
  }));
  
  const [gender, setGender] = useState(filterGender || avatar.gender || "male");
  const [activeTab, setActiveTab] = useState("presets");
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectedFeatures, setDetectedFeatures] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanningRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (filterGender) {
      setGender(filterGender);
      setAvatar(prev => ({
        ...prev,
        gender: filterGender,
        hairStyle: filterGender === "male" ? "short" : "long"
      }));
    }
  }, [filterGender]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, []);

  const update = (key, value) => {
    setAvatar(prev => ({ ...prev, [key]: value }));
  };
  
  const selectPreset = (preset) => {
    setAvatar({ ...preset });
    if (!filterGender) {
      setGender(preset.gender);
    }
  };
  
  const randomize = () => {
    const g = filterGender || (Math.random() > 0.5 ? "male" : "female");
    const styles = HAIR_STYLES[g];
    const shapes = FACE_SHAPES;
    const newAvatar = {
      gender: g,
      skin: SKIN[Math.floor(Math.random() * SKIN.length)],
      hair: HAIR[Math.floor(Math.random() * HAIR.length)],
      hairStyle: styles[Math.floor(Math.random() * styles.length)].id,
      eye: EYE[Math.floor(Math.random() * EYE.length)],
      lip: LIP[Math.floor(Math.random() * LIP.length)],
      bg: BG[Math.floor(Math.random() * BG.length)],
      accessory: ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)].id,
      faceShape: shapes[Math.floor(Math.random() * shapes.length)].id,
      hasBeard: g === "male" && Math.random() > 0.7
    };
    setAvatar(newAvatar);
    if (!filterGender) {
      setGender(g);
    }
  };
  
  const handleSave = () => {
    if (onSave) onSave(avatar);
    if (onClose) onClose();
  };

  const handleGenderChange = (newGender) => {
    if (filterGender) return;
    setGender(newGender);
    update("gender", newGender);
    update("hairStyle", newGender === "male" ? "short" : "long");
    if (newGender === "female") {
      update("hasBeard", false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // FACE SCANNING - ENHANCED VERSION
  // ══════════════════════════════════════════════════════════════
  
  const getFaceAPI = () => {
    return window.faceapi || (typeof faceapi !== 'undefined' ? faceapi : null);
  };

  const loadModels = async () => {
    if (modelsLoaded) return true;
    
    const faceAPI = getFaceAPI();
    if (!faceAPI) {
      setScanStatus("❌ Face detection library not loaded");
      return false;
    }
    
    setScanStatus("🔄 Loading AI models...");
    setScanProgress(10);
    
    try {
      await faceAPI.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      setScanProgress(40);
      await faceAPI.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      setScanProgress(70);
      await faceAPI.nets.ageGenderNet.loadFromUri(MODEL_URL);
      setScanProgress(100);
      
      if (isMountedRef.current) {
        setModelsLoaded(true);
        setScanStatus("✅ AI models ready!");
      }
      return true;
    } catch (e) {
      console.error("Failed to load models:", e);
      setScanStatus("❌ Failed to load AI models");
      return false;
    }
  };

  const startCamera = async () => {
    try {
      setScanStatus("📷 Starting camera...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', 
          width: { ideal: 640, max: 1280 }, 
          height: { ideal: 480, max: 720 } 
        } 
      });
      
      if (!isMountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return false;
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        return new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(() => {
                // Setup canvas for analysis
                if (canvasRef.current) {
                  canvasRef.current.width = videoRef.current.videoWidth;
                  canvasRef.current.height = videoRef.current.videoHeight;
                }
                setScanStatus("👤 Position your face in the oval...");
                resolve(true);
              })
              .catch(() => {
                setScanStatus("❌ Could not start video");
                resolve(false);
              });
          };
        });
      }
      return true;
    } catch (e) {
      if (e.name === 'NotAllowedError') {
        setScanStatus("❌ Camera permission denied");
      } else if (e.name === 'NotFoundError') {
        setScanStatus("❌ No camera found");
      } else {
        setScanStatus(`❌ Camera error: ${e.message}`);
      }
      return false;
    }
  };

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (isMountedRef.current) {
      setScanning(false);
      setScanProgress(0);
    }
  }, []);

  const analyzeFrame = async () => {
    const faceAPI = getFaceAPI();
    if (!faceAPI || !videoRef.current || !canvasRef.current) return null;
    if (videoRef.current.readyState < 2) return null;
    
    try {
      // Draw current frame to canvas for pixel analysis
      const ctx = canvasRef.current.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      const detection = await faceAPI
        .detectSingleFace(videoRef.current, new faceAPI.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5
        }))
        .withFaceLandmarks()
        .withAgeAndGender();
      
      if (!detection) return null;
      
      // Enhanced analysis
      const landmarks = detection.landmarks;
      const faceBox = detection.detection.box;
      const detectedGender = detection.gender;
      const age = detection.age;
      
      // Detect features
      const hasGlasses = analyzeRegionForGlasses(canvasRef.current, ctx, landmarks, faceBox);
      const hasBeard = analyzeRegionForBeard(canvasRef.current, ctx, landmarks, faceBox, detectedGender);
      const skinTone = detectSkinTone(canvasRef.current, ctx, landmarks, faceBox);
      const faceShape = detectFaceShape(landmarks);
      
      return {
        gender: detectedGender,
        age: Math.round(age),
        hasGlasses,
        hasBeard,
        skinTone,
        faceShape,
        confidence: detection.detection.score
      };
    } catch (e) {
      console.error("Analysis error:", e);
      return null;
    }
  };

  const runDetectionLoop = async () => {
    let attempts = 0;
    const maxAttempts = 20;
    let bestDetection = null;
    let bestConfidence = 0;
    
    while (scanningRef.current && attempts < maxAttempts && isMountedRef.current) {
      const progress = Math.round(((attempts + 1) / maxAttempts) * 100);
      setScanProgress(progress);
      setScanStatus(`🔍 Analyzing face... ${progress}%`);
      
      const detection = await analyzeFrame();
      
      if (detection && detection.confidence > bestConfidence) {
        bestDetection = detection;
        bestConfidence = detection.confidence;
        
        // If we have a good detection (>0.8), we can stop early
        if (bestConfidence > 0.8 && attempts > 5) {
          break;
        }
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    if (bestDetection && isMountedRef.current) {
      setDetectedFeatures(bestDetection);
      applyDetectedFeatures(bestDetection);
      return true;
    }
    
    if (isMountedRef.current && scanningRef.current) {
      setScanStatus("😕 No face detected. Try better lighting.");
      setTimeout(() => stopCamera(), 2000);
    }
    
    return false;
  };

  const applyDetectedFeatures = (features) => {
    const g = filterGender || features.gender;
    const age = features.age;
    
    const newAvatar = {
      ...avatar,
      gender: g,
      faceShape: features.faceShape,
      skin: features.skinTone,
      hair: getHairColorForAge(age),
      hairStyle: getHairStyleForAge(age, g),
      eye: EYE[Math.floor(Math.random() * 8)],
      lip: g === "female" ? LIP[Math.floor(Math.random() * LIP.length)] : LIP[0],
      accessory: features.hasGlasses ? "glasses" : "none",
      hasBeard: features.hasBeard,
      bg: BG[Math.floor(Math.random() * BG.length)]
    };
    
    setAvatar(newAvatar);
    if (!filterGender) setGender(g);
    
    const featuresList = [];
    featuresList.push(`${g}`);
    featuresList.push(`~${age} years old`);
    if (features.hasGlasses) featuresList.push("👓 glasses");
    if (features.hasBeard) featuresList.push("🧔 beard");
    featuresList.push(`${features.faceShape} face`);
    
    setScanStatus(`✅ Detected: ${featuresList.join(", ")}`);
    
    setTimeout(() => {
      if (isMountedRef.current) {
        stopCamera();
        setActiveTab("customize");
      }
    }, 2000);
  };

  const startScan = async () => {
    if (scanningRef.current) return;
    
    scanningRef.current = true;
    setScanning(true);
    setDetectedFeatures(null);
    setScanProgress(0);
    setScanStatus("🚀 Initializing...");
    
    const loaded = await loadModels();
    if (!loaded || !isMountedRef.current) {
      scanningRef.current = false;
      setScanning(false);
      return;
    }
    
    const cameraStarted = await startCamera();
    if (!cameraStarted || !isMountedRef.current) {
      scanningRef.current = false;
      setScanning(false);
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!scanningRef.current || !isMountedRef.current) {
      stopCamera();
      return;
    }
    
    await runDetectionLoop();
  };

  const filteredPresets = filterGender ? PRESETS[filterGender] : PRESETS[gender];

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  const renderContent = () => (
    <div className={`avatar-creator-inner ${fullScreen ? 'avatar-creator-inner--fullscreen' : ''}`}>
      <div className="avatar-creator-header">
        <h3>🎨 {fullScreen ? 'Choose Your Avatar' : 'Create Your Avatar'}</h3>
        {isModal && onClose && (
          <button className="avatar-close-btn" onClick={onClose}>✕</button>
        )}
      </div>
      
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
            onClick={() => { 
              setActiveTab('scan');
              if (scanning) stopCamera();
            }}
          >
            📷 Face Scan
          </button>
        )}
      </div>
      
      <div className={`avatar-creator-content ${fullScreen ? 'avatar-creator-content--fullscreen' : ''}`}>
        {/* Preview Section */}
        <div className={`avatar-preview-section ${fullScreen ? 'avatar-preview-section--fullscreen' : ''}`}>
          <div 
            className="avatar-preview-box" 
            dangerouslySetInnerHTML={{ __html: buildAvatarSVG(avatar, fullScreen ? 220 : 200) }} 
          />
          <div className="avatar-actions">
            <button className="avatar-action-btn" onClick={randomize}>
              🎲 Random
            </button>
            <button className="avatar-action-btn save" onClick={handleSave}>
              💾 {fullScreen ? 'Use Avatar' : 'Save'}
            </button>
          </div>
          
          {/* Feature badges */}
          {detectedFeatures && (
            <div className="detected-features-badges">
              <span className="feature-badge">👤 {detectedFeatures.gender}</span>
              <span className="feature-badge">🎂 ~{detectedFeatures.age}y</span>
              {detectedFeatures.hasGlasses && <span className="feature-badge">👓</span>}
              {detectedFeatures.hasBeard && <span className="feature-badge">🧔</span>}
            </div>
          )}
        </div>
        
        {/* Controls Section */}
        <div className={`avatar-controls-section ${fullScreen ? 'avatar-controls-section--fullscreen' : ''}`}>
          {/* PRESETS TAB */}
          {activeTab === 'presets' && (
            <>
              {!filterGender && (
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
              )}
              
              <div className="avatar-section">
                <label>Choose a Preset</label>
                <div className={`avatar-presets-grid ${fullScreen ? 'avatar-presets-grid--large' : ''}`}>
                  {filteredPresets.map((preset, i) => (
                    <button 
                      key={i} 
                      className={`avatar-preset-card ${avatar.skin === preset.skin && avatar.hairStyle === preset.hairStyle ? 'selected' : ''}`}
                      onClick={() => selectPreset(preset)}
                    >
                      <div dangerouslySetInnerHTML={{ __html: buildAvatarSVG(preset, fullScreen ? 80 : 70) }} />
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
              {!filterGender && (
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
              )}

              <div className="avatar-section">
                <label>Face Shape</label>
                <div className="avatar-pills">
                  {FACE_SHAPES.map((shape) => (
                    <button
                      key={shape.id}
                      className={`avatar-pill ${avatar.faceShape === shape.id ? "selected" : ""}`}
                      onClick={() => update("faceShape", shape.id)}
                    >
                      {shape.label}
                    </button>
                  ))}
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

              {/* Beard option for males */}
              {gender === "male" && (
                <div className="avatar-section">
                  <label>Facial Hair</label>
                  <div className="avatar-pills">
                    <button
                      className={`avatar-pill ${!avatar.hasBeard ? "selected" : ""}`}
                      onClick={() => update("hasBeard", false)}
                    >
                      Clean Shaven
                    </button>
                    <button
                      className={`avatar-pill ${avatar.hasBeard ? "selected" : ""}`}
                      onClick={() => update("hasBeard", true)}
                    >
                      🧔 Beard
                    </button>
                  </div>
                </div>
              )}
              
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
              <div className="scan-preview-container">
                <div className="scan-preview">
                  {scanning ? (
                    <>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        playsInline 
                        className="scan-video"
                      />
                      <canvas ref={canvasRef} className="scan-canvas" />
                      <div className="scan-overlay">
                        <svg className="scan-oval" viewBox="0 0 200 260" preserveAspectRatio="xMidYMid meet">
                          <ellipse 
                            cx="100" 
                            cy="130" 
                            rx="85" 
                            ry="110" 
                            fill="none" 
                            stroke="var(--accent-primary)" 
                            strokeWidth="3"
                            strokeDasharray="10,5"
                            className="scan-oval-path"
                          />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <div className="scan-placeholder">
                      <span>📷</span>
                      <p>AI-powered face scan will detect your features and create a matching avatar</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              {scanning && scanProgress > 0 && (
                <div className="scan-progress-bar">
                  <div className="scan-progress-fill" style={{ width: `${scanProgress}%` }}></div>
                </div>
              )}
              
              <div className={`scan-status ${scanStatus.includes('✅') ? 'success' : scanStatus.includes('❌') ? 'error' : ''}`}>
                {scanStatus}
              </div>
              
              <div className="scan-actions">
                {scanning ? (
                  <button className="scan-btn cancel" onClick={stopCamera}>
                    ✕ Cancel
                  </button>
                ) : (
                  <button className="scan-btn start" onClick={startScan}>
                    Start Face Scan
                  </button>
                )}
              </div>
              
              <div className="scan-features-list">
                <p className="scan-features-title">🔍 AI will detect:</p>
                <div className="scan-features-grid">
                  <span>👤 Gender</span>
                  <span>🎂 Age</span>
                  <span>👓 Glasses</span>
                  <span>🧔 Beard</span>
                  <span>🎨 Skin tone</span>
                  <span>📐 Face shape</span>
                </div>
              </div>
              
              <div className="scan-tips">
                <p className="scan-tip-title">💡 Tips for best results:</p>
                <ul className="scan-tip-list">
                  <li>🔆 Good, even lighting on your face</li>
                  <li>👤 Face the camera directly</li>
                  <li>📐 Center your face in the oval</li>
                  <li>😐 Neutral expression works best</li>
                </ul>
              </div>
              
              <div className="scan-note">
                <p>🔒 All processing is done locally in your browser. Your camera feed is never uploaded.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="avatar-creator-fullscreen">
        {renderContent()}
      </div>
    );
  }

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