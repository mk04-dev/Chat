export {};

declare global {
	interface Array<T> {
		/**
		 * Returns the value of the last element in the array where predicate is true, and undefined
		 * otherwise.
		 * @param predicate findLast calls predicate once for each element of the array, in descending
		 * order, until it finds one where predicate returns true. If such an element is found, findLast
		 * immediately returns that element value. Otherwise, findLast returns undefined.
		 * @param thisArg If provided, it will be used as the this value for each invocation of
		 * predicate. If it is not provided, undefined is used instead.
		 */
		findLast<S extends T>(
			predicate: (value: T, index: number, array: T[]) => value is S,
			thisArg?: any
		): S | undefined;
		findLast(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T | undefined;

		/**
		 * Returns the index of the last element in the array where predicate is true, and -1
		 * otherwise.
		 * @param predicate findLastIndex calls predicate once for each element of the array, in descending
		 * order, until it finds one where predicate returns true. If such an element is found,
		 * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
		 * @param thisArg If provided, it will be used as the this value for each invocation of
		 * predicate. If it is not provided, undefined is used instead.
		 */
		findLastIndex(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): number;

		/**
		 * Returns a copy of an array with its elements reversed.
		 */
		toReversed(): T[];

		/**
		 * Returns a copy of an array with its elements sorted.
		 * @param compareFn Function used to determine the order of the elements. It is expected to return
		 * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
		 * value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
		 * ```ts
		 * [11, 2, 22, 1].toSorted((a, b) => a - b) // [1, 2, 11, 22]
		 * ```
		 */
		toSorted(compareFn?: (a: T, b: T) => number): T[];

		/**
		 * Copies an array and removes elements and, if necessary, inserts new elements in their place. Returns the copied array.
		 * @param start The zero-based location in the array from which to start removing elements.
		 * @param deleteCount The number of elements to remove.
		 * @param items Elements to insert into the copied array in place of the deleted elements.
		 * @returns The copied array.
		 */
		toSpliced(start: number, deleteCount: number, ...items: T[]): T[];

		/**
		 * Copies an array and removes elements while returning the remaining elements.
		 * @param start The zero-based location in the array from which to start removing elements.
		 * @param deleteCount The number of elements to remove.
		 * @returns A copy of the original array with the remaining elements.
		 */
		toSpliced(start: number, deleteCount?: number): T[];

		/**
		 * Copies an array, then overwrites the value at the provided index with the
		 * given value. If the index is negative, then it replaces from the end
		 * of the array.
		 * @param index The index of the value to overwrite. If the index is
		 * negative, then it replaces from the end of the array.
		 * @param value The value to write into the copied array.
		 * @returns The copied array with the updated value.
		 */
		with(index: number, value: T): T[];
	}
}