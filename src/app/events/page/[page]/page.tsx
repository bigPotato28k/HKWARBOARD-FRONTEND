import { EventsBrowse } from "@/features/events";
export default async function EventsPageNumber({params}:{params:Promise<{page:string}>}){const {page}=await params;return <EventsBrowse initialPage={Number(page)||1}/>;}
