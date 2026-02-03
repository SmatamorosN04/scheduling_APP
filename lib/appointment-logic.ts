export type AppointmentStatus =
    | "pending"
    | "Confirmed"
    | "On-Route"
    | "In-Progress"
    | "Finished"
    | "Cancelled"

const ALLOWED_TRANSITION:Record<AppointmentStatus, AppointmentStatus[]>= {
    "pending": ["Confirmed", "Cancelled"],
    "Confirmed": ['On-Route', "Cancelled"],
    "On-Route": ["In-Progress"],
    "In-Progress": ["Finished"],
    "Finished": [],
    "Cancelled": []
}
export default ALLOWED_TRANSITION