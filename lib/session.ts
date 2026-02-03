import { SignJWT, jwtVerify } from "jose";

// Esta es tu "llave maestra". Agrégala a tu .env.local
const secretKey = process.env.SESSION_SECRET || "una_llave_super_secreta_de_64_caracteres";
const encodedKey = new TextEncoder().encode(secretKey);

/**
 * ENCRYPT: Crea el token JWT para la cookie
 */
export async function encrypt(payload: any) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d") // La sesión dura 7 días
        .sign(encodedKey);
}

/**
 * DECRYPT: Lee el token y verifica que sea válido (úsalo en tu Middleware)
 */
export async function decrypt(session: string | undefined = "") {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        console.log("Failed to verify session");
        return null;
    }
}