export const categories = [
  { name: '音楽オーディション・出演者募集', label: 'オーディション', icon: 'mic', color: 'peach' },
  { name: '作曲・楽曲コンペ', label: '作曲・楽曲', icon: 'music', color: 'lavender' },
  { name: '小説・物語', label: '小説・物語', icon: 'book', color: 'sage' },
  { name: 'AIクリエイター', label: 'AI・アート', icon: 'spark', color: 'pink' },
  { name: 'インディーゲーム', label: 'ゲーム', icon: 'game', color: 'blue' },
  { name: '懸賞・キャンペーン・その他', label: 'キャンペーン', icon: 'gift', color: 'sand' },
];
export function parseMarkdown(markdown) {
  let category = '';
  return markdown.split('\n').flatMap(line => {
    if (line.startsWith('## ')) category = line.slice(3).trim();
    const match = line.match(/^\|\s*(.*?)\s*\|\s*\[(.*?)\]\((https?:\/\/[^\s]+)\)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*$/);
    if (!match || !categories.some(c => c.name === category)) return [];
    const [, deadlineText, title, url, organizer, sourceStatus] = match;
    const date = deadlineText.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
    return [{ id: url, title, url, organizer, sourceStatus, category, deadlineText, deadline: date ? `${date[1]}-${date[2].padStart(2, '0')}-${date[3].padStart(2, '0')}` : null }];
  });
}
export function dayKey(now = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function remaining(item, today = dayKey()) {
  return item.deadline ? Math.round((Date.parse(item.deadline) - Date.parse(today)) / 86400000) : null;
}
export function status(item, today = dayKey()) {
  const days = remaining(item, today);
  if (days !== null && days < 0) return '終了';
  // The only supplied start date is recorded in the original source text.
  const start = item.sourceStatus.match(/募集開始前（(\d+)\/(\d+)開始）/);
  if (start && today < `${item.deadline.slice(0,4) === '2027' ? '2026' : item.deadline.slice(0,4)}-${start[1].padStart(2,'0')}-${start[2].padStart(2,'0')}`) return '募集開始前';
  if (days === 0) return '本日締切';
  return days === null ? '毎月募集' : '受付中';
}
export function selectItems(items, { query = '', category = '', view = 'discover', saved = {}, applied = {}, includeClosed = false, sort = 'deadline', today = dayKey() } = {}) {
  const q = query.normalize('NFKC').toLocaleLowerCase().trim();
  return items.filter(item => {
    const s = status(item, today), d = remaining(item, today);
    return (!q || `${item.title} ${item.organizer} ${item.category}`.normalize('NFKC').toLocaleLowerCase().includes(q))
      && (!category || item.category === category)
      && (view === 'saved' ? saved[item.id] : view === 'applied' ? applied[item.id] : true)
      && (view !== 'upcoming' || (d !== null && d >= 0 && d <= 7 && s !== '募集開始前'))
      && (includeClosed || view === 'saved' || view === 'applied' || s !== '終了');
  }).sort((a,b) => sort === 'name' ? a.title.localeCompare(b.title, 'ja') : (a.deadline || '9999').localeCompare(b.deadline || '9999') || a.title.localeCompare(b.title, 'ja'));
}
export function readState(storage) {
  try {
    const data = JSON.parse(storage.getItem('memol-v1'));
    const validMap = (value, type) => value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value).filter(([key,v]) => /^https?:\/\//.test(key) && typeof v === type)) : {};
    return { saved: validMap(data?.saved, 'boolean'), applied: validMap(data?.applied, 'boolean'), notes: validMap(data?.notes, 'string') };
  } catch { return { saved: {}, applied: {}, notes: {} }; }
}
