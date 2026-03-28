import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../login-form';

// vi.mock is hoisted to the top of the file by Vitest, so variables defined
// with const/let are not yet initialized when the factory runs.
// vi.hoisted() runs *before* the hoist, making mockSignIn available inside the factory.
const mockSignIn = vi.hoisted(() => vi.fn());

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignIn,
    },
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLoginForm = () =>
  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password fields', () => {
    renderLoginForm();
    expect(screen.getByPlaceholderText('Ingresa tu email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderLoginForm();
    expect(screen.getByText('Ingresar')).toBeInTheDocument();
  });

  it('renders the "Entra a tu cuenta" heading', () => {
    renderLoginForm();
    expect(screen.getByText('Entra a tu cuenta')).toBeInTheDocument();
  });

  it('shows modal when email is empty on submit', async () => {
    renderLoginForm();
    fireEvent.submit(document.querySelector('form')!);
    await waitFor(() => {
      expect(screen.getByText('Datos Incompletos')).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('shows modal when password is empty on submit', async () => {
    renderLoginForm();
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu email'), {
      target: { name: 'email', value: 'test@example.com' },
    });
    fireEvent.submit(document.querySelector('form')!);
    await waitFor(() => {
      expect(screen.getByText('Datos Incompletos')).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('calls signInWithPassword with correct credentials', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null });
    renderLoginForm();

    fireEvent.change(screen.getByPlaceholderText('Ingresa tu email'), {
      target: { name: 'email', value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña'), {
      target: { name: 'password', value: 'secret123' },
    });
    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secret123',
      });
    });
  });

  it('navigates to "/" on successful login', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null });
    renderLoginForm();

    fireEvent.change(screen.getByPlaceholderText('Ingresa tu email'), {
      target: { name: 'email', value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña'), {
      target: { name: 'password', value: 'secret123' },
    });
    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows "Error de Acceso" modal on invalid credentials', async () => {
    mockSignIn.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
    });
    renderLoginForm();

    fireEvent.change(screen.getByPlaceholderText('Ingresa tu email'), {
      target: { name: 'email', value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña'), {
      target: { name: 'password', value: 'wrong' },
    });
    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(screen.getByText('Error de Acceso')).toBeInTheDocument();
    });
  });

  it('shows "Correo no confirmado" modal when email not confirmed', async () => {
    mockSignIn.mockResolvedValueOnce({
      error: { message: 'Email not confirmed' },
    });
    renderLoginForm();

    fireEvent.change(screen.getByPlaceholderText('Ingresa tu email'), {
      target: { name: 'email', value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña'), {
      target: { name: 'password', value: 'secret123' },
    });
    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(screen.getByText('Correo no confirmado')).toBeInTheDocument();
    });
  });

  it('shows generic error modal on unknown error', async () => {
    mockSignIn.mockResolvedValueOnce({
      error: { message: 'Unknown server error' },
    });
    renderLoginForm();

    fireEvent.change(screen.getByPlaceholderText('Ingresa tu email'), {
      target: { name: 'email', value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña'), {
      target: { name: 'password', value: 'secret123' },
    });
    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  it('shows loading state while submitting', async () => {
    mockSignIn.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 200))
    );
    renderLoginForm();

    fireEvent.change(screen.getByPlaceholderText('Ingresa tu email'), {
      target: { name: 'email', value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ingresa tu contraseña'), {
      target: { name: 'password', value: 'secret123' },
    });
    fireEvent.submit(document.querySelector('form')!);

    expect(screen.getByText('Entrando...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Entrando...')).not.toBeInTheDocument();
    });
  });
});
