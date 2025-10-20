import React,{ useContext, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

export const Register =()=> {
const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    location: "",
    occupation: "",
    picture: "",
  });

  const [message, setMessage] = useState("");
  const { actions } = useContext(Context);
  const navigate = useNavigate();
  const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formDataImage = new FormData();
  formDataImage.append("file", file);
  formDataImage.append("upload_preset", "gex4cmch"); // ⚠️ reemplaza con el tuyo

  try {
    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dqvpdgvnm/image/upload",
      formDataImage
    );
    setFormData({ ...formData, picture: res.data.secure_url });
    console.log("Imagen subida:", res.data.secure_url);
  } catch (err) {
    console.error("Error al subir la imagen:", err);
  }
};


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await actions.agregarUsuario(formData);
    console.log("success",success)
    if (success) {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        location: "", 
        occupation: "",
        picture: "",
      });
      navigate("/login");
    } else {
      setMessage("El usuario ya existe o hubo un error");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        {/* Nombre */}
        <label className="block mb-2">
          Nombre <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 rounded bg-gray-700"
          placeholder="Nombre"
        />

        {/* Apellido */}
        <label className="block mb-2">
          Apellido <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 rounded bg-gray-700"
          placeholder="Apellido"  
        />

        {/* Email */}
        <label className="block mb-2">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 rounded bg-gray-700"
          placeholder="Correo electrónico"
        />

        {/* Password */}
        <label className="block mb-2">
          Contraseña <span className="text-red-400">*</span>
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 rounded bg-gray-700"
          placeholder="Contraseña"
        />

        {/* Location */}
        <label className="block mb-2">Ubicación</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-2 mb-4 rounded bg-gray-700"
          placeholder="Ciudad / País"
        />

        {/* Occupation */}
        <label className="block mb-2">Ocupación</label>
        <input
          type="text"
          name="occupation"
          value={formData.occupation}
          onChange={handleChange}
          className="w-full p-2 mb-4 rounded bg-gray-700"
          placeholder="Profesión"
        />

      
<label className="block mb-2">Foto</label>
<input
  type="file"
  accept="image/*"
  onChange={(e) => handleFileChange(e)}
  className="w-full p-2 mb-4 rounded bg-gray-700"
/>


        {/* Botón */}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 p-2 rounded mt-4"
        >
          Register
        </button>

        {/* Mensaje */}
        {message && (
          <p className="text-red-400 text-center mt-3">{message}</p>
        )}

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
