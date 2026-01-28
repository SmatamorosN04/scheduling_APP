import NextAuth from "next-auth";
import clientPromise from "@/lib/mongodb";
import CredentialsProvider from 'next-auth/providers/credentials';


const handler = NextAuth({ providers: [
    CredentialsProvider({
        name: "Ariel Login",
        credentials: {
            username: { label: "user", type: "text"},
            password: { label: "password", type: "password"}
        },
        async authorize(credentials){
            if(!credentials)  return null;

            const client = await clientPromise;
            const db = client.db('scheduling_App');

            const user = await db.collection("Users").findOne({
                username: credentials?.username
            });

            if(user && credentials?.password === user.password){
                return{
                    id: user._id.toString(),
                    name: user.usernname,
                };
            }
            return null
        }
    })
    ],
    session: {
    strategy: "jwt",
    },
    pages: {
    signIn: 'login'
    },
    secret: process.env.NEXTAUTH_SECRET
})
export { handler as GET, handler as POST }

