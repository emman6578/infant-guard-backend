export const calculateAge = (
  birthday: Date
): { years: number; months: number; days: number; totalAgeInDays: number } => {
  const today = new Date();
  const birthDate = new Date(birthday);

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  // Adjust years and months if the birthday hasn't occurred yet this year
  if (months < 0 || (months === 0 && days < 0)) {
    years -= 1;
    months += 12;
  }

  // Adjust days if needed
  if (days < 0) {
    // Get the number of days in the previous month
    const previousMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    ).getDate();
    days += previousMonth;
    months -= 1;

    // If months become negative, adjust years and months again
    if (months < 0) {
      months += 12;
      years -= 1;
    }
  }

  // Calculate total age in days
  const totalAgeInDays = Math.floor(
    (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return { years, months, days, totalAgeInDays };
};
