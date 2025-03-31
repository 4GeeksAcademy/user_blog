import React, { useContext } from "react";
import { Context } from "../store/appContext";



export const PostWriter = () => {
    const { store, actions } = useContext(Context);
    console.log("hola desde postwriter",store.post)


    return ( 

    <div> 

{
    store.post.map(p=> <li key={p.id}> { p.title} 
    <button onClick={()=>actions.eliminarPost(p.id)} > eliminar</button>
   
     </li>)
}
           
        </div>
    );
};
