const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toDateParts = (date: Date, timeZone: string) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return { year, month, day };
};

export const isValidTimeZone = (timeZone: string) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
};

export const getTodayLocalDate = (timeZone: string) => {
  const { year, month, day } = toDateParts(new Date(), timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

export const getNowInTimeZone = (timeZone: string) => {
  const now = new Date();
  return {
    now,
    localDate: getTodayLocalDate(timeZone),
  };
};

const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map((part) => Number(part));
  return Date.UTC(year, month - 1, day);
};

export const diffLocalDates = (start: string, end: string) => {
  const diffMs = parseLocalDate(end) - parseLocalDate(start);
  return Math.floor(diffMs / MS_PER_DAY);
};

export const addDaysToLocalDate = (value: string, dayCount: number) => {
  const date = new Date(parseLocalDate(value) + dayCount * MS_PER_DAY);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getYearMonthInTimeZone = (date: Date, timeZone: string) => {
  const { year, month } = toDateParts(date, timeZone);
  return `${year}-${String(month).padStart(2, "0")}`;
};
