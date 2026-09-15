**Frontend de "Tus mascotas" en React**

**Puerto**: 5173
**Lenguaje principal**: Typescript
**Plantilla base desarrollada por Docente Claudio Rojas***

El frontend presenta el apartado visual para los tres tipos de usuarios del sistema:
- 'Owner' (Los dueños de las mascotas registradas)
- 'Vet' (Veterinarios y cuidadores encargados de cuidar las mascotas)
- 'Admin' (Encargado/a de la gestión general del sistema)

El sistema de roles se implementa para restringir acceso a ciertas funcionalidades, buscando
seguir los principios de RBAC.

La extracción de datos del backend se hace mediante el servicio de API Gateway de AWS, donde cada 
una de las rutas vinculadas a un aspecto del CRUD (estas son aquellas que nos permiten registrar, leer, 
modificar y eliminar) esta protegida por un **Authorizer** de tipo JWT, el cual demanda la presencia de un JWT para 
poder acceder a los recursos protegidos por la API. 

Para obtener este acceso se ocupa la librería "oidc-client-ts" y "react-oidc-context", las cuales nos permiten 
dirigir a los usuarios al portal legítimo de AWS gestionado por Cognito, una vez sean ingresadas las credenciales
correctas (email y contraseña para nuestro caso) podremos contar con un JWT para realizar nuestros pedidos a 
nuestra API.

**Elección de tecnologías**
Nuestra elección por React como framework de desarrollo obedece primeramente a un pedido del cliente, quien específicamente nos pidió el uso de esa herramienta. La otra ventaja es la familiaridad, ya que hemos ocupado a través de nuestra formación académica múltiples veces la herramienta. Un detalle que no podemos obviar es Typescript, tecnología que también fue pedida para el desarrollo por ofrecer una capa extra de seguridad encíma del proyecto base como también un ambientem más fluido de dearrollo

**Funcionalidades por ROLES**
Admin --> El Administrador del sistema puede ver mediante un listado la totalidad de mascotas registradas en el sistema, como también agregar a su gusto nuevos ingresos. Sí bien no implementado aún, este rol considera el uso del CRUD en su totalidad como también herramientas para evaluar el estado actual del sistema en tiempo real.
Vet --> Los veterinarios pueden ver la totalidad de los animales bajo su cuidado, pudiendo añadir y modificar sus animales que tiene
asociados (pero no eliminar).
Owner --> El dueño goza de la información de su mascota y de su propia persona.







