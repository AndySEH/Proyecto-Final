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

### Requisitos

- Node.js 18 o superior

### Ejecutar (Windows PowerShell)

```powershell
npm install
npm run dev
```

Abre http://localhost:3000 para ver el dashboard.

