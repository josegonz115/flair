import { createContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useFashionFinderStore } from "@/store/fashion-finder";

type ContextProps = {
    user: null | boolean;
    session: Session | null;
    signIn: (
        email: string,
        password: string
    ) => Promise<{ error: Error | null }>;
    signUp: (
        email: string,
        password: string
    ) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: Error | null }>;
    updatePassword: (password: string) => Promise<{ error: Error | null }>;
    loading: boolean;
};

const AuthContext = createContext<Partial<ContextProps>>({});

interface Props {
    children: React.ReactNode;
}

const AuthProvider = (props: Props) => {
    // user null = loading
    const [user, setUser] = useState<null | boolean>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(false);

    const setUserId = useFashionFinderStore((state) => state.setUserId);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    console.error("error fetching session:", error.message);
                    setUser(false);
                    setUserId(null);
                    return;
                }
                setSession(data.session);
                setUser(data.session ? true : false);

                if (data.session) {
                    setUserId(data.session.user.id);
                } else {
                    setUserId(null);
                }
            } catch (error) {
                console.error("error fetching session:", error);
                setUser(false);
                setUserId(null);
            }
        };

        fetchSession();

        const { data } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log(`Supabase auth event: ${event}`);
                try {
                    setSession(session);
                    setUser(session ? true : false);

                    if (session) {
                        setUserId(session.user.id);
                    } else {
                        setUserId(null);
                    }
                } catch (error) {
                    console.error("error during auth state change:", error);
                    setUser(false);
                    setUserId(null);
                }
            }
        );
        return () => {
            data.subscription.unsubscribe();
        };
    }, []);

    // Sign in with email and password
    const signIn = async (email: string, password: string) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { error };
        } catch (error) {
            console.error("Error signing in:", error);
            return {
                error:
                    error instanceof Error ? error : new Error("Unknown error"),
            };
        } finally {
            setLoading(false);
        }
    };

    // Sign up with email and password
    const signUp = async (email: string, password: string) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            return { error };
        } catch (error) {
            console.error("Error signing up:", error);
            return {
                error:
                    error instanceof Error ? error : new Error("Unknown error"),
            };
        } finally {
            setLoading(false);
        }
    };

    // Sign out
    const signOut = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
            // The auth state change will update the store
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                signIn,
                signUp,
                signOut,
                loading,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
