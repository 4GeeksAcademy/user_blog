// src/front/js/pages/profilePublic.js
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/public.css";
import { FaMapMarkerAlt, FaUserPlus, FaUserCheck, FaEnvelope, FaUsers, FaEye } from "react-icons/fa";

const ProfilePublic = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { store } = useContext(Context);
    const [usuario, setUsuario] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFriend, setIsFriend] = useState(false);
    const [friendsCount, setFriendsCount] = useState(0);

    const currentUser = store.currentUser || JSON.parse(localStorage.getItem("currentUser"));
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                
                // Obtener datos del usuario
                const userResp = await fetch(
                    `${process.env.BACKEND_URL}/usuarios/${userId}`,
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
                    
                    // Obtener amigos del usuario
                    const friendsResp = await fetch(
                        `${process.env.BACKEND_URL}/usuarios/${userId}/amigos`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );
                    
                    if (friendsResp.ok) {
                        const friendsData = await friendsResp.json();
                        setFriendsCount(friendsData.length);
                        
                        // Verificar si es amigo del usuario actual
                        if (currentUser) {
                            const isUserFriend = friendsData.some(friend => friend.id === currentUser.id);
                            setIsFriend(isUserFriend);
                        }
                    }
                    
                    // Obtener posts del usuario
                    const postsResp = await fetch(
                        `${process.env.BACKEND_URL}/posts`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );
                    
                    if (postsResp.ok) {
                        const allPosts = await postsResp.json(); 
                        const userPosts = allPosts.filter(post => 
                            post.usuario_id === parseInt(userId) || post.userId === parseInt(userId)
                        );
                        setPosts(userPosts);
                    }
                }
            } catch (error) {
                console.error("Error al cargar perfil público:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId && token) {
            fetchProfileData();
        }
    }, [userId, token, currentUser]);

    const handleAddFriend = async () => {
        try {
            const res = await fetch(
                `${process.env.BACKEND_URL}/usuarios/${userId}/toggle-friend`,
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
                setIsFriend(!isFriend);
                setFriendsCount(prev => isFriend ? prev - 1 : prev + 1);
                alert(data.message);
            }
        } catch (error) {
            console.error("Error al agregar/eliminar amigo:", error);
        }
    };

    if (loading) {
        return (
            <div className="container-fluid mt-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8">
                        <div className="text-center text-light py-5">
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p>Cargando perfil...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!usuario) {
        return (
            <div className="container-fluid mt-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8">
                        <div className="text-center text-light py-5">
                            <i className="bi bi-person-x display-1 text-muted mb-3"></i>
                            <h3>Usuario no encontrado</h3>
                            <p className="text-muted">El perfil que buscas no existe o no está disponible.</p>
                            <button 
                                className="btn btn-primary mt-3"
                                onClick={() => navigate("/")}
                            >
                                Volver al inicio
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser && currentUser.id === parseInt(userId);

    return (
        <div className="container-fluid mt-4">
            <div className="row justify-content-center">
                {/* Header del Perfil Público */}
                <div className="col-12 col-md-8 mb-4">
                    <div className="card bg-dark text-light border-0 shadow-lg">
                        {/* Cover Photo */}
                        <div 
                            className="card-header position-relative"
                            style={{
                                height: '200px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none'
                            }}
                        >
                            <div className="position-absolute bottom-0 start-0 p-4">
                                <div className="d-flex align-items-end">
                                    {/* Avatar */}
                                    <img
                                        src={usuario.picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                        alt="Avatar"
                                        className="rounded-circle border-4 border-dark"
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    {/* Información del usuario */}
                                    <div className="ms-4 text-light">
                                        <h2 className="mb-1">{usuario.first_name} {usuario.last_name}</h2>
                                        <p className="text-light mb-2">{usuario.occupation || "Sin ocupación"}</p>
                                        <div className="d-flex align-items-center gap-3">
                                            {usuario.location && (
                                                <div className="d-flex align-items-center text-light">
                                                    <FaMapMarkerAlt className="me-2" />
                                                    <span>{usuario.location}</span>
                                                </div>
                                            )}
                                            <div className="d-flex align-items-center text-light">
                                                <FaUsers className="me-2" />
                                                <span>{friendsCount} amigos</span>
                                            </div>
                                            {usuario.views && (
                                                <div className="d-flex align-items-center text-light">
                                                    <FaEye className="me-2" />
                                                    <span>{usuario.views} vistas</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="card-body pt-5 mt-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    {usuario.email && (
                                        <div className="d-flex align-items-center text-muted mb-2">
                                            <FaEnvelope className="me-2" />
                                            <span>{usuario.email}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="d-flex gap-2">
                                    {!isOwnProfile && currentUser && (
                                        <button
                                            className={`btn ${isFriend ? 'btn-outline-danger' : 'btn-primary'} d-flex align-items-center`}
                                            onClick={handleAddFriend}
                                        >
                                            {isFriend ? (
                                                <>
                                                    <FaUserCheck className="me-2" />
                                                    Amigos
                                                </>
                                            ) : (
                                                <>
                                                    <FaUserPlus className="me-2" />
                                                    Agregar amigo
                                                </>
                                            )}
                                        </button>
                                    )}
                                    
                                    {isOwnProfile && (
                                        <button
                                            className="btn btn-outline-light"
                                            onClick={() => navigate("/perfil")}
                                        >
                                            Mi perfil personal
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="col-12 col-md-8 mb-4">
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <div className="card bg-secondary text-center text-light border-0">
                                <div className="card-body">
                                    <h4 className="text-primary">{posts.length}</h4>
                                    <p className="mb-0 text-muted">Publicaciones</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="card bg-secondary text-center text-light border-0">
                                <div className="card-body">
                                    <h4 className="text-primary">{friendsCount}</h4>
                                    <p className="mb-0 text-muted">Amigos</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="card bg-secondary text-center text-light border-0">
                                <div className="card-body">
                                    <h4 className="text-primary">{usuario.impressions || 0}</h4>
                                    <p className="mb-0 text-muted">Impresiones</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Publicaciones del usuario */}
                <div className="col-12 col-md-8">
                    <div className="card bg-dark text-light border-0 shadow-sm">
                        <div className="card-header bg-transparent border-bottom border-secondary">
                            <h5 className="mb-0">
                                <i className="bi bi-images me-2"></i>
                                Publicaciones de {usuario.first_name}
                            </h5>
                        </div>
                        <div className="card-body">
                            {posts.length > 0 ? (
                                <div className="row">
                                    {posts.map((post) => (
                                        <div key={post.id} className="col-12 mb-4">
                                            <div className="card bg-secondary border-0">
                                                <div className="card-body">
                                                    <p className="card-text">{post.description}</p>
                                                    {post.picture && (
                                                        <img
                                                            src={post.picture}
                                                            alt="Post"
                                                            className="img-fluid rounded mb-3"
                                                            style={{ maxHeight: '300px', objectFit: 'cover' }}
                                                        />
                                                    )}
                                                    <div className="d-flex justify-content-between text-muted small">
                                                        <span>
                                                            <i className="bi bi-heart me-1"></i>
                                                            {post.likes_count || Object.keys(post.likes || {}).length}
                                                        </span>
                                                        <span>
                                                            <i className="bi bi-chat me-1"></i>
                                                            {post.comments_count || post.comments?.length || 0} comentarios
                                                        </span>
                                                        <span>
                                                            {new Date(post.created_at || post.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="bi bi-newspaper display-1 text-muted mb-3"></i>
                                    <h5 className="text-muted">No hay publicaciones</h5>
                                    <p className="text-muted">
                                        {isOwnProfile 
                                            ? "Aún no has hecho ninguna publicación" 
                                            : `${usuario.first_name} no ha hecho publicaciones aún`
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePublic;