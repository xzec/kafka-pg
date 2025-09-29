export function stringifyValue(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  try {
    return JSON.stringify(value, (_, item) => (typeof item === 'bigint' ? item.toString() : item), 2)
  } catch (error) {
    return `/* unable to stringify value: ${String(error)} */`
  }
}
