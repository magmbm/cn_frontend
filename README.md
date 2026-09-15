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

**Flujo de trabajo**
**Login**
El frontend al desplegarse presenta un login local el cual nos redirige al portal de autenticación de
AWS, ahí podemos ingresar con cualquiera de los usuarios que hayamos creado. Este proceso  nos regresará un JWT (emitido por Amazon Cognito), el cual será necesario para posteriores peticiones al backend.

**Peticiones a la EC2 mediante API Gateway**
La EC2 en donde está alojada la aplicación backend de Spring Boot está protegida por un parametro header y un JWT (el cual ya obtuvimos en el login), en cada una de las peticiones debemos incluir ambas. Al frontend *solo* le compete enviar el token, por lo que es nuestro trabajo que se encuentre presente en cada comunicación que tengamos con el backend.

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
Admin --> El Administrador del sistema puede registrar, listar, eliminar y modificar todos los registros de mascotas en la base de datos. Este rol considera el uso del CRUD en su totalidad como también herramientas para evaluar el estado actual del sistema en tiempo real.

Vet --> Los veterinarios pueden ver toda la información de los animales bajo su cuidado ,y parcialmente la de sus dueños. Cuentan con la capacidad de listar, registrar y modificar los registros, pero no eliminarlos. 

Owner --> El dueño puede ver, modificar y eliminar *toda la información* de su mascota y de su cuenta personal.









