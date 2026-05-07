import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, within, userEvent, expect } from 'storybook/test';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/form-bits';
import { EmptyState } from '@/components/ui-bits';

type Item = {
  materialId: string;
  materialNombre: string;
  cantidadFaltante: number;
  unidad: string;
};

type Solicitud = {
  id: string;
  proyectoCodigo: string;
  estado: 'pendiente' | 'en_proceso' | 'atendida';
  fechaCreacion: string;
  generadaAutomaticamente: boolean;
  items: Item[];
};

type Props = {
  solicitudes: Solicitud[];
  onMarcarAtendida: (id: string) => void;
};

function SolicitudesCompraList({ solicitudes, onMarcarAtendida }: Props) {
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:mb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <nav className="mb-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <span>Compras</span>
            <span className="mx-1">›</span>
            <span>Solicitudes</span>
          </nav>
          <h1 className="truncate text-xl font-semibold text-foreground md:text-2xl">
            Solicitudes de compra
          </h1>
        </div>
      </div>

      {solicitudes.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Sin solicitudes"
          description="Las solicitudes se generan automaticamente al aprobar un proyecto con materiales faltantes."
        />
      ) : (
        <div className="space-y-3">
          {[...solicitudes].reverse().map((sol) => (
            <div key={sol.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{sol.proyectoCodigo}</span>
                  {sol.generadaAutomaticamente && (
                    <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-[11px] text-blue-800">
                      Automatica
                    </span>
                  )}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    sol.estado === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : sol.estado === 'atendida'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {sol.estado}
                </span>
              </div>
              <div className="mb-2 text-xs text-muted-foreground">{sol.fechaCreacion}</div>
              <ul className="space-y-1 text-sm">
                {sol.items.map((item, i) => (
                  <li key={i} className="text-muted-foreground">
                    {item.materialNombre}: faltan {item.cantidadFaltante} {item.unidad}
                  </li>
                ))}
              </ul>
              {sol.estado !== 'atendida' && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onMarcarAtendida(sol.id)}
                  >
                    Marcar como atendida
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const mockSolicitudes: Solicitud[] = [
  {
    id: 'sol1',
    proyectoCodigo: 'PROY-003',
    estado: 'pendiente',
    fechaCreacion: '2026-05-01',
    generadaAutomaticamente: true,
    items: [
      { materialId: 'm1', materialNombre: 'Madera roble 1"', cantidadFaltante: 15, unidad: 'm²' },
      { materialId: 'm3', materialNombre: 'Pintura blanca', cantidadFaltante: 3, unidad: 'L' },
    ],
  },
  {
    id: 'sol2',
    proyectoCodigo: 'PROY-005',
    estado: 'en_proceso',
    fechaCreacion: '2026-04-28',
    generadaAutomaticamente: false,
    items: [
      {
        materialId: 'm4',
        materialNombre: 'Vidrio templado 6mm',
        cantidadFaltante: 5,
        unidad: 'm²',
      },
    ],
  },
];

const meta: Meta<typeof SolicitudesCompraList> = {
  title: 'Compras/SolicitudesCompra',
  component: SolicitudesCompraList,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onMarcarAtendida: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const ConSolicitudes: Story = {
  name: 'Con solicitudes',
  args: {
    solicitudes: mockSolicitudes,
  },
};

export const SinSolicitudes: Story = {
  name: 'Sin solicitudes (estado vacío)',
  args: {
    solicitudes: [],
  },
};

export const Automatica: Story = {
  name: 'Solicitud generada automáticamente',
  args: {
    solicitudes: [mockSolicitudes[0]],
  },
};

export const TestMarcarAtendida: Story = {
  name: 'Interacción: Marcar como atendida',
  args: {
    solicitudes: mockSolicitudes,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getAllByRole('button', { name: /marcar como atendida/i })[0];
    await userEvent.click(btn);
    await expect(args.onMarcarAtendida).toHaveBeenCalled();
  },
};
