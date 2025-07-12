import React from 'react';

export default function Table({ children, className = '' }) {
  return <table className={`table-auto w-full ${className}`}>{children}</table>;
}
