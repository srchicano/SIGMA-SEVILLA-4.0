
import React from 'react';
import { ApprovedUser, UserRole } from '../types';

interface Props {
    users: ApprovedUser[];
    onUpdateRole: (userId: string, role: UserRole) => void;
    onDeleteUser: (userId: string) => void;
    onClose: () => void;
}

export const UserManagement: React.FC<Props> = ({ users, onUpdateRole, onDeleteUser, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
            <div className="bg-white w-[80%] max-w-4xl h-[80%] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className="bg-[#006338] p-4 text-white flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold">Administración de Usuarios</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-300">✕</button>
                </div>

                <div className="flex-1 overflow-auto p-6 bg-gray-50">
                    <table className="w-full text-left border-collapse bg-white rounded-lg shadow overflow-hidden">
                        <thead className="bg-gray-200 text-gray-700 uppercase text-sm font-bold">
                            <tr>
                                <th className="p-4">Matrícula</th>
                                <th className="p-4">Nombre Completo</th>
                                <th className="p-4">Rol Actual</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{user.matricula}</td>
                                    <td className="p-4 text-gray-600">
                                        {user.name} {user.surname1} {user.surname2}
                                    </td>
                                    <td className="p-4">
                                        <select 
                                            className="border border-gray-300 rounded p-1 text-sm font-bold"
                                            value={user.role}
                                            onChange={(e) => onUpdateRole(user.id, e.target.value as UserRole)}
                                        >
                                            <option value={UserRole.AGENT}>AGENTE</option>
                                            <option value={UserRole.SUPERVISOR}>SUPERVISOR</option>
                                            <option value={UserRole.ADMIN}>ADMINISTRADOR</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Only needed here to stop bubbling
                                                if(confirm(`¿Seguro que desea eliminar al usuario ${user.matricula}?`)) {
                                                    onDeleteUser(user.id);
                                                }
                                            }}
                                            className="bg-red-100 text-red-600 px-3 py-1 rounded font-bold text-xs hover:bg-red-200 transition-colors z-10 relative cursor-pointer"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">No hay usuarios registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
