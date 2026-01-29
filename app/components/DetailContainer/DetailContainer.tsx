import moment from "moment/moment";

interface DetailContainerProps {
    event: any;
    onDelete: () => void;
}

export default  function DetailContainer({event, onDelete }: DetailContainerProps){
if(!event) return null;

    return(
        <div>
           <div>
               <span>
                   Booking
               </span>
               <h1>
                   {event.clientName || event.resource?.clientName || 'client'}
               </h1>
               <p>

               </p>
           </div>
        </div>


    )
}