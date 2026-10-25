export function applyPromptTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (out, [key, value]) => out.split(`{{${key}}}`).join(value),
    template
  )
}
