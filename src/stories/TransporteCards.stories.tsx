import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, within, userEvent, expect } from 'storybook/test';
import { Plus } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Transporte = {
  id: string;
  proyectoCodigo: string;
  fechaProgramada: string;
  vehiculo: string;
  responsable: string;
  direccionDestino: string;
  estado: 'Programada' | 'En transito' | 'Entregada' | 'Cancelada';
};

type Props = {
  transportes: Transporte[];
  puedeEditar: boolean;
  onNuevoTransporte: () => void;
  onCambiarEstado: (id: string, estado: string) => void;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockTransportes: Transporte[] = [
  {
    id: 'tr1',
    proyectoCodigo: 'PROY-001',
    fechaProgramada: '2026-05-15',
    vehiculo: 'Camión VPK-234',
    responsable: 'Juan Morales',
    direccionDestino: 'Calle 45 # 12-30, Bogotá',
    estado: 'Programada',
  },
  {
    id: 'tr2',
    proyectoCodigo: 'PROY-002',
    fechaProgramada: '2026-05-10',
    vehiculo: 'Furgón HKL-891',
    responsable: 'Pedro Cifuentes',
    direccionDestino: 'Carrera 7 # 80-15, Medellín',
    estado: 'En transito',
  },
];

// ─── Self-contained TransporteCards component ─────────────────────────────────

function TransporteCards({ transportes, puedeEditar, onNuevoTransporte, onCambiarEstado }: Props) {
  const [estados, setEstados] = useState<Record<string, Transporte['estado']>>(
    Object.fromEntries(transportes.map((t) => [t.id, t.estado])),
  );

  const handleEstado = (id: string, nuevoEstado: string) => {
    setEstados((prev) => ({ ...prev, [id]: nuevoEstado as Transporte['estado'] }));
    onCambiarEstado(id, nuevoEstado);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-foreground md:text-2xl">Transporte</h1>
          <p className="mt-1 text-sm text-muted-foreground">Transportes programados por proyecto.</p>
        </div>
        {puedeEditar && (
          <button
            onClick={onNuevoTransporte}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Nuevo
          </button>
        )}
      </div>

      {/* Content */}
      {transportes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
          <h3 className="text-base font-semibold text-foreground">Sin transportes</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Programa el primer transporte.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transportes.map((t) => (
            <div
              key={t.id}
              className="rounded-lg border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-sm">{t.proyectoCodigo}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.fechaProgramada} · {t.vehiculo} / {t.responsable}
                  </div>
                  <div className="text-xs text-muted-foreground">{t.direccionDestino}</div>
                </div>
                <select
                  value={estados[t.id] ?? t.estado}
                  onChange={(ev) => handleEstado(t.id, ev.target.value)}
                  aria-label={`Estado del transporte ${t.proyectoCodigo}`}
                  className="rounded border border-border bg-surface px-2 py-0.5 text-xs"
                >
                  <option>Programada</option>
                  <option>En transito</option>
                  <option>Entregada</option>
                  <option>Cancelada</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof TransporteCards> = {
  title: 'Administrativa/TransporteCards',
  component: TransporteCards,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onNuevoTransporte: fn(),
    onCambiarEstado: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const ConTransportes: Story = {
  name: 'Con transportes',
  args: {
    transportes: mockTransportes,
    puedeEditar: true,
  },
};

export const SinTransportes: Story = {
  name: 'Sin transportes (estado vacío)',
  args: {
    transportes: [],
    puedeEditar: true,
  },
};

// ─── Interaction tests ────────────────────────────────────────────────────────

export const TestCambioEstado: Story = {
  name: 'Test: cambiar estado de transporte',
  args: {
    transportes: mockTransportes,
    puedeEditar: true,
    onCambiarEstado: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Select the first status dropdown
    const selects = canvas.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], 'En transito');
    await expect(args.onCambiarEstado).toHaveBeenCalledWith('tr1', 'En transito');
  },
};
