from flask_sqlalchemy import SQLAlchemy
from datetime import datetime 

db = SQLAlchemy()
 
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)

    def __repr__(self): 
        return f'<User {self.email}>'  

    def serialize(self):
        return { 
            "id": self.id,  
            "email": self.email,
            # do not serialize the password, its a security breach
        } 



# Tabla de asociación para la relación de amigos (autoreferencial)
usuario_friends = db.Table(
    "usuario_friends",
    db.Column("usuario_id", db.Integer, db.ForeignKey("usuario.id"), primary_key=True),
    db.Column("friend_id", db.Integer, db.ForeignKey("usuario.id"), primary_key=True),
    db.Column("created_at", db.DateTime, default=datetime.utcnow),
)


class Usuario(db.Model):
    __tablename__ = "usuario"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    picture = db.Column(db.String(255), default="")
    location = db.Column(db.String(100))
    occupation = db.Column(db.String(100))
    viewer_profile = db.Column(db.String(100))
    impressions = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relación muchos-a-muchos para amigos (autoreferencial)
    friends = db.relationship(
        "Usuario",
        secondary=usuario_friends,
        primaryjoin=id == usuario_friends.c.usuario_id,
        secondaryjoin=id == usuario_friends.c.friend_id,
        backref=db.backref("friend_of", lazy="dynamic"),
        lazy="dynamic", 
    )
 
    # Relación con posts
    posts = db.relationship("Post", backref="author", lazy=True)

    # Relación con comentarios
    comments = db.relationship("Comment", backref="author", lazy=True)

    # Relación con likes
    likes = db.relationship("PostLike", backref="usuario", lazy=True)

    def __repr__(self):
        return f"<Usuario {self.first_name} {self.last_name}>"

  

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "picture": self.picture,
            "location": self.location,
            "occupation": self.occupation,
            "views": self.viewer_profile,
            "impressions": self.impressions,
            "friends": [{
                "id": friend.id,
                "first_name": friend.first_name,
                "last_name": friend.last_name,
                "picture": friend.picture,
                "occupation": friend.occupation,
                "location": friend.location
            } for friend in self.friends],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
                        
class Post(db.Model):
    __tablename__ = "post"
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False)
    description = db.Column(db.Text)
    picture = db.Column(db.String(255))
    location = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Likes (muchos-a-muchos con usuarios, gestionados por PostLike)
    likes = db.relationship(
        "PostLike", backref="post", lazy=True, cascade="all, delete-orphan"
    )

    # Comentarios
    comments = db.relationship(
        "Comment", backref="post", lazy=True, cascade="all, delete-orphan"

    )
    
    
 
    def __repr__(self):
        return f"<Post {self.id} by User {self.usuario_id}>"

    def serialize(self):
        return {
            "id": self.id, 
            "userId": self.usuario_id,
            "firstName": self.author.first_name,
            "lastName": self.author.last_name,
            "description": self.description,
            "picture": self.picture,
            "location": self.location,
            "userPicture": self.author.picture,
            "likes": {like.usuario_id: True for like in self.likes},
            "comments": [comment.serialize() for comment in self.comments], 
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat(),
        }


class PostLike(db.Model):
    __tablename__ = "post_like"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("post.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Asegurar que un usuario solo puede dar like una vez a un post
    __table_args__ = (
        db.UniqueConstraint("usuario_id", "post_id", name="unique_user_post_like"),
    )

    def __repr__(self):
        return f"<Like by Usuario {self.usuario_id} on Post {self.post_id}>"

  
class Comment(db.Model):
    __tablename__ = "comment"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("post.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __repr__(self):
        return f"<Comment {self.id} by Usuario {self.usuario_id}>"

    def serialize(self):
        return {
            "id": self.id,
            "usuarioId": self.usuario_id,
            "postId": self.post_id,
            "content": self.content,
            "userName": f"{self.author.first_name} {self.author.last_name}",
            "userPicture": self.author.picture,
            "createdAt": self.created_at.isoformat(),
        }




    
