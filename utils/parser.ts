import { Candidate } from '../types';

// Simple ID generator fallback for environments where crypto.randomUUID might be missing
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const parseCandidateList = (text: string): Candidate[] => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const candidates: Candidate[] = [];

  lines.forEach((line) => {
    // Expected format: Department - Name (Class)
    // Supports hyphens (-), en-dashes (–), em-dashes (—) as separators
    // Supports English () and Chinese （） parentheses
    
    // Regex explanation:
    // ^\s*(.+?)       -> Capture Department (lazy) at start
    // \s*[-–—]\s*     -> Separator (hyphen-like) surrounded by optional whitespace
    // (.+?)           -> Capture Name (lazy)
    // \s*[(\uff08]    -> Open parenthesis (English or Chinese)
    // (.+?)           -> Capture Class Name (lazy)
    // [)\uff09]\s*$   -> Close parenthesis (English or Chinese) at end
    
    const regex = /^\s*(.+?)\s*[-–—]\s*(.+?)\s*[(\uff08](.+?)[)\uff09]\s*$/;
    const match = line.match(regex);

    if (match) {
      candidates.push({
        id: generateId(),
        department: match[1].trim(),
        name: match[2].trim(),
        className: match[3].trim(),
        votes: 0,
      });
    } else {
      // Fallback: simple split if regex fails, assuming no class or malformed
      const parts = line.split(/[-–—]/);
      if (parts.length >= 2) {
        candidates.push({
          id: generateId(),
          department: parts[0].trim(),
          name: parts[1].trim(),
          className: '未知班级',
          votes: 0,
        });
      }
    }
  });

  return candidates;
};

export const groupCandidatesByDept = (candidates: Candidate[]) => {
  const groups: Record<string, Candidate[]> = {};
  candidates.forEach(c => {
    if (!groups[c.department]) {
      groups[c.department] = [];
    }
    groups[c.department].push(c);
  });
  return groups;
};