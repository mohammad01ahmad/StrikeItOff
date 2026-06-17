import { Text, Pressable } from 'react-native';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from './authContext';
import GoogleSigninService from './GoogleSigninService';
import { supabase } from '../../lib/supabase';

jest.mock('./GoogleSigninService', () => ({
    __esModule: true,
    default: {
        configure: jest.fn(),
        signIn: jest.fn(),
        signOut: jest.fn(),
    },
}));

jest.mock('../../lib/supabase', () => {
    const maybeSingle = jest.fn();
    return {
        supabase: {
            __maybeSingle: maybeSingle,
            auth: {
                getSession: jest.fn(),
                onAuthStateChange: jest.fn(),
                signInWithIdToken: jest.fn(),
                signOut: jest.fn(),
            },
            from: jest.fn(() => ({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({ maybeSingle })),
                })),
            })),
        },
    };
});

const mockGoogle = GoogleSigninService as jest.Mocked<typeof GoogleSigninService>;
const mockAuth = supabase.auth as jest.Mocked<typeof supabase.auth>;
const mockOnAuthStateChange = supabase.auth.onAuthStateChange as jest.Mock;
const mockMaybeSingle = (supabase as unknown as { __maybeSingle: jest.Mock }).__maybeSingle;

const fakeSession = (overrides = {}) => ({
    user: { id: 'user-123', user_metadata: {} },
    ...overrides,
});

// Test consumer that surfaces context values and exposes the actions as buttons.
function Probe() {
    const { session, initializing, isOnboarded, signInWithGoogle, signOut, markOnboarded } = useAuth();
    return (
        <>
            <Text testID="initializing">{String(initializing)}</Text>
            <Text testID="hasSession">{String(!!session)}</Text>
            <Text testID="isOnboarded">{String(isOnboarded)}</Text>
            <Pressable testID="signIn" onPress={() => signInWithGoogle()}>
                <Text>signIn</Text>
            </Pressable>
            <Pressable testID="signOut" onPress={() => signOut()}>
                <Text>signOut</Text>
            </Pressable>
            <Pressable testID="markOnboarded" onPress={() => markOnboarded()}>
                <Text>markOnboarded</Text>
            </Pressable>
        </>
    );
}

const renderProvider = () =>
    render(
        <AuthProvider>
            <Probe />
        </AuthProvider>
    );

beforeEach(() => {
    jest.clearAllMocks();
    // Sensible defaults: logged out, no listener teardown errors.
    mockAuth.getSession.mockResolvedValue({ data: { session: null } } as never);
    mockAuth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
    } as never);
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockAuth.signInWithIdToken.mockResolvedValue({ error: null } as never);
    mockAuth.signOut.mockResolvedValue({ error: null } as never);
    mockGoogle.signIn.mockResolvedValue({ idToken: 'google-token' });
    mockGoogle.signOut.mockResolvedValue(undefined);
});

describe('AuthProvider', () => {
    it('configures Google Sign-In on mount', async () => {
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('initializing')).toHaveTextContent('false'));
        expect(mockGoogle.configure).toHaveBeenCalled();
    });

    it('resolves to an unauthenticated state when there is no session', async () => {
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('initializing')).toHaveTextContent('false'));
        expect(screen.getByTestId('hasSession')).toHaveTextContent('false');
        expect(screen.getByTestId('isOnboarded')).toHaveTextContent('false');
    });

    it('marks the user onboarded when the users row has onboarded=true', async () => {
        mockAuth.getSession.mockResolvedValue({ data: { session: fakeSession() } } as never);
        mockMaybeSingle.mockResolvedValue({ data: { onboarded: true }, error: null });

        renderProvider();

        await waitFor(() => expect(screen.getByTestId('hasSession')).toHaveTextContent('true'));
        await waitFor(() => expect(screen.getByTestId('isOnboarded')).toHaveTextContent('true'));
    });

    it('treats a session without an onboarded row as not onboarded', async () => {
        mockAuth.getSession.mockResolvedValue({ data: { session: fakeSession() } } as never);
        mockMaybeSingle.mockResolvedValue({ data: { onboarded: false }, error: null });

        renderProvider();

        await waitFor(() => expect(screen.getByTestId('hasSession')).toHaveTextContent('true'));
        expect(screen.getByTestId('isOnboarded')).toHaveTextContent('false');
    });

    it('exchanges the Google ID token for a Supabase session on signInWithGoogle', async () => {
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('initializing')).toHaveTextContent('false'));

        await act(async () => {
            fireEvent.press(screen.getByTestId('signIn'));
        });

        expect(mockGoogle.signIn).toHaveBeenCalled();
        expect(mockAuth.signInWithIdToken).toHaveBeenCalledWith({
            provider: 'google',
            token: 'google-token',
        });
    });

    it('signs out of both Google and Supabase', async () => {
        renderProvider();
        await waitFor(() => expect(screen.getByTestId('initializing')).toHaveTextContent('false'));

        await act(async () => {
            fireEvent.press(screen.getByTestId('signOut'));
        });

        expect(mockGoogle.signOut).toHaveBeenCalled();
        expect(mockAuth.signOut).toHaveBeenCalled();
    });

    it('flips isOnboarded to true when markOnboarded is called', async () => {
        mockAuth.getSession.mockResolvedValue({ data: { session: fakeSession() } } as never);
        mockMaybeSingle.mockResolvedValue({ data: { onboarded: false }, error: null });

        renderProvider();
        await waitFor(() => expect(screen.getByTestId('hasSession')).toHaveTextContent('true'));
        expect(screen.getByTestId('isOnboarded')).toHaveTextContent('false');

        await act(async () => {
            fireEvent.press(screen.getByTestId('markOnboarded'));
        });

        expect(screen.getByTestId('isOnboarded')).toHaveTextContent('true');
    });

    it('updates session when onAuthStateChange fires', async () => {
        let authCallback: (event: string, session: unknown) => void = () => {};
        mockOnAuthStateChange.mockImplementation((cb) => {
            authCallback = cb;
            return { data: { subscription: { unsubscribe: jest.fn() } } };
        });

        renderProvider();
        await waitFor(() => expect(screen.getByTestId('hasSession')).toHaveTextContent('false'));

        await act(async () => {
            authCallback('SIGNED_IN', fakeSession());
        });

        await waitFor(() => expect(screen.getByTestId('hasSession')).toHaveTextContent('true'));
    });
});

describe('useAuth', () => {
    it('throws when used outside of an AuthProvider', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<Probe />)).toThrow(/AuthProvider/);
        spy.mockRestore();
    });
});
