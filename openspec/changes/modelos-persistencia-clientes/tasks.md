## 1. Preparación

- [ ] 1.1 Confirmar autorización para implementar el change revisado.
- [ ] 1.2 Confirmar acceso al entorno Atlas para pruebas con datos ficticios, sin incluir credenciales en documentación ni salidas.

## 2. Base de ejecución y configuración

- [ ] 2.1 Crear server/package.json ESM con mongodb y scripts de persistencia/pruebas; verificar compatibilidad y generar lockfile mediante npm, sin alterar client/.
- [ ] 2.2 Crear ejemplo de MONGODB_URI/MONGODB_DB_NAME sin secretos y exclusiones de entorno/node_modules en server/.
- [ ] 2.3 Implementar apertura, reutilización, acceso y cierre explícito en server/config/database.js con errores seguros.
- [ ] 2.4 Verificar configuración ausente, acceso antes de apertura, reutilización concurrente, cierre repetido y recuperación tras apertura fallida.

## 3. Modelo y operaciones

- [ ] 3.1 Implementar selección de campos comerciales, defaults y transformación de _id a id en server/models/cliente.js; excluir password y campos ajenos.
- [ ] 3.2 Implementar listado y consulta por id con arreglo/null y error distinguible para identificadores inválidos.
- [ ] 3.3 Implementar creación con identificador generado y eliminación con resultado booleano; propagar fallos sin falsos éxitos.
- [ ] 3.4 Verificar transformación, dirección parcial, exclusión de campos, entradas estructuralmente inválidas y contratos de ausencia/error.

## 4. Datos iniciales

- [ ] 4.1 Crear fixture pequeño de clientes ficticios, con variedad de apellidos/ciudades e identificadores reservados no duplicados.
- [ ] 4.2 Implementar carga manual que inserte solo ausentes sin borrar ni sobrescribir registros y cierre conexión al terminar.
- [ ] 4.3 Verificar primera carga, repetición, conservación de un ejemplo modificado y ausencia de carga automática al conectar.

## 5. Evidencia real y documentación

- [ ] 5.1 Implementar procedimiento de comprobación con un registro propio: alta/consulta, cierre/reapertura y consulta, baja, nueva reapertura y ausencia; limpiar únicamente su registro.
- [ ] 5.2 Ejecutar comprobaciones reales en Atlas y registrar comandos, fecha y resultados sanitizados; dejar pendiente si el acceso no está disponible.
- [ ] 5.3 Documentar instalación, variables, contratos de servicios/servidor, carga y verificaciones en server/documents/persistencia.md y enlazarlo desde server/README.md; no declarar API o frontend integrados.
- [ ] 5.4 Revisar que el alcance solo afecte persistencia y su base de ejecución; preparar declaración de IA y evidencia para el PR.

Los commits, push y PR no son automáticos: requieren validación y autorización correspondiente. Ninguna tarea marcada como pendiente representa trabajo ya realizado.
