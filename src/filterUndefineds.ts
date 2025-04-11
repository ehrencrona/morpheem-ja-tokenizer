export function filterUndefineds<T>(arr: (T | undefined | null)[]): T[] {
	return arr.filter((x) => x != null) as T[];
}
