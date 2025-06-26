import React from "react";

export function highlightMentions(text) {
  return text.split(/(@[\w.-]+)/g).map((part, i) => {
    if (part.toLowerCase() === '@dashboard') {
      return React.createElement('span', { key: i, className: 'text-red-500' }, part);
    }
    if (part.startsWith('@')) {
      return React.createElement('span', { key: i, className: 'text-[var(--color-mention)]' }, part);
    }
    return React.createElement('span', { key: i }, part);
  });
}
