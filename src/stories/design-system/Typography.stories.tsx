import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Design System/Typography',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

export const TypeScale: Story = {
  name: 'Type Scale',
  render: () => (
    <div className="max-w-2xl p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Type Scale</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Font: <code className="font-mono text-xs">ui-sans-serif, system-ui</code> with{' '}
          <code className="font-mono text-xs">cv11, ss01</code> features enabled.
          Dense business UI — sizes range from 10px to 24px.
        </p>
      </div>
      <div className="space-y-0 divide-y divide-border">
        {[
          {
            size: 'text-2xl',
            weight: 'font-semibold',
            sample: 'Gestión de Proyectos',
            usage: 'PageHeader — desktop h1',
            px: '24px',
          },
          {
            size: 'text-xl',
            weight: 'font-semibold',
            sample: 'Gestión de Proyectos',
            usage: 'PageHeader — mobile h1',
            px: '20px',
          },
          {
            size: 'text-lg',
            weight: 'font-semibold',
            sample: 'Resumen de orden',
            usage: 'Modal / Sheet title',
            px: '18px',
          },
          {
            size: 'text-base',
            weight: 'font-semibold',
            sample: 'Proyectos recientes',
            usage: 'Card / section title',
            px: '16px',
          },
          {
            size: 'text-sm',
            weight: 'font-medium',
            sample: 'Correo electrónico del contacto',
            usage: 'Labels, body, button text',
            px: '14px',
          },
          {
            size: 'text-sm',
            weight: 'font-normal',
            sample: 'El cliente aprobó la cotización versión 3.',
            usage: 'Body text, table cells',
            px: '14px',
          },
          {
            size: 'text-xs',
            weight: 'font-medium',
            sample: 'Comercial › Clientes › Diana Restrepo',
            usage: 'Breadcrumbs, badges, hints',
            px: '12px',
          },
          {
            size: 'text-xs',
            weight: 'font-normal',
            sample: 'Última modificación: 12 de mayo de 2025',
            usage: 'Metadata, timestamps',
            px: '12px',
          },
          {
            size: 'text-[10px]',
            weight: 'font-mono',
            sample: '--primary · oklch(0.34 0.05 255)',
            usage: 'Token names, CSS variables',
            px: '10px',
          },
        ].map(({ size, weight, sample, usage, px }) => (
          <div key={`${size}-${weight}`} className="flex items-baseline gap-4 py-4">
            <div className="flex-1 min-w-0">
              <p className={`${size} ${weight} text-foreground truncate`}>{sample}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-[10px] text-muted-foreground">
                {size} {weight !== 'font-normal' ? weight : ''}
              </p>
              <p className="text-[10px] text-muted-foreground">{px} · {usage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const FontWeights: Story = {
  name: 'Font Weights',
  render: () => (
    <div className="max-w-lg space-y-4 p-4">
      {[
        { weight: 'font-normal', css: '400', desc: 'Body text, table cells, descriptions' },
        { weight: 'font-medium', css: '500', desc: 'Labels, navigation items, button text' },
        { weight: 'font-semibold', css: '600', desc: 'Headings, card titles, section headers' },
        { weight: 'font-bold', css: '700', desc: 'Emphasis, important data points' },
      ].map(({ weight, css, desc }) => (
        <div key={weight} className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="flex-1">
            <p className={`text-base ${weight} text-foreground`}>
              El carpintero fabrica muebles de roble y cedro.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-xs text-muted-foreground">{weight}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{css}</p>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const TextColors: Story = {
  name: 'Text Color Tokens',
  render: () => (
    <div className="max-w-lg space-y-0 divide-y divide-border p-4">
      {[
        { cls: 'text-foreground', token: 'text-foreground', desc: 'Primary content — headings, body, labels' },
        { cls: 'text-muted-foreground', token: 'text-muted-foreground', desc: 'Secondary content — hints, timestamps, breadcrumbs' },
        { cls: 'text-primary', token: 'text-primary', desc: 'Brand emphasis — links, active states, primary actions' },
        { cls: 'text-accent-foreground', token: 'text-accent-foreground', desc: 'Accent on accent background (naranja madera context)' },
        { cls: 'text-destructive', token: 'text-destructive', desc: 'Errors — field validation, error banners' },
        { cls: 'text-success', token: 'text-success', desc: 'Positive states — Aprobada, Entregado badges' },
        { cls: 'text-warning-foreground', token: 'text-warning-foreground', desc: 'Caution — warnings, En garantía, read-only banners' },
        { cls: 'text-info', token: 'text-info', desc: 'Informational — info banners, En definición badges' },
      ].map(({ cls, token, desc }) => (
        <div key={cls} className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className={`text-sm font-medium ${cls}`}>{desc}</p>
          </div>
          <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {token}
          </code>
        </div>
      ))}
    </div>
  ),
};

export const Prose: Story = {
  name: 'Prose — paragraph in context',
  render: () => (
    <div className="max-w-prose space-y-4 rounded-lg border border-border bg-surface p-6">
      <h1 className="text-2xl font-semibold text-foreground">Proyecto PY-2025-042</h1>
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>Comercial</span>
        <span>›</span>
        <span>Proyectos</span>
        <span>›</span>
        <span>PY-2025-042</span>
      </nav>
      <p className="text-sm text-foreground">
        Mueble de cocina integral en madera de cedro con acabado natural. El cliente solicitó
        módulos superiores e inferiores con isla central. El diseño fue aprobado en la versión 3
        de la cotización.
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Creado: 2 de mayo de 2025</span>
        <span>·</span>
        <span>Última modificación: 12 de mayo de 2025</span>
      </div>
      <p className="text-xs font-medium text-primary hover:underline cursor-pointer">
        Ver cotización vigente →
      </p>
    </div>
  ),
};
