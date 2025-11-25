
import React, { useState } from 'react';
import { UserRole, RegistrationRequest } from '../types';

interface AuthProps {
  onLogin: (matricula: string, password: string) => void;
  onRegister: (request: RegistrationRequest) => void;
}

export async function logout() {
    await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include"
    });
}


export const Auth: React.FC<AuthProps> = ({ onLogin, onRegister }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login State
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [regMatricula, setRegMatricula] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regSurname1, setRegSurname1] = useState('');
  const [regSurname2, setRegSurname2] = useState('');

  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
        // Validations
        if (!regMatricula || !regPassword || !regConfirmPassword || !regName || !regSurname1 || !regSurname2) {
            setError("Todos los campos son obligatorios");
            return;
        }
        if (regPassword !== regConfirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }
        
        onRegister({
            matricula: regMatricula,
            password: regPassword,
            name: regName,
            surname1: regSurname1,
            surname2: regSurname2
        });
        
        // Reset form
        setRegMatricula(''); setRegPassword(''); setRegConfirmPassword('');
        setRegName(''); setRegSurname1(''); setRegSurname2('');
        setIsRegistering(false);
    } else {
        onLogin(matricula, password);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#006338] py-10">
      {/* Logo Area */}
      <div className="mb-10 p-6">
         <img 
            src="https://upload.wikimedia.org/wikipedia/commons/0/03/Adif_logo_2016.svg" 
            alt="ADIF Logo" 
            className="h-40 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]"
         />
      </div>

      <div className="bg-white p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-3xl">
        <h2 className="text-4xl font-bold text-[#006338] mb-10 text-center border-b-4 border-[#006338] pb-4">
            {isRegistering ? 'Registro de Personal' : 'Acceso SIGMA'}
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {!isRegistering ? (
             /* LOGIN FORM */
             <>
                <div>
                    <label className="block text-xl font-bold text-gray-800 mb-3">Matrícula</label>
                    <input
                    type="text"
                    className="w-full border-2 border-gray-300 rounded-xl p-5 text-xl focus:ring-4 focus:ring-[#006338] focus:border-[#006338] outline-none transition-all shadow-inner bg-gray-50"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    placeholder="Introduzca su matrícula"
                    required
                    />
                </div>
                
                <div>
                    <label className="block text-xl font-bold text-gray-800 mb-3">Contraseña</label>
                    <input
                    type="password"
                    className="w-full border-2 border-gray-300 rounded-xl p-5 text-xl focus:ring-4 focus:ring-[#006338] focus:border-[#006338] outline-none transition-all shadow-inner bg-gray-50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    />
                </div>
             </>
          ) : (
             /* REGISTER FORM */
             <>
                <div>
                    <label className="block text-lg font-bold text-gray-800 mb-1">Matrícula</label>
                    <input type="text" value={regMatricula} onChange={e => setRegMatricula(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg focus:ring-[#006338] outline-none bg-gray-50" placeholder="Matrícula" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-lg font-bold text-gray-800 mb-1">Nombre</label>
                        <input type="text" value={regName} onChange={e => setRegName(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg focus:ring-[#006338] outline-none bg-gray-50" placeholder="Nombre" />
                    </div>
                    <div>
                        <label className="block text-lg font-bold text-gray-800 mb-1">Primer Apellido</label>
                        <input type="text" value={regSurname1} onChange={e => setRegSurname1(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg focus:ring-[#006338] outline-none bg-gray-50" placeholder="1er Apellido" />
                    </div>
                </div>
                <div>
                    <label className="block text-lg font-bold text-gray-800 mb-1">Segundo Apellido</label>
                    <input type="text" value={regSurname2} onChange={e => setRegSurname2(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg focus:ring-[#006338] outline-none bg-gray-50" placeholder="2º Apellido" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-lg font-bold text-gray-800 mb-1">Contraseña</label>
                        <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg focus:ring-[#006338] outline-none bg-gray-50" placeholder="••••••" />
                    </div>
                    <div>
                        <label className="block text-lg font-bold text-gray-800 mb-1">Confirmar Contraseña</label>
                        <input type="password" value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg focus:ring-[#006338] outline-none bg-gray-50" placeholder="••••••" />
                    </div>
                </div>
             </>
          )}

          {error && <p className="text-red-600 text-lg font-bold bg-red-50 p-3 rounded border border-red-200 animate-pulse">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-[#006338] text-white text-2xl font-bold py-4 rounded-xl hover:bg-[#004f2d] transition-colors shadow-xl mt-2 transform hover:scale-[1.01]"
          >
            {isRegistering ? 'Enviar Solicitud' : 'Acceder al Sistema'}
          </button>
        </form>
      </div>

      <div className="mt-10 text-white text-lg">
        <span>{isRegistering ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}</span>
        <button 
          onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
          className="font-bold underline hover:text-green-200 text-xl ml-2"
        >
           {isRegistering ? 'Inicia sesión' : 'Regístrese aquí'}
        </button>
      </div>
    </div>
  );
};
