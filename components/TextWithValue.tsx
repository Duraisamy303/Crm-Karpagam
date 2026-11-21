import { capitalizeFLetter } from '@/utils/functions.utils'
import React from 'react'

function formatLabel(label) {
  return label
    .replace(/_/g, " ")               // replace underscores
    .replace(/\b\w/g, (l) => l.toUpperCase()); // capitalize every word
}

export default function TextWithValue({ value, label }) {
  if (!value) return null;

  return (
    <div className="flex flex-col p-2">
      <div className="text-md text-gray-600">{formatLabel(label)}</div>
      <div className="text-[18px]">{capitalizeFLetter(value)}</div>
    </div>
  );
}
