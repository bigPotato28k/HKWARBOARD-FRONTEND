import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
export function AppShell({ children }: { children:React.ReactNode }) { return <><Header />{children}<Footer /></>; }
