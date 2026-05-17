import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Design System/Colors',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

type SwatchDef = {
  label: string;
  bg: string;
  cssVar: string;
  textOnTop?: string;
};

function Swatch({ label, bg, cssVar, textOnTop = 'text-foreground' }: SwatchDef) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={`flex h-14 w-full items-end rounded-lg border border-border p-2 ${bg}`}
        title={cssVar}
      >
        <span className={`font-mono text-[10px] leading-none opacity-60 ${textOnTop}`}>
          {cssVar}
        </span>
      </div>
      <p className="text-xs font-medium text-foreground">{label}</p>
    </div>
  );
}

function Section({ title, note, swatches }: { title: string; note?: string; swatches: SwatchDef[] }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h3>
        {note && <span className="text-xs text-muted-foreground">{note}</span>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {swatches.map((s) => (
          <Swatch key={s.cssVar} {...s} />
        ))}
      </div>
    </section>
  );
}

const GROUPS: { title: string; note?: string; swatches: SwatchDef[] }[] = [
  {
    title: 'Background & Surface',
    note: 'Base layers, stacked from lightest to densest',
    swatches: [
      { label: 'Background', bg: 'bg-background', cssVar: '--background' },
      { label: 'Surface', bg: 'bg-surface', cssVar: '--surface' },
      { label: 'Surface 2', bg: 'bg-surface-2', cssVar: '--surface-2' },
      { label: 'Card', bg: 'bg-card', cssVar: '--card' },
      { label: 'Muted', bg: 'bg-muted', cssVar: '--muted' },
      { label: 'Border', bg: 'bg-border', cssVar: '--border' },
    ],
  },
  {
    title: 'Brand',
    note: 'Primary = graphite blue · Accent = naranja madera',
    swatches: [
      { label: 'Primary', bg: 'bg-primary', cssVar: '--primary', textOnTop: 'text-primary-foreground' },
      { label: 'Primary FG', bg: 'bg-primary-foreground', cssVar: '--primary-foreground' },
      { label: 'Secondary', bg: 'bg-secondary', cssVar: '--secondary' },
      { label: 'Secondary FG', bg: 'bg-secondary-foreground', cssVar: '--secondary-foreground', textOnTop: 'text-primary-foreground' },
      { label: 'Accent', bg: 'bg-accent', cssVar: '--accent', textOnTop: 'text-accent-foreground' },
      { label: 'Accent FG', bg: 'bg-accent-foreground', cssVar: '--accent-foreground', textOnTop: 'text-primary-foreground' },
    ],
  },
  {
    title: 'Feedback',
    note: 'Semantic colors for system messages and state badges',
    swatches: [
      { label: 'Destructive', bg: 'bg-destructive', cssVar: '--destructive', textOnTop: 'text-destructive-foreground' },
      { label: 'Destructive FG', bg: 'bg-destructive-foreground', cssVar: '--destructive-foreground' },
      { label: 'Success', bg: 'bg-success', cssVar: '--success', textOnTop: 'text-success-foreground' },
      { label: 'Success FG', bg: 'bg-success-foreground', cssVar: '--success-foreground' },
      { label: 'Warning', bg: 'bg-warning', cssVar: '--warning', textOnTop: 'text-warning-foreground' },
      { label: 'Warning FG', bg: 'bg-warning-foreground', cssVar: '--warning-foreground', textOnTop: 'text-primary-foreground' },
      { label: 'Info', bg: 'bg-info', cssVar: '--info', textOnTop: 'text-info-foreground' },
      { label: 'Info FG', bg: 'bg-info-foreground', cssVar: '--info-foreground' },
    ],
  },
  {
    title: 'Text',
    swatches: [
      { label: 'Foreground', bg: 'bg-foreground', cssVar: '--foreground', textOnTop: 'text-primary-foreground' },
      { label: 'Muted FG', bg: 'bg-muted-foreground', cssVar: '--muted-foreground', textOnTop: 'text-primary-foreground' },
      { label: 'Card FG', bg: 'bg-card-foreground', cssVar: '--card-foreground', textOnTop: 'text-primary-foreground' },
    ],
  },
  {
    title: 'Border & Input',
    swatches: [
      { label: 'Border', bg: 'bg-border', cssVar: '--border' },
      { label: 'Input', bg: 'bg-input', cssVar: '--input' },
      { label: 'Ring', bg: 'bg-ring', cssVar: '--ring', textOnTop: 'text-primary-foreground' },
    ],
  },
  {
    title: 'Sidebar',
    note: 'Dark sidebar surface with its own scale',
    swatches: [
      { label: 'Sidebar', bg: 'bg-sidebar', cssVar: '--sidebar', textOnTop: 'text-sidebar-foreground' },
      { label: 'Sidebar FG', bg: 'bg-sidebar-foreground', cssVar: '--sidebar-foreground', textOnTop: 'text-primary-foreground' },
      { label: 'Sidebar Primary', bg: 'bg-sidebar-primary', cssVar: '--sidebar-primary', textOnTop: 'text-sidebar-primary-foreground' },
      { label: 'Sidebar Accent', bg: 'bg-sidebar-accent', cssVar: '--sidebar-accent', textOnTop: 'text-sidebar-foreground' },
      { label: 'Sidebar Border', bg: 'bg-sidebar-border', cssVar: '--sidebar-border', textOnTop: 'text-sidebar-foreground' },
    ],
  },
  {
    title: 'Charts',
    note: 'Data visualization palette — used with Recharts',
    swatches: [
      { label: 'Chart 1', bg: 'bg-chart-1', cssVar: '--chart-1', textOnTop: 'text-primary-foreground' },
      { label: 'Chart 2', bg: 'bg-chart-2', cssVar: '--chart-2', textOnTop: 'text-accent-foreground' },
      { label: 'Chart 3', bg: 'bg-chart-3', cssVar: '--chart-3', textOnTop: 'text-primary-foreground' },
      { label: 'Chart 4', bg: 'bg-chart-4', cssVar: '--chart-4', textOnTop: 'text-accent-foreground' },
      { label: 'Chart 5', bg: 'bg-chart-5', cssVar: '--chart-5', textOnTop: 'text-primary-foreground' },
    ],
  },
];

export const FullPalette: Story = {
  name: 'Full Palette',
  render: () => (
    <div className="max-w-5xl p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Color System</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          All tokens are OKLch-based CSS custom properties defined in{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">src/styles.css</code>
          . They adapt automatically between light and dark mode.
        </p>
      </div>
      {GROUPS.map((g) => (
        <Section key={g.title} {...g} />
      ))}
    </div>
  ),
};

export const FeedbackColors: Story = {
  name: 'Feedback Colors — in context',
  render: () => (
    <div className="max-w-xl space-y-3 p-4">
      {[
        { bg: 'bg-destructive/10', border: 'border-destructive/40', text: 'text-destructive', label: 'Error / Destructive', icon: '⚠' },
        { bg: 'bg-success/10', border: 'border-success/40', text: 'text-success', label: 'Success', icon: '✓' },
        { bg: 'bg-warning/10', border: 'border-warning/40', text: 'text-warning-foreground', label: 'Warning', icon: '⚠' },
        { bg: 'bg-info/10', border: 'border-info/40', text: 'text-info', label: 'Info', icon: 'i' },
      ].map(({ bg, border, text, label, icon }) => (
        <div
          key={label}
          className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm ${bg} ${border} ${text}`}
        >
          <span className="font-bold">{icon}</span>
          <div>
            <strong>{label}</strong> — semantic color used in banners and badges.
          </div>
        </div>
      ))}
    </div>
  ),
};

export const BadgeColors: Story = {
  name: 'Badge Colors — status map',
  render: () => (
    <div className="max-w-md p-4">
      <p className="mb-4 text-xs text-muted-foreground">
        How design tokens map to project lifecycle badge colors
      </p>
      <div className="space-y-2">
        {[
          { estado: 'Solicitud', bg: 'bg-muted', text: 'text-foreground', token: 'muted / foreground' },
          { estado: 'En definición', bg: 'bg-info/15', text: 'text-info', token: 'info' },
          { estado: 'En cotización', bg: 'bg-warning/20', text: 'text-warning-foreground', token: 'warning' },
          { estado: 'Aprobada', bg: 'bg-success/15', text: 'text-success', token: 'success' },
          { estado: 'En producción', bg: 'bg-primary/10', text: 'text-primary', token: 'primary' },
          { estado: 'Entregado', bg: 'bg-success/25', text: 'text-success', token: 'success (stronger)' },
          { estado: 'En garantía', bg: 'bg-warning/20', text: 'text-warning-foreground', token: 'warning' },
          { estado: 'Rechazada', bg: 'bg-destructive/15', text: 'text-destructive', token: 'destructive' },
        ].map(({ estado, bg, text, token }) => (
          <div key={estado} className="flex items-center justify-between text-sm">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${bg} ${text}`}>
              {estado}
            </span>
            <span className="font-mono text-xs text-muted-foreground">{token}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};
