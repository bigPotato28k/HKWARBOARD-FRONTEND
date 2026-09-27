import { EventManagePage } from "@/features/host";
export default async function ManageEventPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <EventManagePage eventId={id}/>;}
