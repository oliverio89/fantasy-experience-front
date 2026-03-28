import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FormContainer from '../form-container';

describe('FormContainer', () => {
  it('renders the "Nombre" label', () => {
    render(<FormContainer />);
    expect(screen.getByText('Nombre')).toBeInTheDocument();
  });

  it('renders the name input field', () => {
    render(<FormContainer />);
    expect(screen.getByPlaceholderText('Ingresa tu nombre')).toBeInTheDocument();
  });

  it('input is of type text', () => {
    render(<FormContainer />);
    expect(screen.getByPlaceholderText('Ingresa tu nombre')).toHaveAttribute('type', 'text');
  });

  it('renders without crashing when no props are provided', () => {
    const { container } = render(<FormContainer />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies extra className to wrapper', () => {
    const { container } = render(<FormContainer className="extra-class" />);
    expect(container.firstChild).toHaveClass('extra-class');
  });

  it('applies custom padding via propPadding', () => {
    const { container } = render(<FormContainer propPadding="2rem" />);
    expect(container.firstChild).toHaveStyle({ padding: '2rem' });
  });
});
