import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";

const ComentarioForm = () => {
	const { actions } = useContext(Context);

	const [formData, setFormData] = useState({
		descripcion: "",
		post_id: "",
		reader_id: ""
	});

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const dataToSend = {
			...formData,
			post_id: parseInt(formData.post_id),
			reader_id: parseInt(formData.reader_id)
		};

		await actions.agregarComentario(dataToSend);
		alert("Comentario publicado");

		setFormData({ descri: "", post_id: "", reader_id: "" });
	};

	return (
		<div className="container mt-4">
			<h2 className="mb-3">Nuevo Comentario</h2>
			<form onSubmit={handleSubmit}>
				<div className="mb-3">
					<label htmlFor="descripcion" className="form-label">Descripción</label>
					<textarea
						className="form-control"
						id="descripcion"
						name="descripcion"
						rows="3"
						value={formData.descripcion}
						onChange={handleChange}
						placeholder="Escribe tu comentario..."
						required
					></textarea>
				</div>

				<div className="mb-3">
					<label htmlFor="post_id" className="form-label">ID del Post</label>
					<input
						type="number"
						className="form-control"
						id="post_id"
						name="post_id"
						value={formData.post_id}
						onChange={handleChange}
						required
					/>
				</div>

				<div className="mb-3">
					<label htmlFor="reader_id" className="form-label">ID del Lector</label>
					<input
						type="number"
						className="form-control"
						id="reader_id"
						name="reader_id"
						value={formData.reader_id}
						onChange={handleChange}
						required
					/>
				</div>

				<button type="submit" className="btn btn-success">Comentar</button>
			</form>
		</div>
	);
};

export default ComentarioForm;
