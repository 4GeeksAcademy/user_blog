import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";

const ReaderEditor = ({ reader }) => {
    const { actions } = useContext(Context);

    const [formData, setFormData] = useState({
        first_name: reader.first_name,
        last_name: reader.last_name,
        email: reader.email
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdate = async () => {
        await actions.updateReader(reader.id, formData);
        alert("Escritor actualizado");
    };

    return (
        <div className="card p-3 mb-3 shadow-sm">
            <h5>Editar lector</h5>
            <div className="row">
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control mb-2"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="Nombre"
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control mb-2"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Apellido"
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="email"
                        className="form-control mb-2"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Correo"
                    />
                </div>
            </div>
            <button className="btn btn-success mt-2" onClick={handleUpdate}>
                Guardar cambios
            </button>
        </div>
    );
};

export default ReaderEditor;
