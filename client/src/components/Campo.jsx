export default function Campo({ nombre, label, valor, onChange, error, ayuda, tipo = 'text', children, ...props }) {
  const id = 'campo-' + nombre;
  return <div className="field-group">
    <label htmlFor={id}>{label}</label>
    {children ? <select id={id} name={nombre} value={valor} onChange={onChange}
      aria-invalid={!!error} aria-describedby={error ? id + '-error' : ayuda ? id + '-ayuda' : undefined} {...props}>{children}</select>
      : <input id={id} name={nombre} type={tipo} value={valor} onChange={onChange}
        aria-invalid={!!error} aria-describedby={error ? id + '-error' : ayuda ? id + '-ayuda' : undefined} {...props} />}
    {ayuda && <p className="muted field-help" id={id + '-ayuda'}>{ayuda}</p>}
    {error && <p className="field-error" id={id + '-error'}>{error}</p>}
  </div>;
}
