import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaUserMinus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../styles/profil.css";

export const ProfileWidget = () => {
    const [usuario, setUsuario] = useState(null);
    const [amigos, setAmigos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [coords, setCoords] = useState(null);
    const navigate = useNavigate();

    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    const token = localStorage.getItem("token");

    // 🔥 FUNCIÓN PARA CARGAR AMIGOS
    const fetchAmigos = async () => {
        try {
            const friendsResp = await fetch(
                `${process.env.BACKEND_URL}/usuarios/${storedUser.id}/amigos`,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    } 
                }
            );
            
            if (friendsResp.ok) {
                const friendsData = await friendsResp.json();
                setAmigos(friendsData);
            } else {
                console.error("Error al cargar amigos");
            }
        } catch (error) {
            console.error("Error al cargar amigos:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Obtener usuario
                const userResp = await fetch(
                    `${process.env.BACKEND_URL}/usuarios/${storedUser.id}`,
                    { 
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        } 
                    }
                );
                
                if (userResp.ok) {
                    const userData = await userResp.json();
                    setUsuario(userData);
                }

                // Obtener amigos - 🔥 CORREGIDO: Usar la URL correcta
                await fetchAmigos();

            } catch (error) {
                console.error("Error al cargar perfil:", error);
            } finally {
                setLoading(false);
            }
        };

        if (storedUser && token) {
            fetchData();
        }
    }, [storedUser?.id, token]);

    // 🔥 FUNCIÓN PARA AGREGAR/ELIMINAR AMIGO
    const toggleFriend = async (friendId) => {
        try {
            const res = await fetch(
                `${process.env.BACKEND_URL}/usuarios/${friendId}/toggle-friend`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (res.ok) {
                const data = await res.json();
                // 🔥 ACTUALIZAR LA LISTA DE AMIGOS INMEDIATAMENTE
                setAmigos(data.friends || []);
                alert(data.message);
            } else {
                const errorData = await res.json();
                alert("Error: " + (errorData.error || "No se pudo completar la acción"));
            }
        } catch (error) {
            console.error("Error al agregar/eliminar amigo:", error);
            alert("Error de conexión");
        }
    };

    // Obtener ubicación y mostrar mini-mapa
    const handleShowLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setCoords({ lat: latitude, lng: longitude });
                },
                (err) => {
                    alert("No se pudo obtener la ubicación: " + err.message);
                }
            );
        } else {
            alert("La geolocalización no es soportada por tu navegador.");
        }
    };

    if (loading) return <div className="text-white">Cargando perfil...</div>;
    if (!usuario) return <div className="text-white">Error al cargar perfil</div>;

    return (
        <div
            className="text-white bg-dark rounded-4 p-3 shadow-lg position-fixed"
            style={{
                left: "20px",
                top: "100px",
                width: "300px",
                maxHeight: "85vh",
                overflowY: "auto",
            }}
        >
            {/* 🔹 Perfil principal */}
            <div className="text-center mb-3">
                <img
                    src={usuario?.picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt="Foto de perfil"
                    className="rounded-circle mb-2"
                    style={{ width: "60px", height: "60px", objectFit: "cover" }}
                />
                <h5 className="mb-0">{usuario?.first_name || usuario?.firstName} {usuario?.last_name || usuario?.lastName}</h5>
                <p className="text-muted small">{usuario?.occupation}</p>

                {/* Botón para ver ubicación */}
                <button
                    onClick={handleShowLocation}
                    className="btn btn-outline-info btn-sm mt-2 d-flex align-items-center mx-auto gap-2"
                >
                    <FaMapMarkerAlt /> {usuario?.location}
                </button>

                {/* Mini-mapa */}
                {coords && (
                    <div className="mt-3" style={{ height: "200px" }}>
                        <iframe
                            title="Mapa de ubicación"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0, borderRadius: "8px" }}
                            src={`https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                <hr className="border-secondary mt-3" />
            </div>

            {/* 🔹 Estadísticas */}
            <div className="mb-3 small">
                <div className="d-flex justify-content-between">
                    <span className="text-muted">Vistas de perfil</span>
                    <span>{usuario?.views || usuario?.viewer_profile || 0}</span>
                </div>
                <div className="d-flex justify-content-between">
                    <span className="text-muted">Impresiones de posts</span>
                    <span>{usuario?.impressions || 0}</span>
                </div>
                <hr className="border-secondary" />
            </div>

            {/* 🔹 Redes sociales */}
            <div className="mb-3">
                <h6 className="text-secondary">Redes sociales</h6>
                <div className="d-flex align-items-center mb-2">
                    <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" className="me-2" width="20" alt="Twitter" />
                    <span>Twitter</span>
                </div>
                <div className="d-flex align-items-center">
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" className="me-2" width="20" alt="LinkedIn" />
                    <span>LinkedIn</span>
                </div>
                <hr className="border-secondary" />
            </div>

            {/* 🔹 Lista de amigos */}
            <div>
                <h6 className="text-secondary mb-2">Amigos</h6>
                {amigos.length === 0 ? (
                    <p className="text-muted small">No tienes amigos aún 😅</p>
                ) : (
                    amigos.map((amigo) => (
                        <div
                            key={amigo.id}
                            className="d-flex justify-content-between align-items-center mb-2 p-2 rounded-3 bg-secondary bg-opacity-10"
                        >
                            <div className="d-flex align-items-center">
                                <img
                                    src={amigo.picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                    alt={amigo.first_name || amigo.firstName}
                                    className="rounded-circle me-2"
                                    style={{ width: "35px", height: "35px", objectFit: "cover" }}
                                />
                                <div>
                                    <div className="fw-semibold small">
                                        {amigo.first_name || amigo.firstName} {amigo.last_name || amigo.lastName}
                                    </div>
                                    <div className="text-muted small">{amigo.occupation}</div>
                                </div>
                            </div>
                            <button
                                className="btn btn-outline-light btn-sm"
                                onClick={() => toggleFriend(amigo.id)}
                                title="Eliminar amigo"
                            >
                                <FaUserMinus />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};