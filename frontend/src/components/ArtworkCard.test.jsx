import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArtworkCard } from './ArtworkCard';

const item = { _id: '1', slug: 'a', title: 'A Work', artist: { name: 'An Artist' }, year: 2024, price: 50000, images: [{ url: 'x', alt: 'A Work' }], availability: 'available' };

const wrap = (ui) => render(<QueryClientProvider client={new QueryClient()}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>);

describe('ArtworkCard', () => {
  it('renders accessible artwork details', () => {
    wrap(<ArtworkCard artwork={item} />);
    expect(screen.getByText('A Work')).toBeInTheDocument();
    expect(screen.getByAltText('A Work')).toBeInTheDocument();
  });
  it('shows price on request instead of a number', () => {
    wrap(<ArtworkCard artwork={{ ...item, price: null, priceOnRequest: true }} />);
    expect(screen.getByText(/price on request/i)).toBeInTheDocument();
  });
});
