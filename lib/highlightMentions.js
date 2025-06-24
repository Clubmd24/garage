import React from "react";

export function highlightMentions(text) {
  return text.split(/(@[\w.-]+)/g).map((part, i) =>
    part.startsWith('@')
      ? React.createElement('span', { key: i, className: 'text-[var(--color-mention)]' }, part)
      : React.createElement('span', { key: i }, part)
  );
}
