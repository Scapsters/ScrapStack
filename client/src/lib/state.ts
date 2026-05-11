export const createMergeWithPreviousMap =
	<K, V>(defaultObject: V) =>
	(key: K, object: Partial<V>) =>
	(prev: Map<K, V>) =>
		new Map(prev).set(key, { ...defaultObject, ...prev.get(key), ...object })
