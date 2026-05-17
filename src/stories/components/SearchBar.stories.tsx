/**
 * SearchBar — the search input + filter row pattern used on list pages.
 *
 * Used in: clientes, proyectos, inventario, proveedores, seguimiento/lista.
 * Pattern: Search icon overlay (pl-8) + TextInput + Select filters + date range + clear link.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { TextInput, Select } from '@/components/form-bits';

// ─── SearchInput component ─────────────────────────────────────────────────────

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
};

function SearchInput({ value, onChange, placeholder = 'Buscar…', onClear }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <TextInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8 pr-8"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ─── Controlled wrappers for stories ───────────────────────────────────────────

function SearchInputDemo({ placeholder }: { placeholder?: string }) {
  const [value, setValue] = useState('');
  return (
    <div className="w-80">
      <SearchInput value={value} onChange={setValue} onClear={() => setValue('')} placeholder={placeholder} />
      {value && <p className="mt-2 text-xs text-muted-foreground">Búsqueda: "{value}"</p>}
    </div>
  );
}

function ClientesFilterRow() {
  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState('');
  const hasFilters = q || tipo;
  return (
    <div className="w-full max-w-2xl space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, contacto o empresa…"
            className="pl-8"
          />
        </div>
        <Select value={tipo} onChange={(e) => setTipo(e.target.value)} className="sm:w-40">
          <option value="">Todos los tipos</option>
          <option value="B2B">B2B</option>
          <option value="B2C">B2C</option>
        </Select>
      </div>
      {hasFilters && (
        <button
          onClick={() => { setQ(''); setTipo(''); }}
          className="text-xs text-muted-foreground underline hover:text-foreground"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

function ProyectosFilterRow() {
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const hasFilters = q || estado || fechaDesde || fechaHasta;
  return (
    <div className="w-full max-w-3xl space-y-2">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por código, tipo o título"
            className="pl-8"
          />
        </div>
        <Select value={estado} onChange={(e) => setEstado(e.target.value)} className="min-w-[180px]">
          <option value="">Todos los estados</option>
          <option value="Solicitud">Solicitud</option>
          <option value="En definición">En definición</option>
          <option value="En cotización">En cotización</option>
          <option value="Aprobada">Aprobada</option>
          <option value="En producción">En producción</option>
          <option value="Entregado">Entregado</option>
          <option value="En garantía">En garantía</option>
          <option value="Rechazada">Rechazada</option>
        </Select>
        <div className="flex items-center gap-1">
          <TextInput
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-36"
            title="Desde"
          />
          <span className="text-xs text-muted-foreground">—</span>
          <TextInput
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-36"
            title="Hasta"
          />
        </div>
      </div>
      {hasFilters && (
        <button
          onClick={() => { setQ(''); setEstado(''); setFechaDesde(''); setFechaHasta(''); }}
          className="text-xs text-muted-foreground underline hover:text-foreground"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Components/SearchBar',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

// ─── Stories ───────────────────────────────────────────────────────────────────

export const Basic: Story = {
  name: 'SearchInput — basic',
  render: () => <SearchInputDemo />,
};

export const WithPlaceholder: Story = {
  name: 'SearchInput — custom placeholder',
  render: () => <SearchInputDemo placeholder="Buscar por código o proveedor…" />,
};

export const ClientesFilter: Story = {
  name: 'Filter row — Clientes (search + tipo select)',
  render: () => <ClientesFilterRow />,
};

export const ProyectosFilter: Story = {
  name: 'Filter row — Proyectos (search + estado + date range)',
  render: () => <ProyectosFilterRow />,
};

export const InTableContext: Story = {
  name: 'In context — filter above table',
  render: () => (
    <div className="w-full max-w-3xl space-y-3">
      <ClientesFilterRow />
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Cliente</th>
              <th className="px-4 py-2 font-medium">Contacto</th>
              <th className="px-4 py-2 font-medium">Tipo</th>
              <th className="px-4 py-2 font-medium">Proyectos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              { nombre: 'Diana Restrepo', contacto: 'diana@homefort.co', tipo: 'B2C', proyectos: 2 },
              { nombre: 'Constructora Andina', contacto: 'info@andina.co', tipo: 'B2B', proyectos: 5 },
              { nombre: 'Carlos Méndez', contacto: 'carlos@gmail.com', tipo: 'B2C', proyectos: 1 },
            ].map(({ nombre, contacto, tipo, proyectos }) => (
              <tr key={nombre} className="hover:bg-muted/30">
                <td className="px-4 py-2.5 font-medium">{nombre}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{contacto}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold ${tipo === 'B2B' ? 'bg-primary/10 text-primary' : 'bg-accent/15 text-accent-foreground'}`}>
                    {tipo}
                  </span>
                </td>
                <td className="px-4 py-2.5 tabular-nums">{proyectos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
};
