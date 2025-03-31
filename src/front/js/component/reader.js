import React, { useContext } from "react";
import { Context } from "../store/appContext";
import ReaderEditor from "./readerEditor";
// import WriterEditor from "./writerEditor";




export const Reader = () => {
    const { store, actions } = useContext(Context);
    console.log("hola desde reader",store.reader)


    return ( 

    <div> 

{
    store.reader.map(r=> <li key={r.id}> { r.first_name} 
    <button onClick={()=>actions.eliminarReader(r.id)} > eliminar</button>
    {/* <WriterEditor  writer={r}/> */}
    <ReaderEditor  reader={r} />
     </li>)
}
           
        </div>
    );
};
