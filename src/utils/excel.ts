import * as XLSX from 'xlsx'

export function exportToExcel(
  columns: { title: string; field: string }[],
  rows: Record<string, unknown>[],
  filename: string,
): void {
  const header = columns.map((c) => c.title)
  const data = rows.map((row) => columns.map((c) => row[c.field] ?? ''))
  const sheet = XLSX.utils.aoa_to_sheet([header, ...data])

  const colWidths = columns.map((c) => ({ wch: Math.max(c.title.length * 2, 10) }))
  sheet['!cols'] = colWidths

  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, 'Sheet1')
  XLSX.writeFile(book, `${filename}.xlsx`)
}
