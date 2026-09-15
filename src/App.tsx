import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";

interface FormularioMascotaProps {
  token: string;
  apiGatewayUrl: string;
  onSuccess?: () => void;
}

export const FormularioMascota = ({
  token,
  apiGatewayUrl,
  onSuccess,
}: FormularioMascotaProps) => {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [especie, setEspecie] = useState("");
  const [vacunado, setVacunado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !especie.trim() || !edad.trim()) {
      alert("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);

    const nuevaMascota = {
      nombre: nombre.trim(),
      edad: parseInt(edad, 10),
      especie: especie.trim(),
      vacunado: vacunado,
    };

    try {
      const response = await fetch(`${apiGatewayUrl}/api/mascotas/registrar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevaMascota),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      alert("Mascota registrada correctamente.");
      setNombre("");
      setEdad("");
      setEspecie("");
      setVacunado(false);

      if (onSuccess) onSuccess();
    } catch (error: any) {
      alert(error.message || "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.card}>
      <h3>Registrar Nueva Mascota</h3>

      <div style={stilos.field}>
        <label style={styles.label}>Nombre de la mascota:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Pedro Juan"
          style={styles.input}
        />
      </div>

      <div style={stilos.field}>
        <label style={styles.label}>Especie:</label>
        <input
          type="text"
          value={especie}
          onChange={(e) => setEspecie(e.target.value)}
          placeholder="Ej. Mapache, Perro"
          style={styles.input}
        />
      </div>

      <div style={stilos.field}>
        <label style={styles.label}>Edad:</label>
        <input
          type="number"
          value={edad}
          onChange={(e) => setEdad(e.target.value)}
          placeholder="Ej. 4"
          style={styles.input}
        />
      </div>

      <div style={stilos.checkboxField}>
        <label style={{ cursor: "pointer", display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={vacunado}
            onChange={(e) => setVacunado(e.target.checked)}
          />
          ¿Está vacunado?
        </label>
      </div>

      <button type="submit" disabled={loading} style={stilos.button}>
        {loading ? "Guardando..." : "Guardar Mascota"}
      </button>
    </form>
  );
};

const stilos = {
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #f0f0f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
    marginTop: "15px",
  },
  field: {
    marginBottom: "12px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "bold" as const,
    color: "#333",
  },
  checkboxField: {
    margin: "15px 0",
  },
  input: {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    backgroundColor: "#1677ff",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold" as const,
    width: "100%",
  },
};

function App() {
  const apiGatewayUrl ="https://0gg74y6yth.execute-api.us-east-1.amazonaws.com";
  const auth = useAuth();
  const [apiResponse, setApiResponse] = useState<string>("");
  const [loadingApi, setLoadingApi] = useState<boolean>(false);
  const [mascotas, setMascotas]= useState<any[]>([]);
  //const [mascota, setMascota]= useState<{}>();


  const getMascotas= async(token: any)=> {
    setMascotas([]);
    try {

      const response= await fetch(`${apiGatewayUrl}/api/mascotas/listar`, {
        method : "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Mascotas");
      console.log(data);
      setMascotas(data);
    } catch (error : any) {
      console.log("Error");
      console.log(error);
    } 
  }

  useEffect(()=> {
    if (auth.isAuthenticated && auth.user?.id_token) {
      getMascotas(auth.user?.id_token);
    }
  }, [auth.isAuthenticated, auth.user?.id_token])

  // 1. Estados de carga y error del flujo de Cognito
  if (auth.isLoading) {
    return (
      <div style={styles.centerContainer}>
        <h3>Cargando sesión de usuario...</h3>
      </div>
    );
  }

  // Validación correcta para TypeScript usando la propiedad nativa 'error'
  if (auth.error) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.loginCard}>
          <h3 style={{ color: "#ff4d4f" }}>Error al autenticar</h3>
          <p style={{ color: "#666" }}>{auth.error.message}</p>
          <button
            onClick={() => auth.signinRedirect()}
            style={styles.loginButton}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // 2. Vista si el usuario ya inició sesión de manera exitosa
  if (auth.isAuthenticated) {
    // Extraer de forma segura la lista de grupos (roles) inyectados por Cognito
    const roles = (auth.user?.profile["cognito:groups"] as string[]) || [];
    const email = auth.user?.profile.email;

    // Función para consumir tus controladores de Spring Boot pasando por API Gateway
    const consultarBackend = async (
      endpoint: string,
      metodo: string = "GET",
    ) => {
      setLoadingApi(true);
      setApiResponse("");

      try {
        // Extraemos el id_token que exige el Authorizer de Cognito en API Gateway
        const token = auth.user?.id_token;

        if (!token) {
          setApiResponse("Error: No hay un token de sesión activo.");
          setLoadingApi(false);
          return;
        }

        // Reemplaza esta URL con la URL pública exacta de tu API Gateway

        const response = await fetch(`${apiGatewayUrl}${endpoint}`, {
          method: metodo,
          headers: {
            // El API Gateway validará este header contra su Authorizer de Cognito
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("Data");
        console.log(data);
        // Mostramos el resultado formateado en la caja de respuesta
        setApiResponse(JSON.stringify(data, null, 2));
      } catch (error: any) {
        setApiResponse(`Error de red o conexión: ${error.message}`);
      } finally {
        setLoadingApi(false);
      }
    };

    const tieneAlgunRol = (rolesRequeridos: string[]) => {
      return rolesRequeridos.some((rol) => roles.includes(rol));
    };

    return (
      <div style={styles.dashboardContainer}>
        <header style={styles.header}>
          <h2 style={styles.titulo_app}>Tus Mascotas</h2>
          <button onClick={() => auth.removeUser()} style={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </header>

        <main style={styles.main}>
          <section style={styles.card}>
            <h3>Perfil del Usuario</h3>
            <p>
              📧 <strong>Email:</strong> {email}
            </p>
            <p>
              🔑 <strong>Roles Asignados:</strong>{" "}
              {roles.length > 0 ? (
                roles.map((r) => (
                  <span key={r} style={styles.badge}>
                    {r}
                  </span>
                ))
              ) : (
                <span style={styles.noneBadge}>Ninguno</span>
              )}
            </p>
          </section>

          {/* VISTAS CONDICIONALES EN FRONTEND SEGÚN EL ROL */}
          {roles.includes("Admin") && (
            <section style={{ ...styles.card, borderColor: "#ff4d4f" }}>
              <h4 style={{ color: "#ff4d4f", margin: 0 }}>
                ⚙️ Panel de Control - Exclusivo Admin
              </h4>
              <p style={{ fontSize: "14px", color: "#666" }}>
                Esta sección solo la puedes renderizar tú porque perteneces al
                grupo Admin en AWS.
              </p>
            </section>
          )}


          {roles.includes('Admin') && (
          <section style={styles.card}>
            <h3>
              Interactuar con Backend (Spring Boot a través de API Gateway)
            </h3>
            <p style={{ fontSize: "14px", color: "#555" }}>
              Prueba los endpoints protegidos con tu anotación{" "}
              <code>@SecuredRoles</code>:
            </p>

            <div style={styles.buttonGroup}>
              <button
                onClick={() => consultarBackend("/health", "GET")}
                style={styles.apiButton}
              >
                Ver Estado del Backend (Cualquier Rol)
              </button>

              <button
                onClick={() => consultarBackend("/api/mascotas/listar", "GET")}
                style={styles.apiButton}
              >
                Contador (Admin/Colaborador)
              </button>

              <button
                onClick={() => consultarBackend("/api/productos/1", "DELETE")}
                style={{ ...styles.apiButton, backgroundColor: "#d9383a" }}
              >
                Eliminar Producto (Solo Admin)
              </button>
            </div>

            <div style={styles.responseBox}>
              <strong>Respuesta del Servidor:</strong>
              <pre>
                {loadingApi
                  ? "Consultando pasarela de AWS..."
                  : apiResponse || "Ninguna petición enviada aún."}
              </pre>
            </div>
          </section>
          )}

          {tieneAlgunRol(["Admin", "Vet"]) && (
            <div>
              <h3>Mascotas registradas</h3>
              <ul>
                {mascotas.map((m) => (
                  <li key={m.id}>
                    <strong>{m.nombre}</strong> - {m.especie} ({m.edad} años) 
                    {m.vacunado ? " ✅ Vacunado" : " ❌ Sin vacunar"}
                  </li>
                ))}
              </ul>
            </div>
  
          )}

          {roles.includes("Admin") && 
             (
              <FormularioMascota
                token={auth.user?.id_token || ""}
                apiGatewayUrl={apiGatewayUrl}
                onSuccess={() => getMascotas(auth.user?.id_token)}
              />
            )
        }

        </main>
      </div>
    );
  }

  // 3. Vista inicial si el usuario no está logueado
  return (
    <div style={styles.centerContainer}>
      <div style={styles.loginCard}>
        <h2>🔐 Inicio de Sesión</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Ingresa a la SPA utilizando el Directorio de Usuarios de AWS Cognito.
        </p>
        <button
          onClick={() => auth.signinRedirect()}
          style={styles.loginButton}
        >
          Ingresar con Cognito (Hosted UI)
        </button>
      </div>
    </div>
  );
}

// 🎨 Estilos básicos en línea para mantener el archivo autocontenido y limpio
const styles = {
  centerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f2f5",
    fontFamily: "Times New Roman",
  },
  loginCard: {
    padding: "40px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center" as const,
    maxWidth: "400px",
  },
  loginButton: {
    backgroundColor: "#1677ff",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    fontSize: "16px",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
    fontWeight: "bold" as const,
  },
  dashboardContainer: {
    fontFamily: "sans-serif",
    backgroundColor: "#f9fbfd",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 40px",
    backgroundColor: "#97d46b",
    color: "#fff",
  },
  logoutButton: {
    backgroundColor: "transparent",
    color: "#rgba(255,255,255,0.65)",
    border: "1px solid #434343",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  main: {
    padding: "40px",
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #f0f0f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  },
  badge: {
    backgroundColor: "#e6f4ff",
    color: "#0958d9",
    padding: "4px 10px",
    borderRadius: "4px",
    marginRight: "6px",
    fontSize: "14px",
    fontWeight: "bold" as const,
  },
  noneBadge: {
    color: "#bfbfbf",
    fontStyle: "italic",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap" as const,
    marginTop: "15px",
  },
  apiButton: {
    backgroundColor: "#52c41a",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600" as const,
  },
  responseBox: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#141414",
    color: "#a9fe14",
    borderRadius: "6px",
    overflowX: "auto" as const,
  },
  button: {
    padding: "8px 16px",
    cursor: "pointer",
  },
  titulo_app : {
    color: "#FFFF",
    fontWeight: "bold"
  },

  /*
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  */
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  /*
  button: {
    backgroundColor: "#1677ff",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  */
  buttonDisabled: {
    backgroundColor: "#91caff",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
};

export default App;
