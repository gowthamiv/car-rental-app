export function calculateDays(startDate: string, endDate: string): number {
  const msPerDay = 86_400_000;
  return Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / msPerDay);
}