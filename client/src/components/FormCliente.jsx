import '../css/formcliente.css'
import { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import clientesService from "../services/clientesService";

const FormCliente = () => {

    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [ciudad, setCiudad] = useState("");

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const campoInvalido = (valor) =>
        Boolean(error) && valor.trim() === "";

    const manejarSubmit = async (e) => {

        e.preventDefault();

        setMensaje("");
        setError("");

        if (
            nombre.trim() === "" ||
            email.trim() === "" ||
            telefono.trim() === "" ||
            ciudad.trim() === ""
        ) {

            setError("Complete todos los campos.");

            return;
        }

        const nuevoCliente = {

            email,

            username: nombre.toLowerCase().replace(/\s/g, ""),

            password: "1234",

            name: {
                firstname: nombre,
                lastname: "-"
            },

            address: {
                city: ciudad
            },

            phone: telefono
        };

        try {

            setLoading(true);

            const respuesta =
                await clientesService.crearCliente(
                    nuevoCliente
                );

            setMensaje(
                `Cliente creado correctamente. ID: ${respuesta.id}`
            );

            setNombre("");
            setEmail("");
            setTelefono("");
            setCiudad("");

        } catch {

            setError(
                "Ocurrió un error al crear el cliente."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className='formulario-cliente'>

            <h3>Nuevo Cliente</h3>

            <Form noValidate onSubmit={manejarSubmit} aria-busy={loading}>

                <Form.Group className="mb-3">

                    <Form.Label htmlFor="cliente-nombre">Nombre</Form.Label>

                    <Form.Control
                        id="cliente-nombre"
                        type="text"
                        required
                        value={nombre}
                        aria-required="true"
                        aria-invalid={campoInvalido(nombre)}
                        aria-describedby={
                            campoInvalido(nombre)
                                ? "error-formulario-cliente"
                                : undefined
                        }
                        onChange={(e) =>
                            setNombre(e.target.value)
                        }
                    />

                </Form.Group>

                <Form.Group className="mb-3">

                    <Form.Label htmlFor="cliente-email">Email</Form.Label>

                    <Form.Control
                        id="cliente-email"
                        type="email"
                        required
                        value={email}
                        aria-required="true"
                        aria-invalid={campoInvalido(email)}
                        aria-describedby={
                            campoInvalido(email)
                                ? "error-formulario-cliente"
                                : undefined
                        }
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                </Form.Group>

                <Form.Group className="mb-3">

                    <Form.Label htmlFor="cliente-telefono">Teléfono</Form.Label>

                    <Form.Control
                        id="cliente-telefono"
                        type="text"
                        required
                        value={telefono}
                        aria-required="true"
                        aria-invalid={campoInvalido(telefono)}
                        aria-describedby={
                            campoInvalido(telefono)
                                ? "error-formulario-cliente"
                                : undefined
                        }
                        onChange={(e) =>
                            setTelefono(e.target.value)
                        }
                    />

                </Form.Group>

                <Form.Group className="mb-3">

                    <Form.Label htmlFor="cliente-ciudad">Ciudad</Form.Label>

                    <Form.Control
                        id="cliente-ciudad"
                        type="text"
                        required
                        value={ciudad}
                        aria-required="true"
                        aria-invalid={campoInvalido(ciudad)}
                        aria-describedby={
                            campoInvalido(ciudad)
                                ? "error-formulario-cliente"
                                : undefined
                        }
                        onChange={(e) =>
                            setCiudad(e.target.value)
                        }
                    />

                </Form.Group>

                <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                >

                    {
                        loading
                            ? <>
                                <Spinner size="sm" aria-hidden="true" />
                                <span className="visually-hidden">
                                    Guardando cliente...
                                </span>
                              </>
                            : "Guardar Cliente"
                    }

                </Button>

            </Form>

            {
                mensaje &&
                <Alert
                    role="status"
                    aria-live="polite"
                    className="mt-3"
                    variant="success"
                >
                    {mensaje}
                </Alert>
            }

            {
                error &&
                <Alert
                    id="error-formulario-cliente"
                    role="alert"
                    aria-live="assertive"
                    className="mt-3"
                    variant="danger"
                >
                    {error}
                </Alert>
            }

        </div>

    );
};

export default FormCliente;
