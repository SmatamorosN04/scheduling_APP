import React from 'react';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';

interface EvidenceItem {
    id: string;
    type: string;
}

interface VisualEvidenceProps {
    evidence: EvidenceItem[];
}

const VisualEvidence = ({ evidence }: VisualEvidenceProps) => {
    if (!evidence || evidence.length === 0) {
        return (
            <div className="mt-6 p-4 border-2 border-dashed border-gray-200 rounded-xl text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500 italic">No visual evidence attached.</p>
            </div>
        );
    }

    return (
        <div className="mt-6 border-t border-gray-100 pt-5">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                Visual Evidence ({evidence.length})
            </h3>

            <div className="grid grid-cols-3 gap-3">
                {evidence.map((item) => {
                    const imageUrl = `/api/media/${item.id}`;

                    return (
                        <div key={item.id} className="group relative">
                            <div className="aspect-square w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm transition-all group-hover:shadow-md">
                                <img
                                    src={imageUrl}
                                    alt="Evidence"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <a
                                    href={imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                    <ExternalLink className="text-white w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VisualEvidence;