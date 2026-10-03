import { useRef, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import clientesService from "../services/clientesService";
import useUnsavedChanges from "../hooks/useUnsavedChanges";
import Icon from "./Icon";

const campos = [
  {
    name: "nombre",
    label: "Nombre",
    type: "text",
    autocomplete: "name",
    example: "Nombre del cliente…",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    autocomplete: "email",
    example: "contacto@ejemplo.com…",
  },
  {
    name: "telefono",
    label: "Teléfono",
    type: "tel",
    autocomplete: "tel",
    example: "+54 388…",
  },
  {
    name: "ciudad",
    label: "Ciudad",
    type: "text",
    autocomplete: "address-level2",
    example: "San Salvador de Jujuy…",
  },
];
const initial = { nombre: "", email: "", telefono: "", ciudad: "" };
const FormCliente = ({ onCreated }) => {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const [loading, setLoading] = useState(false);
  const form = useRef(null);
  const submitting = useRef(false);
  const dirty = Object.values(values).some((value) => value.length > 0);
  useUnsavedChanges(dirty);
  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    const nextErrors = {};
    for (const field of campos)
      if (!values[field.name].trim())
        nextErrors[field.name] = "Completá este campo.";
    if (
      values.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
    )
      nextErrors.email = "Ingresá un email válido.";
    setErrors(nextErrors);
    setMessage("");
    setFailure("");
    if (Object.keys(nextErrors).length) {
      form.current
        .querySelector('[name="' + Object.keys(nextErrors)[0] + '"]')
        .focus();
      return;
    }
    submitting.current = true;
    setLoading(true);
    const { nombre, email, telefono, ciudad } = values;
    try {
      const response = await clientesService.crearCliente({
        email,
        username: nombre.toLowerCase().replace(/\s/g, ""),
        name: { firstname: nombre, lastname: "-" },
        address: { city: ciudad },
        phone: telefono,
      });
      setMessage("Cliente creado correctamente. ID: " + response.id);
      setValues(initial);
      onCreated?.();
    } catch {
      setFailure(
        "No se pudo guardar el cliente. Los datos siguen aquí; intentá nuevamente.",
      );
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };
  return (
    <section
      className="formulario-cliente"
      aria-labelledby="alta-titulo"
      data-unsaved={dirty ? "true" : "false"}
    >
      <div className="form-intro">
        <h2 id="alta-titulo">Agregar cliente</h2>
        <p className="muted">
          Completá sus datos de contacto. Todos los campos son obligatorios.
        </p>
      </div>
      <Form ref={form} noValidate onSubmit={submit} aria-busy={loading}>
        <fieldset disabled={loading}>
          <div className="form-grid">
            {campos.map((field) => (
              <Form.Group key={field.name}>
                <Form.Label htmlFor={"cliente-" + field.name}>
                  {field.label}
                </Form.Label>
                <Form.Control
                  id={"cliente-" + field.name}
                  name={field.name}
                  type={field.type}
                  autoComplete={field.autocomplete}
                  spellCheck={field.type === "email" ? false : undefined}
                  placeholder={field.example}
                  required
                  value={values[field.name]}
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={
                    errors[field.name] ? "error-" + field.name : undefined
                  }
                  onChange={(event) => {
                    setValues({ ...values, [field.name]: event.target.value });
                    if (errors[field.name])
                      setErrors({ ...errors, [field.name]: undefined });
                  }}
                />
                {errors[field.name] && (
                  <p className="field-error" id={"error-" + field.name}>
                    {errors[field.name]}
                  </p>
                )}
              </Form.Group>
            ))}
          </div>
          <div className="form-actions">
            <button
              className="button button-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Spinner size="sm" aria-hidden="true" />
              ) : (
                <Icon name="check" size={18} />
              )}
              Guardar cliente
              {loading && <span className="visually-hidden">, guardando…</span>}
            </button>
            <span className="muted form-hint">
              Los datos se guardan al confirmar.
            </span>
          </div>
        </fieldset>
      </Form>
      {Object.keys(errors).some((key) => errors[key]) && (
        <p className="field-error" role="status">
          Revisá los campos indicados.
        </p>
      )}
      {message && (
        <p className="inline-message success-message" role="status">
          <Icon name="check" />
          {message}
        </p>
      )}
      {failure && (
        <p className="inline-message error-message" role="alert">
          <Icon name="alert" />
          {failure}
        </p>
      )}
    </section>
  );
};
export default FormCliente;
