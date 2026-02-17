import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const MathText = ({ text, className }) => {
    if (!text) return null;

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
