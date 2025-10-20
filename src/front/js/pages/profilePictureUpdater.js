import React, { useState, useContext } from "react";
import axios from "axios";
import { Context } from "../store/appContext";

export const ProfilePictureUpdater = ({ user }) => {
  const { actions } = useContext(Context);
  const [preview, setPreview] = useState(user?.picture || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage("Subiendo imagen...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "gex4cmch"); // ⚠️ cambia esto
    try {
      // 1. Subir a Cloudinary
      const res = await axios.post(  
        "https://api.cloudinary.com/v1_1/dqvpdgvnm/image/upload", // ⚠️ cambia TU_CLOUD_NAME
        formData
      ); 
      const secureUrl = res.data.secure_url;  
      setPreview(secureUrl);
 
      // 2. Hacer PATCH al backend
      const updatedUser = await actions.updateUserPicture(user.id, secureUrl);

      if (updatedUser) {
        setMessage("✅ Foto actualizada correctamente");
      } else {
        setMessage("❌ Error al actualizar la foto en el servidor");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al subir la imagen");
    } finally {
      setLoading(false);
    }
  };
           
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center">
      <h2 className="text-xl font-bold mb-4">Actualizar foto de perfil</h2>

      {/* Foto actual o preview */}
      <div className="flex justify-center mb-4">
        <img
          src={preview || "https://via.placeholder.com/150"}
          alt="Foto de perfil"
          className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
        />
      </div> 

      {/* Input file */}
      <input 
        type="file"
        accept="image/*"     
        onChange={handleFileChange}
        className="w-full text-sm text-gray-400 
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-500 file:text-white
                   hover:file:bg-blue-600"
        disabled={loading}
      />

      {/* Mensaje */}
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
};
