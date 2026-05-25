/**
 * Compiles a simple glob pattern (only `*` as a wildcard) into an
 * anchored RegExp. Used by allow-list / deny-list rules
 * (`forbid-component-props`, `forbid-elements`, `jsx-handler-names`,
 * `label-has-associated-control`, `no-unstable-nested-components`)
 * for matching component names + prop names against user-supplied
 * patterns.
 *
 * NOT a full picomatch / minimatch — character classes, `?`,
 * `**`, brace expansion, etc. are not handled. The four rule-side
 * call sites only ever pass plain `*` globs (`onClick`, `on*`,
 * `*Handler`), so the cheap escape-then-replace shape is enough
 * and avoids pulling picomatch into the per-file rule path.
 */
export const compileGlob = (pattern: string): RegExp => {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*");
  return new RegExp(`^${escaped}$`);
};
