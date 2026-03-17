import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const MathText = ({ text, className }) => {
    if (!text) return null;

    if (typeof text === 'string') {
        const t = text.trim();
        // Check if string is entirely an image block
        if (t.startsWith('data:image/') || /^https?:\/\/.*\.(jpeg|jpg|gif|png|webp)$/i.test(t)) {
            return (
                <div className="flex justify-center py-2">
                    <img src={t} alt="Graphic" className="max-w-full max-h-64 object-contain rounded-lg shadow-sm bg-white p-1" />
                </div>
            );
        }
    }

    // Check if text has LaTeX delimiters ($...$)
    const parts = text.split(/(\$[^$]+\$)/g);

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.startsWith('$') && part.endsWith('$')) {
                    const mathContent = part.slice(1, -1);
                    try {
                        const html = katex.renderToString(mathContent, {
                            throwOnError: false,
                            displayMode: false // Inline by default
                        });
                        return (
                            <span
                                key={index}
                                dangerouslySetInnerHTML={{ __html: html }}
                            />
                        );
                    } catch (error) {
                        console.error("KaTeX error:", error);
                        return <span key={index} className="text-red-400">{part}</span>;
                    }
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

export default MathText;
