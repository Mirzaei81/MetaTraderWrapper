// import { useAppContext } from "@/context";
// import { getUserFromToken } from "./jwt";
export function LogoutUser() {
    // const { user, setUser } = useAppContext();
    sessionStorage.removeItem('token');
    // setUser(getUserFromToken())
}