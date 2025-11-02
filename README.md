# Proyecto-Final, Justine Barreto y Andrés Evertsz

# Plataforma Informática para Monitoreo Retrospectivo de Pacientes en UCI

> Desarrollo de una plataforma **no-en-tiempo-real** para analizar datos históricos de pacientes en UCI a partir de **EHR** y repositorios públicos (p. ej., **MIMIC-IV**, **eICU-CRD**). El objetivo es soportar **vigilancia clínica**, **auditoría** y **toma de decisiones** mediante analítica retrospectiva, modelos validados y visualizaciones reutilizables.

---

## Resumen

**EN:**  
This project develops an informatics platform for ICU patient monitoring based on historical data from electronic medical records and public repositories (e.g., MIMIC-IV and eICU-CRD). Unlike streaming systems or real-time sensors, the solution is oriented toward retrospective analytics to support clinical surveillance, auditing, and decision-making. The project adopts guidelines for data governance, reproducibility, and assessment of model interpretability and fairness. Expected outcomes include: (i) retrospective exploration of clinical trajectories and vital signs variability; (ii) generation and comparison of validated models with historical data; (iii) reusable visualizations and reports for ICU teams and QA committees; and (iv) groundwork for external validation and transfer to other centers.

**ES:**  
Plataforma para **Monitoreo Retrospectivo en UCI** que trabaja con datasets históricos (sin sensores/streaming) para: (i) explorar trayectorias clínicas y variabilidad de signos vitales; (ii) generar y comparar modelos validados; (iii) ofrecer visualizaciones y reportes reutilizables; (iv) preparar validación externa y transferencia a otros centros. Enfatiza **gobernanza de datos**, **reproducibilidad**, **interpretabilidad** y **equidad** de modelos.

---

## Alcance

- Analítica **retrospectiva** con datos históricos (vitales, labs, procedimientos, diagnósticos).
- Dashboards/BI para equipos UCI y comités de calidad.

---

## Quickstart: Base web para visualizar CSV de signos vitales

Este repositorio incluye una base con **Next.js (React + TypeScript)**, **TailwindCSS** y **Recharts** para cargar un CSV y mostrar un dashboard y detalle por paciente.

### Estructura relevante

- `app/` – Páginas (App Router) y rutas API
- `app/api/patients` – Endpoints que parsean `data/sample_vitals.csv`
- `app/patient/[id]` – Página de detalle con gráficas
- `components/PatientCharts.tsx` – Gráficas con Recharts
- `data/sample_vitals.csv` – CSV de ejemplo (reemplázalo por el tuyo)

### Requisitos

- Node.js 18 o superior

### Ejecutar (Windows PowerShell)

```powershell
npm install
npm run dev
```

Abre http://localhost:3000 para ver el dashboard.

### Cargar tu dataset grande (100k+ filas)

El parser soporta tus encabezados con espacios y mayúsculas, por ejemplo: `Patient ID`, `Heart Rate`, `Respiratory Rate`, `Timestamp`, `Body Temperature`, `Oxygen Saturation`, `Systolic Blood Pressure`, `Diastolic Blood Pressure`. Las columnas adicionales (Age, Gender, BMI, etc.) se ignoran por ahora.

Notas de rendimiento:
- 100k filas suele ser manejable en desarrollo local. Si el archivo crece mucho más, podemos migrar a parsing por streaming o a una base de datos para consultas más rápidas.

### Notas y siguientes pasos

- Los endpoints están marcados como dinámicos y leen del CSV en cada petición.
- Para uso profesional, conviene migrar a base de datos, añadir autenticación/roles y registro de auditoría.

