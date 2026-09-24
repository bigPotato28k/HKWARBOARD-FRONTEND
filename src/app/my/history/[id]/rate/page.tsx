import { RatingPage } from "@/features/member";
export default async function RatePage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <RatingPage eventId={id}/>;}
