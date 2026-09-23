import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { UpdateModal } from '../src/renderer/src/components/modal/UpdateModal';

describe('UpdateModal Component', () => {
  const defaultProps = {
    isOpen: true,
    currentVersion: '1.0.0',
    updateInfo: {
      version: '1.1.0',
      releaseNotes: '### Fitur Baru\n- Pemandangan Kalender\n- Bohemian Card Covers'
    },
    status: 'available' as const,
    progress: null,
    errorMessage: null,
    onStartDownload: vi.fn(),
    onInstall: vi.fn(),
    onPostpone: vi.fn(),
    onIgnoreVersion: vi.fn()
  };

  it('renders version comparison and release notes', () => {
    render(<UpdateModal {...defaultProps} />);
    expect(screen.getByText(/Pembaruan Versi Tersedia/i)).toBeInTheDocument();
    expect(screen.getByText(/v1.0.0/)).toBeInTheDocument();
    expect(screen.getByText(/v1.1.0/)).toBeInTheDocument();
    expect(screen.getByText(/Pemandangan Kalender/)).toBeInTheDocument();
  });

  it('triggers onStartDownload when clicking Perbarui Sekarang', () => {
    render(<UpdateModal {...defaultProps} />);
    const updateBtn = screen.getByRole('button', { name: /Perbarui Sekarang/i });
    fireEvent.click(updateBtn);
    expect(defaultProps.onStartDownload).toHaveBeenCalled();
  });

  it('triggers onPostpone when clicking Nanti Saja', () => {
    render(<UpdateModal {...defaultProps} />);
    const postponeBtn = screen.getByRole('button', { name: /Nanti Saja/i });
    fireEvent.click(postponeBtn);
    expect(defaultProps.onPostpone).toHaveBeenCalled();
  });

  it('triggers onIgnoreVersion when clicking Abaikan Versi Ini', () => {
    render(<UpdateModal {...defaultProps} />);
    const ignoreBtn = screen.getByRole('button', { name: /Abaikan Versi Ini/i });
    fireEvent.click(ignoreBtn);
    expect(defaultProps.onIgnoreVersion).toHaveBeenCalledWith('1.1.0');
  });

  it('renders progress bar when status is downloading', () => {
    render(
      <UpdateModal
        {...defaultProps}
        status="downloading"
        progress={{ percent: 65, bytesPerSecond: 1048576, transferred: 68157440, total: 104857600 }}
      />
    );
    expect(screen.getByText(/Mengunduh pembaruan/i)).toBeInTheDocument();
    expect(screen.getByText(/65%/)).toBeInTheDocument();
  });

  it('renders Mulai Ulang & Pasang button when status is downloaded', () => {
    render(<UpdateModal {...defaultProps} status="downloaded" />);
    expect(screen.getByText(/Pembaruan Siap Dipasang!/i)).toBeInTheDocument();
    const installBtn = screen.getByRole('button', { name: /Mulai Ulang & Pasang/i });
    fireEvent.click(installBtn);
    expect(defaultProps.onInstall).toHaveBeenCalled();
  });
});
