import React from 'react';

export default function ErrorMessage({ message }) {
    return message && <p className="error-message mt-1 text-red-500">{message}</p>;
}
