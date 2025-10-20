import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import axios from "axios";
import "../../styles/navbar.css";

export const Navbar = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(store.currentUser?.picture || "");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  useEffect(() => {
    document.body.classList.toggle("app-dark-theme", isDark);
    document.body.classList.toggle("app-light-theme", !isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // 🔍 FUNCIÓN DE BÚSQUEDA
  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.BACKEND_URL}/usuarios/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error en búsqueda:", error);
    }
  };

  // 🔍 MANEJAR CAMBIOS EN LA BÚSQUEDA
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce para evitar muchas requests
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  // 🔍 CERRAR RESULTADOS AL HACER CLIC AFUERA
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };
   
  const handleLogout = () => {
    if (actions.logoutUsuario) {
      actions.logoutUsuario();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
    }
    navigate("/login");
  };
        
  const currentUser = store.currentUser || null;
  const user = store.currentUser || null;
  const avatar = currentUser?.picture || "/default-avatar.png";
  const fullName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : "Invitado";

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage("Subiendo imagen...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "gex4cmch");
    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dqvpdgvnm/image/upload",
        formData
      ); 
      const secureUrl = res.data.secure_url;
      setPreview(secureUrl);

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

  // 🔍 NAVEGAR AL PERFIL DEL USUARIO
 // En tu navbar.js - actualizar la función de navegación
const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`); // Cambiar de /perfil/ a /profile/
    setShowResults(false);
    setSearchTerm("");
};

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm" style={{ minHeight: '60px' }}>
      <div className="container-fluid py-1">
        
        {/* Logo */}
        <Link className="navbar-brand fw-bold fs-4 text-primary text-decoration-none d-flex align-items-center" to="/">
          <span style={{ 
            background: 'linear-gradient(45deg, #00c6ff, #0072ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SocioBlog
          </span>
        </Link>

        {/* Botón hamburguesa */}
        <button
          className="navbar-toggler border-0 p-1"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" style={{width: '20px', height: '20px'}}></span>
        </button>

        {/* Contenido colapsable */}
        <div className="collapse navbar-collapse" id="navbarContent">
          
          {/* 🔍 BARRA DE BÚSQUEDA MEJORADA */}
          <div className="d-flex mx-auto my-1 my-lg-0 w-100 w-lg-50 search-container position-relative">
            <div className="input-group" style={{maxWidth: '500px'}}>
              <span className="input-group-text bg-secondary border-end-0 py-1">
                <i className="bi bi-search text-light"></i>
              </span>
              <input
                className="form-control bg-secondary text-light border-start-0 py-1"
                placeholder="Buscar personas..."
                style={{borderLeft: 'none'}}
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm && setShowResults(true)}
              />
            </div>

            {/* 🔍 RESULTADOS DE BÚSQUEDA */}
            {showResults && searchResults.length > 0 && (
              <div className="search-results position-absolute top-100 start-0 end-0 mt-1 bg-dark border border-secondary rounded shadow-lg z-3">
                <div className="p-2 border-bottom border-secondary">
                  <small className="text-muted">Personas encontradas:</small>
                </div>
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="search-result-item p-3 border-bottom border-secondary-hover cursor-pointer"
                    onClick={() => handleUserClick(user.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src={user.picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                        alt={user.first_name}
                        className="rounded-circle me-3"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-0 text-light">{user.first_name} {user.last_name}</h6>
                        <small className="text-muted">{user.occupation}</small>
                        {user.location && (
                          <div className="text-muted small">
                            <i className="bi bi-geo-alt me-1"></i>
                            {user.location}
                          </div>
                        )}
                      </div>
                      <div className="text-end">
                        <small className="text-primary">Ver perfil</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 🔍 MENSAJE CUANDO NO HAY RESULTADOS */}
            {showResults && searchTerm && searchResults.length === 0 && (
              <div className="search-results position-absolute top-100 start-0 end-0 mt-1 bg-dark border border-secondary rounded shadow-lg z-3">
                <div className="p-3 text-center text-muted">
                  <i className="bi bi-search display-6 mb-2"></i>
                  <p className="mb-0">No se encontraron personas</p>
                  <small>Intenta con otro nombre</small>
                </div>
              </div>
            )}
          </div>

          {/* Resto del código del navbar (icons, dropdown, etc.) */}
          <div className="d-flex align-items-center ms-lg-3 mt-2 mt-lg-0">
            {/* Theme toggle */}
            <button 
              className="btn btn-outline-light border-0 btn-sm me-2 p-1" 
              onClick={toggleTheme}
              title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              style={{width: '32px', height: '32px'}}
            >
              {isDark ? (
                <i className="bi bi-sun-fill"></i>
              ) : (
                <i className="bi bi-moon-fill"></i>
              )}
            </button>

            {/* Notifications */}
            <div className="dropdown me-2">
              <button 
                className="btn btn-outline-light border-0 btn-sm position-relative p-1" 
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{width: '32px', height: '32px'}}
              >
                <i className="bi bi-bell"></i>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.6rem'}}>
                  3
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><h6 className="dropdown-header">Notificaciones</h6></li>
                <li><a className="dropdown-item small" href="#">Nueva solicitud de amistad</a></li>
                <li><a className="dropdown-item small" href="#">Te gustó tu publicación</a></li>
                <li><a className="dropdown-item small" href="#">Comentario nuevo</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item small text-center" href="#">Ver todas</a></li>
              </ul>
            </div>

            {/* User dropdown */}
            <div className="dropdown">
              <button
                className="btn btn-outline-light btn-sm d-flex align-items-center p-1"
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{height: '32px'}}
              >
                <img 
                  src={avatar} 
                  alt="Avatar" 
                  className="rounded-circle me-1"
                  style={{width: '24px', height: '24px', objectFit: 'cover'}}
                />
                <span className="d-none d-md-inline small">
                  {fullName.split(' ')[0]}
                </span>
                <i className="bi bi-caret-down-fill ms-1" style={{fontSize: '0.7rem'}}></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
                {currentUser ? (
                  <>
                    <li className="dropdown-header">
                      <div className="fw-bold small">{fullName}</div>
                      <div className="small text-muted">{currentUser.email}</div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <label className="dropdown-item small" style={{ cursor: "pointer" }}>
                        <i className="bi bi-camera me-2"></i>
                        Cambiar foto
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="d-none"
                          disabled={loading}
                        /> 
                      </label>
                    </li>
                    <li>
                      <Link className="dropdown-item small" to={`/perfil/${currentUser.id}`}>
                        <i className="bi bi-person me-2"></i>
                        Mi perfil
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item small" to="/configuracion">
                        <i className="bi bi-gear me-2"></i>
                        Configuración
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item small text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Cerrar sesión
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="dropdown-header text-muted small">No autenticado</li>
                    <li>
                      <Link className="dropdown-item small" to="/login">
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Iniciar sesión
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};