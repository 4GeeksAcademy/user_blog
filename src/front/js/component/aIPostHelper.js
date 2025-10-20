// src/front/js/component/AIPostHelper.js
import React, { useState } from 'react';
import { FaRobot, FaLightbulb, FaSync, FaTimes } from 'react-icons/fa';

export const AIPostHelper = ({ onSuggestionSelect }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Base de datos de sugerencias por categorías
    const suggestionCategories = {
        personal: [
            "Comparte algo que aprendiste hoy 🎓",
            "¿Qué te hizo sonreír hoy? 😊",
            "Una lección de vida que quieres compartir 🌟",
            "Algo por lo que estás agradecido hoy 🙏",
            "Un recuerdo especial que quieres compartir 📸"
        ],
        preguntas: [
            "¿Qué libro/música/película me recomiendan? 📚",
            "¿Algún consejo para mejorar en [tu ocupación]? 💼",
            "¿Qué planes tienen para el fin de semana? 🗓️",
            "¿Alguna recomendación de lugar para visitar? 🗺️",
            "¿Qué hábito positivo han incorporado recientemente? 🌱"
        ],
        profesionales: [
            "Comparte un logro profesional reciente 🏆",
            "Un proyecto en el que estás trabajando 💻",
            "Consejos para alguien que empieza en tu área 🚀",
            "Herramientas que te han ayudado en tu trabajo 🛠️",
            "Reflexiones sobre tendencias en tu industria 📈"
        ],
        entretenimiento: [
            "Recomienda una película/serie que te encantó 🎬",
            "La mejor canción que escuchaste esta semana 🎵",
            "Un meme o video divertido que viste 😂",
            "Tu juego o app favorita del momento 🎮",
            "Un hobby que te apasiona 🎨"
        ]
    };

    const generateSuggestions = async (category = null) => {
        setLoading(true);
        try {
            // Simular delay de IA (puedes reemplazar con API real después)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            let selectedSuggestions = [];
            
            if (category && suggestionCategories[category]) {
                // Sugerencias específicas de categoría
                selectedSuggestions = [...suggestionCategories[category]]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3);
            } else {
                // Mezclar sugerencias de todas las categorías
                const allSuggestions = Object.values(suggestionCategories).flat();
                selectedSuggestions = [...allSuggestions]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 5);
            }
            
            setSuggestions(selectedSuggestions);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Error generating suggestions:", error);
            // Fallback a sugerencias predefinidas
            setSuggestions([
                "Comparte algo especial de tu día 🌟",
                "¿Alguna pregunta para la comunidad? 💭",
                "Comparte un logro reciente 🎉"
            ]);
            setShowSuggestions(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        onSuggestionSelect(suggestion);
        setShowSuggestions(false);
    };

    const closeSuggestions = () => {
        setShowSuggestions(false);
        setSuggestions([]);
    };

    return (
        <div className="card bg-dark text-light border-0 mb-3">
            <div className="card-body">
                {/* Header del Asistente */}
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                        <FaRobot className="text-primary me-2 fs-5" />
                        <h6 className="mb-0 fw-bold">Asistente de Publicaciones</h6>
                    </div>
                    {showSuggestions && (
                        <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={closeSuggestions}
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                {/* Botón principal */}
                {!showSuggestions && (
                    <button 
                        className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => generateSuggestions()}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <FaSync className="spinner" />
                                Generando ideas...
                            </>
                        ) : (
                            <>
                                <FaLightbulb />
                                ¿Necesitas ideas para publicar?
                            </>
                        )}
                    </button>
                )}

                {/* Categorías rápidas */}
                {!showSuggestions && !loading && (
                    <div className="mt-3">
                        <small className="text-muted d-block mb-2">Ideas por categoría:</small>
                        <div className="d-flex flex-wrap gap-2">
                            <button 
                                className="btn btn-sm btn-outline-info"
                                onClick={() => generateSuggestions('personal')}
                            >
                                Personal
                            </button>
                            <button 
                                className="btn btn-sm btn-outline-success"
                                onClick={() => generateSuggestions('preguntas')}
                            >
                                Preguntas
                            </button>
                            <button 
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => generateSuggestions('profesionales')}
                            >
                                Profesional
                            </button>
                            <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => generateSuggestions('entretenimiento')}
                            >
                                Entretenimiento
                            </button>
                        </div>
                    </div>
                )}

                {/* Lista de sugerencias */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="mt-3">
                        <small className="text-muted d-block mb-2">
                            💡 Selecciona una idea:
                        </small>
                        <div className="suggestions-list">
                            {suggestions.map((suggestion, index) => (
                                <div 
                                    key={index}
                                    className="suggestion-item p-3 border border-secondary rounded mt-2 cursor-pointer hover-effect"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    style={{ 
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        background: 'rgba(255,255,255,0.05)'
                                    }}
                                >
                                    <div className="d-flex align-items-start">
                                        <span className="text-primary me-2">•</span>
                                        <small className="flex-grow-1">{suggestion}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Botón para más ideas */}
                        <button 
                            className="btn btn-outline-secondary btn-sm w-100 mt-3"
                            onClick={() => generateSuggestions()}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FaSync className="spinner" />
                                    Generando más ideas...
                                </>
                            ) : (
                                <>
                                    <FaLightbulb />
                                    Más ideas
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};