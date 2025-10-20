// src/front/js/component/PostWidget.js
import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/post.css";

import { FaImage, FaRobot } from "react-icons/fa";
import { AIPostHelper } from "./aIPostHelper";
// import { AIPostHelper } from "./AIPostHelper"; // 👈 Importar el asistente

export const PostWidget = () => {
    const { actions } = useContext(Context);
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAIHelper, setShowAIHelper] = useState(true); // 👈 Controlar visibilidad

    // 📸 Mostrar preview de la imagen seleccionada
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    // ☁️ Subir imagen a Cloudinary
    const uploadToCloudinary = async () => {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "gex4cmch");
        formData.append("cloud_name", "dqvpdgvnm");

        const res = await fetch("https://api.cloudinary.com/v1_1/dqvpdgvnm/image/upload", {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        return data.secure_url;
    };

    // 🧠 Crear el post
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let pictureUrl = "";
        if (image) {
            pictureUrl = await uploadToCloudinary();
        }

        await actions.createPost({
            description,
            picture: pictureUrl,
            location: "Santiago, Chile"
        });

        setDescription("");
        setImage(null);
        setPreview(null);
        setLoading(false);
        setShowAIHelper(true); // 👈 Mostrar asistente de nuevo después de publicar
    };

    // 🧠 Manejar sugerencia del asistente IA
    const handleSuggestionSelect = (suggestion) => {
        setDescription(suggestion);
        setShowAIHelper(false); // 👈 Ocultar asistente cuando se selecciona una sugerencia
    };

    return (
        <div className="bg-dark text-white rounded-3 p-4 shadow-md mb-4 border-0">
            {/* 🧠 ASISTENTE IA - Solo mostrar si no hay texto y está activo */}
            {showAIHelper && description.length === 0 && (
                <AIPostHelper onSuggestionSelect={handleSuggestionSelect} />
            )}

            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-100 bg-transparent border border-secondary rounded p-3 text-white focus-outline-none focus-border-primary"
                    rows="3"
                    placeholder="¿Qué estás pensando?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={() => setShowAIHelper(false)} // 👈 Ocultar al escribir manualmente
                    style={{ 
                        resize: 'none',
                        borderColor: '#6c757d'
                    }}
                />
                
                {/* Botón para mostrar asistente si está oculto */}
                {!showAIHelper && description.length === 0 && (
                    <button
                        type="button"
                        className="btn btn-outline-primary btn-sm mt-2"
                        onClick={() => setShowAIHelper(true)}
                    >
                        <FaRobot className="me-1" />
                        ¿Necesitas ideas?
                    </button>
                )}

                {preview && (
                    <div className="mt-3 position-relative">
                        <img 
                            src={preview} 
                            alt="preview" 
                            className="rounded w-100" 
                            style={{ maxHeight: '300px', objectFit: 'cover' }} 
                        />
                        <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                            onClick={() => {
                                setPreview(null);
                                setImage(null);
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <label className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 cursor-pointer">
                        <FaImage />
                        <span>Foto</span>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="d-none" 
                            onChange={handleImageChange} 
                        />
                    </label>
                    
                    <button
                        type="submit"
                        disabled={loading || !description.trim()}
                        className="btn btn-primary px-4"
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Publicando...</span>
                                </span>
                                Publicando...
                            </>
                        ) : (
                            "Publicar"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};