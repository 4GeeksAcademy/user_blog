
import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import { useParams } from "react-router-dom";

import { PostWidget } from "../component/postWidget";
import { PostList } from "../component/postList";
import { ProfileWidget } from "./profileWidget";

// En tu perfil.js - simplificar
const Perfil = () => {
    const { store } = useContext(Context);

    return ( 
        <div className="container-fluid mt-4">
            <div className="row justify-content-center">
                {/* Columna izquierda - Perfil Widget */}
                <div className="col-12 col-md-3 mb-4">
                    <ProfileWidget />
                </div>

                {/* Columna central - Contenido principal */}
                <div className="col-12 col-md-6 mb-4">
                    <div className="post-widget mb-4">
                        <PostWidget />
                    </div>
                    <div className="post-list">
                        <PostList isProfilePage={true} />
                    </div>
                </div>

                {/* Columna derecha */}
                <div className="col-12 col-md-3 mb-4">
                    {/* Espacio para widgets adicionales */}
                </div>
            </div>           
        </div>   
    );
};
   
export default Perfil;