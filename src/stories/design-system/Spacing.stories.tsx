import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Design System/Spacing & Radius',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </h3>
  );
}

export const BorderRadius: Story = {
  name: 'Border Radius Scale',
  render: () => (
    <div className="max-w-3xl p-4">
      <SectionTitle>Border Radius</SectionTitle>
      <p className="mb-6 text-sm text-muted-foreground">
        Base: <code className="font-mono text-xs">--radius: 0.5rem (8px)</code>. All radii are
        derived from this single token so the whole UI scales together.
      </p>
      <div className="flex flex-wrap gap-8">
        {[
          { cls: 'rounded-sm', label: 'rounded-sm', cssVar: '--radius-sm', computed: '4px', usage: 'Checkboxes, small chips' },
          { cls: 'rounded-md', label: 'rounded-md', cssVar: '--radius-md', computed: '6px', usage: 'Inputs, selects, tags' },
          { cls: 'rounded-lg', label: 'rounded-lg', cssVar: '--radius-lg', computed: '8px', usage: 'Cards, panels (default)' },
          { cls: 'rounded-xl', label: 'rounded-xl', cssVar: '--radius-xl', computed: '12px', usage: 'Modals, drawers' },
          { cls: 'rounded-2xl', label: 'rounded-2xl', cssVar: '--radius-2xl', computed: '16px', usage: 'Large surface accents' },
          { cls: 'rounded-full', label: 'rounded-full', cssVar: '9999px', computed: '9999px', usage: 'Status badges, avatars' },
        ].map(({ cls, label, cssVar, computed, usage }) => (
          <div key={cls} className="flex flex-col items-center gap-3">
            <div className={`h-16 w-16 border-2 border-primary bg-primary/10 ${cls}`} />
            <div className="text-center">
              <p className="font-mono text-xs font-medium text-foreground">{label}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{cssVar}</p>
              <p className="text-[10px] text-muted-foreground">{computed}</p>
              <p className="mt-1 max-w-[96px] text-center text-[10px] text-muted-foreground">{usage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const LayoutPatterns: Story = {
  name: 'Layout Patterns',
  render: () => (
    <div className="max-w-2xl space-y-8 p-4">
      {/* Card / Panel */}
      <div>
        <SectionTitle>Card / Panel</SectionTitle>
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm font-medium text-foreground">Contenido del panel</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Clases: <code className="font-mono">rounded-lg border border-border bg-surface p-4</code>
          </p>
        </div>
      </div>

      {/* Form card */}
      <div>
        <SectionTitle>Form Card (larger padding)</SectionTitle>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm font-medium text-foreground">Formulario de registro</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Clases: <code className="font-mono">rounded-lg border border-border bg-surface p-5</code>
          </p>
        </div>
      </div>

      {/* Section with header */}
      <div>
        <SectionTitle>Section with header + list rows</SectionTitle>
        <div className="rounded-lg border border-border bg-surface">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">Proyectos recientes</h2>
            <a className="text-xs text-primary hover:underline">Ver todos →</a>
          </header>
          {['PY-001 — Diana Restrepo', 'PY-002 — Constructora Andina', 'PY-003 — Carlos Méndez'].map(
            (item, i, arr) => (
              <div
                key={item}
                className={`px-4 py-3 text-sm text-foreground hover:bg-muted/50 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}
              >
                {item}
              </div>
            ),
          )}
        </div>
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">
          Header: px-4 py-3 · Rows: px-4 py-3 divide-y divide-border
        </p>
      </div>

      {/* Dense table */}
      <div>
        <SectionTitle>Dense Table</SectionTitle>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">Código</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">Cliente</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">Estado</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-foreground">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { code: 'PY-001', client: 'Diana Restrepo', estado: 'Aprobada', value: '$8.500.000' },
                { code: 'PY-002', client: 'Constructora Andina', estado: 'En producción', value: '$22.000.000' },
                { code: 'PY-003', client: 'Carlos Méndez', estado: 'En cotización', value: '$4.200.000' },
              ].map(({ code, client, estado, value }) => (
                <tr key={code} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{code}</td>
                  <td className="px-3 py-2 text-muted-foreground">{client}</td>
                  <td className="px-3 py-2">{estado}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">
          Cells: px-3 py-2 · Header: bg-muted · Body: divide-y divide-border hover:bg-muted/30
        </p>
      </div>

      {/* KPI card row */}
      <div>
        <SectionTitle>KPI Card Grid</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Clientes', value: 24 },
            { label: 'Proyectos', value: 48 },
            { label: 'En cotización', value: 7 },
            { label: 'Aprobadas', value: 12 },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-border bg-surface p-3">
              <p className="text-2xl font-semibold text-foreground">{value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">
          rounded-lg border border-border bg-surface p-3 · grid-cols-2 gap-3 sm:grid-cols-4
        </p>
      </div>
    </div>
  ),
};

export const SpacingScale: Story = {
  name: 'Spacing Scale',
  render: () => (
    <div className="max-w-xl p-4">
      <SectionTitle>Spacing Reference</SectionTitle>
      <p className="mb-6 text-sm text-muted-foreground">
        Tailwind's default spacing scale (base 4px). Common values used in the app:
      </p>
      <div className="space-y-3">
        {[
          { token: '0.5 / gap-0.5', px: '2px', usage: 'Icon + text micro-gap' },
          { token: '1 / p-1', px: '4px', usage: 'Tight chip padding' },
          { token: '1.5 / px-1.5', px: '6px', usage: 'Badge horizontal padding' },
          { token: '2 / p-2', px: '8px', usage: 'Small component padding' },
          { token: '3 / px-3 py-2', px: '12px / 8px', usage: 'Dense table cells' },
          { token: '4 / p-4', px: '16px', usage: 'Card padding (default)' },
          { token: '5 / p-5', px: '20px', usage: 'Form card padding' },
          { token: '6 / p-6', px: '24px', usage: 'Page content padding' },
        ].map(({ token, px, usage }) => (
          <div key={token} className="flex items-center gap-4 border-b border-border pb-3">
            <code className="w-40 shrink-0 font-mono text-xs text-foreground">{token}</code>
            <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">{px}</span>
            <span className="text-xs text-muted-foreground">{usage}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};
