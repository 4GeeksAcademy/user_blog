import React,{ useContext, useState } from "react";
import axios from "axios";

import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";    

export const Login=()=> { 
    // const [formData, setFormData] = useState({ email: "", password: "" });
     const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
    const [message, setMessage] = useState("");
    const { actions ,store} = useContext(Context);
    const navigate = useNavigate();
  
 
 const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await actions.loginUsuario({ email, password });

    if (user) {
      navigate('/perfil', { state: { nombre: user.usuario.first_name } });
      
    } else {  
      setMessage("Credenciales incorrectas");
    }   
  }; 

    return (
        <div className="container my-4 p-4 mt-6 shadow rounded bg-light" style={{ maxWidth: "500px" }}>
            <h2 className="text-center mb-5">Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-5">
                    <label className="form-label">Correo electrónico *</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo electrónico"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="form-label">Contraseña *</label>
                    <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        required
                    />        
                </div>
                <div className="d-grid mb-3">
                  <button type="submit" className="btn btn-primary w-100">
    Iniciar Sesión
</button>

                    
                </div>
                {message && <p className="text-danger text-center">{message}</p>}
                <div className="text-center text-danger">
                    Don’t have an account? <Link to="/register">Sign up</Link>
                </div>
            </form>
        </div>
    );    
      
}
