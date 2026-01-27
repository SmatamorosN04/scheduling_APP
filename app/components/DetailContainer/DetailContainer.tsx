import moment from "moment/moment";

export default  function DetailContainer({event}: {event: any}){


    return(
        <div>
            In development
        </div>

       /* <div>
            <h1>
                {event.resource.clientName}
            </h1>
            <h2>
                service: {event.title}
            </h2>
            <h3>
               direction {event.resource.direction}
            </h3>
            <h3>
               start hour: {moment(event.start).format('hh:mm A')}
            </h3>
            <h3>
               finish hour: {moment(event.end).format('hh:mm A')}
            </h3>
        </div>*/
    )
}