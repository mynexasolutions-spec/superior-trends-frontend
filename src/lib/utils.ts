export function cn(...inputs: any[]) {
  return inputs
    .flat(Infinity)
    .filter((val) => typeof val === 'string' && val.trim() !== '')
    .join(' ');
}
