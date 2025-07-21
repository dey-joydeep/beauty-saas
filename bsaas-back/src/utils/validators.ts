// Common validators for use across modules

export function isISODateString(date: string): boolean {
  // Checks for YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?Z?)?$/.test(date);
}

export function isTimeString(time: string): boolean {
  // Checks for HH:mm or HH:mm:ss
  return /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(time);
}

export function isEmail(email: string): boolean {
  // Simple RFC 5322 Official Standard email regex
  return /^[\w.!#$%&'*+/=?^_`{|}~-]+@[\w-]+(\.[\w-]+)+$/.test(email);
}

export function isPhoneNumber(phone: string): boolean {
  // Accepts international and local formats, basic check
  return /^\+?\d{7,15}$/.test(phone);
}

export function hasRequiredFields(obj: Record<string, any>, fields: string[]): string[] {
  return fields.filter((field) => !obj[field]);
}
