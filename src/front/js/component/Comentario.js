import React, { useContext } from "react";
import { Context } from "../store/appContext";



export const Comentario = () => {
    const { store, actions } = useContext(Context);
    console.log("hola desde comentario",store.comentario)


    return ( 

    <div> 

{
    store.comentario.map(c=> <li key={c.id}> { c.descripcion} 
    <button onClick={()=>actions.eliminarComentario(c.id)} > eliminar comentario</button>
   
     </li>)
}
           
        </div>
    );
};