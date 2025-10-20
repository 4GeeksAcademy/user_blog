import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { Card, Form, Button } from "react-bootstrap";
import { FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

export const CommentSection = ({ postId, comments: propComments = [] }) => {
    const { store, actions } = useContext(Context);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");

    // 🔹 Obtener usuario actual
    const getCurrentUser = () => {
        if (store.currentUser) {
            return store.currentUser;
        }
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

    console.log("Current User from localStorage:", currentUser); // Debug
    console.log("Current User ID:", currentUserId); // Debug

    // 🔹 Inicializar comments con propComments si es un array válido
    useEffect(() => {
        if (Array.isArray(propComments) && propComments.length > 0) {
            setComments(propComments);
        }
    }, [propComments]);

    // 🔹 Si no hay comentarios, obtenerlos del backend
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const token = localStorage.getItem("token");
                const resp = await fetch(`${process.env.BACKEND_URL}/posts/${postId}/comments`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (resp.ok) {
                    const data = await resp.json();
                    console.log("Comments from API:", data); // Debug
                    if (Array.isArray(data)) {
                        setComments(data);
                    } else {
                        console.error("Los comentarios no son un array:", data);
                        setComments([]);
                    }
                }
            } catch (err) {
                console.error("Error al obtener comentarios:", err);
                setComments([]);
            }
        };

        if ((!comments || comments.length === 0) && (!propComments || propComments.length === 0)) {
            fetchComments();
        }
    }, [postId, comments, propComments]);

    // 🔹 Agregar nuevo comentario
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${process.env.BACKEND_URL}/posts/${postId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ content: newComment })
            });

            if (resp.ok) {
                const data = await resp.json();
                console.log("New comment response:", data); // Debug
                
                if (data && typeof data === 'object' && data.id) {
                    setComments(prev => {
                        const prevArray = Array.isArray(prev) ? prev : [];
                        return [...prevArray, data];
                    });
                    setNewComment("");
                } else {
                    console.error("Respuesta del comentario inválida:", data);
                    alert("Error al publicar el comentario");
                }
            } else {
                const errorData = await resp.json();
                alert("Error: " + (errorData.error || "No se pudo publicar el comentario"));
            }
        } catch (err) {
            console.error("Error al enviar comentario:", err);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Eliminar comentario
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${process.env.BACKEND_URL}/comments/${commentId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (resp.ok) {
                // Eliminar el comentario de la lista local
                setComments(prev => prev.filter(comment => comment.id !== commentId));
                alert("Comentario eliminado correctamente");
            } else {
                const errorData = await resp.json();
                alert("Error: " + (errorData.error || "No se pudo eliminar el comentario"));
            }
        } catch (err) {
            console.error("Error al eliminar comentario:", err);
            alert("Error de conexión");
        }
    };

    // 🔹 Iniciar edición de comentario
    const handleStartEdit = (comment) => {
        setEditingCommentId(comment.id);
        setEditingText(comment.content);
    };

    // 🔹 Cancelar edición
    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditingText("");
    };

    // 🔹 Guardar comentario editado
    const handleSaveEdit = async (commentId) => {
        if (!editingText.trim()) {
            alert("El comentario no puede estar vacío");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const resp = await fetch(`${process.env.BACKEND_URL}/comments/${commentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ content: editingText })
            });

            if (resp.ok) {
                const updatedComment = await resp.json();
                
                // Actualizar el comentario en la lista local
                setComments(prev => 
                    prev.map(comment => 
                        comment.id === commentId ? { ...comment, content: editingText } : comment
                    )
                );
                
                setEditingCommentId(null);
                setEditingText("");
                alert("Comentario actualizado correctamente");
            } else {
                const errorData = await resp.json();
                alert("Error: " + (errorData.error || "No se pudo actualizar el comentario"));
            }
        } catch (err) {
            console.error("Error al actualizar comentario:", err);
            alert("Error de conexión");
        }
    };

    // 🔥 Función para obtener nombre de usuario del comentario
    const getUserName = (comment) => {
        return comment.userName || 
               (comment.user && (comment.user.first_name || comment.user.firstName)) || 
               "Usuario";
    };

    // 🔥 Función para obtener imagen de usuario del comentario
    const getUserPicture = (comment) => {
        return comment.userPicture || 
               (comment.user && comment.user.picture) || 
               "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    };

    // 🔥 CORREGIDO: Función para verificar si el usuario es el dueño del comentario
    const isCommentOwner = (comment) => {
        // 🔥 USAR usuarioId (con I mayúscula) que es como viene del backend
        const commentUserId = comment.usuarioId || comment.userId || (comment.user && comment.user.id);
        console.log("Comment User ID:", commentUserId, "Comment:", comment); // Debug
        console.log("Current User ID:", currentUserId); // Debug
        console.log("Is Owner:", commentUserId === currentUserId); // Debug
        return commentUserId === currentUserId;
    };

    return (
        <Card className="mt-3 shadow-sm border-light">
            <Card.Body>
                <h6 className="text-primary mb-3">Comentarios</h6>

                {/* Lista de comentarios */}
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {Array.isArray(comments) && comments.length > 0 ? (
                        comments.map((comment) => {
                            const isOwner = isCommentOwner(comment);
                            console.log(`Comment ${comment.id} - Is Owner: ${isOwner}`); // Debug por comentario
                            
                            return (
                                <div key={comment.id || comment._id || Math.random()} className="d-flex align-items-start mb-3">
                                    <img
                                        src={getUserPicture(comment)}
                                        alt="User"
                                        className="rounded-circle me-2"
                                        width="35"
                                        height="35"
                                        style={{ objectFit: "cover" }}
                                    />
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <strong>{getUserName(comment)}</strong>
                                                {editingCommentId === comment.id ? (
                                                    <div className="d-flex mt-2">
                                                        <Form.Control
                                                            type="text"
                                                            value={editingText}
                                                            onChange={(e) => setEditingText(e.target.value)}
                                                            className="me-2"
                                                            size="sm"
                                                        />
                                                        <Button 
                                                            variant="success" 
                                                            size="sm" 
                                                            className="me-1"
                                                            onClick={() => handleSaveEdit(comment.id)}
                                                        >
                                                            <FaCheck />
                                                        </Button>
                                                        <Button 
                                                            variant="secondary" 
                                                            size="sm"
                                                            onClick={handleCancelEdit}
                                                        >
                                                            <FaTimes />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <p className="mb-1 text-muted">{comment.content}</p>
                                                )}
                                                <small className="text-muted">
                                                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 
                                                     comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ""}
                                                </small>
                                            </div>
                                            
                                            {/* 🔹 Botones de editar/eliminar (solo para el dueño) */}
                                            {isOwner && editingCommentId !== comment.id && (
                                                <div className="d-flex ms-2">
                                                    <Button 
                                                        variant="outline-primary" 
                                                        size="sm" 
                                                        className="me-1"
                                                        onClick={() => handleStartEdit(comment)}
                                                        title="Editar comentario"
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm"
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        title="Eliminar comentario"
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-muted">Aún no hay comentarios.</p>
                    )}
                </div>

                {/* Input para nuevo comentario */}
                <Form onSubmit={handleSubmit} className="mt-3 d-flex">
                    <Form.Control
                        type="text"
                        placeholder="Escribe un comentario..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="me-2"
                        disabled={loading}
                    />
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? "Publicando..." : "Comentar"}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};