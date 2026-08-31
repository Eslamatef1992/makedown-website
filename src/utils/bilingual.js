// Picks the language-appropriate variant of a bilingual DB field (e.g. name_en/name_ar,
// question_en/question_ar). Falls back to the English column if the Arabic one is empty —
// content added before Arabic support existed, or left blank in the admin, still shows
// something rather than a blank string.
export function pickLang(row, field, lang) {
  if (!row) return '';
  if (lang === 'ar') return row[`${field}_ar`] || row[`${field}_en`] || '';
  return row[`${field}_en`] || '';
}
