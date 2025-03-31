import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";

const PostForm = () => {
	const { actions } = useContext(Context);

	const [formData, setFormData] = useState({
		writer_id: "",
		title: "",
		content: "",
		fecha: new Date().toISOString().split("T")[0], // Fecha de hoy
		likes: 0,
		abstract: ""
	});

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		await actions.agregarPost({
            ...formData,
            writer_id:parseInt(formData.writer_id)
        });
		alert("Post agregado exitosamente");
		setFormData({ writer_id: 0, title: "", content: "", fecha: new Date().toISOString().split("T")[0], likes: 0, abstract: "" });
	};

	return (
		<div className="container mt-4">
			<h2 className="mb-4">Agregar Nuevo Post</h2>
			<form onSubmit={handleSubmit}>
				<div className="mb-3">
					<label htmlFor="writer" className="form-label">Autor</label>
					<input
						type="number"
						className="form-control"
						id="writer_id"
						name="writer_id"
						value={formData.writer_id}
						onChange={handleChange}
						placeholder="Nombre del escritor"
						required
					/>
				</div>

				<div className="mb-3">
					<label htmlFor="title" className="form-label">Título</label>
					<input
						type="text"
						className="form-control"
						id="title"
						name="title"
						value={formData.title}
						onChange={handleChange}
						placeholder="Título del post"
						required
					/>
				</div>

				<div className="mb-3">
					<label htmlFor="content" className="form-label">Contenido</label>
					<textarea
						className="form-control"
						id="content"
						name="content"
						value={formData.content}
						onChange={handleChange}
						rows="4"
						placeholder="Escribe el contenido aquí..."
						required
					></textarea>
				</div>

				<div className="mb-3">
					<label htmlFor="abstract" className="form-label">Resumen</label>
					<input
						type="text"
						className="form-control"
						id="abstract"
						name="abstract"
						value={formData.abstract}
						onChange={handleChange}
						placeholder="Resumen del post"
						required
					/>
				</div>

				<button type="submit" className="btn btn-primary">Publicar Post</button>
			</form>
		</div>
	);
};

export default PostForm;
