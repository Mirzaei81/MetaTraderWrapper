import { jwtDecode }  from 'jwt-decode';
import { LogoutUser } from './logout';

export function getUserFromToken() {
    if (typeof window !== 'undefined') {
        const token = sessionStorage.getItem('token'); // Retrieve the token from sessionStorage

        if (token) {
            try {
                const decodedToken = jwtDecode(token); // Decode the token
                //@ts-ignore
                if (! isTokenExpired(decodedToken)){
                    return decodedToken;
                } else {
                    LogoutUser()
                    return ''
                }
            } catch (error) {
                console.error("Token decoding failed:", error);
                return ''; // Return an empty object in case of error
            }
        }
    }
    return ''; // Return an empty object if token doesn't exist
}

function isTokenExpired(expiryTimestamp:number) {
    // Convert expiry timestamp from seconds to milliseconds
    const expiryTimeInMs = expiryTimestamp * 1000;

    // Get current time in milliseconds
    const currentTimeInMs = Date.now();

    // Check if the expiry time is greater than the current time
    return expiryTimeInMs > currentTimeInMs;
}

export function decodeToken(token:string) {
    try {
        const decodedToken = jwtDecode(token); // Decode the token
        //@ts-ignore
        if (! isTokenExpired(decodedToken)){
            return decodedToken;
        } else {
            LogoutUser()
            return ''
        }
    } catch (error) {
        console.error("Token decoding failed:", error);
        return ''; // Return an empty object in case of error
    }
}