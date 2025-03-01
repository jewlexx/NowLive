export function log(message?: any, ...optionalParams: any[]): void {
  if (import.meta.main) {
    console.log(message, optionalParams);
  }
}
