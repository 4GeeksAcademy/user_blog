const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			currentUser: null,
            token: null,
            usuarios: [],
            posts: [],
            comentarios: [],
            likes: [] ,
            amigos:[],
            activeCommentsPost: null,
            comments: {},

		},
		actions: {
			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},               
       
			// getMessage: async () => {
			// 	try{
			// 		// fetching data from the backend
			// 		const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
			// 		const data = await resp.json()
			// 		setStore({ message: data.message })
			// 		// don't forget to return something, that is how the async resolves
			// 		return data;
			// 	}catch(error){
			// 		console.log("Error loading message from backend", error)
			// 	}
			// }
			  // 🔑 LOGIN USUARIO
//             loginUsuario: async (formData) => {
//     try {
//         const resp = await fetch(process.env.BACKEND_URL + "login", {
//             method: "POST", 
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(formData),
//         });

//         if (!resp.ok) return { success: false };
    
//         const data = await resp.json();
//         return { success: true, usuario: data.usuario, token: data.access_token };
//     } catch (error) {
//         console.error("Error en login:", error);
//         return { success: false };
//     }
// }
// En tu flux.js - en la acción loginUsuario, asegúrate de guardar en el store
loginUsuario: async (credentials) => {
    try {
        const resp = await fetch(`${process.env.BACKEND_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials)
        });

        if (!resp.ok) throw new Error("Credenciales inválidas");

        const data = await resp.json();
         
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("currentUser", JSON.stringify(data.usuario));

        // 🔥 IMPORTANTE: Actualizar el store también
        setStore({
            token: data.access_token,
            currentUser: data.usuario
        });  

        return data;
    } catch (err) {
        console.error("Error de login:", err);
        return null;
    }
},

// 🔥 Agregar una acción para cargar usuario desde localStorage
syncUserFromLocalStorage: () => {
    const storedUser = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");
    
    if (storedUser && token) {
        try {
            const userData = JSON.parse(storedUser);
            setStore({
                currentUser: userData,
                token: token
            });      
        } catch (error) {
            console.error("Error syncing user from localStorage:", error);
        }
    }
},

            toggleFriend: async (friendId) => {
    try {
        const store = getStore();
        const token = localStorage.getItem("token");

        const res = await fetch(`https://jubilant-happiness-q54pg9rg9pxh494j-3894.app.github.dev/usuarios/${friendId}/toggle-friend`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Error al agregar/eliminar amigo");

        const data = await res.json();

        // 🔥 Aquí puedes actualizar la lista de amigos en el store
        setStore({ amigos: data.friends });

        return true;
    } catch (error) {
        console.error("Error en toggleFriend:", error);
        return false;
    }
},


			  // 🚪 LOGOUT
            logoutUsuario: () => {
                localStorage.removeItem("token");
                localStorage.removeItem("currentUser");

                setStore({
                    token: null,
                    currentUser: null
                });
            },
			 getUsuarios: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "usuarios");
                    const data = await resp.json();
                    setStore({ usuarios: data });
                    return data;
                } catch (err) {
                    console.error("Error al obtener usuarios:", err);
                }
            },     
			   agregarUsuario: async (usuarioData) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "usuarios", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(usuarioData)
                    });

                    if (!resp.ok) throw new Error("Error al crear usuario");

                    const data = await resp.json();
                
                    const store = getStore();
                    setStore({ usuarios: [...store.usuarios, data] });
                    return data;
                } catch (err) {
                    console.error("Error al agregar usuario:", err);
                }
            },       
			  eliminarUsuario: async (id) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `usuarios/${id}`, {
                        method: "DELETE"
                    });

                    if (!resp.ok) throw new Error("Error al eliminar usuario");

                    const data = await resp.json();
                    const store = getStore();
                    setStore({ usuarios: store.usuarios.filter(u => u.id !== id) });
                    return data;
                } catch (err) {
                    console.error("Error al eliminar usuario:", err);
                }
            },     
            updateUserPicture: async (userId, newPictureUrl) => {
  try {
    const res = await fetch(process.env.BACKEND_URL + "/usuarios/" + userId + "/picture", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ picture: newPictureUrl }),
    });

    if (!res.ok) throw new Error("Error al actualizar la foto");
    const data = await res.json();

    // ✅ Aquí actualizamos el store
    setStore({
      ...getStore(),
      currentUser: data.usuario
    });

    return data.usuario;
  } catch (err) {
    console.error(err);
    return null;
  }
},
obtenerUbicacionYRedirigir: () => {
    if (!navigator.geolocation) {
        alert("Tu navegador no soporta geolocalización 😢");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;

            // 🌍 Redirigir a Google Maps con la ubicación exacta
            const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
            window.open(url, "_blank");
        },
        (error) => {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert("Debes permitir el acceso a la ubicación para usar esta función ⚠️");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("La información de ubicación no está disponible 😕");
                    break;
                case error.TIMEOUT:
                    alert("La solicitud de ubicación tardó demasiado ⏳");
                    break;
                default:
                    alert("Error desconocido al obtener la ubicación 😔");
            }
        }
    );
},

// En tu flux.js - corregir getAllPosts
getAllPosts: async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No hay token disponible");
            return;
        }

        const res = await fetch(`${process.env.BACKEND_URL}/posts`, {
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (!res.ok) {
            if (res.status === 401) {
                console.error("Token inválido o expirado");
                // Opcional: hacer logout automático
                actions.logoutUsuario();
                return;
            }
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setStore({ posts: data });
    } catch (error) {
        console.error("Error al obtener posts:", error);
        setStore({ posts: [] }); // Asegurar que posts sea un array vacío
    }
},

toggleLike: async (postId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.BACKEND_URL}/posts/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    }); 
    const data = await res.json();  
    if (res.ok) {                
        const store = getStore();       
        const updated = store.posts.map((p) => { 
            if (p.id === postId) {
                if (data.liked) p.likes[store.usuarios.id] = true;
                else delete p.likes[store.usuarios.id];
            }
            return p;
        });
        setStore({ posts: updated });
    }
},

toggleComments: async (postId) => {
    const store = getStore();
    const actions = getActions();

    // Si ya está abierto, se cierra
    if (store.activeCommentsPost === postId) {
        setStore({ activeCommentsPost: null });
    } else {
        // Si no, abrimos y cargamos los comentarios
        await actions.getCommentsByPost(postId);
        setStore({ activeCommentsPost: postId });
    }
},
  

			 getPosts: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "posts");
                    const data = await resp.json();
                    setStore({ posts: data });
                    return data;
                } catch (err) {
                    console.error("Error al obtener posts:", err);
                }
            },       
			   agregarPost: async (postData) => {
                try {
                    const store = getStore();
                    const resp = await fetch(process.env.BACKEND_URL + "posts", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + store.token
                        },
                        body: JSON.stringify(postData)
                    });

                    if (!resp.ok) throw new Error("Error al crear post");

                    const data = await resp.json();
                    setStore({ posts: [...store.posts, data] });
                    return data;
                } catch (err) {
                    console.error("Error al agregar post:", err);
                }
            },  
            // src/front/js/store/flux.js
createPost: async (postData) => {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(process.env.BACKEND_URL + "/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(postData),
        });
        if (!res.ok) throw new Error("Error al crear el post");
        const data = await res.json();

        // Actualizar store para mostrar el nuevo post arriba
        const store = getStore();
        setStore({ posts: [data, ...store.posts] });
    } catch (err) {
        console.error("❌ Error creando post:", err);
    }
},
   
			
            // En tu flux.js - agregar esta acción
eliminarPost: async (postId) => {
    try {
        const token = localStorage.getItem("token");
        const resp = await fetch(`${process.env.BACKEND_URL}/posts/${postId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!resp.ok) throw new Error("Error al eliminar post");

        const data = await resp.json();
        
        // Actualizar el store eliminando el post
        const store = getStore();
        const updatedPosts = store.posts.filter(post => post.id !== postId);
        setStore({ posts: updatedPosts });
        
        return data;
    } catch (err) {
        console.error("Error al eliminar post:", err);
        return null;
    }
},
			   agregarComentario: async (comentarioData) => {
                try {
                    const store = getStore();
                    const resp = await fetch(process.env.BACKEND_URL + "comentarios", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + store.token
                        },
                        body: JSON.stringify(comentarioData)
                    });

                    if (!resp.ok) throw new Error("Error al agregar comentario");

                    const data = await resp.json();
                    setStore({ comentarios: [...store.comentarios, data] });
                    return data;
                } catch (err) {
                    console.error("Error al agregar comentario:", err);
                }
            },
			 eliminarComentario: async (id) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + `comentarios/${id}`, {
                        method: "DELETE"
                    });

                    if (!resp.ok) throw new Error("Error al eliminar comentario");

                    const data = await resp.json();
                    setStore({ comentarios: getStore().comentarios.filter(c => c.id !== id) });
                    return data;
                } catch (err) {
                    console.error("Error al eliminar comentario:", err);
                }
            },
			   // 👍 LIKES
            agregarLike: async (postId) => {
                try {
                    const store = getStore();
                    const resp = await fetch(process.env.BACKEND_URL + `posts/${postId}/like`, {
                        method: "POST",
                        headers: {
                            "Authorization": "Bearer " + store.token
                        }
                    });

                    if (!resp.ok) throw new Error("Error al dar like");

                    const data = await resp.json();
                    setStore({ likes: [...store.likes, data] });
                    return data;
                } catch (err) {
                    console.error("Error al dar like:", err);
                }
            },
			 eliminarLike: async (postId) => {
                try {
                    const store = getStore();
                    const resp = await fetch(process.env.BACKEND_URL + `posts/${postId}/like`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": "Bearer " + store.token
                        }
                    });

                    if (!resp.ok) throw new Error("Error al quitar like");

                    const data = await resp.json();
                    setStore({ likes: store.likes.filter(l => l.post_id !== postId) });
                    return data;
                } catch (err) {
                    console.error("Error al quitar like:", err);
                }
            },
			 // 💬 CRUD Comentarios
            getComments: async () => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "comentarios");
                    const data = await resp.json();
                    setStore({ comentarios: data });
                    return data;
                } catch (err) {
                    console.error("Error al obtener comentarios:", err);
                }
            },
            getCommentsByPost: async (postId) => {
    try {
        const token = localStorage.getItem("token");
        const resp = await fetch(`${process.env.BACKEND_URL}/posts/${postId}/comments`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!resp.ok) throw new Error("Error al obtener comentarios");

        const data = await resp.json();
        const store = getStore();

        setStore({
            comments: {
                ...store.comments,
                [postId]: data  // Guardamos comentarios por postId
            }
        });

        return data;
    } catch (err) {
        console.error("Error al obtener comentarios:", err);
    }
},addComment: async (postId, content) => {
  const store = getStore();
  const token = localStorage.getItem("token");

  try {
    const resp = await fetch(`${process.env.BACKEND_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ content }),
    });

    if (!resp.ok) throw new Error("Error al agregar comentario");

    const data = await resp.json();

    // Opcional: Actualiza el post en el store
    setStore({
      ...store,
      posts: store.posts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, data] }
          : post
      ),
    });

    return true;
  } catch (err) { 
    console.error("Error en addComment:", err);
  }
}, 


			
			changeColor: (index, color) => {
				//get the store 
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});                  
 
				//reset the global store
				setStore({ demo: demo });
			}
		}
	};
};

export default getState;
