export const CalculateDayFromBday = (
  birthday: string,
  month: number,
  additional?: number
) => {
  const startDate = new Date(birthday); // Parse the birthday string into a Date object
  const endDate = new Date(startDate); // Copy start date for calculation

  endDate.setMonth(startDate.getMonth() + month);
  endDate.setDate(endDate.getDate() + additional!);

  // Calculate the number of days between the two dates
  const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in one day
  const daysBetween = Math.round(
    (endDate.getTime() - startDate.getTime()) / oneDay
  );

  return daysBetween;
};
