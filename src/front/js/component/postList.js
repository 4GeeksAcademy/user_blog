// src/front/js/component/PostList.js
import React, { useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { FaHeart, FaRegHeart, FaCommentAlt, FaEllipsisH, FaTrash, FaUserPlus } from "react-icons/fa";
import { CommentSection } from "./commentSection";

export const PostList = ({ isProfilePage = false }) => {
    const { store, actions } = useContext(Context);

    useEffect(() => {
        actions.getAllPosts();
    }, []);

    // Asegurarnos de que posts sea un array
    const posts = Array.isArray(store.posts) ? store.posts : [];

    // 🔥 CORREGIR: Obtener el usuario actual correctamente
    const getCurrentUser = () => {
        if (store.currentUser) {
            return store.currentUser;
        }
        // Si no hay en store, buscar en localStorage
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) { 
            try {
                return JSON.parse(storedUser);
            } catch (error) {
                console.error("Error parsing stored user:", error);
                return null;
            }
        }
        return null;   
    };

    const currentUser = getCurrentUser();
    const currentUserId = currentUser?.id;

    console.log("Current User ID:", currentUserId); // Para debug
    console.log("isProfilePage:", isProfilePage); // Para debug
    console.log("All posts:", posts); // Para debug

    // 🔥 CORREGIR: Filtrar posts según la página
    const filteredPosts = isProfilePage 
        ? posts.filter(post => {
            // Verificar diferentes posibles nombres de propiedad
            const postUserId = post.usuario_id || post.userId || post.user_id;
            console.log(`Post ${post.id}: usuario_id=${post.usuario_id}, userId=${post.userId}, user_id=${post.user_id}`); // Debug
            return postUserId === currentUserId;
        })
        : posts;

    console.log("Filtered posts:", filteredPosts); // Para debug

    if (!filteredPosts.length) return (
        <div className="text-center text-muted py-4">
            <p>{isProfilePage ? "No tienes publicaciones aún." : "No hay publicaciones aún."}</p>
        </div>
    );

    const handleDeletePost = async (postId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta publicación?")) {
            try {
                await actions.eliminarPost(postId);
            } catch (error) {
                console.error("Error al eliminar post:", error);
            }
        }
    };

    // En tu PostList.js - corregir handleAddFriend
const handleAddFriend = async (userId) => {
    try {
        const token = localStorage.getItem("token");
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
            alert(data.message); // "Amigo agregado" o "Amigo eliminado"
            
            // Si quieres actualizar la lista de amigos en el ProfileWidget
            // podrías usar un contexto global o llamar a una función de actualización
        } else {
            const errorData = await res.json();
            alert("Error: " + (errorData.error || "No se pudo agregar amigo"));
        }
    } catch (error) {
        console.error("Error al agregar amigo:", error);
        alert("Error de conexión");
    }
};

    return (
        <div className="row justify-content-center">
            <div className="col-12">
                {filteredPosts.map((post) => {
                    // 🔥 CORREGIR: Obtener el ID del usuario del post
                    const postUserId = post.usuario_id || post.userId || post.user_id;
                    const isOwnPost = postUserId === currentUserId;
                    
                    return (
                        <div key={post.id} className="card mb-4 border-0 shadow-sm bg-dark text-light">
                            {/* 🔹 Cabecera del post */}
                            <div className="card-header bg-transparent border-bottom border-secondary">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <img 
                                            src={post.userPicture || post.picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                            alt="User avatar" 
                                            className="rounded-circle me-3"
                                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                        />
                                        <div>
                                            <h6 className="mb-0 fw-bold">
                                                {post.firstName || post.first_name} {post.lastName || post.last_name}
                                            </h6>
                                            <small className="text-muted">
                                                {post.location} • {new Date(post.created_at || post.createdAt).toLocaleDateString()}
                                            </small>
                                        </div>
                                    </div>
                                    
                                    {/* 🔹 Menú de tres puntitos */}
                                    <div className="dropdown">
                                        <button 
                                            className="btn btn-sm text-muted" 
                                            type="button" 
                                            data-bs-toggle="dropdown"
                                        >
                                            <FaEllipsisH />
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            {isProfilePage ? (
                                                // En perfil: opción para eliminar (solo posts propios)
                                                isOwnPost && (
                                                    <li>
                                                        <button 
                                                            className="dropdown-item text-danger" 
                                                            onClick={() => handleDeletePost(post.id)}
                                                        >
                                                            <FaTrash className="me-2" />
                                                            Eliminar publicación
                                                        </button>
                                                    </li>
                                                )
                                            ) : (
                                                // En home: opción para agregar amigo (solo si no es el usuario actual)
                                                !isOwnPost && (
                                                    <li>
                                                        <button 
                                                            className="dropdown-item text-primary" 
                                                            onClick={() => handleAddFriend(postUserId)}
                                                        >
                                                            <FaUserPlus className="me-2" />
                                                            Agregar como amigo
                                                        </button>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* 🔹 Descripción */}
                            <div className="card-body">
                                <p className="card-text mb-3">{post.description}</p>

                                {/* 🔹 Imagen del post */}
                                {post.picture && (
                                    <div className="mb-3">
                                        <img 
                                            src={post.picture} 
                                            alt="Post content" 
                                            className="img-fluid rounded"
                                            style={{ maxHeight: "500px", width: "100%", objectFit: "contain" }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* 🔹 Contadores de likes y comentarios */}
                            <div className="px-3 pb-2">
                                <div className="d-flex justify-content-between text-muted small">
                                    <span>
                                        {(post.likes_count > 0 || (post.likes && Object.keys(post.likes).length > 0)) && (
                                            <>
                                                <FaHeart className="text-danger me-1" />
                                                {post.likes_count || Object.keys(post.likes || {}).length}
                                            </>
                                        )}
                                    </span>
                                    <span>
                                        {(post.comments_count > 0 || (post.comments && post.comments.length > 0)) && (
                                            `${post.comments_count || post.comments.length} comentarios`
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* 🔹 Botones de interacción */}
                            <div className="card-footer bg-transparent border-top border-secondary">
                                <div className="row text-center">
                                    <div className="col">
                                        <button 
                                            onClick={() => actions.toggleLike(post.id)} 
                                            className="btn btn-sm w-100 text-muted"
                                        >
                                            {post.user_has_liked || (post.likes && post.likes[currentUserId]) ? (
                                                <>
                                                    <FaHeart className="text-danger me-2" />
                                                    <span>Me gusta</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaRegHeart className="me-2" />
                                                    <span>Me gusta</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="col">
                                        <button 
                                            onClick={() => actions.toggleComments(post.id)} 
                                            className="btn btn-sm w-100 text-muted"
                                        >
                                            <FaCommentAlt className="me-2" />
                                            <span>Comentar</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 🔹 Sección de comentarios */}
                            {store.activeCommentsPost === post.id && (
                                <div className="border-top border-secondary">
                                    <CommentSection 
                                        postId={post.id} 
                                        comments={store.comments[post.id] || []} 
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>    
        </div>
    );
};