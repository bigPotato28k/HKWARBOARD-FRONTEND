import { Suspense } from "react";
import { LoginForm } from "@/features/auth-forms";
export default function AdminLoginPage(){return <Suspense fallback={null}><LoginForm admin/></Suspense>;}
