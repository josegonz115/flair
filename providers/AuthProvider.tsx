import { createContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
type ContextProps = {
    user: null | boolean;
    session: Session | null;
};

const AuthContext = createContext<Partial<ContextProps>>({});

interface Props {
    children: React.ReactNode;
}

const AuthProvider = (props: Props) => {
    // user null = loading
    const [user, setUser] = useState<null | boolean>(null);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    console.error("error fetching session:", error.message);
                    setUser(false);
                    return;
                }
                setSession(data.session);
                setUser(data.session ? true : false);
            } catch (error) {
                console.error("error fetching session:", error);
                setUser(false);
            }
        };
        const { data } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log(`Supabase auth event: ${event}`);
                try {
                    setSession(session);
                    setUser(session ? true : false);
                } catch (error) {
                    console.error("error during auth state change:", error);
                    setUser(false);
                }
            }
        );
        return () => {
            data.subscription.unsubscribe();
        };
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
