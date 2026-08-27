{{- define "cliniga-ai.name" -}}cliniga-ai{{- end }}
{{- define "cliniga-ai.fullname" -}}{{- printf "%s-%s" .Release.Name (include "cliniga-ai.name" .) | trunc 63 | trimSuffix "-" -}}{{- end }}
{{- define "cliniga-ai.labels" -}}
app.kubernetes.io/name: {{ include "cliniga-ai.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
{{- end }}
{{- define "cliniga-ai.serviceAccountName" -}}{{- if .Values.serviceAccount.create -}}{{- default (include "cliniga-ai.fullname" .) .Values.serviceAccount.name -}}{{- else -}}{{- default "default" .Values.serviceAccount.name -}}{{- end -}}{{- end }}
