# UX Specification — Iteration 2 Delta (VetCare v2)

> **Delta document.** `UX_SPEC_V2.md` (v2.0) remains in force: visual direction, design tokens, components COMP-UX-001 to -022, screens SCR-UX-001 to -017, flows FLOW-UX-001 to -020 and microcopy conventions apply unchanged unless this document changes them. This document specifies only what iteration 2 adds or modifies. New IDs continue the V2 sequences: COMP-UX-023+, SCR-UX-018+, FLOW-UX-021+, P04-ASM-030+, P04-PROP-009+, MSG-* new names.
> **Classification legend:** **ASSUMPTION** (non-blocking interpretation; approved under the standing rule TD-19 unless the team objects) · **PROPOSAL** · **REQUIRES_DECISION** · **BLOCKED**.

## 1. Document Metadata and Status

| Field | Value |
|---|---|
| Stage | P04 — UX Design |
| Version | 3.0 (delta over 2.0) |
| Sprint | **`SPRINT-002`** — the single current delivery sprint. The P04 prompt names it `SPRINT-001`; for iteration 2 that identifier means `SPRINT-002` (P03 PRIOR-005, P03 validation P03V-002). |
| Delivery scope | P03 v3.1: 19 committed stories (P0 US-035, -036, -038, -040, -041; P1 US-037, -039, US-004 to -007; P2 US-022, -023, -025, -026, US-011, -012, -014, -015) and 1 conditional (US-042). Ordering (US-027 to -033) is deferred: SCR-UX-015 to -017 and COMP-UX-020 are **not rendered**. |
| Detail level | Full specification for P0 (voice search and assistant). Compact but implementable specification for P1/P2 and the conditional story, reusing V2 components. Deadline 2026-11-10 (TD-34). |
| **Status** | **READY_WITH_ASSUMPTIONS** |
| Generated | 2026-11-09 |

### 1.1 Source Artifacts

- `REQUIREMENTS_V4.md` v4.1 and `product_backlog_requirements_v4.json` v4.1; `REQUIREMENTS_VALIDATION_V4.md` (PASS_WITH_WARNINGS, 0 medium).
- `PRIORITIZATION_V3.md` v3.1 and `product_backlog_priori_v3.json` v3.1; `PRIORITIZATION_VALIDATION_V3.md` (PASS_WITH_WARNINGS).
- `UX_SPEC_V2.md` v2.0 and `UX_SPEC_VALIDATION_V2.md` (base design system).
- Current client routes and screens in `client/src/App.jsx` and `client/src/pages/` (read only, to keep the delta consistent with what was built).
- `prompts/system/SYSTEM_PROMPT.md`.

### 1.2 Status Explanation

All screens, components and flows needed by the committed stories are specified. The status is READY_WITH_ASSUMPTIONS because a few interaction details not fixed by P02 are resolved as assumptions (§10: P04-ASM-030 to -037), the voice behavior depends on browser support (P01-ASSUMPTION-027), and the iteration 2 requirements were accepted by delegation (TD-33). None blocks implementation.

---

## 2. UX Objectives for Iteration 2

| Need | UX objective | Source |
|---|---|---|
| Search without typing | One tap starts listening; the owner always sees what was heard and what was searched, and can correct it by typing. | FR-040 to FR-042; P01-NEED-013 |
| Answers in one place | A conversation screen that answers in short sentences, lists at most 5 items with links to the right screen, and never leaves the owner at a dead end. | FR-043 to FR-048; P01-NEED-014 |
| Hear the answers | Answers are read aloud by default; mute and stop are always one tap away; text is always visible. | FR-049; TD-28 |
| Voice is never required | Every voice control has a typed or visual equivalent; unsupported browsers simply do not show voice controls. | NFR-006; BR-051 |
| Finish management workflows | Reuse the existing cards and forms: pets get a tab and a form; appointment cards get *"Cancelar"* and *"Reprogramar"*; catalog cards get *"Editar"* and *"Eliminar"*. | US-004 to -007, -011, -012, -014, -015, -022, -023, -025, -026 |

**Design principles added (in addition to V2 §2.3):**

1. **Show what was heard.** Voice input is never applied invisibly: the transcription is displayed (*"Escuché: «…»"*) next to the result it produced.
2. **Same result as typing.** Voice fills the same controls (search box, species filter) that the owner would use by hand (BR-042).
3. **Destructive actions confirm and explain consequences.** Removing a pet or a service, or cancelling an appointment, uses the confirmation dialog and says which appointments will be cancelled (BR-034).

**Accessibility additions:** the listening state is announced to screen readers; spoken answers do not replace the text (`aria-live="polite"` on the conversation); voice output is stopped when the owner leaves the screen; all new controls meet `size-control-height`.

---

## 3. Visual Direction

Unchanged (V2 §3). Iteration 2 introduces **no new colors, fonts or tokens**. Voice states use existing tokens: listening = `color-primary` filled button; error and permission messages = COMP-UX-012 variants.

## 4. Design Tokens

Unchanged (V2 §4). No token is added. Implementations must not introduce raw values for the new components (V2 §4 token rule 1).

---

## 5. Shared Components — Additions and Changes

### COMP-UX-023 — Voice Input Button

| Aspect | Specification |
|---|---|
| Purpose | Start and stop listening to the owner's voice. |
| Used in | COMP-UX-006 (search bar, SCR-UX-004) and COMP-UX-025 (assistant composer, SCR-UX-018). One shared component (P03 DEP-025). |
| Anatomy | Square icon button of `size-control-height`, microphone icon (`size-icon`), `radius-md`. Visible tooltip/label on desktop: *"Hablar"*. |
| States | **idle**: secondary style (`color-bg-surface`, border `color-border-input`, icon `color-primary`); **listening**: filled `color-primary`, icon `color-on-primary` changes to a stop square, label *"Escuchando… toca para detener"* shown next to the button (`font-size-sm`, `color-primary`); **processing**: inline spinner (COMP-UX-015) for the short time between end of speech and result; **disabled**: while a search or an answer is loading. |
| Not rendered | When the browser does not support voice input (NFR-006, AC-122, EDGE-033). No message is shown in that case. |
| Behavior | Tap → the browser may ask for microphone permission the first time → listening. Listening ends when the owner stops speaking, taps the button again, or leaves the screen. Only one listening session at a time. Permission denied → the screen shows MSG-VOICE-DENIED (AC-123, EDGE-034); the button stays visible so the owner can retry after allowing it. Nothing recognized → MSG-VOICE-NOHEAR (AC-121, EDGE-035). |
| Accessibility | `<button>` with `aria-label` *"Buscar por voz"* (search) or *"Preguntar por voz"* (assistant) and `aria-pressed` true while listening; the state change is announced politely (*"Escuchando"*, *"Listo"*). Focus stays on the button. |
| Tokens | `size-control-height`, `size-icon`, `radius-md`, `color-bg-surface`, `color-border-input`, `color-primary`, `color-on-primary`, `font-size-sm`, `spacing-2`, `motion-duration-fast` |
| Related | FR-040, FR-042, FR-043; NFR-006; AC-115, AC-116, AC-121 to AC-124, AC-126 |

### COMP-UX-006 — Search Bar (modified)

Adds COMP-UX-023 between the text field and the *"Buscar"* button (at all widths). Everything else in V2 is unchanged. When a voice search fills the field, the field shows the text actually searched (§8 SCR-UX-004).

### COMP-UX-024 — Chat Message

| Aspect | Specification |
|---|---|
| Purpose | One turn of the assistant conversation. |
| Used in | SCR-UX-018. |
| Variants | **Owner message**: right-aligned bubble, max 85 % of the width, `color-primary-subtle` background, `color-text-primary`. If it came from voice, a small line under the text *"Por voz"* (`font-size-sm`, `color-text-secondary`). **Assistant message**: left-aligned, `color-bg-surface`, border `color-border-subtle`, `radius-lg`, padding `spacing-4`; contains the answer sentence, an optional **item list** and optional **links**. |
| Item list | Up to 5 rows (BR-047), each a link to its screen (FR-048): provider rows → SCR-UX-005; offering rows → SCR-UX-005 of its provider; appointment rows → SCR-UX-007. Row format per §8 SCR-UX-018 answer templates. Separated by `border-width-default` `color-border-subtle`. |
| Links | *"Ver todos en Buscar"* (offerings with more than 5 results; opens SCR-UX-004 with the text and species applied, AC-139), *"Ir a Buscar"*, *"Ir a Mis citas"* (action refusals and fallback). Tertiary link style. |
| Reading state | While its text is being read aloud, the assistant message shows a speaker icon and *"Leyendo…"* (`font-size-sm`, `color-primary`). |
| Accessibility | The conversation is an `aria-live="polite"` log; each message has a visually hidden prefix (*"Tú:"*, *"Asistente:"*). Links have descriptive text (the item name). |
| Tokens | `color-primary-subtle`, `color-bg-surface`, `color-border-subtle`, `color-text-primary`, `color-text-secondary`, `color-primary`, `radius-lg`, `spacing-2`, `spacing-3`, `spacing-4`, `font-size-sm` |
| Related | FR-043, FR-047, FR-048; AC-125, AC-126, AC-130, AC-136, AC-139, AC-141 |

### COMP-UX-025 — Assistant Composer

| Aspect | Specification |
|---|---|
| Purpose | Type or say a question. |
| Used in | SCR-UX-018, fixed at the bottom of the conversation area (above the mobile bottom tab bar). |
| Anatomy | COMP-UX-002 text field (placeholder *"Escribe tu pregunta"*, hidden label *"Pregunta para el asistente"*), COMP-UX-023 (if supported), COMP-UX-001 primary button *"Enviar"*. Background `color-bg-surface`, top border `color-border-subtle`, padding `spacing-3`. |
| Behavior | Enter or *"Enviar"* sends; the field empties after sending. *"Enviar"* is disabled when the field is empty or only spaces. A voice question is sent automatically when listening ends with recognized text (AC-126). While an answer is loading, the send button and the microphone are disabled (loading state). Maximum 200 characters (P04-ASM-031). |
| Tokens | As COMP-UX-002, COMP-UX-001, COMP-UX-023; `color-bg-surface`, `color-border-subtle`, `spacing-3` |
| Related | FR-043; AC-124 to AC-126 |

### COMP-UX-026 — Voice Reply Controls

| Aspect | Specification |
|---|---|
| Purpose | Mute/unmute spoken answers and stop the current reading. |
| Used in | SCR-UX-018 page header, right side. |
| Anatomy | (1) Toggle button with speaker icon and text *"Voz activada"* / *"Voz desactivada"* (`aria-pressed`). (2) Secondary button *"Detener lectura"*, visible only while an answer is being read. |
| Behavior | Default **on** the first time (AC-152). The choice is remembered on the device and browser (FR-049, BR-049). Turning voice off while reading stops the reading. *"Detener lectura"* stops only the current reading; the text stays (AC-150). Sending a new question stops any reading (AC-153). Leaving SCR-UX-018 stops any reading. |
| Not rendered | When the browser does not support voice output: no toggle, no stop button (AC-154, EDGE-043). |
| Accessibility | Toggle with `aria-pressed`; both buttons reachable by keyboard before the conversation. |
| Tokens | As COMP-UX-001 secondary / tertiary; `size-icon`, `spacing-2` |
| Related | FR-049; AC-149 to AC-154 |

### COMP-UX-027 — Listen Button (conditional, US-042)

Tertiary button with speaker icon, label *"Escuchar"*; while reading, label *"Detener"*. Not rendered without voice output support (AC-158). Leaving the screen stops the reading (AC-157). Used on SCR-UX-005 (page header) and on each COMP-UX-008 owner card (footer). Tokens as COMP-UX-001 tertiary. Related FR-050; AC-155 to AC-158.

### COMP-UX-008 — Appointment Card (modified)

The reserved footer (V2) is now rendered for **upcoming scheduled** appointments only (not cancelled, not started — EDGE-010):

- Owner variant (SCR-UX-007): *"Reprogramar"* (secondary) → SCR-UX-021; *"Cancelar cita"* (tertiary, `color-error` text) → COMP-UX-022 (US-022, US-023).
- Provider variant (SCR-UX-008): the same two actions (US-025, US-026).
- Cancelled or past appointments: no actions.
- Conditional: owner cards add COMP-UX-027 *"Escuchar"* (US-042).

### COMP-UX-007 — Offering Card, catalog variant (modified)

The reserved action area (V2) renders *"Editar"* (secondary) → SCR-UX-012/-013 in edit mode, and *"Eliminar"* (tertiary, `color-error` text) → COMP-UX-022 (US-011, US-012, US-014, US-015). The product availability switch stays **not rendered** (ordering deferred).

### COMP-UX-022 — Confirmation Dialog (extended)

V2 limited it to order cancellation. It is now the single confirmation pattern for these destructive actions (texts in §8). Anatomy, behavior and accessibility are unchanged; the primary button keeps the action verb, the secondary is always *"No, volver"*.

| Use | Title | Text | Primary |
|---|---|---|---|
| Remove pet (US-007) | *"¿Eliminar a [nombre]?"* | *"Se eliminará de tus mascotas. Si tiene citas próximas, se cancelarán."* (BR-034, AC-079) | *"Sí, eliminar"* |
| Cancel appointment, owner (US-022) | *"¿Cancelar esta cita?"* | *"[servicio] · [fecha y hora]. La cita quedará cancelada y no se podrá reactivar."* | *"Sí, cancelar cita"* |
| Cancel appointment, provider (US-025) | same title | same text, plus *"El dueño la verá como cancelada."* | *"Sí, cancelar cita"* |
| Remove service (US-012) | *"¿Eliminar este servicio?"* | *"Dejará de aparecer en las búsquedas. Sus citas próximas se cancelarán."* (BR-034, AC-083) | *"Sí, eliminar"* |
| Remove product (US-015) | *"¿Eliminar este producto?"* | *"Dejará de aparecer en las búsquedas."* | *"Sí, eliminar"* |

### COMP-UX-011 — App Shell and Navigation (modified)

**Pet owner tabs:** *"Buscar"* (SCR-UX-004) · *"Asistente"* (SCR-UX-018) · *"Mis citas"* (SCR-UX-007) · *"Mis mascotas"* (SCR-UX-019). *"Mis pedidos"* is not rendered (ordering deferred). Four tabs fit the mobile bottom bar with the existing tokens. If US-004 to -007 are cut (P03 PRIOR-008 does not cut P1, but if it happens), *"Mis mascotas"* is not rendered. **Provider tabs:** unchanged (*"Pedidos"* not rendered). Icons: chat bubble for *"Asistente"*, paw for *"Mis mascotas"*.

---

## 6. Information Architecture and Navigation (delta)

### 6.1 Access boundaries

| Area | Who | New screens |
|---|---|---|
| Pet owner interface | Signed-in pet owner | SCR-UX-018 Asistente, SCR-UX-019 Mis mascotas, SCR-UX-020 Mascota (form), SCR-UX-021 Reprogramar cita (owner mode) |
| Provider interface | Signed-in provider | SCR-UX-021 Reprogramar cita (provider mode); SCR-UX-012/-013 in edit mode |

Providers never see the assistant or voice search (BR-041, AC-128); opening an owner-only address as a provider shows SCR-UX-014 (existing rule 3). Owners can reschedule or edit only their own data (NFR-002).

### 6.2 Navigation diagram (delta)

```text
[Pet owner interface]  tabs: Buscar | Asistente | Mis citas | Mis mascotas
SCR-UX-004 Buscar ── mic (COMP-UX-023) ── same screen with voice-filled text and filter
SCR-UX-018 Asistente ── item links ──► SCR-UX-005 / SCR-UX-007 ; "Ver todos en Buscar" ──► SCR-UX-004 (text + species applied)
SCR-UX-019 Mis mascotas ─┬─ "Agregar mascota" ──► SCR-UX-020 (add) ──(guardar / volver)──► SCR-UX-019
                         ├─ "Editar" on a pet ──► SCR-UX-020 (edit) ──(guardar / volver)──► SCR-UX-019
                         └─ "Eliminar" on a pet ──► COMP-UX-022 ──► SCR-UX-019
SCR-UX-007 Mis citas ─┬─ "Reprogramar" ──► SCR-UX-021 ──(éxito / volver)──► SCR-UX-007
                      └─ "Cancelar cita" ──► COMP-UX-022 ──► SCR-UX-007

[Provider interface]  tabs unchanged (Citas | Catálogo | Horario | Perfil)
SCR-UX-008 Citas ─┬─ "Reprogramar" ──► SCR-UX-021 ──(éxito / volver)──► SCR-UX-008
                  └─ "Cancelar cita" ──► COMP-UX-022 ──► SCR-UX-008
SCR-UX-011 Catálogo ─┬─ "Editar" ──► SCR-UX-012 / SCR-UX-013 (edit mode) ──(guardar / volver)──► SCR-UX-011
                     └─ "Eliminar" ──► COMP-UX-022 ──► SCR-UX-011
```

---

## 7. Screen Inventory (delta)

| Screen ID | Name | Purpose | Requirements / stories | Priority | Entry | Main actions | Destinations | Components |
|---|---|---|---|---|---|---|---|---|
| SCR-UX-004 (mod.) | *Buscar* | Adds voice search. | FR-040 to FR-042; US-035 | P0 | Unchanged; *"Ver todos en Buscar"* from SCR-UX-018 | Search by voice | Same screen | + COMP-UX-023 |
| SCR-UX-018 | *Asistente* | Ask questions by voice or text; hear answers. | FR-043 to FR-049; US-036 to US-041 | P0 (US-036, -038, -040, -041), P1 (US-037, -039) | Tab *"Asistente"* | Ask, listen, mute, stop, follow links | SCR-UX-004, -005, -007 | COMP-UX-011, -012, -019, -023, -024, -025, -026 |
| SCR-UX-019 | *Mis mascotas* | List pets; start add/edit/remove. | FR-005 to FR-008; US-004 to US-007 | P1 | Tab *"Mis mascotas"*; SCR-UX-006 no-pet alert link | Add, edit, remove | SCR-UX-020; COMP-UX-022 | COMP-UX-001, -009, -011, -012, -013, -014, -015, -017, -019, -022 |
| SCR-UX-020 | *Agregar mascota* / *Editar mascota* | Pet form. | FR-005, FR-007; US-004, US-006 | P1 | SCR-UX-019 | Save | SCR-UX-019 | COMP-UX-001, -002, -004, -011, -012, -013, -016, -019 |
| SCR-UX-021 | *Reprogramar cita* | Choose a new day and slot for an existing appointment (owner or provider). | FR-028, FR-031; US-023, US-026 | P2 | *"Reprogramar"* on COMP-UX-008 | Choose slot, confirm | SCR-UX-007 / SCR-UX-008 | COMP-UX-001, -010, -011, -012, -013, -015, -017, -019 |
| SCR-UX-007 / -008 (mod.) | *Mis citas* / *Citas* | Add cancel and reschedule. | FR-027, FR-030; US-022, US-025 | P2 | Unchanged | Cancel, reschedule | SCR-UX-021; COMP-UX-022 | + COMP-UX-022 |
| SCR-UX-011 (mod.) | *Catálogo* | Add edit and remove. | FR-013, FR-016; US-012, US-015 | P2 | Unchanged | Edit, remove | SCR-UX-012/-013; COMP-UX-022 | + COMP-UX-022 |
| SCR-UX-012 / -013 (mod.) | *Editar servicio* / *Editar producto* | Same forms in edit mode. | FR-012, FR-015; US-011, US-014 | P2 | *"Editar"* on SCR-UX-011 | Save changes | SCR-UX-011 | Unchanged |
| SCR-UX-005 (mod.) | *Perfil del proveedor* | Adds *"Escuchar"*. | FR-050; US-042 | Conditional | Unchanged | Listen | — | + COMP-UX-027 |

---

## 8. Screen-Level Specifications

### SCR-UX-004 — *Buscar* (modified: voice search) — P0

**Acceptance criteria:** AC-115 to AC-123, AC-159. **Rules:** BR-041 to BR-044, BR-050, BR-051, BR-053; EDGE-033 to EDGE-038, EDGE-047.

**A. Layout changes.** COMP-UX-006 now contains COMP-UX-023. Directly below the search bar and above the species filter, a **heard line** appears after a voice search: *"Escuché: «[transcripción]»"* (`font-size-sm`, `color-text-secondary`, italic quotes), with a tertiary link *"Ocultar"*. Voice alerts (COMP-UX-012) appear in the same place.

**B. Voice search sequence (FLOW-UX-021).**

1. The owner taps COMP-UX-023 → listening state (AC-116).
2. When listening ends with recognized text, the client interprets the phrase (BR-043, BR-044): species word → species filter set to *"Perro"* / *"Gato"* (or *"Todas"* if both are named, EDGE-037); filler and species words removed.
3. The search box is filled with the interpreted text, the species filter shows the interpreted species, the heard line shows the transcription, and the search runs (AC-115, AC-117).
4. If the search returns no results and species words were removed, it runs once more with the species words kept (BR-053). The search box then shows that longer text (AC-159). Only the final result is shown; no intermediate "no results" state appears.
5. The results area behaves exactly as a typed search (V2 SCR-UX-004 states).
6. The owner can edit the text or the filter and search again as usual (AC-118).

**C. Voice messages (COMP-UX-012, placed below the search bar):**

| Situation | Variant | Text |
|---|---|---|
| Nothing remains after cleaning (AC-120, EDGE-036) | info | MSG-VOICE-EMPTY |
| Nothing recognized (AC-121, EDGE-035) | info | MSG-VOICE-NOHEAR |
| Permission denied (AC-123, EDGE-034) | warning | MSG-VOICE-DENIED |
| Voice error from the browser (other) | info | MSG-VOICE-NOHEAR |

In these cases no search runs and the previous results (if any) stay. The alert disappears on the next search.

**D. States.** In addition to V2: **listening** (COMP-UX-023 listening; the *"Buscar"* button stays enabled so the owner can type instead); **unsupported** (no microphone; screen identical to V2, AC-122).

**E. Visual consistency.** `spacing-2` between the heard line and the search bar; the heard line uses no new tokens. On mobile, the field shrinks; microphone and *"Buscar"* keep `size-control-height`.

### SCR-UX-018 — *Asistente* (new) — P0/P1

**Acceptance criteria:** AC-124 to AC-154 (except US-042). **Rules:** BR-041, BR-045 to BR-052, BR-054; EDGE-033, -034, -039 to -046.

**A. Structure and layout**

1. Owner shell, tab *"Asistente"* active.
2. COMP-UX-019 title *"Asistente"*, subtitle *"Pregúntame por veterinarias, servicios, precios, horarios o tus citas."*; COMP-UX-026 at the right of the header (below the title on mobile).
3. Conversation area (COMP-UX-024 list), scrollable, `size-content-max`; newest message at the bottom; auto-scroll to the newest message.
4. COMP-UX-025 composer fixed at the bottom of the content area.

**B. Content — greeting and answer templates.** The conversation starts with the greeting (AC-148). Every answer is one or two short sentences plus an optional item list (max 5, BR-047) with the order of BR-047 (providers by name; offerings by price then name; appointments nearest first). **The spoken text is the same as the displayed sentence and the list rows, read in order; link labels are not read.** Prices are displayed as *"$ 45.000"* and spoken as *"45.000 pesos"* (P04-ASM-032). Dates and times follow V2 conventions (Bogotá time).

| ID | When | Displayed answer (Spanish UI) | Item rows / links |
|---|---|---|---|
| MSG-AST-GREETING | First open in the visit (AC-148) | *"Hola, soy el asistente de VetCare. Puedes preguntarme, por ejemplo: «¿Qué veterinarias hay?», «¿Quién ofrece vacunación para gatos?», «¿Cuánto cuesta una consulta?», «¿Cuál es el horario de [veterinaria]?» o «¿Cuándo es mi próxima cita?»."* | — |
| INT-01 all | Providers list (AC-130) | *"Hay [n] veterinarias y veterinarios en VetCare. Te muestro [k]:"* | *"[nombre] — Clínica"* / *"— Veterinario independiente"* → SCR-UX-005 |
| INT-01 type | Only clinics / only independents (AC-131) | *"Hay [n] clínicas…"* / *"Hay [n] veterinarios independientes…"* | same rows |
| INT-01 home | *"a domicilio"* (AC-160, BR-054) | *"Hay [n] proveedores con servicios a domicilio. Te muestro [k]:"* | same rows |
| INT-04 hours | Hours of a named provider (AC-132) | *"[nombre] atiende: [día] de [hora] a [hora]; [día] de [hora] a [hora]."* (working days only, Monday first) | row → SCR-UX-005 |
| INT-04 no hours | EDGE-045 | *"[nombre] aún no ha definido su horario de atención."* | row → SCR-UX-005 |
| INT-04 contact | Address/contact (AC-133) | *"[nombre]: dirección [dirección]; teléfono [teléfono]; correo [correo]."* (address omitted if none) | row → SCR-UX-005 |
| INT-02/03 | Who offers / price (AC-136 to AC-138) | *"Encontré [n] resultados para «[texto]»[ para perros / para gatos]. Te muestro [k]:"* | *"[oferta] — $ [precio] — [proveedor]"* → SCR-UX-005; if n > 5: *"Ver todos en Buscar"* (AC-139) |
| INT-05 | Next appointments (AC-141) | One: *"Tu próxima cita es el [fecha] a las [hora]: [servicio] con [proveedor] para [mascota]."* Several: *"Tienes [n] citas próximas:"* | *"[fecha] [hora] — [servicio] — [mascota]"* → SCR-UX-007 |
| INT-05 none | AC-142, EDGE-041 | *"No tienes citas próximas."* | *"Ir a Buscar"* |
| Several matches | AC-134, EDGE-042 | *"Encontré varias veterinarias con ese nombre. ¿Cuál de estas?"* | provider rows |
| No match | AC-135, AC-140, EDGE-040 | *"No encontré [esa veterinaria / servicios ni productos para «[texto]»]."* | *"Ir a Buscar"* |
| Help | AC-145 | *"Puedo responderte sobre: veterinarias disponibles, quién ofrece un servicio o producto, precios, horarios y contacto de una veterinaria, y tus próximas citas. Prueba: «¿Qué veterinarias a domicilio hay?»."* | — |
| Fallback | AC-146, EDGE-039 | *"No entendí tu pregunta. Prueba con: «¿Qué veterinarias hay?» o «¿Cuánto cuesta un baño para perro?». También puedes usar Buscar."* | *"Ir a Buscar"* |
| Action request | AC-129, EDGE-046 | *"Solo puedo darte información. Para [agendar una cita, ve a Buscar / cancelar o reprogramar, ve a Mis citas]."* | *"Ir a Buscar"* / *"Ir a Mis citas"* |
| Medical advice | AC-147, EDGE-046 | *"No puedo dar consejos médicos. Para eso, agenda una consulta con un veterinario."* | *"Ir a Buscar"* |

The exact matching of questions to these answers is defined by P02 (BR-042 to BR-054) and designed in P05; this table fixes only what the owner sees and hears.

**C. Actions and interactions**

- Send a typed question (AC-125) or a voice question (AC-126; the owner message is marked *"Por voz"*).
- Answer arrives → assistant message appended → if voice is on and supported, it is read aloud (AC-149) and COMP-UX-026 shows *"Detener lectura"*.
- Item rows and links navigate; leaving the screen stops any reading. Returning within the visit keeps the conversation (P04-ASM-033); reloading or signing out clears it (AC-127, BR-050).

**D. States**

| State | Display |
|---|---|
| Initial | Greeting message only. |
| Waiting for answer | Owner message shown; below it a COMP-UX-015 inline spinner with MSG-LOAD; composer disabled. |
| Listening | COMP-UX-023 listening state in the composer. |
| Voice not heard / denied | MSG-VOICE-NOHEAR / MSG-VOICE-DENIED as COMP-UX-012 above the composer; no message is added to the conversation. |
| Error (network) | Assistant-side COMP-UX-012 error with MSG-NET and *"Reintentar"* (resends the last question). |
| Unsupported voice | No microphone, no voice reply controls; everything else identical (AC-154, EDGE-033, EDGE-043). |

**E. Visual consistency.** Messages separated by `spacing-3`; conversation padding `spacing-4` (mobile) / `spacing-6` (desktop); composer height grows with `size-control-height` controls; no new tokens.

### SCR-UX-019 — *Mis mascotas* (new) — P1

**Acceptance criteria:** AC-016, AC-017 (US-005), AC-079 (US-007) and the US-004/US-006 criteria through SCR-UX-020.

- **Layout:** owner shell (tab *"Mis mascotas"*); COMP-UX-019 title *"Mis mascotas"* with primary action *"Agregar mascota"*; list of pet cards (card surface tokens as COMP-UX-008), 1 column, 2 from `breakpoint-lg`.
- **Pet card content:** name (h3, `font-size-lg`, `font-weight-semibold`); species badge; COMP-UX-017 rows *"Raza"*, *"Edad"* (*"[n] años"*, *"Menos de 1 año"* for 0), *"Peso"* and *"Altura"* only if present. Footer: *"Editar"* (secondary) → SCR-UX-020; *"Eliminar"* (tertiary, `color-error`) → COMP-UX-022.
- **States:** loading (section loader); **empty** (COMP-UX-014): *"Aún no tienes mascotas registradas"*, *"Necesitas al menos una mascota para agendar citas."*, action *"Agregar mascota"* (BR-004, BR-005 — removing the last pet is allowed); error (MSG-NET). After add/edit/remove: toast MSG-SAVED / *"Mascota eliminada."*
- **Entry from booking:** the existing no-pet alert in SCR-UX-006 gets a link *"Agregar mascota"* → SCR-UX-020 (P04-ASM-034).

### SCR-UX-020 — *Agregar mascota* / *Editar mascota* (new) — P1

- **Fields, validation and messages:** exactly the pet section of SCR-UX-002 (V2): name, species, breed, age required; weight and height optional; same helpers and messages (BR-037, TD-07, TD-10; AC-014, AC-015, AC-078).
- **Edit mode:** title *"Editar mascota"*, fields pre-filled. Species is editable; existing appointments keep their data (P04-ASM-035).
- **Actions:** *"Guardar"* (primary) → SCR-UX-019 with MSG-SAVED; *"Volver"* → SCR-UX-019 without changes. Error alert MSG-FORM on invalid submit (V2 pattern).

### SCR-UX-021 — *Reprogramar cita* (new) — P2

- **Layout:** COMP-UX-019 title *"Reprogramar cita"*; a summary block (COMP-UX-017): service, provider (owner mode) or owner and pet (provider mode), modality, current date and time; then COMP-UX-010 slot picker for the same service and provider; primary button *"Confirmar nuevo horario"* (disabled until a slot is chosen); *"Volver"*.
- **Rules:** the picker offers only available future slots within working hours (BR-018, EDGE-009); the current slot is not offered; modality, pet and address are not changed here (FR-028, FR-031 change only date and time).
- **Feedback:** success → back to SCR-UX-007 / SCR-UX-008 with toast *"Cita reprogramada."*; slot taken meanwhile → MSG-SLOT-GONE (V2); appointment no longer reschedulable (started or cancelled, EDGE-010) → error alert *"Esta cita ya no se puede reprogramar."* and a link back.

### SCR-UX-007 / SCR-UX-008 — appointments (modified) — P2

Cards gain the actions of COMP-UX-008 (modified). Cancel → COMP-UX-022 → on confirm the card switches to *"Cancelada"* in place (BR-035) and a toast *"Cita cancelada."* appears. If the appointment can no longer be cancelled (EDGE-010), the dialog closes and an error alert *"Esta cita ya no se puede cancelar."* appears.

### SCR-UX-011, SCR-UX-012, SCR-UX-013 — catalog (modified) — P2

- Catalog cards gain *"Editar"* and *"Eliminar"* (COMP-UX-007 modified).
- Edit mode of SCR-UX-012/-013: title *"Editar servicio"* / *"Editar producto"*, fields pre-filled, same fields and validation as publishing (V2), primary *"Guardar cambios"* → SCR-UX-011 with MSG-SAVED. An independent veterinarian still cannot choose in-clinic modality (BR-007). Changes do not alter appointments already booked (P04-ASM-036).
- Remove → COMP-UX-022 (texts in §5) → the card disappears; toast *"Servicio eliminado."* / *"Producto eliminado."*

### SCR-UX-005 and SCR-UX-007 — *"Escuchar"* (conditional, US-042)

COMP-UX-027 in the SCR-UX-005 header reads: *"[nombre], [Clínica / Veterinario independiente]. Dirección: [dirección]. Teléfono: [teléfono]. Ofrece [n] servicios y productos."* (P02-ASM-020). On SCR-UX-007 cards it reads: *"Cita del [fecha] a las [hora]: [servicio] con [proveedor] para [mascota], [en clínica / a domicilio]. Estado: [programada / cancelada]."*

### New messages (microcopy, V2 §3.9 conventions)

| ID | Text | Where |
|---|---|---|
| MSG-VOICE-NOHEAR | *"No te escuchamos. Intenta de nuevo o escribe tu búsqueda."* (assistant: *"…o escribe tu pregunta."*) | SCR-UX-004, SCR-UX-018 |
| MSG-VOICE-DENIED | *"No tenemos permiso para usar el micrófono. Puedes escribir, o permitir el micrófono en la configuración del navegador."* | SCR-UX-004, SCR-UX-018 |
| MSG-VOICE-EMPTY | *"Dinos qué servicio o producto necesitas, por ejemplo: «vacuna para mi gato»."* | SCR-UX-004 |
| MSG-AST-* | See SCR-UX-018 table | SCR-UX-018 |

---

## 9. User Flows

### FLOW-UX-021 — Search by voice (P0)

Owner, signed in, on SCR-UX-004, browser with voice input. 1) Tap microphone; allow permission if asked. 2) Say *"busco vacunación para mi perro"*. 3) Heard line *"Escuché: «busco vacunación para mi perro»"*; search box *"vacunación"*; filter *"Perro"*; results shown (AC-115, AC-117). 4) Optional: edit text and search again (AC-118). **Alternatives:** no species → filter unchanged (AC-119); only species/filler → MSG-VOICE-EMPTY, no search (AC-120); offering name with species word → automatic second search with the full text (AC-159). **Errors:** nothing heard → MSG-VOICE-NOHEAR (AC-121); permission denied → MSG-VOICE-DENIED, typing available (AC-123); unsupported → no microphone (AC-122). Screens: SCR-UX-004. Requirements: FR-040 to FR-042.

### FLOW-UX-022 — Ask the assistant by voice and hear the answer (P0)

1) Tab *"Asistente"* → greeting. 2) Tap microphone; ask *"¿Quién ofrece vacunación para gatos?"*. 3) Owner message *"Por voz"*; spinner. 4) Answer with up to 5 rows, read aloud; *"Detener lectura"* visible (AC-126, AC-136, AC-137, AC-149). 5) Tap a row → SCR-UX-005; reading stops. **Alternatives:** typed question (AC-125); voice off → text only (AC-151); stop reading (AC-150); new question while reading → reading stops (AC-153); more than 5 → *"Ver todos en Buscar"* (AC-139). **Errors:** not heard / denied → alert, no message added; network → MSG-NET with *"Reintentar"*. Screens: SCR-UX-018, -004, -005. Requirements: FR-043, FR-045, FR-048, FR-049.

### FLOW-UX-023 — Assistant help, fallback and limits (P0)

1) Ask *"ayuda"* → help answer (AC-145). 2) Ask something unrelated → fallback (AC-146). 3) Ask *"cancela mi cita"* → action request answer with *"Ir a Mis citas"* (AC-129). 4) Ask for medical advice → medical-advice answer (AC-147). Screens: SCR-UX-018. Requirements: FR-047; BR-045, BR-046.

### FLOW-UX-024 — Assistant: providers and my appointments (P1)

1) *"¿Qué veterinarias a domicilio hay?"* → INT-01 home (AC-160). 2) *"¿Cuál es el horario de Clínica Patitas?"* → INT-04 hours (AC-132), or several matches (AC-134), or no match (AC-135), or no hours (EDGE-045). 3) *"¿Cuándo es mi próxima cita?"* → INT-05 (AC-141) or none (AC-142). Screens: SCR-UX-018, -005, -007. Requirements: FR-044, FR-046, FR-048.

### FLOW-UX-025 — Manage pets (P1)

1) Tab *"Mis mascotas"* (AC-016). 2) *"Agregar mascota"* → SCR-UX-020 → save → list (AC-014; validation AC-015, AC-078). 3) *"Editar"* → save (US-006). 4) *"Eliminar"* → dialog → confirm → pet removed and its upcoming appointments cancelled (AC-079). Empty list → empty state with *"Agregar mascota"*. Screens: SCR-UX-019, -020; COMP-UX-022. Requirements: FR-005 to FR-008.

### FLOW-UX-026 — Cancel or reschedule an appointment, owner and provider (P2)

1) SCR-UX-007 (owner) or SCR-UX-008 (provider). 2a) *"Cancelar cita"* → dialog → confirm → card *"Cancelada"* (US-022, US-025). 2b) *"Reprogramar"* → SCR-UX-021 → choose slot → *"Confirmar nuevo horario"* → back with toast (US-023, US-026). **Errors:** started or cancelled meanwhile (EDGE-010); slot taken (MSG-SLOT-GONE). Requirements: FR-027, FR-028, FR-030, FR-031.

### FLOW-UX-027 — Edit or remove an offering (P2)

1) SCR-UX-011. 2a) *"Editar"* → SCR-UX-012/-013 edit mode → *"Guardar cambios"* → catalog with MSG-SAVED (US-011, US-014). 2b) *"Eliminar"* → dialog (service text mentions appointment cancellation) → card removed (US-012, US-015; AC-083). Requirements: FR-012, FR-013, FR-015, FR-016.

### FLOW-UX-028 — Listen to a profile or appointment (conditional)

On SCR-UX-005 or a SCR-UX-007 card, *"Escuchar"* → summary read aloud → *"Detener"* or leaving stops it (AC-155 to AC-157). Requirements: FR-050.

---

## 10. Assumptions, Proposals and Open Decisions

| ID | Type | Description | Affected | Impact | Next action |
|---|---|---|---|---|---|
| P04-ASM-030 | ASSUMPTION | The voice phrase interpretation and the retry of BR-053 happen before the results are shown; the owner sees only the final search. | SCR-UX-004 | Simpler UI; no intermediate empty state. | P05 places the logic (client or server). |
| P04-ASM-031 | ASSUMPTION | Assistant questions are limited to 200 characters (enough for any supported question). | COMP-UX-025 | Bounded input. | — |
| P04-ASM-032 | ASSUMPTION | Prices are spoken as "[n] pesos"; the spoken text otherwise equals the displayed text. | SCR-UX-018, COMP-UX-027 | Natural speech. | — |
| P04-ASM-033 | ASSUMPTION | The conversation survives navigating to another tab and back within the visit, but not a reload or sign-out (consistent with BR-050: not stored by the platform). | SCR-UX-018 | Following a link does not lose the conversation. | — |
| P04-ASM-034 | ASSUMPTION | The SCR-UX-006 no-pet alert links to *"Agregar mascota"*. | SCR-UX-006 | Recovery path for EDGE-004. | — |
| P04-ASM-035 | ASSUMPTION | Editing a pet's species is allowed; existing appointments are kept unchanged (P02 does not define a rule). | SCR-UX-020 | Avoids blocking edits. | Team may object (TD-19). |
| P04-ASM-036 | ASSUMPTION | Editing a service or product does not change appointments already booked (P02 does not define a rule). | SCR-UX-012/-013 | Same as above. | Team may object (TD-19). |
| P04-ASM-037 | ASSUMPTION | Cancel and reschedule actions appear only on scheduled appointments whose start time has not passed (EDGE-010). | COMP-UX-008 | Prevents impossible actions. | — |
| P04-PROP-009 | PROPOSAL | Quick-question chips under the greeting (*"¿Qué veterinarias hay?"*, *"¿Cuándo es mi próxima cita?"*) that send the question on tap. Not required by P02; useful for the demonstration. | SCR-UX-018 | +small effort. | Implement only if P0 is done. |

No item is REQUIRES_DECISION or BLOCKED.

---

## 11. UX Coverage and Traceability Matrix (iteration 2)

| Requirement / story | Scope | Screens | Flows | Components | Coverage |
|---|---|---|---|---|---|
| FR-040, FR-041, FR-042 / US-035 | P0 | SCR-UX-004 | FLOW-UX-021 | COMP-UX-006, -023, -012 | COVERED |
| FR-043 / US-036 | P0 | SCR-UX-018 | FLOW-UX-022, -023 | COMP-UX-023, -024, -025 | COVERED |
| FR-045, FR-048 / US-038 | P0 | SCR-UX-018 | FLOW-UX-022 | COMP-UX-024 | COVERED |
| FR-047 / US-040 | P0 | SCR-UX-018 | FLOW-UX-023 | COMP-UX-024 | COVERED |
| FR-049 / US-041 | P0 | SCR-UX-018 | FLOW-UX-022 | COMP-UX-026 | COVERED |
| FR-044, FR-048 / US-037 | P1 | SCR-UX-018 | FLOW-UX-024 | COMP-UX-024 | COVERED |
| FR-046 / US-039 | P1 | SCR-UX-018 | FLOW-UX-024 | COMP-UX-024 | COVERED |
| FR-005, FR-006, FR-007, FR-008 / US-004 to US-007 | P1 | SCR-UX-019, -020 | FLOW-UX-025 | COMP-UX-022 | COVERED |
| FR-027, FR-028, FR-030, FR-031 / US-022, -023, -025, -026 | P2 | SCR-UX-007, -008, -021 | FLOW-UX-026 | COMP-UX-008, -010, -022 | COVERED |
| FR-012, FR-013, FR-015, FR-016 / US-011, -012, -014, -015 | P2 | SCR-UX-011, -012, -013 | FLOW-UX-027 | COMP-UX-007, -022 | COVERED |
| FR-050 / US-042 | Conditional | SCR-UX-005, -007 | FLOW-UX-028 | COMP-UX-027 | COVERED |
| NFR-006 | All voice | SCR-UX-004, -018 | FLOW-UX-021, -022 | COMP-UX-023, -026 | COVERED (unsupported, denied and typed paths specified) |
| NFR-007 | Voice | SCR-UX-018 | — | — | NOT_UX_RELEVANT for storage (no UI); the visible behavior (conversation cleared on reload) is COVERED |
| NFR-008 | Voice | SCR-UX-004, -018 | — | — | COVERED (Spanish texts; language of recognition and speech is set in P05) |
| FR-032 to FR-038 / US-027 to US-033 | Deferred | SCR-UX-015 to -017 (V2) | — | COMP-UX-020 | Not rendered in iteration 2 (V2 design kept for the future) |

Every committed, user-facing iteration 2 requirement is COVERED.

Acceptance criteria not cited by ID in this delta (AC-018 to AC-022, AC-030 to AC-032, AC-035 to AC-037, AC-057 to AC-062, AC-065 to AC-068, AC-085, AC-143, AC-144, AC-156) describe data results or server-side rules (only own data, freed slots, updated search results, not allowed after start). The screens above display those results with the existing V2 states and the error texts of §8; they need no extra UI. AC-085 concerns orders and is not rendered (ordering deferred).

---

## 12. Handoff to P05 and Implementation

- **Visual system:** V2 tokens and components remain the single reference; iteration 2 adds no token. New components COMP-UX-023 to -027 and the modified COMP-UX-006, -007, -008, -011, -022 must be implemented with existing tokens.
- **Shared pieces to build once:** voice input (COMP-UX-023, used by SCR-UX-004 and SCR-UX-018) and voice output (used by COMP-UX-026 and COMP-UX-027) — P03 DEP-025, DEP-026.
- **Owner navigation:** four tabs (*"Buscar"*, *"Asistente"*, *"Mis citas"*, *"Mis mascotas"*); ordering tabs stay hidden.
- **Assistant contract for P05:** the answer must provide, per answer, the sentence, up to 5 items (label and link target) and, for offerings with more than 5, the search text and species for *"Ver todos en Buscar"*. The answer templates of SCR-UX-018 fix the wording.
- **Voice language:** recognition and speech in Spanish (Colombia) (NFR-008).
- **Voice behaviors to respect:** heard line; same controls as typing; retry with species words (BR-053); hide controls when unsupported; stop reading on leaving the screen, on a new question and on mute; remember mute on the device.
- **Destructive actions:** always COMP-UX-022 with the texts of §5.
- **Assumptions to respect or revisit:** P04-ASM-030 to -037.
- P05 must preserve this UX contract when defining the architecture and the client–server integration. Any change to tokens or components goes through the change process of V2 §12.

---

## 13. Final Self-Review

- [x] Inputs considered: P02 v4.1, P03 v3.1 and their validations; V2 design system.
- [x] Limited to the single current sprint (`SPRINT-002`, see §1).
- [x] Every committed user-facing requirement of iteration 2 is covered (§11).
- [x] New screens, flows and components have traceable IDs that continue V2.
- [x] No new token; components and screens reference V2 tokens.
- [x] No unapproved functionality: the only extra (quick-question chips) is a PROPOSAL.
- [x] Undefined business behavior is labeled as assumption (P04-ASM-035, -036).
- [x] Enough detail for parallel work: P0 fully specified; P1/P2 reuse V2 patterns with explicit texts and states.
- [x] No API contracts, data schemas or code.
