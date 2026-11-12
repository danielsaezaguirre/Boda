(() => {
  "use strict";

  const config = window.WEDDING_CONFIG;
  const byId = (id) => document.getElementById(id);
  const form = byId("admin-login-form");
  const supabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  const supabaseUrl = config.supabaseUrl.replace(/\/+$/, "");
  let adminAccessToken = null;

  const supabaseRequest = async (path, { method = "GET", body, token = config.supabaseAnonKey } = {}) => {
    const headers = {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${token}`
    };
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const response = await fetch(`${supabaseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || errorBody.msg || `HTTP ${response.status}`);
    }
    return response.status === 204 ? null : response.json();
  };

  const renderGuestList = (guests) => {
    const body = byId("guest-table-body");
    body.replaceChildren();
    const attendingCount = guests.filter((guest) => guest.attending).length;
    byId("guest-totals").textContent = `${guests.length} confirmaciones · ${attendingCount} asistirán · ${guests.length - attendingCount} no podrán asistir`;

    if (guests.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 6;
      cell.className = "guest-list-empty";
      cell.textContent = "Todavía no se han recibido confirmaciones.";
      row.append(cell);
      body.append(row);
      return;
    }

    const receivedDate = new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short" });
    guests.forEach((guest) => {
      const row = document.createElement("tr");
      [
        guest.guest_name,
        guest.attending ? "Sí, asistirá" : "No podrá asistir",
        guest.companions ?? 0,
        guest.guest_email,
        guest.notes || "—",
        receivedDate.format(new Date(guest.created_at))
      ].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });
      body.append(row);
    });
  };

  const loadGuestList = async () => {
    byId("admin-message").textContent = "Cargando confirmaciones…";
    try {
      const guests = await supabaseRequest(
        "/rest/v1/wedding_rsvps?select=id,guest_name,guest_email,attending,companions,notes,created_at&order=created_at.desc",
        { token: adminAccessToken }
      );
      renderGuestList(guests);
      form.hidden = true;
      byId("guest-list").hidden = false;
      byId("admin-message").textContent = "";
    } catch (error) {
      const denied = error.message.includes("401") || error.message.includes("403");
      byId("admin-message").textContent = denied
        ? "No se pudo acceder a la lista. Comprueba la cuenta y que esté autorizada como administradora."
        : "No se pudo cargar la lista. Comprueba la conexión e inténtalo de nuevo.";
      if (denied) {
        adminAccessToken = null;
        form.hidden = false;
        byId("guest-list").hidden = true;
      }
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!supabaseConfigured) {
      byId("admin-message").textContent = "La lista privada aún no está conectada a Supabase. Sigue los pasos de configuración del README.";
      return;
    }

    const credentials = new FormData(form);
    const email = credentials.get("email");
    const password = credentials.get("password");
    form.reset();
    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    byId("admin-message").textContent = "Verificando acceso…";
    try {
      const session = await supabaseRequest("/auth/v1/token?grant_type=password", {
        method: "POST",
        body: { email, password }
      });
      adminAccessToken = session.access_token;
      await loadGuestList();
    } catch {
      adminAccessToken = null;
      byId("admin-message").textContent = "No se pudo iniciar sesión. Comprueba el correo y la contraseña del administrador.";
    } finally {
      submitButton.disabled = false;
    }
  });

  byId("refresh-guests").addEventListener("click", loadGuestList);
  byId("admin-logout").addEventListener("click", () => {
    adminAccessToken = null;
    form.reset();
    form.hidden = false;
    byId("guest-list").hidden = true;
    byId("guest-table-body").replaceChildren();
    byId("admin-message").textContent = "Has cerrado la sesión.";
  });
})();
