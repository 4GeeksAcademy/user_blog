import React, { useContext } from "react";
import { Context } from "../store/appContext";
// import { Button } from "bootstrap";
import Button from "react-bootstrap/Button";

export const UbicacionButton = () => {
    const { actions } = useContext(Context);

    return (
        <div className="text-center mt-3">
            <Button
                variant="primary"
                className="rounded-pill shadow-sm"
                onClick={actions.obtenerUbicacionYRedirigir}
            >
                🌍 Ver mi ubicación actual 
            </Button>
        </div>
    );
};
