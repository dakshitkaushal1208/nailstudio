const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isEmail = (v) => EMAIL.test(String(v).trim());

// Indian mobile numbers, with or without +91 / 0 prefix.
export const isPhone = (v) => /^(?:\+?91[\s-]?|0)?[6-9]\d{9}$/.test(String(v).replace(/[\s()-]/g, ''));

export const isPin = (v) => /^[1-9]\d{5}$/.test(String(v).trim());

export function passwordIssues(pw) {
  const issues = [];
  if (pw.length < 8) issues.push('at least 8 characters');
  if (!/[a-z]/i.test(pw) || !/\d/.test(pw)) issues.push('a letter and a number');
  return issues;
}

export const hasErrors = (errors) => Object.values(errors).some(Boolean);
