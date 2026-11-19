export type UpdateAssignments = {
  /** SQL fragments like `title = $2`; always ends with `updated_at = now()`. */
  sets: string[];
  values: unknown[];
  /** Next free parameter index. */
  nextParam: number;
};

/**
 * Builds parameterized `col = $n` assignments for the defined keys of an update input.
 * Only columns in `allowed` are used; `jsonColumns` are serialized and cast to jsonb.
 */
export const buildUpdateAssignments = (
  input: Record<string, unknown>,
  allowed: readonly string[],
  startParam: number,
  jsonColumns: readonly string[] = [],
): UpdateAssignments => {
  const sets: string[] = [];
  const values: unknown[] = [];
  let param = startParam;

  for (const column of allowed) {
    const value = input[column];
    if (value === undefined) {
      continue;
    }
    if (jsonColumns.includes(column)) {
      sets.push(`${column} = $${param}::jsonb`);
      values.push(value === null ? null : JSON.stringify(value));
    } else {
      sets.push(`${column} = $${param}`);
      values.push(value);
    }
    param += 1;
  }

  sets.push('updated_at = now()');
  return { sets, values, nextParam: param };
};
