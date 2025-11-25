import React, { useState } from 'react';

interface Props {
    onClose: () => void;
}

export const Reports: React.FC<Props> = ({ onClose }) => {
    const [type, setType] = useState('DIARIO');

    const generateXML = () => {
        const mockData = "<report><type>" + type + "</type><date>" + new Date().toISOString() + "</date><data>Mock Data Content</data></report>";
        const blob = new Blob([mockData], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `informe_${type.toLowerCase()}_${new Date().toISOString().split('T')[0]}.xml`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const generatePDF = () => {
        alert("Generando PDF... (Simulación: El archivo se descargaría aquí usando jsPDF)");
        // In a real app: const doc = new jsPDF(); doc.text(...); doc.save(...);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl p-8 w-[500px] shadow-2xl">
                <h2 className="text-2xl font-bold text-[#006338] mb-6">Generador de Informes</h2>
                
                <div className="mb-6">
                    <label className="block font-medium mb-2">Tipo de Informe</label>
                    <select 
                        className="w-full border p-2 rounded"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="DIARIO">Informe de Mantenimiento Diario</option>
                        <option value="MENSUAL">Informe de Mantenimiento Mensual</option>
                        <option value="AVERIAS_ELEMENTO">Informe de Averías del Elemento</option>
                        <option value="AVERIAS_DIARIO">Informe de Averías Diario</option>
                    </select>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm text-gray-600 mb-1">Fecha</label>
                        <input type="date" className="w-full border p-2 rounded" />
                     </div>
                     {(type === 'DIARIO' || type === 'AVERIAS_DIARIO') && (
                         <div>
                            <label className="block text-sm text-gray-600 mb-1">Turno</label>
                            <select className="w-full border p-2 rounded">
                                <option>Mañana</option>
                                <option>Tarde</option>
                                <option>Noche</option>
                            </select>
                         </div>
                     )}
                </div>

                <div className="flex gap-4 mt-8">
                    <button onClick={generatePDF} className="flex-1 bg-red-600 text-white py-3 rounded font-bold hover:bg-red-700">
                        Descargar PDF
                    </button>
                    <button onClick={generateXML} className="flex-1 bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">
                        Descargar XML
                    </button>
                </div>

                <button onClick={onClose} className="w-full mt-4 text-gray-500 hover:text-gray-800">
                    Cancelar
                </button>
            </div>
        </div>
    );
};
