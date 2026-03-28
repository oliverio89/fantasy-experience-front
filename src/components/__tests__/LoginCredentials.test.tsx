import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoginCredentials from '../login-credentials';

describe('LoginCredentials', () => {
  it('renders the label text', () => {
    render(<LoginCredentials nombreDeUsuario="Nombre de usuario" />);
    expect(screen.getByText('Nombre de usuario')).toBeInTheDocument();
  });

  it('renders the input with placeholder', () => {
    render(<LoginCredentials johnPlaceholder="john@example.com" />);
    expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument();
  });

  it('renders input as text type', () => {
    render(<LoginCredentials johnPlaceholder="Escribe aquí" />);
    expect(screen.getByPlaceholderText('Escribe aquí')).toHaveAttribute('type', 'text');
  });

  it('renders without crashing when no props are provided', () => {
    render(<LoginCredentials />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('applies custom padding via propPadding', () => {
    render(
      <LoginCredentials
        johnPlaceholder="test"
        propPadding="10px 20px"
      />
    );
    const input = screen.getByPlaceholderText('test');
    expect(input).toHaveStyle({ padding: '10px 20px' });
  });

  it('applies extra className to wrapper', () => {
    const { container } = render(
      <LoginCredentials className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
