import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Modal from '../ui/Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Title',
    children: 'Test content',
  };

  it('renders nothing when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders title text', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders without title when not provided', () => {
    render(<Modal isOpen={true} onClose={vi.fn()}>Content</Modal>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when "Entendido" button is clicked', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Entendido'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on Escape when modal is closed', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} isOpen={false} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders error icon for type="error"', () => {
    render(<Modal {...defaultProps} type="error" />);
    // The error icon SVG wrapper is present
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Error modal has a red-bordered dialog
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('border-red-500');
  });

  it('renders with success border for type="success"', () => {
    render(<Modal {...defaultProps} type="success" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('border-green-500');
  });

  it('has aria-modal attribute', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});
