// Tự động tổng hợp dữ liệu chi tiết của toàn bộ 16 nhóm tính cách MBTI
import INTJ from './intj.js';
import INTP from './intp.js';
import ENTJ from './entj.js';
import ENTP from './entp.js';
import INFJ from './infj.js';
import INFP from './infp.js';
import ENFJ from './enfj.js';
import ENFP from './enfp.js';
import ISTJ from './istj.js';
import ISFJ from './isfj.js';
import ESTJ from './estj.js';
import ESFJ from './esfj.js';
import ISTP from './istp.js';
import ISFP from './isfp.js';
import ESTP from './estp.js';
import ESFP from './esfp.js';

export {
  INTJ,
  INTP,
  ENTJ,
  ENTP,
  INFJ,
  INFP,
  ENFJ,
  ENFP,
  ISTJ,
  ISFJ,
  ESTJ,
  ESFJ,
  ISTP,
  ISFP,
  ESTP,
  ESFP,
};

export const MBTI_PERSONALITIES = {
  INTJ,
  INTP,
  ENTJ,
  ENTP,
  INFJ,
  INFP,
  ENFJ,
  ENFP,
  ISTJ,
  ISFJ,
  ESTJ,
  ESFJ,
  ISTP,
  ISFP,
  ESTP,
  ESFP,
};

export const getMbtiDetail = (typeCode) => {
  if (!typeCode) return MBTI_PERSONALITIES.INTJ;
  const normalized = String(typeCode).toUpperCase().trim();
  return MBTI_PERSONALITIES[normalized] || MBTI_PERSONALITIES.INTJ;
};

export const ALL_MBTI_CODES = [
  'INTJ',
  'INTP',
  'ENTJ',
  'ENTP',
  'INFJ',
  'INFP',
  'ENFJ',
  'ENFP',
  'ISTJ',
  'ISFJ',
  'ESTJ',
  'ESFJ',
  'ISTP',
  'ISFP',
  'ESTP',
  'ESFP',
];
