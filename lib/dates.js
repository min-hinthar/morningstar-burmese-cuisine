const PT_TIMEZONE = "America/Los_Angeles";

export function toPacificDate(date = new Date()) {
  const localeString = date.toLocaleString("en-US", { timeZone: PT_TIMEZONE });
  return new Date(localeString);
}

export function getNextSundayPT(fromDate = new Date()) {
  const nowPT = toPacificDate(fromDate);
  const day = nowPT.getDay();
  const daysUntilSunday = day === 0 ? 7 : 7 - day;
  const nextSunday = new Date(nowPT);
  nextSunday.setDate(nowPT.getDate() + daysUntilSunday);
  nextSunday.setHours(8, 0, 0, 0);
  return toPacificDate(nextSunday);
}

export function getCutoffForUpcomingSunday(fromDate = new Date()) {
  const nowPT = toPacificDate(fromDate);
  const nextSunday = getNextSundayPT(nowPT);
  const cutoff = new Date(nextSunday);
  cutoff.setDate(nextSunday.getDate() - 2); // Friday before Sunday delivery
  cutoff.setHours(15, 0, 0, 0); // 3 PM PT
  return toPacificDate(cutoff);
}

export function getUpcomingWindow(fromDate = new Date()) {
  const nowPT = toPacificDate(fromDate);
  let deliveryDate = getNextSundayPT(nowPT);
  let cutoffAt = getCutoffForUpcomingSunday(nowPT);

  if (nowPT >= cutoffAt) {
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    cutoffAt = getCutoffForUpcomingSunday(
      new Date(nowPT.getTime() + 7 * 24 * 60 * 60 * 1000)
    );
  }

  return { deliveryDate, cutoffAt };
}

export function isBeforeCutoff(fromDate = new Date()) {
  const nowPT = toPacificDate(fromDate);
  const { cutoffAt } = getUpcomingWindow(fromDate);
  return nowPT < cutoffAt;
}

export function formatDateShort(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
    timeZone: PT_TIMEZONE,
  }).format(date);
}
