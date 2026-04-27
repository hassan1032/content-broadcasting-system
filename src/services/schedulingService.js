function toMillis(value) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

export function selectActiveContent(candidates, now = new Date()) {
  if (!candidates.length) {
    return null;
  }

  const groups = candidates.reduce((acc, item) => {
    const key = item.subject.toLowerCase();
    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key).push(item);
    return acc;
  }, new Map());

  const selected = [];
  for (const items of groups.values()) {
    const ordered = [...items].sort((a, b) => {
      const orderDiff = Number(a.rotation_order) - Number(b.rotation_order);
      return orderDiff || Number(a.id) - Number(b.id);
    });

    const cycleMinutes = ordered.reduce(
      (total, item) => total + Math.max(1, Number(item.duration_minutes ?? 5)),
      0,
    );
    const earliestStart = Math.min(...ordered.map((item) => toMillis(item.start_time)));
    const elapsedMinutes = Math.floor((toMillis(now) - earliestStart) / 60000);
    const position = ((elapsedMinutes % cycleMinutes) + cycleMinutes) % cycleMinutes;

    let cursor = 0;
    const active = ordered.find((item) => {
      cursor += Math.max(1, Number(item.duration_minutes ?? 5));
      return position < cursor;
    });

    if (active) {
      selected.push(active);
    }
  }

  return selected.length === 1 ? selected[0] : selected;
}
