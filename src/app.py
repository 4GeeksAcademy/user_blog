"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required 
from flask_jwt_extended import JWTManager
from api.utils import APIException, generate_sitemap
from api.models import db,Usuario,Post,PostLike,Comment
from api.routes import api
# from datetime import timedelta
from datetime import datetime
from api.admin import setup_admin
from api.commands import setup_commands 
from flask_cors import CORS        
         

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')
app = Flask(__name__)
app.url_map.strict_slashes = False

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)
app.config["JWT_SECRET_KEY"] = "any key works"
jwt = JWTManager(app)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')
CORS(app)
# CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


# Handle/serialize errors like a JSON object
 

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints

                
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response
    # --- Usuarios ---
@app.route('/usuarios', methods=['POST'])
def register_usuario():
    data = request.get_json()
    
    if not all(field in data for field in ('first_name', 'last_name', 'email', 'password')):
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    existing = Usuario.query.filter_by(email=data['email']).first()
    if existing:
        return jsonify({"error": "Ya existe un usuario con este correo"}), 409
     
    usuario = Usuario(      
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'], 
        location=data.get('location'),    
        occupation=data.get('occupation'),
        picture=data.get('picture', ''),
        viewer_profile=data.get('viewer_profile', 0),
        impressions=data.get('impressions', 0),  
        password=data["password"]   
    )
    
             
    db.session.add(usuario)      
    db.session.commit()  

    return jsonify(usuario.serialize()), 201
  
      
@app.route('/usuarios', methods=['GET'])   
@jwt_required()
def get_usuarios():
    usuarios = Usuario.query.all()
    return jsonify([u.serialize() for u in usuarios]), 200


@app.route('/usuarios/<int:usuario_id>', methods=['GET'])
def get_usuario(usuario_id):
    usuario = Usuario.query.get_or_404(usuario_id)
    return jsonify(usuario.serialize()), 200






@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")   

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario or usuario.password != password:
        return jsonify({"msg": "Correo o contraseña incorrectos"}), 401
  
    # ✅ Aquí creamos el token, usando solo el id como string
    access_token = create_access_token(identity=str(usuario.id))

    return jsonify({"access_token": access_token,  "usuario": usuario.serialize()}), 200







@app.route('/perfil', methods=['GET'])          
@jwt_required()
def perfil():
    identidad = get_jwt_identity()  # será un string con el id del usuario
    usuario = Usuario.query.get(int(identidad))  # convertir a int si tu ID es numérico
      
    if not usuario:
        return jsonify({"msg": "Usuario no encontrado"}), 404
        
    return jsonify(usuario.serialize()), 200  



@app.route('/usuarios/<int:usuario_id>/picture', methods=['PATCH'])
def update_usuario_picture(usuario_id):
    data = request.get_json()
      
    if "picture" not in data:
        return jsonify({"error": "Se requiere el campo picture"}), 400

    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    usuario.picture = data["picture"]

    db.session.commit()

    return jsonify({
        "message": "Foto de perfil actualizada correctamente",
        "usuario": usuario.serialize()
    }), 200

@app.route('/usuarios/<int:usuario_id>', methods=['PATCH'])
@jwt_required()
def update_usuario(usuario_id):
    current_user_id = get_jwt_identity()

    if current_user_id != usuario_id:
        return jsonify({"error": "No autorizado"}), 403

    data = request.get_json()
    usuario = Usuario.query.get(usuario_id)
  
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # 🔥 Solo actualizamos la foto de perfil
    if "picture" in data:
        usuario.picture = data["picture"]

    db.session.commit()
  
    return jsonify({
        "id": usuario.id,
        "first_name": usuario.first_name,
        "last_name": usuario.last_name, 
        "email": usuario.email,
        "location": usuario.location,
        "occupation": usuario.occupation,
        "picture": usuario.picture
    }), 200
  
                        





@app.route('/usuarios/<int:friend_id>/toggle-friend', methods=['POST'])
@jwt_required()
def toggle_friend(friend_id):
    try:
        current_user_id = int(get_jwt_identity())
        usuario = Usuario.query.get(current_user_id)
        amigo = Usuario.query.get(friend_id)

        if not usuario:
            return jsonify({"error": "Usuario actual no encontrado"}), 404
        if not amigo:
            return jsonify({"error": "Usuario amigo no encontrado"}), 404

        # 🔥 VERIFICAR SI YA SON AMIGOS (método seguro)
        son_amigos = False
        for friend in usuario.friends:
            if friend.id == friend_id:
                son_amigos = True
                break

        if son_amigos:
            # Quitar amistad
            usuario.friends.remove(amigo)
            amigo.friends.remove(usuario)
            message = "Amigo eliminado"
        else:
            # Agregar amistad
            usuario.friends.append(amigo)
            amigo.friends.append(usuario)
            message = "Amigo agregado"

        db.session.commit()

        # Obtener lista actualizada de amigos
        friends_list = [
            {
                "id": f.id,
                "first_name": f.first_name,
                "last_name": f.last_name,
                "occupation": f.occupation,
                "location": f.location,
                "picture": f.picture,
            }
            for f in usuario.friends
        ]

        return jsonify({
            "message": message,
            "friends": friends_list
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error en toggle_friend: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500




  


# En tu main.py - corregir el endpoint de amigos
@app.route('/usuarios/<int:user_id>/amigos', methods=['GET'])
@jwt_required()
def get_friends(user_id):    
    usuario = Usuario.query.get(user_id)

    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    amigos_list = [
        {
            "id": amigo.id,
            "first_name": amigo.first_name, 
            "last_name": amigo.last_name,
            "email": amigo.email,
            "picture": amigo.picture,
            "occupation": amigo.occupation,
            "location": amigo.location
        }
        for amigo in usuario.friends
    ]

    return jsonify(amigos_list), 200


 



    ##### FIN USUARIOS#####


# --- Posts ---
@app.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    user_id_str = get_jwt_identity()  # Es string
    user_id_int = int(user_id_str)     # Convertimos a int para DB
    
    data = request.get_json()
    post = Post(
        usuario_id=user_id_int,  # ✅ Usamos integer para la DB
        description=data.get('description'),
        picture=data.get('picture'),
        location=data.get('location')
    )
    
    db.session.add(post)
    db.session.commit()
    return jsonify(post.serialize()), 201



# En tu main.py - corregir el endpoint de eliminar post
@app.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    current_user_id = int(get_jwt_identity())  # Convertir a int
    post = Post.query.get_or_404(post_id)

    # Verificar que el usuario es el dueño del post
    if post.usuario_id != current_user_id:
        return jsonify({"error": "No autorizado para eliminar este post"}), 403

    # Eliminar likes y comentarios asociados primero
    PostLike.query.filter_by(post_id=post_id).delete()
    Comment.query.filter_by(post_id=post_id).delete()
    
    # Eliminar el post
    db.session.delete(post)
    db.session.commit()

    return jsonify({"message": "Post eliminado exitosamente"}), 200

@app.route('/posts', methods=['GET'])
@jwt_required(optional=True)
def get_all_posts():
    posts = Post.query.order_by(Post.id.desc()).all()  # orden descendente (los más nuevos primero)
    return jsonify([post.serialize() for post in posts]), 200


# --- Likes ---


# -------------------------------
# Like / Unlike Post
# -------------------------------
@app.route('/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    identidad = get_jwt_identity()
    user_id = int(identidad)

    existing_like = PostLike.query.filter_by(post_id=post_id, usuario_id=user_id).first()

    if existing_like:
        db.session.delete(existing_like)
        db.session.commit()
        return jsonify({"liked": False}), 200
    else:
        like = PostLike(usuario_id=user_id, post_id=post_id)
        db.session.add(like)
        db.session.commit()
        return jsonify({"liked": True}), 200
 

# --- Comments ---
# -------------------------------
# Comentar en un Post
# -------------------------------
@app.route('/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(post_id):
    identidad = get_jwt_identity()
    data = request.get_json()
    content = data.get('content')
                  
    if not content:
        return jsonify({"error": "El comentario no puede estar vacío"}), 400

    comment = Comment(
        post_id=post_id,
        usuario_id=int(identidad),
        content=content
    )

    db.session.add(comment)
    db.session.commit()

    return jsonify(comment.serialize()), 201


    # -------------------------------
# Obtener Comentarios de un Post
# -------------------------------
@app.route('/posts/<int:post_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(post_id):
    post = Post.query.get_or_404(post_id)
    comentarios = Comment.query.filter_by(post_id=post.id).order_by(Comment.created_at.asc()).all()
    return jsonify([comentario.serialize() for comentario in comentarios]), 200



# En tu main.py - endpoint para eliminar comentarios (actualizado)
@app.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    current_user_id = int(get_jwt_identity())
    comentario = Comment.query.get_or_404(comment_id)

    # Verificar que el usuario es el dueño del comentario
    if comentario.usuario_id != current_user_id:
        return jsonify({"error": "No autorizado para eliminar este comentario"}), 403

    db.session.delete(comentario)
    db.session.commit()

    return jsonify({"message": "Comentario eliminado exitosamente"}), 200
   



   # En tu main.py - agregar endpoint para editar comentarios
@app.route('/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    current_user_id = int(get_jwt_identity())
    comentario = Comment.query.get_or_404(comment_id)

    # Verificar que el usuario es el dueño del comentario
    if comentario.usuario_id != current_user_id:
        return jsonify({"error": "No autorizado para editar este comentario"}), 403

    data = request.get_json()
    content = data.get('content')

    if not content:
        return jsonify({"error": "El comentario no puede estar vacío"}), 400

    comentario.content = content
    comentario.updated_at = datetime.utcnow()

    db.session.commit()

    return jsonify({
        "id": comentario.id,
        "content": comentario.content,
        "userName": comentario.author.first_name + " " + comentario.author.last_name,
        "userPicture": comentario.author.picture,
        "created_at": comentario.created_at.isoformat() if comentario.created_at else None,
        "updated_at": comentario.updated_at.isoformat() if comentario.updated_at else None
    }), 200



# En tu main.py - agregar endpoint de búsqueda
@app.route('/usuarios/search', methods=['GET'])
@jwt_required()
def search_usuarios():
    query = request.args.get('q', '').strip()
    
    if not query:
        return jsonify([]), 200

    try:
        # Buscar usuarios por nombre o apellido (case insensitive)
        usuarios = Usuario.query.filter(
            db.or_(
                Usuario.first_name.ilike(f'%{query}%'),
                Usuario.last_name.ilike(f'%{query}%'),
                Usuario.email.ilike(f'%{query}%')
            )
        ).limit(10).all()

        results = []
        for usuario in usuarios:
            results.append({
                "id": usuario.id,
                "first_name": usuario.first_name,
                "last_name": usuario.last_name,
                "email": usuario.email,
                "picture": usuario.picture,
                "location": usuario.location,
                "occupation": usuario.occupation
            })

        return jsonify(results), 200

    except Exception as e:
        print(f"Error en búsqueda: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
