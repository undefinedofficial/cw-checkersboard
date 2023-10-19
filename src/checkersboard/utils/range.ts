/**
 * Convert Range values (from, to) to range values(from, to)
 * @param param0 Point
 */
export const ConvertRange = (
  originalStart: number,
  originalEnd: number, // original range
  newStart: number,
  newEnd: number, // desired range
  value: number // value to convert
) => newStart + (value - originalStart) * ((newEnd - newStart) / (originalEnd - originalStart));
